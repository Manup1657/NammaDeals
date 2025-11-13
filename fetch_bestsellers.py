#!/usr/bin/env python3
# fetch_bestsellers.py - NammaDeals
# Produces bestsellers.json with top Amazon India best sellers (best-effort scraping)
import requests, json, datetime, time
from bs4 import BeautifulSoup

OUT = 'bestsellers.json'
HEADERS = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

def scrape_bestsellers(limit=50):
    url = 'https://www.amazon.in/gp/bestsellers'
    r = requests.get(url, headers=HEADERS, timeout=15)
    soup = BeautifulSoup(r.text, 'html.parser')
    items = []
    # find product links in bestsellers lists (best-effort)
    for a in soup.select('ol#zg-ordered-list li')[:limit]:
        title_el = a.select_one('.p13n-sc-truncate') or a.select_one('.zg-text-center-align img')
        title = title_el.get('alt') if title_el and title_el.name=='img' else (title_el.text.strip() if title_el else 'Untitled')
        link_el = a.select_one('a.a-link-normal') or a.select_one('a')
        href = link_el.get('href') if link_el else ''
        link = 'https://www.amazon.in' + href.split('?')[0] if href else ''
        img_el = a.select_one('img')
        img = img_el.get('src') if img_el else ''
        price_el = a.select_one('.p13n-sc-price') or a.select_one('.a-color-price')
        price = price_el.text.strip() if price_el else ''
        items.append({
            'title': title[:200],
            'link': link,
            'affiliate_link': link,  # affiliate tag can be added later
            'image': img,
            'price_text': price,
            'source': 'amazon.in'
        })
        time.sleep(0.1)
    return items

def save(items):
    data = {'generated_at': datetime.datetime.utcnow().isoformat() + 'Z', 'items': items}
    with open(OUT, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

if __name__ == '__main__':
    items = scrape_bestsellers(50)
    if not items:
        items = [{'title':'No bestsellers found', 'link':'https://www.amazon.in', 'affiliate_link':'https://www.amazon.in', 'image':'', 'price_text':'', 'source':'amazon.in'}]
    save(items)
    print('Saved', len(items), 'items')
