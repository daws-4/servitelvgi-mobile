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

- [x] **Limpiar código de demostración**
  - [x] Eliminar archivos en `/app/screens` (onboarding, weather, parallax, etc.) - son demos
  - [x] Limpiar componentes demo en `/components` (VideoCard, JournalCard, CounterCard, etc.)
  - [x] Conservar solo: Header, ThemeToggle, BottomBar (adaptables)
  
- [x] **Configurar variables de entorno**
  - [x] Crear archivo `.env` en raíz
  - [x] Agregar `API_BASE_URL` - URL del backend de Servitel
  - [x] Agregar `GOOGLE_MAPS_API_KEY` - API Key de Google Maps
  - [x] Agregar `SPEEDTEST_API_URL` - URL de API de test de velocidad (opcional)
  - [x] Instalar `expo-constants` para acceder a variables (ya está instalado ✅)
  
- [x] **Instalar dependencias adicionales necesarias**
  - [x] `expo-secure-store` - Almacenamiento seguro de JWT
  - [x] `axios` o `@tanstack/react-query` - Cliente HTTP y caché
  - [x] `react-native-maps` - Google Maps
  - [x] `expo-location` - Geolocalización
  - [x] `expo-image-picker` - Captura de fotos
  - [x] `expo-camera` - Acceso a cámara
  - [x] `react-native-signature-canvas` - Firma digital
  - [x] `expo-notifications` - Push notifications
  - [x] `expo-device` - Info del dispositivo
  - [x] `@react-native-async-storage/async-storage` - Almacenamiento local
  
- [x] **Actualizar configuración**
  - [x] Actualizar `app.json` con:
    - Nombre: "Servitel Instaladores"
    - Bundle ID: `com.servitel.instaladores`
    - Permisos necesarios (ubicación, cámara, notificaciones)
    - Configurar Google Maps API Key
  - [x] Actualizar `package.json` con nombre correcto del proyecto

---

##### 📁 **2. Estructura de Carpetas y Tipos**

- [x] **Crear carpeta `/services` en raíz**
  - [x] `/services/api/auth.ts` - Servicios de autenticación
  - [x] `/services/api/orders.ts` - Servicios de órdenes
  - [x] `/services/api/crews.ts` - Servicios de cuadrillas
  - [x] `/services/api/inventory.ts` - Servicios de inventario
  - [x] `/services/api/installers.ts` - Servicios de instaladores
  - [x] `/services/api/client.ts` - Cliente HTTP base (axios/fetch)
  
- [x] **Crear carpeta `/types` en raíz**
  - [x] Copiar y adaptar modelos de `/lib/api_reference/models`:
    - [x] `/types/User.ts`
    - [x] `/types/Installer.ts`
    - [x] `/types/Order.ts`
    - [x] `/types/Crew.ts`
    - [x] `/types/Inventory.ts`
    - [x] `/types/InventoryHistory.ts`
    - [x] `/types/OrderHistory.ts`
  - [x] `/types/navigation.ts` - Tipos de navegación
  - [x] `/types/api.ts` - Tipos de respuestas API
  
- [x] **Crear carpeta `/constants`**
  - [x] `/constants/colors.ts` - Paleta de colores Servitel
  - [x] `/constants/config.ts` - Configuraciones globales
  - [x] `/constants/orderStates.ts` - Estados de órdenes
  
- [x] **Reorganizar `/app/contexts`**
  - [x] `ThemeContext.tsx` - Ya existe ✅
  - [x] `AuthContext.tsx` - Gestión de autenticación
  - [x] `OrderContext.tsx` - Estado global de órdenes (opcional)

---

##### 🔐 **3. Autenticación y Sesión**

- [x] **AuthContext y AuthProvider**
  - [x] Crear `AuthContext.tsx` con:
    - Estado: `user`, `token`, `isLoading`, `isAuthenticated`
    - Funciones: `login()`, `logout()`, `checkAuth()`
  - [x] Almacenar JWT en SecureStore
  - [x] Cargar token al iniciar app y validar
  
