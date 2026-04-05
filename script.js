const siteConfig = {
  whatsappNumber: "919279080614",
  upiId: "92790806142@POSTBANK",
  payeeName: "Nishant Kumar",
  currency: "INR",
  defaultAmount: 100,
  botMessage:
    "Aapka ek chhota sa yogdaan mere server ka bill bhar sakta hai... aur agar thoda bada amount daaloge, toh main apne liye naya processor khareed lunga! ;)"
};

const projectGrid = document.getElementById("project-grid");
const projectEmpty = document.getElementById("project-empty");
const projectTemplate = document.getElementById("project-card-template");
const amountInput = document.getElementById("donation-amount");
const qrImage = document.getElementById("qr-image");
const donationSummary = document.getElementById("donation-summary");
const upiLink = document.getElementById("upi-link");
const generateQrButton = document.getElementById("generate-qr");
const contactForm = document.getElementById("contact-form");
const contactStatus = document.getElementById("contact-status");
const openDonateButtons = document.querySelectorAll("[data-open-donate]");
const supportModal = document.getElementById("support-modal");
const closeSupportModalButton = document.getElementById("close-support-modal");
const botDialogue = document.getElementById("bot-dialogue");

let typingTimer = null;

function formatAmount(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: siteConfig.currency,
    maximumFractionDigits: 0
  }).format(amount);
}

function getDonationAmount() {
  const rawAmount = Number(amountInput.value);
  return Number.isFinite(rawAmount) && rawAmount > 0 ? rawAmount : siteConfig.defaultAmount;
}

function buildUpiUrl(amount) {
  const params = new URLSearchParams({
    pa: siteConfig.upiId,
    pn: siteConfig.payeeName,
    am: String(amount),
    cu: siteConfig.currency
  });

  return `upi://pay?${params.toString()}`;
}

function buildQrUrl(upiUrl) {
  const qrUrl = new URL("https://api.qrserver.com/v1/create-qr-code/");
  qrUrl.search = new URLSearchParams({
    size: "260x260",
    data: upiUrl
  }).toString();
  return qrUrl.toString();
}

function syncDonationUi() {
  const amount = getDonationAmount();
  const upiUrl = buildUpiUrl(amount);

  donationSummary.textContent = formatAmount(amount);
  upiLink.href = upiUrl;
  qrImage.src = buildQrUrl(upiUrl);
  qrImage.alt = `QR code for ${formatAmount(amount)}`;
}

function typeBotMessage(message) {
  window.clearTimeout(typingTimer);
  botDialogue.textContent = "";
  botDialogue.classList.add("is-typing");

  let index = 0;

  function step() {
    botDialogue.textContent = message.slice(0, index);
    index += 1;

    if (index <= message.length) {
      typingTimer = window.setTimeout(step, 28);
      return;
    }

    botDialogue.classList.remove("is-typing");
  }

  step();
}

function openSupportModal() {
  syncDonationUi();
  supportModal.hidden = false;
  requestAnimationFrame(() => {
    supportModal.classList.add("is-open");
    document.body.classList.add("modal-open");
    typeBotMessage(siteConfig.botMessage);
  });
}

function closeSupportModal() {
  supportModal.classList.remove("is-open");
  document.body.classList.remove("modal-open");
  window.clearTimeout(typingTimer);
  window.setTimeout(() => {
    if (!supportModal.classList.contains("is-open")) {
      supportModal.hidden = true;
    }
  }, 180);
}

function createTag(tag) {
  const item = document.createElement("span");
  item.textContent = tag;
  return item;
}

function renderProjects(projects) {
  projectGrid.innerHTML = "";

  if (!Array.isArray(projects) || projects.length === 0) {
    projectEmpty.hidden = false;
    return;
  }

  projectEmpty.hidden = true;

  projects.forEach((project) => {
    const fragment = projectTemplate.content.cloneNode(true);
    const status = fragment.querySelector(".project-status");
    const title = fragment.querySelector(".project-title");
    const summary = fragment.querySelector(".project-summary");
    const tags = fragment.querySelector(".project-tags");
    const link = fragment.querySelector(".project-link");

    status.textContent = project.status || "Project";
    title.textContent = project.title || "Untitled Project";
    summary.textContent = project.summary || "Add project details in projects.json.";

    if (Array.isArray(project.stack)) {
      project.stack.forEach((tag) => tags.appendChild(createTag(tag)));
    }

    if (project.liveUrl) {
      link.href = project.liveUrl;
      link.target = project.liveUrl.startsWith("http") ? "_blank" : "_self";
      link.rel = project.liveUrl.startsWith("http") ? "noopener noreferrer" : "";
    } else {
      link.removeAttribute("href");
      link.textContent = "Live Link Missing";
      link.setAttribute("aria-disabled", "true");
    }

    projectGrid.appendChild(fragment);
  });
}

async function loadProjects() {
  try {
    const response = await fetch("projects.json", { cache: "no-store" });

    if (!response.ok) {
      throw new Error(`Unexpected status: ${response.status}`);
    }

    const projects = await response.json();
    renderProjects(projects);
  } catch (error) {
    console.error("Failed to load projects.json", error);
    projectEmpty.hidden = false;
    projectEmpty.querySelector("p").textContent =
      "projects.json could not be loaded. On GitHub Pages it will work after the file is present at the site root.";
  }
}

function buildWhatsappMessage(formData) {
  const lines = [
    "Hello Nishant,",
    "",
    `Name: ${formData.get("name")}`,
    `Reason: ${formData.get("reason")}`,
    `Contact: ${formData.get("details") || "Not provided"}`,
    "",
    "Message:",
    formData.get("message")
  ];

  return lines.join("\n");
}

function handleContactSubmit(event) {
  event.preventDefault();

  const formData = new FormData(contactForm);
  const message = buildWhatsappMessage(formData);
  const whatsappUrl = `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(message)}`;
  const popup = window.open(whatsappUrl, "_blank", "noopener");

  if (popup) {
    contactStatus.textContent = "WhatsApp opened. Review the message there and send it.";
  } else {
    contactStatus.textContent = "WhatsApp could not open automatically. Please allow popups and try again.";
  }
}

function handleModalClick(event) {
  if (event.target === supportModal) {
    closeSupportModal();
  }
}

function handleKeydown(event) {
  if (event.key === "Escape" && !supportModal.hidden) {
    closeSupportModal();
  }
}

amountInput.value = String(siteConfig.defaultAmount);
syncDonationUi();
loadProjects();

openDonateButtons.forEach((button) => {
  button.addEventListener("click", openSupportModal);
});

amountInput.addEventListener("input", syncDonationUi);
generateQrButton.addEventListener("click", syncDonationUi);
contactForm.addEventListener("submit", handleContactSubmit);
closeSupportModalButton.addEventListener("click", closeSupportModal);
supportModal.addEventListener("click", handleModalClick);
document.addEventListener("keydown", handleKeydown);
