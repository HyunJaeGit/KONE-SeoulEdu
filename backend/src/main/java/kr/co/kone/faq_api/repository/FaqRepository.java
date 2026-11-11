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

	/** 최근 7일의 전체 사용자 열람 기록을 FAQ별로 집계한다. */
	public List<PopularFaqRow> findMostViewedLast7Days(int limit) {
		return jdbcTemplate.query("""
				SELECT f.id, c.name AS category, f.topic, f.title, f.content,
				       v.view_count
				FROM (
				    SELECT faq_id, COUNT(*) AS view_count, MAX(viewed_at) AS last_viewed_at
				    FROM faq_view_history
				    WHERE viewed_at >= CURRENT_TIMESTAMP - INTERVAL 7 DAY
				    GROUP BY faq_id
				) v
				JOIN faqs f ON f.id = v.faq_id
				JOIN faq_categories c ON c.id = f.category_id
				ORDER BY v.view_count DESC, v.last_viewed_at DESC, f.id DESC
				LIMIT ?
				""",
				(resultSet, rowNumber) -> new PopularFaqRow(
						resultSet.getLong("id"),
						resultSet.getString("category"),
						resultSet.getString("topic"),
						resultSet.getString("title"),
						resultSet.getString("content"),
						resultSet.getLong("view_count")),
				limit);
	}

	/** 오늘 자정부터 현재까지의 전체 사용자 열람 기록을 카테고리·주제별로 집계한다. */
	public List<PopularTopicRow> findMostViewedTopicsToday(int limit) {
		return jdbcTemplate.query("""
				SELECT c.name AS category, f.topic, COUNT(*) AS view_count,
				       MAX(h.viewed_at) AS last_viewed_at
				FROM faq_view_history h
				JOIN faqs f ON f.id = h.faq_id
				JOIN faq_categories c ON c.id = f.category_id
				WHERE h.viewed_at >= CURRENT_DATE
				  AND h.viewed_at < CURRENT_DATE + INTERVAL 1 DAY
				GROUP BY c.name, f.topic
				ORDER BY view_count DESC, last_viewed_at DESC, c.name, f.topic
				LIMIT ?
				""",
				(resultSet, rowNumber) -> new PopularTopicRow(
						resultSet.getString("category"), resultSet.getString("topic"),
						resultSet.getLong("view_count")),
				limit);
	}

	/** 선택한 FAQ 대분류의 기간별 요약 지표를 집계한다. */
	public StatisticsSummaryRow findStatisticsSummary(long categoryId, int days) {
		return jdbcTemplate.queryForObject("""
				SELECT COUNT(DISTINCT f.id) AS total_faq_count,
				       COUNT(h.faq_id) AS view_count,
				       COUNT(DISTINCT h.faq_id) AS viewed_faq_count,
				       COUNT(DISTINCT h.user_id) AS unique_viewer_count
				FROM faqs f
				LEFT JOIN faq_view_history h
				  ON h.faq_id = f.id
				 AND h.viewed_at >= CURRENT_DATE - INTERVAL ? DAY
				 AND h.viewed_at < CURRENT_DATE + INTERVAL 1 DAY
				WHERE f.category_id = ?
				""",
				(resultSet, rowNumber) -> new StatisticsSummaryRow(
						resultSet.getLong("total_faq_count"),
						resultSet.getLong("view_count"),
						resultSet.getLong("viewed_faq_count"),
						resultSet.getLong("unique_viewer_count")),
				days - 1, categoryId);
	}

	/** 선택한 기간의 날짜별 열람과 열람 계정을 집계하고 빈 날짜도 포함한다. */
	public List<DailyStatisticsRow> findDailyStatistics(long categoryId, int days) {
		return jdbcTemplate.query("""
				WITH RECURSIVE calendar (view_date) AS (
				    SELECT CURRENT_DATE - INTERVAL ? DAY
				    UNION ALL
				    SELECT view_date + INTERVAL 1 DAY FROM calendar WHERE view_date < CURRENT_DATE
				), daily_views AS (
				    SELECT DATE(h.viewed_at) AS view_date, COUNT(*) AS view_count,
				           COUNT(DISTINCT h.user_id) AS unique_viewer_count
				    FROM faq_view_history h
				    JOIN faqs f ON f.id = h.faq_id
				    WHERE f.category_id = ?
				      AND h.viewed_at >= CURRENT_DATE - INTERVAL ? DAY
				      AND h.viewed_at < CURRENT_DATE + INTERVAL 1 DAY
				    GROUP BY DATE(h.viewed_at)
				)
				SELECT calendar.view_date,
				       COALESCE(daily_views.view_count, 0) AS view_count,
				       COALESCE(daily_views.unique_viewer_count, 0) AS unique_viewer_count
				FROM calendar
				LEFT JOIN daily_views ON daily_views.view_date = calendar.view_date
				ORDER BY calendar.view_date
				""",
				(resultSet, rowNumber) -> new DailyStatisticsRow(
						resultSet.getDate("view_date").toLocalDate(),
						resultSet.getLong("view_count"),
						resultSet.getLong("unique_viewer_count")),
				days - 1, categoryId, days - 1);
	}

	/** 선택한 기간의 대분류 내 주제별 열람 수를 집계한다. */
	public List<TopicStatisticsRow> findTopicStatistics(long categoryId, int days) {
		return jdbcTemplate.query("""
				SELECT f.topic, COUNT(*) AS view_count
				FROM faq_view_history h
				JOIN faqs f ON f.id = h.faq_id
				WHERE f.category_id = ?
				  AND h.viewed_at >= CURRENT_DATE - INTERVAL ? DAY
				  AND h.viewed_at < CURRENT_DATE + INTERVAL 1 DAY
				GROUP BY f.topic
				ORDER BY view_count DESC, f.topic
				""",
				(resultSet, rowNumber) -> new TopicStatisticsRow(
						resultSet.getString("topic"), resultSet.getLong("view_count")),
				categoryId, days - 1);
	}

	/** 선택한 기간의 카테고리 내 FAQ별 열람 상위 목록을 가져온다. */
	public List<TopFaqStatisticsRow> findTopFaqStatistics(long categoryId, int days, int limit) {
		return jdbcTemplate.query("""
				SELECT f.id, f.topic, f.title, COUNT(*) AS view_count
				FROM faq_view_history h
				JOIN faqs f ON f.id = h.faq_id
				WHERE f.category_id = ?
				  AND h.viewed_at >= CURRENT_DATE - INTERVAL ? DAY
				  AND h.viewed_at < CURRENT_DATE + INTERVAL 1 DAY
				GROUP BY f.id, f.topic, f.title
				ORDER BY view_count DESC, MAX(h.viewed_at) DESC, f.id DESC
				LIMIT ?
				""",
				(resultSet, rowNumber) -> new TopFaqStatisticsRow(
						resultSet.getLong("id"), resultSet.getString("topic"),
						resultSet.getString("title"), resultSet.getLong("view_count")),
				categoryId, days - 1, limit);
	}

	/** 현재 사용자가 최근에 연 FAQ를 FAQ별 마지막 열람 시각 순서로 가져온다. */
	public List<RecentFaqRow> findRecentlyViewed(String username, int limit) {
		return jdbcTemplate.query("""
				SELECT f.id, c.name AS category, f.topic, f.title, f.content,
				       v.last_viewed_at
				FROM (
				    SELECT h.faq_id, MAX(h.viewed_at) AS last_viewed_at
				    FROM faq_view_history h
				    JOIN users u ON u.id = h.user_id
				    WHERE u.username = ?
				    GROUP BY h.faq_id
				) v
				JOIN faqs f ON f.id = v.faq_id
				JOIN faq_categories c ON c.id = f.category_id
				ORDER BY v.last_viewed_at DESC, f.id DESC
				LIMIT ?
				""",
				(resultSet, rowNumber) -> {
					Timestamp lastViewedAt = resultSet.getTimestamp("last_viewed_at");
					return new RecentFaqRow(
							resultSet.getLong("id"),
							resultSet.getString("category"),
							resultSet.getString("topic"),
							resultSet.getString("title"),
							resultSet.getString("content"),
							lastViewedAt == null ? null : lastViewedAt.toLocalDateTime());
				}, username, limit);
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

	public boolean recordOpen(long faqId, String username) {
		int updatedRows = jdbcTemplate.update(
				"UPDATE faq_usage_stats SET open_count = open_count + 1 WHERE faq_id = ?", faqId);
		if (updatedRows != 1) {
			return false;
		}

		int historyRows = jdbcTemplate.update("""
				INSERT INTO faq_view_history (faq_id, user_id)
				SELECT ?, id FROM users WHERE username = ?
				""", faqId, username);
		if (historyRows != 1) {
			throw new IllegalStateException("Authenticated FAQ viewer was not found in users.");
		}
		return true;
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

	public record PopularFaqRow(long id, String category, String topic, String title,
			String content, long viewCount) {
	}

	public record PopularTopicRow(String category, String topic, long viewCount) {
	}

	public record StatisticsSummaryRow(long totalFaqCount, long viewCount,
			long viewedFaqCount, long uniqueViewerCount) {
	}

	public record DailyStatisticsRow(java.time.LocalDate date, long viewCount, long uniqueViewerCount) {
	}

	public record TopicStatisticsRow(String topic, long viewCount) {
	}

	public record TopFaqStatisticsRow(long id, String topic, String title, long viewCount) {
	}

	public record RecentFaqRow(long id, String category, String topic, String title,
			String content, LocalDateTime lastViewedAt) {
	}

	private record RawFaqRow(long id, String category, String topic, String title, String content,
			LocalDateTime createdAt, long openCount) {
	}
}
