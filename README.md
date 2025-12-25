# Sistema de Gestión de Operaciones (SGO) - Servitel

Sistema integral de gestión para operaciones de Servitel, contratista de Netuno. Digitaliza y automatiza el ciclo completo de órdenes de servicio (instalaciones y averías), gestión de cuadrillas, control de inventario, y generación de reportes empresariales.

---

## 🚀 Stack Tecnológico

### Frontend
* **Framework:** Next.js 16 + React 18 + TypeScript
* **UI Library:** HeroUI (Componentes modernos basados en React Aria)
* **Estilos:** Tailwind CSS 4.1
* **Animaciones:** Framer Motion
* **Estado:** React Context API
* **Manejo de Fechas:** date-fns 4.1

### Backend
* **Runtime:** Node.js
* **Framework:** Next.js API Routes (Serverless)
* **Base de Datos:** MongoDB 8.19 + Mongoose
* **Autenticación:** JWT (JSON Web Tokens) con Jose
* **Hash de Contraseñas:** bcryptjs

### Integración y Automatización
* **Workflow Engine:** n8n
* **IA:** OpenAI GPT-4o (procesamiento de imágenes)
* **Mensajería:** WhatsApp Business API (Meta)
* **Reportes Externos:** Google Forms (Netuno)

### Exportación de Reportes
* **Excel:** xlsx, xlsx-js-style
* **PDF:** jsPDF + jspdf-autotable
* **Word:** docx
* **Guardado:** file-saver

---

## 📦 Arquitectura del Sistema

El sistema está compuesto por 5 módulos principales:

### 1. **Panel Web de Administración** ✅ IMPLEMENTADO
Aplicación Next.js completa para gestión operativa del personal administrativo.

**Características Principales:**
- ✅ Dashboard con métricas en tiempo real
- ✅ Sistema de autenticación con roles (Admin, Supervisor, Logística)
- ✅ Gestión completa de órdenes de servicio
- ✅ Administración de cuadrillas de trabajo
- ✅ Control total de inventario (bodega + cuadrillas)
- ✅ Sistema de reportes avanzado con múltiples formatos de exportación
- ✅ Modo oscuro/claro con next-themes
- ✅ Diseño responsive y moderno

### 2. **Backend API** ✅ IMPLEMENTADO
API RESTful robusta con endpoints organizados por entidad.

**Servicios Implementados:**
- ✅ `authHelpers.ts` - Autenticación y autorización JWT
- ✅ `orderService.ts` - Gestión de órdenes de servicio
- ✅ `crewService.ts` - Administración de cuadrillas
- ✅ `inventoryService.ts` - Control de inventario con transacciones
- ✅ `installerService.ts` - Gestión de técnicos instaladores
- ✅ `reportService.ts` - Generación de reportes con agregaciones MongoDB
- ✅ `orderHistoryService.ts` - Historial de cambios en órdenes
- ✅ `inventoryHistoryService.ts` - Trazabilidad de movimientos de inventario

### 3. **Aplicación Móvil (Instaladores)** 🚧 EN DESARROLLO
React Native (Expo) para técnicos de campo.

#### 📋 **TAREAS PENDIENTES - MÓDULO MÓVIL**

> **Análisis del Proyecto Actual:** El proyecto base es un playground/demo de Expo con componentes UI genéricos. Se requiere una transformación completa hacia la aplicación de Servitel para instaladores.

---

##### ✅ **COMPLETADO - Infraestructura Base**

- [x] **Expo y React Native configurado** - Expo SDK 54, React Native 0.81.5
- [x] **TypeScript configurado** - tsconfig.json presente
- [x] **Navegación básica** - expo-router v6 implementado
- [x] **EAS Build configurado** - eas.json con perfiles development, preview, production
- [x] **Tema oscuro/claro** - ThemeContext y ThemeProvider funcional
- [x] **NativeWind/Tailwind** - Estilos CSS configurados
- [x] **Estructura de carpetas base:**
  - [x] `/app` - Router y pantallas
  - [x] `/components` - Componentes reutilizables  
  - [x] `/lib` - Incluye `api_reference` con modelos del backend
  - [x] `/utils` - Utilidades básicas
  - [x] `/app/contexts` - Context API (Theme)

---

##### 🔧 **1. Configuración y Preparación del Proyecto**

- [ ] **Limpiar código de demostración**
  - [ ] Eliminar archivos en `/app/screens` (onboarding, weather, parallax, etc.) - son demos
  - [ ] Limpiar componentes demo en `/components` (VideoCard, JournalCard, CounterCard, etc.)
  - [ ] Conservar solo: Header, ThemeToggle, BottomBar (adaptables)
  
- [ ] **Configurar variables de entorno**
  - [ ] Crear archivo `.env` en raíz
  - [ ] Agregar `API_BASE_URL` - URL del backend de Servitel
  - [ ] Agregar `GOOGLE_MAPS_API_KEY` - API Key de Google Maps
  - [ ] Agregar `SPEEDTEST_API_URL` - URL de API de test de velocidad (opcional)
  - [ ] Instalar `expo-constants` para acceder a variables (ya está instalado ✅)
  
- [ ] **Instalar dependencias adicionales necesarias**
  - [ ] `expo-secure-store` - Almacenamiento seguro de JWT
  - [ ] `axios` o `@tanstack/react-query` - Cliente HTTP y caché
  - [ ] `react-native-maps` - Google Maps
  - [ ] `expo-location` - Geolocalización
  - [ ] `expo-image-picker` - Captura de fotos
  - [ ] `expo-camera` - Acceso a cámara
  - [ ] `react-native-signature-canvas` - Firma digital
  - [ ] `expo-notifications` - Push notifications
  - [ ] `expo-device` - Info del dispositivo
  - [ ] `@react-native-async-storage/async-storage` - Almacenamiento local
  
