#!/usr/bin/env python3
import requests, json, time, datetime
from bs4 import BeautifulSoup

AFFILIATE_TAG = "discoshop-21"  # set '' to skip appending
OUT = "deals.json"
HEADERS = {'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

def scrape(limit=60):
    url = "https://www.amazon.in/gp/goldbox"
    r = requests.get(url, headers=HEADERS, timeout=20)
    soup = BeautifulSoup(r.text, 'html.parser')
    items = []
    # best-effort: find product links
    anchors = soup.select('a.a-link-normal')[:limit*2]
    seen = set()
    for a in anchors:
        href = a.get('href','')
        if '/dp/' not in href: continue
        asin = href.split('/dp/')[1].split('/')[0]
        if asin in seen: continue
        seen.add(asin)
        link = "https://www.amazon.in/dp/" + asin
        if AFFILIATE_TAG:
            if 'tag=' not in link:
                link = link + "?tag=" + AFFILIATE_TAG
        title = a.get('title') or a.text.strip() or asin
        # try find image and price by searching near element
        img = a.select_one('img')
        img_url = img.get('src') if img else ''
        price = ''
        items.append({'title': title[:200], 'link': link, 'affiliate_link': link, 'image': img_url, 'price_text': price, 'source':'amazon.in'})
        if len(items) >= limit: break
        time.sleep(0.05)
    return {'generated_at': datetime.datetime.utcnow().isoformat() + 'Z', 'deals': items}

if __name__ == '__main__':
    data = scrape(60)
    with open(OUT, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print("Saved", len(data.get('deals',[])))
