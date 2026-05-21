# Solución a Rutas Largas (Long Paths) en Windows con PNPM y React Native / Expo

Este documento detalla la investigación, el diagnóstico y la solución final implementada para compilar correctamente la **Development Build** de Android utilizando **pnpm** en un entorno Windows, evitando los errores persistentes de límites de caracteres en las herramientas de compilación de C++ (CMake/Ninja).

---

## 🚨 El Problema (Diagnóstico)

Al utilizar `pnpm` con su aislamiento estricto por defecto, las dependencias se organizan físicamente dentro de un almacén virtual muy profundo: `node_modules/.pnpm/<nombre_paquete_con_hash>/node_modules/...`.

Cuando React Native (con la nueva arquitectura / Fabric habilitado) intenta compilar bibliotecas nativas de C++ (como `react-native-worklets`, `react-native-reanimated` o `@react-native-async-storage`):
1. **Límite de CMake (`CMAKE_OBJECT_PATH_MAX`):** Por defecto, CMake en Windows impone un límite estricto de 250 caracteres para la ruta completa de un archivo de objeto `.o`.
2. **Ninja Legacy (stat() fail):** El binario `ninja.exe` v1.10.2 que viene empaquetado por defecto con el CMake 3.22.1 del SDK de Android utiliza llamadas de sistema legacy de Win32 que fallan fatalmente si la ruta supera los 260 caracteres, lanzando el error:
   ```text
   ninja: error: Stat(...ComponentDescriptors.cpp): Filename longer than 260 characters
   ninja: error: manifest 'build.ninja' still dirty after 100 tries
   ```

Incluso si activas la directiva de *Long Paths* en el registro de Windows, las herramientas internas de compilación de la NDK de Android siguen fallando debido a estas limitaciones de bajo nivel.

---

## 🛠️ La Solución Implementada

Para resolver esto **manteniendo la estructura por defecto, el aislamiento estricto y el uso nativo de pnpm** (sin forzar `node-linker=hoisted` ni mover de lugar tu proyecto), implementamos una estrategia combinada de **actualización de CMake** y **redirección de directorios de construcción**.

### 1. Actualización de CMake a la última versión (4.1.2)
Instalamos y configuramos la última versión de CMake (v4.1.2) en el sistema. Las versiones modernas de CMake traen empaquetado un binario de **Ninja v1.12+**, el cual tiene soporte nativo para rutas largas en Windows (empleando el prefijo de espacio de nombres extendido `\\?\`).

### 2. Redirección de directorios `.cxx` a rutas cortas
Para evitar cualquier advertencia de `CMAKE_OBJECT_PATH_MAX` y mantener las rutas de los compiladores de C++ lo más cortas posibles, redirigimos el directorio de trabajo temporal de CMake (`buildStagingDirectory`) a la raíz del disco duro (`C:/.cxx/...`), ahorrando más de **120 caracteres** en las rutas físicas de los archivos generados.

---

## 📂 Archivos Modificados en el Proyecto

### A. Proyecto Raíz (Configuración Global de Subproyectos)
**Archivo:** [android/build.gradle](file:///c:/Users/USUARIO/Desktop/proyectos/servitelv/mobile/android/build.gradle)

Modificamos el bloque `gradle.afterProject` para interceptar dinámicamente cada subproyecto de biblioteca nativa (como `react-native-screens`, `react-native-reanimated`, etc.), forzando el uso de CMake 4.1.2 y mapeando su directorio temporal a `C:/.cxx/<subproyecto>`:

```groovy
// Force CMake 4.1.2 (Ninja 1.12+) and redirect buildStagingDirectory to a very short path.
// This resolves CMAKE_OBJECT_PATH_MAX warning, Ninja manifest loop, and long path compiler failures
// on deeply nested pnpm paths.
gradle.afterProject { sub ->
    if (sub.plugins.hasPlugin('com.android.library') ||
        sub.plugins.hasPlugin('com.android.application')) {
        try {
            def cmake = sub.android.externalNativeBuild.cmake
            cmake.version = "4.1.2"
            cmake.buildStagingDirectory = "C:/.cxx/${sub.name}"
        } catch (Exception ignored) {
            // Skip projects without cmake configuration
        }
    }
}
```

---

### B. Módulo del App (Proyecto Principal)
**Archivo:** [android/app/build.gradle](file:///c:/Users/USUARIO/Desktop/proyectos/servitelv/mobile/android/app/build.gradle)

Dado que la compilación nativa y el codegen del proyecto `:app` se inyectan dinámicamente mediante el plugin de React Native y se evalúan de forma independiente, agregamos una definición explícita dentro del bloque `android { ... }` para garantizar que la aplicación principal también sea compilada usando CMake 4.1.2 con rutas cortas:

```groovy
android {
    ...
    
    externalNativeBuild {
        cmake {
            version "4.1.2"
            buildStagingDirectory = "C:/.cxx/app"
        }
    }
}
```

---

## 🚀 Script de Limpieza y Ejecución Diaria

Cuando agregues nuevas dependencias o sientas que la caché nativa está en conflicto, ejecuta estos comandos en tu terminal PowerShell de la raíz del proyecto para asegurar una compilación 100% limpia y exitosa:

```powershell
# 1. Elimina directorios temporales de compilación nativa previos
Remove-Item -Recurse -Force android\app\.cxx -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force android\app\build -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force C:\.cxx -ErrorAction SilentlyContinue

# 2. Compila la aplicación en tu dispositivo/emulador
pnpm run android
```

---

## 💎 Ventajas de esta Solución
* **Aislamiento Total de PNPM:** Sigues utilizando la arquitectura óptima de enlaces duros de `pnpm` sin aplanar tu `node_modules`.
* **Cero Modificación de Directorios:** No tienes que mover tu proyecto a carpetas raíz en tu disco de desarrollo.
* **Modernidad y Rendimiento:** Compilar con CMake 4.1.2 y el motor Ninja actualizado hace que la construcción de código nativo C++ sea más rápida y eficiente.
