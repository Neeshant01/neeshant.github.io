const counterNodes = document.querySelectorAll("[data-count]");
const revealNodes = document.querySelectorAll("[data-reveal]");
const headerShell = document.querySelector(".header-shell");
const menuToggle = document.querySelector(".menu-toggle");
const nav = document.getElementById("site-nav");
const navLinks = document.querySelectorAll(".nav a");

function animateCounters() {
  counterNodes.forEach((node) => {
    const target = Number(node.dataset.count);
    if (Number.isNaN(target)) {
      return;
    }

    let current = 0;
    const length = String(node.dataset.count).length;
    const step = Math.max(1, Math.ceil(target / 36));

    const tick = () => {
      current = Math.min(current + step, target);
      node.textContent = String(current).padStart(length, "0");

      if (current < target) {
        requestAnimationFrame(tick);
      }
    };

    tick();
  });
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
  if (!(headerShell instanceof HTMLElement) || !(menuToggle instanceof HTMLButtonElement) || !(nav instanceof HTMLElement)) {
    return;
  }

  const closeMenu = () => {
    headerShell.classList.remove("nav-open");
    menuToggle.setAttribute("aria-expanded", "false");
  };

  const openMenu = () => {
    headerShell.classList.add("nav-open");
    menuToggle.setAttribute("aria-expanded", "true");
  };

  menuToggle.addEventListener("click", () => {
    const isOpen = headerShell.classList.contains("nav-open");

    if (isOpen) {
      closeMenu();
      return;
    }

    openMenu();
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
    ".button, .menu-toggle, .portrait-card, .preview-card, .info-card, .feature-card, .project-card, .track-card, .resume-item, .update-card, .contact-row, .nav a"
  );
  const tiltTargets = document.querySelectorAll(
    ".portrait-card, .preview-card, .info-card, .feature-card, .project-card, .track-card, .resume-item, .update-card, .contact-row"
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

setupReveal();
setupMatrixRain();
setupMenu();
setupMouseAnimations();

window.addEventListener(
  "load",
  () => {
    animateCounters();
  },
  { once: true }
);
