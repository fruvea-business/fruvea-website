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
  const payUpiButton = document.getElementById("pay-upi-btn");
  const checkoutForm = document.getElementById("checkout-form");
  const fullNameInput = document.getElementById("checkout-name");
  const contactNumberInput = document.getElementById("checkout-phone");
  const addressInput = document.getElementById("checkout-address");
  const emailInput = document.getElementById("checkout-email");
  const clearCartAfterOrderInput = document.getElementById("clear-cart-after-order");
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

  if (payUpiButton) {
    payUpiButton.addEventListener("click", function () {
      const cartItems = readCart();
      if (!cartItems.length) {
        setPaymentFeedback("Your cart is empty.");
        return;
      }

      const totals = getTotals(cartItems);
      if (!Number.isFinite(totals.grandTotal) || totals.grandTotal <= 0) {
        setPaymentFeedback("Unable to generate payment amount.");
        return;
      }

      const upiLink = buildUpiDeepLink(totals.grandTotal);
      if (!upiLink) {
        setPaymentFeedback("UPI ID unavailable.");
        return;
      }

      try {
        localStorage.setItem("paymentInProgress", "true");
      } catch (error) {
        setPaymentFeedback("Unable to store payment status.");
      }

      window.location.href = upiLink;
    });
  }

  if (checkoutForm) {
    checkoutForm.addEventListener("submit", function (event) {
      event.preventDefault();

      const cartItems = readCart();
      if (!cartItems.length) {
        setPaymentFeedback("Your cart is empty.");
        return;
      }

      if (!checkoutForm.checkValidity()) {
        checkoutForm.reportValidity();
        return;
      }

      const totals = getTotals(cartItems);
      const customerDetails = {
        name: fullNameInput ? fullNameInput.value.trim() : "",
        phone: contactNumberInput ? contactNumberInput.value.trim() : "",
        address: addressInput ? addressInput.value.trim() : "",
        email: emailInput ? emailInput.value.trim() : "",
        paymentMethod: getSelectedPaymentMethod()
      };
      if (!customerDetails.name || !customerDetails.phone || !customerDetails.address) {
        setPaymentFeedback("Please complete all required checkout fields.");
        return;
      }
      const message = buildOrderWhatsAppMessage(
        customerDetails,
        cartItems,
        totals.grandTotal
      );
      const whatsappLink =
        "https://wa.me/" + whatsappNumber + "?text=" + encodeURIComponent(message);

      if (
        clearCartAfterOrderInput &&
        clearCartAfterOrderInput.checked &&
        !saveCart([])
      ) {
        setPaymentFeedback("Order opened in WhatsApp, but cart clear failed.");
      } else if (clearCartAfterOrderInput && clearCartAfterOrderInput.checked) {
        renderCart();
      }

      window.location.href = whatsappLink;
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
    if (payUpiButton) {
      payUpiButton.setAttribute("data-upi-link", buildUpiDeepLink(totals.grandTotal));
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

  function buildOrderWhatsAppMessage(customerDetails, cartItems, grandTotal) {
    const orderLines = cartItems
      .map(function (item) {
        const lineTotal = item.price * item.quantity;
        return (
          "- " +
          item.name +
          " x" +
          item.quantity +
          " - " +
          formatPrice(lineTotal)
        );
      })
      .join("\n");

    return (
      "New Order Received\n\n" +
      "Name: " +
      customerDetails.name +
      "\n" +
      "Phone: " +
      customerDetails.phone +
      "\n" +
      "Address: " +
      customerDetails.address +
      "\n" +
      "Email: " +
      (customerDetails.email || "Not provided") +
      "\n\n" +
      "Order Details:\n" +
      orderLines +
      "\n\n" +
      "Total: " +
      formatPrice(grandTotal) +
      "\n\n" +
      "Payment Method: " +
      customerDetails.paymentMethod
    );
  }

  function getSelectedPaymentMethod() {
    const selectedMethodInput = document.querySelector(
      'input[name="checkout-payment-method"]:checked'
    );
    return selectedMethodInput ? selectedMethodInput.value : "UPI";
  }

  function buildUpiDeepLink(grandTotal) {
    const upiId = upiIdElement ? upiIdElement.textContent.trim() : "";
    if (!upiId) {
      return "";
    }

    const amount = Number(grandTotal);
    const finalAmount = Number.isFinite(amount) ? amount.toFixed(2) : "0.00";
    return (
      "upi://pay?pa=" +
      encodeURIComponent(upiId) +
      "&pn=" +
      encodeURIComponent("FRUVEA") +
      "&am=" +
      encodeURIComponent(finalAmount) +
      "&cu=INR&tn=" +
      encodeURIComponent("Fruvea Order Payment")
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

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }
})();
