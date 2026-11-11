package kr.co.kone.faq_api.service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import kr.co.kone.faq_api.api.ApiException;
import kr.co.kone.faq_api.repository.FaqRepository;
import kr.co.kone.faq_api.repository.FaqRepository.CategoryRow;
import kr.co.kone.faq_api.repository.FaqRepository.FaqRow;

import static kr.co.kone.faq_api.api.ApiModels.FaqCategoryResponse;
import static kr.co.kone.faq_api.api.ApiModels.FaqPageResponse;
import static kr.co.kone.faq_api.api.ApiModels.FaqResponse;
import static kr.co.kone.faq_api.api.ApiModels.FaqSummaryResponse;

/** FAQ 검색 순위, 필터·페이지 처리와 공개 응답 변환을 담당한다. */
@Service
public class FaqService {

	private static final int MAX_PAGE_SIZE = 100;
	private static final int CONTENT_SNIPPET_LENGTH = 160;

	private final FaqRepository faqRepository;

	public FaqService(FaqRepository faqRepository) {
		this.faqRepository = faqRepository;
	}

	public List<FaqCategoryResponse> getCategories() {
		return faqRepository.findCategories().stream()
				.map(this::toCategoryResponse)
				.toList();
	}

	/** 검색·필터 결과를 정렬하고 요청한 페이지 크기로 잘라 반환한다. */
	public FaqPageResponse search(String query, Long categoryId, String topic,
			int page, int size, String sort) {
		validateSearchRequest(query, categoryId, topic, page, size, sort);
		String normalizedQuery = StringUtils.hasText(query) ? query.trim() : "";
		List<FaqRow> rows = faqRepository.findFaqs(categoryId, topic, normalizedQuery, null);

		if (!normalizedQuery.isEmpty()) {
			List<ScoredFaq> ranked = rows.stream()
					.map(row -> new ScoredFaq(row, score(row, normalizedQuery)))
					.sorted(this::compareSearchResults)
					.toList();
			long total = ranked.size();
			int totalPages = total == 0 ? 0 : (int) ((total + size - 1) / size);
			int start = pageStart(page, size, total);
			List<FaqSummaryResponse> items = ranked.stream()
					.skip(start)
					.limit(size)
					.map(result -> toSummaryResponse(result.faq()))
					.toList();
			return new FaqPageResponse(items, page, size, total, totalPages);
		}

		Comparator<FaqRow> comparator = "recent".equals(sort)
				? Comparator.comparing(FaqRow::createdAt).reversed().thenComparing(Comparator.comparingLong(FaqRow::id).reversed())
				: Comparator.comparingLong(FaqRow::openCount).reversed()
						.thenComparing(FaqRow::createdAt, Comparator.reverseOrder())
						.thenComparing(Comparator.comparingLong(FaqRow::id).reversed());
		List<FaqRow> sorted = rows.stream().sorted(comparator).toList();
		long total = sorted.size();
		int totalPages = total == 0 ? 0 : (int) ((total + size - 1) / size);
		int start = pageStart(page, size, total);
		List<FaqSummaryResponse> items = sorted.stream()
				.skip(start)
				.limit(size)
				.map(this::toSummaryResponse)
				.toList();
		return new FaqPageResponse(items, page, size, total, totalPages);
	}

	public FaqResponse getById(long id) {
		if (id < 1) {
			throw notFound();
		}
		FaqRow faq = faqRepository.findFaqs(null, null, null, id).stream()
				.findFirst()
				.orElseThrow(this::notFound);
		return new FaqResponse(faq.id(), faq.category(), faq.topic(), faq.title(),
				faq.content(), faq.keywords());
	}

	public void recordOpen(long id) {
		if (id < 1 || !faqRepository.incrementOpenCount(id)) {
			throw notFound();
		}
	}

