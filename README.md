# 🍕 Pizzelle

> Aplicación web de pedidos de pizza artesanal desarrollada con React, enfocada en ofrecer una experiencia de compra moderna, intuitiva y responsive.

![Pizzelle](https://img.shields.io/badge/Pizzelle-Pizza%20Artesanal-orange)
![React](https://img.shields.io/badge/React-Frontend-61DAFB?logo=react)
![Vite](https://img.shields.io/badge/Vite-Frontend-646CFF?logo=vite)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6%2B-F7DF1E?logo=javascript)
![CSS3](https://img.shields.io/badge/CSS3-Styling-1572B6?logo=css3)
![Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?logo=vercel)

---

## 🌐 Demo

Puedes probar Pizzelle directamente desde el navegador:

### 🍕 [Visitar Pizzelle] (https://vercel.com/carrenoclaudia981-2332/pizzelle/B7d7Ju3YqbzqSKTCYwUbLpHks2mF)

💻 **Repositorio:**
https://github.com/Claucarreno/Pizzelle

---

## 📸 Capturas del proyecto

> Las capturas de pantalla se agregarán próximamente para mostrar las principales vistas de la aplicación.

<!--

Ejemplo de cómo agregar las capturas:

![Página principal de Pizzelle](./screenshots/home.png)

![Catálogo de pizzas](./screenshots/catalogo.png)

![Carrito de compras](./screenshots/carrito.png)

![Proceso de checkout](./screenshots/checkout.png)

![Inicio de sesión](./screenshots/login.png)

-->

---

## 📝 Descripción

**Pizzelle** es una aplicación web de pedidos de pizza artesanal desarrollada como proyecto de aprendizaje y portafolio.

El proyecto simula la experiencia de compra de una tienda de pizzas, permitiendo al usuario explorar los productos disponibles, agregarlos al carrito, modificar cantidades y avanzar por el proceso de compra.

La aplicación fue desarrollada utilizando **React y Vite**, implementando componentes reutilizables, navegación entre páginas y almacenamiento local de información.

Pizzelle también cuenta con un flujo de autenticación y un proceso de checkout/pago simulado, con el objetivo de representar una experiencia de comercio electrónico desde el frontend.

---

## ✨ Características

* 🍕 Catálogo de pizzas y productos.
* 🔎 Exploración de productos.
* 🛒 Carrito de compras.
* ➕ Aumentar cantidades.
* ➖ Disminuir cantidades.
* 🗑️ Eliminar productos del carrito.
* 💰 Cálculo del total de compra.
* 👤 Registro de usuarios.
* 🔐 Inicio de sesión.
* 🔑 Validación de formularios.
* 💳 Proceso de checkout.
* 💵 Flujo de pago simulado.
* 📦 Historial de pedidos.
* 💾 Persistencia mediante LocalStorage.
* 🧭 Navegación mediante React Router.
* 📱 Diseño responsive.
* 🎨 Interfaz moderna orientada a la experiencia del usuario.
* 🚀 Aplicación desplegada en Vercel.

---

## 🛠️ Tecnologías utilizadas

### Frontend

| Tecnología       | Uso                                       |
| ---------------- | ----------------------------------------- |
| **React**        | Construcción de la interfaz y componentes |
| **JavaScript**   | Lógica y funcionalidad                    |
| **HTML5**        | Estructura de la aplicación               |
| **CSS3**         | Estilos y diseño responsive               |
| **React Router** | Navegación entre páginas                  |
| **Vite**         | Desarrollo y construcción del proyecto    |

### Herramientas

| Herramienta            | Uso                         |
| ---------------------- | --------------------------- |
| **Git**                | Control de versiones        |
| **GitHub**             | Repositorio del proyecto    |
| **Vercel**             | Despliegue de la aplicación |
| **Visual Studio Code** | Entorno de desarrollo       |

### Almacenamiento

* **LocalStorage** para conservar información en el navegador.

---

## 📂 Estructura del proyecto

```text
Pizzelle/
│
├── public/
│
├── src/
│   │
│   ├── assets/
│   │
│   ├── components/
│   │   ├── Header/
│   │   ├── ProductCard/
│   │   ├── CartModal/
│   │   └── ...
│   │
│   ├── pages/
│   │   ├── Home/
│   │   ├── Login/
│   │   ├── Register/
│   │   ├── Checkout/
│   │   └── ...
│   │
│   ├── App.jsx
│   ├── main.jsx
│   └── ...
│
├── package.json
├── vite.config.js
└── README.md
```

> La estructura puede evolucionar a medida que se incorporen nuevas funcionalidades al proyecto.

---

## ⚙️ Instalación

Si quieres ejecutar Pizzelle localmente, necesitas tener instalado:

* [Node.js](https://nodejs.org/)
* Git
* Visual Studio Code u otro editor de código

### 1. Clonar el repositorio

```bash
git clone https://github.com/Claucarreno/Pizzelle.git
```

### 2. Entrar al proyecto

```bash
cd Pizzelle
```

### 3. Instalar las dependencias

```bash
npm install
```

### 4. Ejecutar el servidor de desarrollo

```bash
npm run dev
```

### 5. Abrir la aplicación

Después de ejecutar el comando anterior, Vite mostrará en la terminal la dirección local.

Normalmente será:

```text
http://localhost:5173
```

---

## 📜 Scripts disponibles

| Comando           | Descripción                         |
| ----------------- | ----------------------------------- |
| `npm install`     | Instala las dependencias            |
| `npm run dev`     | Inicia el servidor de desarrollo    |
| `npm run build`   | Genera la versión de producción     |
| `npm run preview` | Previsualiza el build de producción |

---

## 🎯 Objetivos del proyecto

El desarrollo de Pizzelle permitió practicar diferentes conceptos fundamentales del desarrollo frontend:

* Crear interfaces utilizando React.
* Construir componentes reutilizables.
* Manejar estados y eventos.
* Trabajar con formularios.
* Implementar validaciones.
* Gestionar rutas con React Router.
* Utilizar LocalStorage.
* Crear un carrito de compras.
* Simular un flujo de comercio electrónico.
* Aplicar diseño responsive.
* Organizar un proyecto frontend.
* Utilizar Git y GitHub.
* Realizar un despliegue utilizando Vercel.

---

## 📚 Aprendizajes

Durante el desarrollo de Pizzelle se fortalecieron conocimientos en:

**React**

* Componentes.
* Props.
* Estado.
* Hooks.
* Manejo de eventos.
* Renderizado dinámico.

**JavaScript**

* Funciones.
* Arrays.
* Objetos.
* Métodos como `map`, `filter` y `find`.
* Manejo de datos.
* Manipulación del estado.

**Frontend**

* HTML semántico.
* CSS.
* Diseño responsive.
* Organización de componentes.
* Experiencia de usuario.

**Herramientas**

* Git.
* GitHub.
* Vite.
* Vercel.
* Visual Studio Code.

---

## 🚀 Despliegue

Pizzelle está desplegado utilizando **Vercel**, permitiendo acceder a la aplicación directamente desde internet.

### 🌐 Aplicación

**Pizzelle | Pizza artesanal**

https://pizzelle-cqfiumzvo-carrenoclaudia981-2332.vercel.app/

### 💻 Código fuente

https://github.com/Claucarreno/Pizzelle

---

## 🔮 Próximas mejoras

Algunas funcionalidades que podrían incorporarse en futuras versiones:

* 🔐 Sistema de autenticación conectado a un backend.
* 🗄️ Base de datos para usuarios y pedidos.
* 💳 Integración con una plataforma de pagos real.
* 📦 Gestión de pedidos.
* 🧑‍💼 Panel administrativo.
* 🔍 Búsqueda y filtrado avanzado.
* ⭐ Sistema de reseñas y calificaciones.
* ❤️ Sistema de favoritos.
* 🔔 Notificaciones.
* ☁️ Integración con una API/backend.
* 📱 Mejoras adicionales de responsive design.

---

## 👩‍💻 Autora

### Claudia Marcela Puentes Carreño

**Desarrolladora de Software Junior en formación**

Estudiante de Desarrollo de Software, enfocada en fortalecer mis conocimientos en desarrollo frontend y en la construcción de aplicaciones web modernas.

Actualmente trabajando principalmente con:

* HTML
* CSS
* JavaScript
* React
* Git
* GitHub

### 🔗 Perfiles

💻 **GitHub:**
https://github.com/Claucarreno

🌐 **Portafolio:**
Próximamente

💼 **LinkedIn:**
Próximamente

---

## ⭐ ¿Te gustó el proyecto?

Si encuentras interesante este proyecto, puedes visitar el repositorio y dejar una ⭐ en GitHub.

---

<p align="center">
  🍕 Pizzelle — Pizza artesanal
  <br>
  Desarrollado con ❤️ por Claudia Marcela Puentes Carreño
</p>
