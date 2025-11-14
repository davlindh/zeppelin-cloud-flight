-- Create notifications table for unified notification system
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  type text not null check (type in ('order', 'auction', 'booking', 'message', 'system')),
  priority text default 'info' check (priority in ('urgent', 'important', 'info')),
  title text not null,
  message text not null,
  link text,
  read boolean default false,
  created_at timestamptz default now(),
  metadata jsonb default '{}'::jsonb
);

-- Enable RLS
alter table public.notifications enable row level security;

-- Policy: Users can only see their own notifications
create policy "Users can view own notifications"
  on public.notifications for select
  using (auth.uid() = user_id);

-- Policy: Users can update their own notifications (mark as read)
create policy "Users can update own notifications"
  on public.notifications for update
  using (auth.uid() = user_id);

-- Policy: System can create notifications
create policy "System can create notifications"
  on public.notifications for insert
  with check (true);

-- Enable realtime for notifications
alter table public.notifications replica identity full;

-- Create index for faster queries
create index idx_notifications_user_id on public.notifications(user_id);
create index idx_notifications_read on public.notifications(user_id, read);
create index idx_notifications_created_at on public.notifications(created_at desc);

-- Create full-text search indexes for better search performance
create index if not exists idx_products_search on products using gin(to_tsvector('english', title || ' ' || description));
create index if not exists idx_services_search on services using gin(to_tsvector('english', title || ' ' || coalesce(description, '')));
create index if not exists idx_auctions_search on auctions using gin(to_tsvector('english', title || ' ' || coalesce(description, '')));