# Shin-Chan TV

App webOS TV para ver Shin-chan desde `shinchaneros.tv`.

## Índice

1. [Características](#1-características)
2. [Estructura](#2-estructura)
3. [Instalación](#3-instalación)
4. [Uso con mando](#4-uso-con-mando)
5. [Personalización](#5-personalización)
6. [Servicio](#6-servicio)
7. [Tests](#7-tests)
8. [Empaquetado](#8-empaquetado)
9. [Iconos](#9-iconos)
10. [Licencia y aviso](#10-licencia-y-aviso)

## 1. Características

1. Catálogo por temporadas, películas, favoritos, especiales, viajes y miedo.
2. Foco con outline blanco pegado + zoom, scroll suave en carruseles y temporadas.
3. Progreso guardado en `shinchan-tv-v1`, seguir viendo y duraciones reales MP4.
4. Reproductor con siguiente episodio, aleatorio y modo dormir.

## 2. Estructura

1. `app/` — UI TV: `index.html`, `app.js`, `style.css`, `squircle.js`, `appinfo.json`, `icon.png`, `largeIcon.png`, `banner-16x9.png`.
2. `app/assets/` — logos, patrón Kasukabe, Shiro, cargas, fuentes crayon, `tmdb.json`.
3. `service/` — proxy local `com.shinchaneros.tv.service`: `server.js`, `catalog.js`, `metadata.js`, `mp4.js`.
4. `tests/` — unitarios `*.test.js` + sondas TV `tv-*.js` + `fixtures/`.
5. `docs/images/` — banners Codex: instalación, personalización, icono Shiro 1:1.
6. `scripts/` — `package.sh`, `install-tv.sh`.

## 3. Instalación

![Instalación](docs/images/banner-instalacion.png)

1. Instala `ares-cli`: `npm i -g @webos-tools/cli`.
2. Empaqueta: `npm run package`.
3. Instala: `TV_IP=192.168.1.50 npm run install-tv`.

## 4. Uso con mando

1. Flechas mueven foco por filas y tarjetas.
2. Arriba desde fila 0 va a temporadas.
3. OK reproduce, atrás vuelve al menú.
4. Durante reproducción arriba/abajo hace scrub.

## 5. Personalización

![Personalización](docs/images/banner-personalizacion.png)

1. Cambia paleta en `app/app.js` → `PASTEL_SETS`.
2. Cambia fondo en `app/assets/patron-shinchan.png` y marco `marco-kasukabe-v2.png`.
3. Cambia loader en `app/assets/carga-*.png` y `shiro.png`.
4. Ver guía de agentes en `AGENTS.md`.

## 6. Servicio

1. `GET /seasons`, `/episodes/:n`, `/collection/:id`, `/resolve/:key`, `/video/:key`, `/duration/:key`.
2. Token por arranque vía `luna://com.shinchaneros.tv.service/start`.
3. Solo `127.0.0.1:18766`, sin CORS externo salvo `Access-Control-Allow-Origin: *` local.

## 7. Tests

1. Ejecuta: `npm test`.
2. Cubre catálogo real (33 ep T1, 27 temporadas), MP4, colecciones, arranque T1/E1, rendimiento y squircle.

## 8. Empaquetado

1. `appinfo.json`: `com.shinchaneros.tv` v1.13.9, `1920x1080`.
2. Salida: `dist/*.ipk` vía `ares-package app service`.

## 9. Iconos

1. `app/icon.png` — 80×80 1:1 Shiro, generado por Codex.
2. `app/largeIcon.png` — 130×130 1:1 Shiro, generado por Codex.
3. `app/banner-16x9.png` — 1920×1080 desde banner Instalación, para launcher 16:9.
4. Fuentes en `docs/images/icon-shiro-1x1-src.png` (1254×1254).

## 10. Licencia y aviso

1. Uso personal, sin afiliación con los titulares citados en `docs/AVISO-LEGAL.md`.
2. La app no aloja contenido en servidores ni en el dispositivo; solo enlaza y retransmite contenido alojado en servidores de terceros.
3. Marcas: `Shin-chan` y personajes de Yoshito Usui / UY Studio, Shin-Ei Animation, TV Asahi y ADK; `webOS` de LG Electronics; `TMDB` de sus titulares. Detalle en `docs/AVISO-LEGAL.md`.
