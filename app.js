const LINKS_FILE = "links.json";

document.addEventListener("DOMContentLoaded", async () => {
  const grid = document.getElementById("productGrid");
  const catList = document.getElementById("categoryList");
  const countEl = document.getElementById("deal-count");

  try {
    const res = await fetch(LINKS_FILE + "?_=" + Date.now());
    const data = await res.json();
    const items = data.items || [];

    if (!items.length) {
      grid.innerHTML = "<p class='no-results'>No deals found</p>";
      return;
    }

    // categories
    const cats = [...new Set(items.map(i => i.category))];
    catList.innerHTML =
      "<option value='all'>All</option>" +
      cats.map(c => `<option value='${c}'>${c}</option>`).join("");

    // render
    grid.innerHTML = items
      .map(
        p => `
        <div class="item-card">
          <img src="${p.image}" alt="">
          <h3>${p.title}</h3>
          <p class="cat">${p.category}</p>
          <div class="price">${p.price_text}</div>
          <a class="nd-button" href="${p.url}" target="_blank" rel="noopener">View Deal</a>
        </div>`
      )
      .join("");

    countEl.textContent = `${items.length} items`;
  } catch (err) {
    console.error("Error loading links.json", err);
    grid.innerHTML = "<p class='no-results'>Error loading deals</p>";
  }
});