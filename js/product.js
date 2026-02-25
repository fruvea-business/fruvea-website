(function () {
  const CART_STORAGE_KEY = "fruveaCart";
  const productDetailsElement = document.getElementById("product-details");
  if (!productDetailsElement) {
    return;
  }

  const searchParams = new URLSearchParams(window.location.search);
  const idParam = searchParams.get("id");
  const parsedId = Number(idParam);
  const productItems =
    typeof products !== "undefined" && Array.isArray(products) ? products : [];
  const weightOptions =
    typeof WEIGHT_OPTIONS !== "undefined" && Array.isArray(WEIGHT_OPTIONS)
      ? WEIGHT_OPTIONS
      : [
          { label: "100g", grams: 100 },
          { label: "250g", grams: 250 },
          { label: "500g", grams: 500 },
          { label: "1kg", grams: 1000 }
        ];
  const formatPrice =
    typeof formatINR === "function"
      ? formatINR
      : function (amount) {
          return "\u20B9" + Number(amount).toLocaleString("en-IN");
        };
  const calculatePrice =
    typeof calculateProductPrice === "function"
      ? calculateProductPrice
      : function (item, grams) {
          if (!item || !Number.isFinite(item.basePrice) || !Number.isFinite(item.baseWeight)) {
            return 0;
          }
          return Math.round((item.basePrice / item.baseWeight) * grams);
        };

  if (!idParam || !Number.isInteger(parsedId)) {
    renderErrorState("Invalid product link. Please select a product from the shop page.");
    return;
  }

  const product = productItems.find(function (item) {
    return item.id === parsedId;
  });

  if (!product) {
    renderErrorState("Product not found. It may have been removed.");
    return;
  }

  renderProduct(product);

  function renderProduct(item) {
    const weightOptionsMarkup = weightOptions.map(function (option) {
      return `<option value="${option.grams}">${option.label}</option>`;
    }).join("");

    productDetailsElement.innerHTML = `
      <article class="product-detail">
        <img class="product-detail-image" src="${item.image}" alt="${item.name}">
        <div class="product-detail-content">
          <span class="badge">${item.category}</span>
          <h1>${item.name}</h1>
          <p class="product-description">${item.description}</p>
          <p class="product-reference">Reference price: ${formatPrice(item.basePrice)} for ${item.baseWeight}g</p>

          <label class="field-label" for="weight-select">Choose Weight</label>
          <select id="weight-select" class="weight-select">
            ${weightOptionsMarkup}
          </select>

          <p id="dynamic-price" class="price"></p>

          <label class="field-label" for="quantity-input">Quantity</label>
          <input id="quantity-input" class="quantity-input" type="number" min="1" step="1" value="1" inputmode="numeric">

          <div class="detail-row">
            <button id="add-to-cart-btn" class="btn btn-primary" type="button">Add to Cart</button>
            <a class="btn btn-secondary" href="cart.html">View Cart</a>
          </div>
          <p id="cart-feedback" class="cart-feedback" aria-live="polite"></p>
        </div>
      </article>
    `;

    const weightSelect = document.getElementById("weight-select");
    const priceElement = document.getElementById("dynamic-price");
    const addToCartButton = document.getElementById("add-to-cart-btn");

    function refreshPricing() {
      const selectedWeightGrams = Number(weightSelect.value);
      const calculatedPrice = calculatePrice(item, selectedWeightGrams);
      const formattedPrice = formatPrice(calculatedPrice);

      priceElement.textContent = "Price: " + formattedPrice;
    }

    weightSelect.addEventListener("change", refreshPricing);
    addToCartButton.addEventListener("click", addToCart);
    refreshPricing();
  }

  function addToCart() {
    const nameElement = productDetailsElement.querySelector("h1");
    const weightSelect = document.getElementById("weight-select");
    const priceElement = document.getElementById("dynamic-price");
    const quantityInput = document.getElementById("quantity-input");
    const feedbackElement = document.getElementById("cart-feedback");

    const productName = nameElement ? nameElement.textContent.trim() : "";
    const selectedWeight =
      weightSelect && weightSelect.selectedOptions.length
        ? weightSelect.selectedOptions[0].textContent.trim()
        : "";
    const currentDisplayedPrice = parsePriceFromElement(priceElement);
    const quantityValue = quantityInput ? Number(quantityInput.value) : 1;
    const quantity = Number.isFinite(quantityValue) && quantityValue > 0
      ? Math.floor(quantityValue)
      : 1;

    if (!productName || !selectedWeight || !Number.isFinite(currentDisplayedPrice) || currentDisplayedPrice <= 0) {
      if (feedbackElement) {
        feedbackElement.textContent = "Unable to add this item right now. Please retry.";
      }
      return;
    }

    const cartItems = readCart();
    const existingItem = cartItems.find(function (item) {
      return item.name === productName && item.weight === selectedWeight;
    });

    if (existingItem) {
      existingItem.quantity += quantity;
      existingItem.price = currentDisplayedPrice;
    } else {
      cartItems.push({
        id: createTimestampId(cartItems),
        name: productName,
        weight: selectedWeight,
        price: currentDisplayedPrice,
        quantity: quantity
      });
    }

    const saveSucceeded = saveCart(cartItems);
    if (!saveSucceeded) {
      if (feedbackElement) {
        feedbackElement.textContent = "Unable to save cart right now. Please retry.";
      }
      return;
    }

    if (feedbackElement) {
      feedbackElement.textContent = "Added to cart.";
    }

    if (window.FruveaCartCount && typeof window.FruveaCartCount.update === "function") {
      window.FruveaCartCount.update();
    }
  }

  function parsePriceFromElement(priceElement) {
    if (!priceElement) {
      return 0;
    }

    const numericValue = priceElement.textContent.replace(/[^\d]/g, "");
    const parsedPrice = Number(numericValue);
    return Number.isFinite(parsedPrice) ? parsedPrice : 0;
  }

  function readCart() {
    try {
      const rawCart = localStorage.getItem(CART_STORAGE_KEY);
      if (!rawCart) {
        return [];
      }
      const parsedCart = JSON.parse(rawCart);
      return Array.isArray(parsedCart) ? parsedCart : [];
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

  function createTimestampId(cartItems) {
    let timestampId = Date.now();
    while (cartItems.some(function (item) { return Number(item.id) === timestampId; })) {
      timestampId += 1;
    }
    return timestampId;
  }

  function renderErrorState(message) {
    productDetailsElement.innerHTML = `
      <div class="error-state">
        <p>${message}</p>
        <a class="btn btn-secondary" href="shop.html">Go to Shop</a>
      </div>
    `;
  }
})();
