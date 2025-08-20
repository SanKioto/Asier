const puppeteer = require('puppeteer');
const dotenv = require('dotenv');
dotenv.config();
const { comandoSalir } = require('./comando-salir');
const fs = require('fs');
const path = require('path');
const ingresosRegistrados = new Set();
const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const BOT_USERNAME = 'Guest_Asier10';
const delay = ms => new Promise(res => setTimeout(res, ms));


// --- Configuración de registros ---
const LOG_DIR = path.join(__dirname, 'registros');
const CHAT_LOG_DIR = path.join(LOG_DIR, 'chats');
const USERS_LOG_DIR = path.join(LOG_DIR, 'usuarios'); // para TXT y JSON diario
///const USERS_LOG_DIR = path.join(LOG_DIR, 'usuarios');
const USERS_JSON_FILE = path.join(USERS_LOG_DIR, 'usuarios.json'); // 📌 archivo JSON

if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR);
if (!fs.existsSync(CHAT_LOG_DIR)) fs.mkdirSync(CHAT_LOG_DIR);
if (!fs.existsSync(USERS_LOG_DIR)) fs.mkdirSync(USERS_LOG_DIR);

// --- Inicializar archivo JSON si no existe ---
if (!fs.existsSync(USERS_JSON_FILE)) {
    fs.writeFileSync(USERS_JSON_FILE, JSON.stringify({}, null, 2), 'utf8');
    console.log("✅ Archivo usuarios.json creado en:", USERS_JSON_FILE);
}

