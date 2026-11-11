package kr.co.kone.faq_api.repository;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowCallbackHandler;
import org.springframework.stereotype.Repository;
import org.springframework.util.StringUtils;

/** FAQ·카테고리·키워드·열람 집계의 SQL 조회와 갱신을 담당한다. */
@Repository
public class FaqRepository {

	private final JdbcTemplate jdbcTemplate;

	public FaqRepository(JdbcTemplate jdbcTemplate) {
		this.jdbcTemplate = jdbcTemplate;
	}

	public List<CategoryRow> findCategories() {
		return jdbcTemplate.query(
				"SELECT id, name FROM faq_categories ORDER BY id",
				(resultSet, rowNumber) -> new CategoryRow(
						resultSet.getLong("id"), resultSet.getString("name")));
	}

	/** 필터·LIKE 검색 결과를 가져오고, FAQ별 키워드를 한 번의 추가 조회로 묶는다. */
	public List<FaqRow> findFaqs(Long categoryId, String topic, String query, Long faqId) {
		StringBuilder sql = new StringBuilder("""
				SELECT f.id, c.name AS category, f.topic, f.title, f.content,
				       f.created_at, COALESCE(s.open_count, 0) AS open_count
				FROM faqs f
				JOIN faq_categories c ON c.id = f.category_id
				LEFT JOIN faq_usage_stats s ON s.faq_id = f.id
				WHERE 1 = 1
				""");
		List<Object> parameters = new ArrayList<>();

		if (categoryId != null) {
			sql.append(" AND f.category_id = ?");
			parameters.add(categoryId);
		}
		if (StringUtils.hasText(topic)) {
			sql.append(" AND f.topic = ?");
			parameters.add(topic.trim());
		}
		if (faqId != null) {
			sql.append(" AND f.id = ?");
			parameters.add(faqId);
		}
		if (StringUtils.hasText(query)) {
			for (String term : query.trim().toLowerCase().split("\\s+")) {
				appendSearchTerm(sql, parameters, term);
			}
		}

		List<RawFaqRow> faqRows = jdbcTemplate.query(sql.toString(),
				(resultSet, rowNumber) -> {
					Timestamp createdAt = resultSet.getTimestamp("created_at");
					return new RawFaqRow(
							resultSet.getLong("id"),
							resultSet.getString("category"),
							resultSet.getString("topic"),
							resultSet.getString("title"),
							resultSet.getString("content"),
							createdAt == null ? null : createdAt.toLocalDateTime(),
							resultSet.getLong("open_count"));
				}, parameters.toArray());

		if (faqRows.isEmpty()) {
			return List.of();
		}

		String placeholders = faqRows.stream().map(row -> "?").collect(Collectors.joining(", "));
		Object[] faqIds = faqRows.stream().map(RawFaqRow::id).toArray();
		Map<Long, List<String>> keywordsByFaq = new HashMap<>();
		String keywordSql = "SELECT faq_id, keyword FROM faq_keywords WHERE faq_id IN ("
				+ placeholders + ") ORDER BY faq_id, keyword";
		jdbcTemplate.query(keywordSql, (RowCallbackHandler) resultSet -> {
			keywordsByFaq.computeIfAbsent(resultSet.getLong("faq_id"), unused -> new ArrayList<>())
					.add(resultSet.getString("keyword"));
		}, faqIds);

		return faqRows.stream()
				.map(row -> new FaqRow(row.id(), row.category(), row.topic(), row.title(), row.content(),
						row.createdAt(), row.openCount(), List.copyOf(keywordsByFaq.getOrDefault(row.id(), List.of()))))
				.toList();
	}

	public boolean incrementOpenCount(long faqId) {
		return jdbcTemplate.update(
				"UPDATE faq_usage_stats SET open_count = open_count + 1 WHERE faq_id = ?", faqId) == 1;
	}

	private void appendSearchTerm(StringBuilder sql, List<Object> parameters, String term) {
		String likePattern = "%" + term + "%";
		String compactPattern = "%" + term.replaceAll("\\s+", "") + "%";
		sql.append(" AND (CAST(f.id AS CHAR) LIKE ? OR LOWER(f.title) LIKE ? OR LOWER(REPLACE(f.title, ' ', '')) LIKE ?")
				.append(" OR LOWER(f.content) LIKE ? OR LOWER(REPLACE(f.content, ' ', '')) LIKE ?")
				.append(" OR EXISTS (SELECT 1 FROM faq_keywords k WHERE k.faq_id = f.id")
				.append(" AND (LOWER(k.keyword) LIKE ? OR LOWER(REPLACE(k.keyword, ' ', '')) LIKE ?)))");
		parameters.add(likePattern);
		parameters.add(likePattern);
		parameters.add(compactPattern);
		parameters.add(likePattern);
		parameters.add(compactPattern);
		parameters.add(likePattern);
		parameters.add(compactPattern);
	}

	public record CategoryRow(long id, String name) {
	}

	public record FaqRow(long id, String category, String topic, String title, String content,
			LocalDateTime createdAt, long openCount, List<String> keywords) {
	}

	private record RawFaqRow(long id, String category, String topic, String title, String content,
			LocalDateTime createdAt, long openCount) {
	}
}
