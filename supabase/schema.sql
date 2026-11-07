-- Pizzelle MVP: authentication profiles, menu prices and persistent orders.
-- Run this whole file once in Supabase Dashboard > SQL Editor.

create extension if not exists pgcrypto;
create sequence if not exists public.order_number_seq start 1001;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  role text not null default 'customer' check (role in ('customer', 'admin')),
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id bigint primary key,
  name text not null,
  description text not null default '',
  price_cop integer not null check (price_cop > 0),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique default ('PZ-' || to_char(now() at time zone 'America/Bogota', 'YYMMDD') || '-' || lpad(nextval('public.order_number_seq')::text, 4, '0')),
  user_id uuid not null references auth.users(id) on delete restrict,
  customer_name text not null,
  phone text not null,
  delivery_address text not null,
  delivery_notes text not null default '',
  payment_method text not null check (payment_method in ('cash', 'nequi')),
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled')),
  total_cop integer not null check (total_cop > 0),
  created_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id bigint generated always as identity primary key,
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id bigint not null references public.products(id),
  product_name text not null,
  unit_price_cop integer not null check (unit_price_cop > 0),
  quantity integer not null check (quantity between 1 and 20),
  line_total_cop integer not null check (line_total_cop = unit_price_cop * quantity)
);

create table if not exists public.cart_items (
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id bigint not null references public.products(id),
  quantity integer not null check (quantity between 1 and 20),
  updated_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

insert into public.products (id, name, description, price_cop, active) values
  (1, 'Pizza Margherita', 'Salsa de tomate, mozzarella y albahaca fresca.', 25900, true),
  (2, 'Pizza Pepperoni', 'Salsa de tomate, mozzarella y pepperoni.', 32900, true),
  (3, 'Pizza Hawaiana', 'Mozzarella, piña y jamón.', 38900, true),
  (4, 'Pizza Tres Quesos', 'Mozzarella, parmesano y gorgonzola.', 41900, true),
  (5, 'Pizza Vegetariana', 'Champiñones, cebolla y pimientos.', 36900, true),
  (6, 'Pizza Chicken', 'Salsa BBQ, pollo y cebolla roja.', 44900, true)
on conflict (id) do update set name = excluded.name, description = excluded.description, price_cop = excluded.price_cop;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''))
  on conflict (id) do update set full_name = excluded.full_name;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  );
$$;

alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.cart_items enable row level security;

drop policy if exists "profiles_read_self_or_admin" on public.profiles;
create policy "profiles_read_self_or_admin" on public.profiles
  for select to authenticated using (id = (select auth.uid()) or (select public.is_admin()));

drop policy if exists "menu_read_active_products" on public.products;
create policy "menu_read_active_products" on public.products
  for select to anon, authenticated using (active or (select public.is_admin()));
drop policy if exists "admin_manage_products" on public.products;
create policy "admin_manage_products" on public.products
  for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

drop policy if exists "orders_read_owner_or_admin" on public.orders;
create policy "orders_read_owner_or_admin" on public.orders
  for select to authenticated using (user_id = (select auth.uid()) or (select public.is_admin()));
drop policy if exists "admin_update_orders" on public.orders;
create policy "admin_update_orders" on public.orders
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

drop policy if exists "order_items_read_owner_or_admin" on public.order_items;
create policy "order_items_read_owner_or_admin" on public.order_items
  for select to authenticated using (
    exists (select 1 from public.orders o where o.id = order_id and (o.user_id = (select auth.uid()) or (select public.is_admin())))
  );

drop policy if exists "cart_items_owner_all" on public.cart_items;
create policy "cart_items_owner_all" on public.cart_items
  for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

grant usage on schema public to anon, authenticated;
grant select on public.products to anon, authenticated;
grant select on public.profiles, public.orders, public.order_items to authenticated;
grant select, insert, delete on public.cart_items to authenticated;
grant update (status) on public.orders to authenticated;
grant insert, update, delete on public.products to authenticated;
grant usage, select on sequence public.order_number_seq to authenticated;

create or replace function public.save_cart(p_items jsonb)
returns void
language plpgsql
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_requested integer;
  v_saved integer;
