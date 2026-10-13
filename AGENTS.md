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

1. Mantén `com.shinchaneros.tv` y `com.shinchaneros.tv.service` sincronizados en `appinfo.json`, `services.json` y `server.js`.
2. Foco visible: `outline: 4px solid #fff; outline-offset: 0` + `transform: scale(1.04)` en `app/style.css:10,44`.
3. Guarda progreso solo en `shinchan-tv-v1`; no reintroduzcas claves antiguas.
4. Añade test en `tests/` por cada parser o cambio de navegación.
5. Verifica con `npm test` antes de empaquetar.
6. Iconos: regenera `icon.png` 80×80 y `largeIcon.png` 130×130 desde `docs/images/icon-shiro-1x1-src.png`; banner 16:9 desde `docs/images/banner-instalacion.png`.
