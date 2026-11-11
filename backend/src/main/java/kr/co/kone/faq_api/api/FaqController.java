package kr.co.kone.faq_api.api;

import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import kr.co.kone.faq_api.service.FaqService;

import static kr.co.kone.faq_api.api.ApiModels.FaqCategoryResponse;
import static kr.co.kone.faq_api.api.ApiModels.FaqHighlightsResponse;
import static kr.co.kone.faq_api.api.ApiModels.FaqPageResponse;
import static kr.co.kone.faq_api.api.ApiModels.FaqResponse;
import static kr.co.kone.faq_api.api.ApiModels.FaqStatisticsResponse;

/** 인증된 상담원·관리자가 사용하는 FAQ 조회와 열기 집계 API. */
@RestController
@RequestMapping("/api")
public class FaqController {

	private final FaqService faqService;

	public FaqController(FaqService faqService) {
		this.faqService = faqService;
	}

	@GetMapping("/faq-categories")
	public List<FaqCategoryResponse> categories() {
		return faqService.getCategories();
	}

	@GetMapping("/faqs")
	public FaqPageResponse search(@RequestParam(required = false) String q,
			@RequestParam(required = false) Long categoryId,
			@RequestParam(required = false) String topic,
			@RequestParam(defaultValue = "1") int page,
			@RequestParam(defaultValue = "20") int size,
			@RequestParam(defaultValue = "popular") String sort) {
		return faqService.search(q, categoryId, topic, page, size, sort);
	}

	@GetMapping("/faqs/highlights")
	public FaqHighlightsResponse highlights(Authentication authentication,
			@RequestParam(defaultValue = "5") int limit) {
		return faqService.getHighlights(authentication.getName(), limit);
	}

	@GetMapping("/faq-statistics")
	public FaqStatisticsResponse statistics(@RequestParam long categoryId,
			@RequestParam(defaultValue = "30") int days) {
		return faqService.getStatistics(categoryId, days);
	}

	@GetMapping("/faqs/{id}")
	public FaqResponse getById(@PathVariable long id) {
		return faqService.getById(id);
	}

	@PostMapping("/faqs/{id}/open")
	public ResponseEntity<Void> recordOpen(@PathVariable long id, Authentication authentication) {
		faqService.recordOpen(id, authentication.getName());
		return ResponseEntity.noContent().build();
	}
}
