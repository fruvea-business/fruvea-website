(function () {
  const PAYMENT_FLAG_KEY = "paymentInProgress";
  const overlayElement = document.getElementById("payment-return-overlay");
  if (!overlayElement) {
    return;
  }

  const actionsElement = document.getElementById("payment-return-actions");
  const paidButton = document.getElementById("payment-return-yes");
  const issueButton = document.getElementById("payment-return-issue");
  const codButton = document.getElementById("payment-return-cod");
  const verificationSection = document.getElementById("payment-verification-section");
  const verificationForm = document.getElementById("payment-verification-form");
  const utrInput = document.getElementById("utr-transaction-id");
  const whatsappNumber =
    typeof WHATSAPP_NUMBER !== "undefined" ? WHATSAPP_NUMBER : "919945377147";

  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "visible") {
      maybeShowPaymentModal();
    }
  });

  if (paidButton) {
    paidButton.addEventListener("click", function () {
      if (actionsElement) {
        actionsElement.setAttribute("hidden", "hidden");
      }
      if (verificationSection) {
        verificationSection.removeAttribute("hidden");
      }
      if (utrInput) {
        utrInput.focus();
      }
    });
  }

  if (issueButton) {
    issueButton.addEventListener("click", function () {
      const message = "Payment is not going through. Please assist.";
      const link =
        "https://wa.me/" + whatsappNumber + "?text=" + encodeURIComponent(message);
      window.open(link, "_blank", "noopener,noreferrer");
    });
  }

  if (codButton) {
    codButton.addEventListener("click", function () {
      window.alert("Order switched to Cash on Delivery");
      clearPaymentFlag();
      hideModal();
    });
  }

  if (verificationForm) {
    verificationForm.addEventListener("submit", function (event) {
      event.preventDefault();

      if (!verificationForm.checkValidity()) {
        verificationForm.reportValidity();
        return;
      }

      window.alert("Payment details submitted for verification");
      clearPaymentFlag();
      hideModal();
    });
  }

  maybeShowPaymentModal();

  function maybeShowPaymentModal() {
    if (document.visibilityState !== "visible" || !hasPaymentInProgress()) {
      return;
    }
    showModal();
  }

  function showModal() {
    if (overlayElement.classList.contains("is-visible")) {
      return;
    }
    resetModalState();
    overlayElement.removeAttribute("hidden");
    overlayElement.classList.add("is-visible");
    if (paidButton) {
      paidButton.focus();
    }
  }

  function hideModal() {
    overlayElement.classList.remove("is-visible");
    overlayElement.setAttribute("hidden", "hidden");
    resetModalState();
  }

  function resetModalState() {
    if (actionsElement) {
      actionsElement.removeAttribute("hidden");
    }
    if (verificationSection) {
      verificationSection.setAttribute("hidden", "hidden");
    }
    if (verificationForm) {
      verificationForm.reset();
    }
  }

  function hasPaymentInProgress() {
    try {
      return localStorage.getItem(PAYMENT_FLAG_KEY) === "true";
    } catch (error) {
      return false;
    }
  }

  function clearPaymentFlag() {
    try {
      localStorage.removeItem(PAYMENT_FLAG_KEY);
    } catch (error) {
      /* no-op */
    }
  }
})();
