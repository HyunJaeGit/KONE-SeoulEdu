/* FAQ 검색 화면을 로그인 세션과 Spring Boot 검색 API에 연결합니다. */
import {
  ApiError,
  getCurrentUser,
  getFaqCategories,
  getFaqDetail,
  getFaqHighlights,
  getFaqPage,
  recordFaqOpen,
  redirectToLogin,
} from "./api.js";
import { renderResults, PAGE_SIZE } from "./render.js";

const state = {
  faqs: [],
  details: new Map(),
  categories: [],
  query: "",
  category: "",
  topic: "",
  page: 1,
  totalElements: 0,
  totalPages: 0,
  expandedIds: new Set(),
  username: "",
  loading: false,
  loadError: false,
};

let searchTimer;
let composing = false;
let faqRequestNumber = 0;
let topicRequestNumber = 0;
let dashboardRequestInFlight = false;
let lastDashboardRefreshAt = 0;
const DASHBOARD_REFRESH_INTERVAL = 30_000;

/** 현재 URL을 복원하고 로그인한 사용자의 검색 화면을 시작합니다. */
async function initialize() {
  const params = new URLSearchParams(window.location.search);
  state.query = params.get("q") ?? "";
  state.category = params.get("category") ?? "";
  state.topic = params.get("topic") ?? "";
  state.page = Math.max(1, Number(params.get("page")) || 1);
  document.querySelector("#search-input").value = state.query;

  try {
    const currentUser = await getCurrentUser();
    state.username = currentUser.username;
    renderRecentSearches();
    state.categories = await getFaqCategories();
    populateCategoryFilter();
    document.querySelector("#reset-filters").addEventListener("click", resetFilters);
    document.querySelector("#clear-recent-searches").addEventListener("click", clearRecentSearches);
    document.querySelector("#category-filter").addEventListener("change", async (event) => {
      state.category = event.target.value;
      state.topic = "";
      state.page = 1;
      await updateTopics();
      updateUrl({ faqId: "" });
      await loadView();
    });
    document.querySelector("#topic-filter").addEventListener("change", async (event) => {
      state.topic = event.target.value;
      state.page = 1;
      updateUrl({ faqId: "" });
      await loadView();
    });
    const input = document.querySelector("#search-input");
    input.addEventListener("compositionstart", () => { composing = true; });
    input.addEventListener("compositionend", () => { composing = false; scheduleSearch(input.value); });
    input.addEventListener("input", () => { if (!composing) scheduleSearch(input.value); });
    window.addEventListener("popstate", restoreUrlState);
    await updateTopics();
    await loadView();
    window.setInterval(refreshHomeDashboard, DASHBOARD_REFRESH_INTERVAL);
    document.addEventListener("visibilitychange", refreshHomeDashboard);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      redirectToLogin();
      return;
    }
    state.loadError = true;
    render();
  }
}

/** DB의 대분류를 검색 선택 상자에 표시합니다. */
function populateCategoryFilter() {
  const select = document.querySelector("#category-filter");
  select.replaceChildren(new Option("모든 구분", ""));
  state.categories.forEach((category) => select.add(new Option(category.name, category.name)));
  if (state.categories.some((category) => category.name === state.category)) select.value = state.category;
  else state.category = "";
}

/** 선택 분류의 모든 페이지에서 세부 주제를 모아 필터를 구성합니다. */
async function updateTopics() {
  const requestNumber = ++topicRequestNumber;
  const select = document.querySelector("#topic-filter");
  const category = state.categories.find((item) => item.name === state.category);
  const topics = new Set();
  let page = 1;
  let totalPages = 1;
  do {
    const result = await getFaqPage({ categoryId: category?.id, page, size: 100, sort: "recent" });
    result.items.forEach((faq) => { if (faq.topic) topics.add(faq.topic); });
    totalPages = result.totalPages;
    page += 1;
  } while (page <= totalPages);

  if (requestNumber !== topicRequestNumber) return;
  select.replaceChildren(new Option("모든 주제", ""));
  [...topics].sort((left, right) => left.localeCompare(right, "ko")).forEach((topic) => {
    select.add(new Option(topic, topic));
  });
  select.disabled = topics.size === 0;
  if (topics.has(state.topic)) select.value = state.topic;
  else state.topic = "";
}

