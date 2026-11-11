/**
 * 초등 2학년 두 자릿수 X 한 자릿수 곱셈 세로셈 연습장 로직
 * - 총 5페이지 (각 9문제 = 45문제)
 * - 세로셈 단계별 구조:
 *     19
 *    X 3
 *   ----
 *     27  (일의 자리 곱 9*3)
 *     30  (십의 자리 곱 10*3)
 *   ----
 *     57  (최종 합)
 */

// 전역 상태
let currentProblems = []; // 5개 페이지 * 9문제 = 45개 문제 객체
let showAnswerMode = false;

// 초기화
document.addEventListener('DOMContentLoaded', () => {
  initApp();
  setupEventListeners();
});

function initApp() {
  generateAllProblems();
  renderWorksheet();
}

/**
 * 45개 문제 생성 (초등학교 2학년 수준)
 * - 두 자릿수 (11 ~ 99)
 * - 한 자릿수 (2 ~ 9)
 */
function generateAllProblems() {
  currentProblems = [];
  const TOTAL_PAGES = 5;
  const PROBLEMS_PER_PAGE = 9;

  for (let page = 1; page <= TOTAL_PAGES; page++) {
    const pageProblems = [];
    for (let i = 1; i <= PROBLEMS_PER_PAGE; i++) {
      // 10~99 사이의 두 자릿수 (단, 10은 너무 쉬우므로 12~98 위주 분포)
      const num1 = Math.floor(Math.random() * 88) + 11; // 11 ~ 98
      // 2~9 사이의 한 자릿수
      const num2 = Math.floor(Math.random() * 8) + 2; // 2 ~ 9

      const tensDigit = Math.floor(num1 / 10);
      const unitsDigit = num1 % 10;

      // 1단계: 일의 자리 곱 (예: 9 * 3 = 27)
      const step1Val = unitsDigit * num2;
      // 2단계: 십의 자리 곱 (예: 10 * 3 = 30)
      const step2Val = tensDigit * 10 * num2;
      // 3단계: 최종 곱 합산 (예: 19 * 3 = 57)
      const totalVal = num1 * num2;

      // 박스별 정답 자릿수 분해
      // 1단계 박스 (2자리: 십의 자리, 일의 자리)
      const step1Str = String(step1Val).padStart(2, '0');
      const step1Tens = step1Str.length > 1 ? step1Str[step1Str.length - 2] : '0';
      const step1Units = step1Str[step1Str.length - 1];

      // 2단계 박스 (2자리: 십의자리 값. 보통 초등 세로셈에서 10*3=30으로 적거나, 십의자리 칸에 3, 일의자리 칸에 0 적음)
      const step2Str = String(step2Val).padStart(2, '0');
      // 백의 자리까지 나오는 경우(예: 80 * 4 = 320) 고려
      let step2Hundreds = '';
      let step2Tens = '';
      let step2Units = '0';
      if (step2Val >= 100) {
        step2Hundreds = String(step2Val)[0];
        step2Tens = String(step2Val)[1];
      } else {
        step2Tens = String(Math.floor(step2Val / 10));
      }

      // 최종합 박스 (최대 3자리: 백의 자리, 십의 자리, 일의 자리)
      const totalStr = String(totalVal);
      let totalHundreds = '';
      let totalTens = '';
      let totalUnits = '';

      if (totalStr.length === 3) {
        totalHundreds = totalStr[0];
        totalTens = totalStr[1];
        totalUnits = totalStr[2];
      } else {
        totalTens = totalStr[0];
        totalUnits = totalStr[1];
      }

      pageProblems.push({
        id: `p${page}_q${i}`,
        pageIndex: page,
        problemIndex: i,
        num1,
        num2,
        tensDigit,
        unitsDigit,
        step1Val,
        step1Tens,
        step1Units,
        step2Val,
        step2Hundreds,
        step2Tens,
        step2Units,
        totalVal,
        totalHundreds,
        totalTens,
        totalUnits
      });
    }
    currentProblems.push(pageProblems);
  }
}

/**
 * 학습지 HTML 렌더링 (5개 페이지 + 1개 답지 페이지)
 */
