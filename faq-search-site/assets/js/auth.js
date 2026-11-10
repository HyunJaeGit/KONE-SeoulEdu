/* 로그인 시안과 임시 관리자 회원 관리 화면의 입력·목록 상태를 관리합니다. */
const description = document.querySelector("#auth-description");
const demoAdmin = { username: "test", password: "1111" };
const AUTH_SESSION_KEY = "faq-search-session";
let members = [
  { id: 1, name: "김민준", username: "minjun.kim", email: "minjun@example.com", role: "상담원", status: "사용 중" },
  { id: 2, name: "이서연", username: "seoyeon.lee", email: "seoyeon@example.com", role: "상담원", status: "사용 중" },
  { id: 3, name: "박지우", username: "jiwoo.park", email: "jiwoo@example.com", role: "상담원", status: "사용 중지" },
];

/** 일반·관리자 로그인 모드의 선택 상태를 전환합니다. */
document.querySelectorAll("[data-mode]").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll("[data-mode]").forEach((modeButton) => {
      const isActive = modeButton === button;
      modeButton.classList.toggle("is-active", isActive);
      modeButton.setAttribute("aria-pressed", String(isActive));
    });
    if (description) {
      description.textContent = button.dataset.mode === "admin"
        ? "관리자 계정으로 로그인해 계정을 관리하세요."
        : "계정 정보를 입력해 로그인하세요.";
    }
  });
});

/** 비밀번호 표시 버튼은 입력 화면 확인을 위한 프런트 동작입니다. */
document.querySelectorAll("[data-toggle-password]").forEach((button) => {
  button.addEventListener("click", () => {
    const input = document.getElementById(button.dataset.togglePassword);
    const showing = input.type === "password";
    input.type = showing ? "text" : "password";
    button.textContent = showing ? "숨김" : "표시";
    button.setAttribute("aria-label", showing ? "비밀번호 숨기기" : "비밀번호 표시");
  });
});

document.querySelector("#login-form")?.addEventListener("submit", (event) => {
  event.preventDefault();
  showMessage("#login-message", "로그인은 인증 서버 연결 후 사용할 수 있습니다.");
});

document.querySelector("#admin-login-form")?.addEventListener("submit", (event) => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  if (form.get("username") !== demoAdmin.username || form.get("password") !== demoAdmin.password) {
    showMessage("#admin-message", "아이디 또는 비밀번호를 확인하세요.");
    return;
  }
  const session = { username: demoAdmin.username, role: "admin" };
  sessionStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
  showAdminDashboard(session);
});

document.querySelector("#admin-logout")?.addEventListener("click", () => {
  sessionStorage.removeItem(AUTH_SESSION_KEY);
  window.location.href = "login.html";
});

document.querySelector("#member-search")?.addEventListener("input", renderMembers);
document.querySelector("#add-member")?.addEventListener("click", () => openMemberDialog());
document.querySelector("#close-dialog")?.addEventListener("click", closeMemberDialog);
document.querySelector("#cancel-dialog")?.addEventListener("click", closeMemberDialog);
document.querySelector("#member-dialog")?.addEventListener("click", (event) => {
  if (event.target === event.currentTarget) closeMemberDialog();
});

document.querySelector("#member-form")?.addEventListener("submit", (event) => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const id = Number(form.get("id"));
  const username = String(form.get("username")).trim();
  const duplicate = members.some((member) => member.username.toLowerCase() === username.toLowerCase() && member.id !== id);
  if (duplicate) {
    showMessage("#member-form-message", "이미 사용 중인 아이디입니다.");
    return;
  }

  const member = {
    id: id || Date.now(),
    name: String(form.get("name")).trim(),
    username,
    email: String(form.get("email")).trim(),
    role: String(form.get("role")),
    status: String(form.get("status")),
  };
  if (id) members = members.map((current) => current.id === id ? member : current);
  else members = [member, ...members];
  closeMemberDialog();
  renderMembers();
});

