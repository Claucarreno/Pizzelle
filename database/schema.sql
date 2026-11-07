-- Pizzelle PostgreSQL schema for Neon/Vercel.
-- Run once in the Neon SQL Editor before deploying the API.

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1001;

CREATE TABLE IF NOT EXISTS app_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name varchar(100) NOT NULL,
  email varchar(254) NOT NULL UNIQUE,
  password_hash text NOT NULL,
  role varchar(16) NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS products (
  id bigint PRIMARY KEY,
  name varchar(120) NOT NULL,
  description varchar(500) NOT NULL DEFAULT '',
  price_cop integer NOT NULL CHECK (price_cop BETWEEN 1 AND 2000000),
  image_key varchar(40) NOT NULL,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cart_items (
  user_id uuid NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  product_id bigint NOT NULL REFERENCES products(id),
  quantity integer NOT NULL CHECK (quantity BETWEEN 1 AND 20),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, product_id)
);

CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text NOT NULL UNIQUE DEFAULT (
    'PZ-' || to_char(now() AT TIME ZONE 'America/Bogota', 'YYMMDD') || '-' || lpad(nextval('order_number_seq')::text, 4, '0')
  ),
  user_id uuid NOT NULL REFERENCES app_users(id) ON DELETE RESTRICT,
  customer_name varchar(100) NOT NULL,
  phone varchar(30) NOT NULL,
  delivery_address varchar(250) NOT NULL,
  delivery_notes varchar(300) NOT NULL DEFAULT '',
  payment_method varchar(16) NOT NULL CHECK (payment_method IN ('cash', 'nequi')),
  status varchar(24) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled')),
  total_cop integer NOT NULL CHECK (total_cop BETWEEN 1 AND 2000000),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS order_items (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id bigint NOT NULL REFERENCES products(id),
  product_name varchar(120) NOT NULL,
  unit_price_cop integer NOT NULL CHECK (unit_price_cop > 0),
  quantity integer NOT NULL CHECK (quantity BETWEEN 1 AND 20),
  line_total_cop integer NOT NULL CHECK (line_total_cop = unit_price_cop * quantity)
);

