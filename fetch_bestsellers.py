#!/usr/bin/env python3
"""
fetch_bestsellers.py — NammaDeals
---------------------------------
Fetches Amazon.in bestsellers and saves them to bestsellers.json
Auto-adds affiliate tag (nammadeals-21) to every link.
"""

import requests, json, datetime, time
from bs4 import BeautifulSoup

OUT = 'bestsellers.json'
HEADERS = {'User-Agent': 'Mozilla/5.0'}
AFFILIATE_TAG = 'nammadeals-21'  # ✅ Your Amazon affiliate tag


def add_affiliate_tag(url: str) -> str:
    """Ensure every link includes the affiliate tag."""
    if not url:
        return ''
    if '?tag=' in url:
        return url
    return url + ('&' if '?' in url else '?') + f'tag={AFFILIATE_TAG}'


def scrape(limit=50):
    url = 'https://www.amazon.in/gp/bestsellers'
    print("🔄 Fetching Amazon Bestsellers…")
    r = requests.get(url, headers=HEADERS, timeout=20)
    r.raise_for_status()

    soup = BeautifulSoup(r.text, 'html.parser')
    items = []
    nodes = soup.select('ol#zg-ordered-list li')[:limit]

    for n in nodes:
        a = n.select_one('a.a-link-normal') or n.select_one('a')
        href = a.get('href', '') if a else ''
        title = (a.get('title') or a.text.strip()) if a else ''
        img = n.select_one('img')
        img_url = img.get('src') if img else ''
        link = 'https://www.amazon.in' + href.split('?')[0] if href else ''
        tagged = add_affiliate_tag(link)

        items.append({
            'title': title[:200],
            'link': link,
            'affiliate_link': tagged,
            'image': img_url,
            'price_text': '',
            'source': 'amazon.in'
        })
        time.sleep(0.05)  # Be gentle to avoid rate-limiting

    data = {
        'generated_at': datetime.datetime.utcnow().isoformat() + 'Z',
        'items': items
    }

    with open(OUT, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    print(f"✅ Saved {len(items)} bestsellers to {OUT}")


if __name__ == '__main__':
    scrape(50)