- [ ] **Actualizar configuración**
  - [ ] Actualizar `app.json` con:
    - Nombre: "Servitel Instaladores"
    - Bundle ID: `com.servitel.instaladores`
    - Permisos necesarios (ubicación, cámara, notificaciones)
    - Configurar Google Maps API Key
  - [ ] Actualizar `package.json` con nombre correcto del proyecto

---

##### 📁 **2. Estructura de Carpetas y Tipos**

- [ ] **Crear carpeta `/services` en raíz**
  - [ ] `/services/api/auth.ts` - Servicios de autenticación
  - [ ] `/services/api/orders.ts` - Servicios de órdenes
  - [ ] `/services/api/crews.ts` - Servicios de cuadrillas
  - [ ] `/services/api/inventory.ts` - Servicios de inventario
  - [ ] `/services/api/installers.ts` - Servicios de instaladores
  - [ ] `/services/api/client.ts` - Cliente HTTP base (axios/fetch)
  
- [ ] **Crear carpeta `/types` en raíz**
  - [ ] Copiar y adaptar modelos de `/lib/api_reference/models`:
    - [ ] `/types/User.ts`
    - [ ] `/types/Installer.ts`
    - [ ] `/types/Order.ts`
    - [ ] `/types/Crew.ts`
    - [ ] `/types/Inventory.ts`
    - [ ] `/types/InventoryHistory.ts`
    - [ ] `/types/OrderHistory.ts`
  - [ ] `/types/navigation.ts` - Tipos de navegación
  - [ ] `/types/api.ts` - Tipos de respuestas API
  
- [ ] **Crear carpeta `/constants`**
  - [ ] `/constants/colors.ts` - Paleta de colores Servitel
  - [ ] `/constants/config.ts` - Configuraciones globales
  - [ ] `/constants/orderStates.ts` - Estados de órdenes
  
- [ ] **Reorganizar `/app/contexts`**
  - [x] `ThemeContext.tsx` - Ya existe ✅
  - [ ] `AuthContext.tsx` - Gestión de autenticación
  - [ ] `OrderContext.tsx` - Estado global de órdenes (opcional)

---

##### 🔐 **3. Autenticación y Sesión**

- [ ] **AuthContext y AuthProvider**
  - [ ] Crear `AuthContext.tsx` con:
    - Estado: `user`, `token`, `isLoading`, `isAuthenticated`
    - Funciones: `login()`, `logout()`, `checkAuth()`
  - [ ] Almacenar JWT en SecureStore
  - [ ] Cargar token al iniciar app y validar
  
- [ ] **Servicio de autenticación (`/services/api/auth.ts`)**
  - [ ] Función `login(email, password)` → POST `/api/web/auth/login`
  - [ ] Función `validateToken(token)` → Verificar validez del token
  - [ ] Función `logout()` → Limpiar sesión
  
- [ ] **Pantalla de Login (`/app/login.tsx`)**
  - [ ] Layout con logo de Servitel
  - [ ] Formulario con email y contraseña
  - [ ] Validación de campos (email válido, contraseña mínimo 6 caracteres)
  - [ ] Botón de login con indicador de carga
  - [ ] Manejo de errores (credenciales incorrectas, sin conexión)
  - [ ] Redirección automática si ya está autenticado
  
- [ ] **Protección de rutas**
  - [ ] Modificar `_layout.tsx` para verificar autenticación
  - [ ] Redireccionar a `/login` si no hay token válido
  - [ ] Redireccionar a app principal si está autenticado

---

##### 📱 **4. Navegación Principal**

- [ ] **Diseñar estructura de navegación**
  - [ ] Stack Navigator raíz (auth vs app)
  - [ ] Tab Navigator para pantallas principales:
    - Tab 1: Órdenes (`/app/(tabs)/orders/index.tsx`)
    - Tab 2: Inventario (`/app/(tabs)/inventory/index.tsx`)
    - Tab 3: Perfil (`/app/(tabs)/profile/index.tsx`)
    - Tab 4 (opcional): Mapa (`/app/(tabs)/map/index.tsx`)
  
- [ ] **Crear componente BottomTabNavigator**
  - [ ] Adaptar `BottomBar.tsx` existente o crear nuevo
  - [ ] Iconos: lista (órdenes), paquete (inventario), usuario (perfil), mapa
  - [ ] Indicadores de badge (órdenes pendientes)
  
- [ ] **Actualizar Header**
  - [ ] Adaptar `Header.tsx` para mostrar:
    - Logo Servitel
    - Nombre del instalador
    - Foto de perfil
    - Toggle de tema
    - Indicador de sincronización

---

##### 📦 **5. Módulo de Órdenes de Servicio**

- [ ] **Servicio API de órdenes (`/services/api/orders.ts`)**
  - [ ] `getCrewOrders(crewId)` → GET `/api/web/orders?assignedTo={crewId}`
  - [ ] `getOrderById(orderId)` → GET `/api/web/orders?id={orderId}`
  - [ ] `updateOrderStatus(orderId, status)` → PUT `/api/web/orders`
  - [ ] `completeOrder(orderId, data)` → PUT `/api/web/orders` con materiales, fotos, firma
  
- [ ] **Pantalla: Lista de Órdenes (`/app/(tabs)/orders/index.tsx`)**
  - [ ] Fetch de órdenes de la cuadrilla del instalador
  - [ ] FlatList con tarjetas de orden (OrderCard component)
  - [ ] Pull-to-refresh
  - [ ] Filtros por estado (pendiente, en-camino, en-sitio, completada)
  - [ ] Búsqueda por número de abonado o dirección
  - [ ] Indicador de carga (skeleton)
  - [ ] Manejo de estado vacío
  
- [ ] **Componente: OrderCard (`/components/orders/OrderCard.tsx`)**
  - [ ] Diseño de tarjeta con:
    - Número de abonado
    - Nombre del abonado
    - Tipo (instalación/avería) con icono
    - Estado actual con badge de color
    - Dirección (truncada)
    - Prioridad
  - [ ] onPress → Navegar a detalle
  
