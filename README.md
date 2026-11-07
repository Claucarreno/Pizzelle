# Pizzelle

**Visita la tienda:** [https://pizzelle.vercel.app/](https://pizzelle.vercel.app/)

Pizzelle es una tienda web de pizzas artesanales. Los clientes pueden explorar el menú, crear una cuenta, guardar productos en el carrito, hacer pedidos y consultar su historial. La administración permite revisar pedidos y actualizar su estado.

La página está construida con React y Vite, y usa una API de Vercel conectada a PostgreSQL en Neon para guardar cuentas, carritos y pedidos. Los pagos disponibles son efectivo al recibir o Nequi para confirmar con el negocio; no se procesan pagos con tarjeta.

## Base de datos

1. Crea una base PostgreSQL en [Neon](https://neon.tech/). Esta será la base en línea compartida por todos los visitantes, no una base instalada en tu computador.
2. Abre el SQL Editor de Neon y ejecuta todo el archivo `database/schema.sql`. Esto crea las tablas, funciones y pizzas iniciales.
3. En Neon, copia la cadena de conexión **pooled**. En Vercel, abre el proyecto y ve a **Settings → Environment Variables**. Agrégala con el nombre `DATABASE_URL`.
4. Genera un secreto para las sesiones ejecutando `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` en tu computador. Agrégalo en Vercel como `JWT_SECRET`.
5. Selecciona Production y Preview para ambas variables y guarda. No pongas estos valores en el código, en GitHub ni en variables `VITE_`.
6. Después de subir los cambios a GitHub, espera el nuevo despliegue de Vercel. Si agregas o cambias las variables después, inicia otro despliegue para que surtan efecto.

Las funciones de `/api` usan estas variables para acceder a PostgreSQL. Las contraseñas de usuarios se guardan con hash; las sesiones se envían en una cookie `HttpOnly`. El navegador nunca recibe la contraseña de la base.

## Ejecutar la API localmente

Vercel sirve las rutas de `/api`, por eso para probar el proyecto completo localmente usa `vercel dev` (con el CLI de Vercel instalado) y define `DATABASE_URL` y `JWT_SECRET` en `.env.local`. `npm run dev` por sí solo inicia Vite y no ejecuta la API.

## Administrador

Registra primero una cuenta desde la aplicación. Después ejecuta en Neon, con tu correo:

```sql
UPDATE app_users SET role = 'admin' WHERE email = 'tu-correo@ejemplo.com';
```

La administración permite consultar pedidos y cambiar su estado. Los pagos de tarjeta no están conectados; el pedido permite efectivo al recibir o Nequi por confirmar.

## Comprobar que quedó en línea

Abre `https://TU-DOMINIO/api/health`. Debe responder `{"configured":true}`. Luego crea una cuenta desde la página y, si será la cuenta administradora, ejecuta en Neon el `UPDATE` de la sección anterior. Los visitantes podrán registrarse, pedir, guardar su carrito y consultar el historial; la cuenta administradora podrá revisar pedidos y actualizar sus estados.

## Publicar en Vercel

1. Sube el proyecto a GitHub e impórtalo en Vercel.
2. Configura `DATABASE_URL` y `JWT_SECRET` en las variables de entorno privadas del proyecto.
3. Deja el comando de build `npm run build` y el directorio de salida `dist`.
4. Despliega. `vercel.json` conserva las rutas de React Router; las funciones bajo `/api` procesan el acceso a PostgreSQL.

## Comandos

- `npm install`: instalar dependencias.
- `npm run dev`: desarrollo solo del frontend con Vite.
- `npm run build`: compilar el frontend.
- `npm run preview`: previsualizar `dist`.
- `npm run lint`: revisar el código con ESLint.
