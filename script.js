const typedText = document.getElementById("typed-text");
const footerYear = document.getElementById("footer-year");
const navLinks = document.querySelectorAll("[data-nav]");
const sections = document.querySelectorAll("main section[id]");
const phrases = [
  "Open to internships and collaborations",
  "Building with HTML, React, and Python",
  "Designing clean, responsive pages",
  "Showing checked work in portfolio style"
];

let phraseIndex = 0;
let charIndex = 0;
let deleting = false;

const revealObserver =
  "IntersectionObserver" in window
    ? new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) {
              return;
            }

            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          });
        },
        { threshold: 0.14 }
      )
    : null;

function registerReveal(elements) {
  elements.forEach((element) => {
    if (revealObserver) {
      revealObserver.observe(element);
    } else {
      element.classList.add("is-visible");
    }
  });
}

function createTextElement(tagName, className, text) {
  const element = document.createElement(tagName);

  if (className) {
    element.className = className;
  }

  element.textContent = text;
  return element;
}

function runTypingEffect() {
  if (!typedText) {
    return;
  }

  const currentPhrase = phrases[phraseIndex];

  if (deleting) {
    typedText.textContent = currentPhrase.slice(0, Math.max(charIndex - 1, 0));
    charIndex -= 1;

    if (charIndex <= 0) {
      deleting = false;
      charIndex = 0;
      phraseIndex = (phraseIndex + 1) % phrases.length;
    }
  } else {
    typedText.textContent = currentPhrase.slice(0, charIndex + 1);
    charIndex += 1;

    if (charIndex >= currentPhrase.length) {
      deleting = true;
      setTimeout(runTypingEffect, 1300);
      return;
    }
  }

  setTimeout(runTypingEffect, deleting ? 44 : 82);
}

function createProjectCard(project) {
  const article = document.createElement("article");
  article.className = "project-card reveal";
  article.style.setProperty("--card-accent", project.accent || "#ffb454");

  const safeTitle = project.title || "Untitled Project";
  const safeType = project.type || "Project";
  const safeSummary = project.summary || "Project details will be added here.";
  const safeStack = project.stack || "More details soon";
  const safeStatus = project.status || "Checked";
  const safeDisplayLabel = project.displayLabel || "Working Project";
  const safeYear = project.year || "Now";
  const highlights = Array.isArray(project.highlights) ? project.highlights.slice(0, 3) : [];

  const top = document.createElement("div");
  top.className = "project-top";

  const topMeta = document.createElement("div");
  topMeta.className = "project-top-meta";
  topMeta.append(
    createTextElement("span", "project-tag", safeType),
    createTextElement("span", "project-status", safeStatus)
  );

  top.append(topMeta, createTextElement("span", "project-year", safeYear));

  const title = createTextElement("h3", "", safeTitle);
  const summary = createTextElement("p", "", safeSummary);

  article.append(top, title, summary);

  if (highlights.length > 0) {
    const list = document.createElement("ul");
    list.className = "project-points";

    highlights.forEach((point) => {
      list.appendChild(createTextElement("li", "", point));
    });

    article.appendChild(list);
  }

  const footer = document.createElement("div");
  footer.className = "project-footer";

  const stack = createTextElement("span", "project-stack", safeStack);
  const display = createTextElement("span", "project-link project-link-static", safeDisplayLabel);

  footer.append(stack, display);
  article.appendChild(footer);

  return article;
}

async function loadProjects() {
  const projectsGrid = document.getElementById("projects-grid");

  if (!projectsGrid) {
    return;
  }

  try {
    const response = await fetch("projects/projects.json", { cache: "no-store" });

    if (!response.ok) {
      throw new Error("Unable to load projects");
    }

    const data = await response.json();
    const projects = Array.isArray(data.projects) ? data.projects : [];

    projectsGrid.innerHTML = "";

    if (projects.length === 0) {
      const emptyCard = document.createElement("article");
      emptyCard.className = "project-card placeholder-card reveal";
      emptyCard.append(
        createTextElement("span", "project-tag", "Empty"),
        createTextElement("h3", "", "No checked projects added yet."),
        createTextElement("p", "", "Add checked projects in projects/projects.json and they will appear here.")
      );
      projectsGrid.appendChild(emptyCard);
      registerReveal([emptyCard]);
      return;
    }

    const cards = projects.map((project) => createProjectCard(project));
    cards.forEach((card) => projectsGrid.appendChild(card));
    registerReveal(cards);
  } catch (error) {
    const fallbackCard = document.createElement("article");
    fallbackCard.className = "project-card placeholder-card reveal";
    fallbackCard.append(
      createTextElement("span", "project-tag", "Error"),
      createTextElement("h3", "", "Projects could not load."),
      createTextElement("p", "", "The project data file is missing or unavailable.")
    );
    projectsGrid.innerHTML = "";
    projectsGrid.appendChild(fallbackCard);
    registerReveal([fallbackCard]);
  }
}

const revealElements = Array.from(document.querySelectorAll(".reveal"));

if (revealObserver) {
  registerReveal(revealElements);
} else {
  revealElements.forEach((element) => {
    element.classList.add("is-visible");
  });
}

if ("IntersectionObserver" in window && navLinks.length > 0 && sections.length > 0) {
  const navObserver = new IntersectionObserver(
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

  sections.forEach((section) => navObserver.observe(section));
}

if (footerYear) {
  footerYear.textContent = String(new Date().getFullYear());
}

window.addEventListener("load", () => {
  setTimeout(runTypingEffect, 280);
  loadProjects();
});
