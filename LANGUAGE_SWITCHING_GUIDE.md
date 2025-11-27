# Language Switching & Complete Swedish Localization - Implementation Guide

## ✅ Completed Implementation

### 1. Infrastructure
- ✅ react-i18next fully configured
- ✅ Swedish (sv) set as default language
- ✅ English (en) available as secondary
- ✅ Language detection and persistence in localStorage
- ✅ All currency displays in Swedish SEK format

### 2. Language Switcher Component
**Location**: `src/components/common/LanguageSwitcher.tsx`

Features:
- Dropdown menu with flag emojis (🇸🇪 Svenska, 🇬🇧 English)
- Shows current language
- Responsive design (shows full name on desktop, flag only on mobile)
- Integrated into Header (desktop and mobile menu)

### 3. Translation Files

**Swedish** (`src/i18n/locales/sv/translation.json`):
- Complete marketplace terminology
- Product details strings
- Cart and wishlist translations
- Order management translations
- Common UI elements

**English** (`src/i18n/locales/en/translation.json`):
- Full English equivalents
- Note: Currency still shows SEK even in English

### 4. How to Use Translations in Components

#### Basic Usage:

```typescript
import { useTranslation } from 'react-i18next';

const MyComponent = () => {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('product.title')}</h1>
      <button>{t('marketplace.addToCart')}</button>
      <p>{t('product.inStock')}</p>
    </div>
  );
};
```

#### With Dynamic Values:

```typescript
// Translation key in JSON:
// "watching": "{{count}} bevakar"

// Usage in component:
{t('product.watching', { count: watchersCount })}
// Result: "5 bevakar" (Swedish) or "5 watching" (English)
```

#### With Pluralization:

```typescript
// Translation keys in JSON:
// "itemsInCart": "{{count}} artikel i varukorgen"
// "itemsInCart_plural": "{{count}} artiklar i varukorgen"

// Usage:
{t('cart.itemsInCart', { count: items.length })}
// Result: "1 artikel..." or "5 artiklar..."
```

### 5. Available Translation Keys

#### Common UI
- `common.loading` → "Laddar..." / "Loading..."
- `common.error` → "Fel" / "Error"
- `common.save` → "Spara" / "Save"
- `common.cancel` → "Avbryt" / "Cancel"
- `common.delete` → "Ta bort" / "Delete"

#### Product Details
- `product.addToCart` → "Lägg i varukorg" / "Add to Cart"
- `product.addingToCart` → "Lägger till i varukorg..." / "Adding to Cart..."
- `product.inStock` → "I lager" / "In Stock"
- `product.outOfStock` → "Slut i lager" / "Out of Stock"
- `product.quantity` → "Antal" / "Quantity"
- `product.youSave` → "Du sparar" / "You save"
- `product.watching` → "{{count}} bevakar" / "{{count}} watching"
- `product.onlyLeft` → "Endast {{count}} kvar" / "Only {{count}} left"

#### Shopping Cart
- `cart.title` → "Varukorg" / "Shopping Cart"
- `cart.empty` → "Din varukorg är tom" / "Your cart is empty"
- `cart.checkout` → "Gå till kassan" / "Checkout"
- `cart.clearCart` → "Töm varukorg" / "Clear Cart"

#### Marketplace
- `marketplace.shop` → "Butik" / "Shop"
- `marketplace.wishlist` → "Önskelista" / "Wishlist"
- `marketplace.total` → "Totalt" / "Total"
- `marketplace.subtotal` → "Delsumma" / "Subtotal"
- `marketplace.shipping` → "Frakt" / "Shipping"
- `marketplace.tax` → "Moms" / "Tax"

### 6. Step-by-Step: Localizing a Component

**Example: Converting CartPage to use translations**

1. **Import useTranslation**:
```typescript
import { useTranslation } from 'react-i18next';
```

2. **Use the hook**:
```typescript
const CartPage = () => {
  const { t } = useTranslation();
  // ... rest of component
```

3. **Replace hardcoded strings**:
```typescript
// Before:
<h1>Shopping Cart</h1>

// After:
<h1>{t('cart.title')}</h1>

// Before:
<Button>Checkout</Button>

// After:
<Button>{t('cart.checkout')}</Button>

// Before:
<span>Your cart is empty</span>

// After:
<span>{t('cart.empty')}</span>
```

