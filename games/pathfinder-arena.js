(() => {
  const root = document.getElementById("game-root");
  const progressStore = new Arcade.ProgressStore("pathfinder-arena");
  const levels = [
    { id: "level-1", name: "Grid Warmup", size: 8, wallLimit: 6, start: [0, 0], goal: [7, 7], fixedWalls: [[1, 2], [2, 2], [3, 2], [5, 5]], bonuses: [[2, 5], [5, 1]] },
    { id: "level-2", name: "Split Corridor", size: 8, wallLimit: 5, start: [0, 4], goal: [7, 1], fixedWalls: [[2, 4], [2, 5], [2, 6], [4, 1], [4, 2], [5, 2]], bonuses: [[1, 1], [6, 6]] },
    { id: "level-3", name: "Crossfire", size: 9, wallLimit: 7, start: [0, 8], goal: [8, 0], fixedWalls: [[2, 4], [3, 4], [4, 4], [5, 4], [6, 4], [4, 1], [4, 2], [4, 6], [4, 7]], bonuses: [[1, 6], [7, 2], [6, 7]] },
    { id: "level-4", name: "Tight Spiral", size: 9, wallLimit: 8, start: [0, 0], goal: [8, 8], fixedWalls: [[1, 0], [1, 1], [1, 2], [3, 2], [4, 2], [5, 2], [5, 3], [5, 4], [3, 6], [4, 6], [5, 6], [7, 4], [7, 5], [7, 6]], bonuses: [[2, 7], [6, 1]] }
  ];
  const progress = progressStore.load({ unlocked: 1 });
  let currentLevelIndex = 0;
  let currentAlgorithm = "astar";
  let placedWalls = new Set();
  let visitedCells = [];
  let pathCells = [];
  let runningAnimation = false;
  let levelStart = Date.now();

  const shell = new Arcade.GameShell({
    gameId: "pathfinder-arena",
    hud: [
      { id: "level", label: "Level", value: "1" },
      { id: "algorithm", label: "Algorithm", value: "A*" },
      { id: "walls", label: "Walls Left", value: "0" },
      { id: "score", label: "Solve Score", value: "0" }
    ],
    board: {
      id: levels[0].id,
      title: "Top 10 Routes",
      compare: Arcade.sorters.efficiencyDesc,
      renderEntry: (entry, index, escapeHtml) => `
        <div class="board-row">
          <span class="board-rank">#${index + 1}</span>
          <span class="board-name">${escapeHtml(entry.name)}</span>
          <span class="board-score">${entry.score}</span>
          <span class="board-meta">${entry.algorithm} | ${entry.time}s</span>
        </div>
      `,
      summarize: (entry) => `${entry.score} pts | ${entry.algorithm} by ${entry.name}`
    },
    noteTitle: "Arena Notes",
    noteBody: "Place walls before running the search. Bonus nodes increase the solve score if the final path crosses them.",
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
          <span class="board-meta">${entry.algorithm} | ${entry.time}s</span>
        </div>
      `,
      summarize: (entry) => `${entry.score} pts | ${entry.time}s by ${entry.name}`
    });
  });

  function key(row, col) {
    return `${row}-${col}`;
  }

  function currentLevel() {
    return levels[currentLevelIndex];
  }

  function isFixedWall(row, col) {
    return currentLevel().fixedWalls.some(([r, c]) => r === row && c === col);
  }

  function isBonus(row, col) {
    return currentLevel().bonuses.some(([r, c]) => r === row && c === col);
  }

  function render() {
    const level = currentLevel();
    const remainingWalls = level.wallLimit - placedWalls.size;
    shell.useBoard(level.id);
    shell.updateStat("level", currentLevelIndex + 1);
    shell.updateStat("algorithm", currentAlgorithm.toUpperCase());
    shell.updateStat("walls", remainingWalls);

    const cells = [];
    for (let row = 0; row < level.size; row += 1) {
      for (let col = 0; col < level.size; col += 1) {
        const cellKey = key(row, col);
        const classes = ["grid-cell"];
        let label = "";
        if (row === level.start[0] && col === level.start[1]) classes.push("start"), label = "S";
        else if (row === level.goal[0] && col === level.goal[1]) classes.push("goal"), label = "G";
        else if (isFixedWall(row, col) || placedWalls.has(cellKey)) classes.push("wall");
        else if (isBonus(row, col)) classes.push("node"), label = "+";
        if (visitedCells.includes(cellKey)) classes.push("visited");
        if (pathCells.includes(cellKey)) classes.push("path");
        cells.push(`<button class="${classes.join(" ")}" type="button" data-cell="${row},${col}">${label}</button>`);
      }
    }

    root.innerHTML = `
      <section class="challenge-panel">
        <h3>${level.name}</h3>
        <div class="chip-row">
          ${levels.map((entry, index) => `<button class="level-chip" type="button" data-level="${index}" ${index + 1 > progress.unlocked ? "disabled" : ""}>${entry.name}</button>`).join("")}
        </div>
        <div class="chip-row">
          <button class="tab-chip" type="button" data-algo="bfs">BFS</button>
          <button class="tab-chip" type="button" data-algo="dfs">DFS</button>
          <button class="tab-chip" type="button" data-algo="astar">A*</button>
        </div>
        <div class="action-row">
          <button class="arcade-button primary" type="button" id="run-search">Run Search</button>
          <button class="arcade-button secondary" type="button" id="clear-walls">Clear Walls</button>
        </div>
        <div class="path-board">
          <div class="grid-board" style="grid-template-columns:repeat(${level.size}, minmax(0, 1fr));">${cells.join("")}</div>
        </div>
      </section>
      <section class="challenge-panel">
        <h3>Level Rules</h3>
        <div class="mini-list">
          <div class="dialogue-line">Wall limit: ${level.wallLimit}</div>
          <div class="dialogue-line">Bonus nodes: ${level.bonuses.length}</div>
          <div class="dialogue-line">Click empty cells to place or remove walls.</div>
        </div>
      </section>
    `;

    root.querySelectorAll("[data-cell]").forEach((button) => {
      button.addEventListener("click", () => {
        if (runningAnimation) return;
        const [row, col] = button.getAttribute("data-cell").split(",").map(Number);
        toggleWall(row, col);
      });
    });
    root.querySelectorAll("[data-level]").forEach((button) => {
      button.addEventListener("click", () => {
        const next = Number(button.getAttribute("data-level"));
        if (next + 1 > progress.unlocked) return;
        currentLevelIndex = next;
        restartGame();
      });
    });
    root.querySelectorAll("[data-algo]").forEach((button) => {
      button.addEventListener("click", () => {
        currentAlgorithm = button.getAttribute("data-algo");
        shell.updateStat("algorithm", currentAlgorithm.toUpperCase());
        render();
      });
    });
    document.getElementById("run-search").addEventListener("click", runSearch);
    document.getElementById("clear-walls").addEventListener("click", () => {
      placedWalls.clear();
      visitedCells = [];
      pathCells = [];
      render();
    });
  }

  function toggleWall(row, col) {
    const level = currentLevel();
    const cellKey = key(row, col);
    if (
      (row === level.start[0] && col === level.start[1]) ||
      (row === level.goal[0] && col === level.goal[1]) ||
      isFixedWall(row, col) ||
      isBonus(row, col)
    ) {
      return;
    }
    if (placedWalls.has(cellKey)) {
      placedWalls.delete(cellKey);
    } else if (placedWalls.size < level.wallLimit) {
      placedWalls.add(cellKey);
    } else {
      shell.setStatus("Wall limit reached.");
      shell.audio.cue("fail");
    }
    render();
  }

  function neighbors([row, col]) {
    return [
      [row - 1, col],
      [row + 1, col],
      [row, col - 1],
      [row, col + 1]
    ].filter(([nextRow, nextCol]) => {
      const inside = nextRow >= 0 && nextRow < currentLevel().size && nextCol >= 0 && nextCol < currentLevel().size;
      return inside && !isFixedWall(nextRow, nextCol) && !placedWalls.has(key(nextRow, nextCol));
    });
  }

  function heuristic([row, col]) {
    const [goalRow, goalCol] = currentLevel().goal;
    return Math.abs(goalRow - row) + Math.abs(goalCol - col);
  }

  function solve() {
    const start = currentLevel().start;
    const goal = currentLevel().goal;
    const frontier = [[start]];
    const visited = [];
    const visitedSet = new Set();
    const costMap = new Map([[key(start[0], start[1]), 0]]);

    while (frontier.length) {
      let path;
      if (currentAlgorithm === "dfs") {
        path = frontier.pop();
      } else if (currentAlgorithm === "astar") {
        frontier.sort((a, b) => {
          const aNode = a[a.length - 1];
          const bNode = b[b.length - 1];
          return (costMap.get(key(aNode[0], aNode[1])) + heuristic(aNode)) - (costMap.get(key(bNode[0], bNode[1])) + heuristic(bNode));
        });
        path = frontier.shift();
      } else {
        path = frontier.shift();
      }

      const [row, col] = path[path.length - 1];
      const nodeKey = key(row, col);
      if (visitedSet.has(nodeKey)) continue;
      visitedSet.add(nodeKey);
      visited.push(nodeKey);
      if (row === goal[0] && col === goal[1]) {
        return { visited, path: path.map(([r, c]) => key(r, c)) };
      }

      neighbors([row, col]).forEach((nextNode) => {
        const nextKey = key(nextNode[0], nextNode[1]);
        if (!visitedSet.has(nextKey)) {
          costMap.set(nextKey, (costMap.get(nodeKey) ?? 0) + 1);
          frontier.push([...path, nextNode]);
        }
      });
    }

    return { visited, path: [] };
  }

  async function runSearch() {
    if (runningAnimation) return;
    runningAnimation = true;
    visitedCells = [];
    pathCells = [];
    render();
    const started = Date.now();
    const result = solve();
    for (const cell of result.visited) {
      visitedCells.push(cell);
      render();
      await new Promise((resolve) => setTimeout(resolve, 35));
    }

    if (!result.path.length) {
      runningAnimation = false;
      shell.setStatus("No route found. Rebuild the path.");
      shell.audio.cue("fail");
      return;
    }

    for (const cell of result.path) {
      pathCells.push(cell);
      render();
      await new Promise((resolve) => setTimeout(resolve, 40));
    }

    const elapsed = Math.floor((Date.now() - started) / 1000);
    const bonusHits = currentLevel().bonuses.filter(([row, col]) => result.path.includes(key(row, col))).length;
    const score = Math.max(150, 1200 - result.visited.length * 3 - result.path.length * 8 - elapsed * 5 + bonusHits * 120 + (currentLevel().wallLimit - placedWalls.size) * 20);
    shell.updateStat("score", score);
    shell.audio.cue("success");
    if (progress.unlocked < levels.length && currentLevelIndex + 1 === progress.unlocked) {
      progress.unlocked += 1;
      progressStore.save(progress);
    }
    runningAnimation = false;
    shell.finishRun({
      title: "Route solved",
      text: "The search finished with a valid path.",
      boardId: currentLevel().id,
      stats: [
        `Level: ${currentLevel().name}`,
        `Score: ${score}`,
        `Visited Nodes: ${result.visited.length}`,
        `Path Length: ${result.path.length}`
      ],
      entry: { score, algorithm: currentAlgorithm.toUpperCase(), time: elapsed }
    });
  }

  function startGame() {
    levelStart = Date.now();
    placedWalls.clear();
    visitedCells = [];
    pathCells = [];
    render();
  }

  function restartGame() {
    startGame();
  }
})();
