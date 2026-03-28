const amountInput = document.getElementById("amount-input");
const upiInput = document.getElementById("upi-input");
const noteInput = document.getElementById("note-input");
const generateButton = document.getElementById("generate-button");
const payLink = document.getElementById("pay-link");
const statusText = document.getElementById("donate-status");
const sourceImage = document.getElementById("source-qr-image");
const qrCanvas = document.getElementById("qr-canvas");
const qrTarget = document.getElementById("generated-qr");
const qrWrap = document.getElementById("generated-qr-wrap");
const optionOneButton = document.getElementById("option-one-button");
const optionTwoButton = document.getElementById("option-two-button");
const optionOnePanel = document.getElementById("option-one-panel");
const optionTwoPanel = document.getElementById("option-two-panel");

let detectedUpiLink = "";

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

function decodeSourceQr() {
  if (!sourceImage || !qrCanvas || typeof jsQR === "undefined") {
    setStatus("Saved payment profile not available. You can still paste your UPI ID manually.");
    return;
  }

  const context = qrCanvas.getContext("2d");
  qrCanvas.width = sourceImage.naturalWidth || sourceImage.width;
  qrCanvas.height = sourceImage.naturalHeight || sourceImage.height;
  context.drawImage(sourceImage, 0, 0, qrCanvas.width, qrCanvas.height);

  const imageData = context.getImageData(0, 0, qrCanvas.width, qrCanvas.height);
  const decoded = jsQR(imageData.data, imageData.width, imageData.height);

  if (decoded && decoded.data) {
    detectedUpiLink = decoded.data.trim();
    if (upiInput && !upiInput.value.trim()) {
      upiInput.value = detectedUpiLink;
    }
    setStatus("Saved payment profile loaded. Enter an amount and generate the QR when needed.");
  } else {
    setStatus("Could not auto-detect the payment profile. Paste your UPI ID manually in Option 1.");
  }
}

function buildPaymentLink(amount) {
  const manualValue = upiInput?.value.trim();
  const noteValue = noteInput?.value.trim();
  let base = manualValue || detectedUpiLink;

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
    setStatus("Payment profile is not ready yet. Paste your UPI ID manually or use Razorpay instead.");
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
  setStatus("Option 1 selected. Enter the amount and generate your QR.");
});

optionTwoButton?.addEventListener("click", () => {
  showPanel("option-two");
});

sourceImage?.addEventListener("load", decodeSourceQr);
generateButton?.addEventListener("click", handleGenerate);

if (sourceImage?.complete) {
  decodeSourceQr();
}
