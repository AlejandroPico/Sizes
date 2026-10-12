# Recursos y procedencia

## Código e ilustraciones propias

El código de Sizes, el favicon, los iconos de la interfaz, las siluetas SVG y los modelos procedurales ilustrativos se distribuyen bajo la licencia MIT del proyecto. Las siluetas no son imágenes observadas ni reconstrucciones científicas. Los descriptores `model.json` explican su carácter ilustrativo.

## Recursos astronómicos

Los recursos iniciales se copiaron del proyecto [Universal de Alejandro Pico](https://github.com/AlejandroPico/Universal). Su script `scripts/prepare-assets.mjs` conserva las URLs originales. Los mapas y modelos proceden de recursos públicos de NASA y sus misiones; deben mantenerse los créditos de institución, misión y colaboradores que correspondan.

- Mapas planetarios y de lunas: [NASA 3D Resources — Images and Textures](https://github.com/nasa/NASA-3D-Resources/tree/master/Images%20and%20Textures).
- Color y relieve lunar: [NASA Scientific Visualization Studio, CGI Moon Kit](https://svs.gsfc.nasa.gov/4720/).
- Superficie solar ilustrada con observaciones: [NASA SVS, solar texture](https://svs.gsfc.nasa.gov/30362/). Su animación en Sizes es ilustrativa; no es actividad solar en directo.
- Modelos GLB locales de Urano, Plutón y algunas lunas: [NASA Solar System resources](https://science.nasa.gov/solar-system/resources/). La cartografía de Plutón no constituye una cobertura igualmente detallada de toda su superficie.
- Nubes terrestres: ejemplo de textura distribuido con [Three.js](https://github.com/mrdoob/three.js/tree/dev/examples/textures/planets), que conserva el contexto de sus recursos originales.
- Fondo de la Vía Láctea: [ESO, The Milky Way panorama — eso0932a](https://www.eso.org/public/images/eso0932a/). Crédito: ESO/S. Brunier. Se usa como fondo atenuado y decorativo. Consultar los [términos de uso de ESO](https://www.eso.org/public/outreach/copyright/) para reutilizaciones.

Las dimensiones planetarias iniciales se basan en la [NASA Planetary Fact Sheet](https://nssdc.gsfc.nasa.gov/planetary/factsheet/). El catálogo de lunas se importó de `Universal/src/moon-catalog.json`, con procedencia JPL: [parámetros físicos de satélites](https://ssd.jpl.nasa.gov/sats/phys_par/). Las entradas con `radiusUnknown` no usan el radio de marcador del proyecto de origen como si fuese una medida.

## Geografía

Los contornos proceden de [world-atlas 2.0.2](https://github.com/topojson/world-atlas), basado en [Natural Earth](https://www.naturalearthdata.com/), resolución 1:110 millones. Natural Earth publica esos datos en dominio público. Se conservan los polígonos originales en `boundary.geojson` y se generan siluetas en proyección azimutal equivalente centrada en cada territorio. Las áreas son derivadas de la geometría esférica del conjunto, no estadísticas administrativas oficiales. Algunos contornos incluyen territorios no contiguos.

## Otros ámbitos

Cada ficha conserva su enlace de fuente y estado de medida. La primera colección contiene ejemplos representativos y fuentes generales que deben sustituirse por referencias específicas durante la revisión científica. No se afirma que una fuente de categoría respalde automáticamente todos los ejes secundarios de una ilustración. El estado `reviewStatus: initial` diferencia esta incorporación inicial de una revisión científica completa.

## Recortes realistas de la edición 0.2.0

Ocho ilustraciones originales generadas con la herramienta integrada ImageGen: persona de referencia, elefante africano, ballena azul, labrador, gato, tiburón blanco, abeja y Tyrannosaurus rex. Los archivos `image.png` viven en sus carpetas de objetos; los encuadres alfa se conservan en `visual.imageBounds`. Son ilustraciones realistas, no fotografías observadas ni modelos volumétricos medidos. No se han modificado sus píxeles después de la generación.

Los prompts, sujetos y rutas de salida están documentados en [data/image-prompts.json](data/image-prompts.json). Las imágenes se usan en el comparador como recortes planos cuando no hay un modelo 3D fiable, y como miniaturas en la biblioteca. Los átomos, el agua y el ADN tienen modelos geométricos ilustrativos propios. El ADN representa un fragmento definido de 20 pares de bases, con referencia a [The Cell, NCBI Bookshelf](https://www.ncbi.nlm.nih.gov/books/NBK9944/). La textura terrestre actual es [NASA Blue Marble](https://svs.gsfc.nasa.gov/2915/).
