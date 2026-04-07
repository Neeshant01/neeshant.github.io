(() => {
  const root = document.getElementById("game-root");
  const progressStore = new Arcade.ProgressStore("roast-arena");
  const opponents = [
    { id: "freshman", name: "Freshman Flex", trait: "brag", intro: "Walks in acting like one Git commit made history." },
    { id: "latebuild", name: "Late Build Larry", trait: "lazy", intro: "Promises production-ready code and brings broken screenshots." },
    { id: "coldreply", name: "Cold Reply Queen", trait: "ice", intro: "Every answer lands late, but tries to sound superior." },
    { id: "bossbyte", name: "Boss Byte", trait: "ego", intro: "Talks like the CEO of syntax itself." }
  ];

  const linePool = [
    { style: "smart", text: "Your stack is so unstable it needs emotional support.", beats: ["brag", "ego"] },
    { style: "clean", text: "You write bugs like you're filling a daily quota.", beats: ["lazy"] },
    { style: "calm", text: "That confidence would be useful if your code also compiled.", beats: ["ego", "ice"] },
    { style: "savage", text: "You push to main like production is your beta tester.", beats: ["lazy", "brag"] },
    { style: "tech", text: "Your logic has more loops than your excuse list.", beats: ["ice", "lazy"] },
    { style: "precision", text: "Your timing is off. Even your punchlines return 404.", beats: ["ice"] }
  ];

  const responses = {
    brag: ["That line was cute. Want help centering your confidence too?", "Big talk from someone still debugging their own shadow."],
    lazy: ["I would answer harder, but your setup does not deserve overtime.", "That roast showed up faster than your deployment pipeline."],
    ice: ["Nice try. You almost sounded dangerous for a second.", "That was nearly sharp. Then it landed."],
    ego: ["I appreciate the effort. It must be hard aiming up.", "Confident words. Shame they arrived without impact."]
  };

  const shell = new Arcade.GameShell({
    gameId: "roast-arena",
    hud: [
      { id: "round", label: "Round", value: "1 / 3" },
      { id: "crowd", label: "Crowd", value: "50%" },
      { id: "score", label: "Battle Score", value: "0" },
      { id: "tier", label: "Opponent", value: "Freshman Flex" }
    ],
    board: {
      id: "main",
      title: "Top 10 Battle Scores",
      compare: (a, b) => (b.score - a.score) || (b.crowd - a.crowd),
      renderEntry: (entry, index, escapeHtml) => `
        <div class="board-row">
          <span class="board-rank">#${index + 1}</span>
          <span class="board-name">${escapeHtml(entry.name)}</span>
          <span class="board-score">${entry.score}</span>
          <span class="board-meta">${entry.opponent} · Crowd ${entry.crowd}%</span>
        </div>
      `,
      summarize: (entry) => `${entry.score} pts · Crowd ${entry.crowd}% by ${entry.name}`
    },
    noteTitle: "Battle Notes",
    noteBody: "Opponents react differently to each roast style. Win to unlock harder tiers.",
    onStart: startGame,
    onRestart: restartGame
  });

  let progress = progressStore.load({ unlocked: 1 });
  let selectedOpponent = opponents[0];
  let round = 1;
  let crowd = 50;
  let score = 0;
  let log = [];
  let choices = [];
  let active = false;

  function getUnlockedOpponents() {
    return opponents.slice(0, progress.unlocked);
  }

  function buildChoices() {
    choices = [...linePool].sort(() => Math.random() - 0.5).slice(0, 3);
  }

  function render() {
    const unlocked = getUnlockedOpponents();
    root.innerHTML = `
      <section class="roast-card">
        <h3>Choose Opponent</h3>
        <div class="choice-grid">
          ${opponents.map((opponent, index) => `
            <button class="choice-card" type="button" data-opponent="${opponent.id}" ${index + 1 > progress.unlocked ? "disabled" : ""}>
              <strong>${opponent.name}</strong>
              <span>${index + 1 > progress.unlocked ? "Locked" : opponent.intro}</span>
            </button>
          `).join("")}
        </div>
      </section>
      <section class="roast-card">
        <h3>${selectedOpponent.name}</h3>
        <p>${selectedOpponent.intro}</p>
        <div class="crowd-meter"><div class="meter-fill" style="width:${crowd}%"></div></div>
        <p class="muted-line">Round ${round} of 3 · Crowd ${crowd}%</p>
        <div class="roast-options">
          ${choices.map((choice, index) => `
            <button class="roast-card" type="button" data-choice="${index}">
              <p class="overlay-kicker">${choice.style}</p>
              <strong>${choice.text}</strong>
            </button>
          `).join("")}
        </div>
      </section>
      <section class="roast-card">
        <h3>Battle Feed</h3>
        <div class="mini-list">
          ${log.slice(-5).map((entry) => `<div class="dialogue-line"><strong>${entry.title}</strong><p>${entry.text}</p></div>`).join("") || "<p class='muted-line'>Make the first move.</p>"}
        </div>
      </section>
    `;

    root.querySelectorAll("[data-opponent]").forEach((button) => {
      button.addEventListener("click", () => {
        const picked = opponents.find((entry) => entry.id === button.getAttribute("data-opponent"));
        if (!picked) {
          return;
        }
        selectedOpponent = picked;
        shell.updateStat("tier", picked.name);
        restartGame();
      });
    });

    root.querySelectorAll("[data-choice]").forEach((button) => {
      button.addEventListener("click", () => {
        if (!active) {
          return;
        }
        resolveRound(Number(button.getAttribute("data-choice")));
      });
    });
  }

  function resolveRound(index) {
    const picked = choices[index];
    const beats = picked.beats.includes(selectedOpponent.trait);
    const roundScore = (beats ? 180 : 90) + Math.floor(Math.random() * 40);
    score += roundScore;
    crowd = Arcade.clamp(crowd + (beats ? 18 : 7) - Math.floor(Math.random() * 6), 0, 100);
    const replyPool = responses[selectedOpponent.trait];
    log.push({ title: "You", text: picked.text });
    log.push({ title: selectedOpponent.name, text: replyPool[Math.floor(Math.random() * replyPool.length)] });
    shell.audio.cue(beats ? "success" : "click");
    round += 1;
    shell.updateStat("round", `${Math.min(round, 3)} / 3`);
    shell.updateStat("crowd", `${crowd}%`);
    shell.updateStat("score", score);
    if (round > 3) {
      finishBattle();
      return;
    }
    buildChoices();
    render();
  }

  function finishBattle() {
    active = false;
    const win = crowd >= 55;
    if (win && progress.unlocked < opponents.length) {
      progress.unlocked += 1;
      progressStore.save(progress);
    }
    shell.finishRun({
      title: win ? "Battle won" : "Crowd slipped",
      text: win ? "You controlled the room and took the verdict." : "The room did not swing far enough in your favor.",
      stats: [
        `Opponent: ${selectedOpponent.name}`,
        `Battle Score: ${score}`,
        `Crowd Energy: ${crowd}%`,
        `Unlocked Tiers: ${progress.unlocked}`
      ],
      entry: { score, crowd, opponent: selectedOpponent.name }
    });
  }

  function resetState() {
    active = true;
    round = 1;
    crowd = 50;
    score = 0;
    log = [];
    buildChoices();
    shell.updateStat("round", "1 / 3");
    shell.updateStat("crowd", "50%");
    shell.updateStat("score", "0");
    shell.updateStat("tier", selectedOpponent.name);
    render();
  }

  function startGame() {
    resetState();
  }

  function restartGame() {
    resetState();
  }
})();
