const revealNodes = document.querySelectorAll("[data-reveal]");
const headerShell = document.querySelector(".header-shell");
const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelectorAll(".nav a");

const comboMemory = new Map();

const comboBanks = {
  pulse: {
    a: [
      "{target} abhi",
      "{target} seedha",
      "{target} proper",
      "{target} full",
      "{target} bilkul",
      "{target} thoda",
      "{target} silent but",
      "{target} mast",
      "{target} andar se",
      "{target} bahar se",
      "{target} kaafi",
      "{target} ziddi",
    ],
    b: [
      "on",
      "active",
      "ready",
      "garam",
      "locked",
      "set",
      "charged",
      "fresh",
      "sharp",
      "fit",
      "awake",
      "alive",
    ],
    c: [
      "hai",
      "bhai",
      "boss",
      "aaj",
      "abhi",
      "scene me",
      "yahin",
      "iss page par",
      "rukega nahi",
      "andar tak",
      "seedha",
      "full time",
    ],
  },
  amount: {
    a: [
      "Rs {amount} ka button",
      "Rs {amount} ka tap",
      "Rs {amount} ka mood",
      "Rs {amount} ka signal",
      "Rs {amount} ka round",
      "Rs {amount} ki entry",
      "Rs {amount} ka scene",
      "Rs {amount} ka press",
      "Rs {amount} ka plan",
      "Rs {amount} ka pop",
      "Rs {amount} ka move",
      "Rs {amount} ka turn",
    ],
    b: [
      "abhi ready",
      "full active",
      "seedha on",
      "proper set",
      "andar se charged",
      "silent but strong",
      "QR ke saath ready",
      "UPI pe locked",
      "comic mode me",
      "thoda loud",
      "mast garam",
      "full tight",
    ],
    c: [
      "hai",
      "bhai",
      "boss",
      "aaj",
      "abhi",
      "scan ke liye",
      "tap ke liye",
      "scene me",
      "seedha",
      "rukega nahi",
      "iss round me",
      "page par",
    ],
  },
  returnTitle: {
    a: [
      "Wapas aa gaye",
      "Phir aa tapke",
      "Return ho gaya",
      "UPI se laut aaye",
      "Scan ke baad aa gaye",
      "Back maar ke aa gaye",
      "Dobara landing ho gayi",
      "Browser ne fir pakad liya",
      "Scene se mud ke aa gaye",
      "Payment side se ghoom ke aa gaye",
      "Panel ke paas fir aa gaye",
      "Exit maar ke phir aa gaye",
    ],
    b: [
      "respect wala",
      "mast wala",
      "seedha wala",
      "thoda filmy",
      "bilkul clean",
      "proper comic",
      "halkasa wild",
      "andar tak funny",
      "silent but solid",
      "extra sharp",
      "seedha garam",
      "full odd",
    ],
    c: [
      "entry",
      "return",
      "scene",
      "moment",
      "combo",
      "landing",
      "round",
      "move",
      "shot",
      "turn",
      "timing",
      "drop",
    ],
  },
  returnText: {
    a: [
      "Page ne dekh liya",
      "Comic panel ne note kar liya",
      "QR ab seedha muskura raha hai",
      "Button bhi khush hai",
      "Scene ab thoda aur tight hai",
      "Ye return simple nahi tha",
      "Donate box ab extra seedha lag raha hai",
      "Backdrop ne bhi signal pakad liya",
      "Yeh round record ho gaya",
      "UPI wali hawa page me aa gayi",
      "Panel ke andar energy aa gayi",
      "Browser bhi ab shant hai",
    ],
    b: [
      "agar bheja ho to",
      "agar scan ho gaya ho to",
      "agar round complete hua ho to",
      "agar payment nikal gaya ho to",
      "agar scene ban gaya ho to",
      "agar tap sahi laga ho to",
      "agar app ne kaam kar diya ho to",
      "agar amount udhar pahunch gaya ho to",
      "agar QR se kaam ban gaya ho to",
      "agar mann kar gaya ho to",
      "agar click se zyada hua ho to",
      "agar comic luck sath tha to",
    ],
    c: [
      "dil se thank you.",
      "respect full mil gaya.",
      "scene mast ho gaya.",
      "panel ne salute maara.",
      "yeh round solid tha.",
      "ab hawa alag hai.",
      "ab maza aa gaya.",
      "ab page aur zinda lag raha hai.",
      "ab donate box seedha lag raha hai.",
      "ab return worth tha.",
      "ab button bhi set lag raha hai.",
      "ab hasna banta hai.",
    ],
  },
  nudge: {
    a: [
      "{target} ek aur",
      "{target} thoda aur",
      "{target} seedha ek",
      "{target} fir se ek",
      "{target} bas ek",
      "{target} halka sa",
      "{target} jab mann kare",
      "{target} mood bane to",
      "{target} agar himmat ho to",
      "{target} agar dil bole to",
      "{target} abhi bhi",
      "{target} phir kabhi bhi",
    ],
    b: [
      "tap maar do",
      "round de do",
      "scan chala do",
      "press kar do",
      "chance de do",
      "button dabaa do",
      "entry kara do",
      "scene bana do",
      "QR khulwa do",
      "UPI chala do",
      "move maar do",
      "shot de do",
    ],
    c: [
      "bhai",
      "boss",
      "aaj",
      "abhi",
      "seedha",
      "mast tareeke se",
      "jab mood bane",
      "bina soch ke",
      "halke smile ke saath",
      "comic style me",
      "agar dil kare",
      "warna scroll kar lo",
    ],
  },
};

