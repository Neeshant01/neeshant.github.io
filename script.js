const typedText = document.getElementById("typed-text");
const phrases = [
  "Student profile online",
  "Project section ready",
  "Add work anytime",
  "Simple and clean"
];

let phraseIndex = 0;
let charIndex = 0;
let deleting = false;

function runTypingEffect() {
  if (!typedText) {
    return;
  }

  const currentPhrase = phrases[phraseIndex];

  if (deleting) {
    typedText.textContent = currentPhrase.slice(0, charIndex - 1);
    charIndex -= 1;

    if (charIndex === 0) {
      deleting = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
    }
  } else {
    typedText.textContent = currentPhrase.slice(0, charIndex + 1);
    charIndex += 1;

    if (charIndex === currentPhrase.length) {
      deleting = true;
      setTimeout(runTypingEffect, 1200);
      return;
    }
  }

  setTimeout(runTypingEffect, deleting ? 42 : 84);
}

const revealElements = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window && revealElements.length > 0) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
        }
      });
    },
    { threshold: 0.12 }
  );

  revealElements.forEach((element) => revealObserver.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add("is-visible"));
}

const navLinks = document.querySelectorAll("[data-nav]");
const sections = document.querySelectorAll("main section[id]");

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

function createProjectCard(project) {
  const article = document.createElement("article");
  article.className = "project-card";

  const safeTitle = project.title || "Untitled Project";
  const safeType = project.type || "Project";
  const safeSummary = project.summary || "Project summary will be added here.";
  const safeStack = project.stack || "Details coming soon";
  const safeLink = project.link || "#";
  const safeLinkLabel = project.linkLabel || "Open Project";

  article.innerHTML = `
    <span class="project-tag">${safeType}</span>
    <h3>${safeTitle}</h3>
    <p>${safeSummary}</p>
    <span class="project-stack">${safeStack}</span>
    <a class="project-link" href="${safeLink}">${safeLinkLabel}</a>
  `;

  const link = article.querySelector(".project-link");

  if (/^https?:\/\//.test(safeLink)) {
    link.setAttribute("target", "_blank");
    link.setAttribute("rel", "noreferrer");
  }

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
      projectsGrid.innerHTML = `
        <article class="project-card placeholder-card">
          <span class="project-tag">Empty</span>
          <h3>No projects added yet.</h3>
          <p>Add a new item inside <code>projects/projects.json</code> and it will appear here.</p>
        </article>
      `;
      return;
    }

    projects.forEach((project) => {
      projectsGrid.appendChild(createProjectCard(project));
    });
  } catch (error) {
    projectsGrid.innerHTML = `
      <article class="project-card placeholder-card">
        <span class="project-tag">Error</span>
        <h3>Projects could not load.</h3>
        <p>The homepage is ready, but the project data file is missing or unavailable.</p>
      </article>
    `;
  }
}

window.addEventListener("load", () => {
  setTimeout(runTypingEffect, 280);
  loadProjects();
});
