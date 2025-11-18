// app.js - NammaDeals PRO client
const GITHUB_USER = 'manup1657'; // <-- set your github username here
const REPO = 'NammaDeals';
const BASE_RAW = `https://raw.githubusercontent.com/${GITHUB_USER}/${REPO}/main/`;
const AFFILIATE_TAG = ''; // set 'discoshop-21' when ready
const REFRESH_INTERVAL = 2 * 60 * 1000; // 2 minutes

// Categories - initial recommended list
const CATEGORIES = [
  {id:'all', label:'All'},
  {id:'electronics', label:'Electronics'},
  {id:'mobiles', label:'Mobiles'},
  {id:'fashion', label:'Fashion'},
  {id:'home', label:'Home & Kitchen'},
  {id:'beauty', label:'Beauty'},
  {id:'appliances', label:'Appliances'},
  {id:'trending', label:'Trending'}
];

let state = {
  items: [], // combined deals or current tab list
  tab: 'deals',
  displayedCount: 24,
  search: ''
};

function q(id){return document.getElementById(id)}
function baseFetch(name){ return fetch(BASE_RAW + name + '?_=' + Date.now()).then(r=>{ if(!r.ok) throw r; return r.json() }) }

function buildCategories(){
  const bar = document.getElementById('category-bar');
  bar.innerHTML = '';
  CATEGORIES.forEach(c=>{
    const btn = document.createElement('button');
    btn.className = 'cat-pill' + (c.id==='all'?' active':'');
    btn.textContent = c.label;
    btn.dataset.cat = c.id;
    btn.onclick = ()=>{ document.querySelectorAll('.cat-pill').forEach(x=>x.classList.remove('active')); btn.classList.add('active'); renderProducts(); }
    bar.appendChild(btn);
  });
}

function makeCard(item){
  const el = document.createElement('div'); el.className = 'card';
  const img = document.createElement('img'); img.loading='lazy'; img.src = item.image || 'https://via.placeholder.com/300x180.png?text=No+Image'; el.appendChild(img);
  const h = document.createElement('h4'); h.textContent = item.title || 'Untitled'; el.appendChild(h);
  const p = document.createElement('div'); p.className='price'; p.textContent = item.price_text || item.price || ''; el.appendChild(p);
  const actions = document.createElement('div'); actions.className='actions';
  const view = document.createElement('a'); view.className='button'; view.target='_blank';
  let link = item.affiliate_link || item.link || '#';
  // attach affiliate tag if provided globally and not present
  if(AFFILIATE_TAG && link.includes('amazon.in') && !link.includes('tag=')){
    const url = new URL(link);
    url.searchParams.set('tag', AFFILIATE_TAG);
    link = url.toString();
  }
  view.href = link; view.textContent = 'View Deal';
  const share = document.createElement('button'); share.className='icon-btn'; share.textContent='Share';
  share.onclick = ()=>{ navigator.share ? navigator.share({title:item.title, url:link}).catch(()=>window.open('https://wa.me/?text=' + encodeURIComponent(item.title+' '+link))) : window.open('https://wa.me/?text=' + encodeURIComponent(item.title+' '+link)) }
  const track = document.createElement('button'); track.className='icon-btn'; track.textContent='Track';
  track.onclick = ()=>{ trackPrice(item) };
  actions.appendChild(view); actions.appendChild(share); actions.appendChild(track);
  el.appendChild(actions);
  return el;
}

function trackPrice(item){
  const key='nm_tracked';
  const arr = JSON.parse(localStorage.getItem(key)||'[]');
  if(arr.find(x=>x.link===item.link)){ alert('Already tracked') ; return }
  arr.push({title:item.title,link:item.link,added:Date.now()});
  localStorage.setItem(key, JSON.stringify(arr));
  alert('Added to Price Tracker (saved locally).');
}

