// NammaDeals client script
// Replace YOUR_GITHUB_USERNAME and REPO as needed
const GITHUB_USER = 'manup1657';
const REPO = 'NammaDeals';
const BASE_RAW = `https://raw.githubusercontent.com/${GITHUB_USER}/${REPO}/main/`;

// If affiliateId is available later, set here (uncomment and set value)
// const AFFILIATE_TAG = 'discoshop-21';
const REFRESH_INTERVAL_MS = 2 * 60 * 1000; // 2 minutes refresh on page

async function fetchJSON(name){
  const url = BASE_RAW + name + '?_=' + Date.now();
  const res = await fetch(url);
  if(!res.ok) throw new Error('Fetch failed: ' + res.status);
  return res.json();
}

function makeCard(item){
  const el = document.createElement('div');
  el.className = 'card';
  const img = document.createElement('img'); img.src = item.image || 'https://via.placeholder.com/300x180.png?text=No+Image'; el.appendChild(img);
  const h = document.createElement('h4'); h.textContent = item.title || 'Untitled'; el.appendChild(h);
  const p = document.createElement('div'); p.className='price'; p.textContent = item.price_text || item.price || ''; el.appendChild(p);
  const btn = document.createElement('a'); btn.className='button'; btn.textContent = 'View Deal';
  btn.target = '_blank';
  // Build affiliate link if tag present in item or global tag
  let link = item.affiliate_link || item.link || '#';
  // if affiliate tag needed and not in link, add later
  btn.href = link;
  el.appendChild(btn);
  if(item.source){ const note = document.createElement('div'); note.className='note'; note.textContent = item.source; el.appendChild(note); }
  return el;
}

async function loadDeals(){
  try{
    const data = await fetchJSON('deals.json');
    const grid = document.getElementById('deals-grid');
    grid.innerHTML = '';
    (data.deals || []).forEach(d=> grid.appendChild(makeCard(d)));
  }catch(e){
    console.error(e);
  }
}

async function loadBestsellers(){
  try{
    const data = await fetchJSON('bestsellers.json');
    const grid = document.getElementById('bestsellers-grid');
    grid.innerHTML = '';
    (data.items || []).forEach(d=> grid.appendChild(makeCard(d)));
  }catch(e){
    console.error(e);
  }
}

// Tab handling
document.addEventListener('DOMContentLoaded', ()=>{
  document.querySelectorAll('.tab').forEach(tb=> tb.addEventListener('click', (e)=>{
    document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));
    e.target.classList.add('active');
    const target = e.target.getAttribute('data-target');
    document.getElementById('deals-view').classList.toggle('hidden', target!=='deals');
    document.getElementById('bestsellers-view').classList.toggle('hidden', target!=='bestsellers');
  }));

  // set contact links (edit before publish)
  document.getElementById('join-telegram').href = 'https://t.me/NammaDeals';
  document.getElementById('join-whatsapp').href = 'https://wa.me/919000000000?text=Hi%20NammaDeals';

  // initial load
  loadDeals();
  loadBestsellers();
  // periodic refresh
  setInterval(()=>{ loadDeals(); loadBestsellers(); }, REFRESH_INTERVAL_MS);
});
