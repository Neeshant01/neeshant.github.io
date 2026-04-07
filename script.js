const revealNodes = document.querySelectorAll("[data-reveal]");
const headerShell = document.querySelector(".header-shell");
const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelectorAll(".nav a");

function setText(id, value) {
  const node = document.getElementById(id);
  if (node instanceof HTMLElement) {
    node.textContent = value;
  }
}

function setupReveal() {
  if (!revealNodes.length) {
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16 }
  );

  revealNodes.forEach((node) => {
    node.classList.add("reveal-ready");
    observer.observe(node);
  });
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
    columns = Math.ceil(canvas.width / fontSize);
    drops = new Array(columns).fill(1);
  }

  function drawFrame() {
    context.fillStyle = "rgba(6, 12, 24, 0.14)";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#76ecff";
    context.font = `${fontSize}px JetBrains Mono`;

    for (let index = 0; index < drops.length; index += 1) {
      const glyph = glyphs[Math.floor(Math.random() * glyphs.length)];
      const x = index * fontSize;
      const y = drops[index] * fontSize;
      context.fillText(glyph, x, y);

      if (y > canvas.height && Math.random() > 0.975) {
        drops[index] = 0;
      }

      drops[index] += 1;
    }
  }

  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);
  window.setInterval(drawFrame, 74);
}

function setupMenu() {
  if (!(menuToggle instanceof HTMLButtonElement) || !(headerShell instanceof HTMLElement)) {
    return;
  }

  function closeMenu() {
    headerShell.classList.remove("nav-open");
    menuToggle.setAttribute("aria-expanded", "false");
  }

  menuToggle.addEventListener("click", () => {
    const open = headerShell.classList.toggle("nav-open");
    menuToggle.setAttribute("aria-expanded", String(open));
  });

  navLinks.forEach((link) => link.addEventListener("click", closeMenu));

  document.addEventListener("click", (event) => {
    if (!(event.target instanceof Node) || headerShell.contains(event.target)) {
      return;
    }
    closeMenu();
  });
}

function setupTilt() {
  const tiltTargets = document.querySelectorAll(
    ".portrait-card, .info-card, .project-card, .game-showcase-card, .contact-hub, .comic-panel, .donation-panel, .launcher-card, .hero-spotlight"
  );

  tiltTargets.forEach((target) => {
    if (!(target instanceof HTMLElement)) {
      return;
    }

    target.classList.add("tilt-ready");

    target.addEventListener("pointermove", (event) => {
      const bounds = target.getBoundingClientRect();
      const offsetX = (event.clientX - bounds.left) / bounds.width - 0.5;
      const offsetY = (event.clientY - bounds.top) / bounds.height - 0.5;
      const rotateY = offsetX * 8;
      const rotateX = offsetY * -8;
      target.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });

    target.addEventListener("pointerleave", () => {
      target.style.transform = "";
    });
  });
}

function setupHeroTyping() {
  const target = document.getElementById("hero-typing");
  if (!(target instanceof HTMLElement)) {
    return;
  }

  const phrases = [
    "Student developer shipping fast.",
    "Building browser games with real feedback.",
    "Frontend polish with playable ideas.",
    "Projects, systems, and interactive experiments."
  ];

  let phraseIndex = 0;
  let letterIndex = 0;
  let deleting = false;

  function tick() {
    const currentPhrase = phrases[phraseIndex];

    if (!deleting) {
      letterIndex += 1;
      target.textContent = currentPhrase.slice(0, letterIndex);
      if (letterIndex >= currentPhrase.length) {
        deleting = true;
        window.setTimeout(tick, 1400);
        return;
      }
    } else {
      letterIndex -= 1;
      target.textContent = currentPhrase.slice(0, letterIndex);
      if (letterIndex <= 0) {
        deleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
      }
    }

    window.setTimeout(tick, deleting ? 32 : 48);
  }

  tick();
}

