/* FAQ 통계 페이지의 대분류·기간 필터와 접근성 있는 차트를 렌더링합니다. */
import { ApiError, getCurrentUser, getFaqCategories, getFaqStatistics, redirectToLogin } from "./api.js";

const VISIBLE_CATEGORIES = ["2027년 양품화 사업", "유지보수"];
const state = { categories: [], category: null, days: 30, requestNumber: 0 };
const svgNamespace = "http://www.w3.org/2000/svg";

async function initialize() {
  try {
    await getCurrentUser();
    const allCategories = await getFaqCategories();
    state.categories = VISIBLE_CATEGORIES.map((name) => allCategories.find((category) => category.name === name)).filter(Boolean);
    renderCategoryTabs();
    document.querySelector("#stats-period").addEventListener("change", (event) => {
      state.days = Number(event.target.value);
      loadStatistics();
    });
    if (!state.categories.length) {
      setStatus("통계를 표시할 대분류를 찾지 못했습니다.", true);
      return;
    }
    state.category = state.categories[0];
    renderCategoryTabs();
    await loadStatistics();
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      redirectToLogin();
      return;
    }
    setStatus("통계 화면을 불러오지 못했습니다. 새로고침해 주세요.", true);
  }
}

function renderCategoryTabs() {
  const tabs = document.querySelector("#stats-category-tabs");
  tabs.replaceChildren();
  state.categories.forEach((category, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "stats-category-tab";
    button.id = "stats-tab-" + category.id;
    button.setAttribute("role", "tab");
    button.setAttribute("aria-selected", String(state.category?.id === category.id));
    button.setAttribute("aria-controls", "stats-content");
    button.tabIndex = state.category?.id === category.id || (!state.category && index === 0) ? 0 : -1;
    button.textContent = category.name;
    button.addEventListener("click", () => {
      state.category = category;
      renderCategoryTabs();
      loadStatistics();
    });
    tabs.append(button);
  });
}

async function loadStatistics() {
  if (!state.category) return;
  const requestNumber = ++state.requestNumber;
  const content = document.querySelector("#stats-content");
  content.hidden = false;
  content.setAttribute("aria-busy", "true");
  setStatus(state.category.name + " 통계를 불러오는 중입니다.", false, true);
  try {
    const data = await getFaqStatistics(state.category.id, state.days);
    if (requestNumber !== state.requestNumber) return;
    renderStatistics(data);
    content.setAttribute("aria-busy", "false");
    setStatus(data.category + " · 최근 " + data.days + "일 기준", false);
  } catch (error) {
    if (requestNumber !== state.requestNumber) return;
    content.setAttribute("aria-busy", "false");
    if (error instanceof ApiError && error.status === 401) {
      redirectToLogin();
      return;
    }
    content.hidden = true;
    setStatus("통계 데이터를 불러오지 못했습니다. 서버 상태를 확인하고 다시 시도해 주세요.", true);
  }
}

function renderStatistics(data) {
  setMetric("#stat-total-views", data.viewCount);
  setMetric("#stat-viewed-faqs", data.viewedFaqCount);
  setMetric("#stat-total-faqs", data.totalFaqCount);
  setMetric("#stat-viewers", data.uniqueViewerCount);
  setMetric("#stat-topic-count", data.topicViews.length);
  renderDailyTrend(data.dailyViews);
  renderTopics(data.topicViews);
  renderTopFaqs(data.topFaqs, data.category);
}

function setMetric(selector, value) {
  document.querySelector(selector).textContent = Number(value ?? 0).toLocaleString("ko-KR");
}

