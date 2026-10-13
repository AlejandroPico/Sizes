# Sizes

Comparador visual de tamaños de Alejandro Pico. Desde las escalas microscópicas hasta el universo observable, con varios objetos sobre una misma escala.

**Regla de diseño del propietario:** comparación a pantalla completa y barra compacta de botones contiguos en la esquina superior derecha. Sin textos promocionales, contadores, cabecera de marca, sugerencias, resúmenes decorativos ni pie de página. Identidad y enlaces solo en Acerca de. Un único botón alterna 3D, texturas de menor detalle y vectorial; 3D es el modo inicial. Añadir objetos se encuentra en los extremos de la secuencia. Esquinas rectas y desplazamiento sin barras visibles.

## Edición 0.3.1

- Tierra y Luna al empezar. Añadir, cambiar y quitar objetos sin un límite artificial de diez.
- Tres calidades cíclicas: 3D por defecto, texturas 2D de menor resolución y vectorial. Rotación individual cuando existe un modelo volumétrico.
- Catálogo completo agrupado en familias y subfamilias anidadas. Pulsar la ficha añade su representante; «+» expande variantes. Búsqueda global y carga progresiva al desplazar.
- Enciclopedia con la misma representación del comparador, búsqueda y selector compactos en el encabezado. Detalles compartidos cuando hay datos compatibles.
- Español, catalán, inglés, francés, alemán, portugués, italiano, chino, japonés e hindi en la navegación. Los textos del catálogo están inicialmente en español e inglés; las traducciones faltantes se identifican.
- El botón de tema alterna automático, mañana, tarde y noche con iconos propios. Idiomas en un micromenú; una elección manual muestra su bandera.
- Alt + clic en información, o Alt+I: inventario con auditoría de datos y recursos, incidencias, estado de revisión y filtros; exportación XLSX, CSV, JSON, TXT y SQLite. El superprompt `AGENTS.md` está en castellano.
- Sol con superficie animada y resplandor difuso, sin hilos ni arcos de plasma; Sirio A y Betelgeuse emplean el mismo modelo base con su filtro de color. Mapas planetarios mejorados, anillos texturizados de Saturno y modelos NASA para Ceres, Vesta, Bennu y Eros. Tierra y Luna conservadas.
- Recortes realistas de animales, transportes, microorganismos y edificios; imágenes 2D del mismo modelo para cuerpos con GLB. Orden de recursos: modelo 3D disponible, imagen o textura adecuada, y vector como última alternativa.
- En móvil vertical, comparación vertical con desplazamiento táctil; al girarlo, comparación horizontal. Un lienzo del tamaño visible evita límites gráficos en listas largas. La escala física sigue siendo común.
- Auditoría reproducible de las 711 fichas con recursos, resoluciones, transparencia, modelos y tareas pendientes: `npm run review:visuals` genera `data/visual-review.json` y `data/visual-review.md`.
- `favicon.svg` original en la raíz: dos cuerpos de diferente tamaño sobre una misma regla.

El catálogo inicial tiene **711 registros: 318 comparables y 393 pendientes**. Incluye 459 entradas de lunas importadas de Universal y 177 contornos de países y territorios. Las lunas sin medida no se dibujan a una escala inventada. Los ejemplos de otros ámbitos son una primera selección representativa y necesitan ampliación y revisión de fuentes por etapas.

## Datos y archivos

La fuente editable es `objetos/<nombre canónico>/meta.json` y sus archivos locales. Cada objeto tiene carpeta propia. Las medidas internas se expresan en metros. Las ilustraciones, texturas observadas y modelos reconstruidos se distinguen en los metadatos y en la enciclopedia.

`npm run prepare:catalog` construye `data/catalog.sqlite` con tablas de objetos, traducciones, etiquetas, recursos, fuentes y auditoría (`quality`, esquema 2). También genera `data/quality-report.json` y las copias de publicación. El navegador consulta SQLite mediante sql.js en un Worker. No hay servidor de base de datos, cuentas ni servicios externos de almacenamiento.

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
npm run review:visuals
npx playwright install chromium
npm run test:browser
```

Las pruebas incluyen proporciones, escalas extremas, listas verticales largas, exportación Excel, shaders solares y espaciales, recorrido real en navegador, gestos móviles y alternativa sin WebGL. Las capturas se guardan en `test-results/`.

## Publicación

`.github/workflows/pages.yml` construye, verifica y publica las actualizaciones de `main`. GitHub Pages debe usar **GitHub Actions** como origen de publicación. La web es estática y sus recursos se sirven desde el mismo proyecto.

## Límites que deben conservarse visibles

Los países usan cartografía Natural Earth en proyección equivalente: conserva áreas, pero las longitudes proyectadas no son distancias geodésicas exactas. Algunos países incluyen territorios separados. Las ciudades usan cuadrados de superficie equivalente, con su ámbito territorial explícito, mientras se incorporan límites reales. Los edificios tienen anchuras ilustrativas y se escalan por su altura conservando las proporciones del recorte. Los recortes generados no son fotografías observadas ni escaneos anatómicos; se mantienen planos cuando no hay un modelo fiable. La animación solar utiliza color y tiempo interpretativos; el diámetro excluye su resplandor. Las superficies sin cartografía observada permanecen neutras. El ADN muestra un fragmento declarado de 20 pares de bases. No se atribuye al electrón un diámetro físico inventado; las escalas teóricas se identifican.

La enciclopedia todavía requiere más traducciones, fotos y revisión específica de fuentes en los ámbitos nuevos. El catálogo inicial no pretende agotar todas las especies, edificios, partículas o cuerpos conocidos.

Lee `AGENTS.md` para el superprompt completo y `ASSETS.md` para la procedencia de recursos.
