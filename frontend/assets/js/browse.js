/* FAQ 목록, 대분류 필터, 페이지와 열린 답변 상태를 관리합니다. */
import { searchFaqs } from "./search.js";
import { renderResults } from "./render.js";

const CATEGORIES = ["A/S 및 구매", "2027년 양품화 사업", "디벗 재배치 사업", "기타"];
const initialParams = new URLSearchParams(window.location.search);
const state = {
  faqs: [],
  category: initialParams.get("category") ?? "",
  page: Math.max(1, Number(initialParams.get("page")) || 1),
  expandedIds: new Set(),
  loading: false,
  loadError: false,
};

/** 목록 화면의 카테고리 선택과 브라우저 탐색 상태를 연결합니다. */
function initialize() {
  if (!CATEGORIES.includes(state.category)) state.category = "";
  const categorySelect = document.querySelector("#browse-category-filter");
  categorySelect.value = state.category;
  categorySelect.addEventListener("change", () => {
    state.category = categorySelect.value;
    state.page = 1;
    state.expandedIds.clear();
    updateUrl();
    render();
  });
  window.addEventListener("popstate", restoreUrlState);
  loadFaqs();
}

/** FAQ 데이터를 읽고 목록을 다시 표시합니다. */
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

/** 선택 카테고리에 맞는 질문 목록과 페이지 이동 UI를 표시합니다. */
function render() {
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
      window.scrollTo({ top: document.querySelector(".browse-toolbar").offsetTop, behavior: "smooth" });
    },
  });
  bindQuestionToggles();
}

/** FAQ 제목을 열거나 닫고 선택된 FAQ ID를 주소에 반영합니다. */
function bindQuestionToggles() {
  document.querySelectorAll(".faq-question").forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.querySelector(".faq-id").textContent;
      if (state.expandedIds.has(id)) state.expandedIds.delete(id);
      else state.expandedIds.add(id);
      updateUrl([...state.expandedIds].at(-1) ?? "");
      render();
    });
  });
}

/** 현재 필터, 페이지, 열린 답변을 URL로 보존합니다. */
function updateUrl(faqId = "") {
  const params = new URLSearchParams();
  if (state.category) params.set("category", state.category);
  if (state.page > 1) params.set("page", String(state.page));
  if (faqId) params.set("faq", faqId);
  window.history.pushState({}, "", `${window.location.pathname}${params.size ? `?${params}` : ""}`);
}

/** 뒤로 가기와 앞으로 가기에서 필터·페이지·답변 상태를 복원합니다. */
function restoreUrlState() {
  const params = new URLSearchParams(window.location.search);
  const category = params.get("category") ?? "";
  state.category = CATEGORIES.includes(category) ? category : "";
  state.page = Math.max(1, Number(params.get("page")) || 1);
  state.expandedIds.clear();
  const faqId = params.get("faq");
  if (faqId) state.expandedIds.add(faqId);
  document.querySelector("#browse-category-filter").value = state.category;
  render();
}

window.siteShellReady.then(initialize).catch(initialize);
