// CONFIG
const ADMIN_PASSWORD = "namma@2025"; // change this if you like

// STATE
const state = {
  items: [],
  filteredItems: [],
  categories: new Set(),
  searchTerm: "",
  selectedCategory: "all",
  tab: "deals",
  visibleCount: 20,
  manualItems: [] // from manual_products.json + admin session
};

// category inference
function inferCategory(title = "") {
  const t = title.toLowerCase();
  if (/phone|mobile|oneplus|samsung|redmi|vivo|oppo|xiaomi|moto|iphone/.test(t)) return "Mobiles";
  if (/earbud|earphone|headphone|speaker|tablet|laptop|charger|power bank|smartwatch/.test(t)) return "Electronics";
  if (/kurta|tshirt|jeans|shoes|saree|dress|hoodie/.test(t)) return "Fashion";
  if (/mixer|kettle|pressure|cookware|pan|microwave/.test(t)) return "Home & Kitchen";
  if (/cream|soap|shampoo|skincare|makeup|perfume/.test(t)) return "Beauty";
  if (/tv|ac|refrigerator|washing machine/.test(t)) return "Appliances";
  return "Other";
}

// load JSON from same site
async function loadJSON(name) {
  try {
    const res = await fetch(name + "?_=" + Date.now());
    if (!res.ok) throw new Error("fetch failed " + name);
    const data = await res.json();
    const arr = (data.deals || data.items || []).map(d => ({
      ...d,
      title: d.title || d.name || "",
      image: d.image || d.img || "",
      price_text: d.price_text || d.price || "",
      url: d.affiliate_link || d.link || d.url || "",
      category: d.category || inferCategory(d.title || d.name || "")
    }));
    return arr;
  } catch (e) {
    console.error("loadJSON error", name, e);
    return [];
  }
}

async function loadAllSources() {
  let items = [];

  if (state.tab === "deals" || state.tab === "deals") {
    const deals = await loadJSON("deals.json");
    items = items.concat(deals);
  }
  if (state.tab === "bestsellers" || state.tab === "deals") {
    const best = await loadJSON("bestsellers.json");
    items = items.concat(best);
  }

  const manual = await loadJSON("manual_products.json");
  state.manualItems = manual;
  items = (state.tab === "manual" ? manual : manual.concat(items));

  state.items = items;
  buildCategoryList();
  state.visibleCount = 20;
  renderProducts();
  setHero(items[0] || null);
}

function buildCategoryList() {
  state.categories = new Set(state.items.map(i => i.category || "Other"));
  const el = document.getElementById("categoryList");
  if (!el) return;
  el.innerHTML = `<option value="all">All categories</option>`;
  [...state.categories].sort().forEach(c => {
    el.innerHTML += `<option value="${c}">${c}</option>`;
  });
}

function applyFilters() {
  let arr = [...state.items];
  const s = state.searchTerm.toLowerCase();
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
  if (!grid) return;
  grid.innerHTML = "";

  if (!state.filteredItems.length) {
    grid.innerHTML = '<p class="no-results">No products found</p>';
    return;
  }

  const itemsToShow = state.filteredItems.slice(0, state.visibleCount);
  itemsToShow.forEach(p => {
    grid.innerHTML += `
      <div class="item-card">
        <img src="${p.image || "https://via.placeholder.com/300x180.png?text=No+Image"}" alt="">
        <h3>${p.title}</h3>
        <p class="cat">${p.category || ""}</p>
        <div class="price">${p.price_text || ""}</div>
        <a class="nd-button" href="${p.url || "#"}" target="_blank" rel="noopener">View Deal</a>
      </div>
    `;
  });

  const wrap = document.getElementById("load-more-wrap");
  if (!wrap) return;
  wrap.style.display =
    state.visibleCount >= state.filteredItems.length ? "none" : "flex";
}

