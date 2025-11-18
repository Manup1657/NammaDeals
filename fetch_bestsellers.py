#!/usr/bin/env python3
import requests, json, datetime, time
from bs4 import BeautifulSoup
OUT = 'bestsellers.json'
HEADERS = {'User-Agent':'Mozilla/5.0'}

def scrape(limit=50):
    url = 'https://www.amazon.in/gp/bestsellers'
    r = requests.get(url, headers=HEADERS, timeout=20)
    soup = BeautifulSoup(r.text, 'html.parser')
    items = []
    nodes = soup.select('ol#zg-ordered-list li')[:limit]
    for n in nodes:
        a = n.select_one('a.a-link-normal') or n.select_one('a')
        href = a.get('href','') if a else ''
        title = (a.get('title') or a.text.strip()) if a else ''
        img = n.select_one('img')
        img_url = img.get('src') if img else ''
        link = 'https://www.amazon.in' + href.split('?')[0] if href else ''
        items.append({'title': title[:200],'link': link,'affiliate_link': link,'image': img_url,'price_text':'','source':'amazon.in'})
        time.sleep(0.03)
    data = {'generated_at': datetime.datetime.utcnow().isoformat()+'Z','items':items}
    with open(OUT,'w',encoding='utf-8') as f:
        json.dump(data,f,indent=2,ensure_ascii=False)
    print("Saved", len(items))
if __name__=='__main__':
    scrape(50)
