# Sizes

Comparador visual de tamaños de Alejandro Pico. Desde las escalas microscópicas hasta el universo observable, con varios objetos sobre una misma escala.

**Regla de diseño del propietario:** comparación a pantalla completa y botones independientes en la esquina superior derecha. Sin textos promocionales, contadores, cabecera de marca, sugerencias, resúmenes decorativos ni pie de página. Identidad y enlaces solo en Acerca de. Texturas y 2D/3D son botones. Esquinas rectas. El selector de objetos seguirá revisándose con el propietario.

## Primera edición

- Tierra y Luna al empezar. Añadir, cambiar y quitar objetos sin un límite artificial de diez.
- Vista 2D, texturas y vista 3D con rotación individual. Representación vectorial cuando WebGL no está disponible.
- Catálogo por categorías y familias, búsqueda con nombres y etiquetas, destacados y filtros.
- Enciclopedia, definiciones de las medidas y detalles compartidos cuando hay datos compatibles.
- Español, catalán, inglés, francés, alemán, portugués, italiano, chino, japonés e hindi en la navegación. Los textos del catálogo están inicialmente en español e inglés; las traducciones faltantes se identifican.
- Temas mañana, tarde, noche y automático según fecha y hora local. El automático aproxima el horario estacional; no calcula el amanecer real sin ubicación.
- Alt + clic en información, o Alt+I: inventario con búsqueda y exportación XLSX, CSV, JSON, TXT y SQLite; consulta y descarga de `AGENTS.md`.
- `favicon.svg` original en la raíz: dos cuerpos de diferente tamaño sobre una misma regla.

El catálogo inicial tiene **711 registros: 318 comparables y 393 pendientes**. Incluye 459 entradas de lunas importadas de Universal y 177 contornos de países y territorios. Las lunas sin medida no se dibujan a una escala inventada. Los ejemplos de otros ámbitos son una primera selección representativa y necesitan ampliación y revisión de fuentes por etapas.

## Datos y archivos

La fuente editable es `objetos/<nombre canónico>/meta.json` y sus archivos locales. Cada objeto tiene carpeta propia. Las medidas internas se expresan en metros. Las ilustraciones, texturas observadas y modelos reconstruidos se distinguen en los metadatos y en la enciclopedia.

`npm run prepare:catalog` construye `data/catalog.sqlite` con tablas de objetos, traducciones, etiquetas, recursos y fuentes. También prepara las copias para la publicación. El navegador consulta SQLite mediante sql.js en un Worker. No hay servidor de base de datos, cuentas ni servicios externos de almacenamiento.

El generador inicial `scripts/seed-catalog.mjs` documenta la migración de partida. **No se ejecuta durante el desarrollo normal**: volver a usarlo sobrescribe las fichas curadas. Añade y corrige directamente las carpetas de objetos y regenera el catálogo.

## Desarrollo

Requiere Node 24.

```sh
npm ci
npm run dev
```

Comprobaciones de una entrega:

```sh
npm run build
npm test
npm run check
npx playwright install chromium
npm run test:browser
```

Las pruebas incluyen proporciones, escalas extremas, más de diez objetos, exportación Excel, recorrido real en navegador, móvil y alternativa sin WebGL. Las capturas se guardan en `test-results/`.

## Publicación

`.github/workflows/pages.yml` construye, verifica y publica las actualizaciones de `main`. GitHub Pages debe usar **GitHub Actions** como origen de publicación. La web es estática y sus recursos se sirven desde el mismo proyecto.

## Límites que deben conservarse visibles

Las razones rápidas comparan la mayor dimensión declarada, sin inferir volumen o masa. Los países usan cartografía Natural Earth en proyección equivalente: conserva áreas, pero las longitudes proyectadas no son distancias geodésicas exactas. Algunos países incluyen territorios separados. Las ciudades usan cuadrados de superficie equivalente, con su ámbito territorial explícito, mientras se incorporan límites reales. Los edificios tienen anchuras ilustrativas. Los modelos de animales son ilustrativos, no escaneos anatómicos. No se atribuye al electrón un diámetro físico inventado; las escalas teóricas se identifican.

La enciclopedia todavía requiere más traducciones, fotos y revisión específica de fuentes en los ámbitos nuevos. El catálogo inicial no pretende agotar todas las especies, edificios, partículas o cuerpos conocidos.

Lee `AGENTS.md` para el superprompt completo y `ASSETS.md` para la procedencia de recursos.