function renderWorksheet() {
  const container = document.getElementById('worksheet-container');
  if (!container) return;

  let html = '';

  // 1 ~ 5 페이지 렌더링
  currentProblems.forEach((pageProblems, pageIdx) => {
    const pageNum = pageIdx + 1;
    html += `
      <section class="page-sheet" id="page-${pageNum}">
        <div class="sheet-header">
          <div class="sheet-title-box">
            <span class="sheet-badge">🌱 초등 2학년 수학 세로셈 곱셈</span>
            <h2 class="sheet-title">${pageNum}단계 포근포근 곱셈 연습 (${pageNum} / 5)</h2>
          </div>
          <div class="sheet-meta-info">
            <div>날짜: <span class="student-info-field">&nbsp; &nbsp; 월 &nbsp; &nbsp; 일</span></div>
            <div>이름: <span class="student-info-field">&nbsp;</span></div>
            <div>점수: <span class="student-info-field">&nbsp; &nbsp; &nbsp; / 9</span></div>
          </div>
        </div>

        <div class="problems-grid">
          ${pageProblems.map((prob) => renderSingleProblem(prob)).join('')}
        </div>
      </section>
    `;
  });

  // 6번째: 정답지(Answer Key) 페이지 렌더링
  html += renderAnswerSheet();

  container.innerHTML = html;

  // 이벤트 바인딩 (키보드 숫자만 입력 및 다음 칸 자동 포커스 이동)
  bindInputEvents();

  // 정답 보기 상태면 채워넣기
  if (showAnswerMode) {
    fillAllAnswers();
  }
}

/**
 * 개별 문제 세로셈 카드 렌더링
 */
function renderSingleProblem(prob) {
  // 예시 양식:
  //      1 9
  //    X   3
  //    -----
  //      □ □   (일의 자리 곱: 9 * 3 = 27)
  //    □ □ 0   (또는 □ □ : 십의 자리 곱 10 * 3 = 30)
  //    -----
  //    □ □ □   (최종 합)

  // step2 자릿수 표현 (3자리면 □□□, 2자리면  □□)
  const isStep2ThreeDigit = prob.step2Hundreds !== '';
  const isTotalThreeDigit = prob.totalHundreds !== '';

  return `
    <div class="problem-card" id="card-${prob.id}">
      <span class="problem-number">${prob.problemIndex}</span>
      <span class="problem-card-status" id="status-${prob.id}"></span>

      <div class="vertical-calc-table">
        <!-- 첫째 줄: 두 자릿수 -->
        <div class="calc-row">
          <span class="calc-digit">${prob.tensDigit}</span>
          <span class="calc-digit">${prob.unitsDigit}</span>
        </div>

        <!-- 둘째 줄: 연산자 X + 한 자릿수 -->
        <div class="calc-row">
          <span class="calc-operator">×</span>
          <span class="calc-digit">${prob.num2}</span>
        </div>

        <!-- 구분선 1 -->
        <div class="calc-divider"></div>

        <!-- 셋째 줄: 1단계 일의 자리 곱 (예: 9*3=27) -->
        <div class="calc-box-row">
          <input type="text" inputmode="numeric" maxlength="1" class="box-input" 
                 id="${prob.id}_s1_10" data-answer="${prob.step1Tens}" placeholder="□">
          <input type="text" inputmode="numeric" maxlength="1" class="box-input" 
                 id="${prob.id}_s1_1" data-answer="${prob.step1Units}" placeholder="□">
        </div>

        <!-- 넷째 줄: 2단계 십의 자리 곱 (예: 10*3=30) -->
        <div class="calc-box-row">
          ${isStep2ThreeDigit ? `
            <input type="text" inputmode="numeric" maxlength="1" class="box-input" 
                   id="${prob.id}_s2_100" data-answer="${prob.step2Hundreds}" placeholder="□">
          ` : ''}
          <input type="text" inputmode="numeric" maxlength="1" class="box-input" 
                 id="${prob.id}_s2_10" data-answer="${prob.step2Tens}" placeholder="□">
          <input type="text" inputmode="numeric" maxlength="1" class="box-input" 
                 id="${prob.id}_s2_1" data-answer="${prob.step2Units}" placeholder="□">
        </div>

        <!-- 구분선 2 -->
        <div class="calc-divider"></div>

        <!-- 다섯째 줄: 최종 곱 합산 -->
        <div class="calc-box-row">
          ${isTotalThreeDigit ? `
            <input type="text" inputmode="numeric" maxlength="1" class="box-input" 
                   id="${prob.id}_tot_100" data-answer="${prob.totalHundreds}" placeholder="□">
          ` : `
            <span class="box-spacer"></span>
          `}
          <input type="text" inputmode="numeric" maxlength="1" class="box-input" 
                 id="${prob.id}_tot_10" data-answer="${prob.totalTens}" placeholder="□">
          <input type="text" inputmode="numeric" maxlength="1" class="box-input" 
                 id="${prob.id}_tot_1" data-answer="${prob.totalUnits}" placeholder="□">
        </div>
      </div>
      <div class="step-hint">(${prob.unitsDigit}×${prob.num2} / ${prob.tensDigit}0×${prob.num2})</div>
    </div>
  `;
}

