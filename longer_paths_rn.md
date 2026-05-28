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

### 3. Exclusión Especial para React Native Worklets
Dado que `react-native-reanimated` importa la librería nativa de `react-native-worklets` usando su ruta de construcción por defecto (`android/build/...`), redirigir el `buildDir` de `react-native-worklets` causaba que Reanimated no pudiera compilar. Por ende, la configuración excluye explícitamente a `react-native-worklets` de la redirección de directorios de compilación, mientras mantiene la optimización para el resto de dependencias pesadas de `node_modules`.

---

## 📂 Archivos Modificados en el Proyecto

### A. Proyecto Raíz (Configuración Global de Subproyectos)
**Archivo:** [android/build.gradle](file:///c:/Users/USUARIO/Desktop/proyectos/servitelv/mobile/android/build.gradle)

Modificamos el bloque `subprojects` para interceptar dinámicamente cada subproyecto (incluidas las bibliotecas de `node_modules`). Hacemos dos cosas clave:
1. Acortamos el directorio de construcción global (`buildDir`) a `C:/.rn_build/<subproyecto>` (exceptuando `react-native-worklets`) para evitar el error `CreateProcess error=2` provocado por rutas muy largas (MAX_PATH) durante la ejecución de scripts.
2. Forzamos de manera segura el uso de CMake 4.1.2 y mapeamos su directorio temporal a `C:/.cxx/<subproyecto>`:

```groovy
// Force CMake version and redirect build directories to very short paths.
// This resolves CMAKE_OBJECT_PATH_MAX warning, Ninja manifest loop, and long path compiler failures
// on deeply nested pnpm paths for all builds (Debug and Release).
subprojects { sub ->
    // 1. Acortar el directorio de construcción (buildDir) para evitar el límite MAX_PATH de Windows
    // Esto es vital porque Gradle/Java lanza 'CreateProcess error=2' al ejecutar scripts como prefab_command.bat
    if (sub.projectDir.absolutePath.contains("node_modules") && sub.name != "react-native-worklets") {
        sub.buildDir = new File("C:/.rn_build/${sub.name}")
    }

    // 2. Forzar la versión de CMake de forma segura (verifica si ya fue evaluado)
    def configureCMake = { project ->
        if (project.plugins.hasPlugin('com.android.library') ||
            project.plugins.hasPlugin('com.android.application')) {
            try {
                def cmake = project.android.externalNativeBuild.cmake
                cmake.version = "4.1.2"
                cmake.buildStagingDirectory = "C:/.cxx/${project.name}"
            } catch (Exception ignored) {
                // Skip projects without cmake configuration
            }
        }
    }

    if (sub.state.executed) {
        configureCMake(sub)
    } else {
        sub.afterEvaluate { project -> configureCMake(project) }
    }
}
```

---

### B. Módulo del App (Proyecto Principal)
**Archivo:** [android/app/build.gradle](file:///c:/Users/USUARIO/Desktop/proyectos/servitelv/mobile/android/app/build.gradle)

Definición explícita dentro del bloque `android { ... }` para garantizar que la aplicación principal también sea compilada usando CMake 4.1.2 con rutas cortas:

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

## ⚡ Automatización al hacer `expo prebuild --clean`

Dado que hacer `expo prebuild --clean` regenera la carpeta `android` completamente desde cero, las modificaciones manuales hechas en los archivos Gradle de Android (como la configuración de CMake 4.1.2, rutas cortas y el repositorio de **Speedchecker**) se perderían. 

Para solucionar esto de manera transparente, implementamos un script de node automatizado:

### 1. Script Automatizado: `scripts/patch-android-build.js`
Este script analiza los archivos Gradle recién regenerados y re-inyecta de forma segura y precisa:
- El repositorio Maven de **Speedchecker** con sus credenciales en `allprojects { repositories { ... } }`.
- El bloque `subprojects` de redirección de CMake 4.1.2 (con la exclusión de `react-native-worklets`) en `android/build.gradle`.
- El bloque `externalNativeBuild` en `android/app/build.gradle`.

### 2. Hook Automático en `package.json`
Agregamos el hook `postprebuild` en tu [package.json](file:///c:/Users/USUARIO/Desktop/proyectos/servitelv/mobile/package.json):
```json
"scripts": {
  "prebuild": "expo prebuild",
  "postprebuild": "node scripts/patch-android-build.js",
  ...
}
```
Esto significa que **cualquier ejecución de `prebuild` (incluyendo `--clean`) aplicará el parche automáticamente** sin que tengas que hacer nada manual.

---

## 🚀 Cómo reconstruir desde cero de forma limpia

Cuando sientas que la caché nativa está en conflicto o agregues nuevas dependencias y quieras regenerar la carpeta `android` desde cero:

### 1. Ejecuta el Prebuild Limpio
Ejecuta el siguiente comando en la raíz del proyecto móvil:
```powershell
pnpm prebuild --clean
```
*Esto eliminará el directorio `android` actual, lo regenerará y aplicará el script de restauración automática.*

### 2. Elimina directorios temporales globales del sistema (Opcional, si hay conflictos persistentes)
```powershell
Remove-Item -Recurse -Force C:\.cxx -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force C:\.rn_build -ErrorAction SilentlyContinue
```

### 3. Compila la aplicación en tu dispositivo o emulador
```powershell
pnpm run android
```

---

## 💎 Ventajas de esta Solución
* **Automatización Total:** No tienes que recordar qué líneas cambiar en `build.gradle` tras un prebuild limpio.
* **Aislamiento Total de PNPM:** Sigues utilizando la arquitectura óptima de enlaces duros de `pnpm` sin aplanar tu `node_modules`.
* **Cero Modificación de Directorios:** No tienes que mover tu proyecto a carpetas raíz en tu disco de desarrollo.
* **Modernidad y Rendimiento:** Compilar con CMake 4.1.2 y el motor Ninja actualizado hace que la construcción de código nativo C++ sea más rápida y eficiente.## comandos para construir 



Generar la carpeta Android:
npx expo prebuild 

Limpiar construcciones previas (si es necesario):
npx expo prebuild --clean 

Ubicarte en la carpeta Android:
cd android 

Generar el archivo AAB (para Play Store):
./gradlew bundleRelease 

Generar el archivo APK (para pruebas):
./gradlew assembleRelease 

Ruta donde queda el archivo
app/build/outputs/apk/release/app-release.apk


compilar con eas expo 
npx expo build:android --profile preview --platform android
eas build --profile preview --platform android