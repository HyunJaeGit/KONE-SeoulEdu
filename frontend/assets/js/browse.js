/* FAQ 탐색 목록을 로그인 세션과 대분류·페이지 API에 연결합니다. */
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

const params = new URLSearchParams(window.location.search);
const state = {
  faqs: [],
  details: new Map(),
  categories: [],
  category: params.get("category") ?? "",
  topic: params.get("topic") ?? "",
  sort: ["recent", "popular", "least"].includes(params.get("sort")) ? params.get("sort") : "recent",
  page: Math.max(1, Number(params.get("page")) || 1),
  totalElements: 0,
  totalPages: 0,
  expandedIds: new Set(),
  loading: false,
  loadError: false,
};
let faqRequestNumber = 0;
let topicRequestNumber = 0;

/** 로그인한 사용자의 카테고리 탐색 화면을 초기화합니다. */
async function initialize() {
  try {
    await getCurrentUser();
    state.categories = await getFaqCategories();
    const select = document.querySelector("#browse-category-filter");
    select.replaceChildren(new Option("전체 카테고리", ""));
    state.categories.forEach((category) => select.add(new Option(category.name, category.name)));
    if (state.categories.some((category) => category.name === state.category)) select.value = state.category;
    else state.category = "";

    select.addEventListener("change", async () => {
      state.category = select.value;
      state.topic = "";
      state.page = 1;
      state.expandedIds.clear();
      await updateTopics();
      updateUrl(undefined, "");
      await loadFaqs();
    });
    document.querySelector("#browse-topic-filter").addEventListener("change", async (event) => {
      state.topic = event.target.value;
      state.page = 1;
      state.expandedIds.clear();
      updateUrl(undefined, "");
      await loadFaqs();
    });
    const sortSelect = document.querySelector("#browse-sort");
    sortSelect.value = state.sort;
    sortSelect.addEventListener("change", async (event) => {
      state.sort = event.target.value;
      state.page = 1;
      state.expandedIds.clear();
      updateUrl(true, "");
      await loadFaqs();
    });
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

/** 선택 카테고리에서 사용 중인 topic만 모아 세부 주제 선택 상자를 채웁니다. */
async function updateTopics() {
  const requestNumber = ++topicRequestNumber;
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
  const select = document.querySelector("#browse-topic-filter");
  select.replaceChildren(new Option("전체 주제", ""));
  [...topics].sort((left, right) => left.localeCompare(right, "ko"))
    .forEach((topic) => select.add(new Option(topic, topic)));
  select.disabled = topics.size === 0;
  if (topics.has(state.topic)) select.value = state.topic;
  else state.topic = "";
}

/** FAQ 목록을 API에서 페이지 단위로 불러옵니다. */
async function loadFaqs() {
  const requestNumber = ++faqRequestNumber;
  state.loading = true;
  state.loadError = false;
  render();
  try {
    const category = state.categories.find((item) => item.name === state.category);
    const result = await getFaqPage({ categoryId: category?.id, topic: state.topic, page: state.page, size: PAGE_SIZE, sort: state.sort });
    if (requestNumber !== faqRequestNumber) return;
    if (result.totalPages > 0 && state.page > result.totalPages) {
      state.page = result.totalPages;
      updateUrl(true);
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

async function includeDirectFaq(requestNumber) {
  const id = Number(new URLSearchParams(window.location.search).get("faq"));
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

/** FAQ 제목을 펼치거나 닫고, 열람 횟수를 서버에 기록합니다. */
async function toggleFaq(id) {
  if (state.expandedIds.has(id)) {
    state.expandedIds.delete(id);
    updateUrl(undefined, "");
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
    updateUrl(undefined, String(id));
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

/** 현재 API 페이지와 상세 본문을 결과 컴포넌트에 전달합니다. */
function render() {
  renderResults({
    faqs: state.faqs.map((faq) => state.details.get(faq.id) ?? faq),
    page: state.page,
    totalElements: state.totalElements,
    totalPages: state.totalPages,
    query: "",
    loading: state.loading,
    loadError: state.loadError,
    expandedIds: state.expandedIds,
    onRetry: loadFaqs,
    onFaqToggle: toggleFaq,
    onPageChange: async (page) => {
      state.page = page;
      state.expandedIds.clear();
      updateUrl(undefined, "");
      await loadFaqs();
      window.scrollTo({ top: document.querySelector(".browse-toolbar").offsetTop, behavior: "smooth" });
    },
  });
}

function updateUrl(replace = false, faqId) {
  const nextParams = new URLSearchParams();
  if (state.category) nextParams.set("category", state.category);
  if (state.topic) nextParams.set("topic", state.topic);
  if (state.sort !== "recent") nextParams.set("sort", state.sort);
  if (state.page > 1) nextParams.set("page", String(state.page));
  const selectedFaq = faqId === undefined ? new URLSearchParams(window.location.search).get("faq") : faqId;
  if (selectedFaq) nextParams.set("faq", selectedFaq);
  const url = `${window.location.pathname}${nextParams.size ? `?${nextParams}` : ""}`;
  window.history[replace ? "replaceState" : "pushState"]({}, "", url);
}

async function restoreUrlState() {
  const nextParams = new URLSearchParams(window.location.search);
  state.category = nextParams.get("category") ?? "";
  if (!state.categories.some((category) => category.name === state.category)) state.category = "";
  state.topic = nextParams.get("topic") ?? "";
  state.sort = ["recent", "popular", "least"].includes(nextParams.get("sort")) ? nextParams.get("sort") : "recent";
  state.page = Math.max(1, Number(nextParams.get("page")) || 1);
  state.expandedIds.clear();
  document.querySelector("#browse-category-filter").value = state.category;
  document.querySelector("#browse-sort").value = state.sort;
  await updateTopics();
  await loadFaqs();
}

window.siteShellReady.then(initialize).catch(initialize);