/**
 * 6번째 정답지 페이지 렌더링
 */
function renderAnswerSheet() {
  return `
    <section class="page-sheet answer-page-sheet" id="page-answer">
      <div class="sheet-header">
        <div class="sheet-title-box">
          <span class="sheet-badge" style="background:#FFF0F5; color:#C85075; border-color:#FFCAD4;">📝 한눈에 보는 빠른 정답</span>
          <h2 class="sheet-title">정답표 (Answer Key)</h2>
        </div>
        <div class="sheet-meta-info">
          <div>전체 5페이지 45문제 완성본</div>
        </div>
      </div>

      <div class="answer-grid-container">
        ${currentProblems.map((pageProblems, pageIdx) => `
          <div class="answer-page-col">
            <div class="answer-page-title">${pageIdx + 1}쪽 정답</div>
            <div class="answer-item-list">
              ${pageProblems.map((p) => `
                <div class="answer-item">
                  <span class="answer-item-num">[${p.problemIndex}번]</span>
                  <span class="answer-item-val">${p.num1} × ${p.num2} = <strong>${p.totalVal}</strong></span>
                </div>
              `).join('')}
            </div>
          </div>
        `).join('')}
      </div>
    </section>
  `;
}

/**
 * 입력창 이벤트 처리 (키보드 입력, 자동 포커스 이동, 숫자 제약)
 */
function bindInputEvents() {
  const inputs = Array.from(document.querySelectorAll('.box-input'));

  inputs.forEach((input, index) => {
    // 숫자 이외의 문자 방지 및 자동 다음 칸 이동
    input.addEventListener('input', (e) => {
      const val = e.target.value.replace(/[^0-9]/g, '');
      e.target.value = val;

      if (val.length === 1 && index < inputs.length - 1) {
        inputs[index + 1].focus();
      }
    });

    // 백스페이스 시 이전 칸으로 이동
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !input.value && index > 0) {
        inputs[index - 1].focus();
      }
    });
  });
}

/**
 * 채점하기 기능
 */
function checkAnswers() {
  let totalBoxes = 0;
  let correctBoxes = 0;
  let correctProblems = 0;
  let totalProblems = 0;

  currentProblems.forEach((pageProblems) => {
    pageProblems.forEach((prob) => {
      totalProblems++;
      let problemCorrect = true;

      // 해당 문제의 모든 input 찾기
      const probCard = document.getElementById(`card-${prob.id}`);
      if (!probCard) return;

      const inputs = probCard.querySelectorAll('.box-input');
      inputs.forEach((input) => {
        totalBoxes++;
        const userVal = input.value.trim();
        const expectedVal = input.getAttribute('data-answer');

        if (userVal === expectedVal) {
          input.classList.add('correct');
          input.classList.remove('wrong');
          correctBoxes++;
        } else {
          input.classList.add('wrong');
          input.classList.remove('correct');
          problemCorrect = false;
        }
      });

      const statusBadge = document.getElementById(`status-${prob.id}`);
      if (statusBadge) {
        if (problemCorrect) {
          statusBadge.innerHTML = '⭐';
          statusBadge.title = '정답입니다!';
          correctProblems++;
        } else {
          statusBadge.innerHTML = '✏️';
          statusBadge.title = '다시 한 번 계산해봐요';
        }
      }
    });
  });

  // 점수 배너 표시
  const banner = document.getElementById('score-banner');
  const scoreText = document.getElementById('score-text');
  if (banner && scoreText) {
    banner.classList.remove('hidden');
    if (correctProblems === totalProblems) {
      scoreText.innerHTML = `🎉 대단해요! 45문제 모두 완벽하게 맞혔어요! 참 잘했어요 스티커 획득! 🌸`;
    } else {
      scoreText.innerHTML = `👏 45문제 중 <strong>${correctProblems}문제</strong>를 맞혔어요! 틀린 부분을 다시 확인해보세요.`;
    }
  }
}

