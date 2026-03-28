const amountInput = document.getElementById("amount-input");
const upiInput = document.getElementById("upi-input");
const noteInput = document.getElementById("note-input");
const generateButton = document.getElementById("generate-button");
const payLink = document.getElementById("pay-link");
const statusText = document.getElementById("donate-status");
const qrTarget = document.getElementById("generated-qr");
const qrWrap = document.getElementById("generated-qr-wrap");
const optionOneButton = document.getElementById("option-one-button");
const optionTwoButton = document.getElementById("option-two-button");
const optionOnePanel = document.getElementById("option-one-panel");
const optionTwoPanel = document.getElementById("option-two-panel");

function setStatus(message) {
  if (statusText) {
    statusText.textContent = message;
  }
}

function showPanel(panelName) {
  const showOptionOne = panelName === "option-one";
  optionOnePanel?.classList.toggle("is-hidden", !showOptionOne);
  optionTwoPanel?.classList.toggle("is-hidden", showOptionOne);
  optionOneButton?.classList.toggle("is-active", showOptionOne);
  optionTwoButton?.classList.toggle("is-active", !showOptionOne);

  if (!showOptionOne) {
    qrWrap?.classList.add("is-hidden");
  }
}

function buildPaymentLink(amount) {
  const manualValue = upiInput?.value.trim();
  const noteValue = noteInput?.value.trim();
  let base = manualValue;

  if (!base) {
    return "";
  }

  if (!base.startsWith("upi://")) {
    base = `upi://pay?pa=${encodeURIComponent(base)}&pn=${encodeURIComponent("Nishant Kumar")}`;
  }

  const url = new URL(base);
  url.searchParams.set("am", amount);
  url.searchParams.set("cu", "INR");

  if (noteValue) {
    url.searchParams.set("tn", noteValue);
  }

  return url.toString();
}

function renderQr(content) {
  if (!content || typeof QRCode === "undefined" || !qrTarget) {
    return;
  }

  qrTarget.innerHTML = "";
  qrWrap?.classList.remove("is-hidden");
  new QRCode(qrTarget, {
    text: content,
    width: 280,
    height: 280,
    colorDark: "#0b0b0b",
    colorLight: "#ffffff",
    correctLevel: QRCode.CorrectLevel.M
  });
}

function handleGenerate() {
  const amount = amountInput?.value.trim();

  if (!amount || Number(amount) <= 0) {
    setStatus("Please enter a valid amount like 10, 50, or 100.");
    return;
  }

  const paymentLink = buildPaymentLink(amount);

  if (!paymentLink) {
    setStatus("Please enter a valid UPI ID or UPI payment link before generating the QR.");
    return;
  }

  renderQr(paymentLink);
  if (payLink) {
    payLink.href = paymentLink;
  }
  setStatus(`Custom QR generated for INR ${amount}. You can scan it or open the payment app.`);
}

optionOneButton?.addEventListener("click", () => {
  showPanel("option-one");
  setStatus("Option 1 selected. Enter the amount, add your UPI details, and generate your QR.");
});

optionTwoButton?.addEventListener("click", () => {
  showPanel("option-two");
});
generateButton?.addEventListener("click", handleGenerate);
