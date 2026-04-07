(() => {
  const root = document.getElementById("game-root");
  const todayIndex = new Date().getDate() % 4;
  const snippets = {
    html: [
      `<section class="hero">\n  <h1>Nishant Kumar</h1>\n  <p>Building browser games and polished interfaces.</p>\n</section>`,
      `<button class="primary-cta" type="button">\n  View Projects\n</button>`
    ],
    css: [
      `.card {\n  border-radius: 20px;\n  background: linear-gradient(180deg, rgba(12, 20, 40, 0.95), rgba(8, 14, 28, 0.96));\n  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.34);\n}`,
      `.hero-grid {\n  display: grid;\n  grid-template-columns: 1.1fr 0.9fr;\n  gap: 1.5rem;\n}`
    ],
    javascript: [
      `function updateScore(nextScore) {\n  score = nextScore;\n  hudScore.textContent = String(score);\n  return score;\n}`,
      `const levelButtons = document.querySelectorAll("[data-level]");\nlevelButtons.forEach((button) => {\n  button.addEventListener("click", () => startLevel(button.dataset.level));\n});`
    ],
    python: [
      `def build_summary(name, score, accuracy):\n    return f"{name} -> {score} pts at {accuracy}% accuracy"`,
      `for index, clue in enumerate(clues, start=1):\n    print(index, clue)\n`
    ]
  };

  const shell = new Arcade.GameShell({
    gameId: "type-racer-code-lab",
    hud: [
      { id: "language", label: "Language", value: "HTML" },
      { id: "time", label: "Time", value: "0s" },
      { id: "wpm", label: "WPM", value: "0" },
      { id: "accuracy", label: "Accuracy", value: "100%" }
    ],
    board: {
      id: "html",
      title: "Top 10 Typists",
      compare: (a, b) => (b.score - a.score) || (b.wpm - a.wpm),
      renderEntry: (entry, index, escapeHtml) => `
        <div class="board-row">
          <span class="board-rank">#${index + 1}</span>
          <span class="board-name">${escapeHtml(entry.name)}</span>
          <span class="board-score">${entry.score}</span>
          <span class="board-meta">${entry.language} | ${entry.wpm} WPM | ${entry.accuracy}%</span>
        </div>
      `,
      summarize: (entry) => `${entry.language} ${entry.score} by ${entry.name}`
    },
    noteTitle: "Lab Notes",
    noteBody: "Composite score combines WPM and accuracy. Every language keeps its own Top 10.",
    onStart: startGame,
    onRestart: restartGame
  });

  ["html", "css", "javascript", "python"].forEach((language) => {
    shell.registerBoard({
      id: language,
      title: `${language.toUpperCase()} Top 10`,
      compare: (a, b) => (b.score - a.score) || (b.wpm - a.wpm),
      renderEntry: (entry, index, escapeHtml) => `
        <div class="board-row">
          <span class="board-rank">#${index + 1}</span>
          <span class="board-name">${escapeHtml(entry.name)}</span>
          <span class="board-score">${entry.score}</span>
          <span class="board-meta">${entry.wpm} WPM | ${entry.accuracy}% accuracy</span>
        </div>
      `,
      summarize: (entry) => `${entry.score} pts | ${entry.wpm} WPM by ${entry.name}`
    });
  });

  let currentLanguage = "html";
  let currentSnippet = "";
  let startedAt = 0;
  let typedStarted = false;
  let timerId = 0;
  let mistakes = 0;

  function getSnippet(language) {
    const pool = snippets[language];
    return pool[(todayIndex + Math.floor(Math.random() * pool.length)) % pool.length];
  }

  function calculateStats(value) {
    const elapsed = Math.max(1, (Date.now() - startedAt) / 1000);
    const correctChars = value.split("").filter((char, index) => char === currentSnippet[index]).length;
    const accuracy = Math.round((correctChars / Math.max(1, value.length)) * 100);
    const words = currentSnippet.length / 5;
    const wpm = Math.round(words / (elapsed / 60));
    return { elapsed: Math.round(elapsed), accuracy, wpm };
  }

  function renderPreview(value = "") {
    const target = currentSnippet;
    return target.split("").map((char, index) => {
      if (index < value.length) {
        return `<span class="${value[index] === char ? "typed-correct" : "typed-wrong"}">${Arcade.escapeHtml(char)}</span>`;
      }
      return Arcade.escapeHtml(char);
    }).join("");
  }

  function updatePanels(value = "") {
    const previewNode = document.getElementById("typing-preview");
    const mistakesNode = document.getElementById("mistakes-count");
    const input = document.getElementById("typing-input");
    const stats = typedStarted ? calculateStats(value) : { elapsed: 0, accuracy: 100, wpm: 0 };
    shell.updateStat("language", currentLanguage.toUpperCase());
    shell.updateStat("time", `${stats.elapsed}s`);
    shell.updateStat("accuracy", `${stats.accuracy}%`);
    shell.updateStat("wpm", stats.wpm);
    if (previewNode) previewNode.innerHTML = renderPreview(value);
    if (mistakesNode) mistakesNode.textContent = String(mistakes);
    if (input instanceof HTMLTextAreaElement && document.activeElement !== input) {
      input.focus();
    }
  }

  function renderShell() {
    root.innerHTML = `
      <section class="typing-panel">
        <h3>Snippet Preview</h3>
        <div class="chip-row">
          ${Object.keys(snippets).map((language) => `
            <button class="tab-chip" type="button" data-language="${language}">${language}</button>
          `).join("")}
        </div>
        <div class="typing-target">
          <code class="snippet-code" id="typing-preview"></code>
        </div>
        <div class="typing-input-panel">
          <textarea class="text-entry" id="typing-input" rows="8" spellcheck="false" placeholder="Type the snippet exactly as shown."></textarea>
        </div>
      </section>
      <section class="challenge-panel">
        <h3>Challenge</h3>
        <div class="stats-grid">
          <div class="stat-chip"><span>Daily Rotation</span><strong>${todayIndex + 1}</strong></div>
          <div class="stat-chip"><span>Mistakes</span><strong id="mistakes-count">0</strong></div>
          <div class="stat-chip"><span>Mode</span><strong>Snippet</strong></div>
        </div>
        <p class="muted-line">Start typing to begin the timer. Clean input matters more than rushing blindly.</p>
      </section>
    `;

    root.querySelectorAll("[data-language]").forEach((button) => {
      button.addEventListener("click", () => {
        currentLanguage = button.getAttribute("data-language");
        restartGame();
      });
    });

    const input = document.getElementById("typing-input");
    input.addEventListener("input", () => {
      const value = input.value;
      if (!typedStarted) {
        typedStarted = true;
        startedAt = Date.now();
        timerLoop();
      }
      mistakes = value.split("").filter((char, index) => char !== currentSnippet[index]).length;
      updatePanels(value);
      if (value === currentSnippet) {
        finishRun(value);
      }
    });
  }

  function timerLoop() {
    if (!typedStarted) return;
    const input = document.getElementById("typing-input");
    if (input instanceof HTMLTextAreaElement) {
      updatePanels(input.value);
    }
    timerId = window.setTimeout(timerLoop, 250);
  }

  function finishRun(value) {
    typedStarted = false;
    window.clearTimeout(timerId);
    const stats = calculateStats(value);
    const score = Math.max(1, Math.round(stats.wpm * (stats.accuracy / 100)));
    shell.audio.cue("success");
    shell.finishRun({
      title: "Snippet complete",
      text: "The run is logged in the lab board.",
      boardId: currentLanguage,
      stats: [
        `Language: ${currentLanguage.toUpperCase()}`,
        `WPM: ${stats.wpm}`,
        `Accuracy: ${stats.accuracy}%`,
        `Mistakes: ${mistakes}`
      ],
      entry: { score, language: currentLanguage.toUpperCase(), wpm: stats.wpm, accuracy: stats.accuracy }
    });
  }

  function prepareRun() {
    typedStarted = false;
    window.clearTimeout(timerId);
    mistakes = 0;
    currentSnippet = getSnippet(currentLanguage);
    shell.useBoard(currentLanguage);
    renderShell();
    updatePanels("");
  }

  function startGame() {
    prepareRun();
  }

  function restartGame() {
    prepareRun();
  }
})();
