# Orders RLS Policy Fix Guide

## Problem
The order creation was failing with "permission denied for table users" error because the RLS policies were trying to directly query the `auth.users` table, which is not allowed from RLS policy expressions.

## Solution Created
I've created a migration file at `supabase/migrations/20251022193800_fix_orders_rls_policies.sql` that:

1. **Creates a safe helper function** (`current_user_email()`) that uses `SECURITY DEFINER` to safely access `auth.users`
2. **Fixes all RLS policies** on `orders`, `order_items`, and `order_status_history` tables
3. **Updates the trigger function** to handle role checking more safely with proper error handling
4. **Grants necessary permissions** to anonymous and authenticated users

## How to Apply the Migration

### Option 1: Using Supabase CLI (Recommended)

1. Make sure you have the Supabase CLI installed and linked to your project:
   ```bash
   supabase link --project-ref bjffyadrmkdnmgwpsbnw
   ```

2. Apply the migration:
   ```bash
   supabase db push
   ```

### Option 2: Using Supabase Dashboard (Manual)

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/bjffyadrmkdnmgwpsbnw
2. Navigate to **SQL Editor**
3. Create a new query
4. Copy the entire contents of `supabase/migrations/20251022193800_fix_orders_rls_policies.sql`
5. Paste it into the SQL Editor
6. Click **Run** to execute the migration

### Option 3: Using the Supabase Studio Migration Runner

1. Open Supabase Studio
2. Go to **Database** → **Migrations**
3. Click **New migration**
4. Name it: `fix_orders_rls_policies`
5. Paste the migration SQL
6. Click **Run migration**

## What the Migration Does

### 1. Creates Helper Function
```sql
CREATE OR REPLACE FUNCTION public.current_user_email()
```
- Uses `SECURITY DEFINER` to safely access `auth.users` table
- Returns the current authenticated user's email
- Can be called from RLS policies without permission errors

### 2. Fixes Orders Table Policies
- **Admins can manage all orders** - Full CRUD access for admin users
- **Users can view their own orders** - By `user_id`
- **Authenticated users can view orders by email** - Using the safe helper function
- **Anyone can create orders** - Allows guest checkout

### 3. Fixes Order Items Table Policies
- Similar pattern to orders table
- Allows users to view items from their orders
- Allows order creation for both authenticated and anonymous users

### 4. Fixes Order Status History Policies
- Admins can view all history
- Users can view history of their own orders

### 5. Updates Trigger Function
- Safer role checking with proper NULL handling
- Exception handling for role check failures
- Works correctly for both authenticated and anonymous users

## Verification Steps

After applying the migration, test the order creation:

1. Open your application
2. Add items to cart
3. Proceed to checkout
4. Fill in customer information
5. Try to place an order

The order should now be created successfully without the "permission denied for table users" error.

## Checking Migration Status

To verify the migration was applied:

```sql
-- Check if the helper function exists
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name = 'current_user_email';

-- Check the updated policies on orders table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'orders'
ORDER BY policyname;
```

## Rollback (If Needed)

If you need to rollback these changes, the old policies can be restored from the previous migration file at:
`supabase/migrations/20251008080417_8ab9bd56-bb49-45d3-bd0e-70e7203ad4dc.sql`

## Support

If you encounter any issues:
1. Check the Supabase logs in the Dashboard
2. Verify that the migration was applied successfully
3. Test with both authenticated and anonymous users
4. Check for any conflicting policies or functions

## Next Steps

Once the migration is applied successfully:
- Test order creation with guest checkout
- Test order creation with logged-in users
- Verify that users can view their own orders
- Verify that admins can manage all orders
