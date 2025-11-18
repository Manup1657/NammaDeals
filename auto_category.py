#!/usr/bin/env python3
import requests, json, time, sys
from bs4 import BeautifulSoup

AFFILIATE_TAG = "discoshop-21"
INPUT = "input_links.txt"
OUT = "manual_products.json"
HEADERS = {'User-Agent':'Mozilla/5.0'}

def add_affiliate(url):
    if 'tag=' in url: return url
    if '?' in url: return url + '&tag=' + AFFILIATE_TAG
    return url + '?tag=' + AFFILIATE_TAG

def fetch_amazon(url):
    try:
        r = requests.get(url, headers=HEADERS, timeout=15)
        soup = BeautifulSoup(r.text, 'html.parser')
        title = soup.select_one('#productTitle')
        price = soup.select_one('.a-price .a-offscreen') or soup.select_one('#priceblock_ourprice') or soup.select_one('#priceblock_dealprice')
        img = soup.select_one('#landingImage') or soup.select_one('.imgTagWrapper img')
        return {
            'title': title.get_text(strip=True) if title else url,
            'price_text': price.get_text(strip=True) if price else '',
            'image': img.get('src') if img else '',
            'link': add_affiliate(url)
        }
    except Exception as e:
        print("fetch_amazon error", e)
        return None

def main():
    lines = []
    try:
        with open(INPUT,'r',encoding='utf-8') as f:
            lines = [l.strip() for l in f if l.strip()]
    except:
        lines = []
    items = []
    for url in lines:
        if 'amazon' in url:
            p = fetch_amazon(url)
            if p: items.append(p)
        time.sleep(0.5)
    with open(OUT,'w',encoding='utf-8') as f:
        json.dump({'items': items}, f, indent=2, ensure_ascii=False)
    print("Saved manual products:", len(items))

if __name__=='__main__':
    main()
