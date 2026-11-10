/* FAQ 결과, 제한된 Markdown 답변, 상태 메시지와 접근성 동작을 렌더링합니다. */
const PAGE_SIZE = 20;

/** FAQ의 제한된 Markdown 문법을 안전한 DOM 노드로 변환합니다. */
function renderMarkdown(markdown, container) {
  const lines = String(markdown ?? "").replace(/\r\n?/g, "\n").split("\n");
  let paragraph = [];
  let list = null;

  const flushParagraph = () => {
    if (!paragraph.length) return;
    const p = document.createElement("p");
    appendInline(p, paragraph.join(" "));
    container.append(p);
    paragraph = [];
  };
  const closeList = () => { list = null; };

  for (const line of lines) {
    const trimmed = line.trim();
    const listMatch = /^([-*]|\d+\.)\s+(.+)$/.exec(trimmed);
    if (!trimmed) { flushParagraph(); closeList(); continue; }
    if (listMatch) {
      flushParagraph();
      const isOrdered = /^\d/.test(listMatch[1]);
      if (!list || list.tagName === (isOrdered ? "UL" : "OL")) {
        list = document.createElement(isOrdered ? "ol" : "ul");
        container.append(list);
      }
      const item = document.createElement("li");
      appendInline(item, listMatch[2]);
      list.append(item);
      continue;
    }
    closeList();
    paragraph.push(trimmed);
  }
  flushParagraph();
}

function appendInline(parent, text) {
  const pattern = /(\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`|\[([^\]]+)\]\((https?:\/\/[^\s)]+)\))/g;
  let cursor = 0;
  for (const match of text.matchAll(pattern)) {
    parent.append(document.createTextNode(text.slice(cursor, match.index)));
    let node;
    if (match[2]) { node = document.createElement("strong"); node.textContent = match[2]; }
    else if (match[3]) { node = document.createElement("em"); node.textContent = match[3]; }
    else if (match[4]) { node = document.createElement("code"); node.textContent = match[4]; }
    else {
      node = document.createElement("a");
      node.textContent = match[5];
      node.href = match[6];
      node.rel = "noopener noreferrer";
      node.target = "_blank";
    }
    parent.append(node);
    cursor = match.index + match[0].length;
  }
  parent.append(document.createTextNode(text.slice(cursor)));
}

/** 현재 페이지의 결과 목록과 페이지 이동 UI를 화면에 표시합니다. */
export function renderResults({ faqs, page, query, loading, loadError, onRetry, onPageChange, expandedIds }) {
  const results = document.querySelector("#results");
  const count = document.querySelector("#result-count");
  const pagination = document.querySelector("#pagination");
  results.replaceChildren();
  pagination.replaceChildren();
  results.setAttribute("aria-busy", String(loading));

  if (loading) {
    count.textContent = "FAQ 데이터를 불러오는 중입니다.";
    showMessage(results, "잠시만 기다려 주세요.");
    return;
  }
  if (loadError) {
    count.textContent = "데이터를 불러오지 못했습니다.";
    showMessage(results, "데이터 연결을 준비 중입니다.", "FAQ 데이터가 연결되면 이 화면에서 질문을 검색할 수 있습니다.", onRetry);
    return;
  }
  if (!faqs.length) {
    count.textContent = query ? "검색 결과 0건" : "등록된 FAQ 0건";
    showMessage(results, query ? "검색 결과가 없습니다" : "FAQ 데이터를 준비하고 있습니다", query ? "검색어를 바꾸거나 필터를 초기화해 보세요." : "데이터가 연결되면 질문 목록이 여기에 표시됩니다.");
    return;
  }

  const pageCount = Math.ceil(faqs.length / PAGE_SIZE);
  const currentPage = Math.min(Math.max(page, 1), pageCount);
  const start = (currentPage - 1) * PAGE_SIZE;
  count.textContent = `${faqs.length.toLocaleString("ko-KR")}건${query ? " 검색됨" : ""} · ${start + 1}–${Math.min(start + PAGE_SIZE, faqs.length)} 표시`;

  faqs.slice(start, start + PAGE_SIZE).forEach((faq) => results.append(createFaqCard(faq, expandedIds)));
  if (pageCount > 1) renderPagination(pagination, currentPage, pageCount, onPageChange);
}

function showMessage(container, title, description = "", onRetry) {
  const state = document.createElement("div");
  state.className = "empty-state";
  const heading = document.createElement("strong");
  heading.textContent = title;
  state.append(heading);
  if (description) {
    const text = document.createElement("p");
    text.textContent = description;
    state.append(text);
  }
  if (onRetry) {
    const retry = document.createElement("button");
    retry.className = "retry-button";
    retry.type = "button";
    retry.textContent = "다시 시도";
    retry.addEventListener("click", onRetry);
    state.append(retry);
  }
  container.append(state);
}

function createFaqCard(faq, expandedIds) {
  const card = document.createElement("article");
  card.className = "faq-card";
  const button = document.createElement("button");
  const answerId = `answer-${safeId(faq.id)}`;
  const expanded = expandedIds.has(faq.id);
  button.className = "faq-question";
  button.type = "button";
  button.setAttribute("aria-expanded", String(expanded));
  button.setAttribute("aria-controls", answerId);

  const id = document.createElement("span");
  id.className = "faq-id";
  id.textContent = faq.id;
  const title = document.createElement("span");
  title.className = "faq-title";
  title.textContent = faq.title;
  const chevron = document.createElement("span");
  chevron.className = "faq-chevron";
  chevron.setAttribute("aria-hidden", "true");
  chevron.textContent = "⌄";
  button.append(id, title, chevron);
  card.append(button);

  if (expanded) {
    const answer = document.createElement("div");
    answer.className = "faq-answer";
    answer.id = answerId;
    renderMarkdown(faq.answer, answer);
    const copy = document.createElement("button");
    copy.className = "copy-button";
    copy.type = "button";
    copy.textContent = "질문과 답변 복사";
    copy.addEventListener("click", async () => {
      const original = copy.textContent;
      try {
        await navigator.clipboard.writeText(`${faq.title}\n${faq.answerText ?? faq.answer}`);
        copy.textContent = "복사했습니다";
      } catch {
        copy.textContent = "복사할 수 없습니다. 답변을 직접 선택해 복사해 주세요.";
      }
      window.setTimeout(() => { copy.textContent = original; }, 2500);
    });
    answer.append(copy);
    card.append(answer);
  }

  return card;
}

function safeId(value) { return String(value).replace(/[^a-zA-Z0-9_-]/g, "-"); }

function renderPagination(container, current, total, onPageChange) {
  const addButton = (label, page, { disabled = false, currentPage = false } = {}) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = label;
    button.disabled = disabled;
    if (currentPage) button.setAttribute("aria-current", "page");
    button.addEventListener("click", () => onPageChange(page));
    container.append(button);
  };
  addButton("이전", current - 1, { disabled: current <= 1 });
  const first = Math.max(1, Math.min(current - 2, total - 4));
  for (let page = first; page <= Math.min(total, first + 4); page += 1) {
    addButton(String(page), page, { currentPage: page === current });
  }
  addButton("다음", current + 1, { disabled: current >= total });
}

export { PAGE_SIZE };
