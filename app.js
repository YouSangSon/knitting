import { PATTERNS, BASICS } from "./patterns.js";

// 링크 목록(영상 등) HTML 만들기
function linkList(items, mark) {
  return items
    .map(
      (v) =>
        `<li><a href="${esc(v.url)}" target="_blank" rel="noopener noreferrer">${mark}${esc(v.title || v.name)}</a></li>`,
    )
    .join("");
}

const app = document.getElementById("app");
const byId = (id) => PATTERNS.find((p) => p.id === id);

// --- 단 카운터 저장 (폰 브라우저 안에만, 도안별 현재 단) ---
const keyOf = (id) => `knit:round:${id}`;

function getRound(id) {
  const n = Number(localStorage.getItem(keyOf(id)));
  return Number.isInteger(n) && n >= 1 ? n : 1;
}

function setRound(id, n, max) {
  const clamped = Math.min(Math.max(1, n), max);
  localStorage.setItem(keyOf(id), String(clamped));
  return clamped;
}

// --- HTML 이스케이프 (도안 데이터는 내가 쓴 정적 텍스트지만 습관적으로 안전하게) ---
function esc(s) {
  return String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
}

// --- 목록 화면 ---
function renderList() {
  document.title = "아기 뜨개 도안";
  const cards = PATTERNS.map(
    (p) => `
      <a class="card" href="#/hat/${esc(p.id)}">
        <span class="card-emoji" aria-hidden="true">${esc(p.emoji)}</span>
        <span class="card-body">
          <span class="card-title">${esc(p.title)}</span>
          <span class="card-meta">${esc(p.difficulty)} · ${esc(p.sizeLabel)} · ${esc(p.time)}</span>
          <span class="card-summary">${esc(p.summary)}</span>
        </span>
        <span class="card-chevron" aria-hidden="true">›</span>
      </a>`,
  ).join("");

  app.innerHTML = `
    <p class="eyebrow">6–12개월 아기 코바늘 모자</p>
    <h1>어떤 모자를 떠볼까요?</h1>
    <p class="lead">도안을 열면 큰 글씨로 보이고, 지금 뜨는 단을 탭으로 세요. 앱을 닫아도 그 단에서 다시 시작해요.</p>
    <div class="card-list">${cards}</div>
    <section class="block basics">
      <h2>처음이라면, 기초 영상부터 ▶</h2>
      <p class="note">글·그림만으론 손 모양을 알기 어려워요. 아래 영상으로 기본 손놀림을 먼저 익히면 도안이 훨씬 쉬워요. (탭하면 유튜브가 열려요)</p>
      <ul class="linklist">${linkList(BASICS, "▶ ")}</ul>
    </section>
    <p class="footnote">코바늘 5.0mm · 중세사 기준. 도안은 공개 무료 도안으로 기법을 확인해 새로 쓴 설명이며, 각 도안 아래 출처를 링크했어요.</p>
  `;
}