- [x] **Servicio de autenticación (`/services/api/auth.ts`)**
  - [x] Función `login(email, password)` → POST `/api/web/auth/login`
  - [x] Función `validateToken(token)` → Verificar validez del token
  - [x] Función `logout()` → Limpiar sesión
  
- [x] **Pantalla de Login (`/app/login.tsx`)**
  - [x] Layout con logo de Servitel
  - [x] Formulario con email y contraseña
  - [x] Validación de campos (email válido, contraseña mínimo 6 caracteres)
  - [x] Botón de login con indicador de carga
  - [x] Manejo de errores (credenciales incorrectas, sin conexión)
  - [x] Redirección automática si ya está autenticado
  
- [x] **Protección de rutas**
  - [x] Modificar `_layout.tsx` para verificar autenticación
  - [x] Redireccionar a `/login` si no hay token válido
  - [x] Redireccionar a app principal si está autenticado

---

##### 📱 **4. Navegación Principal**

- [x] **Diseñar estructura de navegación**
  - [x] Stack Navigator raíz (auth vs app)
  - [x] Tab Navigator para pantallas principales:
    - Tab 1: Órdenes (`/app/(tabs)/orders/index.tsx`)
    - Tab 2: Inventario (`/app/(tabs)/inventory/index.tsx`)
    - Tab 3: Perfil (`/app/(tabs)/profile/index.tsx`)
    - Tab 4 (opcional): Mapa (`/app/(tabs)/map/index.tsx`)
  
- [x] **Crear componente BottomTabNavigator**
  - [x] Adaptar `BottomBar.tsx` existente o crear nuevo
  - [x] Iconos: lista (órdenes), paquete (inventario), usuario (perfil), mapa
  - [x] Indicadores de badge (órdenes pendientes)
  
- [x] **Actualizar Header**
  - [x] Adaptar `Header.tsx` para mostrar:
    - Logo Servitel
    - Nombre del instalador
    - Foto de perfil
    - Toggle de tema
    - Indicador de sincronización

---
haz un plan de implementación para proceder con los siguientes pasos del proyecto en curso

##### 📦 **5. Módulo de Órdenes de Servicio**

- [x] **Servicio API de órdenes (`/services/api/orders.ts`)**
  - [x] `getCrewOrders(crewId)` → GET `/api/web/orders?assignedTo={crewId}`
  - [x] `getOrderById(orderId)` → GET `/api/web/orders?id={orderId}`
  - [x] `updateOrderStatus(orderId, status)` → PUT `/api/web/orders`
  - [x] `completeOrder(orderId, data)` → PUT `/api/web/orders` con materiales, fotos, firma
  
- [x] **Pantalla: Lista de Órdenes (`/app/(tabs)/orders/index.tsx`)**
  - [x] Fetch de órdenes de la cuadrilla del instalador
  - [x] FlatList con tarjetas de orden (OrderCard component)
  - [x] Pull-to-refresh
  - [x] Filtros por estado (pendiente, en-camino, en-sitio, completada)
  - [x] Búsqueda por número de abonado o dirección
  - [x] Indicador de carga (skeleton)
  - [x] Manejo de estado vacío
  
- [x] **Componente: OrderCard (`/components/orders/OrderCard.tsx`)**
  - [x] Diseño de tarjeta con:
    - Número de abonado
    - Nombre del abonado
    - Tipo (instalación/avería) con icono
    - Estado actual con badge de color
    - Dirección (truncada)
    - Prioridad
  - [x] onPress → Navegar a detalle
  
