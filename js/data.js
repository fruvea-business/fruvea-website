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
    image: "assets/images/banana-crunch/banana-crunch-front.png",
    images: [
      {
        src: "assets/images/banana-crunch/banana-crunch-front.png",
        thumb: "assets/images/banana-crunch/banana-crunch-front-thumb.png",
        alt: "Banana Crunch front pack",
        label: "Front"
      },
      {
        src: "assets/images/banana-crunch/banana-crunch-back.png",
        thumb: "assets/images/banana-crunch/banana-crunch-back-thumb.png",
        alt: "Banana Crunch back pack",
        label: "Back"
      },
      {
        src: "assets/images/banana-crunch/banana-crunch-top.png",
        thumb: "assets/images/banana-crunch/banana-crunch-top-thumb.png",
        alt: "Banana Crunch top view",
        label: "Top"
      }
    ],
    description:
      "A naturally sweet, crispy banana snack for guilt-free munching during classes, work breaks, or travel."
  },
  {
    id: 2,
    name: "Pineapple Crunch",
    category: "Snacks",
    basePrice: 120,
    baseWeight: 40,
    image: "assets/images/pineapple-crunch/pineapple-crunch-front.png",
    images: [
      {
        src: "assets/images/pineapple-crunch/pineapple-crunch-front.png",
        thumb: "assets/images/pineapple-crunch/pineapple-crunch-front-thumb.png",
        alt: "Pineapple Crunch front pack",
        label: "Front"
      },
      {
        src: "assets/images/pineapple-crunch/pineapple-crunch-back.png",
        thumb: "assets/images/pineapple-crunch/pineapple-crunch-back-thumb.png",
        alt: "Pineapple Crunch back pack",
        label: "Back"
      },
      {
        src: "assets/images/pineapple-crunch/pineapple-crunch-top.png",
        thumb: "assets/images/pineapple-crunch/pineapple-crunch-top-thumb.png",
        alt: "Pineapple Crunch top view",
        label: "Top"
      }
    ],
    description:
      "Tangy and vibrant pineapple bites with a satisfying crunch, crafted for quick energy and great flavor."
  },
  {
    id: 6,
    name: "Amla Crunch",
    category: "Snacks",
    basePrice: 110,
    baseWeight: 50,
    image: "assets/images/amla-crunch/amla-crunch-front.png",
    images: [
      {
        src: "assets/images/amla-crunch/amla-crunch-front.png",
        thumb: "assets/images/amla-crunch/amla-crunch-front-thumb.png",
        alt: "Amla Crunch front pack",
        label: "Front"
      },
      {
        src: "assets/images/amla-crunch/amla-crunch-back.png",
        thumb: "assets/images/amla-crunch/amla-crunch-back-thumb.png",
        alt: "Amla Crunch back pack",
        label: "Back"
      },
      {
        src: "assets/images/amla-crunch/amla-crunch-top.png",
        thumb: "assets/images/amla-crunch/amla-crunch-top-thumb.png",
        alt: "Amla Crunch top view",
        label: "Top"
      }
    ],
    description:
      "Tart, zesty amla bites with a clean crunch, perfect for quick refreshment or on-the-go snacking."
  },
  {
    id: 7,
    name: "Muskmelon Crunch",
    category: "Snacks",
    basePrice: 115,
    baseWeight: 50,
    image: "assets/images/muskmelon-crunch/muskmelon-crunch-front.png",
    images: [
      {
        src: "assets/images/muskmelon-crunch/muskmelon-crunch-front.png",
        thumb: "assets/images/muskmelon-crunch/muskmelon-crunch-front-thumb.png",
        alt: "Muskmelon Crunch front pack",
        label: "Front"
      },
      {
        src: "assets/images/muskmelon-crunch/muskmelon-crunch-back.png",
        thumb: "assets/images/muskmelon-crunch/muskmelon-crunch-back-thumb.png",
        alt: "Muskmelon Crunch back pack",
        label: "Back"
      },
      {
        src: "assets/images/muskmelon-crunch/muskmelon-crunch-top.png",
        thumb: "assets/images/muskmelon-crunch/muskmelon-crunch-top-thumb.png",
        alt: "Muskmelon Crunch top view",
        label: "Top"
      }
    ],
    description:
      "Sweet, mellow muskmelon slices with a light crunch for refreshing snacking anytime."
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
