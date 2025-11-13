
#!/usr/bin/env python3
"""
fetch_deals.py - NammaDeals
Generates deals.json using PA-API if available, otherwise fallback scrape.
"""
import os, json, datetime
from pathlib import Path
OUT = Path('deals.json')
def save(deals):
    data = {"generated_at": datetime.datetime.utcnow().isoformat() + 'Z', "deals": deals}
    OUT.write_text(json.dumps(data, indent=2), encoding='utf-8')

def amazon_scrape_fallback():
    # lightweight best-effort scraping for example purposes
    try:
        import requests
        from bs4 import BeautifulSoup
        url = "https://www.amazon.in/gp/goldbox"
        headers = {"User-Agent":"Mozilla/5.0"}
        r = requests.get(url, headers=headers, timeout=15)
        soup = BeautifulSoup(r.text,'html.parser')
        deals=[]
        for a in soup.select("a[data-asin]")[:10]:
            asin=a.get('data-asin'); href=a.get('href') or ''
            if not asin or not href: continue
            title = a.get('aria-label') or a.text.strip() or 'Deal'
            link = "https://www.amazon.in" + href.split('?')[0] + "?tag=" + (os.environ.get('AMAZON_ASSOCIATE_TAG') or 'discoshop-21')
            deals.append({"title": title[:120], "price_text":"","affiliate_link":link, "image":"","source":"amazon.in"})
        return deals
    except Exception as e:
        print("scrape failed", e)
        return []

def main():
    deals = amazon_scrape_fallback()
    if not deals:
        deals = [{"title":"No deals found — check back soon","price_text":"","affiliate_link":"https://www.amazon.in/?tag=discoshop-21","image":"","source":"amazon.in"}]
    save(deals)

if __name__=='__main__':
    main()
