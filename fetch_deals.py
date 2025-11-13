#!/usr/bin/env python3
# fetch_deals.py - NammaDeals (lightning deals fetcher)
import requests, json, datetime, time
from bs4 import BeautifulSoup

OUT = 'deals.json'
HEADERS = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

def scrape_deals(limit=30):
    url = 'https://www.amazon.in/gp/goldbox'
    r = requests.get(url, headers=HEADERS, timeout=15)
    soup = BeautifulSoup(r.text, 'html.parser')
    deals = []
    # find deal blocks (best-effort)
    cards = soup.select('div.dealContainer') or soup.select('div.deal') or soup.select('div.a-section.a-spacing-medium')
    count = 0
    for c in cards:
        if count>=limit: break
        a = c.select_one('a') or c.select_one('a.a-link-normal')
        if not a: continue
        href = a.get('href','')
        link = 'https://www.amazon.in' + href.split('?')[0] if href else ''
        img = ''
        img_el = c.select_one('img') or c.select_one('img.s-image')
        if img_el: img = img_el.get('src') or img_el.get('data-src') or ''
        title = a.get('aria-label') or (a.text.strip()[:200] if a.text else 'Deal')
        price_el = c.select_one('.priceBlockStrikePriceString') or c.select_one('.a-price-whole') or c.select_one('.p13n-sc-price')
        price = price_el.text.strip() if price_el else ''
        deals.append({'title': title, 'link': link, 'affiliate_link': link, 'image': img, 'price_text': price, 'source':'amazon.in'})
        count += 1
        time.sleep(0.1)
    return deals

def save(deals):
    data = {'generated_at': datetime.datetime.utcnow().isoformat() + 'Z', 'deals': deals}
    with open(OUT, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

if __name__ == '__main__':
    deals = scrape_deals(30)
    if not deals:
        deals = [{'title':'No deals found', 'link':'https://www.amazon.in', 'affiliate_link':'https://www.amazon.in', 'image':'', 'price_text':'', 'source':'amazon.in'}]
    save(deals)
    print('Saved', len(deals), 'deals')