/** 현재 검색 조건을 API에 보내 서버 검색 결과와 페이지 정보를 저장합니다. */
async function loadFaqs() {
  document.querySelector("#home-highlights").hidden = true;
  document.querySelector("#results-section").hidden = false;
  const requestNumber = ++faqRequestNumber;
  state.loading = true;
  state.loadError = false;
  render();
  try {
    const category = state.categories.find((item) => item.name === state.category);
    const result = await getFaqPage({
      q: state.query,
      categoryId: category?.id,
      topic: state.topic,
      page: state.page,
      size: PAGE_SIZE,
      sort: "popular",
    });
    if (requestNumber !== faqRequestNumber) return;
    if (result.totalPages > 0 && state.page > result.totalPages) {
      state.page = result.totalPages;
      updateUrl({ replace: true });
      return await loadFaqs();
    }

    state.faqs = result.items;
    state.totalElements = result.totalElements;
    state.totalPages = result.totalPages;
    await includeDirectFaq(requestNumber);
  } catch (error) {
    if (requestNumber !== faqRequestNumber) return;
    if (error instanceof ApiError && error.status === 401) {
      redirectToLogin();
      return;
    }
    state.loadError = true;
  } finally {
    if (requestNumber === faqRequestNumber) {
      state.loading = false;
      render();
    }
  }
}

/** 검색 조건이 없으면 첫 화면 조회 목록을, 조건이 있으면 FAQ 검색 결과를 표시합니다. */
async function loadView() {
  const hasSearch = Boolean(state.query || state.category || state.topic || state.page > 1
    || new URLSearchParams(window.location.search).get("faq"));
  if (hasSearch) return loadFaqs();

  const highlights = document.querySelector("#home-highlights");
  const results = document.querySelector("#results-section");
  highlights.hidden = false;
  results.hidden = true;
  renderHighlightState("#weekly-views-list", "최근 7일 조회수 순 데이터를 불러오는 중입니다.", true);
  renderHighlightState("#recent-views-list", "최근 찾은 항목을 불러오는 중입니다.", true);
  renderTopicState("최근 조회 주제를 집계하는 중입니다.", true);
  await loadHomeDashboard(false);
}

/** 홈이 보이고 브라우저 탭이 활성화된 동안 조회 현황을 주기적으로 갱신합니다. */
async function refreshHomeDashboard() {
  const hasSearch = Boolean(state.query || state.category || state.topic || state.page > 1
    || new URLSearchParams(window.location.search).get("faq"));
  if (document.hidden || hasSearch || Date.now() - lastDashboardRefreshAt < 15_000) return;
  await loadHomeDashboard(true);
}

/** 기존 대시보드 데이터를 유지하며 순위·조회수·주제 집계를 새 값으로 갱신합니다. */
async function loadHomeDashboard(animate) {
  if (dashboardRequestInFlight) return;
  dashboardRequestInFlight = true;
  lastDashboardRefreshAt = Date.now();
  try {
    const data = await getFaqHighlights(5);
    renderHighlightItems("#weekly-views-list", data.mostViewedLast7Days, true, animate);
    renderHighlightItems("#recent-views-list", data.recentlyViewed, false, animate);
    renderTopicItems(data.topicsMostViewedToday ?? [], animate);
    updateDashboardStatus();
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      redirectToLogin();
      return;
    }
    const hasExistingData = document.querySelector("#weekly-views-list .highlight-link")
      || document.querySelector("#recent-views-list .highlight-link")
      || document.querySelector("#topic-analytics-list .topic-analytics-link");
    if (!hasExistingData) {
      renderHighlightState("#weekly-views-list", "목록을 불러오지 못했습니다. 새로고침해 주세요.");
      renderHighlightState("#recent-views-list", "목록을 불러오지 못했습니다. 새로고침해 주세요.");
      renderTopicState("주제별 조회 현황을 불러오지 못했습니다.");
    }
    document.querySelector("#highlights-status").textContent = hasExistingData
      ? "갱신 연결이 잠시 끊겼습니다 · 이전 현황 표시 중"
      : "조회 현황을 불러오지 못했습니다";
  } finally {
    dashboardRequestInFlight = false;
  }
}

