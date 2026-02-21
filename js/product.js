(function () {
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
  const whatsappNumber =
    typeof WHATSAPP_NUMBER !== "undefined" ? WHATSAPP_NUMBER : "919945377147";

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

          <div class="detail-row">
            <a id="whatsapp-order-btn" class="btn btn-primary" href="#" target="_blank" rel="noopener noreferrer">
              Order on WhatsApp
            </a>
            <a class="btn btn-secondary" href="shop.html">Back to Shop</a>
          </div>
        </div>
      </article>
    `;

    const weightSelect = document.getElementById("weight-select");
    const priceElement = document.getElementById("dynamic-price");
    const whatsappButton = document.getElementById("whatsapp-order-btn");

    function refreshPricingAndOrderLink() {
      const selectedWeightGrams = Number(weightSelect.value);
      const selectedWeightLabel = getWeightLabel(selectedWeightGrams);
      const calculatedPrice = calculatePrice(item, selectedWeightGrams);
      const formattedPrice = formatPrice(calculatedPrice);

      priceElement.textContent = "Price: " + formattedPrice;
      whatsappButton.href = buildWhatsAppLink(item.name, selectedWeightLabel, formattedPrice);
    }

    weightSelect.addEventListener("change", refreshPricingAndOrderLink);
    refreshPricingAndOrderLink();
  }

  function getWeightLabel(grams) {
    const option = weightOptions.find(function (weight) {
      return weight.grams === grams;
    });
    return option ? option.label : grams + "g";
  }

  function buildWhatsAppLink(productName, weightLabel, formattedPrice) {
    const message =
      "Hello FRUVEA,\n" +
      "I would like to order:\n" +
      "Product: " + productName + "\n" +
      "Weight: " + weightLabel + "\n" +
      "Price: " + formattedPrice;

    return "https://wa.me/" + whatsappNumber + "?text=" + encodeURIComponent(message);
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
