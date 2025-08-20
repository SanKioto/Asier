const { spawn } = require('child_process');
const path = require('path');

const asierPath = path.join(__dirname, 'asier.js');
const maestroPath = path.join(__dirname, 'maestro.js');

// Función para ejecutar un script
function ejecutar(scriptPath, etiqueta, reinicio=false) {
  let proceso = spawn('node', [scriptPath], { stdio: 'inherit' });

  proceso.on('exit', (code) => {
    console.log(`[${etiqueta}] Salió con código ${code}`);
    if(reinicio) {
      console.log(`[${etiqueta}] Reiniciando automáticamente...`);
      setTimeout(() => ejecutar(scriptPath, etiqueta, true), 1000); // reinicia después de 1 seg
    }
  });
}

// Ejecutar maestro sin reinicio automático
ejecutar(maestroPath, 'Maestro', false);

// Ejecutar asier.js con reinicio automático
ejecutar(asierPath, 'Asier', true);
