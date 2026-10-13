# AGENTS.md — Guía para personalizar Shin-Chan TV

Estilo: directo, numerado, sin rodeos.

## 1. Qué tocar según objetivo

1. Colores y temas → `app/app.js` `PASTEL_SETS` y `app/style.css` variables `--p-light/--p-surface/--p-bg`.
2. Tipografías → `app/assets/crayon-*.woff2` y `@font-face` en `app/style.css:2-3`.
3. Fondo y marco → `app/assets/patron-shinchan.png`, `marco-kasukabe-v2.png`.
4. Loader → `app/assets/shiro.png`, `carga-*.png`, lista `loadingAssets` en `app/app.js:19`.
5. Filas del home → `app/app.js` `initShelves()` y `drawShelf()`.
6. Catálogo web → `service/catalog.js`; no cambies selectores sin actualizar `tests/fixtures/`.
7. Duraciones MP4 → `service/metadata.js` + `service/mp4.js`.

## 2. Reglas

1. Mantén `com.shinchaneros.tv` y `com.shinchaneros.tv.service` sincronizados en `app/appinfo.json`, la llamada Luna de `app/app.js`, `service/package.json`, `service/services.json` y `service/server.js`. Sincroniza la versión de los manifiestos con el `package.json` raíz.
2. Conserva un único foco blanco con zoom del 4 %. El filtro compartido `#focus-outline` de `app/index.html` sigue las máscaras de tarjetas y temporadas; los controles `.icon-button` usan `box-shadow` sobre su botón circular, nunca sobre el SVG. El grosor es 2 px: mantén sincronizados `--focus-width` y el atributo `radius` de `feMorphology`. Una temporada seleccionada sin foco no lleva anillo.
3. Guarda progreso solo en `shinchan-tv-v1`; no reintroduzcas claves antiguas.
4. Añade test en `tests/` por cada parser o cambio de navegación.
5. Verifica con `npm run check` y `npm test` antes de empaquetar. Para cambios de foco, ejecuta también `tests/tv-focus.js` en el inspector; para desplazamiento, `tests/tv-motion.js`. No presentes una tasa fija de FPS sin medirla en la TV.
6. Iconos: `app/icon.png` es 80×80 y `app/largeIcon.png` es 130×130; ambos parten de `docs/images/icon-shiro-1x1-src.png`. El icono 16:9 es `icon-wide.jpg` (1920×1080), con copia PNG en `app/banner-16x9.png`. No uses banners de documentación como iconos ni recortes el personaje.

## 3. Documentación y recursos

1. Actualiza el README cuando cambie un comando, un control o un punto de personalización. Comprueba su índice y sus enlaces relativos.
2. Mantén los banners completos, sin recortar letras. Conserva los prompts en `docs/ARTE.md` y comprueba la procedencia de nuevos recursos.
3. Usa el nombre registrado de la TV en `TV_DEVICE`; no incrustes IPs ni credenciales. `dist/` y los paquetes generados no se añaden a Git.
4. Conserva navegación con mando, etiquetas accesibles y reducción de movimiento. Un cambio estético no debe cambiar el brillo del vídeo ni el historial.
5. Prefiere HTML/CSS/JavaScript y los módulos actuales. No añadas un framework, una dependencia de ejecución ni un servicio permanente para un ajuste visual.
6. Antes de instalar, publicar o ejecutar acciones privilegiadas, comprueba que el usuario las ha autorizado en la conversación. Confirma las acciones destructivas y respalda datos antes de migrar identificadores.
