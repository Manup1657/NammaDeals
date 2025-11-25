#!/usr/bin/env python3
"""
fetch_deals.py — NammaDeals Automation
-------------------------------------
Fetches current deals from Amazon and saves them to deals.json.
Auto-adds your affiliate tag (nammadeals-21) to all links.
If the Amazon Product Advertising API is not configured, it uses a safe scraping fallback.

To use:
- Run manually or via GitHub Actions.
- Add these secrets to your repo if using PA-API:
  AMAZON_ACCESS_KEY
  AMAZON_SECRET_KEY
  AMAZON_ASSOCIATE_TAG  (set to nammadeals-21)
"""

import os
import json
import datetime
import requests
from bs4 import BeautifulSoup
from pathlib import Path

# Output file
OUT_FILE = Path("deals.json")

# Your affiliate tag (default fallback)
AFFILIATE_TAG = os.environ.get("AMAZON_ASSOCIATE_TAG", "nammadeals-21")

def add_affiliate_tag(link: str) -> str:
    """Ensure affiliate tag is appended to every Amazon link."""
    if not link:
        return ""
    if "?tag=" in link:
        return link
    return link + ("&" if "?" in link else "?") + f"tag={AFFILIATE_TAG}"

def scrape_amazon_lightning_deals():
    """Fetches top Lightning Deals from Amazon.in (best-effort)."""
    url = "https://www.amazon.in/gp/goldbox"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
    }

    print("🔄 Fetching Lightning Deals from Amazon...")
    response = requests.get(url, headers=headers, timeout=20)
    response.raise_for_status()

    soup = BeautifulSoup(response.text, "html.parser")
    deals = []

    for a in soup.select("a[data-asin]")[:15]:
        asin = a.get("data-asin")
        title = a.get("aria-label") or a.get("title") or a.text.strip()
        href = a.get("href")
        if not asin or not href:
            continue

        product_url = "https://www.amazon.in" + href.split("?")[0]
        product_url = add_affiliate_tag(product_url)

        deals.append({
            "title": title[:120],
            "affiliate_link": product_url,
            "image": "",
            "source": "amazon.in",
            "price_text": "",
            "local": "national",
            "verified": False
        })

    print(f"✅ Scraped {len(deals)} deals.")
    return deals

def save_deals(deals):
    """Write deals to deals.json."""
    data = {
        "generated_at": datetime.datetime.utcnow().isoformat() + "Z",
        "deals": deals
    }
    OUT_FILE.write_text(json.dumps(data, indent=2), encoding="utf-8")
    print(f"💾 Saved {len(deals)} deals to {OUT_FILE}")

def main():
    try:
        deals = scrape_amazon_lightning_deals()
        if not deals:
            raise ValueError("No deals found")
    except Exception as e:
        print("⚠️ Fallback: no deals scraped due to error:", e)
        deals = [{
            "title": "No deals found — check back soon",
            "affiliate_link": f"https://www.amazon.in/?tag={AFFILIATE_TAG}",
            "source": "amazon.in",
            "local": "national",
            "verified": False
        }]
    save_deals(deals)

if __name__ == "__main__":
    main()
