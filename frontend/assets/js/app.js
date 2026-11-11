/* FAQ 검색 화면을 로그인 세션과 Spring Boot 검색 API에 연결합니다. */
import {
  ApiError,
  getCurrentUser,
  getFaqCategories,
  getFaqDetail,
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
  loading: false,
  loadError: false,
};

let searchTimer;
let composing = false;
let faqRequestNumber = 0;
let topicRequestNumber = 0;

/** 현재 URL을 복원하고 로그인한 사용자의 검색 화면을 시작합니다. */
async function initialize() {
  const params = new URLSearchParams(window.location.search);
  state.query = params.get("q") ?? "";
  state.category = params.get("category") ?? "";
  state.topic = params.get("topic") ?? "";
  state.page = Math.max(1, Number(params.get("page")) || 1);
  document.querySelector("#search-input").value = state.query;

  try {
    await getCurrentUser();
    state.categories = await getFaqCategories();
    populateCategoryFilter();
    document.querySelector("#reset-filters").addEventListener("click", resetFilters);
    document.querySelector("#category-filter").addEventListener("change", async (event) => {
      state.category = event.target.value;
      state.topic = "";
      state.page = 1;
      await updateTopics();
      updateUrl({ faqId: "" });
      await loadFaqs();
    });
    document.querySelector("#topic-filter").addEventListener("change", async (event) => {
      state.topic = event.target.value;
      state.page = 1;
      updateUrl({ faqId: "" });
      await loadFaqs();
    });
    const input = document.querySelector("#search-input");
    input.addEventListener("compositionstart", () => { composing = true; });
    input.addEventListener("compositionend", () => { composing = false; scheduleSearch(input.value); });
    input.addEventListener("input", () => { if (!composing) scheduleSearch(input.value); });
    window.addEventListener("popstate", restoreUrlState);
    await updateTopics();
    await loadFaqs();
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
    state.page = 1;
    state.expandedIds.clear();
    updateUrl({ faqId: "" });
    await loadFaqs();
  }, 250);
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
  await loadFaqs();
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
  await loadFaqs();
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
