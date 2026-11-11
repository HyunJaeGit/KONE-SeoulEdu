/* 로그인과 관리자 회원 화면을 실제 Spring Security 세션 API에 연결합니다. */
import {
  ApiError,
  createMember,
  deleteMember as deleteMemberApi,
  getCurrentUser,
  getMembers,
  redirectToLogin,
  signIn,
  signOut,
  updateMemberPassword,
} from "./api.js";

const description = document.querySelector("#auth-description");
let loginMode = "user";
let memberSearchTimer;
let memberRequestNumber = 0;

/** 일반·관리자 로그인 모드와 안내 문구를 전환합니다. */
document.querySelectorAll("[data-mode]").forEach((button) => {
  button.addEventListener("click", () => {
    loginMode = button.dataset.mode;
    document.querySelectorAll("[data-mode]").forEach((modeButton) => {
      const active = modeButton === button;
      modeButton.classList.toggle("is-active", active);
      modeButton.setAttribute("aria-pressed", String(active));
    });
    if (description) {
      description.textContent = loginMode === "admin"
        ? "관리자 계정으로 로그인해 계정을 관리하세요."
        : "상담원 계정으로 로그인해 FAQ를 확인하세요.";
    }
  });
});

/** 비밀번호 표시 버튼의 화면 상태를 전환합니다. */
document.querySelectorAll("[data-toggle-password]").forEach((button) => {
  button.addEventListener("click", () => {
    const input = document.getElementById(button.dataset.togglePassword);
    const showing = input.type === "password";
    input.type = showing ? "text" : "password";
    button.textContent = showing ? "숨김" : "표시";
    button.setAttribute("aria-label", showing ? "비밀번호 숨기기" : "비밀번호 표시");
  });
});

document.querySelector("#login-form")?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const button = event.currentTarget.querySelector('[type="submit"]');
  button.disabled = true;
  showMessage("#login-message", "로그인 중입니다.");
  try {
    const user = await signIn(String(form.get("username")).trim(), String(form.get("password")));
    const expectedRole = loginMode === "admin" ? "ADMIN" : "COUNSELOR";
    if (user.role !== expectedRole) {
      await signOut().catch(() => {});
      throw new Error(loginMode === "admin" ? "관리자 권한 계정으로 로그인해 주세요." : "상담원 계정으로 로그인해 주세요.");
    }
    dispatchSessionChange(user);
    const returnPath = getSafeReturnPath();
    window.location.href = returnPath ?? (user.role === "ADMIN" ? "admin.html" : "index.html");
  } catch (error) {
    showMessage("#login-message", error.message || "아이디 또는 비밀번호를 확인하세요.");
  } finally {
    button.disabled = false;
  }
});

document.querySelector("#admin-login-form")?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const button = event.currentTarget.querySelector('[type="submit"]');
  button.disabled = true;
  showMessage("#admin-message", "로그인 중입니다.");
  try {
    const user = await signIn(String(form.get("username")).trim(), String(form.get("password")));
    if (user.role !== "ADMIN") {
      await signOut().catch(() => {});
      throw new Error("관리자 권한 계정으로 로그인해 주세요.");
    }
    dispatchSessionChange(user);
    showAdminDashboard(user);
  } catch (error) {
    showMessage("#admin-message", error.message || "아이디 또는 비밀번호를 확인하세요.");
  } finally {
    button.disabled = false;
  }
});

document.querySelector("#member-search")?.addEventListener("input", () => {
  window.clearTimeout(memberSearchTimer);
  memberSearchTimer = window.setTimeout(loadMembers, 250);
});
document.querySelector("#add-member")?.addEventListener("click", () => openMemberDialog());
document.querySelector("#close-dialog")?.addEventListener("click", closeMemberDialog);
document.querySelector("#cancel-dialog")?.addEventListener("click", closeMemberDialog);
document.querySelector("#member-dialog")?.addEventListener("click", (event) => {
  if (event.target === event.currentTarget) closeMemberDialog();
});

document.querySelector("#member-form")?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formElement = event.currentTarget;
  const form = new FormData(formElement);
  const id = String(form.get("id") ?? "");
  const username = String(form.get("username") ?? "").trim();
  const password = String(form.get("password") ?? "");
  const button = formElement.querySelector('[type="submit"]');
  button.disabled = true;
  showMessage("#member-form-message", "저장 중입니다.");
  try {
    if (id) await updateMemberPassword(id, password);
    else await createMember(username, password);
    closeMemberDialog();
    formElement.reset();
    await loadMembers();
  } catch (error) {
    showMessage("#member-form-message", error.message || "회원 정보를 저장하지 못했습니다.");
  } finally {
    button.disabled = false;
  }
});

