/* 공통 HTML 조각을 삽입하고 헤더 계정 메뉴를 관리합니다. */
const AUTH_SESSION_KEY = "faq-search-session";

/** 공통 헤더·푸터 HTML을 각 페이지의 슬롯에 불러옵니다. */
async function loadSharedComponents() {
  const slots = [...document.querySelectorAll("[data-include]")];
  await Promise.all(slots.map(async (slot) => {
    const response = await fetch(slot.dataset.include);
    if (!response.ok) throw new Error(`공통 화면을 불러오지 못했습니다: ${slot.dataset.include}`);
    slot.innerHTML = await response.text();
  }));
  initializeHeaderAccount();
  initializeFaqSidebar();
}

/** 현재 탭의 시연 로그인 상태로 헤더 계정 메뉴를 갱신합니다. */
function initializeHeaderAccount() {
  const action = document.querySelector("#header-auth-action");
  const menu = document.querySelector("#account-menu");
  const trigger = document.querySelector("#account-menu-trigger");
  const panel = document.querySelector("#account-menu-panel");
  const adminLink = document.querySelector("#admin-page-link");

  const update = () => {
    const session = readSession();
    menu.hidden = !session;
    action.textContent = session ? "로그아웃" : "로그인";
    action.hidden = document.body.dataset.page === "login" && !session;
    document.querySelector("#account-username").textContent = session?.username ?? "";
    document.querySelector(".account-avatar").textContent = (session?.username?.[0] ?? "?").toLocaleUpperCase("ko-KR");
    document.querySelector("#account-role").textContent = session?.role === "admin" ? "관리자 계정" : "일반 사용자";
    adminLink.hidden = session?.role !== "admin";
    trigger.setAttribute("aria-expanded", "false");
    panel.hidden = true;
  };

  update();
  window.addEventListener("auth-session-changed", update);
  action.addEventListener("click", () => {
    if (!readSession()) {
      window.location.href = "login.html";
      return;
    }
    sessionStorage.removeItem(AUTH_SESSION_KEY);
    update();
    window.location.href = "login.html";
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

function readSession() {
  try {
    const session = JSON.parse(sessionStorage.getItem(AUTH_SESSION_KEY) ?? "null");
    return session && typeof session.username === "string" ? session : null;
  } catch {
    return null;
  }
}

/** FAQ 화면에서 현재 위치를 표시하고 대분류 경로를 설정합니다. */
function initializeFaqSidebar() {
  const section = document.body.dataset.section;
  const selectedCategory = new URLSearchParams(window.location.search).get("category");
  document.querySelectorAll("[data-faq-category]").forEach((link) => {
    const category = link.dataset.faqCategory;
    link.href = `faq.html?${new URLSearchParams({ category })}`;
    if (section === "faq" && selectedCategory === category) link.setAttribute("aria-current", "page");
  });
  document.querySelectorAll("[data-faq-nav]").forEach((link) => {
    const isCurrent = link.dataset.faqNav === section && (section !== "faq" || !selectedCategory);
    if (isCurrent) link.setAttribute("aria-current", "page");
  });
}

window.siteShellReady = loadSharedComponents();
