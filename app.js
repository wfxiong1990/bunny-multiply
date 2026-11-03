(() => {
  const byId = (name) => document.getElementById(name);
  const home = byId('home-screen');
  const quiz = byId('quiz-screen');
  const result = byId('result-screen');
  const answer = byId('answer');
  const feedback = byId('feedback');
  const checkButton = byId('check-button');
  const hint = byId('hint');
  let questionCount = 15;
  let questions = [];
  let currentIndex = 0;
  let firstTryCount = 0;
  let wrongAttempts = 0;
  let transitioning = false;
  let nextTimer = null;

  function showScreen(activeScreen) {
    [home, quiz, result].forEach((screen) => { screen.hidden = screen !== activeScreen; });
  }

  function buildQuestions(count) {
    const allQuestions = [];
    for (let first = 1; first <= 9; first += 1) {
      for (let second = 1; second <= 9; second += 1) allQuestions.push({ first, second });
    }
    for (let index = allQuestions.length - 1; index > 0; index -= 1) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [allQuestions[index], allQuestions[randomIndex]] = [allQuestions[randomIndex], allQuestions[index]];
    }
    return allQuestions.slice(0, count);
  }

  function updateAnswerState() {
    answer.value = answer.value.replace(/\D/g, '').slice(0, 2);
    checkButton.disabled = transitioning || answer.value.length === 0;
  }

  function showQuestion() {
    const question = questions[currentIndex];
    const percent = Math.round((currentIndex / questions.length) * 100);
    byId('factor-one').textContent = question.first;
    byId('factor-two').textContent = question.second;
    byId('counter').textContent = '第 ' + (currentIndex + 1) + ' / ' + questions.length + ' 题';
    byId('progress').setAttribute('aria-valuenow', percent);
    byId('progress-fill').style.width = percent + '%';
    answer.value = '';
    answer.disabled = false;
    hint.textContent = '';
    feedback.textContent = '输入答案，再按检查';
    feedback.className = 'feedback';
    wrongAttempts = 0;
    transitioning = false;
    updateAnswerState();
    if (window.matchMedia('(pointer: fine)').matches) answer.focus({ preventScroll: true });
  }

  function startGame() {
    clearTimeout(nextTimer);
    questions = buildQuestions(questionCount);
    currentIndex = 0;
    firstTryCount = 0;
    showScreen(quiz);
    showQuestion();
  }

  function finishGame() {
    byId('finished-count').textContent = questions.length;
    byId('first-try-count').textContent = firstTryCount + ' / ' + questions.length;
    byId('result-message').textContent = firstTryCount === questions.length ? '全部一次答对，你是乘法小达人！' : '每一次认真思考，都是了不起的进步。';
    showScreen(result);
    byId('again-button').focus({ preventScroll: true });
  }

  function checkAnswer() {
    if (transitioning || !answer.value) return;
    const question = questions[currentIndex];
    if (Number(answer.value) === question.first * question.second) {
      if (wrongAttempts === 0) firstTryCount += 1;
      transitioning = true;
      answer.disabled = true;
      checkButton.disabled = true;
      feedback.textContent = '答对啦！小兔给你一颗星 ✨';
      feedback.className = 'feedback good';
      nextTimer = setTimeout(() => {
        currentIndex += 1;
        if (currentIndex === questions.length) finishGame();
        else showQuestion();
      }, 800);
    } else {
      wrongAttempts += 1;
      feedback.textContent = '再想一想，你可以的！';
      feedback.className = 'feedback retry';
      answer.value = '';
      updateAnswerState();
      if (window.matchMedia('(pointer: fine)').matches) answer.focus({ preventScroll: true });
    }
  }

  document.querySelectorAll('[data-count]').forEach((button) => {
    button.addEventListener('click', () => {
      questionCount = Number(button.dataset.count);
      document.querySelectorAll('[data-count]').forEach((choice) => choice.setAttribute('aria-pressed', String(choice === button)));
    });
  });
  document.querySelectorAll('[data-key]').forEach((button) => {
    button.addEventListener('click', () => {
      if (transitioning) return;
      const key = button.dataset.key;
      if (key === 'clear') answer.value = '';
      else if (key === 'back') answer.value = answer.value.slice(0, -1);
      else if (answer.value.length < 2) answer.value += key;
      updateAnswerState();
      if (window.matchMedia('(pointer: fine)').matches) answer.focus({ preventScroll: true });
    });
  });
  answer.addEventListener('input', updateAnswerState);
  answer.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') { event.preventDefault(); checkAnswer(); }
  });
  byId('start-button').addEventListener('click', startGame);
  byId('again-button').addEventListener('click', startGame);
  byId('check-button').addEventListener('click', checkAnswer);
  byId('hint-button').addEventListener('click', () => {
    const question = questions[currentIndex];
    hint.textContent = question.first + ' × ' + question.second + '，就是把 ' + question.first + ' 加 ' + question.second + ' 次：' + Array(question.second).fill(question.first).join(' + ') + '。';
  });
  byId('exit-button').addEventListener('click', () => {
    if (!window.confirm('要结束这次练习吗？当前进度不会保存。')) return;
    clearTimeout(nextTimer);
    showScreen(home);
    byId('start-button').focus({ preventScroll: true });
  });
  byId('home-button').addEventListener('click', () => {
    showScreen(home);
    byId('start-button').focus({ preventScroll: true });
  });
})();
