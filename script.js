const revealNodes = document.querySelectorAll("[data-reveal]");
const headerShell = document.querySelector(".header-shell");
const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelectorAll(".nav a");
const amountCards = document.querySelectorAll(".amount-card");
const customAmountInput = document.getElementById("custom-amount");
const donationKicker = document.getElementById("donation-kicker");
const donationText = document.getElementById("donation-text");
const selectedAmountLabel = document.getElementById("selected-amount-label");
const copyUpiButton = document.getElementById("copy-upi");
const upiId = document.getElementById("upi-id");
const thanksCard = document.getElementById("thanks-card");
const thanksText = document.getElementById("thanks-text");
const surpriseTitle = document.getElementById("surprise-title");
const surpriseText = document.getElementById("surprise-text");

let selectedAmount = "10";

const surpriseMessages = [
  {
    title: "Midnight Supporter",
    text: "Aapne bot ka dil jeet liya. Ab ye officially aapko apna raat ka hero maanta hai.",
  },
  {
    title: "Legendary UPI Warrior",
    text: "Agar bhej diya, to aapne simple donate nahi kiya. Aapne pure vibe ko upgrade kar diya.",
  },
  {
    title: "Code Fuel Dealer",
    text: "Aapke naam ka invisible sticker ab robot ke processor pe lag gaya hai.",
  },
];

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
    if (!headerShell.contains(event.target)) {
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
    ".button, .menu-toggle, .portrait-card, .info-card, .project-card, .contact-row, .amount-card, .donation-bot-card, .donation-message-box, .thanks-card, .nav a"
  );
  const tiltTargets = document.querySelectorAll(
    ".portrait-card, .donation-bot-card, .donation-message-box, .amount-card, .project-card, .contact-row"
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

    node.classList.add("mouse-tilt");

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

function updateDonationContent(amount, title, pitch) {
  selectedAmount = amount;

  if (donationKicker) {
    donationKicker.textContent = title;
  }

  if (donationText) {
    donationText.textContent = pitch;
  }

  if (selectedAmountLabel) {
    selectedAmountLabel.textContent = `Selected: ${amount}`;
  }

  if (copyUpiButton) {
    copyUpiButton.textContent = "Copy UPI & Donate";
  }
}

function setupDonationSelection() {
  amountCards.forEach((card) => {
    if (!(card instanceof HTMLButtonElement)) {
      return;
    }

    card.addEventListener("click", () => {
      amountCards.forEach((other) => other.classList.remove("active"));
      card.classList.add("active");

      const amount = card.dataset.amount ?? "10";
      const title = card.dataset.title ?? "Thoda support kar do";
      const pitch = card.dataset.pitch ?? "UPI copy karo aur dil se support bhejo.";
      updateDonationContent(amount, title, pitch);

      if (customAmountInput instanceof HTMLInputElement) {
        customAmountInput.value = "";
      }
    });
  });

  if (customAmountInput instanceof HTMLInputElement) {
    customAmountInput.addEventListener("input", () => {
      const trimmed = customAmountInput.value.trim();
      if (!trimmed) {
        return;
      }

      amountCards.forEach((card) => card.classList.remove("active"));
      updateDonationContent(
        trimmed,
        `Custom amount ${trimmed} ka pyaar`,
        `Wah boss. ${trimmed} type kar diya matlab aap dil se aaye ho. UPI copy karo aur scene bana do.`
      );
    });
  }
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

function setupDonationAction() {
  if (!(copyUpiButton instanceof HTMLButtonElement) || !(upiId instanceof HTMLElement)) {
    return;
  }

  copyUpiButton.addEventListener("click", async () => {
    try {
      await copyText(upiId.textContent ?? "NEESHANT01@PNB");
      copyUpiButton.textContent = "UPI Copied";

      if (thanksCard instanceof HTMLElement) {
        thanksCard.hidden = false;
      }

      if (thanksText instanceof HTMLElement) {
        thanksText.textContent = `UPI copy ho gaya. Agar aapne ${selectedAmount} bhej diya ho, dil se thank you boss.`;
      }

      const surprise = surpriseMessages[Math.floor(Math.random() * surpriseMessages.length)];
      if (surpriseTitle instanceof HTMLElement) {
        surpriseTitle.textContent = surprise.title;
      }
      if (surpriseText instanceof HTMLElement) {
        surpriseText.textContent = surprise.text;
      }
    } catch {
      copyUpiButton.textContent = "Copy Failed";
    }
  });
}

setupReveal();
setupMatrixRain();
setupMenu();
setupMouseAnimations();
setupDonationSelection();
setupDonationAction();
