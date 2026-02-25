/* ═══════════════════════════════════════════
   세아 똑똑해지는 중 — common.js
   ═══════════════════════════════════════════ */

/* ── Utils ── */

function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function renderDifficulty(level) {
  let html = '';
  for (let i = 1; i <= 3; i++) {
    html += i <= level
      ? '<span class="star-filled">★</span>'
      : '<span>★</span>';
  }
  return html;
}

const categoryLabels = {
  math: '수학',
  music: '음악',
  korean: '국어'
};

const categoryIcons = {
  math: '🔢',
  music: '🎵',
  korean: '✏️'
};

function getCategoryTheme(category) {
  const themes = {
    math:    { color: '#FFC107', bg: '#FFF8E1', dark: '#F57F17', label: '수학' },
    music:   { color: '#4CAF50', bg: '#E8F5E9', dark: '#2E7D32', label: '음악' },
    korean:  { color: '#E91E63', bg: '#FCE4EC', dark: '#C2185B', label: '국어' }
  };
  return themes[category] || themes.math;
}

/* ── TopicLoader (메인 페이지) ── */

async function loadTopics(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  try {
    const res = await fetch('data/topics.json');
    const data = await res.json();
    const topics = data.topics;

    container.innerHTML = '';
    topics.forEach(topic => {
      container.appendChild(createTopicCard(topic));
    });
  } catch (e) {
    container.innerHTML = '<p style="text-align:center;color:#999;padding:40px;">주제를 불러오는 중 오류가 발생했어요.</p>';
  }
}

function createTopicCard(topic) {
  const card = document.createElement('a');
  card.className = 'topic-card';
  card.href = topic.page;
  card.dataset.category = topic.category;

  card.innerHTML = `
    <div class="card-category-bar ${topic.category}"></div>
    <div class="card-icon">${topic.icon}</div>
    <span class="card-badge ${topic.category}">${categoryLabels[topic.category] || topic.category}</span>
    <div class="card-title">${topic.title}</div>
    <div class="card-concept">${topic.concept}</div>
    <div class="card-story">"${topic.story}"</div>
    <div class="card-difficulty">${renderDifficulty(topic.difficulty)}</div>
  `;

  return card;
}

/* ── CategoryFilter (메인 페이지) ── */

function initCategoryFilter(filterBarId, gridId) {
  const filterBar = document.getElementById(filterBarId);
  const grid = document.getElementById(gridId);
  if (!filterBar || !grid) return;

  filterBar.addEventListener('click', (e) => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;

    filterBar.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const cat = btn.dataset.cat;
    grid.querySelectorAll('.topic-card').forEach(card => {
      if (cat === 'all') {
        card.style.display = '';
      } else {
        card.style.display = card.dataset.category === cat ? '' : 'none';
      }
    });
  });
}

/* ── FeedbackManager (상세 페이지) ── */

let _pageProblems = [];
let _pageConfig = {};
let _answeredCount = 0;

function initPractice(config) {
  _pageConfig = config;
  _pageProblems = [...config.problems];
  _answeredCount = 0;
  renderProblems();
}

function renderProblems() {
  const container = document.getElementById('problems-container');
  if (!container) return;

  container.innerHTML = '';
  _pageProblems.forEach((p, i) => {
    const card = document.createElement('div');
    card.className = 'problem-card';
    card.dataset.index = i;
    card.dataset.answer = String(p.answer);

    if (p.type === 'choice') {
      const choicesHTML = p.choices.map((c, ci) =>
        `<button class="choice-btn" data-value="${c}" onclick="selectChoice(this)">${c}</button>`
      ).join('');
      card.innerHTML = `
        <div class="problem-number">문제 ${i + 1}</div>
        <div class="problem-question">${p.question}</div>
        <div class="choice-grid">${choicesHTML}</div>
      `;
    } else {
      card.innerHTML = `
        <div class="problem-number">문제 ${i + 1}</div>
        <div class="problem-question">${p.question}</div>
        <div class="problem-input-row">
          <input type="text" class="problem-input" placeholder="?" inputmode="numeric">
        </div>
      `;
    }
    container.appendChild(card);
  });

  updateProgress(0);

  const resultSection = document.getElementById('result-section');
  if (resultSection) resultSection.style.display = 'none';
  const retryButtons = document.getElementById('retry-buttons');
  if (retryButtons) retryButtons.style.display = 'none';
  const submitBtn = document.getElementById('submit-btn');
  if (submitBtn) submitBtn.style.display = '';
}

