/* FAQ 문자열 정규화, 필터링, 검색 순위를 계산합니다. */
const normalizeText = (value) => String(value ?? "")
  .normalize("NFC")
  .trim()
  .replace(/\s+/g, " ")
  .toLocaleLowerCase("ko-KR");

const compactText = (value) => normalizeText(value).replace(/[\s\p{P}\p{S}]/gu, "");

const wordsFrom = (value) => normalizeText(value).split(" ").filter(Boolean);

/** FAQ 1건의 우선순위 점수를 반환하고, 일치하지 않으면 -1을 반환합니다. */
function scoreFaq(faq, query) {
  const normalizedQuery = normalizeText(query);
  if (!normalizedQuery) return 0;

  const title = normalizeText(faq.title);
  const answer = normalizeText(faq.answerText ?? faq.answer);
  const keywords = normalizeText((faq.keywords ?? []).join(" "));
  const id = normalizeText(faq.id);
  const searchable = `${title} ${answer} ${keywords}`;

  if (id === normalizedQuery) return 600;
  if (title === normalizedQuery) return 500;
  if (title.includes(normalizedQuery)) return 400;

  const terms = wordsFrom(normalizedQuery);
  const fields = [title, keywords, answer];
  const allTermsMatch = terms.every((term) => {
    const compactTerm = compactText(term);
    return searchable.includes(term) || compactText(searchable).includes(compactTerm);
  });
  if (!allTermsMatch) return -1;

  const titleMatches = terms.filter((term) => title.includes(term) || compactText(title).includes(compactText(term))).length;
  const keywordMatches = terms.filter((term) => keywords.includes(term) || compactText(keywords).includes(compactText(term))).length;
  const answerMatches = terms.filter((term) => answer.includes(term) || compactText(answer).includes(compactText(term))).length;

  if (titleMatches === terms.length) return 300 + titleMatches * 3;
  if (titleMatches || keywordMatches) return 200 + titleMatches * 8 + keywordMatches * 3;
  if (answerMatches) return 100 + answerMatches;
  return -1;
}

/** 선택한 필터와 검색어에 맞는 FAQ를 우선순위 및 ID 최신순으로 반환합니다. */
export function searchFaqs(faqs, { query = "", category = "", topic = "" } = {}) {
  return faqs
    .filter((faq) => (!category || faq.category === category) && (!topic || faq.topic === topic))
    .map((faq) => ({ faq, score: scoreFaq(faq, query) }))
    .filter(({ score }) => score >= 0)
    .sort((left, right) => right.score - left.score || compareIdsNewestFirst(left.faq.id, right.faq.id))
    .map(({ faq }) => faq);
}

function compareIdsNewestFirst(leftId = "", rightId = "") {
  const parse = (id) => {
    const match = /^(\d+)-(\d{6})$/.exec(id);
    return match ? { date: match[2], sequence: Number(match[1]) } : { date: "", sequence: 0 };
  };
  const left = parse(leftId);
  const right = parse(rightId);
  return right.date.localeCompare(left.date) || right.sequence - left.sequence || String(rightId).localeCompare(String(leftId));
}
