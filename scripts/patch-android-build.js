const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const buildGradlePath = path.join(rootDir, 'android', 'build.gradle');
const appBuildGradlePath = path.join(rootDir, 'android', 'app', 'build.gradle');

function patchBuildGradle() {
  if (!fs.existsSync(buildGradlePath)) {
    console.error('❌ android/build.gradle no existe. ¿Ejecutaste expo prebuild?');
    return false;
  }

  let content = fs.readFileSync(buildGradlePath, 'utf8');

  // 1. Agregar Speedchecker Maven Repository
  const speedcheckerRepo = `        maven {
            url 'https://maven.speedcheckerapi.com/artifactory/libs-release'
            credentials {
                username = "demo"
                password = "AP85qiz6wYEsCttWU2ZckEWSwJKuA6mSYcizEY"
            }
        }`;

  if (!content.includes('https://maven.speedcheckerapi.com/artifactory/libs-release')) {
    // Buscar la sección allprojects { repositories { ... } }
    const regex = /(allprojects\s*\{\s*repositories\s*\{)/g;
    if (regex.test(content)) {
      content = content.replace(regex, `$1\n${speedcheckerRepo}`);
      console.log('✅ Speedchecker Maven Repository agregado a android/build.gradle');
    } else {
      console.error('❌ No se encontró la sección allprojects { repositories } en android/build.gradle');
    }
  } else {
    console.log('ℹ️ Speedchecker Maven Repository ya está en android/build.gradle');
  }

  // 2. Agregar configuración de CMake y subproyectos
  const subprojectsConfig = `
// Force CMake version and redirect build directories to very short paths (Windows only).
// This resolves CMAKE_OBJECT_PATH_MAX warning, Ninja manifest loop, and long path compiler failures
// on deeply nested pnpm paths for all builds (Debug and Release).
subprojects { sub ->
    if (System.getProperty("os.name").toLowerCase().contains("windows")) {
        // 1. Acortar el directorio de construcción (buildDir) para evitar el límite MAX_PATH de Windows
        // Esto es vital porque Gradle/Java lanza 'CreateProcess error=2' al ejecutar scripts como prefab_command.bat
        if (sub.projectDir.absolutePath.contains("node_modules") && sub.name != "react-native-worklets") {
            sub.buildDir = new File("C:/.rn_build/\${sub.name}")
        }

        // 2. Forzar la versión de CMake de forma segura (verifica si ya fue evaluado)
        def configureCMake = { project ->
            if (project.plugins.hasPlugin('com.android.library') ||
                project.plugins.hasPlugin('com.android.application')) {
                try {
                    def cmake = project.android.externalNativeBuild.cmake
                    cmake.version = "4.1.2"
                    cmake.buildStagingDirectory = "C:/.cxx/\${project.name}"
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
}
`;

  if (!content.includes('System.getProperty("os.name").toLowerCase().contains("windows")')) {
    content += '\n' + subprojectsConfig.trim() + '\n';
    console.log('✅ Configuración de rutas cortas y CMake 4.1.2 condicional agregada al final de android/build.gradle');
  } else {
    console.log('ℹ️ La configuración condicional de rutas cortas y CMake ya está al final de android/build.gradle');
  }

  fs.writeFileSync(buildGradlePath, content, 'utf8');
  return true;
}

function patchAppBuildGradle() {
  if (!fs.existsSync(appBuildGradlePath)) {
    console.error('❌ android/app/build.gradle no existe.');
    return false;
  }

  let content = fs.readFileSync(appBuildGradlePath, 'utf8');

  const cmakeConfig = `    if (System.getProperty("os.name").toLowerCase().contains("windows")) {
        externalNativeBuild {
            cmake {
                version "4.1.2"
                buildStagingDirectory = "C:/.cxx/app"
            }
        }
    }`;

  if (!content.includes('System.getProperty("os.name").toLowerCase().contains("windows")')) {
    // Buscar la sección android { ... }
    const regex = /(android\s*\{)/g;
    if (regex.test(content)) {
      content = content.replace(regex, `$1\n${cmakeConfig}\n`);
      console.log('✅ Configuración condicional de CMake para el App agregada a android/app/build.gradle');
    } else {
      console.error('❌ No se encontró la sección android { ... } en android/app/build.gradle');
    }
  } else {
    console.log('ℹ️ La configuración condicional de CMake para el App ya está en android/app/build.gradle');
  }

  fs.writeFileSync(appBuildGradlePath, content, 'utf8');
  return true;
}

console.log('🏁 Iniciando parche de configuración nativa de Android...');
const p1 = patchBuildGradle();
const p2 = patchAppBuildGradle();

if (p1 && p2) {
  console.log('🎉 ¡Configuración de Android restaurada con éxito!');
} else {
  console.error('⚠️ Se encontraron errores al restaurar la configuración.');
}