- [ ] **Pantalla: Detalle de Orden (`/app/(tabs)/orders/[id].tsx`)**
  - [ ] Mostrar toda la información del modelo Order:
    - Datos del abonado (nombre, teléfonos, email)
    - Dirección completa
    - Nodo técnico
    - Servicios a instalar (array)
    - Tipo y estado
    - Fecha de recepción y asignación
  - [ ] Botón "Ver en Mapa" → Abrir mapa con ubicación
  - [ ] Botón "Iniciar Viaje" → Cambiar estado a `en-camino`
  - [ ] Botón "Llegué al Sitio" → Cambiar estado a `en-sitio`
  - [ ] Botón "Completar Orden" → Abrir formulario de cierre
  - [ ] Actualización optimista de estado
  
- [ ] **Pantalla: Formulario de Cierre (`/app/(tabs)/orders/complete/[id].tsx`)**
  - [ ] **Sección: Materiales Usados**
    - [ ] Lista del inventario de la cuadrilla
    - [ ] Selección de materiales/equipos
    - [ ] Input de cantidad para materiales
    - [ ] Selección de instancia específica para equipos (uniqueId)
    - [ ] Validación: no exceder stock disponible
  - [ ] **Sección: Evidencia Fotográfica**
    - [ ] Botón "Tomar Foto"
    - [ ] Galería de fotos capturadas (mínimo 2)
    - [ ] Vista previa y eliminar foto
    - [ ] Compresión de imágenes
  - [ ] **Sección: Speed Test**
    - [ ] Botón "Realizar Test de Velocidad"
    - [ ] Mostrar resultados (descarga, subida, ping)
    - [ ] Guardar resultados
  - [ ] **Sección: Descripción del Trabajo**
    - [ ] TextArea para observaciones
    - [ ] Caracteres mínimos (opcional)
  - [ ] **Sección: Firma del Cliente**
    - [ ] Canvas de firma
    - [ ] Botón limpiar firma
    - [ ] Validación: firma obligatoria
  - [ ] **Botón Enviar**
    - [ ] Validar todos los campos
    - [ ] Subir fotos a servidor
    - [ ] Enviar datos completos a backend
    - [ ] Actualizar estado de orden a `completada`
    - [ ] Navegar de vuelta a lista con mensaje de éxito

---

##### 🗺️ **6. Google Maps y Navegación GPS**

- [ ] **Configurar Google Maps**
  - [ ] Obtener API Key de Google Cloud Console
  - [ ] Habilitar APIs: Maps SDK, Geocoding, Distance Matrix
  - [ ] Agregar API Key en `app.json` (android.config.googleMaps.apiKey, ios.config.googleMapsApiKey)
  
- [ ] **Servicio de ubicación (`/services/location.ts`)**
  - [ ] Solicitar permisos de ubicación
  - [ ] `getCurrentLocation()` - Obtener ubicación actual
  - [ ] `geocodeAddress(address)` - Convertir dirección a coordenadas
  - [ ] `openNativeNavigation(lat, lng)` - Abrir Google/Apple Maps
  
- [ ] **Pantalla: Mapa de Orden (`/app/(tabs)/orders/map/[id].tsx`)**
  - [ ] Mapa centrado en ubicación del cliente
  - [ ] Marcador: Ubicación del cliente (rojo)
  - [ ] Marcador: Ubicación actual del instalador (azul)
  - [ ] Marcador: NAP más cercano (verde) - si aplica
  - [ ] Ruta trazada entre instalador y cliente
  - [ ] Botón "Cómo Llegar" → Abrir navegación nativa
  - [ ] Mostrar distancia y tiempo estimado
  
- [ ] **Pantalla: Mapa General (Tab) (`/app/(tabs)/map/index.tsx`)**
  - [ ] Mapa con todas las órdenes asignadas
  - [ ] Marcadores por orden con estado (colores diferentes)
  - [ ] Al tocar marcador → Popup con info básica
  - [ ] Botón "Ver Detalle" en popup
  - [ ] Filtrar órdenes por estado

---

##### 📊 **7. Módulo de Inventario**

- [ ] **Servicio API de inventario (`/services/api/inventory.ts`)**
  - [ ] `getCrewInventory(crewId)` → GET `/api/web/inventory?crewId={id}`
  - [ ] `getItemInstances(itemId)` → GET `/api/web/inventory/instances?itemId={id}`
  - [ ] `getInventoryMovements(crewId)` → GET `/api/web/inventory/movements?crewId={id}`
  
- [ ] **Pantalla: Inventario de Cuadrilla (`/app/(tabs)/inventory/index.tsx`)**
  - [ ] Tabs o secciones:
    - **Materiales** (cable, conectores, etc.)
    - **Equipos** (ONT, modems, routers)
  - [ ] Lista de items con:
    - Código
    - Descripción
    - Cantidad disponible
    - Unidad
    - Indicador de stock bajo (badge rojo)
  - [ ] Búsqueda de material
  - [ ] Pull-to-refresh
  
- [ ] **Componente: InventoryItem (`/components/inventory/InventoryItem.tsx`)**
  - [ ] Diseño de tarjeta de inventario
  - [ ] Para materiales: mostrar cantidad
  - [ ] Para equipos: onPress → Ver instancias
  
- [ ] **Pantalla: Instancias de Equipo (`/app/(tabs)/inventory/instances/[itemId].tsx`)**
  - [ ] Lista de instancias individuales
  - [ ] Mostrar: uniqueId, serialNumber, macAddress, estado
  - [ ] Filtrar por estado (disponible, asignado, instalado)
  - [ ] Ver historial de instancia específica
  
