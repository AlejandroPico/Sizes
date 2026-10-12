# Sizes — revisión gráfica espacial del 13 de octubre de 2026

Esta revisión conserva los 711 registros del catálogo y comprueba todos sus objetos espaciales. No añade dimensiones a los cuerpos pendientes ni confunde la revisión de recursos con una revisión científica de medidas. El detalle por objeto, rutas, resoluciones, huellas SHA-256 y limitaciones está en `data/planet-visual-review.json`.

## Cambios aplicados

- Tierra y Luna se conservan, como pidió el propietario.
- Sirio A adopta un aspecto blanco azulado y Betelgeuse rojizo, con la referencia primaria y la naturaleza ilustrativa de su superficie animada documentadas.
- Júpiter y Saturno pasan de mapas de 720 × 360 a texturas equirectangulares de 4096 × 2048 derivadas de los materiales originales NASA/VTAD. Las copias anteriores siguen disponibles como `textureLow`.
- Marte pasa al mosaico colorizado Viking/MDIM2.1 de USGS a 4096 × 2048, preparado desde su copia oficial de 21339 × 10670. La antigua textura de 1440 × 720 se conserva como nivel bajo.
- El mapa de Mercurio mostrado por defecto procede ahora del aspecto del modelo NASA. El mosaico MESSENGER realzado de 4096 × 2048 permanece como recurso separado: sus colores no representan una fotografía en color natural.
- Venus pasa a la apariencia atmosférica nubosa del modelo NASA. El anterior mapa naranja, basado en radar, se conserva en `radar-map.jpg` y queda fuera de la apariencia exterior predeterminada.
- Urano y Neptuno disponen de la imagen atmosférica original de 1024 × 512 extraída de sus modelos NASA. Urano mantiene su modelo GLB local.
- Ío, Europa, Ganimedes, Calisto, Encélado, Tritón y Plutón reciben mapas equirectangulares preparados desde los materiales NASA. Titán recibe la apariencia de su modelo NASA a 2048 × 1024. Las dimensiones del archivo de salida no equivalen automáticamente a esa resolución observada en todos los terrenos.
- Ceres, Vesta, Bennu y Eros reciben los modelos GLB NASA originales. Se verificó que sus huellas SHA-256 coinciden con los archivos que sirve actualmente la fuente oficial. No se atribuye a esos modelos un escaneo de cada roca ni una actualización científica de la ficha.
- Quince objetos con GLB tienen una vista fija transparente `preview.png`, renderizada del mismo modelo con Three.js. Sirve de imagen reconocible cuando no se usa 3D y de miniatura; no constituye una fotografía nueva.
- Haumea, Eris y Makemake mantienen superficies neutras explícitamente documentadas. No se inventa cartografía de mundos sin mapa global resuelto.

## Fuentes y tratamiento

Crédito de los modelos: NASA Visualization Technology Applications and Development (VTAD). Fuentes consultadas el 13 de octubre de 2026:

| Recurso | Ficha oficial |
| --- | --- |
| Júpiter | https://science.nasa.gov/resource/jupiter-3d-model/ |
| Saturno | https://science.nasa.gov/resource/saturn-3d-model/ |
| Mercurio | https://science.nasa.gov/resource/mercury-3d-model/ |
| Venus nuboso | https://science.nasa.gov/resource/venus-3d-model/ |
| Urano | https://science.nasa.gov/resource/uranus-3d-model/ |
| Neptuno | https://science.nasa.gov/resource/neptune-3d-model/ |
| Ceres | https://science.nasa.gov/resource/ceres-3d-model/ |
| Vesta | https://science.nasa.gov/resource/vesta-3d-model/ |
| Bennu | https://science.nasa.gov/resource/bennu-3d-model/ |
| Eros | https://science.nasa.gov/resource/eros-3d-model/ |
| Ío | https://science.nasa.gov/resource/io-3d-model/ |
| Europa | https://science.nasa.gov/resource/europa-3d-model/ |
| Encélado | https://science.nasa.gov/resource/enceladus-3d-model/ |
| Plutón | https://science.nasa.gov/resource/pluto-3d-model/ |
| Haumea | https://science.nasa.gov/dwarf-planets/haumea/ |
| Eris | https://science.nasa.gov/dwarf-planets/eris/ |
| Makemake | https://science.nasa.gov/dwarf-planets/makemake/ |

Las direcciones de los binarios descargados se conservan en `visual.sourceDataURL` de las fichas modificadas. Marte procede de USGS: https://astrogeology.usgs.gov/search/map/mars_viking_colorized_global_mosaic_232m . Se utiliza la copia global colorizada de aproximadamente 1 km por píxel como fuente; el resultado publicado pesa mucho menos que el original de 36,7 MB. Sus tonos son procesados y se distinguen de una vista en color natural.

Los mapas preparados con Three.js se obtienen cargando el GLB original, sustituyendo la iluminación por un material sin luz añadida, capturando las seis direcciones desde el centro y reproyectando la muestra del material a coordenadas equirectangulares. No se genera topografía, no se pinta detalle nuevo ni se añade luz a la imagen de salida. La orientación es la convención del recurso y del visor, sin afirmar que muestre la fecha actual.

La franja de anillos `objetos/Saturn/rings.png` es el PNG RGBA original embebido en el GLB NASA, de 4096 × 16. Se extrajo sin modificar sus píxeles. La coordenada U recorre el radio desde el borde interior al exterior; la franja incluye transparencia y divisiones. La proyección se ajusta a las medidas existentes de la comparación y no sustituye una nueva investigación de los radios de cada anillo.

## Límites explícitos

Plutón y Caronte conservan cobertura desigual. New Horizons no proporciona una cartografía de idéntica resolución en toda la esfera; las zonas difuminadas de los materiales originales no se rellenan con cráteres inventados. La imagen de Titán es una vista de su recurso NASA y no afirma que su superficie sea visible en luz natural a través de toda la atmósfera.

En Ceres, Vesta y Bennu se conserva la proporción nativa del modelo mediante `visual.preserveModelAspect`; la escala sigue referida al diámetro medio aproximado de la ficha. En Eros las dimensiones almacenadas son ejes de referencia y conservan su propia convención. La figura de Haumea y especialmente su tercer eje merecen una revisión científica específica: esta revisión gráfica documenta la limitación y no cambia cifras sin confirmar la definición y fuente del modelo.

Muchos satélites lejanos no tienen medidas utilizables ni imágenes de superficie resueltas. Estos registros siguen presentes y pendientes. No se dibujan esferas con tamaños inventados para aparentar que la biblioteca está terminada.

Las estrellas, galaxias, el universo observable y los agujeros negros necesitan ilustraciones de fenómeno o geometría, no fotografías pegadas sobre una bola sólida. Su revisión de recursos consta en el informe, y sus efectos animados corresponden al motor del visor. Una representación espectacular continúa siendo una ilustración; no debe presentarse como una observación actual.

Referencias de apariencia estelar: Sirio A, https://science.nasa.gov/asset/hubble/an-artists-impression-of-sirius-a-and-sirius-b/ ; Betelgeuse, https://science.nasa.gov/universe/what-is-betelgeuse-inside-the-strange-volatile-star/ . Estos colores son decisiones ilustrativas coherentes con la descripción de las estrellas; no son valores RGB medidos de una fotografía global.
