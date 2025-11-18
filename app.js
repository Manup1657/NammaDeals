// =============================
// GLOBAL STATE
// =============================
const state = {
  items: [],
  filteredItems: [],
  categories: new Set(),
  searchTerm: "",
  selectedCategory: "all"
};

// =============================
// HELPER: AI-style category detection
// =============================
function inferCategory(title = "") {
  const t = title.toLowerCase();

  if (t.includes("phone") || t.includes("mobile") || t.includes("smartphone") || t.includes("iphone"))
    return "Mobiles";

  if (t.includes("laptop") || t.includes("notebook"))
    return "Laptops";

  if (t.includes("headphone") || t.includes("earbud") || t.includes("earphone"))
    return "Audio";

  if (t.includes("watch") || t.includes("smartwatch"))
    return "Wearables";

  if (t.includes("camera"))
    return "Camera";

  if (t.includes("shoes") || t.includes("shirt") || t.includes("dress"))
    return "Fashion";

  if (t.includes("kitchen") || t.includes("mixer") || t.includes("cook"))
    return "Home & Kitchen";

  return "Other";
}

// =============================
// GENERIC FETCHER
// =============================
async function baseFetch(path) {
  const res = await fetch(path + "?v=" + Date.now());
  if (!res.ok) throw new Error("Failed: " + path);
  return res.json();
}

// =============================
// LOAD deals.json
// =============================
async function loadDealsJSON() {
  try {
    const data = await baseFetch("deals.json");
    const arr = (data.items || []).map(d => ({
      ...d,
      category: d.category || inferCategory(d.title)
    }));

    state.items = [...state.items, ...arr];
    buildCategoryList();
    renderProducts();

  } catch (e) {
    console.error("deal.json error:", e);
  }
}

// =============================
// LOAD manual_products.json
// =============================
async function loadManualProducts() {
  try {
    const data = await baseFetch("manual_products.json");
    const arr = (data.items || []).map(d => ({
      ...d,
      category: d.category || inferCategory(d.title)
    }));

    state.items = [...arr, ...state.items];
    buildCategoryList();
    renderProducts();

  } catch (e) {
    console.error("manual_products.json error:", e);
  }
}

// =============================
// BUILD CATEGORY LIST UI
// =============================
function buildCategoryList() {
  state.categories = new Set(state.items.map(p => p.category));

  const el = document.getElementById("categoryList");
  if (!el) return;

  el.innerHTML = `<option value="all">All</option>`;
  [...state.categories].forEach(cat => {
    el.innerHTML += `<option value="${cat}">${cat}</option>`;
  });
}

// =============================
// FILTER & RENDER
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

function renderProducts() {
  applyFilters();

  const container = document.getElementById("productGrid");
  if (!container) return;

  container.innerHTML = "";

  state.filteredItems.forEach(p => {
    container.innerHTML += `
      <div class="item-card">
          <img src="${p.image}" alt="">
          <h3>${p.title}</h3>
          <p class="cat">${p.category}</p>
          <div class="price">₹${p.price || "–"}</div>
          <a href="${p.url}" target="_blank" class="btn">View Deal</a>
      </div>
    `;
  });
}

// =============================
// EVENT LISTENERS
// =============================
document.addEventListener("DOMContentLoaded", () => {

  // Search input
  const s = document.getElementById("searchBox");
  if (s) {
    s.addEventListener("input", e => {
      state.searchTerm = e.target.value;
      renderProducts();
    });
  }

  // Category filter
  const c = document.getElementById("categoryList");
  if (c) {
    c.addEventListener("change", e => {
      state.selectedCategory = e.target.value;
      renderProducts();
    });
  }

  // LOAD ALL SOURCES
  loadDealsJSON();
  loadManualProducts();

  // Refresh every 15 mins
  setInterval(() => {
    state.items = [];
    loadDealsJSON();
    loadManualProducts();
  }, 15 * 60 * 1000);
});
