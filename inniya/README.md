# INNIYA — Storefront and Admin Studio

A responsive, static storefront concept for INNIYA, a Bihar-inspired Indian food brand.

## Links
- Storefront: https://rajatsinghboss.github.io/inniya/
- Admin Studio: https://rajatsinghboss.github.io/inniya/admin.html
- Repository folder: https://github.com/Rajatsinghboss/rajatsinghboss.github.io/tree/main/inniya

## Admin features
Edit brand name, tagline, announcement, logo image, theme colours, homepage headline/copy/images, story section, promotion banner, promise-section intro, product details, categories, pack sizes, prices, badges, descriptions, photos, product visibility, contact details and WhatsApp order number. Add or remove products, upload images under 900 KB, and import/export a JSON backup.

## Publish changes to the public store
The admin updates `inniya/site-config.json` using the GitHub Contents API.

1. Create a **fine-grained personal access token** at https://github.com/settings/personal-access-tokens/new.
2. Select **Only select repositories** and choose `Rajatsinghboss/rajatsinghboss.github.io`.
3. Give only **Contents: Read and write** permission (metadata read is automatic).
4. Open Admin Studio, go to **Publish & backup**, paste the token, then click **Publish changes**.
5. The token is not saved to localStorage or repository files and is cleared after a successful publish.
6. GitHub Pages may take a few minutes to rebuild before the changes appear.

Never use a broad-scope classic token or share your token. Revoke it from GitHub settings if you suspect exposure. Never put payment-provider secret keys in this static page.

## Important launch limitations
This is a front-end storefront and content manager, not a complete production commerce backend. No payment gateway is connected; orders are not stored in an order database; there is no inventory tracking, shipping integration, customer accounts or admin order list. Product prices and photos are illustrative until you confirm them. Complete the product labels, ingredient/allergen information, food registration details, shipping/refund policy and support contacts before accepting orders. Upload your approved logo and actual product photos in Admin Studio.

## Run locally
Open `index.html` for a static preview. For admin operation, use the GitHub Pages-hosted `admin.html`.
