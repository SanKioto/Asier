const { exec } = require('child_process');

async function comandoSalir(page, usuario, texto, mensajesRespondidos) {
  const idSalida = `salir:${usuario}:${texto}`;
  if (mensajesRespondidos.has(idSalida)) return;
  mensajesRespondidos.add(idSalida);

  await enviarMensaje(page, `🕯️Morthemar🕯️  Como deseáis... me retiro entre sombras. ⚰️`);
  await delay(2000);

  const botonMasAcciones = await page.$('li.fade-hover[data-nav="room-aux"]');
  if (botonMasAcciones) await botonMasAcciones.click();
  await delay(5000);

  const irseDelChat = await page.$('li[data-menu-item="leave_room"]');
  if (irseDelChat) await irseDelChat.click();
  await delay(5000);

  const menuCuenta = await page.$('li.nav-item.nav-account.open-drawer[data-drawer="account"]');
  if (menuCuenta) await menuCuenta.click();
  await delay(5000);

  const cerrarSesionBtn = await page.$('li.drawer-signout[data-action="signout"]');
  if (cerrarSesionBtn) await cerrarSesionBtn.click();
  await delay(10000);

  exec('taskkill /f /im msedge.exe', (err) => {
    if (err) console.error("❌ Error al cerrar Edge:", err);
    else console.log("🕯️ Edge cerrado correctamente.");
  });

  await delay(20000);

  console.log("🕯️ Morthemar ha cerrado sesión y finalizará el proceso.");
  await delay(2000);

  exec('taskkill /f /fi "WINDOWTITLE eq Morthemar"', (err) => {
    if (err) {
      console.error("❌ No se pudo cerrar la ventana CMD automáticamente:", err);
    } else {
      console.log("✔ Ventana CMD cerrada.");
    }
    process.exit(0);
  });
}

module.exports = { comandoSalir };