const typingPhrases = [
  "Aspiring Software Engineer",
  "Python + Web + AI",
  "Build karke seekh raha hoon",
  "Side project mode on",
  "Theory se zyada shipping",
];

function fillTemplate(text, vars = {}) {
  return text.replace(/\{(\w+)\}/g, (_, key) => String(vars[key] ?? ""));
}

function pickUniqueTriple(key, bank) {
  const total = bank.a.length * bank.b.length * bank.c.length;
  let used = comboMemory.get(key);
  if (!(used instanceof Set)) {
    used = new Set();
  }
  if (used.size >= total) {
    used.clear();
  }

  let choice = "0|0|0";
  for (let attempt = 0; attempt < 60; attempt += 1) {
    const first = Math.floor(Math.random() * bank.a.length);
    const second = Math.floor(Math.random() * bank.b.length);
    const third = Math.floor(Math.random() * bank.c.length);
    const token = `${first}|${second}|${third}`;
    if (!used.has(token)) {
      choice = token;
      break;
    }
  }

  used.add(choice);
  comboMemory.set(key, used);
  const [firstIndex, secondIndex, thirdIndex] = choice.split("|").map(Number);
  return [bank.a[firstIndex], bank.b[secondIndex], bank.c[thirdIndex]];
}

function nextCombo(key, bankName, vars = {}) {
  const bank = comboBanks[bankName];
  if (!bank) {
    return "";
  }

  const [one, two, three] = pickUniqueTriple(key, bank);
  return [fillTemplate(one, vars), fillTemplate(two, vars), fillTemplate(three, vars)]
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

function setText(id, value) {
  const node = document.getElementById(id);
  if (node instanceof HTMLElement) {
    node.textContent = value;
  }
}

function setupReveal() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.18 }
  );

  revealNodes.forEach((node) => observer.observe(node));
}

function setupMatrixRain() {
  const canvas = document.getElementById("matrix-rain");
  if (!(canvas instanceof HTMLCanvasElement)) {
    return;
  }

  const context = canvas.getContext("2d");
  if (!context) {
    return;
  }

  const fontSize = 14;
  const glyphs = "01<>/$#%*+";
  let columns = 0;
  let drops = [];

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    columns = Math.floor(canvas.width / fontSize);
    drops = Array.from({ length: columns }, () => Math.floor(Math.random() * -30));
  }

  function draw() {
    context.fillStyle = "rgba(4, 8, 18, 0.11)";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.font = `${fontSize}px "JetBrains Mono", monospace`;

    drops.forEach((drop, index) => {
      const glyph = glyphs[Math.floor(Math.random() * glyphs.length)];
      const x = index * fontSize;
      const y = drop * fontSize;

      context.fillStyle = Math.random() > 0.85 ? "#8e7cff" : "#76ecff";
      context.fillText(glyph, x, y);

      if (y > canvas.height && Math.random() > 0.975) {
        drops[index] = 0;
      } else {
        drops[index] += 1;
      }
    });

    requestAnimationFrame(draw);
  }

  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);
  draw();
}

