// NammaDeals client script
const DEFAULT_TAG = 'discoshop-21';
async function loadDeals(){
  try{
    const res = await fetch('deals.json', {cache: "no-store"});
    const data = await res.json();
    populateSections(data.deals || []);
  }catch(err){
    console.error(err);
    document.getElementById('deals-national').innerHTML = '<p style="color:#9fb0c8">Failed to load deals.</p>';
  }
}

function createCard(d){
  const card = document.createElement('div'); card.className = 'card';
  const img = document.createElement('img'); img.src = d.image || 'placeholder.png'; img.alt = d.title || 'Deal image';
  const h = document.createElement('h4'); h.textContent = d.title || 'Untitled deal';
  const p = document.createElement('div'); p.className = 'price'; p.textContent = d.price_text || (d.price ? '₹' + d.price : '');
  const actions = document.createElement('div');
  const a = document.createElement('a'); a.className='button'; a.href = (d.affiliate_link || ('https://www.amazon.in/?tag='+DEFAULT_TAG)); a.target='_blank'; a.textContent = 'View Deal';
  const share = document.createElement('a'); share.className='sharebtn'; share.href='#'; share.textContent='Share';
  share.onclick = (e)=>{ e.preventDefault(); shareDeal(d); };
  const track = document.createElement('a'); track.className='sharebtn'; track.href='#'; track.textContent='Track Price';
  track.onclick = (e)=>{ e.preventDefault(); trackPrice(d); };
  const note = document.createElement('div'); note.className='note'; note.textContent = d.source?('Source: '+d.source):'';
  // verified badge
  if(d.verified){
    const vb = document.createElement('span'); vb.className='badge'; vb.textContent='Verified';
    h.appendChild(document.createTextNode(' '));
    h.appendChild(vb);
  }
  card.appendChild(img); card.appendChild(h); card.appendChild(p); actions.appendChild(a); actions.appendChild(share); actions.appendChild(track); card.appendChild(actions); card.appendChild(note);
  return card;
}

function populateSections(deals){
  const mys = document.getElementById('deals-mysuru');
  const kar = document.getElementById('deals-karnataka');
  const nat = document.getElementById('deals-national');
  mys.innerHTML=kar.innerHTML=nat.innerHTML='';
  // simple classification: if deal.local == 'mysuru' -> mys, 'karnataka' -> kar else nat
  deals.forEach(d=>{
    const card = createCard(d);
    if(d.local && d.local.toLowerCase()==='mysuru') mys.appendChild(card);
    else if(d.local && d.local.toLowerCase()==='karnataka') kar.appendChild(card);
    else nat.appendChild(card);
  });
  // if a section empty, show placeholder
  if(!mys.children.length) mys.innerHTML='<p style="color:#9fb0c8">No local Mysuru deals yet.</p>';
  if(!kar.children.length) kar.innerHTML='<p style="color:#9fb0c8">No Karnataka deals yet.</p>';
  if(!nat.children.length) nat.innerHTML='<p style="color:#9fb0c8">No national deals yet.</p>';
}

function shareDeal(d){
  const txt = encodeURIComponent(d.title + ' - ' + (d.affiliate_link||'https://www.amazon.in/?tag='+DEFAULT_TAG));
  const url = 'https://wa.me/?text='+txt;
  window.open(url,'_blank');
}

function trackPrice(d){
  // store simple tracked deals in localStorage
  const key = 'nm_tracked';
  let arr = JSON.parse(localStorage.getItem(key)||'[]');
  if(!arr.find(x=>x.affiliate_link===d.affiliate_link)){
    arr.push({title:d.title,link:d.affiliate_link,added:new Date().toISOString()});
    localStorage.setItem(key, JSON.stringify(arr));
    alert('Added to local Price Tracker. We will check when you click the tracker page.');
  } else alert('Already tracked.');
}

// language toggle
function setLanguage(lang){
  document.querySelectorAll('[data-en]').forEach(el=>{
    el.textContent = el.getAttribute('data-'+(lang==='kn'?'kn':'en'));
  });
  document.getElementById('lang-en').classList.toggle('active', lang==='en');
  document.getElementById('lang-kn').classList.toggle('active', lang==='kn');
  localStorage.setItem('nm_lang', lang);
}

document.addEventListener('DOMContentLoaded', ()=>{
  loadDeals();
  // default links (replace with your own)
  document.getElementById('join-telegram').href = 'https://t.me/NammaDeals';
  document.getElementById('join-whatsapp').href = 'https://wa.me/919000000000?text=Hi%20NammaDeals';
  // language
  const lang = localStorage.getItem('nm_lang') || 'en';
  setLanguage(lang);
  document.getElementById('lang-en').onclick = ()=>setLanguage('en');
  document.getElementById('lang-kn').onclick = ()=>setLanguage('kn');
});