function selectChoice(btn) {
  const grid = btn.closest('.choice-grid');
  grid.querySelectorAll('.choice-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
}

function updateProgress(answered) {
  const total = _pageProblems.length;
  const fill = document.getElementById('progress-fill');
  const label = document.getElementById('progress-count');
  if (fill) fill.style.width = `${(answered / total) * 100}%`;
  if (label) label.textContent = `${answered} / ${total}`;
}

function checkAllAnswers() {
  const container = document.getElementById('problems-container');
  const cards = container.querySelectorAll('.problem-card');
  const results = [];
  let correctCount = 0;

  cards.forEach((card, i) => {
    const problem = _pageProblems[i];
    let userAnswer;

    if (problem.type === 'choice') {
      const selected = card.querySelector('.choice-btn.selected');
      userAnswer = selected ? selected.dataset.value : '';
    } else {
      const input = card.querySelector('.problem-input');
      userAnswer = input.value.trim();
    }

    const isCorrect = String(userAnswer) === String(problem.answer);
    if (isCorrect) correctCount++;

    results.push({ correct: isCorrect, userAnswer, correctAnswer: problem.answer, index: i });

    // 개별 피드백 표시
    const existingFeedback = card.querySelector('.feedback-correct, .feedback-wrong');
    if (existingFeedback) existingFeedback.remove();

    if (problem.type === 'choice') {
      card.querySelectorAll('.choice-btn').forEach(btn => {
        btn.disabled = true;
        if (btn.dataset.value === String(problem.answer)) {
          btn.classList.add('correct');
        } else if (btn.classList.contains('selected') && !isCorrect) {
          btn.classList.add('wrong');
        }
      });
    } else {
      const input = card.querySelector('.problem-input');
      input.readOnly = true;
      input.classList.add(isCorrect ? 'correct' : 'wrong');
    }

    const feedbackDiv = document.createElement('div');
    if (isCorrect) {
      feedbackDiv.className = 'feedback-correct';
      feedbackDiv.textContent = `✅ ${problem.correctMsg}`;
    } else {
      feedbackDiv.className = 'feedback-wrong';
      feedbackDiv.innerHTML = `❌ ${problem.wrongMsg} <span class="answer">정답: ${problem.answer}</span>`;
    }
    card.appendChild(feedbackDiv);
  });

  updateProgress(_pageProblems.length);
  showResults(correctCount, results);
}

function showResults(correctCount, results) {
  const total = _pageProblems.length;
  const config = _pageConfig;
  const resultSection = document.getElementById('result-section');
  const retryButtons = document.getElementById('retry-buttons');
  const submitBtn = document.getElementById('submit-btn');

  if (submitBtn) submitBtn.style.display = 'none';

  const isGood = correctCount >= Math.ceil(total * 0.6);
  let message;
  if (correctCount === total) {
    message = config.resultMessages.excellent;
  } else if (isGood) {
    message = config.resultMessages.good;
  } else {
    message = config.resultMessages.retry;
  }

  if (resultSection) {
    resultSection.style.display = '';
    resultSection.innerHTML = `
      <div class="section-card result-card">
        <div class="section-label">결과</div>
        <div class="result-character">${config.character}</div>
        <div class="result-score" ${!isGood ? 'style="color:var(--primary)"' : ''}>${correctCount} <span>/ ${total}</span></div>
        <div class="result-message ${!isGood ? 'retry' : ''}">${message}</div>
        <div class="result-detail">
          ${results.map((r, i) => {
            const p = _pageProblems[i];
            if (r.correct) {
              return `<div class="feedback-correct">✅ 문제 ${i+1}: ${p.question.replace(' = ?', '')} = ${p.answer}</div>`;
            } else {
              return `<div class="feedback-wrong"><div>❌ 문제 ${i+1}: ${p.question.replace(' = ?', '')} → <span class="answer">정답: ${p.answer}</span><br><span style="font-size:13px;color:#999;">${config.character} "${p.wrongMsg}"</span></div></div>`;
            }
          }).join('')}
        </div>
      </div>
    `;
    resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  if (retryButtons) {
    retryButtons.style.display = 'flex';
  }
}

function resetPractice(doShuffle) {
  if (doShuffle) {
    _pageProblems = shuffle(_pageProblems);
  }
  _answeredCount = 0;
  renderProblems();
  const practiceSection = document.getElementById('practice-section');
  if (practiceSection) {
    practiceSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function scrollToConcept() {
  const concept = document.getElementById('concept-section');
  if (concept) concept.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