- [ ] **Pantalla: Historial de Movimientos (`/app/(tabs)/inventory/history.tsx`)**
  - [ ] Lista de movimientos (asignación, consumo, devolución)
  - [ ] Información: fecha, tipo, cantidad, material, orden asociada
  - [ ] Filtros por rango de fechas
  - [ ] Filtro por tipo de movimiento

---

##### ⚡ **8. Speed Test de Internet**

- [ ] **Investigar y seleccionar API**
  - [ ] Opción 1: Fast.com API (Netflix)
  - [ ] Opción 2: LibreSpeed (self-hosted)
  - [ ] Opción 3: Ookla Speedtest SDK (licencia comercial)
  
- [ ] **Servicio de Speed Test (`/services/speedTest.ts`)**
  - [ ] `runSpeedTest()` - Ejecutar test completo
  - [ ] Retornar: download (Mbps), upload (Mbps), ping (ms), jitter (ms)
  
- [ ] **Componente: SpeedTestWidget (`/components/speedtest/SpeedTestWidget.tsx`)**
  - [ ] Integrable en formulario de cierre de orden
  - [ ] Animación durante test (velocímetro, progress bar)
  - [ ] Mostrar resultados al finalizar
  - [ ] Opción de re-test
  - [ ] Guardar resultado en estado

---

##### 🔔 **9. Notificaciones Push**

- [ ] **Configurar Firebase**
  - [ ] Crear proyecto en Firebase Console
  - [ ] Descargar `google-services.json` (Android) y `GoogleService-Info.plist` (iOS)
  - [ ] Agregar archivos al proyecto según docs de Expo
  
- [ ] **Instalar y configurar**
  - [ ] `expo install expo-notifications expo-device`
  - [ ] Configurar permisos en `app.json`
  
- [ ] **Servicio de notificaciones (`/services/notifications.ts`)**
  - [ ] `registerForPushNotifications()` - Obtener token
  - [ ] `sendTokenToBackend(token)` - POST `/api/web/installers/register-token`
  - [ ] `handleNotification(notification)` - Procesar notificación recibida
  - [ ] `setupNotificationListeners()` - Listeners de foreground/background
  
- [ ] **Integración en app**
  - [ ] Registrar token al hacer login
  - [ ] Actualizar token si cambia
  - [ ] Al tocar notificación → Navegar a orden específica
  - [ ] Mostrar badge en tab de órdenes con contador

---

##### 👤 **10. Perfil de Usuario**

- [ ] **Pantalla: Perfil (`/app/(tabs)/profile/index.tsx`)**
  - [ ] Foto de perfil (editable)
  - [ ] Nombre del instalador
  - [ ] Email
  - [ ] Teléfono
  - [ ] Cuadrilla asignada
  - [ ] Líder de cuadrilla
  - [ ] Vehículo asignado (si aplica)
  
- [ ] **Configuraciones**
  - [ ] Toggle: Notificaciones activadas/desactivadas
  - [ ] Selector: Idioma (español/inglés)
  - [ ] Toggle: Modo oscuro/claro (reusar ThemeContext)
  - [ ] Botón: Limpiar caché
  
- [ ] **Estadísticas del instalador** (opcional)
  - [ ] Órdenes completadas este mes
  - [ ] Órdenes completadas total
  - [ ] Promedio de tiempo por orden
  
- [ ] **Botón de Cerrar Sesión**
  - [ ] Confirmar con diálogo
  - [ ] Limpiar token de SecureStore
  - [ ] Limpiar caché local
  - [ ] Navegar a pantalla de login

---

##### 🎨 **11. UI/UX y Diseño Corporativo**

- [ ] **Definir paleta de colores Servitel**
  - [ ] Actualizar `tailwind.config.js` con colores corporativos
  - [ ] Crear `/constants/colors.ts` con paleta completa
  
- [ ] **Crear componentes reutilizables**
  - [ ] `/components/ui/Button.tsx` - Botón primario, secundario, danger
  - [ ] `/components/ui/Card.tsx` - Tarjeta base
  - [ ] `/components/ui/Badge.tsx` - Badges de estado
  - [ ] `/components/ui/LoadingSpinner.tsx` - Indicador de carga
  - [ ] `/components/ui/EmptyState.tsx` - Estado vacío
  - [ ] `/components/ui/ErrorState.tsx` - Estado de error
  - [ ] `/components/ui/Toast.tsx` - Notificaciones toast
  
- [ ] **Modo Offline**
  - [ ] Detectar estado de conexión (`NetInfo`)
  - [ ] Mostrar banner "Sin conexión"
  - [ ] Almacenar acciones pendientes en AsyncStorage
  - [ ] Sincronizar al recuperar conexión
  - [ ] Indicador visual de sincronización en Header

---

##### 🔒 **12. Seguridad y Permisos**

- [ ] **Gestión de permisos**
  - [ ] Solicitar ubicación al primer uso de mapa
  - [ ] Solicitar cámara al capturar foto
  - [ ] Solicitar notificaciones al login
  - [ ] Manejo de permisos denegados con diálogos explicativos
  
- [ ] **Seguridad**
  - [ ] Interceptor HTTP para agregar JWT a headers
  - [ ] Refresh token automático (si backend lo soporta)
  - [ ] Auto-logout después de 8 horas de inactividad
  - [ ] Validar certificados SSL en producción

---

##### 🧪 **13. Testing (Opcional pero Recomendado)**

- [ ] **Unit tests**
  - [ ] Tests de servicios API (mocks)
  - [ ] Tests de utilidades
  
- [ ] **Integration tests**
  - [ ] Flujo de login
  - [ ] Flujo de completar orden
  
- [ ] **E2E tests**
  - [ ] Instalar Detox o Maestro
  - [ ] Test: Login → Ver órdenes → Completar orden

---

##### 📱 **14. Preparación para Producción**

- [ ] **Assets**
  - [ ] Diseñar icono de app (1024x1024)
  - [ ] Generar iconos en todas las resoluciones
  - [ ] Diseñar splash screen corporativo
  - [ ] Reemplazar `icon.png`, `splash.png`, `adaptive-icon.png`
  