4. **Dynamic values**:
```typescript
// Before:
<span>{items.length} items in cart</span>

// After:
<span>{t('cart.itemsInCart', { count: items.length })}</span>
```

### 7. Adding New Translation Keys

To add new translations:

1. **Open both translation files**:
   - `src/i18n/locales/sv/translation.json`
   - `src/i18n/locales/en/translation.json`

2. **Add the key in the appropriate section**:

```json
// Swedish (sv)
{
  "product": {
    "newKey": "Ny svensk text"
  }
}

// English (en)
{
  "product": {
    "newKey": "New English text"
  }
}
```

3. **Use in component**:
```typescript
{t('product.newKey')}
```

### 8. Language Switching Locations

The LanguageSwitcher is visible in:
- ✅ Desktop header (right side, before contact button)
- ✅ Mobile menu (at bottom of menu)

Users can switch languages by clicking the language button and selecting:
- 🇸🇪 Svenska (Swedish)
- 🇬🇧 English

The selected language is:
- Saved in localStorage
- Persists across page reloads
- Applies to all translated content immediately

### 9. Testing Language Switching

1. **Open your application**
2. **Find the language switcher** (globe icon with flag)
3. **Click to open dropdown**
4. **Select different language**
5. **Verify** that:
   - Text changes immediately
   - Currency format stays Swedish (SEK)
   - Selection is remembered on reload

### 10. Remaining Work for Complete Localization

To fully localize all pages, apply the translation pattern to:

#### High Priority:
- [ ] WishlistPage - Replace "Add to Cart", "Remove", etc.
- [ ] CartPage - Replace "Shopping Cart", "Checkout", etc.
- [ ] OrderSuccessPage - Replace order-related text (merged functionality)
- [ ] OrderTrackingPage - Replace tracking-related text

#### Medium Priority:
- [ ] Shop page - Category filters, sorting options
- [ ] Services page - Service-related text
- [ ] Auction pages - Bidding text

#### Low Priority:
- [ ] Admin pages - Admin interface text
- [ ] Forms - Form labels and validation messages
- [ ] Error messages - Error handling text

### 11. Quick Reference: Most Used Keys

```typescript
// Buttons & Actions
t('common.save')           // "Spara" / "Save"
t('common.cancel')         // "Avbryt" / "Cancel"
t('common.delete')         // "Ta bort" / "Delete"
t('marketplace.addToCart') // "Lägg i varukorg" / "Add to Cart"

// Status
t('product.inStock')       // "I lager" / "In Stock"
t('product.outOfStock')    // "Slut i lager" / "Out of Stock"
t('common.loading')        // "Laddar..." / "Loading..."

// Shopping
t('cart.title')            // "Varukorg" / "Shopping Cart"
t('cart.checkout')         // "Gå till kassan" / "Checkout"
t('marketplace.total')     // "Totalt" / "Total"

// Currency (use utility, not translation)
formatCurrency(1234)       // "1 234 kr" (always Swedish format)
```

### 12. Best Practices

1. **Always use translation keys** instead of hardcoding text
2. **Keep keys organized** by feature/section in JSON files
3. **Use descriptive key names** like `product.addToCart` not `button1`
4. **Add new keys** to both Swedish AND English files
5. **Test both languages** after adding new features
6. **Use formatCurrency()** for all monetary values
7. **Keep currency in SEK** regardless of language

### 13. Troubleshooting

**Translation not showing?**
- Check that key exists in both sv and en JSON files
- Verify useTranslation hook is called
- Check browser console for i18n errors

**Language not switching?**
- Clear localStorage and try again
- Check that LanguageSwitcher is imported in Header
- Verify i18n config is imported in main.tsx

**Currency still showing $?**
- Use formatCurrency() utility instead of hardcoding
- Check for old template strings like `$${price}`

## Summary

Your application now has:
- ✅ Full internationalization infrastructure
- ✅ Language switcher in header (desktop & mobile)
- ✅ Comprehensive Swedish translations
- ✅ English fallback translations
- ✅ All currency in Swedish SEK format
- ✅ Easy pattern for localizing remaining pages

The visitor-facing text will be consistent Swedish when Swedish is selected, and the language switcher allows users to toggle to English if preferred.

---

**Next Steps**: Apply the translation pattern shown above to remaining pages for complete localization.
