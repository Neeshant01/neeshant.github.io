(() => {
  const root = document.getElementById("game-root");
  const questions = [
    { category: "HTML", difficulty: 1, prompt: "Which element is best for the most important heading on a page?", options: ["<h1>", "<title>", "<header>", "<p>"], answer: 0 },
    { category: "CSS", difficulty: 1, prompt: "Which property changes text color?", options: ["font-color", "text-style", "color", "foreground"], answer: 2 },
    { category: "JS", difficulty: 1, prompt: "What does `===` check?", options: ["Only value", "Only type", "Value and type", "Assignment"], answer: 2 },
    { category: "Python", difficulty: 1, prompt: "Which keyword defines a function in Python?", options: ["func", "def", "lambda", "define"], answer: 1 },
    { category: "Logic", difficulty: 1, prompt: "What comes next: 2, 4, 8, 16, ?", options: ["18", "24", "32", "20"], answer: 2 },
    { category: "HTML", difficulty: 2, prompt: "Which attribute links a label to an input?", options: ["name", "for", "target", "bind"], answer: 1 },
    { category: "CSS", difficulty: 2, prompt: "What does `display: grid` enable?", options: ["Flex wrapping", "Table layout", "Grid-based layout", "Absolute positioning"], answer: 2 },
    { category: "JS", difficulty: 2, prompt: "What does `Array.map()` return?", options: ["A new transformed array", "A boolean", "The first item", "Nothing"], answer: 0 },
    { category: "Python", difficulty: 2, prompt: "What does `len()` return?", options: ["Variable type", "Item value", "Number of items", "Loop count"], answer: 2 },
    { category: "Logic", difficulty: 2, prompt: "If all coders are builders and Nishant is a coder, Nishant is a ...", options: ["designer", "builder", "tester", "server"], answer: 1 },
    { category: "HTML", difficulty: 3, prompt: "Which element is best for navigation links?", options: ["<nav>", "<menuitem>", "<links>", "<section>"], answer: 0 },
    { category: "CSS", difficulty: 3, prompt: "Which selector has the highest specificity?", options: ["Element selector", "Class selector", "ID selector", "Universal selector"], answer: 2 },
    { category: "JS", difficulty: 3, prompt: "What is returned by `document.querySelectorAll()`?", options: ["An array", "A NodeList", "An object literal", "A map"], answer: 1 },
    { category: "Python", difficulty: 3, prompt: "What does `list(range(3))` produce?", options: ["[1, 2, 3]", "[0, 1, 2]", "[0, 1, 2, 3]", "[3]"], answer: 1 },
    { category: "Logic", difficulty: 3, prompt: "What is the time complexity of binary search?", options: ["O(n)", "O(log n)", "O(n log n)", "O(1)"], answer: 1 }
  ];

  const shell = new Arcade.GameShell({
    gameId: "codequiz-blitz",
    hud: [
      { id: "score", label: "Score", value: "0" },
      { id: "time", label: "Time", value: "60" },
      { id: "streak", label: "Streak", value: "0" },
      { id: "category", label: "Category", value: "Mixed" }
    ],
    board: {
      id: "main",
      title: "Top 10 Blitz Scores",
      compare: (a, b) => (b.score - a.score) || (b.streak - a.streak),
      renderEntry: (entry, index, escapeHtml) => `
        <div class="board-row">
          <span class="board-rank">#${index + 1}</span>
          <span class="board-name">${escapeHtml(entry.name)}</span>
          <span class="board-score">${entry.score}</span>
          <span class="board-meta">Streak ${entry.streak} · ${entry.correct} correct</span>
        </div>
      `,
      summarize: (entry) => `Score ${entry.score} · Streak ${entry.streak} by ${entry.name}`
    },
    noteTitle: "Blitz Notes",
    noteBody: "Right answers build streak. Wrong answers cut the clock. Harder questions appear when you're on form.",
    onStart: startGame,
    onRestart: restartGame
  });

  let active = false;
  let rafId = 0;
  let lastTime = 0;
  let timeLeft = 60;
  let score = 0;
  let streak = 0;
  let bestStreak = 0;
  let correct = 0;
  let answered = 0;
  let currentQuestion = null;

  function chooseQuestion() {
    const targetDifficulty = streak >= 6 ? 3 : streak >= 3 ? 2 : 1;
    const pool = questions.filter((question) => question.difficulty <= targetDifficulty + 1);
    currentQuestion = pool[Math.floor(Math.random() * pool.length)];
    render();
  }

  function answerQuestion(index) {
    if (!active || !currentQuestion) {
      return;
    }

    answered += 1;
    const correctAnswer = index === currentQuestion.answer;
    if (correctAnswer) {
      correct += 1;
      streak += 1;
      bestStreak = Math.max(bestStreak, streak);
      score += 120 + streak * 18;
      timeLeft = Math.min(60, timeLeft + 1.2);
      shell.audio.cue("success");
      shell.setStatus("Correct. Keep the streak alive.");
    } else {
      streak = 0;
      timeLeft = Math.max(0, timeLeft - 5);
      score = Math.max(0, score - 40);
      shell.audio.cue("fail");
      shell.setStatus(`Wrong answer. ${currentQuestion.options[currentQuestion.answer]} was correct.`);
    }

    shell.updateStat("score", score);
    shell.updateStat("streak", streak);
    chooseQuestion();
  }

  function render() {
    if (!currentQuestion) {
      return;
    }
    shell.updateStat("category", currentQuestion.category);
    root.innerHTML = `
      <section class="question-card">
        <p class="overlay-kicker">${currentQuestion.category} · Difficulty ${currentQuestion.difficulty}</p>
        <h3>${currentQuestion.prompt}</h3>
        <div class="quiz-options">
          ${currentQuestion.options.map((option, index) => `
            <button class="quiz-option" type="button" data-answer="${index}">
              <strong>${String.fromCharCode(65 + index)}</strong>
              <span>${option}</span>
            </button>
          `).join("")}
        </div>
      </section>
      <section class="challenge-panel">
        <h3>Round Breakdown</h3>
        <div class="stats-grid">
          <div class="stat-chip"><span>Correct</span><strong>${correct}</strong></div>
          <div class="stat-chip"><span>Answered</span><strong>${answered}</strong></div>
          <div class="stat-chip"><span>Best Streak</span><strong>${bestStreak}</strong></div>
        </div>
        <p class="muted-line">Questions rotate from HTML, CSS, JS, Python, and Logic. Difficulty rises with rhythm.</p>
      </section>
    `;

    root.querySelectorAll("[data-answer]").forEach((button) => {
      button.addEventListener("click", () => {
        answerQuestion(Number(button.getAttribute("data-answer")));
      });
    });
  }

  function endGame() {
    active = false;
    shell.audio.cue("fail");
    shell.finishRun({
      title: "Time up",
      text: "The blitz clock ran out.",
      stats: [
        `Score: ${score}`,
        `Correct Answers: ${correct}`,
        `Questions Answered: ${answered}`,
        `Best Streak: ${bestStreak}`
      ],
      entry: { score, streak: bestStreak, correct }
    });
  }

  function loop(timestamp) {
    rafId = requestAnimationFrame(loop);
    if (!active) {
      return;
    }
    if (!lastTime) {
      lastTime = timestamp;
    }
    const delta = (timestamp - lastTime) / 1000;
    lastTime = timestamp;
    timeLeft = Math.max(0, timeLeft - delta);
    shell.updateStat("time", Math.ceil(timeLeft));
    if (timeLeft <= 0) {
      endGame();
    }
  }

  function resetState() {
    active = true;
    lastTime = 0;
    timeLeft = 60;
    score = 0;
    streak = 0;
    bestStreak = 0;
    correct = 0;
    answered = 0;
    shell.updateStat("score", 0);
    shell.updateStat("time", 60);
    shell.updateStat("streak", 0);
    shell.updateStat("category", "Mixed");
    shell.setStatus("Blitz live.");
    chooseQuestion();
  }

  function startGame() {
    if (!rafId) {
      rafId = requestAnimationFrame(loop);
    }
    resetState();
  }

  function restartGame() {
    resetState();
  }
})();