/** 현재 브라우저 메모리에 있는 데모 회원을 필터링해 표에 표시합니다. */
function renderMembers() {
  const body = document.querySelector("#member-rows");
  if (!body) return;
  const query = document.querySelector("#member-search").value.trim().toLocaleLowerCase("ko-KR");
  const filtered = members.filter((member) => `${member.name} ${member.username} ${member.email}`.toLocaleLowerCase("ko-KR").includes(query));
  body.replaceChildren(...filtered.map(createMemberRow));
  document.querySelector("#member-empty").hidden = filtered.length > 0;
  document.querySelector("#members-summary").textContent = `전체 ${members.length}명 중 ${filtered.length}명 표시`;
  document.querySelector("#total-count").textContent = String(members.length);
  document.querySelector("#active-count").textContent = String(members.filter((member) => member.status === "사용 중").length);
  document.querySelector("#inactive-count").textContent = String(members.filter((member) => member.status === "사용 중지").length);
}

function createMemberRow(member) {
  const row = document.createElement("tr");
  const identity = document.createElement("td");
  const name = document.createElement("div");
  name.className = "member-name";
  name.textContent = member.name;
  const username = document.createElement("div");
  username.className = "member-username";
  username.textContent = member.username;
  identity.append(name, username);

  const email = document.createElement("td");
  email.textContent = member.email || "—";
  const roleCell = document.createElement("td");
  const role = document.createElement("span");
  role.className = "role-chip";
  role.textContent = member.role;
  roleCell.append(role);
  const statusCell = document.createElement("td");
  const status = document.createElement("span");
  status.className = `status-chip ${member.status === "사용 중" ? "active" : "inactive"}`;
  status.textContent = member.status;
  statusCell.append(status);
  const actionCell = document.createElement("td");
  const edit = document.createElement("button");
  edit.type = "button";
  edit.className = "edit-member";
  edit.textContent = "수정";
  edit.setAttribute("aria-label", `${member.name} 회원 정보 수정`);
  edit.addEventListener("click", () => openMemberDialog(member));
  actionCell.append(edit);
  row.append(identity, email, roleCell, statusCell, actionCell);
  return row;
}

/** 신규 또는 기존 회원 정보를 입력하는 다이얼로그를 엽니다. */
function openMemberDialog(member = null) {
  const form = document.querySelector("#member-form");
  form.reset();
  document.querySelector("#member-id").value = member?.id ?? "";
  document.querySelector("#member-dialog-title").textContent = member ? "회원 정보 수정" : "회원 개설";
  document.querySelector("#member-name").value = member?.name ?? "";
  document.querySelector("#member-username").value = member?.username ?? "";
  document.querySelector("#member-username").readOnly = Boolean(member);
  document.querySelector("#member-email").value = member?.email ?? "";
  document.querySelector("#member-role").value = member?.role ?? "상담원";
  document.querySelector("#member-status").value = member?.status ?? "사용 중";
  showMessage("#member-form-message", "");
  document.querySelector("#member-dialog").showModal();
  document.querySelector("#member-name").focus();
}

function closeMemberDialog() {
  document.querySelector("#member-dialog")?.close();
}

/** 임시 관리자 세션이 있으면 관리자 대시보드를 표시합니다. */
function showAdminDashboard(session) {
  const loginView = document.querySelector("#admin-login-view");
  const dashboard = document.querySelector("#admin-dashboard");
  if (!loginView || !dashboard || session?.role !== "admin") return;
  loginView.hidden = true;
  dashboard.hidden = false;
  document.querySelector("#dashboard-username").textContent = session.username;
  renderMembers();
}

try {
  const session = JSON.parse(sessionStorage.getItem(AUTH_SESSION_KEY) ?? "null");
  showAdminDashboard(session);
} catch {
  sessionStorage.removeItem(AUTH_SESSION_KEY);
}

/** 현재는 서버가 연결되지 않았음을 폼 아래에 안내합니다. */
function showMessage(selector, message) {
  const element = document.querySelector(selector);
  if (element) element.textContent = message;
}
