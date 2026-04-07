(() => {
  const root = document.getElementById("game-root");
  const progressStore = new Arcade.ProgressStore("signal-heist");
  const levels = [
    {
      id: "level-1",
      name: "Signal Room",
      size: 7,
      start: [6, 0],
      exit: [6, 6],
      target: [1, 5],
      hackNodes: [[5, 3]],
      walls: [[3, 1], [3, 2], [3, 4], [3, 5]],
      guards: [{ path: [[4, 2], [4, 4], [2, 4], [2, 2]], index: 0, stun: 0 }],
      cameras: [{ position: [0, 3], direction: "down" }]
    },
    {
      id: "level-2",
      name: "Archive Bypass",
      size: 8,
      start: [7, 1],
      exit: [0, 7],
      target: [2, 5],
      hackNodes: [[6, 4], [1, 2]],
      walls: [[2, 2], [3, 2], [4, 2], [4, 3], [4, 4], [2, 6], [3, 6]],
      guards: [
        { path: [[6, 5], [5, 5], [4, 5], [3, 5], [4, 5], [5, 5]], index: 0, stun: 0 },
        { path: [[1, 4], [1, 5], [1, 6], [1, 5]], index: 0, stun: 0 }
      ],
      cameras: [{ position: [0, 1], direction: "down" }, { position: [7, 4], direction: "up" }]
    },
    {
      id: "level-3",
      name: "Vault Loop",
      size: 8,
      start: [7, 0],
      exit: [0, 7],
      target: [3, 6],
      hackNodes: [[6, 2], [2, 4]],
      walls: [[2, 1], [2, 2], [2, 3], [5, 4], [5, 5], [5, 6], [3, 3], [4, 3]],
      guards: [
        { path: [[6, 6], [5, 6], [4, 6], [4, 5], [4, 4], [5, 4], [6, 4], [6, 5]], index: 0, stun: 0 },
        { path: [[1, 1], [1, 2], [1, 3], [1, 4], [1, 3], [1, 2]], index: 0, stun: 0 }
      ],
      cameras: [{ position: [0, 5], direction: "down" }, { position: [7, 3], direction: "up" }]
    }
  ];

  const shell = new Arcade.GameShell({
    gameId: "signal-heist",
    hud: [
      { id: "level", label: "Level", value: "1" },
      { id: "alert", label: "Alert", value: "0%" },
      { id: "turns", label: "Turns", value: "0" },
      { id: "status", label: "Target", value: "Not Stolen" }
    ],
    board: {
      id: levels[0].id,
      title: "Top 10 Heists",
      compare: Arcade.sorters.efficiencyDesc,
      renderEntry: (entry, index, escapeHtml) => `
        <div class="board-row">
          <span class="board-rank">#${index + 1}</span>
          <span class="board-name">${escapeHtml(entry.name)}</span>
          <span class="board-score">${entry.score}</span>
          <span class="board-meta">${entry.level} | ${entry.time} turns</span>
        </div>
      `,
      summarize: (entry) => `${entry.score} pts | ${entry.time} turns by ${entry.name}`
    },
    noteTitle: "Heist Notes",
    noteBody: "Hack nodes disable cameras for three turns. Distract stuns the nearest guard once per level.",
    onStart: startGame,
    onRestart: restartGame
  });

  levels.forEach((level) => {
    shell.registerBoard({
      id: level.id,
      title: `${level.name} Top 10`,
      compare: Arcade.sorters.efficiencyDesc,
      renderEntry: (entry, index, escapeHtml) => `
        <div class="board-row">
          <span class="board-rank">#${index + 1}</span>
          <span class="board-name">${escapeHtml(entry.name)}</span>
          <span class="board-score">${entry.score}</span>
          <span class="board-meta">${entry.time} turns | Alert ${entry.alert}%</span>
        </div>
      `,
      summarize: (entry) => `${entry.score} pts | ${entry.time} turns by ${entry.name}`
    });
  });

  let progress = progressStore.load({ unlocked: 1 });
  let currentLevelIndex = 0;
  let state = null;
  let levelCompleted = false;

  function currentLevel() {
    return levels[currentLevelIndex];
  }

  function key(row, col) {
    return `${row}-${col}`;
  }

  function resetState() {
    const level = currentLevel();
    state = {
      player: [...level.start],
      turns: 0,
      alert: 0,
      hasTarget: false,
      cameraDisableTurns: 0,
      distractsLeft: 1,
      guards: level.guards.map((guard) => ({ ...guard })),
      finished: false
    };
    levelCompleted = false;
    shell.useBoard(level.id);
    updateHud();
    render();
  }

  function isWall(row, col) {
    return currentLevel().walls.some(([r, c]) => r === row && c === col);
  }

  function isInside(row, col) {
    return row >= 0 && row < currentLevel().size && col >= 0 && col < currentLevel().size;
  }

  function cameraVision(camera) {
    if (state.cameraDisableTurns > 0) return [];
    const cells = [];
    const [row, col] = camera.position;
    const vector = camera.direction === "down" ? [1, 0] : camera.direction === "up" ? [-1, 0] : camera.direction === "left" ? [0, -1] : [0, 1];
    let nextRow = row + vector[0];
    let nextCol = col + vector[1];
    while (isInside(nextRow, nextCol) && !isWall(nextRow, nextCol)) {
      cells.push(key(nextRow, nextCol));
      nextRow += vector[0];
      nextCol += vector[1];
    }
    return cells;
  }

  function nearestGuard() {
    return state.guards
      .map((guard, index) => {
        const [row, col] = guard.path[guard.index];
        const distance = Math.abs(row - state.player[0]) + Math.abs(col - state.player[1]);
        return { guard, index, distance };
      })
      .sort((a, b) => a.distance - b.distance)[0];
  }

  function render() {
    const level = currentLevel();
    const vision = new Set(level.cameras.flatMap((camera) => cameraVision(camera)));
    const cells = [];
    for (let row = 0; row < level.size; row += 1) {
      for (let col = 0; col < level.size; col += 1) {
        const classes = ["grid-cell"];
        let label = "";
        const guardHere = state.guards.find((guard) => {
          const [guardRow, guardCol] = guard.path[guard.index];
          return guardRow === row && guardCol === col;
        });
        if (row === state.player[0] && col === state.player[1]) classes.push("player"), label = "P";
        else if (row === level.exit[0] && col === level.exit[1]) classes.push("exit"), label = "E";
        else if (row === level.target[0] && col === level.target[1] && !state.hasTarget) classes.push("goal"), label = "T";
        else if (guardHere) classes.push("guard"), label = "G";
        else if (level.cameras.some((camera) => camera.position[0] === row && camera.position[1] === col)) classes.push("camera"), label = "C";
        else if (vision.has(key(row, col))) classes.push("visited");
        else if (level.hackNodes.some(([r, c]) => r === row && c === col)) classes.push("node"), label = "H";
        else if (isWall(row, col)) classes.push("wall");
        cells.push(`<div class="${classes.join(" ")}">${label}</div>`);
      }
    }

    root.innerHTML = `
      <section class="challenge-panel">
        <h3>${level.name}</h3>
        <div class="chip-row">
          ${levels.map((entry, index) => `<button class="level-chip" type="button" data-level="${index}" ${index + 1 > progress.unlocked ? "disabled" : ""}>${entry.name}</button>`).join("")}
        </div>
        <div class="path-board">
          <div class="grid-board" style="grid-template-columns:repeat(${level.size}, minmax(0, 1fr));">${cells.join("")}</div>
        </div>
      </section>
      <section class="challenge-panel">
        <h3>Actions</h3>
        <div class="action-row">
          <button class="arcade-button secondary" type="button" data-action="wait">Wait</button>
          <button class="arcade-button secondary" type="button" data-action="hack">Hack</button>
          <button class="arcade-button secondary" type="button" data-action="distract">Distract</button>
        </div>
        <p class="muted-line">Hack works when you stand next to a node. Distract stuns the nearest guard once per level.</p>
      </section>
    `;

    root.querySelectorAll("[data-level]").forEach((button) => {
      button.addEventListener("click", () => {
        const next = Number(button.getAttribute("data-level"));
        if (next + 1 > progress.unlocked) return;
        currentLevelIndex = next;
        restartGame();
      });
    });
    root.querySelectorAll("[data-action]").forEach((button) => {
      button.addEventListener("click", () => {
        performAction(button.getAttribute("data-action"));
      });
    });
  }

  function updateHud() {
    shell.updateStat("level", currentLevelIndex + 1);
    shell.updateStat("alert", `${state.alert}%`);
    shell.updateStat("turns", state.turns);
    shell.updateStat("status", state.hasTarget ? "Stolen" : "Not Stolen");
  }

  function adjacentToHackNode() {
    return currentLevel().hackNodes.some(([row, col]) => Math.abs(row - state.player[0]) + Math.abs(col - state.player[1]) === 1);
  }

  function movePlayer(deltaRow, deltaCol) {
    if (state.finished) return;
    const nextRow = state.player[0] + deltaRow;
    const nextCol = state.player[1] + deltaCol;
    if (!isInside(nextRow, nextCol) || isWall(nextRow, nextCol)) {
      shell.audio.cue("fail");
      return;
    }
    state.player = [nextRow, nextCol];
    endTurn();
  }

  function performAction(action) {
    if (state.finished) return;
    if (action === "wait") {
      endTurn();
      return;
    }
    if (action === "hack") {
      if (!adjacentToHackNode()) {
        shell.setStatus("Move next to a hack node first.");
        shell.audio.cue("fail");
        return;
      }
      state.cameraDisableTurns = 3;
      shell.audio.cue("power");
      endTurn();
      return;
    }
    if (action === "distract") {
      if (state.distractsLeft <= 0) {
        shell.setStatus("No distractions left.");
        shell.audio.cue("fail");
        return;
      }
      const nearest = nearestGuard();
      if (!nearest || nearest.distance > 3) {
        shell.setStatus("No guard close enough to distract.");
        shell.audio.cue("fail");
        return;
      }
      nearest.guard.stun = 1;
      state.distractsLeft -= 1;
      shell.audio.cue("click");
      endTurn();
    }
  }

  function advanceGuards() {
    state.guards.forEach((guard) => {
      if (guard.stun > 0) {
        guard.stun -= 1;
        return;
      }
      guard.index = (guard.index + 1) % guard.path.length;
    });
  }

  function evaluateDetection() {
    const playerKey = key(state.player[0], state.player[1]);
    const cameraSeen = currentLevel().cameras.some((camera) => cameraVision(camera).includes(playerKey));
    if (cameraSeen) state.alert = Math.min(100, state.alert + 28);
    state.guards.forEach((guard) => {
      const [row, col] = guard.path[guard.index];
      const distance = Math.abs(row - state.player[0]) + Math.abs(col - state.player[1]);
      if (distance === 0) {
        state.alert = 100;
      } else if (distance === 1) {
        state.alert = Math.min(100, state.alert + 38);
      }
    });

    if (!state.hasTarget && state.player[0] === currentLevel().target[0] && state.player[1] === currentLevel().target[1]) {
      state.hasTarget = true;
      shell.audio.cue("success");
    }

    if (state.hasTarget && state.player[0] === currentLevel().exit[0] && state.player[1] === currentLevel().exit[1]) {
      finishLevel(true);
      return;
    }

    if (state.alert >= 100) {
      finishLevel(false);
    }
  }

  function finishLevel(success) {
    state.finished = true;
    const score = Math.max(150, 1200 - state.turns * 25 - state.alert * 4 + (state.hasTarget ? 220 : 0) + state.distractsLeft * 40 + state.cameraDisableTurns * 10);
    if (success && progress.unlocked < levels.length && currentLevelIndex + 1 === progress.unlocked) {
      progress.unlocked += 1;
      progressStore.save(progress);
    }
    shell.audio.cue(success ? "success" : "fail");
    shell.finishRun({
      title: success ? "Signal secured" : "Heist blown",
      text: success ? "You stole the signal and got out." : "Security fully locked onto your position.",
      boardId: currentLevel().id,
      stats: [
        `Level: ${currentLevel().name}`,
        `Score: ${score}`,
        `Turns: ${state.turns}`,
        `Alert: ${state.alert}%`
      ],
      entry: { score, level: currentLevel().name, time: state.turns, alert: state.alert }
    });
  }

  function endTurn() {
    state.turns += 1;
    if (state.cameraDisableTurns > 0) state.cameraDisableTurns -= 1;
    advanceGuards();
    evaluateDetection();
    updateHud();
    render();
  }

  function startGame() {
    resetState();
    shell.setMobileControls([
      { label: "Up", onTap: () => movePlayer(-1, 0) },
      { label: "Left", onTap: () => movePlayer(0, -1) },
      { label: "Wait", onTap: () => performAction("wait") },
      { label: "Right", onTap: () => movePlayer(0, 1) },
      { label: "Hack", onTap: () => performAction("hack") },
      { label: "Down", onTap: () => movePlayer(1, 0) },
      { label: "Distract", onTap: () => performAction("distract") }
    ]);
  }

  function restartGame() {
    resetState();
  }

  window.addEventListener("keydown", (event) => {
    if (!state || state.finished) return;
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space", "Period", "KeyW", "KeyA", "KeyS", "KeyD", "KeyH", "KeyE"].includes(event.code)) {
      event.preventDefault();
    }
    if (event.code === "ArrowUp" || event.code === "KeyW") movePlayer(-1, 0);
    if (event.code === "ArrowDown" || event.code === "KeyS") movePlayer(1, 0);
    if (event.code === "ArrowLeft" || event.code === "KeyA") movePlayer(0, -1);
    if (event.code === "ArrowRight" || event.code === "KeyD") movePlayer(0, 1);
    if (event.code === "Period" || event.code === "Space") performAction("wait");
    if (event.code === "KeyH") performAction("hack");
    if (event.code === "KeyE") performAction("distract");
  });
})();