- [ ] **Configurar eas.json**
  - [x] Perfiles básicos ya existen ✅
  - [ ] Ajustar configuración de production:
    - [ ] Versión semántica
    - [ ] Bundle identifier correcto
    - [ ] Certificados de firma
  
- [ ] **Build y distribución**
  - [ ] Build de preview: `eas build --profile preview --platform android`
  - [ ] Probar APK en dispositivos reales
  - [ ] Recolectar feedback de instaladores
  - [ ] Build de producción cuando esté listo
  
- [ ] **Documentación**
  - [ ] Manual de usuario para instaladores
  - [ ] Video tutorial de la app
  - [ ] FAQ de problemas comunes

---

##### 🚀 **15. Funcionalidades Avanzadas (Futuro - Fase 2)**

- [ ] **Chat en tiempo real** (Socket.io / Firebase Realtime)
- [ ] **Rastreo GPS continuo** - Enviar ubicación cada 5 minutos
- [ ] **Planificación de rutas optimizada** - Algoritmo para ordenar órdenes
- [ ] **Modo offline completo** - SQLite local + sincronización bidireccional
- [ ] **Dashboard personal** - Estadísticas y gráficos del instalador
- [ ] **Reconocimiento de voz** - Dictar observaciones
- [ ] **Escaneo de códigos QR** - Para equipos y materiales

---

### 📊 **Resumen del Estado Actual**

**Completado:**
- ✅ Infraestructura base (Expo, TypeScript, NativeWind)
- ✅ Navegación básica (expo-router)
- ✅ Sistema de temas (oscuro/claro)
- ✅ EAS Build configurado
- ✅ Modelos de referencia del backend disponibles

**Pendiente:**
- 🔴 **Crítico:** Autenticación, lista de órdenes, detalle de orden, formulario de cierre
- 🟡 **Importante:** Google Maps, inventario, notificaciones push
- 🟢 **Mejoras:** Speed test, modo offline, estadísticas

**Próximos Pasos Recomendados:**
1. Limpiar código demo
2. Configurar variables de entorno
3. Instalar dependencias necesarias
4. Implementar AuthContext y pantalla de login
5. Crear pantalla de lista de órdenes
6. Integrar con backend real

---

**Estado Actual:** 🚧 **Proyecto Base Configurado - Requiere Desarrollo Completo**  
**Prioridad:** 🔥 **Alta - Aplicación crítica para operaciones de campo**  
**Tecnologías:** React Native 0.81, Expo 54, TypeScript, expo-router, NativeWind  
**Plataformas:** Android, iOS

### 4. **Motor de Automatización (n8n)** 🚧 CONFIGURADO
Workflows inteligentes para automatización de procesos.

**Flujos Implementados:**
- 📥 **Recepción de Órdenes vía WhatsApp:**
  1. Escucha mensajes en grupo/canal de WhatsApp
  2. Detecta imágenes de órdenes
  3. Extrae texto con GPT-4o Vision
  4. Convierte a JSON estructurado
  5. Crea orden automáticamente en MongoDB

- 📤 **Reporte Automático a Netuno:**
  1. Webhook al completar orden
  2. Recopila información (cliente, materiales, técnico)
  3. Envía POST a Google Form de Netuno

### 5. **Móvil Admin (Supervisión)** 📋 PLANIFICADO
App ligera para supervisores en campo.

---

## 🎯 Funcionalidades Implementadas

### 🏠 Dashboard Principal
- **Métricas en Tiempo Real:**
  - Total de órdenes por estado (pendiente, asignada, completada, cancelada)
  - Órdenes separadas por tipo (instalación/avería)
  - Rendimiento de cuadrillas
  - Alertas de inventario bajo stock

- **Gráficos y Visualización:**
  - Tarjetas de estadísticas con iconos dinámicos
  - Indicadores de tendencia
  - Filtros por período (hoy, semana, mes, año)

### 📋 Gestión de Órdenes
**Componentes:** `OrdersTable`, `NewOrderModal`, `OrderDetailsModal`, `AssignOrderModal`

- ✅ Crear órdenes manualmente o recibir de WhatsApp
- ✅ Asignar/reasignar órdenes a cuadrillas
- ✅ Actualizar estados del ciclo de vida
- ✅ Ver historial completo de cambios (`OrderHistory`)
- ✅ Filtros avanzados (estado, tipo, fecha, cuadrilla)
- ✅ Búsqueda por número de abonado, dirección, o código
- ✅ Paginación y ordenamiento
- ✅ Vista de detalles con toda la información

**Estados de Orden:**
- `pendiente` - Recibida, esperando asignación
- `asignada` - Asignada a cuadrilla específica
- `en-camino` - Técnico en tránsito
- `en-sitio` - Técnico trabajando en ubicación
- `completada` - Trabajo finalizado con éxito
- `cancelada` - Orden cancelada con motivo registrado

### 👥 Gestión de Cuadrillas (Crews)
**Componentes:** `CrewsTable`, `NewCrewForm`, `CrewEditForm`, `CrewInventoryCard`, `CrewMonthlySummary`, `CrewMovementHistory`

- ✅ Crear y editar cuadrillas con líder y miembros
- ✅ Asignar vehículos a cuadrillas
- ✅ Ver inventario asignado a cada cuadrilla en tiempo real
- ✅ **Resumen mensual de materiales:**
  - Selector de mes/año
  - Total de materiales asignados en el período
  - Total de materiales consumidos en órdenes
  - Balance por ítem de inventario
- ✅ **Historial de movimientos de inventario:**
  - Tipo de movimiento (asignación, consumo, devolución)
  - Fecha y hora exacta
  - Cantidad y material involucrado
  - Usuario que realizó el movimiento
  - Orden asociada (si aplica)
- ✅ Activar/desactivar cuadrillas
- ✅ Filtros por estado activo/inactivo

