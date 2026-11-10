/* FAQ 대분류 탐색 화면의 데이터·목록·URL 상태를 관리합니다. */
import { searchFaqs } from "./search.js";
import { renderResults } from "./render.js";

const CATEGORIES = ["A/S 및 구매", "2027년 양품화 사업", "디벗 재배치 사업", "기타"];
const state = {
  faqs: [],
  category: new URLSearchParams(window.location.search).get("category") ?? "",
  page: Math.max(1, Number(new URLSearchParams(window.location.search).get("page")) || 1),
  expandedIds: new Set(),
  loading: false,
  loadError: false,
};

/** 탐색 화면을 초기화하고 더미 FAQ JSON을 불러옵니다. */
function initialize() {
  if (!CATEGORIES.includes(state.category)) state.category = "";
  window.addEventListener("popstate", restoreUrlState);
  loadFaqs();
}

/** FAQ 파일을 로드한 뒤 분류 카드 또는 선택한 분류의 목록을 표시합니다. */
async function loadFaqs() {
  state.loading = true;
  state.loadError = false;
  render();
  try {
    const response = await fetch("data/faq.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`FAQ 데이터 응답 오류: ${response.status}`);
    const data = await response.json();
    if (!Array.isArray(data)) throw new Error("FAQ 데이터 형식이 배열이 아닙니다.");
    state.faqs = data;
    const faqId = new URLSearchParams(window.location.search).get("faq");
    if (faqId && data.some((faq) => faq.id === faqId)) state.expandedIds.add(faqId);
  } catch {
    state.faqs = [];
    state.loadError = true;
  } finally {
    state.loading = false;
    render();
  }
}

/** 분류별 건수를 보여주거나 선택한 분류의 FAQ 목록을 갱신합니다. */
function render() {
  const overview = document.querySelector("#faq-overview");
  const categoryView = document.querySelector("#faq-category-view");
  overview.hidden = Boolean(state.category);
  categoryView.hidden = !state.category;

  if (!state.category) {
    renderCategoryCards();
    return;
  }

  document.querySelector("#category-title").textContent = state.category;
  const visibleFaqs = searchFaqs(state.faqs, { category: state.category });
  renderResults({
    faqs: visibleFaqs,
    page: state.page,
    query: "",
    loading: state.loading,
    loadError: state.loadError,
    expandedIds: state.expandedIds,
    onRetry: loadFaqs,
    onPageChange: (page) => {
      state.page = page;
      updateUrl();
      render();
      window.scrollTo({ top: document.querySelector(".browse-heading").offsetTop, behavior: "smooth" });
    },
  });
  bindQuestionToggles();
}

/** 고정 대분류마다 FAQ 수와 주제 수를 카드로 표시합니다. */
function renderCategoryCards() {
  const container = document.querySelector("#category-cards");
  container.replaceChildren();
  if (state.loading) {
    showCategoryMessage("FAQ 데이터를 불러오는 중입니다.");
    return;
  }
  if (state.loadError) {
    showCategoryMessage("FAQ 데이터를 불러오지 못했습니다.", true);
    return;
  }

  CATEGORIES.forEach((category) => {
    const categoryFaqs = state.faqs.filter((faq) => faq.category === category);
    const topics = new Set(categoryFaqs.map((faq) => faq.topic).filter(Boolean));
    const link = document.createElement("a");
    link.className = "category-card";
    link.href = `faq.html?${new URLSearchParams({ category })}`;
    const copy = document.createElement("span");
    copy.className = "category-card-copy";
    const title = document.createElement("span");
    title.className = "category-card-title";
    title.textContent = category;
    const meta = document.createElement("span");
    meta.className = "category-card-meta";
    meta.textContent = `${categoryFaqs.length.toLocaleString("ko-KR")}개 질문 · ${topics.size.toLocaleString("ko-KR")}개 주제`;
    const chevron = document.createElement("img");
    chevron.className = "chevron-icon";
    chevron.src = "assets/img/chevron-down.svg";
    chevron.alt = "";
    chevron.setAttribute("aria-hidden", "true");
    copy.append(title, meta);
    link.append(copy, chevron);
    container.append(link);
  });
}

/** 분류 카드 로드 실패 상태와 재시도 버튼을 표시합니다. */
function showCategoryMessage(message, retry = false) {
  const stateMessage = document.createElement("div");
  stateMessage.className = "empty-state";
  const title = document.createElement("strong");
  title.textContent = message;
  stateMessage.append(title);
  if (retry) {
    const button = document.createElement("button");
    button.className = "retry-button";
    button.type = "button";
    button.textContent = "다시 시도";
    button.addEventListener("click", loadFaqs);
    stateMessage.append(button);
  }
  document.querySelector("#category-cards").append(stateMessage);
}

/** FAQ 제목을 열고 닫으면서 주소에 선택된 FAQ ID를 반영합니다. */
function bindQuestionToggles() {
  document.querySelectorAll(".faq-question").forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.querySelector(".faq-id").textContent;
      if (state.expandedIds.has(id)) state.expandedIds.delete(id);
      else state.expandedIds.add(id);
      updateUrl(id);
      render();
    });
  });
}

/** 현재 분류·페이지·열린 FAQ를 주소에 저장합니다. */
function updateUrl(faqId = "") {
  const params = new URLSearchParams({ category: state.category });
  if (state.page > 1) params.set("page", String(state.page));
  const selectedId = faqId || [...state.expandedIds].at(-1);
  if (selectedId) params.set("faq", selectedId);
  window.history.pushState({}, "", `${window.location.pathname}?${params}`);
}

/** 브라우저 뒤로 가기·앞으로 가기에서 분류와 페이지를 복원합니다. */
function restoreUrlState() {
  const params = new URLSearchParams(window.location.search);
  state.category = CATEGORIES.includes(params.get("category")) ? params.get("category") : "";
  state.page = Math.max(1, Number(params.get("page")) || 1);
  state.expandedIds.clear();
  const faqId = params.get("faq");
  if (faqId) state.expandedIds.add(faqId);
  render();
}

window.siteShellReady.then(initialize).catch(initialize);
