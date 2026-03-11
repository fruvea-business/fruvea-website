(function () {
  const productListElement = document.getElementById("product-list");
  const filterContainer = document.getElementById("category-filters");

  if (!productListElement || !filterContainer) {
    return;
  }

  const productItems =
    typeof products !== "undefined" && Array.isArray(products) ? products : [];
  const formatPrice =
    typeof formatINR === "function"
      ? formatINR
      : function (amount) {
          return "\u20B9" + Number(amount).toLocaleString("en-IN");
        };
  const categories = ["All", "Crunches", "Powders"];
  let activeCategory = "All";

  function renderFilterButtons() {
    filterContainer.innerHTML = categories
      .map(function (category) {
        const isActive = category === activeCategory;
        return `
          <button
            class="filter-btn ${isActive ? "is-active" : ""}"
            type="button"
            data-category="${category}">
            ${category}
          </button>
        `;
      })
      .join("");
  }

  function getVisibleProducts() {
    if (activeCategory === "All") {
      return productItems;
    }
    return productItems.filter(function (item) {
      return item.category === activeCategory;
    });
  }

  function renderProducts() {
    const visibleProducts = getVisibleProducts();

    if (!visibleProducts.length) {
      productListElement.innerHTML =
        '<p class="empty-state">No products found in this category.</p>';
      return;
    }

    productListElement.innerHTML = visibleProducts
      .map(function (product) {
        return `
          <a class="product-card" href="product.html?id=${product.id}">
            <img src="${product.image}" alt="${product.name}" loading="lazy" decoding="async">
            <div class="product-content">
              <span class="badge">${product.category}</span>
              <h2>${product.name}</h2>
              <p class="product-note">Starts from ${formatPrice(product.basePrice)} (${product.baseWeight}g)</p>
            </div>
          </a>
        `;
      })
      .join("");
  }

  filterContainer.addEventListener("click", function (event) {
    const clickTarget = event.target;
    const button =
      clickTarget instanceof Element ? clickTarget.closest("[data-category]") : null;
    if (!button) {
      return;
    }

    activeCategory = button.getAttribute("data-category");
    renderFilterButtons();
    renderProducts();
  });

  renderFilterButtons();
  renderProducts();
})();
