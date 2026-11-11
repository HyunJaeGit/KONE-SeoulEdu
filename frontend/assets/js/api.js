/* Spring Boot FAQ API 호출, 서버 세션 쿠키와 CSRF 토큰을 공통 처리합니다. */
const API_BASE_URL = `${window.location.protocol}//${window.location.hostname}:8080`;
let csrfToken;
let csrfHeaderName = "X-CSRF-TOKEN";

export class ApiError extends Error {
  constructor(status, code, message) {
    super(message || `API 요청 오류 (${status})`);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

/** Spring API를 호출하고 JSON 오류 응답을 화면에서 처리할 수 있게 변환합니다. */
export async function apiRequest(path, { method = "GET", body, csrf = false } = {}) {
  const headers = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (csrf) headers[csrfHeaderName] = await getCsrfToken();

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    credentials: "include",
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (response.status === 204) return null;
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new ApiError(response.status, payload?.code, payload?.message);
  }
  return payload;
}

/** 상태 변경 요청에 사용할 세션 CSRF 토큰을 가져오거나 메모리에서 재사용합니다. */
export async function getCsrfToken(forceRefresh = false) {
  if (csrfToken && !forceRefresh) return csrfToken;
  const result = await apiRequest("/api/auth/csrf");
  csrfToken = result.token;
  csrfHeaderName = result.headerName;
  return csrfToken;
}

/** 로그인 API를 CSRF 헤더와 함께 호출합니다. */
export async function signIn(username, password) {
  const token = await getCsrfToken(true);
  const headers = { Accept: "application/json", "Content-Type": "application/json", [csrfHeaderName]: token };
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    credentials: "include",
    headers,
    body: JSON.stringify({ username, password }),
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) throw new ApiError(response.status, payload?.code, payload?.message);
  csrfToken = undefined;
  return payload;
}

export function getCurrentUser() {
  return apiRequest("/api/auth/me");
}

export async function signOut() {
  await apiRequest("/api/auth/logout", { method: "POST", csrf: true });
  csrfToken = undefined;
}

export function getFaqCategories() {
  return apiRequest("/api/faq-categories");
}

export function getFaqPage({ q, categoryId, topic, page = 1, size = 20, sort = "popular" } = {}) {
  const params = new URLSearchParams({ page: String(page), size: String(size), sort });
  if (q) params.set("q", q);
  if (categoryId) params.set("categoryId", String(categoryId));
  if (topic) params.set("topic", topic);
  return apiRequest(`/api/faqs?${params}`);
}

export function getFaqHighlights(limit = 5) {
  const params = new URLSearchParams({ limit: String(limit) });
  return apiRequest(`/api/faqs/highlights?${params}`);
}

export function getFaqStatistics(categoryId, days = 30) {
  const params = new URLSearchParams({ categoryId: String(categoryId), days: String(days) });
  return apiRequest(`/api/faq-statistics?${params}`);
}

export function getFaqDetail(id) {
  return apiRequest(`/api/faqs/${encodeURIComponent(id)}`);
}

export function recordFaqOpen(id) {
  return apiRequest(`/api/faqs/${encodeURIComponent(id)}/open`, { method: "POST", csrf: true });
}

export function getMembers(q = "") {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  return apiRequest(`/api/admin/members${params.size ? `?${params}` : ""}`);
}

export function createMember(username, password) {
  return apiRequest("/api/admin/members", {
    method: "POST",
    body: { username, password },
    csrf: true,
  });
}

export function updateMemberPassword(id, password) {
  return apiRequest(`/api/admin/members/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: { password },
    csrf: true,
  });
}

export function deleteMember(id) {
  return apiRequest(`/api/admin/members/${encodeURIComponent(id)}`, { method: "DELETE", csrf: true });
}

/** 인증이 필요한 화면에서 로그인 페이지로 돌아갈 URL을 보존합니다. */
export function redirectToLogin() {
  const returnPath = `${window.location.pathname}${window.location.search}`;
  window.location.href = `login.html?${new URLSearchParams({ return: returnPath })}`;
}
