// =============================
// CONFIG
// =============================
const GITHUB_USER = "Manup1657";
const REPO = "NammaDeals";

const BASE_RAW = `https://raw.githubusercontent.com/${GITHUB_USER}/${REPO}/main/`;

const state = {
  items: [],
  filteredItems: [],
  categories: new Set(),
  searchTerm: "",
  selectedCategory: "all"
};

// =============================
// CATEGORY DETECTOR
// =============================
function inferCategory(title = "") {
  const t = title.toLowerCase();

  if (t.includes("phone") || t.includes("mobile") || t.includes("iphone"))
    return "Mobiles";

  if (t.includes("laptop"))
    return "Laptops";

  if (t.includes("earbud") || t.includes("earphone") || t.includes("headphone"))
    return "Audio";

  if (t.includes("watch"))
    return "Wearables";

  if (t.includes("camera"))
    return "Camera";

  if (t.includes("shirt") || t.includes("dress") || t.includes("shoes"))
    return "Fashion";

  if (t.includes("kitchen") || t.includes("mixer"))
    return "Home & Kitchen";

  return "Other";
}

// =============================
// GENERIC FETCHER (FROM GITHUB)
// =============================
async function baseFetch(filename) {
  const url = BASE_RAW + filename + "?v=" + Date.now();

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed: " + filename);
    return res.json();
  } catch (err) {
    console.error("Fetch error:", err);
    return { items: [] };
  }
}

// =============================
// LOAD DEALS.JSON
// =============================
async function loadDealsJSON() {
  const data = await baseFetch("deals.json");

  const arr = (data.items || []).map(d => ({
    ...d,
    category: d.category || inferCategory(d.title)
  }));

  state.items = [...state.items, ...arr];
  buildCategoryList();
  renderProducts();
}

// =============================
// LOAD manual_products.json
// =============================
async function loadManualProducts() {
  const data = await baseFetch("manual_products.json");

  const arr = (data.items || []).map(d => ({
    ...d,
    category: d.category || inferCategory(d.title)
  }));

  state.items = [...arr, ...state.items];
  buildCategoryList();
  renderProducts();
}

// =============================
// BUILD CATEGORY LIST
// =============================
function buildCategoryList() {
  state.categories = new Set(state.items.map(p => p.category));

  const el = document.getElementById("categoryList");
  el.innerHTML = `<option value="all">All</option>`;

  [...state.categories].forEach(cat => {
    el.innerHTML += `<option value="${cat}">${cat}</option>`;
  });
}

// =============================
// PRODUCT FILTER
// =============================
function applyFilters() {
  let arr = [...state.items];

  if (state.searchTerm) {
    const s = state.searchTerm.toLowerCase();
    arr = arr.filter(p => p.title.toLowerCase().includes(s));
  }

  if (state.selectedCategory !== "all") {
    arr = arr.filter(p => p.category === state.selectedCategory);
  }

  state.filteredItems = arr;
}

// =============================
// RENDER GRID
// =============================
function renderProducts() {
  applyFilters();

  const grid = document.getElementById("productGrid");
  grid.innerHTML = "";

  if (state.filteredItems.length === 0) {
    grid.innerHTML = "<p>No products found.</p>";
    return;
  }

  state.filteredItems.forEach(p => {
    grid.innerHTML += `
      <div class="item-card">
          <img src="${p.image}" />
          <h3>${p.title}</h3>
          <p class="cat">${p.category}</p>
          <div class="price">₹${p.price || "-"}</div>
          <a href="${p.url}" class="btn" target="_blank">View Deal</a>
      </div>
    `;
  });
}

// =============================
// EVENTS & INIT
// =============================
document.addEventListener("DOMContentLoaded", () => {

  document.getElementById("searchBox").addEventListener("input", e => {
    state.searchTerm = e.target.value;
    renderProducts();
  });

  document.getElementById("categoryList").addEventListener("change", e => {
    state.selectedCategory = e.target.value;
    renderProducts();
  });

  loadDealsJSON();
  loadManualProducts();

  // Auto refresh every 15 min
  setInterval(() => {
    state.items = [];
    loadDealsJSON();
    loadManualProducts();
  }, 15 * 60 * 1000);
});