/** 마지막 갱신 시각과 다음 자동 갱신 주기를 표시합니다. */
function updateDashboardStatus() {
  const time = new Intl.DateTimeFormat("ko-KR", { hour: "2-digit", minute: "2-digit" }).format(new Date());
  document.querySelector("#highlights-status").textContent = `30초마다 갱신 · ${time} 기준`;
}

/** 조회 목록의 비어 있음·로딩 상태를 텍스트로 표시합니다. */
function renderHighlightState(selector, message, busy = false) {
  const list = document.querySelector(selector);
  list.setAttribute("aria-busy", String(busy));
  const item = document.createElement("li");
  item.className = "highlight-empty";
  item.textContent = message;
  list.replaceChildren(item);
}

/** API에서 받은 조회 목록을 텍스트 노드와 FAQ 직접 열기 링크로 안전하게 그립니다. */
function renderHighlightItems(selector, items, showCount, animate) {
  const list = document.querySelector(selector);
  list.setAttribute("aria-busy", "false");
  if (!items?.length) {
    renderHighlightState(selector, showCount
      ? "최근 7일 열람 기록이 쌓이면 표시됩니다."
      : "최근 열어본 FAQ가 없습니다.");
    return;
  }

  const previousRows = new Map([...list.querySelectorAll(".highlight-link")]
    .map((link) => [link.dataset.faqId, {
      item: link.parentElement,
      top: link.parentElement.getBoundingClientRect().top,
      count: Number(link.querySelector(".highlight-meta")?.dataset.viewCount ?? 0),
    }]));
  const previousOrder = [...list.querySelectorAll(".highlight-link")].map((link) => link.dataset.faqId);
  const nextOrder = items.map((faq) => String(faq.id));
  const rankChanged = showCount && previousOrder.length > 0
    && previousOrder.join(",") !== nextOrder.join(",");
  const newRecentItem = !showCount && previousOrder.length > 0
    && nextOrder.some((id) => !previousRows.has(id));
  const rows = items.map((faq, index) => {
    const key = String(faq.id);
    const previous = previousRows.get(key);
    const item = previous?.item ?? document.createElement("li");
    item.dataset.faqId = key;
    const link = previous?.item.querySelector(".highlight-link") ?? document.createElement("a");
    link.className = "highlight-link";
    link.classList.toggle("highlight-link-ranked", showCount);
    link.classList.remove("highlight-link-entering");
    if (animate && !previous) {
      link.classList.add("highlight-link-entering");
      window.setTimeout(() => link.classList.remove("highlight-link-entering"), 1100);
    }
    link.classList.toggle("highlight-link-no-topic", !faq.topic);
    link.dataset.faqId = key;
    link.href = `?faq=${encodeURIComponent(faq.id)}`;

    if (showCount) {
      const rank = getOrCreate(link, ".highlight-rank", "span", "highlight-rank");
      rank.textContent = String(index + 1).padStart(2, "0");
      rank.dataset.rank = String(index + 1);
    } else {
      link.querySelector(".highlight-rank")?.remove();
    }
    const id = getOrCreate(link, ".highlight-id", "span", "highlight-id");
    id.textContent = key;
    const topic = getOrCreate(link, ".highlight-topic", "span", "highlight-topic");
    topic.textContent = faq.topic ?? "";
    topic.hidden = !faq.topic;
    const text = getOrCreate(link, ".highlight-text", "span", "highlight-text");
    const title = getOrCreate(text, "strong", "strong", "");
    title.textContent = faq.title;
    const meta = getOrCreate(text, ".highlight-meta", "span", "highlight-meta");
    if (showCount) {
      const count = Number(faq.viewCount ?? 0);
      meta.dataset.viewCount = String(count);
      if (animate && previous && previous.count !== count) animateCount(meta, previous.count, count, "회 조회");
      else meta.textContent = `${count.toLocaleString("ko-KR")}회 조회`;
    } else {
      delete meta.dataset.viewCount;
      meta.textContent = faq.category;
    }
    link.replaceChildren(...(showCount ? [link.querySelector(".highlight-rank"), id, topic, text] : [id, topic, text]));
    item.replaceChildren(link);
    item.dataset.previousTop = previous ? String(previous.top) : "";
    return item;
  });
  list.replaceChildren(...rows);
  if (animate && rankChanged) announceDashboard("최근 7일 조회 순위가 바뀌었습니다.");
  else if (animate && newRecentItem) announceDashboard("새로운 최근 조회 항목이 추가되었습니다.");
  if (animate && !prefersReducedMotion()) {
    rows.forEach((item) => {
      const hasPreviousPosition = item.dataset.previousTop !== "";
      const previousTop = Number(item.dataset.previousTop);
      const delta = hasPreviousPosition ? previousTop - item.getBoundingClientRect().top : 0;
      if (delta) item.animate([{ transform: `translateY(${delta}px)` }, { transform: "translateY(0)" }], {
        duration: 420, easing: "cubic-bezier(.2,.75,.25,1)",
      });
      else if (!hasPreviousPosition) item.animate([
        { opacity: 0, transform: "translateY(-5px)" },
        { opacity: 1, transform: "translateY(0)" },
      ], { duration: 300, easing: "ease-out" });
      delete item.dataset.previousTop;
    });
  }
}

