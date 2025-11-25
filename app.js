// CONFIG
const GITHUB_USER = "Manup1657";
const REPO = "NammaDeals";
const BASE_RAW = `https://raw.githubusercontent.com/${GITHUB_USER}/${REPO}/main/`;
const REFRESH_INTERVAL = 2 * 60 * 1000; // 2 minutes
const AFFILIATE_TAG = "nammadeals-21"; // ✅ your affiliate ID

// STATE
const state = {
  items: [],
  filteredItems: [],
  categories: new Set(),
  searchTerm: "",
  selectedCategory: "all",
  tab: "deals"
};

// category inference
function inferCategory(title = "") {
  const t = (title || "").toLowerCase();
  if (/phone|mobile|oneplus|samsung|redmi|vivo|oppo|xiaomi|moto|iphone/.test(t)) return "Mobiles";
  if (/earbud|earphone|headphone|speaker|tablet|laptop|charger|power bank|smartwatch/.test(t)) return "Electronics";
  if (/kurta|tshirt|jeans|shoes|saree|dress|hoodie/.test(t)) return "Fashion";
  if (/mixer|kettle|pressure|cookware|pan|microwave/.test(t)) return "Home & Kitchen";
  if (/cream|soap|shampoo|skincare|makeup|perfume/.test(t)) return "Beauty";
  if (/tv|ac|refrigerator|washing machine/.test(t)) return "Appliances";
  return "Other";
}

// fetch helper
async function baseFetch(name) {
  const url = BASE_RAW + name + '?_=' + Date.now();
  const res = await fetch(url);
  if (!res.ok) throw new Error('Fetch failed: ' + url);
  return res.json();
}

// load deals or bestsellers or manual
async function loadJSON(filename) {
  try {
    const data = await baseFetch(filename);
    // support both "deals"/"items" keys
    const arr = (data.deals || data.items || []).map(d => {
      const baseURL = d.affiliate_link || d.link || d.url || '';
      // ✅ ensure affiliate tag is always added
      const taggedURL = baseURL.includes('?tag=') 
        ? baseURL 
        : (baseURL ? baseURL + (baseURL.includes('?') ? '&' : '?') + 'tag=' + AFFILIATE_TAG : '');
      return {
        ...d,
        title: d.title || d.name || '',
        image: d.image || d.img || '',
        price_text: d.price_text || d.price || '',
        url: taggedURL,
        category: d.category || inferCategory(d.title || d.name || '')
      };
    });
    return arr;
  } catch (e) {
    console.error('loadJSON error', filename, e);
    return [];
  }
}

async function loadAllSources() {
  state.items = [];
  if (state.tab === 'deals' || state.tab === 'deals') {
    const deals = await loadJSON('deals.json');
    state.items = state.items.concat(deals);
  }
  if (state.tab === 'bestsellers' || state.tab === 'deals') {
    const best = await loadJSON('bestsellers.json');
    state.items = state.items.concat(best);
  }
  // always include manual picks
  const manu = await loadJSON('manual_products.json');
  state.items = manu.concat(state.items);

  buildCategoryList();
  renderProducts();
  setHero(state.items[0] || null);
}

function buildCategoryList() {
  state.categories = new Set(state.items.map(i => i.category || 'Other'));
  const el = document.getElementById('categoryList');
  if (!el) return;
  el.innerHTML = `<option value="all">All</option>`;
  [...state.categories].forEach(c => {
    el.innerHTML += `<option value="${c}">${c}</option>`;
  });
}

function applyFilters() {
  let arr = [...state.items];
  const s = (state.searchTerm || '').toLowerCase();
  if (s) arr = arr.filter(p => (p.title || '').toLowerCase().includes(s));
  if (state.selectedCategory && state.selectedCategory !== 'all')
    arr = arr.filter(p => p.category === state.selectedCategory);
  state.filteredItems = arr;
}

function renderProducts() {
  applyFilters();
  const grid = document.getElementById('productGrid');
  if (!grid) return;
  grid.innerHTML = '';
  if (state.filteredItems.length === 0) {
    grid.innerHTML = '<p class="no-results">No products found</p>';
    return;
  }
  state.filteredItems.forEach(p => {
    grid.innerHTML += `
      <div class="item-card">
        <img src="${p.image || 'https://via.placeholder.com/300x180.png?text=No+Image'}" alt="">
        <h3>${p.title}</
