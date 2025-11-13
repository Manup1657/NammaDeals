
# NammaDeals — Local Affiliate Deals Site (Mysuru / Karnataka)

This repo contains a static single-page site that reads `deals.json` and shows localized deal sections.
Features:
- English / Kannada toggle (client-side)
- WhatsApp + Telegram quick links
- Local sections: Mysuru, Karnataka, National
- Price Tracker (browser localStorage stub)
- Share & Earn referral UI (client-side stub)
- GitHub Actions workflow to update `deals.json` every 3 hours

Deploy:
1. Create a GitHub repo and push these files.
2. Enable GitHub Pages (branch main, root).
3. Add secret `AMAZON_ASSOCIATE_TAG` = `discoshop-21` (optional).
4. Enable Actions. The workflow will try to update `deals.json`. Without secrets, it uses a lightweight scrape fallback.

Notes:
- For stable affiliate content use Amazon Product Advertising API (PA-API).
- The price tracker and share/referral are local features (no backend). To make them server-backed later, integrate a small backend (I can help).