/**
 * 정답 토글 기능
 */
function toggleAnswerView() {
  showAnswerMode = !showAnswerMode;
  const toggleBtnText = document.getElementById('answer-toggle-text');
  
  if (showAnswerMode) {
    if (toggleBtnText) toggleBtnText.textContent = '정답 가리기';
    fillAllAnswers();
  } else {
    if (toggleBtnText) toggleBtnText.textContent = '정답 보기';
    clearAllInputs();
  }
}

/**
 * 모든 박스에 정답 채워넣기
 */
function fillAllAnswers() {
  const inputs = document.querySelectorAll('.box-input');
  inputs.forEach((input) => {
    const expected = input.getAttribute('data-answer');
    if (expected !== null) {
      input.value = expected;
      input.classList.remove('wrong');
      input.classList.add('correct');
    }
  });

  // 상태 배지 별표로 채우기
  currentProblems.forEach((page) => {
    page.forEach((prob) => {
      const statusBadge = document.getElementById(`status-${prob.id}`);
      if (statusBadge) statusBadge.innerHTML = '⭐';
    });
  });
}

/**
 * 모든 입력값 초기화
 */
function clearAllInputs() {
  const inputs = document.querySelectorAll('.box-input');
  inputs.forEach((input) => {
    input.value = '';
    input.classList.remove('correct', 'wrong');
  });

  currentProblems.forEach((page) => {
    page.forEach((prob) => {
      const statusBadge = document.getElementById(`status-${prob.id}`);
      if (statusBadge) statusBadge.innerHTML = '';
    });
  });

  const banner = document.getElementById('score-banner');
  if (banner) banner.classList.add('hidden');
}

/**
 * 이벤트 리스너 등록
 */
function setupEventListeners() {
  // 새 문제 만들기
  const btnGen = document.getElementById('btn-generate');
  if (btnGen) {
    btnGen.addEventListener('click', () => {
      showAnswerMode = false;
      const toggleBtnText = document.getElementById('answer-toggle-text');
      if (toggleBtnText) toggleBtnText.textContent = '정답 보기';
      const banner = document.getElementById('score-banner');
      if (banner) banner.classList.add('hidden');

      generateAllProblems();
      renderWorksheet();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // 채점하기
  const btnCheck = document.getElementById('btn-check');
  if (btnCheck) {
    btnCheck.addEventListener('click', checkAnswers);
  }

  // 정답 보기/가리기 토글
  const btnToggle = document.getElementById('btn-toggle-answer');
  if (btnToggle) {
    btnToggle.addEventListener('click', toggleAnswerView);
  }

  // 다시 풀기
  const btnClear = document.getElementById('btn-clear');
  if (btnClear) {
    btnClear.addEventListener('click', clearAllInputs);
  }

  // A4 인쇄
  const btnPrint = document.getElementById('btn-print');
  if (btnPrint) {
    btnPrint.addEventListener('click', () => {
      window.print();
    });
  }

  // 배너 닫기
  const btnClose = document.getElementById('btn-close-banner');
  if (btnClose) {
    btnClose.addEventListener('click', () => {
      const banner = document.getElementById('score-banner');
      if (banner) banner.classList.add('hidden');
    });
  }
}