CREATE INDEX IF NOT EXISTS orders_user_created_idx ON orders(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS order_items_order_idx ON order_items(order_id);

INSERT INTO products (id, name, description, price_cop, image_key, active) VALUES
  (1, 'Pizza Margherita', 'Salsa de tomate, mozzarella y albahaca fresca.', 25900, 'margarita', true),
  (2, 'Pizza Pepperoni', 'Salsa de tomate, mozzarella y pepperoni.', 32900, 'pepperoni', true),
  (3, 'Pizza Hawaiana', 'Mozzarella, piña y jamón.', 38900, 'hawaiana', true),
  (4, 'Pizza Tres Quesos', 'Mozzarella, parmesano y gorgonzola.', 41900, 'tresquesos', true),
  (5, 'Pizza Vegetariana', 'Champiñones, cebolla y pimientos.', 36900, 'vegetariana', true),
  (6, 'Pizza Chicken', 'Salsa BBQ, pollo y cebolla roja.', 44900, 'chicken', true)
ON CONFLICT (id) DO NOTHING;

CREATE OR REPLACE FUNCTION save_cart(p_user_id uuid, p_items jsonb)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  requested_count integer;
  saved_count integer;
BEGIN
  IF p_user_id IS NULL OR p_items IS NULL OR jsonb_typeof(p_items) <> 'array' OR jsonb_array_length(p_items) > 20 THEN
    RAISE EXCEPTION 'El carrito no es válido.';
  END IF;
  IF EXISTS (
    SELECT 1 FROM jsonb_to_recordset(p_items) AS x(product_id bigint, quantity integer)
    WHERE product_id IS NULL OR quantity IS NULL OR quantity < 1 OR quantity > 20
  ) THEN RAISE EXCEPTION 'La cantidad de productos no es válida.'; END IF;

  SELECT count(*) INTO requested_count
  FROM (SELECT product_id FROM jsonb_to_recordset(p_items) AS x(product_id bigint, quantity integer) GROUP BY product_id) AS requested;

  DELETE FROM cart_items WHERE user_id = p_user_id;
  INSERT INTO cart_items(user_id, product_id, quantity)
  SELECT p_user_id, p.id, sum(x.quantity)::integer
  FROM jsonb_to_recordset(p_items) AS x(product_id bigint, quantity integer)
  JOIN products p ON p.id = x.product_id AND p.active = true
  GROUP BY p.id
  HAVING sum(x.quantity) <= 20;
  GET DIAGNOSTICS saved_count = ROW_COUNT;
  IF saved_count <> requested_count THEN RAISE EXCEPTION 'Un producto ya no está disponible o supera el límite.'; END IF;
END;
$$;

CREATE OR REPLACE FUNCTION create_order(
  p_user_id uuid,
  p_items jsonb,
  p_customer_name text,
  p_phone text,
  p_address text,
  p_notes text,
  p_payment_method text
)
RETURNS TABLE(order_number text, total_cop integer)
LANGUAGE plpgsql
AS $$
DECLARE
  line record;
  unit_price integer;
  order_total integer := 0;
  v_order_id uuid;
  distinct_count integer;
BEGIN
  IF p_user_id IS NULL THEN RAISE EXCEPTION 'Inicia sesión para hacer un pedido.'; END IF;
  IF p_customer_name IS NULL OR length(trim(p_customer_name)) < 2 OR length(p_customer_name) > 100 THEN RAISE EXCEPTION 'Nombre inválido.'; END IF;
  IF p_phone IS NULL OR length(trim(p_phone)) < 7 OR length(p_phone) > 30 THEN RAISE EXCEPTION 'Teléfono inválido.'; END IF;
  IF p_address IS NULL OR length(trim(p_address)) < 8 OR length(p_address) > 250 THEN RAISE EXCEPTION 'Dirección inválida.'; END IF;
  IF coalesce(length(p_notes), 0) > 300 THEN RAISE EXCEPTION 'Las indicaciones son demasiado largas.'; END IF;
  IF p_payment_method NOT IN ('cash', 'nequi') THEN RAISE EXCEPTION 'Método de pago inválido.'; END IF;
  IF p_items IS NULL OR jsonb_typeof(p_items) <> 'array' OR jsonb_array_length(p_items) < 1 OR jsonb_array_length(p_items) > 20 THEN RAISE EXCEPTION 'El carrito no es válido.'; END IF;
  IF EXISTS (
    SELECT 1 FROM jsonb_to_recordset(p_items) AS x(product_id bigint, quantity integer)
    WHERE product_id IS NULL OR quantity IS NULL OR quantity < 1 OR quantity > 20
  ) THEN RAISE EXCEPTION 'La cantidad de productos no es válida.'; END IF;

  SELECT count(*) INTO distinct_count
  FROM (SELECT product_id FROM jsonb_to_recordset(p_items) AS x(product_id bigint, quantity integer) GROUP BY product_id) AS requested;
  IF distinct_count = 0 THEN RAISE EXCEPTION 'El carrito está vacío.'; END IF;

  FOR line IN
    SELECT x.product_id, sum(x.quantity)::integer AS quantity
    FROM jsonb_to_recordset(p_items) AS x(product_id bigint, quantity integer)
    GROUP BY x.product_id
  LOOP
    SELECT price_cop INTO unit_price FROM products WHERE id = line.product_id AND active = true;
    IF unit_price IS NULL THEN RAISE EXCEPTION 'Uno de los productos ya no está disponible.'; END IF;
    IF line.quantity > 20 THEN RAISE EXCEPTION 'Máximo 20 unidades por producto.'; END IF;
    order_total := order_total + unit_price * line.quantity;
  END LOOP;
  IF order_total > 2000000 THEN RAISE EXCEPTION 'El total supera el límite permitido.'; END IF;

  INSERT INTO orders(user_id, customer_name, phone, delivery_address, delivery_notes, payment_method, total_cop)
  VALUES (p_user_id, trim(p_customer_name), trim(p_phone), trim(p_address), coalesce(trim(p_notes), ''), p_payment_method, order_total)
  RETURNING id INTO v_order_id;

  INSERT INTO order_items(order_id, product_id, product_name, unit_price_cop, quantity, line_total_cop)
  SELECT v_order_id, p.id, p.name, p.price_cop, sum(x.quantity)::integer, p.price_cop * sum(x.quantity)::integer
  FROM jsonb_to_recordset(p_items) AS x(product_id bigint, quantity integer)
  JOIN products p ON p.id = x.product_id AND p.active = true
  GROUP BY p.id, p.name, p.price_cop;

  DELETE FROM cart_items WHERE user_id = p_user_id;
  RETURN QUERY SELECT o.order_number, o.total_cop FROM orders o WHERE o.id = v_order_id;
END;
$$;

-- Después de crear tu cuenta, cambia el correo por el tuyo y ejecuta:
-- UPDATE app_users SET role = 'admin' WHERE email = 'tu-correo@ejemplo.com';
