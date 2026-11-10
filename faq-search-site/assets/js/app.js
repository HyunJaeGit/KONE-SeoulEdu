/* FAQ 검색 사이트의 필터, URL 상태, 검색 지연과 화면 갱신을 조정합니다. */
import { searchFaqs } from "./search.js";
import { renderResults } from "./render.js";

const state = {
  faqs: [],
  query: "",
  category: "",
  topic: "",
  page: 1,
  expandedIds: new Set(),
  loading: false,
  loadError: false,
};

let searchTimer;
let composing = false;
const AUTH_SESSION_KEY = "faq-search-session";

/** 시작 시 URL 상태를 복원하고 정적 페이지 UI를 연결합니다. */
function initialize() {
  const params = new URLSearchParams(window.location.search);
  state.query = params.get("q") ?? "";
  state.category = params.get("category") ?? "";
  state.topic = params.get("topic") ?? "";
  state.page = Math.max(1, Number(params.get("page")) || 1);

  document.querySelector("#search-input").value = state.query;
  const category = document.querySelector("#category-filter");
  if ([...category.options].some((option) => option.value === state.category || option.textContent === state.category)) {
    category.value = state.category;
  } else state.category = "";
  document.querySelector("#reset-filters").addEventListener("click", resetFilters);
  category.addEventListener("change", () => {
    state.category = category.value;
    state.topic = "";
    state.page = 1;
    updateTopics();
    updateUrl();
    render();
  });
  document.querySelector("#topic-filter").addEventListener("change", (event) => {
    state.topic = event.target.value;
    state.page = 1;
    updateUrl();
    render();
  });
  const input = document.querySelector("#search-input");
  input.addEventListener("compositionstart", () => { composing = true; });
  input.addEventListener("compositionend", () => { composing = false; scheduleSearch(input.value); });
  input.addEventListener("input", () => { if (!composing) scheduleSearch(input.value); });
  window.addEventListener("popstate", restoreUrlState);
  initializeAccountMenu();
  updateTopics();
  loadFaqs();
}

/** 로그인 상태에 맞춰 상단 계정 메뉴와 통합 로그인·로그아웃 버튼을 표시합니다. */
function initializeAccountMenu() {
  const session = readAuthSession();
  const loginAction = document.querySelector("#header-auth-action");
  const accountMenu = document.querySelector("#account-menu");
  const trigger = document.querySelector("#account-menu-trigger");
  const panel = document.querySelector("#account-menu-panel");
  const adminLink = document.querySelector("#admin-page-link");

  accountMenu.hidden = !session;
  loginAction.textContent = session ? "로그아웃" : "로그인";
  document.querySelector("#account-username").textContent = session?.username ?? "";
  document.querySelector("#account-menu-trigger .account-avatar").textContent = (session?.username?.[0] ?? "?").toLocaleUpperCase("ko-KR");
  document.querySelector("#account-role").textContent = session?.role === "admin" ? "관리자 계정" : "일반 사용자";
  adminLink.hidden = session?.role !== "admin";

  loginAction.addEventListener("click", () => {
    if (!readAuthSession()) {
      window.location.href = "login.html";
      return;
    }
    sessionStorage.removeItem(AUTH_SESSION_KEY);
    window.location.href = "login.html";
  });
  trigger.addEventListener("click", () => {
    const expanded = trigger.getAttribute("aria-expanded") === "true";
    trigger.setAttribute("aria-expanded", String(!expanded));
    panel.hidden = expanded;
  });
  document.addEventListener("click", (event) => {
    if (!accountMenu.contains(event.target)) {
      trigger.setAttribute("aria-expanded", "false");
      panel.hidden = true;
    }
  });
}

function readAuthSession() {
  try {
    const session = JSON.parse(sessionStorage.getItem(AUTH_SESSION_KEY) ?? "null");
    return session && typeof session.username === "string" ? session : null;
  } catch {
    return null;
  }
}

/** FAQ JSON 연결 전에는 준비 상태를 유지하고, 연결 오류는 재시도할 수 있게 합니다. */
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
    state.loadError = false;
    updateTopics();
    restoreDirectFaq();
  } catch {
    state.faqs = [];
    state.loadError = true;
  } finally {
    state.loading = false;
    render();
  }
}

function scheduleSearch(value) {
  window.clearTimeout(searchTimer);
  searchTimer = window.setTimeout(() => {
    state.query = value.trim();
    state.page = 1;
    updateUrl();
    render();
  }, 200);
}

function resetFilters() {
  state.query = "";
  state.category = "";
  state.topic = "";
  state.page = 1;
  document.querySelector("#search-input").value = "";
  document.querySelector("#category-filter").value = "";
  updateTopics();
  updateUrl();
  render();
}

function updateTopics() {
  const topicSelect = document.querySelector("#topic-filter");
  const topics = [...new Set(state.faqs.filter((faq) => !state.category || faq.category === state.category).map((faq) => faq.topic).filter(Boolean))].sort((a, b) => a.localeCompare(b, "ko"));
  topicSelect.replaceChildren(new Option("모든 주제", ""));
  topics.forEach((topic) => topicSelect.add(new Option(topic, topic)));
  topicSelect.disabled = topics.length === 0;
  if (topics.includes(state.topic)) topicSelect.value = state.topic;
  else state.topic = "";
}

function updateUrl({ replace = false } = {}) {
  const params = new URLSearchParams();
  if (state.query) params.set("q", state.query);
  if (state.category) params.set("category", state.category);
  if (state.topic) params.set("topic", state.topic);
  if (state.page > 1) params.set("page", String(state.page));
  const faq = new URLSearchParams(window.location.search).get("faq");
  if (faq) params.set("faq", faq);
  const nextUrl = `${window.location.pathname}${params.size ? `?${params}` : ""}`;
  window.history[replace ? "replaceState" : "pushState"]({}, "", nextUrl);
}

function restoreUrlState() {
  const params = new URLSearchParams(window.location.search);
  state.query = params.get("q") ?? "";
  state.category = params.get("category") ?? "";
  state.topic = params.get("topic") ?? "";
  state.page = Math.max(1, Number(params.get("page")) || 1);
  document.querySelector("#search-input").value = state.query;
  document.querySelector("#category-filter").value = state.category;
  updateTopics();
  state.expandedIds.clear();
  restoreDirectFaq();
  render();
}

function restoreDirectFaq() {
  const faqId = new URLSearchParams(window.location.search).get("faq");
  if (faqId && state.faqs.some((faq) => faq.id === faqId)) state.expandedIds.add(faqId);
}

function render() {
  const visibleFaqs = searchFaqs(state.faqs, state);
  renderResults({
    faqs: visibleFaqs,
    page: state.page,
    query: state.query,
    loading: state.loading,
    loadError: state.loadError,
    expandedIds: state.expandedIds,
    onRetry: loadFaqs,
    onPageChange: (page) => {
      state.page = page;
      updateUrl();
      render();
      window.scrollTo({ top: document.querySelector(".results-section").offsetTop - 20, behavior: "smooth" });
    },
  });
  document.querySelectorAll(".faq-question").forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.querySelector(".faq-id").textContent;
      if (state.expandedIds.has(id)) state.expandedIds.delete(id);
      else state.expandedIds.add(id);
      const params = new URLSearchParams(window.location.search);
      if (state.expandedIds.has(id)) params.set("faq", id);
      else if (params.get("faq") === id) params.delete("faq");
      const nextUrl = `${window.location.pathname}${params.size ? `?${params}` : ""}`;
      window.history.pushState({}, "", nextUrl);
      render();
    });
  });
}

initialize();