- [x] **Pantalla: Detalle de Orden (`/app/(tabs)/orders/[id].tsx`)**
  - [x] Mostrar toda la información del modelo Order:
    - Datos del abonado (nombre, teléfonos, email)
    - Dirección completa
    - Nodo técnico
    - Servicios a instalar (array)
    - Tipo y estado
    - Fecha de recepción y asignación
  - [x] Botón "Ver en Mapa" → Abrir mapa con ubicación
  - [x] Botón "Iniciar Viaje" → Cambiar estado a `en-camino`
  - [x] Botón "Llegué al Sitio" → Cambiar estado a `en-sitio`
  - [x] Botón "Completar Orden" → Abrir formulario de cierre
  - [x] Actualización optimista de estado
  
- [x] **Pantalla: Formulario de Cierre (`/app/(tabs)/orders/complete/[id].tsx`)**
  - [x] **Sección: Materiales Usados**
    - [x] Lista del inventario de la cuadrilla
    - [x] Selección de materiales/equipos
    - [x] Input de cantidad para materiales
    - [x] Selección de instancia específica para equipos (uniqueId)
    - [x] Validación: no exceder stock disponible
  - [x] **Sección: Evidencia Fotográfica**
    - [x] Botón "Tomar Foto"
    - [x] Galería de fotos capturadas (mínimo 2)
    - [x] Vista previa y eliminar foto
    - [x] Compresión de imágenes
  - [x] **Sección: Speed Test**
    - [x] Botón "Realizar Test de Velocidad"
    - [x] Mostrar resultados (descarga, subida, ping)
    - [x] Guardar resultados
  - [x] **Sección: Descripción del Trabajo**
    - [x] TextArea para observaciones
    - [x] Caracteres mínimos (opcional)
  - [x] **Sección: Firma del Cliente**
    - [x] Canvas de firma
    - [x] Botón limpiar firma
    - [x] Validación: firma obligatoria
  - [x] **Botón Enviar**
    - [x] Validar todos los campos
    - [x] Subir fotos a servidor
    - [x] Enviar datos completos a backend
    - [x] Actualizar estado de orden a `completada`
    - [x] Navegar de vuelta a lista con mensaje de éxito
toma en consideración que las rutas existentes del backend piden token de autenticación, así que maneja las peticiones enviando el token creado con el login
---

##### 🗺️ **6. Google Maps y Navegación GPS**

- [x] **Configurar Google Maps**
  - [x] Obtener API Key de Google Cloud Console
  - [x] Habilitar APIs: Maps SDK, Geocoding, Distance Matrix
  - [x] Agregar API Key en `app.json` (android.config.googleMaps.apiKey, ios.config.googleMapsApiKey)
  
- [x] **Servicio de ubicación (`/services/location.ts`)**
  - [x] Solicitar permisos de ubicación
  - [x] `getCurrentLocation()` - Obtener ubicación actual
  - [x] `geocodeAddress(address)` - Convertir dirección a coordenadas
  - [x] `openNativeNavigation(lat, lng)` - Abrir Google/Apple Maps
  
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

- [x] **Servicio API de inventario (`/services/api/inventory.ts`)**
  - [x] `getCrewInventory(crewId)` → GET `/api/web/inventory?crewId={id}`
  - [x] `getItemInstances(itemId)` → GET `/api/web/inventory/instances?itemId={id}`
  - [x] `getInventoryMovements(crewId)` → GET `/api/web/inventory/movements?crewId={id}`
  
- [x] **Pantalla: Inventario de Cuadrilla (`/app/(tabs)/inventory/index.tsx`)**
  - [x] Tabs o secciones:
    - **Materiales** (cable, conectores, etc.)
    - **Equipos** (ONT, modems, routers)
  - [x] Lista de items con:
    - Código
    - Descripción
    - Cantidad disponible
    - Unidad
    - Indicador de stock bajo (badge rojo)
  - [x] Búsqueda de material
  - [x] Pull-to-refresh
  
- [x] **Componente: InventoryItem (`/components/inventory/InventoryItem.tsx`)**
  - [x] Diseño de tarjeta de inventario
  - [x] Para materiales: mostrar cantidad
  - [x] Para equipos: onPress → Ver instancias
  
