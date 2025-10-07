# Database Migration Instructions

## Overview
The marketplace integration requires deploying database tables to your Supabase instance. Since the Supabase CLI is not available locally, you'll need to manually execute the migration SQL.

## Migration File
**Location**: `supabase/migrations/20250107000000_add_marketplace_tables.sql`

This file contains all the necessary SQL to create:
- Products tables (products, product_variants, product_reviews)
- Auctions tables (auctions, bid_history)
- Services tables (services, service_providers, bookings, etc.)
- Categories system (unified hierarchical)
- Communication system
- Storage buckets
- RLS policies
- Indexes and triggers

## Deployment Options

### Option 1: Via Supabase Dashboard (Recommended)

1. **Open Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your project: `paywaomkmjssbtkzwnwd`

2. **Navigate to SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New query"

3. **Copy Migration SQL**
   - Open `supabase/migrations/20250107000000_add_marketplace_tables.sql`
   - Copy the entire file contents

4. **Execute Migration**
   - Paste the SQL into the query editor
   - Click "Run" or press Ctrl+Enter
   - Wait for execution to complete

5. **Verify Success**
   - Check for any error messages
   - Navigate to "Table Editor" to confirm new tables exist:
     - products
     - auctions
     - services
     - service_providers
     - categories
     - bookings
     - bid_history
     - product_reviews
     - etc.

### Option 2: Via Supabase CLI (If Installed Later)

If you install Supabase CLI in the future:

```bash
# Install Supabase CLI (if not installed)
npm install -g supabase

# Link to your project
supabase link --project-ref paywaomkmjssbtkzwnwd

# Push the migration
supabase db push
```

### Option 3: Direct Database Connection

If you have direct PostgreSQL access:

```bash
# Connect to your Supabase PostgreSQL instance
psql "postgresql://postgres:[YOUR-PASSWORD]@db.paywaomkmjssbtkzwnwd.supabase.co:5432/postgres"

# Then paste the migration SQL
\i supabase/migrations/20250107000000_add_marketplace_tables.sql
```

## Post-Migration Verification

### 1. Check Tables
Verify all tables were created:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'products', 'product_variants', 'product_reviews',
  'auctions', 'bid_history',
  'services', 'service_providers', 'bookings',
  'service_reviews', 'service_portfolio_items',
  'categories', 'category_metadata',
  'communication_requests'
);
```

### 2. Check Storage Buckets
Navigate to Storage in Supabase Dashboard and verify these buckets exist:
- product-images
- auction-images
- service-images
- provider-avatars

### 3. Check RLS Policies
Verify RLS is enabled and policies are in place:

```sql
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';
```

### 4. Test Atomic Functions
Verify the `place_bid` function exists:

```sql
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name = 'place_bid';
```

## Troubleshooting

### Error: Type Already Exists
If you see errors about types already existing (e.g., `auction_condition`), it means some enums were already created. You can:

1. **Skip the CREATE TYPE statements** - Comment them out and run again
2. **Drop and recreate** - Run `DROP TYPE IF EXISTS type_name CASCADE;` first

### Error: Table Already Exists
If tables already exist:
- Use `DROP TABLE IF EXISTS table_name CASCADE;` before the CREATE TABLE
- Or skip those specific tables

### Error: Storage Buckets Already Exist
The migration uses `ON CONFLICT (id) DO NOTHING` for storage buckets, so this should not cause errors.

### Error: Policy Already Exists
If policies exist, you can:
- Drop existing policies: `DROP POLICY IF EXISTS policy_name ON table_name;`
- Or skip policy creation statements

## Important Notes

1. **Backup First**: Always backup your database before running migrations
2. **Test Environment**: Consider testing in a development/staging environment first
3. **Dependencies**: The migration assumes the `is_admin()` function exists (created in main site migration)
4. **No Data Loss**: This migration only creates new tables and doesn't modify existing ones

## Rollback

If you need to rollback the migration:

```sql
-- Drop all marketplace tables
DROP TABLE IF EXISTS communication_requests CASCADE;
DROP TABLE IF EXISTS service_portfolio_items CASCADE;
DROP TABLE IF EXISTS service_reviews CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS services CASCADE;
DROP TABLE IF EXISTS service_providers CASCADE;
DROP TABLE IF EXISTS bid_history CASCADE;
DROP TABLE IF EXISTS auctions CASCADE;
DROP TABLE IF EXISTS product_reviews CASCADE;
DROP TABLE IF EXISTS product_variants CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS category_metadata CASCADE;
DROP TABLE IF EXISTS categories CASCADE;

-- Drop enums
DROP TYPE IF EXISTS booking_status CASCADE;
DROP TYPE IF EXISTS communication_status CASCADE;
DROP TYPE IF EXISTS communication_type CASCADE;
DROP TYPE IF EXISTS product_category CASCADE;
DROP TYPE IF EXISTS service_category CASCADE;
DROP TYPE IF EXISTS auction_category CASCADE;
DROP TYPE IF EXISTS auction_condition CASCADE;

-- Remove storage buckets (via Dashboard or API)
```

## Support

If you encounter issues:
1. Check the error message carefully
2. Verify your Supabase project is active
3. Ensure you have proper permissions
4. Consult Supabase documentation: https://supabase.com/docs

## Next Steps After Migration

Once the migration is successful:
1. Visit http://localhost:8081/marketplace
2. Test the Auctions, Shop, and Services sections
3. Verify data can be created and retrieved
4. Check that images can be uploaded to storage buckets
5. Test the bidding functionality (if implementing)

## Migration Timestamp
Migration created: 2025-01-07
File: `supabase/migrations/20250107000000_add_marketplace_tables.sql`
