const typedText = document.getElementById("typed-text");
const roles = [
  "Student Developer_",
  "Building Web Projects_",
  "Learning by Doing_",
  "Based in Patna_"
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
      setTimeout(tick, 1300);
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

  setTimeout(tick, deleting ? 42 : 82);
}

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
      }
    });
  },
  { threshold: 0.18 }
);

document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));

const navLinks = document.querySelectorAll("[data-nav]");
const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      navLinks.forEach((link) => {
        link.classList.toggle("is-current", link.dataset.nav === entry.target.id);
      });
    });
  },
  {
    threshold: 0.45,
    rootMargin: "-20% 0px -35% 0px"
  }
);

document.querySelectorAll("main section[id]").forEach((section) => sectionObserver.observe(section));

window.addEventListener("load", () => {
  setTimeout(tick, 320);
});