	private void validateSearchRequest(String query, Long categoryId, String topic,
			int page, int size, String sort) {
		if (query != null && query.length() > 200) {
			throw badRequest("검색어는 200자 이내로 입력해야 합니다.");
		}
		if (categoryId != null && categoryId < 1) {
			throw badRequest("categoryId는 1 이상의 정수여야 합니다.");
		}
		if (topic != null && topic.length() > 100) {
			throw badRequest("topic은 100자 이내로 입력해야 합니다.");
		}
		if (page < 1) {
			throw badRequest("page는 1 이상의 정수여야 합니다.");
		}
		if (size < 1 || size > MAX_PAGE_SIZE) {
			throw badRequest("size는 1부터 100 사이의 정수여야 합니다.");
		}
		if (!"popular".equals(sort) && !"recent".equals(sort)) {
			throw badRequest("sort는 popular 또는 recent여야 합니다.");
		}
	}

	private int compareSearchResults(ScoredFaq left, ScoredFaq right) {
		int rank = Integer.compare(left.score().rank(), right.score().rank());
		if (rank != 0) {
			return rank;
		}
		int titleHits = Integer.compare(right.score().titleHits(), left.score().titleHits());
		if (titleHits != 0) {
			return titleHits;
		}
		int createdAt = right.faq().createdAt().compareTo(left.faq().createdAt());
		return createdAt != 0 ? createdAt : Long.compare(right.faq().id(), left.faq().id());
	}

	private SearchScore score(FaqRow faq, String query) {
		String normalizedQuery = normalize(query);
		String compactQuery = compact(normalizedQuery);
		String title = normalize(faq.title());
		String compactTitle = compact(title);
		List<String> terms = terms(normalizedQuery);
		List<String> searchFields = new ArrayList<>();
		searchFields.add(normalize(faq.title()));
		searchFields.add(normalize(faq.content()));
		faq.keywords().stream().map(this::normalize).forEach(searchFields::add);

		int rank;
		if (Long.toString(faq.id()).equals(normalizedQuery)) {
			rank = 0;
		} else if (title.equals(normalizedQuery) || compactTitle.equals(compactQuery)) {
			rank = 1;
		} else if (title.contains(normalizedQuery) || compactTitle.contains(compactQuery)) {
			rank = 2;
		} else if (terms.stream().allMatch(term -> containsInFields(term, faq.title(), faq.keywords()))) {
			rank = 3;
		} else {
			rank = 4;
		}

		int titleHits = (int) terms.stream()
				.filter(term -> title.contains(term) || compactTitle.contains(compact(term)))
				.count();
		return new SearchScore(rank, titleHits);
	}

	private boolean containsInFields(String term, String title, List<String> keywords) {
		String compactTerm = compact(term);
		return normalize(title).contains(term) || compact(normalize(title)).contains(compactTerm)
				|| keywords.stream().anyMatch(keyword -> normalize(keyword).contains(term)
						|| compact(normalize(keyword)).contains(compactTerm));
	}

	private List<String> terms(String query) {
		return Arrays.stream(query.split("\\s+")).filter(StringUtils::hasText).toList();
	}

	private String normalize(String value) {
		return value == null ? "" : value.trim().toLowerCase(Locale.ROOT).replaceAll("\\s+", " ");
	}

	private String compact(String value) {
		return value.replaceAll("\\s+", "");
	}

	private int pageStart(int page, int size, long total) {
		long requestedStart = ((long) page - 1) * size;
		return requestedStart >= total ? (int) total : (int) requestedStart;
	}

	private FaqCategoryResponse toCategoryResponse(CategoryRow category) {
		return new FaqCategoryResponse(category.id(), category.name());
	}

	private FaqSummaryResponse toSummaryResponse(FaqRow faq) {
		String snippet = faq.content().substring(0, Math.min(faq.content().length(), CONTENT_SNIPPET_LENGTH));
		return new FaqSummaryResponse(faq.id(), faq.category(), faq.topic(), faq.title(), snippet);
	}

	private ApiException badRequest(String message) {
		return new ApiException(HttpStatus.BAD_REQUEST, "INVALID_REQUEST", message);
	}

	private ApiException notFound() {
		return new ApiException(HttpStatus.NOT_FOUND, "FAQ_NOT_FOUND", "FAQ를 찾을 수 없습니다.");
	}

	private record SearchScore(int rank, int titleHits) {
	}

	private record ScoredFaq(FaqRow faq, SearchScore score) {
	}
}
