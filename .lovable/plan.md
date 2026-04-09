

# Plan: Finalize Store & Shop for Production

## Current State Assessment

The marketplace shop has a solid foundation:
- **Product catalog** with filtering, search, variants, comparison, wishlists
- **Cart system** with CartSidebar, CartPage, ticket + product support
- **Checkout flow** using Stripe Elements (PaymentIntent) with shipping form, tax/VAT, and order creation
- **Order management** with MyOrdersPage, OrderSuccess, verify-order-payment
- **Admin product management** at `/admin/products`
- **Provider/seller dashboards** with product, order, and revenue pages
- **Edge functions**: create-payment-intent (secured), create-marketplace-checkout (unsecured, unused in main flow), verify-order-payment (secured)

## Issues to Fix

### 1. Duplicate/Dead Payment Functions
- `create-marketplace-checkout` creates Stripe Checkout Sessions but is **not used** by the actual checkout flow (CheckoutPage uses `create-payment-intent` for Stripe Elements instead)
- `useMarketplaceCheckout.ts` hook exists but is imported in `useCheckout.ts` without being called in the checkout flow
- **Action**: Remove `create-marketplace-checkout` edge function and `useMarketplaceCheckout.ts` hook, or consolidate into a single clear path

### 2. Checkout Flow Has Broken Review Step
- CheckoutPage flow: Shipping -> Payment -> Review
- But the Review step calls `handlePlaceOrder` which just sets paymentInfo and goes to review — it doesn't actually trigger payment. The Stripe Elements payment form in the Payment step is the actual payment trigger
- The `OrderReview` step's "Place Order" button calls `handlePlaceOrder` which does nothing useful after payment is already done
- **Action**: Fix checkout flow so Review step either comes before payment or is removed (payment via Stripe Elements is the final step)

### 3. Swedish Localization Incomplete
- Shop header says "Discover Premium Products", "Free Shipping $50+", "24h Delivery", "Price Match" in English
- Currency is SEK but UI text is mixed English/Swedish
- **Action**: Translate shop UI text to Swedish to match rest of site ("Auktioner", "Butik", "Tjänster" are already Swedish)

### 4. Checkout Config Uses SEK but Shows "$"
- `checkout.config.ts` correctly uses SEK, 25% MOMS, free shipping at 1500 SEK
- But the Shop page header says "Free Shipping $50+" which is wrong
- **Action**: Fix to "Fri frakt över 1 500 kr"

### 5. Missing Stock/Inventory Validation at Checkout
- Cart allows adding items but checkout doesn't re-validate stock before payment
- **Action**: Add stock validation in the order creation step

### 6. Order Success Page Missing Cart Clear
- After successful payment, cart is not cleared automatically
- **Action**: Clear cart on order success page load

## Implementation Plan

### Step 1: Fix Checkout Flow (HIGH)
- Restructure CheckoutPage to a 2-step flow: **Shipping** -> **Payment** (Stripe Elements handles payment directly)
- Remove the broken Review step (or move it before payment as an order summary)
- Ensure cart is cleared after successful payment
- Add stock re-validation before creating the order

### Step 2: Clean Up Dead Payment Code (HIGH)
- Delete `supabase/functions/create-marketplace-checkout/index.ts` (unused, unsecured)
- Delete or repurpose `src/hooks/marketplace/useMarketplaceCheckout.ts`
- Remove the unused import from `useCheckout.ts`

### Step 3: Swedish Localization for Shop (MEDIUM)
- Translate Shop.tsx header text:
  - "Discover Premium Products" -> "Utforska Våra Produkter"
  - "Search products or browse by category" -> "Sök produkter eller bläddra efter kategori"
  - "Free Shipping $50+" -> "Fri frakt över 1 500 kr"
  - "24h Delivery" -> "Snabb leverans"
  - "Price Match" -> "Prisgaranti"
  - "Filters" -> "Filter"
- Translate CheckoutPage headings to Swedish
- Translate OrderSuccess page to Swedish

### Step 4: Order Success Improvements (MEDIUM)
- Auto-clear cart on successful order verification
- Add order tracking link
- Ensure verify-order-payment is called on page load

### Step 5: Admin Product Page Polish (LOW)
- Ensure ProductsPage works with all product fields (seller_id, event_id, visibility, approval_status)
- Verify product images upload to correct storage bucket

## Technical Details

### Files to modify:
- `src/pages/marketplace/CheckoutPage.tsx` - Fix flow, add stock validation, translate
- `src/pages/marketplace/Shop.tsx` - Translate UI text
- `src/pages/marketplace/OrderSuccess.tsx` - Add cart clearing
- `src/hooks/marketplace/useCheckout.ts` - Remove unused import, add stock check
- `src/hooks/marketplace/useMarketplaceCheckout.ts` - Delete
- `supabase/functions/create-marketplace-checkout/index.ts` - Delete

### Files to verify work correctly:
- `src/pages/marketplace/CartPage.tsx`
- `src/pages/marketplace/ProductDetail.tsx`
- `src/components/marketplace/cart/CartSidebar.tsx`
- `src/pages/admin/ProductsPage.tsx`

