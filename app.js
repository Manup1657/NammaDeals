// CONFIG
const AFFILIATE_TAG = "nammadeals-21";
const LINKS_FILE = "links.json";
const CACHE_KEY = "NammaDealsCacheV2";
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours cache

// STATE
const state = {
  items: [],
  filteredItems: [],
  categories: new Set(),
  searchTerm: "",
  selectedCategory: "all",
  visibleCount: 20
};

async function fetchAmazonData(url) {
  const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || "{}");
  if (cached[url] && Date.now() - cached[url].time < CACHE_TTL) {
    return cached[url].data;
  }

  try {
    // Use api.allorigins.win to bypass CORS safely
    const apiUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
    const res = await fetch(apiUrl);
    const json = await res.json();
    const text = json.contents;

    const titleMatch = text.match(/<span id="productTitle"[^>]*>(.*?)<\/span>/i);
    const title = titleMatch
      ? titleMatch[1].replace(/<[^>]*>/g, "").trim()
      : "Amazon Product";

    const priceMatch = text.match(/₹[\d,]+(?:\.\d+)?/);
    const price = priceMatch ? priceMatch[0] : "Price not found";

    const imgMatch = text.match(/https:\/\/m\.media-amazon\.com\/images\/I\/[A-Za-z0-9%._-]+\.jpg/);
    const image = imgMatch
      ? imgMatch[0]
      : "https://via.placeholder.com/300x180.png?text=No+Image";

    const data = { title, price_text: price, image };

    cached[url] = { data, time: Date.now() };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cached));
    return data;
  } catch (e) {
    console.error("Error fetching Amazon data:", e);
    return {
      title: "Unknown Product",
      price_text: "",
      image: "https://via.placeholder.com/300x180.png?text=No+Image"
    };
  }
}

// -------- LOAD LINKS.JSON ----------
async function loadLinks() {
  const res = await fetch(LINKS_FILE + "?_=" + Date.now());
  const json = await res.json();

  const results = [];
  for (const item of json.items) {
    const baseUrl = item.url.includes("?tag=")
      ? item.url
      : item.url + (item.url.includes("?") ? "&" : "?") + "tag=" + AFFILIATE_TAG;

    const details = await fetchAmazonData(baseUrl);
    results.push({
      title: details.title,
      image: details.image,
      price_text: details.price_text,
      url: baseUrl,
      category: item.category || "Other"
    });
  }

  return results;
}

// -------- UI BUILD ----------
function buildCategoryList() {
  state.categories = new Set(state.items.map(i => i.category || "Other"));
  const el = document.getElementById("categoryList");
  el.innerHTML = `<option value="all">All</option>`;
  [...state.categories].forEach(c => {
    el.innerHTML += `<option value="${c}">${c}</option>`;
  });
}

function applyFilters() {
  let arr = [...state.items];
  const s = (state.searchTerm || "").toLowerCase();
  if (s) arr = arr.filter(p => (p.title || "").toLowerCase().includes(s));
  if (state.selectedCategory !== "all")
    arr = arr.filter(p => p.category === state.selectedCategory);
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

// -------- INIT ----------
document.addEventListener("DOMContentLoaded", async () => {
  const s = document.getElementById("searchBox");
  s.addEventListener("input", e => {
    state.searchTerm = e.target.value;
    renderProducts();
  });

  const c = document.getElementById("categoryList");
  c.addEventListener("change", e => {
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