### 📦 Gestión de Inventario
**Componentes:** `InventoryTable`, `CreateItemModal`, `EditItemModal`, `ManageInstancesModal`, `AssignMaterialsModal`, `ReturnMaterialModal`

#### Sistema Dual de Inventario

**A) Materiales de Consumo** (`type: "material"`)
- Gestionados por **cantidad**
- Ejemplos: cable, conectores, grapas, cinta
- Control de stock central
- Asignación por cantidad a cuadrillas
- Seguimiento de consumo por orden

**B) Equipos Individuales** (`type: "equipment"`)
- Gestionados por **instancias individuales**
- Cada equipo tiene ID único (número de serie/MAC)
- Ejemplos: ONTs, modems, routers
- **Estados de instancia:**
  - `in-stock` - En bodega central
  - `assigned` - Asignado a cuadrilla
  - `installed` - Instalado en cliente
  - `damaged` - Averiado
  - `retired` - Dado de baja

**Funcionalidades de Inventario:**
- ✅ CRUD completo de ítems de inventario
- ✅ Categorización (material/equipment/tool)
- ✅ Control de stock mínimo con alertas
- ✅ **Gestión de instancias de equipos:**
  - Agregar equipos con ID único, serial, MAC
  - Asignar instancias específicas a cuadrillas
  - Marcar como instalada en orden específica
  - Rastrear ubicación de instalación
  - Reportar equipos dañados
- ✅ Reabastecer inventario central con registro de lotes
- ✅ Asignar materiales/equipos a cuadrillas
- ✅ Devolver materiales de cuadrillas a bodega
- ✅ Procesar consumo al completar órdenes
- ✅ Historial completo de movimientos con trazabilidad
- ✅ Snapshots diarios automáticos del estado de inventario
- ✅ Estadísticas de uso por período

**Servicios de Inventario (`inventoryService.ts`):**
```typescript
- restockInventory() - Reabastecer bodega central
- assignMaterialToCrew() - Asignar a cuadrilla
- returnMaterialFromCrew() - Devolver a bodega
- processOrderUsage() - Consumir en orden
- addEquipmentInstances() - Agregar equipos individuales
- assignInstanceToCrew() - Asignar equipo específico
- markInstanceAsInstalled() - Registrar instalación
- getAvailableInstances() - Consultar disponibles
- getInstanceById() - Buscar equipo por ID
- updateInstance() - Actualizar estado de equipo
- deleteInstance() - Eliminar equipo
```

### 📊 Sistema de Reportes
**Componentes:** `ReportFilters`, `ReportTable`, `ExportActions`, `ReportHistoryDrawer`

#### Tipos de Reportes Disponibles

**1. Reporte Diario** (`getDailyReport`)
- Órdenes finalizadas y asignadas por fecha específica
- Filtro por tipo (instalación/avería/todas)
- Desglose por estado
- Listado detallado de órdenes

**2. Reporte Mensual** (`getMonthlyReport`)
- Resumen del mes completo
- Desglose día por día
- Totales agregados (finalizadas/asignadas)
- Tendencias del período

**3. Reporte de Inventario** (`getInventoryReport`)
- Material en instalaciones
- Material en averías
- Material averiado
- Material recuperado
- Rango de fechas configurable
- Totales por ítem

**4. Reporte Netuno** (`getNetunoOrdersReport`)
- Órdenes pendientes de reportar a Google Forms
- Órdenes ya reportadas
- Información lista para envío a Netuno

**5. Rendimiento por Cuadrilla** (`getCrewPerformanceReport`)
- Instalaciones realizadas por cuadrilla
- Averías completadas por cuadrilla
- Total de órdenes por equipo
- Ranking de productividad
- Período configurable

**6. Inventario por Cuadrilla** (`getCrewInventoryReport`)
- Estado actual de materiales asignados
- Desglose por cuadrilla
- Inventario disponible de cada equipo
- Vista general o por cuadrilla específica

#### Funcionalidades de Reportes
- ✅ Filtros dinámicos (fecha, tipo, cuadrilla)
- ✅ **Exportación múltiple formato:**
  - 📗 **Excel** (xlsx con estilos) - Tablas formateadas con colores
  - 📕 **PDF** (jsPDF) - Documento imprimible con tablas
  - 📘 **Word** (docx) - Documento editable para reportes corporativos
- ✅ Historial de reportes generados
- ✅ Almacenamiento de reportes en MongoDB (`GeneratedReport`)
- ✅ Regeneración de reportes previos
- ✅ Integración con n8n para envío automático
- ✅ Consideración de días feriados venezolanos
- ✅ Vistas responsivas con tablas adaptables

### 👤 Gestión de Usuarios
**Componentes:** `InstallerForm`, `InstallerCard`

- ✅ Crear usuarios administrativos
- ✅ Gestionar instaladores/técnicos
- ✅ Roles: `admin`, `supervisor`, `logistica`, `installer`
- ✅ Vincular instalador con usuario para acceso móvil
- ✅ Actualizar información de contacto
- ✅ Desactivar usuarios

---

## 🗄️ Modelos de Base de Datos

### `User.ts`
```typescript
{
  email: string (unique)
  passwordHash: string
  role: 'admin' | 'supervisor' | 'logistica' | 'installer'
  name: string
  createdAt: Date
}
```

### `Order.ts`
```typescript
{
  subscriberNumber: string
  subscriberName: string
  address: string
  type: 'instalacion' | 'averia'
  status: 'pendiente' | 'asignada' | 'en-camino' | ...
  assignedCrew?: ObjectId (ref: Crew)
  priority: 'baja' | 'media' | 'alta' | 'urgente'
  description?: string
  materialsUsed?: [{item, quantity, batchCode}]
  completionDetails?: {...}
  reportedToNetuno: boolean
  reportedAt?: Date
  createdAt: Date
  updatedAt: Date
}
```

