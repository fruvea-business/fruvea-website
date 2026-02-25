(function () {
  const CART_STORAGE_KEY = "fruveaCart";
  const cartItemsElement = document.getElementById("cart-items");
  if (!cartItemsElement) {
    return;
  }

  const subtotalElement = document.getElementById("cart-subtotal");
  const totalElement = document.getElementById("cart-total");
  const amountToPayElement = document.getElementById("amount-to-pay");
  const upiIdElement = document.getElementById("upi-id");
  const copyUpiButton = document.getElementById("copy-upi-btn");
  const paymentDoneButton = document.getElementById("payment-done-btn");
  const transactionInput = document.getElementById("upi-transaction-id");
  const paymentFeedbackElement = document.getElementById("payment-feedback");

  const whatsappNumber =
    typeof WHATSAPP_NUMBER !== "undefined" ? WHATSAPP_NUMBER : "919945377147";
  const formatPrice =
    typeof formatINR === "function"
      ? formatINR
      : function (amount) {
          return "\u20B9" + Number(amount).toLocaleString("en-IN");
        };

  renderCart();

  cartItemsElement.addEventListener("input", function (event) {
    const target = event.target;
    if (!(target instanceof HTMLInputElement) || !target.matches(".cart-qty-input")) {
      return;
    }

    const itemId = Number(target.getAttribute("data-item-id"));
    const nextQuantity = sanitizeQuantity(target.value);
    const cartItems = readCart();
    const matchingItem = cartItems.find(function (item) {
      return Number(item.id) === itemId;
    });

    if (!matchingItem) {
      return;
    }

    matchingItem.quantity = nextQuantity;
    if (!saveCart(cartItems)) {
      setPaymentFeedback("Unable to update cart right now.");
      return;
    }
    target.value = String(nextQuantity);

    const cartItemElement = target.closest(".cart-item");
    if (cartItemElement) {
      const totalPerItemElement = cartItemElement.querySelector("[data-item-total]");
      if (totalPerItemElement) {
        totalPerItemElement.textContent = formatPrice(matchingItem.price * matchingItem.quantity);
      }
    }

    updateSummary(cartItems);
    updateHeaderCartCount();
  });

  cartItemsElement.addEventListener("click", function (event) {
    const clickTarget = event.target;
    const removeButton =
      clickTarget instanceof Element ? clickTarget.closest("[data-remove-id]") : null;
    if (!removeButton) {
      return;
    }

    const itemId = Number(removeButton.getAttribute("data-remove-id"));
    const updatedItems = readCart().filter(function (item) {
      return Number(item.id) !== itemId;
    });

    if (!saveCart(updatedItems)) {
      setPaymentFeedback("Unable to update cart right now.");
      return;
    }
    renderCart();
  });

  if (copyUpiButton) {
    copyUpiButton.addEventListener("click", function () {
      const upiId = upiIdElement ? upiIdElement.textContent.trim() : "";
      if (!upiId) {
        setPaymentFeedback("UPI ID unavailable.");
        return;
      }

      copyTextToClipboard(upiId)
        .then(function () {
          setPaymentFeedback("UPI ID copied.");
        })
        .catch(function () {
          setPaymentFeedback("Unable to copy automatically. Please copy manually.");
        });
    });
  }

  if (paymentDoneButton) {
    paymentDoneButton.addEventListener("click", function () {
      const cartItems = readCart();
      if (!cartItems.length) {
        setPaymentFeedback("Your cart is empty.");
        return;
      }

      const totals = getTotals(cartItems);
      const transactionId = transactionInput ? transactionInput.value.trim() : "";
      const message = buildWhatsAppMessage(cartItems, totals.grandTotal, transactionId);
      const whatsappLink =
        "https://wa.me/" + whatsappNumber + "?text=" + encodeURIComponent(message);

      window.open(whatsappLink, "_blank", "noopener,noreferrer");
      setPaymentFeedback("Opening WhatsApp with your order details.");

      const shouldClearCart = window.confirm(
        "Do you want to clear your cart now? Choose Cancel to keep it."
      );
      if (shouldClearCart) {
        if (!saveCart([])) {
          setPaymentFeedback("Unable to clear cart right now.");
          return;
        }
        renderCart();
        setPaymentFeedback("Cart cleared after confirmation.");
      }
    });
  }

  function renderCart() {
    const cartItems = readCart();

    if (!cartItems.length) {
      cartItemsElement.innerHTML = `
        <div class="empty-state">
          <p>Your cart is currently empty.</p>
          <a class="btn btn-secondary" href="shop.html">Continue Shopping</a>
        </div>
      `;
      updateSummary(cartItems);
      updateHeaderCartCount();
      return;
    }

    cartItemsElement.innerHTML = cartItems
      .map(function (item) {
        const itemTotal = item.price * item.quantity;
        return `
          <article class="cart-item">
            <div class="cart-item-info">
              <h3>${escapeHtml(item.name)}</h3>
              <p>Weight: ${escapeHtml(item.weight)}</p>
              <p>Unit Price: ${formatPrice(item.price)}</p>
            </div>
            <div class="cart-item-controls">
              <label class="field-label" for="qty-${item.id}">Quantity</label>
              <input
                id="qty-${item.id}"
                class="cart-qty-input"
                type="number"
                min="1"
                step="1"
                value="${item.quantity}"
                data-item-id="${item.id}"
                inputmode="numeric">
              <p class="cart-item-total">Item Total: <strong data-item-total>${formatPrice(
                itemTotal
              )}</strong></p>
              <button class="btn btn-secondary cart-remove-btn" type="button" data-remove-id="${item.id}">
                Remove
              </button>
            </div>
          </article>
        `;
      })
      .join("");

    updateSummary(cartItems);
    updateHeaderCartCount();
  }

  function updateSummary(cartItems) {
    const totals = getTotals(cartItems);
    const formattedSubtotal = formatPrice(totals.subtotal);
    const formattedTotal = formatPrice(totals.grandTotal);

    if (subtotalElement) {
      subtotalElement.textContent = formattedSubtotal;
    }
    if (totalElement) {
      totalElement.textContent = formattedTotal;
    }
    if (amountToPayElement) {
      amountToPayElement.textContent = formattedTotal;
    }
  }

  function getTotals(cartItems) {
    const subtotal = cartItems.reduce(function (sum, item) {
      const quantity = sanitizeQuantity(item.quantity);
      const price = Number(item.price);
      return sum + (Number.isFinite(price) ? price : 0) * quantity;
    }, 0);

    return {
      subtotal: subtotal,
      grandTotal: subtotal
    };
  }

  function buildWhatsAppMessage(cartItems, grandTotal, transactionId) {
    const orderLines = cartItems
      .map(function (item, index) {
        const lineTotal = item.price * item.quantity;
        return (
          (index + 1) +
          ". " +
          item.name +
          " - " +
          item.weight +
          " x " +
          item.quantity +
          " = " +
          formatPrice(lineTotal)
        );
      })
      .join("\n");

    return (
      "Hello FRUVEA \uD83C\uDF3F\n\n" +
      "I have completed payment via UPI.\n\n" +
      "Order Details:\n" +
      orderLines +
      "\n\n" +
      "Total Paid: " +
      formatPrice(grandTotal) +
      "\n" +
      "UPI Transaction ID: " +
      (transactionId || "") +
      "\n\n" +
      "Please confirm my order."
    );
  }

  function updateHeaderCartCount() {
    if (window.FruveaCartCount && typeof window.FruveaCartCount.update === "function") {
      window.FruveaCartCount.update();
      return;
    }

    const count = readCart().reduce(function (sum, item) {
      return sum + sanitizeQuantity(item.quantity);
    }, 0);
    const countElements = document.querySelectorAll("[data-cart-count]");
    countElements.forEach(function (element) {
      element.textContent = String(count);
    });
  }

  function sanitizeQuantity(value) {
    const numericValue = Math.floor(Number(value));
    return Number.isFinite(numericValue) && numericValue > 0 ? numericValue : 1;
  }

  function readCart() {
    try {
      const rawCart = localStorage.getItem(CART_STORAGE_KEY);
      if (!rawCart) {
        return [];
      }

      const parsedCart = JSON.parse(rawCart);
      if (!Array.isArray(parsedCart)) {
        return [];
      }

      return parsedCart.map(function (item, index) {
        const parsedId = Number(item.id);
        return {
          id: Number.isFinite(parsedId) && parsedId !== 0 ? parsedId : -(index + 1),
          name: typeof item.name === "string" ? item.name : "",
          weight: typeof item.weight === "string" ? item.weight : "",
          price: Number(item.price) || 0,
          quantity: sanitizeQuantity(item.quantity)
        };
      });
    } catch (error) {
      return [];
    }
  }

  function saveCart(cartItems) {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
      return true;
    } catch (error) {
      return false;
    }
  }

  function setPaymentFeedback(message) {
    if (paymentFeedbackElement) {
      paymentFeedbackElement.textContent = message;
    }
  }

  function copyTextToClipboard(text) {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
      return navigator.clipboard.writeText(text);
    }

    return new Promise(function (resolve, reject) {
      try {
        const tempInput = document.createElement("textarea");
        tempInput.value = text;
        tempInput.setAttribute("readonly", "readonly");
        tempInput.style.position = "absolute";
        tempInput.style.left = "-9999px";
        document.body.appendChild(tempInput);
        tempInput.select();
        const copied = document.execCommand("copy");
        document.body.removeChild(tempInput);
        if (copied) {
          resolve();
          return;
        }
        reject(new Error("Copy command rejected."));
      } catch (error) {
        reject(error);
      }
    });
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }
})();
