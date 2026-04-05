const commandText = 'render_portfolio --owner "nishant-kumar" --theme neon-personal';
const typedCommand = document.getElementById("typed-command");
const terminalOutput = document.getElementById("terminal-output");
const counterNodes = document.querySelectorAll("[data-count]");
const revealNodes = document.querySelectorAll("[data-reveal]");

function typeCommand(text, index = 0) {
  if (!typedCommand) {
    return;
  }

  typedCommand.textContent = text.slice(0, index);

  if (index < text.length) {
    setTimeout(() => typeCommand(text, index + 1), 42);
    return;
  }

  setTimeout(addTerminalLines, 650);
}

function addTerminalLines() {
  if (!terminalOutput) {
    return;
  }

  const lines = [
    "> personal branding layer applied successfully...",
    "> projects linked to live GitHub profile...",
    "> portfolio broadcast ready for recruiters and collaborators.",
  ];

  lines.forEach((line, index) => {
    setTimeout(() => {
      const paragraph = document.createElement("p");
      paragraph.textContent = line;
      terminalOutput.appendChild(paragraph);
    }, 420 * (index + 1));
  });
}

function animateCounters() {
  counterNodes.forEach((node) => {
    const target = Number(node.dataset.count);
    if (Number.isNaN(target)) {
      return;
    }

    let current = 0;
    const length = String(node.dataset.count).length;
    const step = Math.max(1, Math.ceil(target / 40));

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
    context.fillStyle = "rgba(4, 5, 15, 0.14)";
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.font = `${fontSize}px "JetBrains Mono", monospace`;

    drops.forEach((drop, index) => {
      const glyph = glyphs[Math.floor(Math.random() * glyphs.length)];
      const x = index * fontSize;
      const y = drop * fontSize;

      context.fillStyle = Math.random() > 0.84 ? "#ff5db7" : "#76ecff";
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

setupReveal();
setupMatrixRain();
typeCommand(commandText);

window.addEventListener(
  "load",
  () => {
    animateCounters();
  },
  { once: true }
);
