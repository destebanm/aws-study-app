const fs = require('fs');
const path = require('path');

// Generar versión basada en fecha y hora
const now = new Date();
const year = now.getFullYear();
const month = String(now.getMonth() + 1).padStart(2, '0');
const day = String(now.getDate()).padStart(2, '0');
const hours = String(now.getHours()).padStart(2, '0');
const minutes = String(now.getMinutes()).padStart(2, '0');

// Formato: v2025.09.13.1430 (año.mes.día.horaMinutos)
const version = `v${year}.${month}.${day}.${hours}${minutes}`;

// Obtener información adicional
const buildTimestamp = now.toISOString();
const buildDate = now.toLocaleDateString('es-ES', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'Europe/Madrid'
});

// Crear objeto de versión
const versionInfo = {
  version,
  buildTimestamp,
  buildDate,
  buildEnv: process.env.NODE_ENV || 'development',
  gitCommit: process.env.GITHUB_SHA || 'local',
  deployUrl: 'https://destebanm.github.io/aws-study-app/'
};

// Crear el archivo version.json en public
const publicDir = path.join(__dirname, '..', 'public');
const versionFile = path.join(publicDir, 'version.json');

try {
  fs.writeFileSync(versionFile, JSON.stringify(versionInfo, null, 2));
  console.log(`✅ Versión generada: ${version}`);
  console.log(`📅 Fecha de build: ${buildDate}`);
  console.log(`📁 Archivo creado: ${versionFile}`);
} catch (error) {
  console.error('❌ Error al generar archivo de versión:', error);
  process.exit(1);
}

// También crear un archivo para importar en React
const srcDir = path.join(__dirname, '..', 'src');
const versionJsFile = path.join(srcDir, 'version.js');

const versionJsContent = `// Este archivo se genera automáticamente en cada build
export const VERSION_INFO = ${JSON.stringify(versionInfo, null, 2)};

export const getVersion = () => VERSION_INFO.version;
export const getBuildDate = () => VERSION_INFO.buildDate;
export const getBuildTimestamp = () => VERSION_INFO.buildTimestamp;
export const isProduction = () => VERSION_INFO.buildEnv === 'production';
`;

try {
  fs.writeFileSync(versionJsFile, versionJsContent);
  console.log(`📝 Archivo de versión para React creado: ${versionJsFile}`);
} catch (error) {
  console.error('❌ Error al crear archivo de versión para React:', error);
  process.exit(1);
}