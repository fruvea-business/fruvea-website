const WHATSAPP_NUMBER = "919945377147";

const WEIGHT_OPTIONS = [
  { label: "100g", grams: 100 },
  { label: "250g", grams: 250 },
  { label: "500g", grams: 500 },
  { label: "1kg", grams: 1000 }
];

const products = [
  {
    id: 1,
    name: "Banana Crunch",
    category: "Snacks",
    basePrice: 99,
    baseWeight: 50,
    image: "assets/images/banana-crunch.svg",
    description:
      "A naturally sweet, crispy banana snack for guilt-free munching during classes, work breaks, or travel."
  },
  {
    id: 2,
    name: "Pineapple Crunch",
    category: "Snacks",
    basePrice: 120,
    baseWeight: 40,
    image: "assets/images/pineapple-crunch.svg",
    description:
      "Tangy and vibrant pineapple bites with a satisfying crunch, crafted for quick energy and great flavor."
  },
  {
    id: 3,
    name: "Moringa Powder",
    category: "Powders",
    basePrice: 150,
    baseWeight: 100,
    image: "assets/images/moringa-powder.svg",
    description:
      "Clean moringa leaf powder suitable for smoothies, shakes, and wellness routines with balanced nutrition support."
  },
  {
    id: 4,
    name: "Beetroot Powder",
    category: "Powders",
    basePrice: 150,
    baseWeight: 150,
    image: "assets/images/beetroot-powder.svg",
    description:
      "Fine beetroot powder with a naturally earthy sweetness, ideal for drinks, porridges, and baking blends."
  },
  {
    id: 5,
    name: "Amla Powder",
    category: "Powders",
    basePrice: 100,
    baseWeight: 100,
    image: "assets/images/amla-powder.svg",
    description:
      "Daily-use amla powder with a fresh tart profile to support your morning nutrition and hydration habits."
  }
];

function calculateProductPrice(product, selectedWeightGrams) {
  if (!product || !Number.isFinite(product.basePrice) || !Number.isFinite(product.baseWeight)) {
    return 0;
  }

  const perGram = product.basePrice / product.baseWeight;
  return Math.round(perGram * selectedWeightGrams);
}

function formatINR(amount) {
  return "\u20B9" + Number(amount).toLocaleString("en-IN");
}
