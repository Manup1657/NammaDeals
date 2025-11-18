#!/usr/bin/env python3
import json, re

# keyword-to-category mapping
MAP = {
  'mobiles': ['phone','mobile','oneplus','samsung','redmi','vivo','oppo','itel','xiaomi'],
  'electronics': ['earbud','earphone','headphone','speaker','charger','power bank','camera','laptop','tablet','watch'],
  'fashion': ['kurta','tshirt','jeans','saree','dress','shoes','shirt','hoodie','jacket','trouser'],
  'home': ['mixer','kettle','cookware','pressure','pan','mug','kitchen','vacuum'],
  'beauty': ['cream','soap','shampoo','skincare','makeup','perfume'],
  'appliances': ['refrigerator','washing','ac ','air conditioner','microwave','grill'],
}
def categorize(title):
    t = title.lower()
    for cat, kws in MAP.items():
        for kw in kws:
            if kw in t:
                return cat
    return 'trending'

def process(infile='deals.json', outfile='deals.json'):
    with open(infile,'r',encoding='utf-8') as f: data = json.load(f)
    arr = data.get('deals') or data.get('items') or []
    for it in arr:
        if not it.get('category'):
            it['category'] = categorize(it.get('title',''))
    data['deals'] = arr
    with open(outfile,'w',encoding='utf-8') as f: json.dump(data,f,indent=2,ensure_ascii=False)
    print('Categorized', len(arr))

if __name__=='__main__':
    process()