function renderProducts(){
  const selectedCat = document.querySelector('.cat-pill.active')?.dataset?.cat || 'all';
  const grid = document.getElementById('grid-container');
  grid.innerHTML = '';
  const search = q('search-box').value.trim().toLowerCase();
  const filtered = state.items.filter(it=>{
    const okCat = selectedCat==='all' || (it.category && it.category.toLowerCase()===selectedCat);
    const okSearch = !search || ((it.title||'').toLowerCase().includes(search) || (it.brand||'').toLowerCase().includes(search));
    return okCat && okSearch;
  });
  const slice = filtered.slice(0, state.displayedCount);
  if(slice.length===0){ grid.innerHTML = '<div style="color:#6b7785;padding:40px;text-align:center">No deals right now — check back soon.</div>'; return }
  slice.forEach(item=> grid.appendChild(makeCard(item)));
}

async function loadDealsJSON(){
  try{
    const data = await baseFetch(state.tab==='deals' ? 'deals.json' : 'bestsellers.json');
    // unify to items[] structure
    if(state.tab==='deals'){
      const arr = (data.deals || []).map(d => ({...d, category: d.category || inferCategory(d.title)}));
      state.items = arr;
    } else {
      const arr = (data.items || []).map(d => ({...d, category: d.category || inferCategory(d.title)}));
      state.items = arr;
    }
    state.displayedCount = 24;
    renderProducts();
    // set hero (first item)
    setHero(state.items[0]);
  }catch(e){
    console.error(e);
    document.getElementById('grid-container').innerHTML = '<div style="color:#6b7785;padding:40px;text-align:center">Failed to load data.</div>';
  }
}

function setHero(item){
  const rot = document.getElementById('hero-rotator');
  if(!item){ rot.innerHTML = '<div class="card">No deal</div>'; return }
  rot.innerHTML = '';
  const c = document.createElement('div'); c.className='card';
  const img = document.createElement('img'); img.src = item.image || 'https://via.placeholder.com/400x180.png?text=Deal'; img.style.height='180px'; c.appendChild(img);
  const h = document.createElement('h4'); h.textContent = item.title; c.appendChild(h);
  const p = document.createElement('div'); p.className='price'; p.textContent = item.price_text || item.price; c.appendChild(p);
  const a = document.createElement('a'); a.className='button'; a.target='_blank';
  a.href = item.affiliate_link || item.link || '#'; a.textContent='View Deal'; c.appendChild(a);
  rot.appendChild(c);
}

function inferCategory(title=''){
  title = (title||'').toLowerCase();
  if(!title) return 'all';
  if(/phone|mobile|oneplus|samsung|redmi|vivo|oppo|xiaomi|moto/.test(title)) return 'mobiles';
  if(/earbud|earphone|headphone|airpod|speaker|tablet|laptop|charger|power bank|smartwatch/.test(title)) return 'electronics';
  if(/kurta|tshirt|jeans|shoes|saree|dress|hoodie|jean|jacket/.test(title)) return 'fashion';
  if(/mixer|kettle|pressure|cookware|pan|dishwasher|microwave/.test(title)) return 'home';
  if(/cream|soap|shampoo|skincare|makeup|perfume/.test(title)) return 'beauty';
  if(/tv|ac|refrigerator|washing machine|air conditioner/.test(title)) return 'appliances';
  return 'trending';
}

document.addEventListener('DOMContentLoaded', ()=>{
  // set up category bar
  buildCategories();
  // events
  q('search-box').addEventListener('input', ()=>renderProducts());
  document.querySelectorAll('.tab').forEach(tb=>{
    tb.addEventListener('click', e=>{
      document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));
      e.currentTarget.classList.add('active');
      state.tab = e.currentTarget.dataset.tab;
      loadDealsJSON();
    })
  });
  q('load-more').addEventListener('click', ()=>{ state.displayedCount += 24; renderProducts();});
  q('dark-toggle').addEventListener('click', ()=>document.body.classList.toggle('dark'));
  q('lang-toggle').addEventListener('click', ()=>{ /* add KN/EN translations later */ alert('Kannada toggle: coming soon') });
  q('telegram-link').href = 'https://t.me/NammaDeals';
  // initial load
  loadDealsJSON();
  // auto refresh
  setInterval(()=>{ loadDealsJSON(); }, REFRESH_INTERVAL);
});