function setupMenu() {
  if (!(headerShell instanceof HTMLElement) || !(menuToggle instanceof HTMLButtonElement)) {
    return;
  }

  const closeMenu = () => {
    headerShell.classList.remove("nav-open");
    menuToggle.setAttribute("aria-expanded", "false");
  };

  menuToggle.addEventListener("click", () => {
    const isOpen = headerShell.classList.contains("nav-open");
    if (isOpen) {
      closeMenu();
      return;
    }

    headerShell.classList.add("nav-open");
    menuToggle.setAttribute("aria-expanded", "true");
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("click", (event) => {
    if (headerShell instanceof HTMLElement && !headerShell.contains(event.target)) {
      closeMenu();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
    }
  });
}

function setupMouseAnimations() {
  const glowTargets = document.querySelectorAll(
    ".button, .menu-toggle, .portrait-card, .hero-signal-card, .info-card, .project-card, .contact-link-button, .comic-panel, .amount-card, .donation-message-box, .qr-shell, .nav a"
  );
  const tiltTargets = document.querySelectorAll(
    ".portrait-card, .hero-signal-card, .project-card, .comic-panel, .amount-card, .qr-shell"
  );

  glowTargets.forEach((node) => {
    if (!(node instanceof HTMLElement)) {
      return;
    }

    node.classList.add("mouse-reactive");

    node.addEventListener("pointermove", (event) => {
      const rect = node.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      node.style.setProperty("--mx", `${x}px`);
      node.style.setProperty("--my", `${y}px`);
      node.classList.add("active-hover");
    });

    node.addEventListener("pointerleave", () => {
      node.classList.remove("active-hover");
    });
  });

  tiltTargets.forEach((node) => {
    if (!(node instanceof HTMLElement)) {
      return;
    }

    node.addEventListener("pointermove", (event) => {
      const rect = node.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const rotateY = ((x / rect.width) - 0.5) * 5;
      const rotateX = ((y / rect.height) - 0.5) * -5;
      node.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });

    node.addEventListener("pointerleave", () => {
      node.style.transform = "";
    });
  });
}

function setupTypewriter() {
  const target = document.getElementById("hero-typing");
  if (!(target instanceof HTMLElement)) {
    return;
  }

  let phraseIndex = 0;
  let charIndex = 0;
  let deleting = false;

  function tick() {
    const phrase = typingPhrases[phraseIndex];
    if (!deleting) {
      charIndex += 1;
      target.textContent = phrase.slice(0, charIndex);
      if (charIndex === phrase.length) {
        deleting = true;
        window.setTimeout(tick, 1200);
        return;
      }
      window.setTimeout(tick, 85);
      return;
    }

    charIndex -= 1;
    target.textContent = phrase.slice(0, charIndex);
    if (charIndex === 0) {
      deleting = false;
      phraseIndex = (phraseIndex + 1) % typingPhrases.length;
      window.setTimeout(tick, 280);
      return;
    }
    window.setTimeout(tick, 45);
  }

  tick();
}

function setupComedyCopy() {
  setText("hero-lede", nextCombo("hero-lede", "pulse", { target: "Code mood" }));
  setText("hero-line", nextCombo("hero-line", "nudge", { target: "Scroll" }));
  setText("hero-card-title", nextCombo("hero-card-title", "pulse", { target: "Black shirt aura" }));
  setText("hero-card-copy", nextCombo("hero-card-copy", "pulse", { target: "Neeche ka scene" }));
  setText("photo-title", nextCombo("photo-title", "pulse", { target: "Original upload" }));
  setText("photo-copy-one", nextCombo("photo-copy-one", "pulse", { target: "Photo ka frame" }));
  setText("photo-copy-two", nextCombo("photo-copy-two", "pulse", { target: "Crop ka drama" }));
  setText("photo-caption", nextCombo("photo-caption", "pulse", { target: "Black shirt face" }));
  setText("footer-bottom-line", nextCombo("footer-bottom-line", "nudge", { target: "Exit se pehle" }));
  setText("donate-heading", nextCombo("donate-heading", "pulse", { target: "Donate scene" }));
  setText("donate-lede", nextCombo("donate-lede", "pulse", { target: "Amount choose karo" }));
  setText("donate-bottom-line", nextCombo("donate-bottom-line", "nudge", { target: "Nikalne se pehle" }));

  window.setInterval(() => {
    if (document.hidden) {
      return;
    }

    setText("hero-line", nextCombo("hero-line-rotate", "nudge", { target: "Scroll" }));
    setText("photo-copy-two", nextCombo("photo-copy-two-rotate", "pulse", { target: "Photo ka mood" }));
    setText("footer-bottom-line", nextCombo("footer-bottom-line-rotate", "nudge", { target: "Exit se pehle" }));
    setText("donate-bottom-line", nextCombo("donate-bottom-line-rotate", "nudge", { target: "Donate" }));
  }, 9000);
}

async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
}

function setupDonationExperience() {
  const donateRoot = document.querySelector("[data-donate-page]");
  if (!(donateRoot instanceof HTMLElement)) {
    return;
  }

  const amountCards = donateRoot.querySelectorAll(".amount-card");
  const customAmountInput = donateRoot.querySelector("#custom-amount");
  const donationKicker = donateRoot.querySelector("#donation-kicker");
  const donationText = donateRoot.querySelector("#donation-text");
  const selectedAmountLabel = donateRoot.querySelector("#selected-amount-label");
  const openUpiButton = donateRoot.querySelector("#open-upi");
  const copyUpiButton = donateRoot.querySelector("#copy-upi");
  const upiId = donateRoot.querySelector("#upi-id");
  const qrCaption = donateRoot.querySelector("#qr-caption");
  const qrCodeNode = donateRoot.querySelector("#qr-code");
  const comicStage = document.getElementById("comic-stage");
  const comicPanel = document.querySelector(".comic-panel");
  const donationPanel = document.querySelector(".donation-panel");
  const comicSpeech = document.getElementById("comic-speech");
  const comicCore = document.getElementById("comic-core");
  const comicTitle = document.getElementById("comic-title");
  const comicCopy = document.getElementById("comic-copy");
  const comicStickerTop = document.getElementById("comic-sticker-top");
  const comicStickerSide = document.getElementById("comic-sticker-side");
  const donationNudge = document.getElementById("donation-nudge");
  const donateBottomLine = document.getElementById("donate-bottom-line");
  const thanksOverlay = document.getElementById("thanks-overlay");
  const thanksClose = document.getElementById("thanks-close");
  const thanksDismiss = document.getElementById("thanks-dismiss");
  const thanksAgain = document.getElementById("thanks-donate-again");
  const thanksBadge = document.getElementById("thanks-badge");
  const thanksOverlayTitle = document.getElementById("thanks-overlay-title");
  const thanksOverlayText = document.getElementById("thanks-overlay-text");
  const thanksOverlayNudge = document.getElementById("thanks-overlay-nudge");

  const upiPayeeId = "NEESHANT01@PNB";
  const upiPayeeName = "Nishant Kumar";
  const transactionNote = "Support Nishant";
  const pendingKey = "donate-return-state";
  let selectedAmount = "10";
  let qrInstance = null;
  let launchArmed = false;
  let hiddenOnce = false;

  const themes = {
    "10": { top: "TAP", side: "SCAN", a: "rgba(255, 215, 107, 0.28)", b: "rgba(118, 236, 255, 0.24)" },
    "20": { top: "BOOST", side: "GO", a: "rgba(118, 236, 255, 0.26)", b: "rgba(142, 124, 255, 0.24)" },
    "50": { top: "SCENE", side: "FAST", a: "rgba(255, 93, 183, 0.22)", b: "rgba(118, 236, 255, 0.24)" },
    "100": { top: "HERO", side: "BOSS", a: "rgba(255, 93, 183, 0.26)", b: "rgba(255, 215, 107, 0.24)" },
  };

  function getTheme(amount) {
    if (themes[amount]) {
      return themes[amount];
    }

    const numeric = Number.parseInt(amount, 10);
    if (Number.isFinite(numeric) && numeric >= 100) {
      return themes["100"];
    }
    if (Number.isFinite(numeric) && numeric >= 50) {
      return themes["50"];
    }
    if (Number.isFinite(numeric) && numeric >= 20) {
      return themes["20"];
    }
    return themes["10"];
  }

  function buildUpiUri(amount) {
    const params = new URLSearchParams({
      pa: upiPayeeId,
      pn: upiPayeeName,
      tn: transactionNote,
      cu: "INR",
      am: amount,
    });
    return `upi://pay?${params.toString()}`;
  }

  function renderQrCode(uri) {
    if (!(qrCodeNode instanceof HTMLElement) || typeof QRCode === "undefined") {
      return;
    }

    if (!qrInstance) {
      qrInstance = new QRCode(qrCodeNode, {
        width: 260,
        height: 260,
        colorDark: "#061018",
        colorLight: "#f8fbff",
        correctLevel: QRCode.CorrectLevel.H,
      });
    }

    qrInstance.clear();
    qrInstance.makeCode(uri);
  }

  function bump(node) {
    if (!(node instanceof HTMLElement)) {
      return;
    }
    node.classList.remove("bump");
    void node.offsetWidth;
    node.classList.add("bump");
    window.setTimeout(() => node.classList.remove("bump"), 260);
  }

  function showThanksOverlay(amount) {
    if (!(thanksOverlay instanceof HTMLElement)) {
      return;
    }

    if (thanksBadge instanceof HTMLElement) {
      thanksBadge.textContent = nextCombo(`thanks-badge-${amount}`, "pulse", { target: "WELCOME BACK" });
    }
    if (thanksOverlayTitle instanceof HTMLElement) {
      thanksOverlayTitle.textContent = nextCombo(`thanks-title-${amount}`, "returnTitle");
    }
    if (thanksOverlayText instanceof HTMLElement) {
      thanksOverlayText.textContent = nextCombo(`thanks-text-${amount}`, "returnText");
    }
    if (thanksOverlayNudge instanceof HTMLElement) {
      thanksOverlayNudge.textContent = nextCombo(`thanks-nudge-${amount}`, "nudge", { target: "Dil kare to" });
    }

    thanksOverlay.hidden = false;
    thanksOverlay.setAttribute("aria-hidden", "false");
    document.body.classList.add("overlay-open");
  }

  function closeThanksOverlay() {
    if (!(thanksOverlay instanceof HTMLElement)) {
      return;
    }
    thanksOverlay.hidden = true;
    thanksOverlay.setAttribute("aria-hidden", "true");
    document.body.classList.remove("overlay-open");
  }

  function maybeShowReturnOverlay() {
    const raw = window.sessionStorage.getItem(pendingKey);
    if (!raw) {
      return;
    }

    try {
      const data = JSON.parse(raw);
      const amount = String(data.amount ?? selectedAmount);
      const age = Date.now() - Number(data.time ?? 0);
      if (hiddenOnce || age > 1500) {
        selectedAmount = amount;
        if (openUpiButton instanceof HTMLAnchorElement) {
          openUpiButton.textContent = "Open UPI";
        }
        showThanksOverlay(amount);
        window.sessionStorage.removeItem(pendingKey);
        launchArmed = false;
        hiddenOnce = false;
      }
    } catch {
      window.sessionStorage.removeItem(pendingKey);
    }
  }

  function updateDonationState(amount) {
    selectedAmount = amount;
    const upiUri = buildUpiUri(amount);
    const theme = getTheme(amount);

    if (donationKicker instanceof HTMLElement) {
      donationKicker.textContent = nextCombo(`kicker-${amount}`, "amount", { amount });
    }
    if (donationText instanceof HTMLElement) {
      donationText.textContent = nextCombo(`text-${amount}`, "amount", { amount });
    }
    if (selectedAmountLabel instanceof HTMLElement) {
      selectedAmountLabel.textContent = `Rs ${amount}`;
    }
    if (openUpiButton instanceof HTMLAnchorElement) {
      openUpiButton.href = upiUri;
      openUpiButton.textContent = "Open UPI";
    }
    if (copyUpiButton instanceof HTMLButtonElement) {
      copyUpiButton.textContent = "Copy UPI";
    }
    if (qrCaption instanceof HTMLElement) {
      qrCaption.textContent = nextCombo(`qr-${amount}`, "amount", { amount });
    }
    if (comicSpeech instanceof HTMLElement) {
      comicSpeech.textContent = nextCombo(`speech-${amount}`, "amount", { amount });
    }
    if (comicTitle instanceof HTMLElement) {
      comicTitle.textContent = nextCombo(`title-${amount}`, "amount", { amount });
    }
    if (comicCopy instanceof HTMLElement) {
      comicCopy.textContent = nextCombo(`copy-${amount}`, "amount", { amount });
    }
    if (donationNudge instanceof HTMLElement) {
      donationNudge.textContent = nextCombo(`nudge-${amount}`, "nudge", { target: `Rs ${amount}` });
    }
    if (donateBottomLine instanceof HTMLElement) {
      donateBottomLine.textContent = nextCombo(`bottom-${amount}`, "nudge", { target: `Rs ${amount}` });
    }
    if (comicCore instanceof HTMLElement) {
      comicCore.textContent = `Rs ${amount}`;
    }
    if (comicStickerTop instanceof HTMLElement) {
      comicStickerTop.textContent = theme.top;
    }
    if (comicStickerSide instanceof HTMLElement) {
      comicStickerSide.textContent = theme.side;
    }
    if (comicStage instanceof HTMLElement) {
      comicStage.style.setProperty("--comic-a", theme.a);
      comicStage.style.setProperty("--comic-b", theme.b);
    }

    renderQrCode(upiUri);
    bump(comicPanel);
    bump(donationPanel);
  }

  amountCards.forEach((card) => {
    if (!(card instanceof HTMLButtonElement)) {
      return;
    }

    card.addEventListener("click", () => {
      amountCards.forEach((otherCard) => {
        if (otherCard instanceof HTMLElement) {
          otherCard.classList.remove("active");
        }
      });
      card.classList.add("active");

      if (customAmountInput instanceof HTMLInputElement) {
        customAmountInput.value = "";
      }

      updateDonationState(card.dataset.amount ?? "10");
    });
  });

  if (customAmountInput instanceof HTMLInputElement) {
    customAmountInput.addEventListener("input", () => {
      const trimmed = customAmountInput.value.trim();
      if (!trimmed) {
        const first = amountCards[0];
        if (first instanceof HTMLButtonElement) {
          first.click();
        }
        return;
      }

      const numeric = Number.parseInt(trimmed, 10);
      if (!Number.isFinite(numeric) || numeric <= 0) {
        return;
      }

      amountCards.forEach((card) => {
        if (card instanceof HTMLElement) {
          card.classList.remove("active");
        }
      });

      updateDonationState(String(numeric));
    });
  }

  if (openUpiButton instanceof HTMLAnchorElement) {
    openUpiButton.addEventListener("click", () => {
      launchArmed = true;
      hiddenOnce = false;
      window.sessionStorage.setItem(
        pendingKey,
        JSON.stringify({
          amount: selectedAmount,
          time: Date.now(),
        })
      );
      openUpiButton.textContent = "Opening UPI";
    });
  }

  if (copyUpiButton instanceof HTMLButtonElement && upiId instanceof HTMLElement) {
    copyUpiButton.addEventListener("click", async () => {
      try {
        await copyText(upiId.textContent ?? upiPayeeId);
        copyUpiButton.textContent = "UPI Copied";
      } catch {
        copyUpiButton.textContent = "Copy Failed";
      }
    });
  }

  if (thanksClose instanceof HTMLButtonElement) {
    thanksClose.addEventListener("click", closeThanksOverlay);
  }
  if (thanksDismiss instanceof HTMLButtonElement) {
    thanksDismiss.addEventListener("click", closeThanksOverlay);
  }
  if (thanksAgain instanceof HTMLButtonElement) {
    thanksAgain.addEventListener("click", () => {
      closeThanksOverlay();
      donateRoot.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }
  if (thanksOverlay instanceof HTMLElement) {
    thanksOverlay.addEventListener("click", (event) => {
      if (event.target === thanksOverlay) {
        closeThanksOverlay();
      }
    });
  }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden && launchArmed) {
      hiddenOnce = true;
      return;
    }
    if (!document.hidden) {
      maybeShowReturnOverlay();
    }
  });

  window.addEventListener("focus", () => {
    maybeShowReturnOverlay();
  });

  window.addEventListener("pageshow", () => {
    maybeShowReturnOverlay();
  });

  updateDonationState("10");
}

setupReveal();
setupMatrixRain();
setupMenu();
setupMouseAnimations();
setupTypewriter();
setupComedyCopy();
setupDonationExperience();