function announceDashboard(message) {
  const announcement = document.querySelector("#dashboard-announcement");
  announcement.textContent = "";
  requestAnimationFrame(() => { announcement.textContent = message; });
}

/** 주제별 7일 열람량을 상위 주제부터 막대그래프로 표시합니다. */
function renderTopicItems(topics, animate) {
  const list = document.querySelector("#topic-analytics-list");
  list.setAttribute("aria-busy", "false");
  if (!topics.length) {
    renderTopicState("오늘 조회 기록이 쌓이면 주제가 표시됩니다.");
    return;
  }

  const previousRows = new Map([...list.querySelectorAll(".topic-analytics-item")]
    .map((item) => [item.dataset.topicKey, { item, top: item.getBoundingClientRect().top }]));
  const maxViews = Math.max(...topics.map((item) => Number(item.viewCount)));
  const rows = topics.map((topic, index) => {
    const key = `${topic.category}\u0000${topic.topic}`;
    const previous = previousRows.get(key);
    const item = previous?.item ?? document.createElement("li");
    item.className = "topic-analytics-item";
    item.dataset.topicKey = key;
    const link = item.querySelector(".topic-analytics-link") ?? document.createElement("a");
    link.className = "topic-analytics-link";
    link.href = `faq.html?${new URLSearchParams({ category: topic.category, topic: topic.topic })}`;
    const rank = getOrCreate(link, ".topic-analytics-rank", "span", "topic-analytics-rank");
    rank.textContent = String(index + 1).padStart(2, "0");
    const label = getOrCreate(link, ".topic-analytics-label", "span", "topic-analytics-label");
    const name = getOrCreate(label, "strong", "strong", "");
    name.textContent = topic.topic;
    const category = getOrCreate(label, "small", "small", "");
    category.textContent = topic.category;
    const count = getOrCreate(link, ".topic-analytics-count", "span", "topic-analytics-count");
    const views = Number(topic.viewCount ?? 0);
    const previousCount = Number(count.dataset.viewCount ?? 0);
    count.dataset.viewCount = String(views);
    if (animate && previous && previousCount !== views) animateCount(count, previousCount, views, "회");
    else count.textContent = `${views.toLocaleString("ko-KR")}회`;
    const track = getOrCreate(item, ".topic-analytics-track", "span", "topic-analytics-track");
    const bar = getOrCreate(track, ".topic-analytics-bar", "span", "topic-analytics-bar");
    bar.style.width = `${Math.max(3, (views / maxViews) * 100)}%`;
    link.replaceChildren(rank, label, count);
    item.replaceChildren(link, track);
    item.dataset.previousTop = previous ? String(previous.top) : "";
    return item;
  });
  list.replaceChildren(...rows);
  if (animate && !prefersReducedMotion()) {
    rows.forEach((item) => {
      const hasPreviousPosition = item.dataset.previousTop !== "";
      const previousTop = Number(item.dataset.previousTop);
      const delta = hasPreviousPosition ? previousTop - item.getBoundingClientRect().top : 0;
      if (delta) item.animate([{ transform: `translateY(${delta}px)` }, { transform: "translateY(0)" }], {
        duration: 420, easing: "cubic-bezier(.2,.75,.25,1)",
      });
      else if (!hasPreviousPosition) item.animate([
        { opacity: 0, transform: "translateY(-5px)" },
        { opacity: 1, transform: "translateY(0)" },
      ], { duration: 300, easing: "ease-out" });
      delete item.dataset.previousTop;
    });
  }
}

