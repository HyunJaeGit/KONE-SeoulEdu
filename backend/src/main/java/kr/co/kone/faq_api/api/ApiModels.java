package kr.co.kone.faq_api.api;

import java.util.List;

/** FAQ와 인증 API에서 사용하는 요청·응답 자료형. */
public final class ApiModels {

	private ApiModels() {
	}

	public record ApiError(String code, String message) {
	}

	public record LoginRequest(String username, String password) {
	}

	public record CurrentUserResponse(long id, String username, String role) {
	}

	public record MemberResponse(long id, String username, String role) {
	}

	public record CreateMemberRequest(String username, String password) {
	}

	public record UpdateMemberRequest(String password) {
	}

	public record CsrfResponse(String headerName, String token) {
	}

	public record FaqCategoryResponse(long id, String name) {
	}

	public record FaqResponse(long id, String category, String topic, String title,
			String content, List<String> keywords) {
	}

	public record FaqSummaryResponse(long id, String category, String topic, String title,
			String contentSnippet) {
	}

	public record FaqPageResponse(List<FaqSummaryResponse> items, int page, int size,
			long totalElements, int totalPages) {
	}

	public record FaqHighlightsResponse(List<FaqMostViewedResponse> mostViewedLast7Days,
			List<FaqSummaryResponse> recentlyViewed, List<FaqTopicViewResponse> topicsMostViewedToday) {
	}

	public record FaqMostViewedResponse(long id, String category, String topic, String title,
			String contentSnippet, long viewCount) {
	}

	public record FaqTopicViewResponse(String category, String topic, long viewCount) {
	}

	public record FaqStatisticsResponse(long categoryId, String category, int days,
			long totalFaqCount, long viewCount, long viewedFaqCount, long uniqueViewerCount,
			List<FaqDailyStatsResponse> dailyViews, List<FaqTopicStatsResponse> topicViews,
			List<FaqTopItemStatsResponse> topFaqs) {
	}

	public record FaqDailyStatsResponse(String date, long viewCount, long uniqueViewerCount) {
	}

	public record FaqTopicStatsResponse(String topic, long viewCount) {
	}

	public record FaqTopItemStatsResponse(long id, String topic, String title, long viewCount) {
	}
}