// --- 도안 화면 ---
function renderPattern(id) {
  const p = byId(id);
  if (!p) return renderList();
  document.title = `${p.title} · 아기 뜨개`;

  const max = p.rounds.length;
  let current = getRound(id);
  if (current > max) current = setRound(id, max, max);

  const abbr = p.abbr
    .map(([term, desc]) => `<div class="abbr-row"><dt>${esc(term)}</dt><dd>${esc(desc)}</dd></div>`)
    .join("");

  const materials = p.materials.map((m) => `<li>${esc(m)}</li>`).join("");
  const videoLinks = linkList([...(p.videos || []), ...BASICS], "▶ ");

  const rounds = p.rounds
    .map(
      (rd, i) => `
      <li class="round" data-round="${i + 1}" aria-current="${i + 1 === current ? "step" : "false"}">
        <button class="round-hit" type="button" data-goto="${i + 1}">
          <span class="round-label">${esc(rd.r)}</span>
          <span class="round-text">${esc(rd.t)}</span>
          <span class="round-count">${esc(rd.c)}</span>
        </button>
      </li>`,
    )
    .join("");

  const extras = (p.afterRounds || [])
    .map(
      (sec) => `
      <section class="block">
        <h2>${esc(sec.title)}</h2>
        <ol class="steps">${sec.steps.map((s) => `<li>${esc(s)}</li>`).join("")}</ol>
      </section>`,
    )
    .join("");

  const sources = p.sources
    .map((s) => `<li><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.name)}</a></li>`)
    .join("");

  app.innerHTML = `
    <a class="back" href="#/">‹ 도안 목록</a>
    <p class="eyebrow">${esc(p.difficulty)} · ${esc(p.sizeLabel)} · ${esc(p.time)}</p>
    <h1>${esc(p.emoji)} ${esc(p.title)}</h1>
    <p class="lead">${esc(p.summary)}</p>

    <section class="block basics">
      <h2>영상으로 배우기 ▶</h2>
      <ul class="linklist">${videoLinks}</ul>
      <p class="note">손 모양은 영상으로, 순서·단수는 아래 도안으로 보면 편해요. (탭하면 유튜브가 열려요)</p>
    </section>

    <section class="block">
      <h2>재료</h2>
      <ul class="bullets">${materials}</ul>
    </section>

    <section class="block">
      <h2>게이지</h2>
      <p>${esc(p.gauge)}</p>
    </section>

    <section class="block">
      <h2>약어</h2>
      <dl class="abbr">${abbr}</dl>
    </section>

    <section class="block">
      <h2>뜨는 법</h2>
      <p class="note">${esc(p.howNote)}</p>
      <ol class="rounds" id="rounds">${rounds}</ol>
    </section>

    ${extras}

    <section class="block">
      <h2>마무리</h2>
      <p>${esc(p.finishing)}</p>
    </section>

    <section class="block tip">
      <h2>사이즈 조절</h2>
      <p>${esc(p.sizeTip)}</p>
    </section>

    <section class="block">
      <h2>완성 사진 (원문 도안)</h2>
      <p class="note">완성된 모자 사진을 볼 수 있어요. 원문 글은 영어라, 만드는 법은 위 "영상으로 배우기"를 보시는 게 편해요.</p>
      <ul class="sources">${sources}</ul>
    </section>

    <div class="counter" role="group" aria-label="단 카운터">
      <button class="counter-btn" type="button" id="minus" aria-label="한 단 뒤로">−</button>
      <button class="counter-face" type="button" id="face">
        <span class="counter-label">지금 뜨는 단</span>
        <span class="counter-num" id="num" aria-live="polite">${current}<span class="counter-max"> / ${max}단</span></span>
      </button>
      <button class="counter-btn" type="button" id="plus" aria-label="한 단 앞으로">＋</button>
    </div>
  `;

  // 현재 단으로 화면 강조 이동
  const paint = () => {
    app.querySelectorAll(".round").forEach((el) => {
      const on = Number(el.dataset.round) === current;
      el.setAttribute("aria-current", on ? "step" : "false");
      el.classList.toggle("is-current", on);
    });
    document.getElementById("num").innerHTML = `${current}<span class="counter-max"> / ${max}단</span>`;
  };

  const move = (n, scroll) => {
    current = setRound(id, n, max);
    paint();
    if (scroll) {
      const el = app.querySelector(`.round[data-round="${current}"]`);
      if (el) el.scrollIntoView({ block: "center", behavior: "smooth" });
    }
  };

  document.getElementById("minus").addEventListener("click", () => move(current - 1, true));
  document.getElementById("plus").addEventListener("click", () => move(current + 1, true));
  document.getElementById("face").addEventListener("click", () => move(current + 1, true));
  app.querySelectorAll("[data-goto]").forEach((b) =>
    b.addEventListener("click", () => move(Number(b.dataset.goto), false)),
  );

  paint();
}

// --- 해시 라우터 ---
function route() {
  const m = location.hash.match(/^#\/hat\/([\w-]+)$/);
  if (m) renderPattern(m[1]);
  else renderList();
  app.focus();
  if (!location.hash.startsWith("#/hat/")) window.scrollTo(0, 0);
}

window.addEventListener("hashchange", route);
route();

// --- 오프라인용 서비스 워커 등록 ---
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(() => {}));
}
