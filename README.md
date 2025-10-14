# Sistema de Paquetería - Frontend

Esta es la interfaz de usuario para el sistema de intermediación de entregas, desarrollada con React y Vite. Es una Single Page Application (SPA) que consume la API del backend para proveer una experiencia de usuario fluida y reactiva.

## ✨ Características

* **Flujo de Autenticación:** Página de inicio de sesión segura y gestión de sesión de usuario.
* **UI Basada en Roles:** La interfaz se adapta según el rol del usuario (Administrador, Manager, Recepcionista), mostrando u ocultando funcionalidades.
* **Dashboard Interactivo:**
    * Visualización de todas las operaciones en una tabla.
    * Sistema de filtros completo por texto, estado y rango de fechas.
    * Actualización de estado y pago en tiempo real.
* **Gestión de Datos:** Interfaces (solo para Admins) para administrar Sucursales y Vendedores.
* **Flujos de Trabajo Optimizados:**
    * Modal para creación de operaciones con búsqueda de vendedor.
    * Modal de detalles y reimpresión de tickets.
    * Validación de paquetes mediante escáner de QR.
* **Reportes y Visualización:** Página de reportes con filtros, tarjetas de resumen, gráficos de barras y tablas de datos.

## 🛠️ Stack Tecnológico

* **React** (con Hooks)
* **Vite** como entorno de desarrollo
* **Tailwind CSS** para el diseño de la interfaz
* **React Router** para la navegación
* **Axios** para las peticiones a la API
* **Recharts** para los gráficos
* **html5-qrcode** para el escaneo de QR

## 🚀 Instalación y Puesta en Marcha

### 1. Prerrequisitos

* Node.js 18+
* npm o yarn
* El [servidor del backend](#) debe estar corriendo.

### 2. Configuración

1.  **Clona el repositorio** y navega a la carpeta `frontend`:
    ```bash
    cd frontend
    ```

2.  **Instala las dependencias**:
    ```bash
    npm install
    ```

3.  **Crea el archivo de variables de entorno**. Crea un archivo llamado `.env.local` en la raíz de la carpeta `frontend` y define la URL de tu API:
    ```env
    # .env.local
    VITE_API_URL=[http://127.0.0.1:8000/api](http://127.0.0.1:8000/api)
    ```
    *No olvides ajustar `apiClient.js` para que use esta variable:*
    ```javascript
    // src/services/api.js
    const apiClient = axios.create({
      baseURL: import.meta.env.VITE_API_URL
    });
    ```

4.  **Ejecuta el servidor** de desarrollo:
    ```bash
    npm run dev
    ```
    La aplicación estará disponible en `http://localhost:5173` (o el puerto que indique Vite).