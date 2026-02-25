(function () {
  const CART_STORAGE_KEY = "fruveaCart";

  function readCart() {
    try {
      const rawValue = localStorage.getItem(CART_STORAGE_KEY);
      if (!rawValue) {
        return [];
      }

      const parsedValue = JSON.parse(rawValue);
      return Array.isArray(parsedValue) ? parsedValue : [];
    } catch (error) {
      return [];
    }
  }

  function getCartCount() {
    return readCart().reduce(function (total, item) {
      const quantity = Number(item && item.quantity);
      return total + (Number.isFinite(quantity) && quantity > 0 ? quantity : 0);
    }, 0);
  }

  function updateCartCount() {
    const count = getCartCount();
    const countElements = document.querySelectorAll("[data-cart-count]");

    countElements.forEach(function (element) {
      element.textContent = String(count);
    });
  }

  window.FruveaCartCount = {
    getCount: getCartCount,
    update: updateCartCount
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", updateCartCount);
  } else {
    updateCartCount();
  }

  window.addEventListener("storage", function (event) {
    if (event.key === CART_STORAGE_KEY) {
      updateCartCount();
    }
  });
})();