function setupDonatePage() {
  const donateRoot = document.querySelector("[data-donate-page]");
  if (!(donateRoot instanceof HTMLElement)) {
    return;
  }

  const amountCards = donateRoot.querySelectorAll(".amount-card");
  const customAmountInput = donateRoot.querySelector("#custom-amount");
  const openUpi = donateRoot.querySelector("#open-upi");
  const copyUpi = donateRoot.querySelector("#copy-upi");
  const qrCodeNode = donateRoot.querySelector("#qr-code");
  const thanksOverlay = document.getElementById("thanks-overlay");
  const thanksDismiss = document.getElementById("thanks-dismiss");
  const thanksClose = document.getElementById("thanks-close");

  const upiId = "NEESHANT01@PNB";
  const upiName = "Nishant Kumar";
  let selectedAmount = 10;

  const copyVariants = {
    10: {
      text: "A quick support tap keeps the build moving.",
      title: "Quick support. Clean flow.",
      copy: "Small support helps fund more builds, more polish, and more time spent shipping.",
      speech: "Small amount. Instant QR.",
      nudge: "Quick support, clean checkout."
    },
    20: {
      text: "A coffee-sized push for the next round of features.",
      title: "Coffee boost unlocked.",
      copy: "A small jump that still makes a real difference when repeated over time.",
      speech: "Coffee-tier support ready.",
      nudge: "A neat step up without adding friction."
    },
    50: {
      text: "Strong support for more polish, QA, and longer build sessions.",
      title: "Serious support mode.",
      copy: "This tier feels meaningful and keeps the overall flow simple.",
      speech: "Stronger push. Same clean flow.",
      nudge: "A polished page deserves a polished support tier."
    },
    100: {
      text: "A bigger push toward more ambitious builds and more time on the craft.",
      title: "Big push selected.",
      copy: "A high-impact support tier for backing the work in a bigger way.",
      speech: "High-impact support ready.",
      nudge: "If you want to back the build properly, this is the cleanest jump."
    }
  };

  function buildUpiUrl(amount) {
    const params = new URLSearchParams({
      pa: upiId,
      pn: upiName,
      tn: "Support Nishant",
      cu: "INR",
      am: String(amount)
    });
    return `upi://pay?${params.toString()}`;
  }

  function renderQr(url) {
    if (!(qrCodeNode instanceof HTMLElement) || typeof QRCode === "undefined") {
      return;
    }

    qrCodeNode.innerHTML = "";
    new QRCode(qrCodeNode, {
      text: url,
      width: 224,
      height: 224,
      colorDark: "#081020",
      colorLight: "#f5f7ff",
      correctLevel: QRCode.CorrectLevel.H
    });
  }

  function resolveAmount() {
    if (
      customAmountInput instanceof HTMLInputElement &&
      customAmountInput.value &&
      Number(customAmountInput.value) > 0
    ) {
      return Number(customAmountInput.value);
    }
    return selectedAmount;
  }

  function applyContent(amount) {
    const nearestPreset = copyVariants[amount] ? amount : amount < 20 ? 10 : amount < 50 ? 20 : amount < 100 ? 50 : 100;
    const content = copyVariants[nearestPreset];
    const label = `Rs ${amount}`;
    const url = buildUpiUrl(amount);

    setText("selected-amount-label", label);
    setText("donation-kicker", `${label} selected.`);
    setText("donation-text", content.text);
    setText("comic-core", label);
    setText("comic-title", content.title);
    setText("comic-copy", content.copy);
    setText("comic-speech", content.speech);
    setText("donation-nudge", content.nudge);
    setText("qr-caption", `QR generated for ${label}.`);

    if (openUpi instanceof HTMLAnchorElement) {
      openUpi.href = url;
    }

    renderQr(url);
  }

  amountCards.forEach((card) => {
    card.addEventListener("click", () => {
      if (!(card instanceof HTMLButtonElement)) {
        return;
      }
      selectedAmount = Number(card.dataset.amount ?? "10");
      amountCards.forEach((item) => item.classList.toggle("active", item === card));
      if (customAmountInput instanceof HTMLInputElement) {
        customAmountInput.value = "";
      }
      applyContent(selectedAmount);
    });
  });

  if (customAmountInput instanceof HTMLInputElement) {
    customAmountInput.addEventListener("input", () => {
      const parsed = Number(customAmountInput.value);
      if (Number.isFinite(parsed) && parsed > 0) {
        amountCards.forEach((card) => card.classList.remove("active"));
        applyContent(parsed);
      }
    });
  }

  if (copyUpi instanceof HTMLButtonElement) {
    copyUpi.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(upiId);
        copyUpi.textContent = "Copied";
        window.setTimeout(() => {
          copyUpi.textContent = "Copy UPI ID";
        }, 1200);
      } catch (error) {
        copyUpi.textContent = "Copy Failed";
        window.setTimeout(() => {
          copyUpi.textContent = "Copy UPI ID";
        }, 1200);
      }
    });
  }

  if (openUpi instanceof HTMLAnchorElement) {
    openUpi.addEventListener("click", () => {
      sessionStorage.setItem("nk-donate-return", "pending");
    });
  }

  function openThanksOverlay() {
    if (!(thanksOverlay instanceof HTMLElement)) {
      return;
    }
    thanksOverlay.hidden = false;
    thanksOverlay.setAttribute("aria-hidden", "false");
    setText("thanks-overlay-title", "Thank you for supporting the build.");
    setText("thanks-overlay-text", `If the payment for Rs ${resolveAmount()} went through, it means a lot.`);
    setText("thanks-overlay-nudge", "You can close this or jump straight into the arcade.");
  }

  function closeThanksOverlay() {
    if (!(thanksOverlay instanceof HTMLElement)) {
      return;
    }
    thanksOverlay.hidden = true;
    thanksOverlay.setAttribute("aria-hidden", "true");
  }

  if (thanksDismiss instanceof HTMLButtonElement) {
    thanksDismiss.addEventListener("click", closeThanksOverlay);
  }
  if (thanksClose instanceof HTMLButtonElement) {
    thanksClose.addEventListener("click", closeThanksOverlay);
  }

  document.addEventListener("visibilitychange", () => {
    if (
      document.visibilityState === "visible" &&
      sessionStorage.getItem("nk-donate-return") === "pending"
    ) {
      sessionStorage.removeItem("nk-donate-return");
      openThanksOverlay();
    }
  });

  applyContent(selectedAmount);
}

setupReveal();
setupMatrixRain();
setupMenu();
setupTilt();
setupHeroTyping();
setupDonatePage();
