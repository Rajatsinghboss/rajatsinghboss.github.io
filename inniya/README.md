# INNIYA — Storefront, Admin Studio and Razorpay checkout

A responsive, static storefront demo for INNIYA, a Bihar-inspired Indian food brand. It includes eight visible sample products with illustrative prices, product browsing, cart, a GitHub-backed content editor, and a Razorpay checkout frontend with Netlify server-side order creation and verification.

## Links
- Current GitHub Pages storefront: https://rajatsinghboss.github.io/inniya/
- Admin Studio: https://rajatsinghboss.github.io/inniya/admin.html
- GitHub source: https://github.com/Rajatsinghboss/rajatsinghboss.github.io/tree/main/inniya
- Netlify payment project: https://app.netlify.com/projects/inniya-payments
- Intended Netlify storefront/backend URL after deployment: https://inniya-payments.netlify.app/

## Admin features
Edit brand name, tagline, announcement, logo image, theme colours, homepage text/images, story section, promotion banner, promise intro, product details, categories, pack sizes, prices, badges, descriptions, photos, product visibility, contact details, WhatsApp order number, and payment API base URL. Add/remove products, upload images under 900 KB, and import/export a JSON backup.

## Razorpay integration
- Server-side order creation: `netlify/functions/razorpay-create-order.mts`
- Server-side verification: `netlify/functions/razorpay-verify-payment.mts`
- Netlify build config: `netlify.toml`
- Prices are calculated server-side from `inniya/site-config.json`; the checkout never trusts a price supplied by the browser.
- The server verifies Razorpay's HMAC signature and independently checks the order/payment association, amount, currency and captured status.
- Payment endpoints use per-IP rate limits and an origin allowlist.
- The payment API base URL is set in `site-config.json` and can also be edited from Admin Studio.
- Customer/order details are attached to the Razorpay order notes, but this prototype does not store orders in its own database or provide an admin order list.

## Required setup before a test payment
The code is committed, but online payments will not work until the Netlify project is linked and deployed and Razorpay keys have been configured.

### A. Link the Netlify project to GitHub
1. Open https://app.netlify.com/projects/inniya-payments.
2. Go to **Project configuration → Developer settings → Continuous deployment → Repository**.
3. Choose **Link repository**, select GitHub, and choose `Rajatsinghboss/rajatsinghboss.github.io` on branch `main`.
4. Ensure the base directory is the repository root, publish directory is `inniya`, and functions directory is `netlify/functions`. The checked-in `netlify.toml` already declares these settings.
5. Start the deployment and wait for it to finish. The payment API endpoints are then expected at `https://inniya-payments.netlify.app/api/razorpay/create-order` and `https://inniya-payments.netlify.app/api/razorpay/verify-payment`.

If the repository isn't listed, use Netlify's GitHub connection prompt to grant the Netlify GitHub App access to this repository.

### B. Add Razorpay TEST credentials securely
1. Log into https://dashboard.razorpay.com and switch to **Test Mode**.
2. Generate or view the test API keys from the Razorpay dashboard API keys area.
3. In Netlify, open the `inniya-payments` project and go to **Project configuration → Environment variables**.
4. Add `RAZORPAY_KEY_ID` with the Razorpay test Key ID.
5. Add `RAZORPAY_KEY_SECRET` with the Razorpay test Key Secret. Mark it secret and make sure it is available to Functions (or all scopes if that is the only option).
6. Redeploy the Netlify site after setting the variables. Keep the secret only in Netlify; never put it in HTML, JSON, GitHub, or chat.

The non-secret `PAYMENT_ALLOWED_ORIGINS` variable is already configured for `https://rajatsinghboss.github.io` and `https://inniya-payments.netlify.app`. Update it in Netlify if you change domains.

### C. Test before going live
1. Open the storefront and add a published product to the cart.
2. Enter customer and delivery details, then choose **Pay online**.
3. Complete a test-mode transaction using the test payment flow provided by Razorpay.
4. Confirm the verify response reports a captured payment and check the order in Razorpay Test Mode.
5. After testing, complete Razorpay account activation/KYC and use Live Mode keys in Netlify only when ready to accept real money.

Razorpay requires server-created orders and server-side signature/payment-status verification. See the official [Standard Checkout integration guide](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/integration-steps/) and [Netlify repository linking docs](https://docs.netlify.com/build/git-workflows/repo-permissions-linking/).

## Important limitations
- No payment gateway is active until the Netlify Git deployment and Razorpay keys are configured.
- Orders aren't persisted to a separate order database; order notes and transactions can be reviewed in Razorpay's dashboard. No inventory tracking, shipping API, email notification or admin orders panel is connected.
- Payment capture must be enabled/configured appropriately in Razorpay; the verification function treats an order as paid only when Razorpay reports the payment captured and order paid.
- Product prices and photos are illustrative until verified. Complete legal food labels, ingredients/allergens, applicable food registration details, shipping/refund policies and customer support details before selling.
- Never place any Razorpay secret or GitHub access token in public code.
