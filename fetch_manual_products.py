import requests, json, re
from bs4 import BeautifulSoup

AFFILIATE_TAG = "discoshop-21"

def fetch_product(url):
    headers = {"User-Agent": "Mozilla/5.0"}

    try:
        r = requests.get(url, headers=headers, timeout=15)
        soup = BeautifulSoup(r.text, "html.parser")

        # TITLE
        title = soup.select_one("#productTitle")
        title = title.get_text(strip=True) if title else "Unknown Product"

        # PRICE
        price = soup.select_one(".a-price .a-offscreen")
        price = price.get_text(strip=True) if price else "—"

        # IMAGE
        img = soup.select_one("#landingImage")
        img = img.get("src") if img else ""

        # Affiliate link
        if "tag=" not in url:
            if "?" in url:
                url += f"&tag={AFFILIATE_TAG}"
            else:
                url += f"?tag={AFFILIATE_TAG}"

        return {
            "title": title,
            "price": price,
            "image": img,
            "link": url,
            "source": "Manual Fetch"
        }

    except Exception as e:
        return None


if __name__ == "__main__":
    with open("input_links.txt") as f:
        links = [x.strip() for x in f.readlines() if x.strip()]

    items = []
    for link in links:
        product = fetch_product(link)
        if product:
            items.append(product)

    with open("manual_products.json", "w", encoding="utf-8") as f:
        json.dump({"items": items}, f, ensure_ascii=False, indent=2)