// --- Funciones JSON ---
function cargarUsuariosJSON() {
    try {
        const data = fs.readFileSync(USERS_JSON_FILE, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error("Error leyendo usuarios.json:", err);
        return {};
    }
}

function guardarUsuariosJSON(usuarios) {
    try {
        fs.writeFileSync(USERS_JSON_FILE, JSON.stringify(usuarios, null, 2), 'utf8');
    } catch (err) {
        console.error("Error guardando usuarios.json:", err);
    }
}

// --- Nueva función con nombreBase ---
function registrarUsuarioJSON(nombrePantalla, nombreBase, nombreUnico, avatarUrl) {
    let usuarios = cargarUsuariosJSON();

    if (!usuarios[nombreUnico]) {
        usuarios[nombreUnico] = { nombrePantalla, nombreBase, avatarUrl, count: 1 };
    } else {
        usuarios[nombreUnico].count++;
        usuarios[nombreUnico].nombrePantalla = nombrePantalla;
        usuarios[nombreUnico].nombreBase = nombreBase;
        usuarios[nombreUnico].avatarUrl = avatarUrl;
    }

    guardarUsuariosJSON(usuarios);
    console.log(`✅ Usuario ${nombrePantalla} (${nombreBase}) registrado/actualizado en usuarios.json`);
}

// --- Logs de chats y usuarios ---
function getChatLogFile() {
    const fecha = new Date();
    const año = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    return path.join(CHAT_LOG_DIR, `${año}-${mes}-${dia}_chat.txt`);
}

function getUsersLogFile() {
    const fecha = new Date();
    const año = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    return path.join(USERS_LOG_DIR, `${año}-${mes}-${dia}_usuarios.txt`);
}

const mensajesRegistrados = new Set();
const usuariosRegistrados = new Set();

// --- Registro de chat ---
function registrarConversacion(usuario, texto) {
    if (!texto) return;

    const IGNORAR_USUARIOS_CHAT = ["Asier", "Asier10", "user-384252885", "desconocido", "Tu", "tú", "Guest_Asier10", "[BOT] Guest_Asier10"];
    if (IGNORAR_USUARIOS_CHAT.includes(usuario)) return;
    if (texto.includes('se ha unido al chat') || texto.includes('ha salido del chat')) return;

    const key = usuario + texto;
    if (mensajesRegistrados.has(key)) return;
    mensajesRegistrados.add(key);

    const timestamp = new Date().toLocaleString('es-MX', { hour12: false });
    const esBot = usuario === BOT_USERNAME ? "[BOT]" : "[USER]";
    const linea = `[${timestamp}] ${esBot} ${usuario}: ${texto}\n`;

    fs.appendFileSync(getChatLogFile(), linea, 'utf8');
}

// --- Registro de usuarios TXT ---
function registrarUsuario(usuario) {
    if (!usuario || usuario === BOT_USERNAME || usuariosRegistrados.has(usuario)) return;
    usuariosRegistrados.add(usuario);

    const timestamp = new Date().toLocaleString('es-MX', { hour12: false });
    const linea = `[${timestamp}] [USER] ${usuario} se ha unido al chat\n`;
    fs.appendFileSync(getUsersLogFile(), linea, 'utf8');
}

// --- HTML diario ---
///const fs = require('fs');
///const path = require('path');

////const USERS_LOG_DIR = path.join(__dirname, 'usuarios_logs'); 
if (!fs.existsSync(USERS_LOG_DIR)) fs.mkdirSync(USERS_LOG_DIR, { recursive: true });

const usuariosRecientes = new Set();

// --- Función para obtener la ruta del JSON diario ---
function getJsonDailyPath() {
    const fecha = new Date();
    const año = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    return path.join(USERS_LOG_DIR, `${año}-${mes}-${dia}_usuarios.json`);
}

// --- Cargar JSON diario (inicio limpio cada día) ---
function cargarUsuariosJSON() {  // Nombre original mantenido
    const archivoDiario = getJsonDailyPath();
    if (!fs.existsSync(archivoDiario)) return {}; // Si no existe, empieza vacío
    const data = fs.readFileSync(archivoDiario, 'utf8');
    try {
        return JSON.parse(data);
    } catch (e) {
        console.error('Error al leer JSON diario:', e);
        return {};
    }
}

// --- Registrar usuario en JSON diario ---
function registrarUsuarioJSON(nombrePantalla, nombreBase, nombreUnico, avatarUrl) {
    const usuarios = cargarUsuariosJSON();

    if (!usuarios[nombreUnico]) {
        usuarios[nombreUnico] = { nombrePantalla, nombreBase, avatarUrl, count: 1 };
    } else {
        usuarios[nombreUnico].count += 1;
    }

    fs.writeFileSync(getJsonDailyPath(), JSON.stringify(usuarios, null, 2), 'utf8');
}

// --- Generar HTML diario ---
function generarHTMLLibroDiario() {
    const usuarios = cargarUsuariosJSON();
    const fecha = new Date();
    const año = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    const BOOK_HTML_FILE_DAILY = path.join(USERS_LOG_DIR, `${año}-${mes}-${dia}_usuarios.html`);

    let html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Usuarios del chat - ${año}-${mes}-${dia}</title>
<style>
body { font-family: Arial, sans-serif; background: #1c1c1c; color: #fff; }
.container { display: flex; flex-wrap: wrap; gap: 15px; padding: 20px; }
.usuario { display: flex; flex-direction: column; align-items: center; width: 100px; transition: transform 0.2s; }
.usuario img { width: 80px; height: 80px; border-radius: 50%; border: 2px solid gold; cursor: pointer; }
.usuario img.recent { border: 3px solid lime; transform: scale(1.05); }
.nombre { margin-top: 5px; text-align: center; font-size: 0.9em; }
.nombre-pantalla { font-weight: bold; }
.nombre-base { font-size: 0.8em; color: #aaa; }
.count { font-size: 0.8em; color: #ffd700; }
</style>
</head>
<body>
<h1>Usuarios del chat - ${año}-${mes}-${dia}</h1>
<div class="container">`;

    for (const nombreUnico in usuarios) {
        const u = usuarios[nombreUnico];
        const recentClass = usuariosRecientes.has(nombreUnico) ? 'recent' : '';
        html += `<div class="usuario">
<a href="https://es.imvu.com/next/av/${u.nombreBase}/" target="_blank">
<img src="${u.avatarUrl}" title="${u.nombrePantalla}" class="${recentClass}">
</a>
<div class="nombre">
  <div class="nombre-pantalla">${u.nombrePantalla}</div>
  <div class="nombre-base">${u.nombreBase}</div>
</div>
<div class="count">Ingresos: ${u.count}</div>
</div>`;
    }

    html += `</div>
</body>
</html>`;

    fs.writeFileSync(BOOK_HTML_FILE_DAILY, html, 'utf8');
    usuariosRecientes.clear();
    console.log(`✅ Libro HTML diario actualizado: ${BOOK_HTML_FILE_DAILY}`);
}

// --- Registrar usuario completo ---
function registrarUsuarioCompleto(nombrePantalla, nombreBase, nombreUnico, avatarUrl) {
    registrarUsuarioJSON(nombrePantalla, nombreBase, nombreUnico, avatarUrl); // Actualiza JSON diario
    usuariosRecientes.add(nombreUnico); // Marcar como reciente
    generarHTMLLibroDiario(); // Genera HTML diario
}

// --- Funciones auxiliares sin cambios ---
async function enviarMensaje(page, texto) {
    const textareaSelector = 'textarea.input-text.no-focus';
    const botonEnviarSelector = 'button.btn.btn-small.btn-ghost.btn-strokeless.btn-send';

    await page.evaluate((selector, texto) => {
        const textarea = document.querySelector(selector);
        if (textarea) {
            textarea.value = texto;
            textarea.dispatchEvent(new Event('input', { bubbles: true }));
        }
    }, textareaSelector, texto);

    await page.evaluate(selector => {
        const btn = document.querySelector(selector);
        if (btn) {
            btn.disabled = false;
            btn.click();
        }
    }, botonEnviarSelector);

    registrarConversacion(BOT_USERNAME, texto);
}

// --- Resto del código sigue igual ---
async function irAlUsuario(page, nombreUsuario) {
    try {
        const coords = await page.evaluate((user) => {
            const avatares = Array.from(document.querySelectorAll('.avatar, .player'));
            for (const avatar of avatares) {
                const nombre = avatar.querySelector('.cs2-name')?.innerText.trim();
                if (nombre === user) {
                    const rect = avatar.getBoundingClientRect();
                    return { x: rect.left, y: rect.top };
                }
            }
            return null;
        }, nombreUsuario);

        if (!coords) return;
        await page.mouse.click(coords.x, coords.y);
    } catch (err) {
        console.error("Error al mover al bot usando el DOM:", err);
    }
}

async function hacerLogin(page, IMVU_EMAIL, IMVU_PASSWORD) {
    await page.goto('https://es.imvu.com/next/chat/room-83338173-387/', { waitUntil: 'networkidle2' });
    await page.waitForSelector('li.sign-in a.login-link', { visible: true });
    await page.click('li.sign-in a.login-link');

    await page.waitForSelector('input[name="avatarname"]', { visible: true });
    await page.type('input[name="avatarname"]', IMVU_EMAIL, { delay: 100 });
    await page.type('input[name="password"]', IMVU_PASSWORD, { delay: 100 });
    await page.click('button.btn.btn-primary');

    try { await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 }); } catch {}
    await page.waitForSelector('button.join-cta', { visible: true });
    await page.click('button.join-cta');
    await delay(5000);
}

async function simularActividad(page) {
    await page.evaluate(() => {
        document.dispatchEvent(new MouseEvent('mousemove', { bubbles: true }));
    });
}

// --- Función principal ---
// --- Función principal ---
async function iniciarBot(IMVU_EMAIL, IMVU_PASSWORD) {
const browser = await puppeteer.launch({
    headless: true,           // modo invisible
    executablePath: EDGE_PATH,
    args: [
        '--no-sandbox',
        '--disable-setuid-sandbox'
    ]
});

    // Crear nueva página (sin crear contexto de incógnito para evitar error)
    const page = await browser.newPage(); 
    await hacerLogin(page, IMVU_EMAIL, IMVU_PASSWORD);

    console.log("Bot Asier en línea (modo invisible Edge).");

    const mensajesRespondidos = new Set();
    const mapaUsuarios = new Map();
    setInterval(() => simularActividad(page), 30000);

    while (true) {
        try {
            const mensajes = await page.evaluate(() => {
                return Array.from(document.querySelectorAll('.cs2-msg')).map(el => {
                    let usuario = el.querySelector('.cs2-name')?.innerText?.trim();
                    const texto = el.querySelector('.cs2-text')?.innerText?.trim() || "";

                    if (!usuario && el.dataset.id) {
                        const match = el.dataset.id.match(/user-(\d+)/);
                        if (match) usuario = `user-${match[1]}`;
                    }
                    if (!usuario) usuario = "desconocido";

                    let avatarUrl = el.querySelector('.cs2-thumb img')?.src || 
                                    el.querySelector('img.cs2-thumb')?.src || '';

                    return { texto, usuario, avatarUrl };
                });
            });

            for (const m of mensajes) {
                const nombreUnico = m.usuario;
                const avatarUrl = m.avatarUrl || '';

                const frasesSistema = [
                    'está en el chat',
                    'estan en el chat',
                    'se ha unido al chat',
                    'ha salido del chat',
                    'ha abandonado el chat'
                ];

                const esIngreso = frasesSistema.some(frase => m.texto.includes(frase));

                if (esIngreso) {
                    const nombrePantalla = m.texto
                        .replace('está en el chat', '')
                        .replace('estan en el chat', '')
                        .replace('se ha unido al chat','')
                        .replace('ha salido del chat','')
                        .replace('ha abandonado el chat','')
                        .trim();

                    mapaUsuarios.set(nombreUnico, nombrePantalla);

                    if (!usuariosRegistrados.has(nombreUnico)) {
                        usuariosRegistrados.add(nombreUnico);
                        const timestamp = new Date().toLocaleString('es-MX', { hour12: false });
                        const linea = `[${timestamp}] [USER] ${nombrePantalla} se ha unido al chat\n`;
                        fs.appendFileSync(getUsersLogFile(), linea, 'utf8');
                    }

                    const ingresoId = nombreUnico + m.texto;
                    if (!ingresosRegistrados.has(ingresoId)) {
                        ingresosRegistrados.add(ingresoId);
                        registrarUsuarioCompleto(nombrePantalla, nombreUnico, nombreUnico, avatarUrl);
                    }
                    continue;
                }

                const nombreParaChat = mapaUsuarios.get(nombreUnico) || nombreUnico;
                registrarConversacion(nombreParaChat, m.texto);
            }

            const IGNORAR_USUARIOS = [BOT_USERNAME, "Asier", "Asier10", "user-384252885", "desconocido", "Tu", "tú"];
            const mensajesFiltrados = mensajes.filter(m => !IGNORAR_USUARIOS.includes(m.usuario));

            for (const mensaje of mensajesFiltrados) {
                const texto = mensaje.texto.toLowerCase();
                const key = mensaje.usuario + texto;
                if (mensajesRespondidos.has(key)) continue;
                mensajesRespondidos.add(key);

                if (texto.includes('skb sal')) {
                    await comandoSalir(page, mensaje.usuario, mensaje.texto, mensajesRespondidos);
                    continue;
                }

                if (texto.includes("!skb")) {
                    await irAlUsuario(page, mensaje.usuario);
                    continue;
                }

	///SE PUEDE EDITAR EL CODIGO DE AQUI PARA ARRIBA SIN PROBLEMAS
	///Mensajes de Bienvenida y Despedida de Personajes

      const ingresos = mensajes.filter(m =>
        m.texto.toLowerCase().includes('se ha unido al chat') &&
        !mensajesRespondidos.has(`${m.texto}`)
      );

      for (const ingreso of ingresos) {
        mensajesRespondidos.add(ingreso.texto);

        const nombreNuevo = ingreso.texto.split(' ')[0];

       await delay(10000); // Espera 10 segundos antes de enviar el mensaje

        const mensajeBienvenida = `**«Vae Victus… Sean bienvenidos. Se adentran en la Ciudadela de los Vampiros, enclavada en el corazón sombrío de las tierras de Nosgoth. Aquí, entre torres que arañan cielos eternamente nublados y sombras que susurran secretos antiguos, se alza el Pilar del Tiempo, guardián silente de eras olvidadas y testigo inmortal de destinos sellados. Cada piedra, cada eco, parece latir con la memoria de lo eterno… y de lo que jamás debe ser olvidado.
`
        await enviarMensaje(page, mensajeBienvenida);
        console.log(`👋 Mensaje de bienvenida enviado a ${nombreNuevo}`);
      }

      const salidas = mensajes.filter(m =>
        m.texto.toLowerCase().includes('ha abandonado el chat') &&
        !mensajesRespondidos.has(`salida:${m.usuario}:${m.texto}`)
      );

      for (const salida of salidas) {
        const idSalida = `salida:${salida.usuario}:${salida.texto}`;
        mensajesRespondidos.add(idSalida);

        const match = salida.texto.match(/^(.*?)\s+ha abandonado el chat/i);
        const nombre = match ? match[1].trim() : salida.usuario;

        const despedidasSarcasticas = [
          `**«Oh, qué tragedia... ${nombre} nos ha dejado. El vacío que deja es tan profundo como un suspiro. Que no se le olvide lo que nunca aportó.»**`,
          `**«Otra alma que no soportó la penumbra. Adiós, ${nombre}. Tu partida no será recordada... ni por los ecos.»**`,
          `**«Cuánta pena… ${nombre} se ha marchado. Las sombras se sacuden de emoción… o quizás solo era polvo.»**`,
          `**«Adiós, ${nombre}. Tu partida ha conmovido incluso a las telarañas. Vuelve pronto… o no.»**`,
          `**«Qué inesperado… ${nombre} se ha marchado. El Inframundo apenas lo notará.»**`
        ];

        const despedidaTexto = despedidasSarcasticas[Math.floor(Math.random() * despedidasSarcasticas.length)];
        const despedida = `Asier  ${despedidaTexto}`;

        await enviarMensaje(page, despedida);
        console.log(` Despedida enviada por la salida de ${nombre}`);

	///Aqui terminan los mensajes de bienvenida y despedida
	      }

                const activadoresvictus = ["vae victus", "Vae victus"];
                if (activadoresvictus.some(palabra => texto.includes(palabra))) {
                    await enviarMensaje(page, "Que sorpresa, la Frase célebre del Emperador Kain… es un honor escucharlas en la Ciudadela de los Vampiros. Cuéntame, noble señor, ¿a qué debemos el privilegio de su visita?");
                    continue;
                }

                const activadoresEntra = ["pasar", "entrar"];
                if (activadoresEntra.some(palabra => texto.includes(palabra))) {
                    await enviarMensaje(page, "Adelante, bajo tu propio riesgo… te adentras en la Ciudadela de los Vampiros de Nosgoth. Aquí, tu destino queda en tus manos y las sombras observan cada decisión, pero recuerda: Nosgoth no perdona. Tu suerte, tu elección; el tiempo y la eternidad son testigos.");
                    continue;
                }

                const activadoresEstan = ["estan", "encuentran", "estas"];
                if (activadoresEstan.some(palabra => texto.includes(palabra))) {
                    await enviarMensaje(page, "De maravilla… aquí, donde el tiempo y la eternidad lo son todo, se extiende la Ciudadela de los Vampiros. Siéntense cómodos y recorran sus pasillos; cada sombra guarda secretos, cada rincón un eco de lo eterno.");
                    continue;
                }

                const activadoresBack = ["back", "regrese", "volvi", "vuelto"];
                if (activadoresBack.some(palabra => texto.includes(palabra))) {
                    await enviarMensaje(page, "Sé bienvenido una vez más a la Ciudadela de los Vampiros, donde las sombras susurran y el tiempo observa tu regreso.");
                    continue;
                }

                const activadoresbrb = ["brb", "BRB", "regreso", "vengo", "vuelvo"];
                if (activadoresbrb.some(palabra => texto.includes(palabra))) {
                    await enviarMensaje(page, "Que tu andar sea seguro y el tiempo te sea leve. Te aguardaremos en estas sombras hasta tu regreso y Vuelve con prontitud, que la ciudadela te espera.");
                    continue;
                }

                const activadoresAdios = ["me retiro", "adios", "bay", "hasta luego", "hasta pronto"];
                if (activadoresAdios.some(palabra => texto.includes(palabra))) {
                    await enviarMensaje(page, "Vae Victus… Que la sombra del tiempo y la eternidad velen por su camino, y que cada paso sea testigo de lo inmortal.");
                    continue;
                }

                const activadoresMoebius = ["moebius", "Moebius",];
                if (activadoresMoebius.some(palabra => texto.includes(palabra))) {
                    await enviarMensaje(page, "Entre los nueve pilares se alza el Pilar del Tiempo, cuya voluntad gobierna los hilos de la eternidad; a su antojo modela instantes y eras, y desde su trono invisible rige con majestad la Ciudadela de los Vampiros, donde cada sombra y cada eco obedecen su mandato.");
                    continue;
                }

                const activadoresAspirantes = ["aspirante", "aspirantes", "recluta", "reclutar", "reclutando"];
                if (activadoresAspirantes.some(palabra => texto.includes(palabra))) {
                    await enviarMensaje(page, "Se aceptan aspirantes y miembros al reino, siempre tras un proceso que deberá consultarse con el Pilar del Tiempo, Moebius, o con alguno de sus descendientes. El linaje del Pilar del Tiempo, su progenie y la familia de Moebius rigen sobre la ciudadela, siendo capaces de manipular el tiempo mismo, guardianes de eras y secretos ancestrales.")
                    continue;
                }

                const activadoresReglas = ["reglas", "reglamento", "reglamentos", "instrucciones"];
                if (activadoresReglas.some(palabra => texto.includes(palabra))) {
                    await enviarMensaje(page, "No sentarse en el trono principal, respetar a la familia y a sus integrantes, nada de estacionamiento de avis, respeto absoluto a todas las razas dentro de la ciudadela de los vampiros, y prohibido todo lenguaje ofensivo.");
                    continue;
                }

const activadoresSaludos = ["hola", "holi", "holitas", "holis", "hello"];
if (activadoresSaludos.some(palabra => texto.includes(palabra))) {
    const nombreSaludo = mapaUsuarios.get(mensaje.usuario) || mensaje.usuario; //con esto se asegura que le responda a la persona que lo activo
    await enviarMensaje(page, `Ah… un viajero más ha cruzado el umbral de este lugar eterno. ${nombreSaludo} Sea bienvenido al Castillo de Moebius, donde cada corredor guarda secretos que el tiempo se niega a olvidar. Caminen con respeto… pues aquí, incluso la sombra tiene memoria.`);
    continue;
}


                const activadoresCreditos = ["credito", "creditos", "crédito", "créditos", "Créditos", "Creditos"];
                if (activadoresCreditos.some(palabra => texto.includes(palabra))) {
                    await enviarMensaje(page, "Hola, actualmente estoy manejando ese tema de forma privada y discreta. No puedo dar detalles completos aquí dentro de la plataforma, pero si deseas más información o saber cómo funciona el proceso, puedes contactarme directamente por WhatsApp. Ahí te podré explicar todo de manera clara y segura... (pide informacion y se te dara el contacto");
                    continue;
                }

                const activadoresPrepagada = ["prepagada", "prepagadas", "tarjeta", "tarjetas", "prepaid", "prepaids", "prepaid card", "prepaids cards"];
                if (activadoresPrepagada.some(palabra => texto.includes(palabra))) {
                    await enviarMensaje(page, "Hola, actualmente estoy manejando ese tema de forma privada y discreta. No puedo dar detalles completos aquí dentro de la plataforma, pero si deseas más información o saber cómo funciona el proceso, puedes contactarme directamente. Ahí te podré explicar todo de manera clara y segura... (pide informacion y se te dara el contacto");
                    continue;
                }

                const activadoresCreador = ["crear", "producto", "pedido", "diseño"];
                if (activadoresCreador.some(palabra => texto.includes(palabra))) {
                    await enviarMensaje(page, "Soy creador de productos hechos desde cero y completamente personalizados. Mi trabajo consiste en diseñar y desarrollar artículos únicos, adaptados al gusto y las necesidades de cada persona. La idea es que no recibas algo genérico, sino un producto pensado especialmente para ti, con los detalles y estilo que prefieras... (pide informacion y se te dara el contacto");
                    continue;
                }

                const activadoresBot = ["bot", "bots", "Bot", "Bots", "npc"];
                if (activadoresBot.some(palabra => texto.includes(palabra))) {
                    await enviarMensaje(page, "Me dedico a crear bots personalizados, diseñados según las necesidades de cada persona o proyecto. Estos bots pueden adaptarse a distintas funciones, como responder mensajes, automatizar tareas, o incluso interactuar en plataformas específicas. Si tienes alguna idea o te interesa contar con un bot a la medida, puedo orientarte y desarrollar la solución que mejor se ajuste a lo que buscas. (pide informacion y se te dara el contacto");
                    continue;
                }

                const activadoresContacto = ["comunico", "contacto", "Informacion", "Información", "informacion"];
                if (activadoresContacto.some(palabra => texto.includes(palabra))) {
                    await enviarMensaje(page, "Si deseas ponerte en contacto conmigo de manera más rápida y directa, puedes escribirme a mi WhatsApp: https://wa.me/5216565942656.");
                    continue;
                }
            }

            await delay(5000);
        } catch (err) {
            console.error("Error en el loop del bot:", err);
        }
    }
}

// --- Iniciar bot ---
const IMVU_EMAIL = process.env.IMVU_EMAIL;
const IMVU_PASSWORD = process.env.IMVU_PASSWORD;
iniciarBot(IMVU_EMAIL, IMVU_PASSWORD);
