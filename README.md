# Pizzelle

Tienda web de pizzas hecha con React y Vite. Incluye catálogo, carrito, registro e inicio de sesión, pedidos persistentes, historial del cliente y administración básica de estados. La base de datos y la autenticación usan Supabase.

## Requisitos

- Node.js 20.19+ o 22.12+.
- Un proyecto de Supabase.
- Vercel (opcional para publicar).

## Ejecutar en local

1. Instala dependencias: `npm install`.
2. Crea un proyecto en [Supabase](https://supabase.com/dashboard).
3. En Supabase, abre **SQL Editor**, pega y ejecuta `supabase/schema.sql`.
4. En **Project Settings → API**, copia la Project URL y la publishable/anon key. Nunca uses la `service_role` key en el navegador.
5. Copia `.env.example` como `.env.local` y completa:

   ```env
   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
   ```

6. En **Authentication → URL Configuration**, configura el sitio local `http://localhost:5173` como Site URL y agrégalo a Redirect URLs.
7. Ejecuta `npm run dev`.

Los clientes deberán confirmar su correo si la confirmación de email está habilitada en Supabase. Hasta configurar Supabase, el menú se puede revisar, pero el registro, el inicio de sesión y la creación de pedidos permanecerán desactivados.

### Si olvidaste la contraseña de PostgreSQL

Entra al Dashboard de Supabase y ve a **Database → Settings** para restablecer la contraseña de la base de datos. La web usa la URL del proyecto y la clave publishable; no usa la contraseña de PostgreSQL. Solo tendrás que cambiar la contraseña en herramientas o scripts que se conecten directamente por `psql`/connection string. No pongas esa contraseña ni una clave `secret` en variables `VITE_` del navegador.

## Hacer una cuenta administradora

Registra primero tu cuenta desde la aplicación y confirma el correo. Después ejecuta este SQL, reemplazando el correo:

```sql
update public.profiles
set role = 'admin'
where id = (select id from auth.users where email = 'tu-correo@ejemplo.com');
```

El rol no se puede cambiar desde la aplicación. La administración inicial permite ver los pedidos y actualizar su estado. No incluye cobro en línea ni gestión de productos desde el panel.

## Datos y pagos

Usuarios, menú, carrito de clientes autenticados, pedidos y sus detalles se guardan y consultan mediante la API de Supabase sobre PostgreSQL. El carrito de visitantes sin iniciar sesión es temporal en memoria; el carrito de una cuenta se sincroniza con la base de datos. La sesión de autenticación dura durante la pestaña. El total se recalcula en la base de datos según los precios vigentes del menú; el navegador no puede fijar el precio final. Las políticas RLS restringen los datos de cada cliente y reservan el panel para administradores.

Los métodos disponibles son efectivo contra entrega y Nequi como transferencia por confirmar. La aplicación no procesa transacciones ni solicita datos de tarjeta. Antes de recibir pedidos reales, configura y muestra los datos comerciales y de contacto del negocio.

El menú y los precios se leen desde `public.products` en Supabase. Las imágenes actuales están en la carpeta de assets y se enlazan por el ID de cada pizza; para añadir nuevos productos con imágenes hay que agregar también el recurso correspondiente en el frontend.

## Publicar en Vercel

1. Importa el repositorio en Vercel. El framework Vite y los comandos `npm run build` / `dist` se detectan automáticamente.
2. En **Project Settings → Environment Variables**, agrega `VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY` para Production y Preview según corresponda.
3. Despliega el proyecto. `vercel.json` configura las rutas de React Router para que `/orders` y `/admin` funcionen al recargar.
4. En Supabase, añade el dominio final de Vercel a **Authentication → URL Configuration** (Site URL y Redirect URLs).

Al hacer push a la rama conectada, Vercel despliega automáticamente. Los cambios a variables de entorno requieren un nuevo despliegue. Los cambios a datos de Supabase se reflejan directamente; cambios de código o esquema que dependan de nuevas funciones necesitan despliegue o migración según corresponda.

## Comandos

- `npm run dev`: servidor local.
- `npm run build`: compilación de producción.
- `npm run preview`: vista previa local de `dist`.
- `npm run lint`: revisión estática de ESLint.
