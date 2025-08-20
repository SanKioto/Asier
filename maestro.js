const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');

// Carpeta de HTML diarios
const carpeta = path.join(__dirname, 'registros', 'usuarios');

// Archivo maestro y plantilla
const maestroPath = path.join(__dirname, 'diario_maestro.html');
const plantillaPath = path.join(__dirname, 'plantilla_maestro.html');

// Función para generar el HTML maestro
function generarMaestro() {
  if (!fs.existsSync(carpeta)) {
    console.log(`[Maestro] Carpeta de registros no encontrada: ${carpeta}`);
    return;
  }

  // Leer solo archivos .html en esta carpeta
  const files = fs.readdirSync(carpeta).filter(f => f.endsWith('.html'));
  const registros = {};

  files.forEach(file => {
    const fecha = path.basename(file, '.html');
    const contenido = fs.readFileSync(path.join(carpeta, file), 'utf-8');
    registros[fecha] = contenido;
  });

  const registrosJS = `const registros = ${JSON.stringify(registros)};`;

  if (!fs.existsSync(plantillaPath)) {
    console.log(`[Maestro] No se encontró plantilla: ${plantillaPath}`);
    return;
  }

  let plantilla = fs.readFileSync(plantillaPath, 'utf-8');
  plantilla = plantilla.replace('//__REGISTROS__//', registrosJS);

  fs.writeFileSync(maestroPath, plantilla, 'utf-8');
  console.log(`[Maestro] Actualizado con ${files.length} archivos.`);
}

// Vigilar solo esta carpeta
const watcher = chokidar.watch(carpeta, { persistent: true });
watcher.on('add', generarMaestro);
watcher.on('change', generarMaestro);

// Ejecutar al iniciar
generarMaestro();