function renderTopicState(message, busy = false) {
  const list = document.querySelector("#topic-analytics-list");
  list.setAttribute("aria-busy", String(busy));
  const item = document.createElement("li");
  item.className = "topic-analytics-empty";
  item.textContent = message;
  list.replaceChildren(item);
}

function getOrCreate(parent, selector, tagName, className) {
  let element = parent.querySelector(selector);
  if (!element) {
    element = document.createElement(tagName);
    if (className) element.className = className;
    parent.append(element);
  }
  return element;
}

function animateCount(element, from, to, suffix) {
  if (prefersReducedMotion()) {
    element.textContent = `${to.toLocaleString("ko-KR")}${suffix}`;
    return;
  }
  const startedAt = performance.now();
  const duration = 420;
  const update = (now) => {
    const progress = Math.min(1, (now - startedAt) / duration);
    const eased = 1 - ((1 - progress) ** 3);
    const value = Math.round(from + (to - from) * eased);
    element.textContent = `${value.toLocaleString("ko-KR")}${suffix}`;
    if (progress < 1) requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** URL의 직접 FAQ ID가 현재 페이지에 없으면 상세 응답으로 표시할 항목을 복원합니다. */
async function includeDirectFaq(requestNumber) {
  const value = new URLSearchParams(window.location.search).get("faq");
  const id = Number(value);
  if (!Number.isInteger(id) || id < 1) return;
  try {
    const detail = state.details.get(id) ?? await getFaqDetail(id);
    if (requestNumber !== faqRequestNumber) return;
    state.details.set(id, detail);
    if (!state.faqs.some((faq) => Number(faq.id) === id)) {
      state.faqs = [detail];
      state.totalElements = 1;
      state.totalPages = 1;
      state.page = 1;
    }
    state.expandedIds.add(id);
    await recordFaqOpen(id).catch((error) => {
      if (error instanceof ApiError && error.status === 401) redirectToLogin();
    });
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) redirectToLogin();
  }
}

function scheduleSearch(value) {
  window.clearTimeout(searchTimer);
  searchTimer = window.setTimeout(async () => {
    state.query = value.trim();
    if (state.query) recordRecentSearch(state.query);
    state.page = 1;
    state.expandedIds.clear();
    updateUrl({ faqId: "" });
    await loadView();
  }, 250);
}

const RECENT_SEARCH_LIMIT = 5;

function recentSearchStorageKey() {
  return `kone-faq-recent-searches:${state.username}`;
}

function getRecentSearches() {
  try {
    const saved = JSON.parse(window.sessionStorage.getItem(recentSearchStorageKey()) ?? "[]");
    return Array.isArray(saved) ? saved.filter((item) => typeof item === "string" && item.trim()) : [];
  } catch {
    return [];
  }
}

function recordRecentSearch(query) {
  const normalized = query.trim();
  if (!normalized) return;
  const searches = getRecentSearches().filter((item) => item.toLocaleLowerCase("ko-KR") !== normalized.toLocaleLowerCase("ko-KR"));
  searches.unshift(normalized);
  try {
    window.sessionStorage.setItem(recentSearchStorageKey(), JSON.stringify(searches.slice(0, RECENT_SEARCH_LIMIT)));
  } catch {
    // Storage가 제한된 환경에서도 검색 기능은 계속 동작합니다.
  }
  renderRecentSearches();
}

function renderRecentSearches() {
  const section = document.querySelector("#recent-searches");
  const list = document.querySelector("#recent-search-list");
  if (!section || !list) return;
  const searches = getRecentSearches();
  section.hidden = searches.length === 0;
  list.replaceChildren();
  searches.forEach((query) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "recent-search-chip";
    button.textContent = query;
    button.addEventListener("click", () => {
      const input = document.querySelector("#search-input");
      input.value = query;
      scheduleSearch(query);
    });
    list.append(button);
  });
}

