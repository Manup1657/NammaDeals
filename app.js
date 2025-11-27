const AFFILIATE_TAG = "nammadeals-21";
const LINKS_FILE = "links.json";
const CACHE_KEY = "NammaDealsCacheV3";
const CACHE_TTL = 12 * 60 * 60 * 1000; // 12 hours cache

const state = {
  items: [],
  filteredItems: [],
  categories: new Set(),
  searchTerm: "",
  selectedCategory: "all",
  visibleCount: 20
};

// ---- Load links.json ----
async function loadLinks() {
  const res = await fetch(LINKS_FILE + "?_=" + Date.now());
  const json = await res.json();

  return json.items.map((item) => {
    const baseUrl = item.url.includes("?tag=")
      ? item.url
      : item.url + (item.url.includes("?") ? "&" : "?") + "tag=" + AFFILIATE_TAG;

    return {
      title: item.title || "Fetching live info…",
      price_text: item.price_text || "Price updating...",
      image: item.image || "https://via.placeholder.com/300x180.png?text=Loading...",
      url: baseUrl,
      category: item.category || "Deals"
    };
  });
}

// ---- Render functions ----
function buildCategoryList() {
  state.categories = new Set(state.items.map((i) => i.category || "Other"));
  const el = document.getElementById("categoryList");
  el.innerHTML = `<option value="all">All</option>`;
  [...state.categories].forEach((c) => {
    el.innerHTML += `<option value="${c}">${c}</option>`;
  });
}

function applyFilters() {
  let arr = [...state.items];
  const s = (state.searchTerm || "").toLowerCase();
  if (s) arr = arr.filter((p) => (p.title || "").toLowerCase().includes(s));
  if (state.selectedCategory !== "all")
    arr = arr.filter((p) => p.category === state.selectedCategory);
  state.filteredItems = arr;

  const countEl = document.getElementById("deal-count");
  if (countEl) countEl.textContent = `${arr.length} items`;
}

function renderProducts() {
  applyFilters();
  const grid = document.getElementById("productGrid");
  grid.innerHTML = "";

  if (!state.filteredItems.length) {
    grid.innerHTML = '<p class="no-results">No products found</p>';
    return;
  }

  const itemsToShow = state.filteredItems.slice(0, state.visibleCount);
  for (const p of itemsToShow) {
    grid.innerHTML += `
      <div class="item-card">
        <img src="${p.image}" alt="">
        <h3>${p.title}</h3>
        <p class="cat">${p.category}</p>
        <div class="price">${p.price_text}</div>
        <a class="nd-button" href="${p.url}" target="_blank" rel="noopener">View Deal</a>
      </div>`;
  }
}

// ---- Initialize ----
document.addEventListener("DOMContentLoaded", async () => {
  const s = document.getElementById("searchBox");
  s.addEventListener("input", (e) => {
    state.searchTerm = e.target.value;
    renderProducts();
  });

  const c = document.getElementById("categoryList");
  c.addEventListener("change", (e) => {
    state.selectedCategory = e.target.value;
    renderProducts();
  });

  document.getElementById("load-more").addEventListener("click", () => {
    state.visibleCount += 20;
    renderProducts();
  });

  state.items = await loadLinks();
  buildCategoryList();
  renderProducts();
});