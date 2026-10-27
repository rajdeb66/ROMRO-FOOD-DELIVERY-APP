create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  phone text not null,
  display_name text not null default '',
  role text not null default 'customer' check (role in ('customer', 'partner', 'rider', 'admin')),
  created_at timestamptz not null default now()
);

create table if not exists public.pilot_phone_allowlist (
  phone text primary key check (phone ~ '^\+[1-9][0-9]{7,14}$'),
  created_at timestamptz not null default now()
);

create table if not exists public.restaurants (
  id text primary key,
  name text not null,
  cuisine text not null,
  category text not null,
  rating numeric(2, 1) not null default 4.5 check (rating between 0 and 5),
  eta_text text not null default '25–35 min',
  price_for_two integer not null default 350 check (price_for_two >= 0),
  emoji text not null default '🍽️',
  offer_text text not null default '',
  distance text not null default 'Nearby',
  delivery_fee integer not null default 29 check (delivery_fee >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.menu_items (
  restaurant_id text not null references public.restaurants (id) on delete cascade,
  id text not null,
  name text not null,
  detail text not null default '',
  price integer not null check (price > 0),
  emoji text not null default '🍽️',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  primary key (restaurant_id, id)
);

create table if not exists public.promo_codes (
  code text primary key,
  discount_type text not null check (discount_type in ('percent', 'fixed')),
  discount_value integer not null check (discount_value > 0),
  minimum_subtotal integer not null default 0 check (minimum_subtotal >= 0),
  maximum_discount integer check (maximum_discount > 0),
  is_active boolean not null default true,
  expires_at timestamptz
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique default ('RM-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8))),
  customer_id uuid not null references auth.users (id),
  restaurant_id text not null references public.restaurants (id),
  customer_name text not null check (char_length(customer_name) between 2 and 100),
  address text not null check (char_length(address) between 8 and 300),
  subtotal integer not null check (subtotal > 0),
  delivery_fee integer not null check (delivery_fee >= 0),
  platform_fee integer not null default 5 check (platform_fee >= 0),
  discount integer not null default 0 check (discount >= 0),
  total integer not null check (total >= 0),
  promo_code text references public.promo_codes (code),
  status text not null default 'pending' check (status in ('pending', 'accepted', 'preparing', 'ready_for_pickup', 'picked_up', 'out_for_delivery', 'delivered', 'cancelled')),
  payment_method text not null default 'cash_on_delivery' check (payment_method = 'cash_on_delivery'),
  payment_status text not null default 'cash_due' check (payment_status in ('cash_due', 'paid', 'refunded')),
  created_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  menu_item_id text not null,
  name text not null,
  price integer not null check (price > 0),
  quantity integer not null check (quantity between 1 and 10)
);

create index if not exists orders_customer_created_idx on public.orders (customer_id, created_at desc);
create index if not exists order_items_order_idx on public.order_items (order_id);

alter table public.profiles enable row level security;
alter table public.pilot_phone_allowlist enable row level security;
alter table public.restaurants enable row level security;
alter table public.menu_items enable row level security;
alter table public.promo_codes enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

drop policy if exists "Customers can read their profile" on public.profiles;
create policy "Customers can read their profile"
  on public.profiles for select to authenticated
  using (id = (select auth.uid()));

drop policy if exists "Anyone can browse active restaurants" on public.restaurants;
create policy "Anyone can browse active restaurants"
  on public.restaurants for select to anon, authenticated
  using (is_active);

drop policy if exists "Anyone can browse active menu items" on public.menu_items;
create policy "Anyone can browse active menu items"
  on public.menu_items for select to anon, authenticated
  using (
    is_active and exists (
      select 1 from public.restaurants r
      where r.id = menu_items.restaurant_id and r.is_active
    )
  );

drop policy if exists "Customers can read their orders" on public.orders;
create policy "Customers can read their orders"
  on public.orders for select to authenticated
  using (customer_id = (select auth.uid()));

drop policy if exists "Customers can read their order items" on public.order_items;
create policy "Customers can read their order items"
  on public.order_items for select to authenticated
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id and o.customer_id = (select auth.uid())
    )
  );

create or replace function public.create_profile_for_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.phone is null or not exists (
    select 1 from public.pilot_phone_allowlist where phone = new.phone
  ) then
    raise exception 'ROMEO is invite-only during the pilot.';
  end if;

  insert into public.profiles (id, phone)
  values (new.id, coalesce(new.phone, ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_romio on auth.users;
create trigger on_auth_user_created_romio
  after insert on auth.users
  for each row execute procedure public.create_profile_for_new_user();

create or replace function public.place_order(
  p_restaurant_id text,
  p_items jsonb,
  p_customer_name text,
  p_delivery_address text,
  p_promo_code text default null
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_customer_id uuid := auth.uid();
  v_restaurant public.restaurants%rowtype;
  v_menu_item public.menu_items%rowtype;
  v_item jsonb;
  v_quantity integer;
  v_subtotal integer := 0;
  v_delivery_fee integer;
  v_platform_fee integer := 5;
  v_discount integer := 0;
  v_promo_code text;
  v_promo public.promo_codes%rowtype;
  v_order_id uuid;
begin
  if v_customer_id is null then
    raise exception 'Sign in is required to place an order.';
  end if;
  if p_items is null or jsonb_typeof(p_items) <> 'array'
     or jsonb_array_length(p_items) = 0 or jsonb_array_length(p_items) > 30 then
    raise exception 'Add between 1 and 30 menu items to your order.';
  end if;
  if p_customer_name is null or char_length(trim(p_customer_name)) not between 2 and 100 then
    raise exception 'Enter a valid customer name.';
  end if;
  if p_delivery_address is null or char_length(trim(p_delivery_address)) not between 8 and 300 then
    raise exception 'Enter a valid delivery address.';
  end if;

  select * into v_restaurant
  from public.restaurants
  where id = p_restaurant_id and is_active;
  if not found then
    raise exception 'This restaurant is not currently accepting orders.';
  end if;

  for v_item in select value from jsonb_array_elements(p_items)
  loop
    if v_item ->> 'id' is null
       or jsonb_typeof(v_item -> 'quantity') is distinct from 'number'
       or coalesce((v_item ->> 'quantity') !~ '^[0-9]+$', true) then
      raise exception 'Order item quantity is invalid.';
    end if;
    v_quantity := (v_item ->> 'quantity')::integer;
    if v_quantity < 1 or v_quantity > 10 then
      raise exception 'Each menu item quantity must be between 1 and 10.';
    end if;

    select * into v_menu_item
    from public.menu_items
    where restaurant_id = p_restaurant_id
      and id = v_item ->> 'id'
      and is_active;
    if not found then
      raise exception 'A menu item is no longer available.';
    end if;
    v_subtotal := v_subtotal + v_menu_item.price * v_quantity;
  end loop;

  v_delivery_fee := case when v_subtotal >= 399 then 0 else v_restaurant.delivery_fee end;
  if nullif(trim(p_promo_code), '') is not null then
    v_promo_code := upper(trim(p_promo_code));
    select * into v_promo
    from public.promo_codes
    where code = v_promo_code
      and is_active
      and (expires_at is null or expires_at > now());
    if not found then
      raise exception 'This promo code is invalid or expired.';
    end if;
    if v_subtotal < v_promo.minimum_subtotal then
      raise exception 'Your order does not meet the minimum spend for this promo.';
    end if;
    v_discount := case
      when v_promo.discount_type = 'percent'
        then round(v_subtotal * v_promo.discount_value / 100.0)::integer
      else v_promo.discount_value
    end;
    if v_promo.maximum_discount is not null then
      v_discount := least(v_discount, v_promo.maximum_discount);
    end if;
    v_discount := least(v_discount, v_subtotal);
  end if;

  insert into public.orders (
    customer_id, restaurant_id, customer_name, address, subtotal, delivery_fee,
    platform_fee, discount, total, promo_code, payment_method, payment_status
  ) values (
    v_customer_id, p_restaurant_id, trim(p_customer_name), trim(p_delivery_address),
    v_subtotal, v_delivery_fee, v_platform_fee, v_discount,
    v_subtotal + v_delivery_fee + v_platform_fee - v_discount,
    v_promo_code, 'cash_on_delivery', 'cash_due'
  ) returning id into v_order_id;

  for v_item in select value from jsonb_array_elements(p_items)
  loop
    v_quantity := (v_item ->> 'quantity')::integer;
    select * into v_menu_item
    from public.menu_items
    where restaurant_id = p_restaurant_id
      and id = v_item ->> 'id'
      and is_active;
    insert into public.order_items (order_id, menu_item_id, name, price, quantity)
    values (v_order_id, v_menu_item.id, v_menu_item.name, v_menu_item.price, v_quantity);
  end loop;

  return v_order_id;
end;
$$;

revoke all on function public.place_order(text, jsonb, text, text, text) from public, anon;
grant execute on function public.place_order(text, jsonb, text, text, text) to authenticated;

grant select on public.restaurants, public.menu_items to anon, authenticated;
grant select on public.profiles, public.orders, public.order_items to authenticated;
revoke all on public.promo_codes from anon, authenticated;
revoke all on public.pilot_phone_allowlist from public, anon, authenticated;
revoke insert, update, delete on public.profiles, public.restaurants, public.menu_items, public.orders, public.order_items from anon, authenticated;

insert into public.promo_codes (code, discount_type, discount_value, minimum_subtotal, maximum_discount)
values
  ('ROMEO10', 'percent', 10, 0, 150),
  ('TASTY50', 'fixed', 50, 399, null),
  ('WELCOME15', 'percent', 15, 499, 200)
on conflict (code) do nothing;