function clearRecentSearches() {
  try {
    window.sessionStorage.removeItem(recentSearchStorageKey());
  } catch {
    // 기록 삭제를 지원하지 않는 환경에서는 현재 화면만 비웁니다.
  }
  renderRecentSearches();
}

async function resetFilters() {
  state.query = "";
  state.category = "";
  state.topic = "";
  state.page = 1;
  state.expandedIds.clear();
  document.querySelector("#search-input").value = "";
  document.querySelector("#category-filter").value = "";
  await updateTopics();
  updateUrl({ faqId: "" });
  await loadView();
}

function updateUrl({ replace = false, faqId } = {}) {
  const params = new URLSearchParams();
  if (state.query) params.set("q", state.query);
  if (state.category) params.set("category", state.category);
  if (state.topic) params.set("topic", state.topic);
  if (state.page > 1) params.set("page", String(state.page));
  const faq = faqId === undefined ? new URLSearchParams(window.location.search).get("faq") : faqId;
  if (faq) params.set("faq", faq);
  const nextUrl = `${window.location.pathname}${params.size ? `?${params}` : ""}`;
  window.history[replace ? "replaceState" : "pushState"]({}, "", nextUrl);
}

async function restoreUrlState() {
  const params = new URLSearchParams(window.location.search);
  state.query = params.get("q") ?? "";
  state.category = params.get("category") ?? "";
  state.topic = params.get("topic") ?? "";
  state.page = Math.max(1, Number(params.get("page")) || 1);
  state.expandedIds.clear();
  document.querySelector("#search-input").value = state.query;
  populateCategoryFilter();
  await updateTopics();
  await loadView();
}

async function toggleFaq(id) {
  if (state.expandedIds.has(id)) {
    state.expandedIds.delete(id);
    updateUrl({ faqId: "" });
    render();
    return;
  }
  try {
    let detail = state.details.get(id);
    if (!detail) {
      detail = await getFaqDetail(id);
      state.details.set(id, detail);
    }
    state.expandedIds.add(id);
    updateUrl({ faqId: String(id) });
    render();
    await recordFaqOpen(id).catch((error) => {
      if (error instanceof ApiError && error.status === 401) redirectToLogin();
    });
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      redirectToLogin();
      return;
    }
    state.loadError = true;
    render();
  }
}

function render() {
  const faqs = state.faqs.map((faq) => state.details.get(faq.id) ?? faq);
  renderResults({
    faqs,
    page: state.page,
    totalElements: state.totalElements,
    totalPages: state.totalPages,
    query: state.query,
    loading: state.loading,
    loadError: state.loadError,
    expandedIds: state.expandedIds,
    onRetry: loadFaqs,
    onFaqToggle: toggleFaq,
    onPageChange: async (page) => {
      state.page = page;
      state.expandedIds.clear();
      updateUrl({ faqId: "" });
      await loadFaqs();
      window.scrollTo({ top: document.querySelector(".results-section").offsetTop - 20, behavior: "smooth" });
    },
  });
}

window.siteShellReady.then(initialize).catch(initialize);