- [x] **Pantalla: Instancias de Equipo (`/app/(tabs)/inventory/instances/[itemId].tsx`)**
  - [x] Lista de instancias individuales
  - [x] Mostrar: uniqueId, serialNumber, macAddress, estado
  - [x] Filtrar por estado (disponible, asignado, instalado)
  - [x] Ver historial de instancia específica
  
- [x] **Pantalla: Historial de Movimientos (`/app/(tabs)/inventory/history.tsx`)**
  - [x] Lista de movimientos (asignación, consumo, devolución)
  - [x] Información: fecha, tipo, cantidad, material, orden asociada
  - [x] Filtros por rango de fechas
  - [x] Filtro por tipo de movimiento

---

##### ⚡ **8. Speed Test de Internet**

- [x] **Investigar y seleccionar API**
  - [x] Opción 1: Fast.com API (Netflix)
  - [x] Opción 2: LibreSpeed (self-hosted)
  - [x] Opción 3: Ookla Speedtest SDK (licencia comercial)
  
- [x] **Servicio de Speed Test (`/services/speedTest.ts`)**
  - [x] `runSpeedTest()` - Ejecutar test completo
  - [x] Retornar: download (Mbps), upload (Mbps), ping (ms), jitter (ms)
  
- [x] **Componente: SpeedTestWidget (`/components/speedtest/SpeedTestWidget.tsx`)**
  - [x] Integrable en formulario de cierre de orden
  - [x] Animación durante test (velocímetro, progress bar)
  - [x] Mostrar resultados al finalizar
  - [x] Opción de re-test
  - [x] Guardar resultado en estado

---

##### 🔔 **9. Notificaciones Push**

- [x] **Configurar Firebase**
  - [x] Crear proyecto en Firebase Console
  - [x] Descargar `google-services.json` (Android) y `GoogleService-Info.plist` (iOS)
  - [x] Agregar archivos al proyecto según docs de Expo
  
- [x] **Instalar y configurar**
  - [x] `expo install expo-notifications expo-device`
  - [x] Configurar permisos en `app.json`
  
- [x] **Servicio de notificaciones (`/services/notifications.ts`)**
  - [x] `registerForPushNotifications()` - Obtener token
  - [x] `sendTokenToBackend(token)` - POST `/api/web/installers/register-token`
  - [x] `handleNotification(notification)` - Procesar notificación recibida
  - [x] `setupNotificationListeners()` - Listeners de foreground/background
  
- [x] **Integración en app**
  - [x] Registrar token al hacer login
  - [x] Actualizar token si cambia
  - [x] Al tocar notificación → Navegar a orden específica
  - [x] Mostrar badge en tab de órdenes con contador

---

##### 👤 **10. Perfil de Usuario**

- [x] **Pantalla: Perfil (`/app/(tabs)/profile/index.tsx`)**
  - [x] Foto de perfil (editable)
  - [x] Nombre del instalador
  - [x] Email
  - [x] Teléfono
  - [x] Cuadrilla asignada
  - [x] Líder de cuadrilla
  - [x] Vehículo asignado (si aplica)
  
- [x] **Configuraciones**
  - [x] Toggle: Notificaciones activadas/desactivadas
  - [x] Selector: Idioma (español/inglés)
  - [x] Toggle: Modo oscuro/claro (reusar ThemeContext)
  - [x] Botón: Limpiar caché
  
- [x] **Estadísticas del instalador** (opcional)
  - [x] Órdenes completadas este mes
  - [x] Órdenes completadas total
  - [x] Promedio de tiempo por orden
  
- [x] **Botón de Cerrar Sesión**
  - [x] Confirmar con diálogo
  - [x] Limpiar token de SecureStore
  - [x] Limpiar caché local
  - [x] Navegar a pantalla de login

---