/** 서버 회원 검색 결과를 화면에 표시합니다. 늦게 도착한 이전 검색 응답은 무시합니다. */
async function loadMembers() {
  const body = document.querySelector("#member-rows");
  if (!body) return;
  const requestNumber = ++memberRequestNumber;
  const query = document.querySelector("#member-search").value.trim();
  showMessage("#member-form-message", "회원 목록을 불러오는 중입니다.");
  try {
    const members = await getMembers(query);
    if (requestNumber !== memberRequestNumber) return;
    body.replaceChildren(...members.map(createMemberRow));
    document.querySelector("#member-empty").hidden = members.length > 0;
    document.querySelector("#members-summary").textContent = `검색 결과 ${members.length}명`;
    document.querySelector("#total-count").textContent = String(members.length);
    showMessage("#member-form-message", "");
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      window.location.href = "login.html?return=admin.html";
      return;
    }
    showMessage("#member-form-message", error.message || "회원 목록을 불러오지 못했습니다.");
  }
}

function createMemberRow(member) {
  const row = document.createElement("tr");
  const usernameCell = document.createElement("td");
  const username = document.createElement("div");
  username.className = "member-name";
  username.textContent = member.username;
  usernameCell.append(username);

  const roleCell = document.createElement("td");
  const role = document.createElement("span");
  role.className = "role-chip";
  role.textContent = member.role === "ADMIN" ? "관리자" : "상담원";
  roleCell.append(role);

  const actionCell = document.createElement("td");
  const edit = document.createElement("button");
  edit.type = "button";
  edit.className = "edit-member";
  edit.textContent = "비밀번호 변경";
  edit.setAttribute("aria-label", `${member.username} 비밀번호 변경`);
  edit.addEventListener("click", () => openMemberDialog(member));
  const remove = document.createElement("button");
  remove.type = "button";
  remove.className = "delete-member";
  remove.textContent = "삭제";
  remove.setAttribute("aria-label", `${member.username} 회원 계정 삭제`);
  remove.addEventListener("click", () => deleteMember(member));
  actionCell.append(edit, remove);
  row.append(usernameCell, roleCell, actionCell);
  return row;
}

/** 생성 또는 비밀번호 변경 다이얼로그를 엽니다. */
function openMemberDialog(member = null) {
  const form = document.querySelector("#member-form");
  form.reset();
  document.querySelector("#member-id").value = member?.id ?? "";
  document.querySelector("#member-dialog-title").textContent = member ? "비밀번호 변경" : "상담원 계정 개설";
  const username = document.querySelector("#member-username");
  username.value = member?.username ?? "";
  username.readOnly = Boolean(member);
  username.required = !member;
  const password = document.querySelector("#member-password");
  password.value = "";
  password.required = true;
  password.placeholder = "8자 이상 입력";
  showMessage("#member-form-message", "");
  document.querySelector("#member-dialog").showModal();
  (member ? password : username).focus();
}

/** 삭제 승인 후 API에서 계정을 제거하고 현재 검색 결과를 다시 가져옵니다. */
async function deleteMember(member) {
  if (!window.confirm(`${member.username} 계정을 삭제할까요?`)) return;
  try {
    await deleteMemberApi(member.id);
    await loadMembers();
  } catch (error) {
    showMessage("#member-form-message", error.message || "회원 계정을 삭제하지 못했습니다.");
  }
}

function closeMemberDialog() {
  document.querySelector("#member-dialog")?.close();
}

/** 인증된 관리자라면 회원 대시보드를 열고 실제 username을 표시합니다. */
function showAdminDashboard(user) {
  const loginView = document.querySelector("#admin-login-view");
  const dashboard = document.querySelector("#admin-dashboard");
  if (!loginView || !dashboard || user?.role !== "ADMIN") return;
  loginView.hidden = true;
  dashboard.hidden = false;
  document.querySelector("#admin-username").textContent = user.username;
  document.querySelector(".admin-avatar").textContent = user.username[0]?.toLocaleUpperCase("ko-KR") ?? "A";
  loadMembers();
}

/** 페이지 재진입 때 서버 세션으로 관리자 화면 접근 여부를 복원합니다. */
async function restoreAdminSession() {
  if (!document.querySelector("#admin-dashboard")) return;
  try {
    const user = await getCurrentUser();
    if (user.role === "ADMIN") showAdminDashboard(user);
    else showMessage("#admin-message", "관리자 권한 계정으로 로그인해 주세요.");
  } catch (error) {
    if (!(error instanceof ApiError && error.status === 401)) {
      showMessage("#admin-message", error.message || "로그인 상태를 확인하지 못했습니다.");
    }
  }
}

function getSafeReturnPath() {
  const candidate = new URLSearchParams(window.location.search).get("return");
  if (!candidate || !candidate.startsWith("/") || candidate.startsWith("//")) return null;
  return candidate;
}

function dispatchSessionChange(user) {
  window.dispatchEvent(new CustomEvent("auth-session-changed", { detail: user }));
}

function showMessage(selector, message) {
  const element = document.querySelector(selector);
  if (element) element.textContent = message;
}

window.siteShellReady.then(restoreAdminSession).catch(restoreAdminSession);
