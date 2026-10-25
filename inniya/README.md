# INNIYA — E-commerce storefront

A responsive, single-page storefront concept for INNIYA, a Bihar-inspired Indian food brand.

## Preview
If GitHub Pages is enabled for `Rajatsinghboss.github.io`, visit:
https://rajatsinghboss.github.io/inniya/

## Included
- Responsive mobile-first storefront in plain HTML, CSS and JavaScript
- Product category filters and search
- Add-to-cart, quantity controls and subtotal
- Checkout form that prepares an order message
- Premium cream, deep green and gold visual direction inspired by the supplied INNIYA brand reference
- No build step or paid framework required

## Before accepting real orders
This is a front-end prototype, not a production-ready commerce system. Product prices, product photography, ingredients, allergens, shelf life, FSSAI/licence information, legal label details, shipping policy, refund policy and customer support information must be verified and completed before launch.

### Activate WhatsApp orders
Open `index.html` and replace the empty value here with your business WhatsApp number in international format, digits only (India example: `91XXXXXXXXXX`):

```js
const WHATSAPP_NUMBER = '';
```

Do not use a personal or agency number unless it is the number you want customers to contact for INNIYA orders.

### Add the real brand image
The supplied image was used as the visual reference for the design. To include the original file in the repository, upload it to `assets/inniya-brand-reference.jpg` and update the relevant image paths if you want it displayed on the storefront. Product photos in this prototype are illustrative remote images and must be replaced with real product photos before launch.

### Payments and order management
No payment gateway, inventory database, order database, email marketing service or admin dashboard is connected yet. To accept payments online, connect a provider such as Razorpay or Cashfree through a secure backend/serverless function and configure order storage, payment verification, privacy notices and fulfilment workflow. Never put secret API keys in front-end code.

## Run locally
Open `index.html` in a browser. No installation required.
