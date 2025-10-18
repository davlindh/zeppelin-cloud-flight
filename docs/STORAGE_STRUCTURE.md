# Storage Structure Documentation

## Overview
This document describes the Supabase storage bucket structure used in the marketplace application. All image uploads are organized by entity type with dedicated public buckets.

## Bucket Architecture

### Public Buckets (Accessible to everyone)
```
📦 product-images/         # Product photos
📦 auction-images/         # Auction item images  
📦 service-images/         # Service listing photos
📦 provider-avatars/       # Service provider profile pictures
📦 media-files/            # General media library
📦 project-images/         # Project showcase images
📦 participant-avatars/    # Participant profile pictures
📦 sponsor-logos/          # Sponsor/partner logos
📦 ui/                     # UI assets and graphics
```

### Private Buckets (Admin/authenticated only)
```
📦 documents/              # Sensitive documents (contracts, etc.)
📦 media/                  # Private media files
```

## Configuration

### Centralized Bucket Mapping
All bucket names are defined in `src/config/storage.config.ts`:

```typescript
export const BUCKET_MAP = {
  PRODUCTS: 'product-images',
  AUCTIONS: 'auction-images',
  SERVICES: 'service-images',
  PROVIDERS: 'provider-avatars',
  MEDIA: 'media-files',
  PROJECTS: 'project-images',
  PARTICIPANTS: 'participant-avatars',
  SPONSORS: 'sponsor-logos',
  UI: 'ui',
  DOCUMENTS: 'documents',
} as const;

// Get bucket for entity type
export const getBucketForEntity = (entityType: keyof typeof BUCKET_MAP): string => {
  return BUCKET_MAP[entityType];
};
```

## Usage Examples

### Upload Product Image
```typescript
import { useImageUpload } from '@/hooks/useImageUpload';
import { BUCKET_MAP } from '@/config/storage.config';

const { uploadToSupabase } = useImageUpload();

// Upload to product-images bucket
const result = await uploadToSupabase(file, BUCKET_MAP.PRODUCTS);
```

### Upload Service Provider Avatar
```typescript
// Upload to provider-avatars bucket
const result = await uploadToSupabase(file, BUCKET_MAP.PROVIDERS);
```

### Upload to Media Library
```typescript
// Upload to media-files bucket (general purpose)
const result = await uploadToSupabase(file, BUCKET_MAP.MEDIA);
```

## URL Format

All public URLs follow this format:
```
https://[project-id].supabase.co/storage/v1/object/public/[bucket-name]/[filename]
```

Example:
```
https://paywaomkmjssbtkzwnwd.supabase.co/storage/v1/object/public/product-images/1234567890-abc123.jpg
```

## Image Optimization

All images are automatically optimized on upload:
- **Max dimensions**: 1200x1200px
- **Quality**: 80% (JPEG compression)
- **Format**: JPEG (converted from any image type)
- **Max file size**: 10MB (validated before upload)

## RLS Policies

### Public Buckets
- ✅ **SELECT**: Anyone can view/download
- ⚠️ **INSERT**: Admin only
- ⚠️ **UPDATE**: Admin only
- ⚠️ **DELETE**: Admin only

### Private Buckets
- ⚠️ **All operations**: Admin/authenticated users only

## Components Using Storage

### Product Management
- `ProductImageUpload.tsx` → `BUCKET_MAP.PRODUCTS`
- `ProductForm.tsx` → `BUCKET_MAP.PRODUCTS`

### Service Management
- `ServiceImageUpload.tsx` → `BUCKET_MAP.SERVICES`
- `ServiceForm.tsx` → `BUCKET_MAP.SERVICES`
- `ServiceProviderForm.tsx` → `BUCKET_MAP.PROVIDERS`

### Bulk Operations
- `BulkImageUploadWizard.tsx` → Dynamic bucket based on entity type

## Troubleshooting

### Error: "Bucket not found"
**Problem**: Code is using old `'uploads'` bucket name  
**Solution**: Update to use `BUCKET_MAP.ENTITY_TYPE`

```typescript
// ❌ OLD (incorrect)
await uploadToSupabase(file, 'uploads', 'products');

// ✅ NEW (correct)
await uploadToSupabase(file, BUCKET_MAP.PRODUCTS);
```

### Image Not Displaying
**Problem**: Incorrect URL format or bucket name  
**Solution**: 
1. Verify bucket name in `BUCKET_MAP`
2. Check image was uploaded to correct bucket
3. Ensure bucket has public read policy

### Upload Fails Silently
**Problem**: Missing RLS policies on bucket  
**Solution**: Verify INSERT policy exists for admin users

## Migration Guide

If you have existing images in the old `'uploads'` bucket:

1. **List all files** in uploads bucket
2. **Copy files** to appropriate new buckets:
   - `uploads/products/*` → `product-images/*`
   - `uploads/services/*` → `service-images/*`
   - `uploads/providers/*` → `provider-avatars/*`
3. **Update database records** with new URLs
4. **Verify** all images load correctly
5. **Delete** old uploads bucket (optional)

## Best Practices

1. ✅ **Always use `BUCKET_MAP`** constants, never hardcode bucket names
2. ✅ **Import from config**: `import { BUCKET_MAP } from '@/config/storage.config'`
3. ✅ **No folders needed**: Bucket names are self-describing
4. ✅ **Unique filenames**: Auto-generated with timestamp + random string
5. ✅ **Clean up old images** when updating/deleting entities

## File Naming Convention

Generated filenames follow this pattern:
```
[timestamp]-[random-string].[extension]

Example: 1734567890123-a1b2c3d4.jpg
```

This ensures:
- ✅ Unique filenames (no collisions)
- ✅ Chronological sorting
- ✅ No special characters
- ✅ Original extension preserved

## Future Improvements

### Potential Enhancements
1. **CDN Integration**: Add image transformation parameters
2. **Automatic Thumbnails**: Generate on upload
3. **WebP Conversion**: Better compression for modern browsers
4. **Lazy Loading**: Progressive image loading
5. **Image Versioning**: Keep history of replaced images

### Unified Bucket Option
Consider consolidating to single bucket with folders:
```
uploads/
  ├── products/
  ├── services/
  ├── providers/
  └── ...
```

**Pros**: Simpler RLS policies  
**Cons**: Requires migration, less clear separation

## Support

For issues or questions:
1. Check this documentation first
2. Review `storage.config.ts` for current configuration
3. Check console logs for upload errors
4. Verify RLS policies in Supabase dashboard
5. Test with small test images first

---

Last updated: 2025
Version: 1.0
