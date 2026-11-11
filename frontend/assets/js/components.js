/* 공통 HTML 조각과 서버 세션 기반 헤더·FAQ 탐색 메뉴를 관리합니다. */
import { getCurrentUser, getFaqCategories, signOut } from "./api.js";

const SIDEBAR_COLLAPSED_KEY = "faq-sidebar-collapsed-v3";
const FAQ_SUBMENU_EXPANDED_KEY = "faq-categories-expanded-v3";

/** 공통 헤더·푸터 조각을 불러온 뒤 계정 메뉴와 FAQ 메뉴를 초기화합니다. */
async function loadSharedComponents() {
  const slots = [...document.querySelectorAll("[data-include]")];
  await Promise.all(slots.map(async (slot) => {
    const response = await fetch(slot.dataset.include, { cache: "no-store" });
    if (!response.ok) throw new Error(`공통 화면을 불러오지 못했습니다: ${slot.dataset.include}`);
    slot.innerHTML = await response.text();
  }));
  initializeHeaderAccount();
  await initializeFaqSidebar();
}

/** 서버 세션의 사용자 정보에 따라 헤더 계정 메뉴를 표시합니다. */
function initializeHeaderAccount() {
  const action = document.querySelector("#header-auth-action");
  const menu = document.querySelector("#account-menu");
  const trigger = document.querySelector("#account-menu-trigger");
  const panel = document.querySelector("#account-menu-panel");
  const adminLink = document.querySelector("#admin-page-link");
  if (!action || !menu || !trigger || !panel || !adminLink) return;

  let currentUser = null;
  const update = (user) => {
    currentUser = user;
    menu.hidden = !user;
    action.textContent = user ? "로그아웃" : "로그인";
    action.hidden = document.body.dataset.page === "login" && !user;
    document.querySelector("#account-username").textContent = user?.username ?? "";
    document.querySelector(".account-avatar").textContent = (user?.username?.[0] ?? "?").toLocaleUpperCase("ko-KR");
    document.querySelector("#account-role").textContent = user?.role === "ADMIN" ? "관리자 계정" : "상담원 계정";
    adminLink.hidden = user?.role !== "ADMIN";
    trigger.setAttribute("aria-expanded", "false");
    panel.hidden = true;
  };

  getCurrentUser().then(update).catch(() => update(null));
  window.addEventListener("auth-session-changed", (event) => {
    if (event.detail) update(event.detail);
    else getCurrentUser().then(update).catch(() => update(null));
  });
  action.addEventListener("click", async () => {
    if (!currentUser) {
      window.location.href = "login.html";
      return;
    }
    action.disabled = true;
    try {
      await signOut();
      update(null);
      window.dispatchEvent(new CustomEvent("auth-session-changed", { detail: null }));
      window.location.href = "login.html";
    } catch {
      action.disabled = false;
      action.textContent = "로그아웃 실패";
    }
  });
  trigger.addEventListener("click", () => {
    const expanded = trigger.getAttribute("aria-expanded") === "true";
    trigger.setAttribute("aria-expanded", String(!expanded));
    panel.hidden = expanded;
  });
  document.addEventListener("click", (event) => {
    if (!menu.contains(event.target)) {
      trigger.setAttribute("aria-expanded", "false");
      panel.hidden = true;
    }
  });
}

/** DB에서 대분류를 읽어 FAQ 메뉴 링크를 만들고 탐색 상태를 연결합니다. */
async function initializeFaqSidebar() {
  const section = document.body.dataset.section;
  const workspace = document.querySelector(".faq-workspace");
  const categorySubmenu = document.querySelector("#faq-category-submenu");
  const sidebarToggle = document.querySelector("#faq-sidebar-toggle");
  const categoryToggle = document.querySelector("#faq-category-toggle");
  if (!workspace || !categorySubmenu || !sidebarToggle || !categoryToggle) return;

  const selectedCategory = new URLSearchParams(window.location.search).get("category");
  let sidebarCollapsed = readNavigationPreference(SIDEBAR_COLLAPSED_KEY, false);
  let categoriesExpanded = readNavigationPreference(FAQ_SUBMENU_EXPANDED_KEY, true);
  try {
    const categories = await getFaqCategories();
    categorySubmenu.replaceChildren(...categories.map((category) => {
      const link = document.createElement("a");
      link.dataset.faqCategory = category.name;
      link.href = `faq.html?${new URLSearchParams({ category: category.name })}`;
      const label = document.createElement("span");
      label.className = "faq-nav-label";
      label.textContent = category.name;
      link.append(label);
      if (section === "faq" && selectedCategory === category.name) link.setAttribute("aria-current", "page");
      return link;
    }));
  } catch {
    categorySubmenu.replaceChildren();
  }

  document.querySelectorAll("[data-faq-nav]").forEach((link) => {
    const isCurrent = link.dataset.faqNav === section && (section !== "faq" || !selectedCategory);
    if (isCurrent) link.setAttribute("aria-current", "page");
  });

  const updateNavigation = () => {
    workspace.classList.toggle("is-sidebar-collapsed", sidebarCollapsed);
    sidebarToggle.setAttribute("aria-expanded", String(!sidebarCollapsed));
    sidebarToggle.setAttribute("aria-label", sidebarCollapsed ? "좌측 메뉴 펼치기" : "좌측 메뉴 접기");
    const submenuExpanded = categoriesExpanded && !sidebarCollapsed;
    categoryToggle.setAttribute("aria-expanded", String(submenuExpanded));
    categoryToggle.setAttribute("aria-label", submenuExpanded ? "FAQ 하위 메뉴 접기" : "FAQ 하위 메뉴 펼치기");
    categorySubmenu.hidden = !submenuExpanded;
  };

  sidebarToggle.addEventListener("click", () => {
    sidebarCollapsed = !sidebarCollapsed;
    saveNavigationPreference(SIDEBAR_COLLAPSED_KEY, sidebarCollapsed);
    updateNavigation();
  });
  categoryToggle.addEventListener("click", () => {
    if (sidebarCollapsed) {
      sidebarCollapsed = false;
      categoriesExpanded = true;
      saveNavigationPreference(SIDEBAR_COLLAPSED_KEY, false);
    } else {
      categoriesExpanded = !categoriesExpanded;
    }
    saveNavigationPreference(FAQ_SUBMENU_EXPANDED_KEY, categoriesExpanded);
    updateNavigation();
  });
  updateNavigation();
}

function saveNavigationPreference(key, value) {
  try { sessionStorage.setItem(key, String(value)); } catch { /* 현재 화면의 메뉴 조작은 계속 허용합니다. */ }
}

function readNavigationPreference(key, defaultValue) {
  try {
    const value = sessionStorage.getItem(key);
    return value === null ? defaultValue : value === "true";
  } catch { return defaultValue; }
}

window.siteShellReady = loadSharedComponents();