##### 🎨 **11. UI/UX y Diseño Corporativo**

- [x] **Definir paleta de colores Servitel**
  - [x] Actualizar `tailwind.config.js` con colores corporativos
  - [x] Crear `/constants/colors.ts` con paleta completa
  
- [x] **Crear componentes reutilizables**
  - [x] `/components/ui/Button.tsx` - Botón primario, secundario, danger
  - [x] `/components/ui/Card.tsx` - Tarjeta base
  - [x] `/components/ui/Badge.tsx` - Badges de estado
  - [x] `/components/ui/LoadingSpinner.tsx` - Indicador de carga
  - [x] `/components/ui/EmptyState.tsx` - Estado vacío
  - [x] `/components/ui/ErrorState.tsx` - Estado de error
  - [x] `/components/ui/Toast.tsx` - Notificaciones toast
  
- [x] **Modo Offline**
  - [x] Detectar estado de conexión (`NetInfo`)
  - [x] Mostrar banner "Sin conexión"
  - [x] Almacenar acciones pendientes en AsyncStorage
  - [x] Sincronizar al recuperar conexión
  - [x] Indicador visual de sincronización en Header

---

##### 🔒 **12. Seguridad y Permisos**

- [x] **Gestión de permisos**
  - [x] Solicitar ubicación al primer uso de mapa
  - [x] Solicitar cámara al capturar foto
  - [x] Solicitar notificaciones al login
  - [x] Manejo de permisos denegados con diálogos explicativos
  
- [x] **Seguridad**
  - [x] Interceptor HTTP para agregar JWT a headers
  - [x] Refresh token automático (si backend lo soporta)
  - [x] Auto-logout después de 8 horas de inactividad
  - [x] Validar certificados SSL en producción

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


# MOBILE
- Bitacora de cambios ✅
- campo del ticket ✅
- status hard ✅
- ordenes de recuperación✅
- probar notificaciones push ✅
- arreglar sidebar ✅
/25/01/2025
- buscar ONT por el código de barras con la cámara ✅
- bug de subida de bobinas de fibra ✅
- En las averias no tener las condiciones de speed test firma y materiales para poder cerrar la orden. ✅
- Añadir status de Visita ✅
- Contador de visitas ✅
- campos de Potencias: Nap, Roseta y Puertos restantes ✅
- Apartado de visita técnica y que genere igual una orden pero se cuente como visita. ✅
- scrollView horizontal de filtros en la vista de inventario arreglado ✅
- Error de que se cargaban todas las ONT existentes en vez de las asignadas a la cuadrilla ✅
01/02/2026
- datos nuevos etiqueta{color, numero} ✅
- Verificar que no se pueda hacer speedTest en ordenes de status VISITA ✅
- arreglar botón de confirmación de creación de orden de status VISITA ✅
- opción de passkey para iniciar sesión ✅
- en inventario arreglar la carga del historial ✅


-----------
## por hacer
-Conteo de gasto de datos de la APP - A MEDIAS 
-opción de mensaje directo con soporte técnico
-opción de autogestión de contraseña
-logo para notificaciones push
-logo para la app

# N8n
-Flujo condicional del registro en excel para instalación y avería ✅
-Envío de carta de finalización de orden por whatsapp ✅
 -----------
## por hacer
-Ingreso automático del inventario
-Calificación del servicio por parte del cliente


# WEB
- Impresión y descarga de imagen de finalización de orden ✅
- contador de visitas ✅
- poder ingresar código de ont a través de la cámara ✅
- verificación exhaustiva del inventario ✅
- arreglar tabla de materiales en inventario ✅
- Reportes ✅
- reporte de visitas ✅
- reporte de ordenes por cuadrilla ✅
 -----------
## por hacer

-reporte de materiales gastados filtrado por tipo de orden
-opción de imprimir las imagenes de finalización de orden adjuntas por mes 3 en cada hoja formato pdf
