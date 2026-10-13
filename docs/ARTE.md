# Arte y recursos visuales

Los banners del README se crearon con la herramienta integrada de generación de imágenes. Se usaron como referencias visuales el logo decorado, el marco de Kasukabe y la tarjeta azul de Nevado de la app. El PNG de portada se exportó a 1600 px de ancho para mostrar el título completo.

Los iconos cuadrado y panorámico ya estaban incluidos en el repositorio. La versión PNG 16:9 se exporta desde `icon-wide.jpg`, sin cambiar la composición. Los personajes, marcas y recursos de terceros conservan sus derechos; consulta [el aviso](AVISO-LEGAL.md).

## Banners

### Logo de la cabecera

[PNG transparente](../app/assets/logo-shinchan-decorado.png)

Herramienta: image_gen integrada, con fondo transparente. Referencia: el banner de portada del README. El logo conserva la inscripción «Shin-Chan TV» y a Shin-chan apoyado en la S; se retiraron el fondo, el subtítulo y la decoración del banner. Prompt utilizado:

```text
Use case: background-extraction. Asset type: transparent PNG wordmark for the home header of Shin-Chan TV. Edit target: the supplied GitHub banner. Extract and recreate only its main logo as a clean alpha cutout: the exact mixed-case yellow lettering 'Shin-Chan' with a small red hyphen and the large red 'TV', together with Shin-chan leaning on the initial S on the left, in his red T-shirt and yellow shorts. Preserve the banner's lettering shapes, glossy flat cartoon highlights, deep navy inner outline and thin white outer stroke, and Shin-chan's pose and face. Exact text: 'Shin-Chan TV'. Remove the dark background, background doodles, houses, grass, bottom-right dog and Chocobi, stars and the subtitle 'Tu rincón de Kasukabe en webOS'. The result is ONLY the original main wordmark plus the leaning Shin-chan, on genuinely transparent alpha. No gradient glow, gray haze, cast shadow, checkerboard pixels or opaque rectangle. Tight horizontal framing approximately 4:1, modest equal transparent margins, no large empty padding. Every letter, the TV and the entire character including shoes must be fully visible, not clipped. This must visually match the logo of the supplied banner rather than inventing a new logo.
```

### Capturas

[PNG](images/banner-capturas.png)

Herramienta: image_gen integrada. Referencias: banner de Personalización y marco de Kasukabe. Prompt utilizado:

```text
Use case: illustration-story. Asset type: new ultrawide 3:1 GitHub README section banner for Shin-Chan TV. Input images: Image 1 is a visual style reference only, match its dark plum background, playful bold hand-drawn lettering, pastel accents and crisp Shinchan object illustration; Image 2 is a supporting reference for Kasukabe scenery and Nevado. Primary request: a coordinated new banner for the screenshot gallery. Text (verbatim): 'Capturas', large pastel blue/ivory cartoon letters on center-left, perfectly spelled C-a-p-t-u-r-a-s with generous margins. On the right a small flat illustrated television with a blue screen and curled-up white Nevado, beside a green Chocobi box and a small camera with a yellow strap. Gentle grass and tiny daisies along the bottom, very subtle low-contrast Shinchan object doodles in the dark background. Warm flat 2D illustration, thick clean outlines, abundant negative space. All objects and letters fully inside the frame. Only the word Capturas. No UI screenshots, no mock browser window, no extra text, no watermark. Landscape ratio 3:1.
```

Las seis imágenes `captura-*.jpg` son capturas de la app en Google Chrome 155, a 1920 × 1080, con el catálogo real. No son imágenes generadas ni contienen el historial personal de la TV. La captura de carga usa una demora temporal en la resolución del vídeo para registrar el loader que ya muestra la app.

### Portada

[PNG](images/banner.png)

Herramienta: image_gen integrada. Prompt utilizado:

```text
Use case: compositing. Asset type: polished ultrawide GitHub README banner for Shin-Chan TV, landscape 3:1. The supplied images are supporting visual references: use recognizable Shinchan and Nevado drawing style from logo, and Kasukabe footer as decorative scenery; create a NEW coherent banner, not a screenshot. Dark plum charcoal background like the app with extremely subtle ivory doodles of Chocobi and Action Kamen masks. Large friendly yellow/red outlined lettering across center-left, exact title 'Shin-Chan TV'. One small calm Nevado to right, Kasukabe house and grass decoration along bottom with clear negative space. Small subtitle exact Spanish text 'Tu rincón de Kasukabe en webOS'. Readable, crisp flat 2D illustration; a tasteful technical-project banner, restrained decoration, no buttons, no unrelated text, no watermarks. All text fully inside generous margins. Composition feels 1600x540 wide.
```

### Instalación

[PNG](images/banner-instalacion.png)

Herramienta: image_gen integrada. Prompt utilizado:

```text
Use case: compositing. Asset type: second matching ultrawide GitHub README section banner, landscape 3:1. Supporting reference images supply the app's Shinchan/Kasukabe art language. Dark plum charcoal background, thin ivory doodles at low contrast. Exact large pale blue/ivory text 'Instalación' on left-center with very generous empty space. On the right a charming small flat illustrated TV showing the curled-up Nevado icon on a simple blue background, and a small yellow kindergarten bag beside it. Little Kasukabe grass at bottom corners. Crisp warm Shinchan drawing style, coherent professional README header. Only text 'Instalación', correctly accented. No subheadings, screenshots, mock browser windows, steps, logos from unrelated apps, watermark or border.
```

### Personalización

[PNG](images/banner-personalizacion.png)

Herramienta: image_gen integrada. Prompt utilizado:

```text
Use case: compositing. Asset type: third matching ultrawide GitHub README section banner, landscape 3:1. Use the references as supporting visual language for a NEW banner. Dark plum charcoal background with subtle ivory Shinchan-object doodles. Exact large pastel pink/ivory text 'Personalización' on center-left, correctly accented, generous margins. On right small charming flat anime objects characteristic of Shinchan: green Chocobi box, red T-shirt, yellow shorts, and small relaxed white Nevado; integrate tiny pastel color swatches as decorative accents. Tasteful restrained composition with abundant negative space and a little Kasukabe grass at bottom. Crisp thick outlines matching supplied art, no extra words, no screenshot, watermark, border or unrelated characters.
```