function renderDailyTrend(dailyViews) {
  const container = document.querySelector("#daily-trend-chart");
  container.replaceChildren();
  if (!dailyViews.length) {
    renderEmpty(container, "표시할 일별 기록이 없습니다.");
    return;
  }
  const width = 760;
  const height = 270;
  const left = 48;
  const right = 738;
  const top = 18;
  const bottom = 218;
  const max = Math.max(1, ...dailyViews.map((item) => Math.max(item.viewCount, item.uniqueViewerCount)));
  const svg = createSvg("svg", { viewBox: "0 0 " + width + " " + height, role: "img", "aria-label": "일별 FAQ 열람 횟수와 열람 계정 수" });
  const title = createSvg("title");
  title.textContent = "일별 열람 추이";
  svg.append(title);
  for (let step = 0; step <= 4; step += 1) {
    const y = top + ((bottom - top) * step) / 4;
    const value = Math.round(max * (1 - step / 4));
    svg.append(createSvg("line", { x1: left, y1: y, x2: right, y2: y, class: "chart-grid-line" }));
    const label = createSvg("text", { x: left - 10, y: y + 4, class: "chart-axis-label", "text-anchor": "end" });
    label.textContent = value.toLocaleString("ko-KR");
    svg.append(label);
  }
  const xAt = (index) => dailyViews.length === 1 ? (left + right) / 2 : left + ((right - left) * index) / (dailyViews.length - 1);
  const yAt = (value) => bottom - ((bottom - top) * value) / max;
  const viewPath = dailyViews.map((item, index) => (index ? "L" : "M") + xAt(index) + "," + yAt(item.viewCount)).join(" ");
  const userPath = dailyViews.map((item, index) => (index ? "L" : "M") + xAt(index) + "," + yAt(item.uniqueViewerCount)).join(" ");
  svg.append(createSvg("path", { d: viewPath, class: "chart-line chart-line-views" }));
  svg.append(createSvg("path", { d: userPath, class: "chart-line chart-line-users" }));
  dailyViews.forEach((item, index) => {
    const viewsDot = createSvg("circle", { cx: xAt(index), cy: yAt(item.viewCount), r: dailyViews.length > 20 ? 2.4 : 3.2, class: "chart-dot chart-dot-views" });
    const viewsTitle = createSvg("title");
    viewsTitle.textContent = item.date + " · 열람 " + Number(item.viewCount).toLocaleString("ko-KR") + "회";
    viewsDot.append(viewsTitle);
    svg.append(viewsDot);
    const usersDot = createSvg("circle", { cx: xAt(index), cy: yAt(item.uniqueViewerCount), r: dailyViews.length > 20 ? 2.2 : 2.8, class: "chart-dot chart-dot-users" });
    const usersTitle = createSvg("title");
    usersTitle.textContent = item.date + " · 열람 계정 " + Number(item.uniqueViewerCount).toLocaleString("ko-KR") + "개";
    usersDot.append(usersTitle);
    svg.append(usersDot);
  });
  const lastIndex = dailyViews.length - 1;
  const labelIndexes = [...new Set([0, Math.floor(lastIndex / 4), Math.floor(lastIndex / 2), Math.floor((lastIndex * 3) / 4), lastIndex])];
  labelIndexes.forEach((index) => {
    const label = createSvg("text", { x: xAt(index), y: 248, class: "chart-axis-label chart-date-label", "text-anchor": "middle" });
    label.textContent = dailyViews[index].date.slice(5).replace("-", ".");
    svg.append(label);
  });
  container.append(svg);
}

function renderTopics(topics) {
  const list = document.querySelector("#topic-breakdown");
  list.replaceChildren();
  if (!topics.length) {
    renderEmpty(list, "선택 기간의 주제별 열람 기록이 없습니다.");
    return;
  }
  const max = Math.max(...topics.map((item) => item.viewCount));
  topics.forEach((topic, index) => {
    const item = document.createElement("li");
    item.className = "topic-stat-row";
    const heading = document.createElement("div");
    heading.className = "topic-stat-heading";
    const name = document.createElement("span");
    name.textContent = topic.topic;
    const count = document.createElement("strong");
    count.textContent = Number(topic.viewCount).toLocaleString("ko-KR") + "회";
    heading.append(name, count);
    const track = document.createElement("span");
    track.className = "topic-stat-track";
    const bar = document.createElement("span");
    bar.className = "topic-stat-bar";
    bar.style.width = Math.max(2, (topic.viewCount / max) * 100) + "%";
    bar.style.setProperty("--bar-delay", index * 35 + "ms");
    track.append(bar);
    item.append(heading, track);
    list.append(item);
  });
}

function renderTopFaqs(faqs, category) {
  const list = document.querySelector("#top-faqs");
  list.replaceChildren();
  if (!faqs.length) {
    renderEmpty(list, "선택 기간에 열람된 FAQ가 없습니다.");
    return;
  }
  faqs.forEach((faq, index) => {
    const item = document.createElement("li");
    item.className = "top-faq-row";
    const params = new URLSearchParams({ category: category, faq: String(faq.id) });
    if (faq.topic) params.set("topic", faq.topic);
    const link = document.createElement("a");
    link.href = "index.html?" + params;
    const rank = document.createElement("span");
    rank.className = "top-faq-rank";
    rank.textContent = String(index + 1).padStart(2, "0");
    const details = document.createElement("span");
    details.className = "top-faq-details";
    const title = document.createElement("strong");
    title.textContent = faq.title;
    const topic = document.createElement("small");
    topic.textContent = faq.topic + " · FAQ " + faq.id;
    details.append(title, topic);
    const count = document.createElement("b");
    count.textContent = Number(faq.viewCount).toLocaleString("ko-KR") + "회";
    link.append(rank, details, count);
    item.append(link);
    list.append(item);
  });
}

function renderEmpty(container, message) {
  const empty = document.createElement(container.matches("ol, ul") ? "li" : "p");
  empty.className = "stats-empty";
  empty.textContent = message;
  container.append(empty);
}

function setStatus(message, isError, busy = false) {
  const status = document.querySelector("#stats-status");
  status.textContent = message;
  status.classList.toggle("stats-status-error", isError);
  status.classList.toggle("stats-status-busy", busy);
}

function createSvg(name, attributes = {}) {
  const element = document.createElementNS(svgNamespace, name);
  Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, String(value)));
  return element;
}

initialize();