function setHero(item) {
  const rot = document.getElementById("hero-rotator");
  if (!rot) return;
  rot.innerHTML = "";
  if (!item) {
    rot.innerHTML = '<div class="item-card">No deal</div>';
    return;
  }
  rot.innerHTML = `
    <div class="item-card">
      <img src="${item.image || "https://via.placeholder.com/400x180"}" style="height:180px;object-fit:contain" />
      <h3>${item.title}</h3>
      <div class="price">${item.price_text || ""}</div>
      <a class="nd-button" href="${item.url || "#"}" target="_blank" rel="noopener">View Deal</a>
    </div>
  `;
}

/* ----- ADMIN PANEL ----- */
function refreshAdminJSON() {
  const out = {
    generated_at: new Date().toISOString(),
    items: state.manualItems.map(m => ({
      title: m.title,
      affiliate_link: m.url,
      image: m.image,
      price_text: m.price_text,
      source: "amazon.in",
      category: m.category || "",
      verified: !!m.verified
    }))
  };
  const ta = document.getElementById("admin-json");
  if (ta) ta.value = JSON.stringify(out, null, 2);
}

function initAdmin() {
  const openBtn = document.getElementById("admin-open");
  const panel = document.getElementById("admin-panel");
  const closeBtn = document.getElementById("admin-close");
  const unlockBtn = document.getElementById("admin-unlock");
  const lockBox = document.getElementById("admin-lock");
  const bodyBox = document.getElementById("admin-body");
  const passInput = document.getElementById("admin-pass");
  const form = document.getElementById("admin-form");
  const copyBtn = document.getElementById("admin-copy");

  if (!openBtn || !panel) return;

  openBtn.addEventListener("click", () => {
    panel.classList.toggle("nd-admin-hidden");
  });

  closeBtn.addEventListener("click", () => {
    panel.classList.add("nd-admin-hidden");
  });

  unlockBtn.addEventListener("click", () => {
    if (passInput.value === ADMIN_PASSWORD) {
      lockBox.classList.add("nd-admin-hidden");
      bodyBox.classList.remove("nd-admin-hidden");
      refreshAdminJSON();
    } else {
      alert("Wrong password");
    }
  });

  form.addEventListener("submit", e => {
    e.preventDefault();
    const title = document.getElementById("a-title").value.trim();
    const link = document.getElementById("a-link").value.trim();
    const img = document.getElementById("a-img").value.trim();
    const price = document.getElementById("a-price").value.trim();
    const cat = document.getElementById("a-category").value.trim();
    const verified = document.getElementById("a-verified").checked;

    if (!title || !link) {
      alert("Title and product URL are required");
      return;
    }

    const item = {
      title,
      url: link,
      image: img,
      price_text: price,
      category: cat || inferCategory(title),
      verified
    };

    state.manualItems.unshift(item);
    if (state.tab === "manual") {
      state.items.unshift(item);
      renderProducts();
      setHero(item);
    }
    form.reset();
    refreshAdminJSON();
  });

  copyBtn.addEventListener("click", () => {
    const ta = document.getElementById("admin-json");
    ta.select();
    document.execCommand("copy");
    alert("JSON copied. Paste into manual_products.json in GitHub if needed.");
  });
}

/* ----- DOM INIT ----- */
document.addEventListener("DOMContentLoaded", () => {
  const s = document.getElementById("searchBox");
  if (s) s.addEventListener("input", e => { state.searchTerm = e.target.value; renderProducts(); });

  const c = document.getElementById("categoryList");
  if (c) c.addEventListener("change", e => { state.selectedCategory = e.target.value; renderProducts(); });

  document.querySelectorAll(".nd-tab").forEach(t => t.addEventListener("click", e => {
    document.querySelectorAll(".nd-tab").forEach(x => x.classList.remove("active"));
    e.currentTarget.classList.add("active");
    state.tab = e.currentTarget.dataset.tab;
    loadAllSources();
  }));

  const loadBtn = document.getElementById("load-more");
  if (loadBtn) loadBtn.addEventListener("click", () => {
    state.visibleCount += 20;
    renderProducts();
  });

  document.getElementById("telegram-link").href = "https://t.me/NammaDeals";
  document.getElementById("dark-toggle").addEventListener("click", () => document.body.classList.toggle("dark"));
  document.getElementById("lang-toggle").addEventListener("click", () => alert("Kannada toggle coming soon"));

  initAdmin();
  loadAllSources();
});