### `Crew.ts`
```typescript
{
  name: string
  leader: ObjectId (ref: Installer)
  members: ObjectId[] (ref: Installer)
  vehiclesAssigned?: [{id, name}]
  isActive: boolean
  assignedInventory: [{
    item: ObjectId (ref: Inventory)
    quantity: number
    lastUpdated?: Date
  }]
  createdAt: Date
  updatedAt: Date
}
```

### `Inventory.ts`
```typescript
{
  code: string (unique)
  description: string
  unit: string
  currentStock: number
  minimumStock: number
  type: 'material' | 'equipment' | 'tool'
  
  // Solo para type === 'equipment'
  instances: [{
    uniqueId: string (unique)
    serialNumber?: string
    macAddress?: string
    status: 'in-stock' | 'assigned' | 'installed' | 'damaged' | 'retired'
    assignedTo?: {crewId, orderId, assignedAt}
    installedAt?: {orderId, installedDate, location}
    notes?: string
    createdAt: Date
  }]
  
  createdAt: Date
  updatedAt: Date
}
```

### `InventoryHistory.ts`
```typescript
{
  itemId: ObjectId (ref: Inventory)
  type: 'restock' | 'assign_to_crew' | 'return_from_crew' | 'used_in_order'
  quantity: number
  originCrew?: ObjectId
  destinationCrew?: ObjectId
  orderId?: ObjectId
  userId?: ObjectId
  reason?: string
  createdAt: Date
}
```

### `InventorySnapshot.ts`
```typescript
{
  snapshotDate: Date
  warehouseStock: [{item, quantity, currentStock}]
  crewInventories: [{crew, inventory: [{item, quantity}]}]
  totalValueEstimate?: number
  createdAt: Date
}
```

### `GeneratedReport.ts`
```typescript
{
  name: string
  reportType: 'daily' | 'monthly' | 'inventory' | ...
  filters: {...}
  data: Mixed (JSON del reporte)
  generatedBy?: ObjectId (ref: User)
  createdAt: Date
}
```

### `Installer.ts`
```typescript
{
  name: string
  phone: string
  userId?: ObjectId (ref: User)
  isActive: boolean
  createdAt: Date
}
```

### `OrderHistory.ts`
```typescript
{
  orderId: ObjectId (ref: Order)
  changedBy?: ObjectId (ref: User)
  changeType: string
  previousValue?: Mixed
  newValue?: Mixed
  description?: string
  createdAt: Date
}
```

---

## 🎨 Componentes UI Reutilizables

### Visualización de Datos
- ✅ `Table` - Tablas con selección, paginación, ordenamiento
- ✅ `Chip` - Badges para estados (con colores semánticos)
- ✅ `Card` - Contenedores de información  
- ✅ `User` - Avatar + nombre + metadata
- ✅ `Skeleton` - Placeholders de carga
- ✅ `Accordion` - Secciones expandibles

### Formularios
- ✅ `Input` - Campos de texto con validación
- ✅ `Autocomplete` - Búsqueda en listas largas
- ✅ `Select` - Selectores de opciones
- ✅ `Textarea` - Campos de texto largo
- ✅ `Switch` - Interruptores binarios
- ✅ `Button` - Botones con estados de carga
- ✅ `Radio` - Opciones excluyentes
- ✅ `Form` - Contenedor de formularios validados

### Navegación
- ✅ `Modal` - Ventanas emergentes
- ✅ `Drawer` - Panel lateral deslizable
- ✅ `Navbar` - Barra superior
- ✅ `Sidebar` - Menú lateral con navegación
- ✅ `Dropdown` - Menús desplegables
- ✅ `Pagination` - Navegación de páginas
- ✅ `Tabs` - Pestañas de contenido
- ✅ `Breadcrumbs` - Migas de pan

### Feedback
- ✅ `Tooltip` - Información contextual
- ✅ `Toast` - Notificaciones temporales
- ✅ `Spinner` - Indicadores de carga
- ✅ `Progress` - Barras de progreso
- ✅ `Alert` - Mensajes de advertencia/información
- ✅ `Divider` - Separadores visuales

### Iconografía
- ✅ `dashboard-icons.tsx` - Iconos del dashboard
- ✅ `icons.tsx` - Iconos generales del sistema

---

## 🎨 Sistema de Diseño

### Paleta de Colores
Configurada en `tailwind.config.js`:

```javascript
colors: {
  primary: '#3e78b2',    // Azul corporativo
  secondary: '#ffd166',  // Amarillo/Dorado
  success: '#06d6a0',    // Verde
  warning: '#ef476f',    // Rojo/Rosa
  danger: '#e63946',     // Rojo intenso
}
```

### Tema Oscuro/Claro
- ✅ Implementado con `next-themes`
- ✅ Persistencia de preferencia del usuario
- ✅ Componente `theme-switch.tsx`
- ✅ Colores semánticos adaptables

### Responsive Design
- ✅ Mobile first
- ✅ Breakpoints de Tailwind CSS
- ✅ Navegación adaptable (sidebar/hamburger)
- ✅ Tablas con scroll horizontal en móvil

---

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js 20+
- npm o yarn
- MongoDB 6.0+
- Git

### 1. Clonar Repositorio
```bash
git clone <repository-url>
cd servitelvgi-web
```

### 2. Instalar Dependencias
```bash
npm install
```

### 3. Configurar Variables de Entorno
Crear archivo `.env` en la raíz:

