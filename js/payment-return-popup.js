(function () {
  const PAYMENT_FLAG_KEY = "paymentInProgress";
  const overlayElement = document.getElementById("payment-return-overlay");
  if (!overlayElement) {
    return;
  }

  const paidButton = document.getElementById("payment-return-yes");
  const issueButton = document.getElementById("payment-return-issue");
  const codButton = document.getElementById("payment-return-cod");
  const whatsappNumber =
    typeof WHATSAPP_NUMBER !== "undefined" ? WHATSAPP_NUMBER : "919945377147";

  if (paidButton) {
    paidButton.addEventListener("click", function () {
      window.alert("Thank you! We will verify shortly.");
      hideModal();
    });
  }

  if (issueButton) {
    issueButton.addEventListener("click", function () {
      const message =
        "Hello FRUVEA \uD83C\uDF3F\n" +
        "Payment Not Working. Please help me complete my order.";
      const link =
        "https://wa.me/" + whatsappNumber + "?text=" + encodeURIComponent(message);
      window.open(link, "_blank", "noopener,noreferrer");
      hideModal();
    });
  }

  if (codButton) {
    codButton.addEventListener("click", function () {
      window.alert("Order changed to Cash on Delivery");
      hideModal();
    });
  }

  let paymentInProgress = false;
  try {
    paymentInProgress = localStorage.getItem(PAYMENT_FLAG_KEY) === "true";
  } catch (error) {
    paymentInProgress = false;
  }

  if (!paymentInProgress) {
    return;
  }

  showModal();

  try {
    localStorage.removeItem(PAYMENT_FLAG_KEY);
  } catch (error) {
    /* no-op */
  }

  function showModal() {
    overlayElement.removeAttribute("hidden");
    overlayElement.classList.add("is-visible");
    if (paidButton) {
      paidButton.focus();
    }
  }

  function hideModal() {
    overlayElement.classList.remove("is-visible");
    overlayElement.setAttribute("hidden", "hidden");
  }
})();
