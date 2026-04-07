(() => {
  const root = document.getElementById("game-root");
  const progressStore = new Arcade.ProgressStore("desi-detective");
  const nodes = {
    intro: {
      title: "Radio Room",
      speaker: "Desk Sergeant",
      text: "The station ledger vanished during the evening power cut. Three people were near the room: Farid the tea vendor, Meera from archives, and Tapan the courier.",
      choices: [
        { label: "Question Farid at the courtyard stall", next: "farid" },
        { label: "Check archive logs with Meera", next: "meera" },
        { label: "Meet Tapan on the rooftop path", next: "tapan" }
      ]
    },
    farid: {
      title: "Courtyard Stall",
      speaker: "Farid",
      text: "Farid swears he saw a raincoat hurry past the radio room. He points to a dropped tea cup near the back gate and says Meera looked nervous.",
      choices: [
        { label: "Inspect the tea cup", next: "teaCup", addClue: "Tea stain on evidence sleeve" },
        { label: "Press Farid on the raincoat story", next: "faridLie", trust: { farid: -1 } },
        { label: "Move to archive corridor", next: "meera" }
      ]
    },
    meera: {
      title: "Archive Corridor",
      speaker: "Meera",
      text: "Meera says the power cut forced her to check backup logs. She mentions a failed keycard swipe near the radio room and quietly asks why Farid always points at everyone else.",
      choices: [
        { label: "Review the keycard log", next: "keycard", addClue: "Failed keycard at 7:42 PM" },
        { label: "Ask why she was near the radio room", next: "meeraPressure", trust: { meera: -1 } },
        { label: "Head to the rooftop path", next: "tapan" }
      ]
    },
    tapan: {
      title: "Rooftop Path",
      speaker: "Tapan",
      text: "Tapan says he heard a metal locker snap open and smelled jasmine perfume by the maintenance stairs. He also saw someone carrying a flat file under a raincoat.",
      choices: [
        { label: "Inspect the maintenance locker", next: "locker", addClue: "Broken locker latch" },
        { label: "Question the jasmine detail", next: "jasmine", addClue: "Jasmine perfume trace" },
        { label: "Return to the station hall", next: "intro" }
      ]
    },
    teaCup: {
      title: "Evidence Table",
      speaker: "Observation",
      text: "The tea cup carries a blue archive label stuck to the base. Farid did not mention that part.",
      choices: [
        { label: "Log the archive label and revisit Meera", next: "meera", trust: { meera: 1 } },
        { label: "Keep pressure on Farid", next: "faridLie" }
      ]
    },
    faridLie: {
      title: "Farid Slips",
      speaker: "Farid",
      text: "Under pressure, Farid admits he never saw the face. He only saw a raincoat and guessed the person was Meera because of the archive label near the cup.",
      choices: [
        { label: "Note the guess and move to archives", next: "meera", trust: { farid: -1 } },
        { label: "Check the back gate anyway", next: "backGate", addClue: "Mud print with courier sole" }
      ]
    },
    keycard: {
      title: "Security Console",
      speaker: "System Log",
      text: "A failed archive keycard swipe hit the radio room, but one second later the maintenance door opened correctly with a courier access tag.",
      choices: [
        { label: "Confront Tapan about maintenance access", next: "tapanConfront", trust: { tapan: -1 } },
        { label: "Tell Meera what the log shows", next: "meeraPressure", trust: { meera: 1 } }
      ]
    },
    meeraPressure: {
      title: "Meera Pushback",
      speaker: "Meera",
      text: "Meera stays calm. She says her card failed because the archive wing was already locked. She also reveals a hidden cold-room shelf that only maintenance can open.",
      choices: [
        { label: "Search the cold room if the clues support it", next: "coldRoomGate" },
        { label: "Still accuse Meera", next: "ending-meera" }
      ]
    },
    locker: {
      title: "Maintenance Locker",
      speaker: "Observation",
      text: "Inside the locker is a spare courier tag and a thin paper edge torn from an official ledger sleeve.",
      choices: [
        { label: "Add the torn sleeve clue and confront Tapan", next: "tapanConfront", addClue: "Torn ledger sleeve edge" },
        { label: "Cross-check the cold room lead", next: "coldRoomGate" }
      ]
    },
    jasmine: {
      title: "Perfume Trace",
      speaker: "Observation",
      text: "The jasmine trace stops near the cold room vent. It is too clean to belong to Farid's stall or the archive hall.",
      choices: [
        { label: "Use the trace to search the cold room", next: "coldRoomGate", trust: { meera: 1 } },
        { label: "Accuse Tapan from the rooftop evidence", next: "ending-tapan" }
      ]
    },
    backGate: {
      title: "Back Gate",
      speaker: "Observation",
      text: "A muddy print matches courier boots, but the drag pattern suggests someone carried the ledger only part of the way before hiding it.",
      choices: [
        { label: "Follow the trail to the cold room", next: "coldRoomGate" },
        { label: "Close the case on Farid's misdirection", next: "ending-farid" }
      ]
    },
    tapanConfront: {
      title: "Courier Bay",
      speaker: "Tapan",
      text: "Tapan cracks under pressure and admits he opened the maintenance door. But he says he did it for Meera, who promised the ledger only needed to be hidden for one night.",
      choices: [
        { label: "Push deeper and open the cold room", next: "coldRoomGate", addClue: "Courier admits maintenance access" },
        { label: "Close the case on Tapan", next: "ending-tapan" }
      ]
    },
    coldRoomGate: {
      title: "Cold Room Door",
      speaker: "Decision",
      text: "You now have enough fragments to test one final theory: the ledger was hidden in the cold room to delay an audit.",
      choices: [
        { label: "Search the cold room carefully", next: "ending-master", requires: ["Failed keycard at 7:42 PM", "Jasmine perfume trace"] },
        { label: "Blame Meera without entering", next: "ending-meera" },
        { label: "Blame Tapan and close fast", next: "ending-tapan" }
      ]
    },
    "ending-farid": {
      ending: true,
      title: "False Close",
      endingLabel: "Farid blamed",
      text: "You close the case on Farid's misdirection, but the ledger never returns. The station clears him two days later. The result is fast, but weak."
    },
    "ending-meera": {
      ending: true,
      title: "Sharp but Incomplete",
      endingLabel: "Meera cornered",
      text: "You accuse Meera and force a confession to hiding the ledger, but you miss the maintenance link. The case closes, yet the full route stays half-shadowed."
    },
    "ending-tapan": {
      ending: true,
      title: "Courier Fall",
      endingLabel: "Tapan blamed",
      text: "Tapan takes the fall for moving the ledger, but the motive remains muddy. The station accepts it, though the truth still feels unfinished."
    },
    "ending-master": {
      ending: true,
      title: "Full Solve",
      endingLabel: "Cold room truth",
      text: "Inside the cold room you find the ledger sealed behind frozen sample crates. Meera planned the delay, Tapan opened the route, and Farid accidentally scattered the trail. The full case locks into place."
    }
  };

  const suspectBase = {
    farid: { name: "Farid", role: "Tea Vendor", status: "Talkative witness" },
    meera: { name: "Meera", role: "Archive Clerk", status: "Calm under pressure" },
    tapan: { name: "Tapan", role: "Courier", status: "Moves between doors" }
  };

  const shell = new Arcade.GameShell({
    gameId: "desi-detective",
    hud: [
      { id: "chapter", label: "Scene", value: "1" },
      { id: "clues", label: "Clues", value: "0" },
      { id: "score", label: "Case Score", value: "0" },
      { id: "time", label: "Time", value: "00:00" }
    ],
    board: {
      id: "main",
      title: "Top 10 Case Files",
      compare: (a, b) => (b.score - a.score) || (a.time - b.time),
      renderEntry: (entry, index, escapeHtml) => `
        <div class="board-row">
          <span class="board-rank">#${index + 1}</span>
          <span class="board-name">${escapeHtml(entry.name)}</span>
          <span class="board-score">${entry.score}</span>
          <span class="board-meta">${escapeHtml(entry.ending)} · ${Arcade.formatTime(entry.time)}</span>
        </div>
      `,
      summarize: (entry, formatTime) => `${entry.ending} · ${formatTime(entry.time)} by ${entry.name}`
    },
    noteTitle: "Case Board",
    noteBody: "Track clues, watch the cold room lead, and use full evidence before closing the case.",
    onStart: startGame,
    onRestart: restartGame
  });

  let progress = progressStore.load({ endings: [], chapterSelectUnlocked: false });
  let state = null;
  let timerId = 0;

  function createState(startNode = "intro") {
    return {
      nodeId: startNode,
      clues: new Set(),
      trust: { farid: 0, meera: 0, tapan: 0 },
      score: 0,
      startedAt: Date.now()
    };
  }

  function applyChoice(choice) {
    if (choice.requires && !choice.requires.every((clue) => state.clues.has(clue))) {
      shell.setStatus("That route needs more evidence first.");
      shell.audio.cue("fail");
      return;
    }

    if (choice.addClue) {
      state.clues.add(choice.addClue);
      state.score += 120;
    }
    if (choice.trust) {
      Object.entries(choice.trust).forEach(([key, value]) => {
        state.trust[key] += value;
      });
    }
    state.score += 35;
    state.nodeId = choice.next;
    shell.audio.cue("click");
    render();
  }

  function finishCase(node) {
    window.clearTimeout(timerId);
    const time = Math.floor((Date.now() - state.startedAt) / 1000);
    const endingBonus = node.endingLabel === "Cold room truth" ? 600 : node.endingLabel === "Meera cornered" ? 320 : 220;
    const trustBonus = Object.values(state.trust).reduce((sum, value) => sum + Math.max(0, value) * 20, 0);
    const score = state.score + state.clues.size * 90 + endingBonus + trustBonus - time * 3;
    progress.endings = Array.from(new Set([...progress.endings, node.endingLabel]));
    if (progress.endings.length > 0) {
      progress.chapterSelectUnlocked = true;
    }
    progressStore.save(progress);
    shell.finishRun({
      title: node.title,
      text: node.text,
      stats: [
        `Ending: ${node.endingLabel}`,
        `Case Score: ${score}`,
        `Clues Found: ${state.clues.size}`,
        `Time: ${Arcade.formatTime(time)}`
      ],
      entry: {
        score,
        time,
        ending: node.endingLabel
      }
    });
  }

  function tickTimer() {
    const elapsed = Math.floor((Date.now() - state.startedAt) / 1000);
    shell.updateStat("time", Arcade.formatTime(elapsed));
    timerId = window.setTimeout(tickTimer, 500);
  }

  function render() {
    const node = nodes[state.nodeId];
    shell.updateStat("chapter", state.nodeId);
    shell.updateStat("clues", state.clues.size);
    shell.updateStat("score", state.score);
    shell.updateStat("time", Arcade.formatTime(Math.floor((Date.now() - state.startedAt) / 1000)));

    if (node.ending) {
      finishCase(node);
      return;
    }

    const chapterButtons = progress.chapterSelectUnlocked
      ? `
        <div class="chapter-grid">
          <button class="choice-card" type="button" data-start="intro"><strong>Start</strong><span>Full case from scene one.</span></button>
          <button class="choice-card" type="button" data-start="farid"><strong>Courtyard</strong><span>Jump back to Farid.</span></button>
          <button class="choice-card" type="button" data-start="meera"><strong>Archives</strong><span>Replay the keycard branch.</span></button>
          <button class="choice-card" type="button" data-start="tapan"><strong>Rooftop</strong><span>Replay the courier branch.</span></button>
        </div>
      `
      : `<p class="muted-line">Unlock one ending to open chapter select.</p>`;

    root.innerHTML = `
      <section class="dialogue-card">
        <p class="overlay-kicker">${node.title}</p>
        <h3>${node.speaker}</h3>
        <div class="dialogue-line"><p>${node.text}</p></div>
        <div class="choice-grid">
          ${node.choices.map((choice, index) => `
            <button class="choice-card" type="button" data-choice="${index}">
              <strong>${choice.label}</strong>
              <span>${choice.requires ? "Needs extra clues." : "Advance the case."}</span>
            </button>
          `).join("")}
        </div>
      </section>
      <section class="case-board">
        <div class="challenge-panel">
          <h3>Clues</h3>
          <div class="mini-list">
            ${Array.from(state.clues).map((clue) => `<div class="dialogue-line">${clue}</div>`).join("") || "<p class='muted-line'>No clues logged yet.</p>"}
          </div>
        </div>
        <div class="challenge-panel">
          <h3>Suspects</h3>
          <div class="suspect-grid">
            ${Object.entries(suspectBase).map(([key, suspect]) => `
              <div class="suspect-card">
                <strong>${suspect.name}</strong>
                <p>${suspect.role}</p>
                <p class="progress-pill">Trust ${state.trust[key] >= 0 ? "+" : ""}${state.trust[key]}</p>
              </div>
            `).join("")}
          </div>
        </div>
        <div class="challenge-panel">
          <h3>Chapter Select</h3>
          ${chapterButtons}
        </div>
      </section>
    `;

    root.querySelectorAll("[data-choice]").forEach((button) => {
      button.addEventListener("click", () => {
        const index = Number(button.getAttribute("data-choice"));
        applyChoice(node.choices[index]);
      });
    });

    root.querySelectorAll("[data-start]").forEach((button) => {
      button.addEventListener("click", () => {
        state = createState(button.getAttribute("data-start"));
        shell.audio.cue("click");
        render();
      });
    });
  }

  function resetState(startNode = "intro") {
    window.clearTimeout(timerId);
    state = createState(startNode);
    tickTimer();
    render();
  }

  function startGame() {
    resetState();
  }

  function restartGame() {
    resetState();
  }
})();