```env
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/serviteldb
JWT_SECRET=tu_clave_secreta_muy_segura_aqui
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 4. Ejecutar en Desarrollo
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

### 5. Build para Producción
```bash
npm run build
npm start
```

---

## 📁 Estructura del Proyecto

```
servitelvgi-web/
├── app/                      # App Router de Next.js
│   ├── api/                  # API Routes (Backend)
│   │   ├── web/
│   │   │   ├── auth/         # Endpoints de autenticación
│   │   │   ├── orders/       # CRUD de órdenes
│   │   │   ├── crews/        # Gestión de cuadrillas
│   │   │   ├── inventory/    # Control de inventario
│   │   │   │   └── instances/# Gestión de instancias de equipos
│   │   │   ├── installers/   # Gestión de técnicos
│   │   │   ├── reports/      # Generación de reportes
│   │   │   └── users/        # Gestión de usuarios
│   ├── dashboard/            # Páginas del panel admin
│   │   ├── page.tsx          # Dashboard principal
│   │   ├── orders/           # Página de órdenes
│   │   ├── crews/            # Página de cuadrillas
│   │   │   └── [id]/         # Detalle de cuadrilla
│   │   ├── inventory/        # Página de inventario
│   │   ├── installers/       # Página de instaladores
│   │   └── reports/          # Página de reportes
│   ├── create-admin/         # Creación de primer admin
│   ├── layout.tsx            # Layout raíz
│   ├── page.tsx              # Página de login
│   └── providers.tsx         # Providers de Next.js
├── components/               # Componentes React
│   ├── dashboard/            # Componentes del dashboard
│   ├── orders/               # Componentes de órdenes
│   ├── crews/                # Componentes de cuadrillas
│   ├── inventory/            # Componentes de inventario
│   ├── installers/           # Componentes de instaladores
│   ├── reports/              # Componentes de reportes
│   ├── login/                # Componentes de login
│   ├── Navbar.tsx            # Barra de navegación
│   └── sidebar.tsx           # Menú lateral
├── lib/                      # Servicios y utilidades
│   ├── db.ts                 # Conexión a MongoDB
│   ├── authHelpers.ts        # Helpers de autenticación
│   ├── orderService.ts       # Lógica de órdenes
│   ├── crewService.ts        # Lógica de cuadrillas
│   ├── inventoryService.ts   # Lógica de inventario (43KB)
│   ├── installerService.ts   # Lógica de instaladores
│   ├── reportService.ts      # Lógica de reportes
│   ├── orderHistoryService.ts
│   ├── inventoryHistoryService.ts
│   ├── exports/              # Exportadores
│   │   ├── exportToExcel.ts
│   │   ├── exportToPDF.ts
│   │   └── exportToWord.ts
│   └── utils/
├── models/                   # Modelos de Mongoose
│   ├── User.ts
│   ├── Order.ts
│   ├── Crew.ts
│   ├── Inventory.ts
│   ├── Installer.ts
│   ├── InventoryHistory.ts
│   ├── InventorySnapshot.ts
│   ├── OrderHistory.ts
│   └── GeneratedReport.ts
├── types/                    # Tipos de TypeScript
│   ├── inventory.ts
│   └── reportTypes.ts
├── contexts/                 # React Contexts
├── config/                   # Configuraciones
├── public/                   # Archivos estáticos
├── styles/                   # Estilos globales
├── proxy.ts                  # Middleware de autenticación
├── tailwind.config.js        # Configuración de Tailwind
├── next.config.js            # Configuración de Next.js
├── tsconfig.json             # Configuración de TypeScript
└── package.json              # Dependencias
```

---

## 🔒 Seguridad

- ✅ Autenticación JWT con tokens seguros
- ✅ Hash de contraseñas con bcryptjs
- ✅ Middleware de autenticación en todas las rutas protegidas
- ✅ Validación de roles por endpoint
- ✅ Sanitización de inputs
- ✅ Protección CSRF (Next.js built-in)
- ✅ Rate limiting (por implementar)

---

## 🧪 Testing (Planificado)

- Unit tests con Jest
- Integration tests con Supertest
- E2E tests con Playwright
- Component tests con React Testing Library

---

## 📈 Roadmap Futuro

### Corto Plazo
- [ ] Implementar notificaciones push (Firebase Cloud Messaging)
- [ ] Aplicación móvil completa para instaladores
- [ ] Panel de métricas avanzadas con gráficos (Chart.js/Recharts)
- [ ] Sistema de chat interno entre oficina y campo

### Mediano Plazo
- [ ] Rastreo GPS en tiempo real de cuadrillas
- [ ] Módulo de planificación de rutas optimizadas
- [ ] Sistema de tickets de soporte
- [ ] Integración con ERP/Contabilidad

### Largo Plazo
- [ ] App móvil para supervisores
- [ ] Machine Learning para predicción de tiempos
- [ ] Análisis predictivo de inventario
- [ ] Portal de autogestión para clientes

---

## 👥 Roles y Permisos

| Rol | Dashboard | Órdenes | Cuadrillas | Inventario | Reportes | Usuarios |
|-----|-----------|---------|------------|------------|----------|----------|
| **Admin** | ✅ | ✅ CRUD | ✅ CRUD | ✅ CRUD | ✅ Todos | ✅ CRUD |
| **Supervisor** | ✅ | ✅ Ver/Editar | ✅ Ver | ✅ Ver | ✅ Consultar | ❌ |
| **Logística** | ✅ | ✅ Ver/Asignar | ✅ Ver | ✅ CRUD | ✅ Inventario | ❌ |
| **Installer** | ❌ | ✅ Asignadas (Móvil) | ❌ | ❌ | ❌ | ❌ |

---

## 🤝 Contribución

Este es un proyecto privado de Servitel. Para contribuir:

1. Crear branch desde `main`: `git checkout -b feature/nueva-funcionalidad`
2. Hacer commits descriptivos
3. Crear Pull Request con descripción detallada
4. Esperar revisión de código
5. Merge después de aprobación

---

## 📝 Licencia

Propietario: Servitel  
Todos los derechos reservados © 2025

---

## 📞 Contacto y Soporte

Para soporte técnico o consultas sobre el sistema, contactar al equipo de desarrollo.

---

**Última actualización:** Diciembre 2024  
**Versión:** 0.0.1  
**Estado:** En producción activa