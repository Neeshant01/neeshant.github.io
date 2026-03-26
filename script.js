const typedText = document.getElementById("typed-text");
const roles = [
  "Ethical Tech Learner_",
  "Frontend Builder",
  "JEE Aspirant",
  "Future Software Engineer"
];

let roleIndex = 0;
let charIndex = 0;
let deleting = false;

function tick() {
  if (!typedText) {
    return;
  }

  const currentRole = roles[roleIndex];

  if (!deleting) {
    typedText.textContent = currentRole.slice(0, charIndex + 1);
    charIndex += 1;

    if (charIndex === currentRole.length) {
      deleting = true;
      setTimeout(tick, 1400);
      return;
    }
  } else {
    typedText.textContent = currentRole.slice(0, charIndex - 1);
    charIndex -= 1;

    if (charIndex === 0) {
      deleting = false;
      roleIndex = (roleIndex + 1) % roles.length;
    }
  }

  setTimeout(tick, deleting ? 45 : 90);
}

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
      }
    });
  },
  { threshold: 0.18 }
);

document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));
window.addEventListener("load", () => setTimeout(tick, 350));
