# Deprecated Components

This folder contains components that are deprecated and should not be used in new code.

## EnhancedImage.tsx

**Status**: DEPRECATED  
**Replacement**: Use `OptimizedImage` from `@/components/ui/OptimizedImage`

### Migration Guide

The `EnhancedImage` component has been replaced with `OptimizedImage`, which provides:
- Automatic URL processing via `getImageUrl()`
- Proper srcSet generation with `generateSrcSet()`
- Thumbnail support via `getThumbnailUrl()`
- Better error handling
- Simplified props interface
- Integration with design system

**Before:**
```tsx
import { EnhancedImage } from '@/components/multimedia/EnhancedImage';

<EnhancedImage
  src={imageUrl}
  alt="Description"
  aspectRatio="video"
  grayscale={true}
  blur={true}
/>
```

**After:**
```tsx
import { OptimizedImage } from '@/components/ui/OptimizedImage';

<OptimizedImage
  src={imageUrl}
  alt="Description"
  aspectRatio="16/9"
  className="grayscale blur-sm"
  objectFit="cover"
/>
```

### Key Changes

1. **URL Processing**: All image URLs are now automatically processed through `getImageUrl()` to handle Supabase storage paths correctly
2. **Aspect Ratio**: Use CSS-style values like `"16/9"` instead of `"video"`
3. **Visual Effects**: Use Tailwind classes instead of boolean props:
   - `grayscale={true}` → `className="grayscale"`
   - `blur={true}` → `className="blur-sm"`
4. **Object Fit**: Explicit `objectFit` prop instead of `className` hacks
5. **Rounded/Shadow**: Simplified props: `rounded="lg"` and `shadow="md"`