begin
  if v_user_id is null then raise exception 'Debes iniciar sesión para guardar el carrito.'; end if;
  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) > 20 then raise exception 'El carrito no es válido.'; end if;
  if exists (select 1 from jsonb_to_recordset(p_items) as x(product_id bigint, quantity integer) where product_id is null or quantity is null or quantity < 1 or quantity > 20) then raise exception 'Cantidad de productos inválida.'; end if;
  select count(*) into v_requested from (select product_id from jsonb_to_recordset(p_items) as x(product_id bigint, quantity integer) group by product_id) distinct_items;
  delete from public.cart_items where user_id = v_user_id;
  insert into public.cart_items (user_id, product_id, quantity)
  select v_user_id, p.id, sum(x.quantity)::integer
  from jsonb_to_recordset(p_items) as x(product_id bigint, quantity integer)
  join public.products p on p.id = x.product_id and p.active = true
  group by p.id
  having sum(x.quantity) <= 20;
  get diagnostics v_saved = row_count;
  if v_saved <> v_requested then raise exception 'Uno de los productos ya no está disponible o supera el límite.'; end if;
end;
$$;

create or replace function public.create_order(
  p_items jsonb,
  p_customer_name text,
  p_phone text,
  p_address text,
  p_notes text,
  p_payment_method text
)
returns table(order_number text, total_cop integer)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_order_id uuid;
  v_line record;
  v_price integer;
  v_total integer := 0;
  v_item_count integer;
begin
  if v_user_id is null then raise exception 'Debes iniciar sesión para hacer un pedido.'; end if;
  if p_customer_name is null or length(trim(p_customer_name)) < 2 or length(p_customer_name) > 100 then raise exception 'Nombre inválido.'; end if;
  if p_phone is null or length(trim(p_phone)) < 7 or length(p_phone) > 30 then raise exception 'Teléfono inválido.'; end if;
  if p_address is null or length(trim(p_address)) < 8 or length(p_address) > 250 then raise exception 'Dirección inválida.'; end if;
  if coalesce(length(p_notes), 0) > 300 then raise exception 'Las indicaciones son demasiado largas.'; end if;
  if p_payment_method not in ('cash', 'nequi') then raise exception 'Método de pago inválido.'; end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) < 1 or jsonb_array_length(p_items) > 20 then raise exception 'El carrito no es válido.'; end if;
  if exists (select 1 from jsonb_to_recordset(p_items) as x(product_id bigint, quantity integer) where product_id is null or quantity is null or quantity < 1 or quantity > 20) then raise exception 'Cantidad de productos inválida.'; end if;

  select count(*) into v_item_count from (select product_id from jsonb_to_recordset(p_items) as x(product_id bigint, quantity integer) group by product_id) distinct_items;
  if v_item_count = 0 then raise exception 'El carrito está vacío.'; end if;
  for v_line in
    select x.product_id, sum(x.quantity)::integer as quantity
    from jsonb_to_recordset(p_items) as x(product_id bigint, quantity integer)
    group by x.product_id
  loop
    select price_cop into v_price from public.products where id = v_line.product_id and active = true;
    if v_price is null then raise exception 'Uno de los productos ya no está disponible.'; end if;
    if v_line.quantity > 20 then raise exception 'La cantidad máxima por producto es 20.'; end if;
    v_total := v_total + (v_price * v_line.quantity);
  end loop;
  if v_total > 2000000 then raise exception 'El pedido supera el límite permitido.'; end if;

  insert into public.orders (user_id, customer_name, phone, delivery_address, delivery_notes, payment_method, total_cop)
  values (v_user_id, trim(p_customer_name), trim(p_phone), trim(p_address), coalesce(trim(p_notes), ''), p_payment_method, v_total)
  returning id into v_order_id;

  insert into public.order_items (order_id, product_id, product_name, unit_price_cop, quantity, line_total_cop)
  select v_order_id, p.id, p.name, p.price_cop, sum(x.quantity)::integer, p.price_cop * sum(x.quantity)::integer
  from jsonb_to_recordset(p_items) as x(product_id bigint, quantity integer)
  join public.products p on p.id = x.product_id and p.active = true
  group by p.id, p.name, p.price_cop;

  delete from public.cart_items where user_id = v_user_id;

  return query select o.order_number, o.total_cop from public.orders o where o.id = v_order_id;
end;
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_admin() to anon;
revoke all on function public.save_cart(jsonb) from public;
grant execute on function public.save_cart(jsonb) to authenticated;
revoke all on function public.create_order(jsonb, text, text, text, text, text) from public;
grant execute on function public.create_order(jsonb, text, text, text, text, text) to authenticated;

-- After registering your account, run this once to make it the store administrator:
-- update public.profiles set role = 'admin' where id = (select id from auth.users where email = 'YOUR_EMAIL');
