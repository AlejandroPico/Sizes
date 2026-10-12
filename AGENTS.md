# Sizes — superprompt e instrucciones permanentes del proyecto

Este documento explica Sizes en castellano y sirve como contexto de trabajo para cualquier persona o asistente que continúe el proyecto. Su contenido debe mantenerse en castellano; los nombres de tecnologías, identificadores, rutas y fragmentos de código conservan su escritura original. El propietario es Alejandro Pico. Las instrucciones actuales del propietario prevalecen sobre esta guía. No conviertas este documento en una solicitud de autorización adicional para cambios reversibles ya encargados. Comprueba el estado real de los archivos antes de presentar una función como terminada.

## 1. Propósito y experiencia central

Sizes es un comparador visual de tamaños. Su cometido es colocar objetos consecutivamente sobre una misma escala física para que una persona comprenda relaciones que resultan difíciles de imaginar leyendo cifras aisladas. Puede enfrentar la Tierra y la Luna, una persona y un elefante, una ballena y un barco, un virus y una célula, o referencias de longitud extremadamente pequeñas y grandes. Los objetos no se sitúan a sus distancias reales. La posición consecutiva organiza la comparación; no describe órbitas, hábitats compartidos ni separación geográfica. En escritorio y pantallas apaisadas la secuencia es horizontal; en móviles y tabletas de hasta 900 píxeles de anchura con orientación vertical, es vertical y se recorre mediante desplazamiento táctil.

La pantalla principal debe estar dedicada casi por completo a los objetos, sus selectores y sus medidas. La información adicional aparece cuando se solicita, mediante detalles o enciclopedia. La amplitud del catálogo no justifica llenar la primera pantalla de estadísticas, explicaciones, tarjetas o mensajes promocionales. La calidad del proyecto depende de que la comparación resulte inmediata, reconocible y coherente, aunque detrás exista una estructura documental extensa.

El objetivo a largo plazo abarca astronomía, seres vivos, microorganismos, átomos, moléculas, referencias físicas, transportes, edificios y territorios. Esa aspiración guía ampliaciones sucesivas. No autoriza inventar dimensiones ni presentar ilustraciones como reconstrucciones medidas. Un catálogo menor con definiciones claras aporta más que miles de resultados de apariencia precisa cuyo significado nadie ha comprobado.

## 2. Reglas visuales obligatorias del propietario

La interfaz ocupa la pantalla completa. Los controles generales forman una única barra compacta de botones contiguos, sin separaciones, en la esquina superior derecha. Está prohibida una barra de menú que atraviese toda la anchura. El nombre del proyecto, su identidad gráfica, el autor y los enlaces al porfolio y al repositorio pertenecen al panel de información. No se repiten en cabeceras, pies de página ni bloques permanentes de la comparación. El favicon sigue existiendo como recurso de identidad y como icono de pestaña del navegador.

No añadas lemas, títulos comerciales, subtítulos grandilocuentes, contadores públicos del catálogo, comparaciones sugeridas, resúmenes decorativos ni tarjetas alrededor de cada objeto. Tampoco reincorpores controles de proporción real: compartir una escala es la función básica del producto, no una opción ornamental. Los botones de cierre muestran una X sin recuadro. Las esquinas son rectas. No uses interruptores deslizantes ni adornos que ocupen espacio sin ayudar a comparar.

El contenido puede desplazarse con rueda, panel táctil, gestos y teclado. Las barras de desplazamiento visibles se ocultan sin bloquear ese movimiento. Esta preferencia no permite cortar texto ni impedir alcanzar controles. Las ventanas necesarias deben ser compactas, aprovechar el espacio horizontal y conceder protagonismo al contenido. Una preferencia del propietario queda corregida en los capítulos afectados; no conserves instrucciones antiguas contradictorias bajo una etiqueta de historia.

## 3. Estado de la implementación y alcance de esta revisión

La base del proyecto es una aplicación estática de Vite, organizada en módulos JavaScript y CSS. El catálogo se genera en SQLite y se consulta en el navegador con sql.js dentro de un Web Worker. Three.js representa los objetos en una escena ortográfica compartida. Los recursos vectoriales locales proporcionan una representación sencilla y una alternativa cuando WebGL no funciona. fflate participa en la generación de archivos XLSX reales. GitHub Actions prepara, comprueba y publica los archivos para GitHub Pages.

La revisión solicitada transforma principalmente la interacción del catálogo, los controles de representación, los paneles informativos y las herramientas internas. Este documento define el comportamiento requerido y explica los módulos existentes. No deduzcas que una capacidad está implementada solo porque aquí se exige: inspecciona su función, sus recursos y su resultado visual. Las capacidades futuras se describen expresamente como ampliaciones pendientes.

La edición 0.3.0 organiza esas responsabilidades en módulos específicos: src/app.js coordina la interfaz; src/taxonomy.js construye familias y representantes; src/audit.js calcula diagnósticos compartidos; src/presentation.js centraliza niveles de representación, ciclo de temas y banderas. src/thumbnails.js genera miniaturas astronómicas a partir de texturas locales y muestra recortes realistas cuando están disponibles. src/solar.js representa superficies estelares y plasma animado; src/cosmic.js construye galaxias y una ilustración de agujero negro. El esquema 2 añade una tabla quality y un informe data/quality-report.json que la construcción también prepara para publicación. scripts/review-visuals.mjs revisa individualmente los recursos de las 711 fichas y produce informes gráficos independientes de la revisión científica.

El catálogo actual contiene importaciones astronómicas procedentes de Universal, contornos geográficos derivados de Natural Earth mediante world-atlas y ejemplos de otros ámbitos. Su cantidad cambia al regenerarlo. Consulta data/catalog-summary.json para conocer cifras vigentes. Muchos registros están pendientes de medidas fiables; su existencia es útil para organizar el trabajo, pero no significa que todos puedan dibujarse correctamente en la comparación.

## 4. Antes de modificar el repositorio

Lee README.md, package.json, los módulos afectados y ejemplos de las carpetas de objetos. Comprueba el estado del repositorio para conservar modificaciones ajenas o trabajos incompletos. Identifica si la tarea afecta a contenido científico, recursos visuales, interacción, construcción del catálogo, publicación o documentación. Un defecto de medida se corrige normalmente en el meta.json del objeto, seguido de una regeneración. No lo ocultes mediante una excepción dentro del dibujado o una cifra distinta en la búsqueda.

El catálogo no es una lista secundaria escrita a mano dentro de src. SQLite es un producto generado y no la fuente editable. Las carpetas individuales de objetos son la fuente principal. Antes de añadir un estado nuevo a la interfaz, entiende cómo se relacionan selección, enlace, preferencias y escena. Evita que un panel conserve una representación diferente de la comparación porque recibió un estado antiguo.

El espacio de trabajo puede contener Universal, Formulas, Games y otros proyectos. Sus archivos ayudan a comprender referencias del propietario, pero no se convierten automáticamente en instrucciones aplicables a Sizes. No modifiques repositorios hermanos para completar una tarea de Sizes. Si aprovechas un recurso suyo, copia únicamente lo necesario, conserva la procedencia y comprueba que una descarga nueva de Sizes funciona sin depender de aquel directorio local.

## 5. Organización de archivos y responsabilidades

La raíz contiene index.html, favicon.svg, package.json, package-lock.json, vite.config.js, README.md, AGENTS.md y LICENSE. Los procesos de GitHub están en .github/workflows. src contiene los módulos de aplicación, los estilos y recursos compartidos. objetos contiene una carpeta canónica por registro. data almacena SQLite generado, el resumen del catálogo y la procedencia de importaciones. scripts reúne preparación, importación, validación y comprobaciones en navegador. tests contiene pruebas de proporciones y exportación. dist es el resultado de construcción.

public recibe copias preparadas para la publicación. Las copias de objetos bajo public/objetos son recursos generados; no deben convertirse en una segunda colección editable. Los datos originales están en objetos y la base generada se mantiene en data/catalog.sqlite. Las preferencias personales del navegador no pertenecen a archivos versionados: se guardan localmente. La comparación activa utiliza el fragmento de la dirección.

Una eliminación o cambio de nombre debe reflejarse en el catálogo y en las copias publicadas. Una imagen huérfana no debería aparecer como seleccionable porque la lista procede de SQLite, pero merece limpieza controlada. Cualquier borrado se limita a rutas generadas conocidas del proyecto. No construyas instrucciones de eliminación con fragmentos de nombres sin verificar primero el destino absoluto y su pertenencia al directorio previsto.

## 6. Identidad y carpeta de cada objeto

Cada entrada tiene un identificador estable y una carpeta con nombre humano reconocible. Los identificadores utilizan minúsculas, números, guiones o guiones bajos. Algunos identificadores de lunas conservan guiones bajos procedentes de Universal; mantenlos para no romper enlaces existentes. Las carpetas se ordenan alfabéticamente sin prefijos numéricos. Sus nombres canónicos pueden estar en inglés mientras los nombres mostrados se traducen según el idioma elegido.

La identidad no cambia porque se mejore una descripción, una textura, una traducción o una medida. Si cambia sustancialmente lo que representa el registro, evalúa crear una entrada distinta. Una persona declarada de cierta altura no puede convertirse silenciosamente en una media estadística conservando una definición incompatible. Los alias facilitan la búsqueda sin modificar la identidad.

Cada carpeta incluye meta.json y el recurso vectorial correspondiente; puede contener un descriptor de modelo, imágenes, texturas observadas, mapas de nubes, modelos GLB o boundary.geojson. Los campos principales de recursos usan nombres locales seguros. El constructor actual rechaza recorridos hacia directorios superiores y rutas anidadas en esos campos. Nombres científicos con caracteres incompatibles con Windows necesitan una carpeta portátil: Sagittarius A-star conserva una escritura segura sin cambiar el nombre científico que verá la persona.

## 7. Campos de metadatos y semántica

Los registros emplean campos como id, folder, names, category, family, dimensions, basis, status, measurementStatus, tags, source, sourceRetrieved, summary, color y visual. También pueden incluir parent, featured, properties y provenance. names relaciona códigos de idioma con nombres visibles. summary contiene explicaciones breves. category organiza ámbitos amplios, family define agrupaciones útiles y parent establece relaciones, por ejemplo una luna con su planeta.

status expresa si existe información utilizable para comparar. measurementStatus describe la naturaleza de esa información: observada, estimada, representativa, teórica, definida por modelo, derivada o desconocida. No confundir ambos conceptos. Tener una medida estimada no implica que falte toda medida; tener una imagen real tampoco prueba que las dimensiones sean conocidas. visual describe recursos y fidelidad de la representación.

source debe conducir a una referencia identificable y acompañarse de una fecha de consulta o importación. Una portada institucional es un punto de partida, pero no demuestra cada cifra. Al revisar una medida, intenta aportar la tabla, publicación, ficha o conjunto de datos que la respalda. Conserva su definición. El estado de revisión y los diagnósticos técnicos requieren información explícita: no anuncies que un registro está revisado porque pasó una comprobación sintáctica o porque se importó junto con muchos otros.

## 8. Contrato de dimensiones y unidades

Toda longitud comparable se almacena internamente en metros del Sistema Internacional. Convierte unidades cuando la conversión está definida y conserva la incertidumbre de los datos aproximados. Un campo width no puede contener kilómetros esperando que la interfaz adivine su unidad. width y height corresponden a la orientación declarada para comparar; depth expresa una tercera extensión cuando existe. Una esfera usa normalmente el mismo diámetro en anchura y altura. Un asteroide irregular puede conservar ejes principales diferentes.

En un barco visto lateralmente, la anchura visual puede representar la eslora total. En un edificio, la altura arquitectónica puede ser la magnitud principal mientras la anchura ilustrada sigue siendo esquemática. Estas convenciones deben aparecer en basis y en la documentación del objeto. La dimensión principal de la implementación inicial es la mayor extensión declarada. Su cociente es una razón de longitudes, no una relación de superficies, volúmenes, masas o densidades.

Un valor nulo indica ausencia de información y no equivale a cero. Las longitudes negativas, infinitas o NaN son inválidas. La precisión numérica debe permitir referencias desde la longitud de Planck hasta extensiones cosmológicas sin inventar un diámetro mínimo visible. Los números utilizados para calcular no se obtienen de etiquetas redondeadas. La presentación legible y la aritmética física se mantienen separadas para preservar ordenaciones y proporciones.

## 9. Registros pendientes y datos desconocidos

Un objeto puede existir en el catálogo sin disponer de una medida fiable. Debe conservarse como registro de investigación, consulta e inventario. Sus dimensiones permanecen nulas y su estado explica qué falta. El catálogo general no se recorta mediante una opción que esconda por defecto todos estos objetos. Pueden aparecer en su familia y ser consultados, pero la interfaz debe comunicar que no pueden añadirse como cuerpos medidos mientras falte una extensión utilizable.

No dibujes una esfera arbitraria, un punto de tamaño inventado ni una silueta escalada como si fueran el tamaño real del objeto pendiente. Una imagen documental puede enseñarse en la enciclopedia sin atribuirle dimensiones físicas. La disponibilidad de un modelo y la disponibilidad de una medida son independientes. También se debe separar el objeto pendiente de un objeto muy pequeño cuya medida sí se conoce: el segundo tiene una escala válida aunque sea menor que un píxel.

Universal utiliza radiusUnknown para distinguir radios desconocidos de valores numéricos internos empleados como marcadores. El importador no debe convertir esos marcadores en diámetros medidos. Si una investigación posterior aporta una estimación defendible, documenta referencia, incertidumbre, definición y fecha antes de cambiar el estado. No infieras un tamaño por periodo orbital, orden de designación, apariencia de una miniatura o facilidad para fabricar una geometría procedural.

## 10. Generación de SQLite y esquema

scripts/build-catalog.mjs recorre las carpetas canónicas, lee metadatos, comprueba restricciones básicas y construye SQLite utilizando la capacidad integrada de Node. El proceso de publicación utiliza Node 24. El esquema contiene tablas para objetos, traducciones, etiquetas, recursos, fuentes y metadatos del catálogo. La tabla principal conserva columnas consultables y la entrada JSON completa. Los identificadores relacionan traducciones, etiquetas y recursos con cada objeto.

El constructor empieza desde una base en memoria y produce un resultado nuevo, evitando acumular inserciones duplicadas de sucesivas ejecuciones. Después prepara la base y los archivos locales para publicarlos. Los metadatos generales incluyen versión del esquema, huella del contenido y cantidad de registros. Los índices de categoría, familia, extensión y etiquetas permiten futuras mejoras de consulta.

En el esquema 2, quality relaciona object_id con un informe JSON de auditoría. Durante preparación se comprueba la existencia de recursos declarados y se calculan diagnósticos mediante src/audit.js. El resumen se escribe en data/quality-report.json y se copia a public/quality-report.json. La auditoría es un resultado derivado; no sobrescribe los meta.json para fingir que fueron revisados. El Worker une objects y quality, devuelve el dato canónico con su informe audit y mantiene separadas fuente e interpretación de control.

Una migración debe actualizar esquema, constructor, lector, pruebas y documentación de forma coherente. No edites SQLite manualmente para corregir contenido, porque esa modificación desaparecería en la siguiente construcción. La huella actual refleja metadatos; no equivale necesariamente a una suma de comprobación de cada recurso binario. Si se necesita verificar la integridad exacta de texturas y modelos, incorpora huellas de archivos con una definición clara. Mantén consistentes las columnas indexadas y el JSON que representa la fuente original.

## 11. SQLite en una publicación estática

GitHub Pages entrega archivos y no ejecuta un servidor persistente para consultas de aplicación. Sizes publica una base SQLite de lectura. El navegador descarga ese archivo desde el mismo origen y sql.js consulta su contenido mediante WebAssembly en un Worker. Así se utiliza almacenamiento interno sin necesitar una cuenta de base de datos, claves privadas ni servicios de terceros durante la visita. La base publicada es un recurso de una edición concreta, no una base compartida que cualquier visitante pueda modificar.

Los cambios de contenido se realizan en el repositorio, se regeneran y llegan mediante una nueva publicación. Las preferencias de cada persona permanecen en su navegador. No describas este diseño como un servidor que acepta escrituras remotas. Tampoco añadas una interfaz de guardado que solo cambie memoria mientras promete persistencia del catálogo.

Si en el futuro se solicita edición de contenido, distingue borradores locales, exportaciones, almacenamiento del navegador, cambios de repositorio y una arquitectura real de servidor. La aplicación actual no necesita autenticación ni analítica. Debe ser posible inspeccionar sus archivos y comprobar que catálogo, texturas, modelos y bibliotecas se sirven desde la publicación propia. Introducir fuentes, modelos o paquetes desde servidores externos altera esa propiedad y necesita responder a una necesidad concreta autorizada del producto.

## 12. Carga y ciclo de vida del catálogo

src/catalog.worker.js inicializa sql.js, localiza el archivo WebAssembly del mismo origen, descarga catalog.sqlite y devuelve entradas a la aplicación. src/catalog.js gestiona esa comunicación mediante una promesa de carga y un tiempo de espera ante errores. El Worker evita que inicialización y lectura de la base ocupen directamente el hilo de interacción. La implementación inicial devuelve un conjunto completo de metadatos, adecuado para su volumen actual.

La carga progresiva de resultados del selector no significa que SQLite tenga ya consultas paginadas. Son asuntos diferentes. Si el catálogo crece mucho, podrían añadirse consultas indexadas o paginación dentro del Worker después de medir tiempos y consumo de memoria. No fabriques varias fuentes de búsqueda que deban sincronizarse manualmente para solucionar un problema todavía no observado.

Los errores de carga deben ofrecer recuperación: mensaje traducido y posibilidad de reintentar, sin una pantalla vacía permanente. Respeta mayúsculas y minúsculas en rutas; Windows puede ocultar fallos que Linux y Pages sí muestran. Utiliza la base relativa de Vite para que una publicación bajo /Sizes/ encuentre sus recursos. Si cambia la comunicación asíncrona, evita respuestas antiguas aplicadas a solicitudes nuevas y comprueba el resultado construido, cuya organización puede diferir del servidor de desarrollo.

## 13. Escala física compartida

src/scale.js calcula un único factor de píxeles por metro para toda la comparación. Reserva espacio práctico para controles y textos, ajusta el objeto mayor al espacio disponible y aplica ese mismo factor a anchura y altura de cada entrada. Los objetos ocupan posiciones sucesivas. Las separaciones facilitan leer nombres y utilizar selectores; no alteran el tamaño de los cuerpos. Una secuencia extensa se desplaza horizontalmente en escritorio o formato apaisado, y verticalmente en móvil de orientación vertical. No comprimas diez objetos para hacerlos caber a la vez; conserva el tamaño de presentación del mayor y permite recorrer la secuencia. Los objetos físicamente diminutos junto a otro mayor siguen pequeños porque la escala común no cambia.

No existe un máximo arbitrario de diez objetos. La cantidad práctica depende de recursos y espacio, no de una restricción comercial innecesaria. Añadir un objeto mayor puede cambiar la escala común y reducir todos los demás. Esa transición debe ser suave y coherente. No escales cada elemento por separado para que llene su tarjeta: destruiría la promesa del comparador.

Una luna pequeña debe permanecer pequeña junto a Júpiter aunque sobre espacio en su posición. Anillos, atmósferas, halos y sombras pueden ocupar una extensión visual adicional; declara si forman parte de la medida. Saturno almacena información de sus anillos separada del diámetro del planeta. Cualquier cambio de distribución debe comprobar al menos un par de esferas con proporción conocida, objetos alargados y una comparación extrema. La estética no autoriza modificar dimensiones para equilibrar una composición.

## 14. Objetos por debajo de la resolución de pantalla

Una proporción correcta puede producir un cuerpo menor que un píxel. No se corrige inflando su diámetro. Una marca próxima a la línea de apoyo es una anotación que permite localizarlo; no es su representación física. Su nombre, medidas y acceso a información siguen siendo legibles. La advertencia sobre resolución debe ser breve y precisa, vinculada al objeto afectado, sin convertir la pantalla en un panel de instrucciones.

El motor puede omitir geometría imperceptible para ahorrar trabajo. Esa optimización no modifica valores, razones ni exportaciones. Distingue un objetivo de interacción suficientemente grande de un cuerpo físico correctamente pequeño. Los botones pueden tener un tamaño práctico independientemente de la escala. Una comparación entre longitud de Planck y universo observable conserva sentido matemático aunque sea imposible resolver simultáneamente ambos extremos en una pantalla.

Un futuro explorador logarítmico sería otra visualización y necesitaría explicar que distancias iguales expresan órdenes de magnitud. Nunca sustituyas silenciosamente una escala lineal por diámetros logarítmicos dentro de la misma comparación. También deben funcionar las selecciones vacías y con un solo objeto. En esos estados, conserva acciones claras para añadir y consultar sin recurrir a sugerencias no solicitadas, títulos promocionales ni estadísticas para rellenar el espacio disponible.

## 15. Representación ortográfica y contenido tridimensional

La escena usa una cámara ortográfica para impedir que la perspectiva haga parecer menor un objeto situado más lejos. Las coordenadas de Three.js corresponden a las dimensiones de pantalla calculadas por el diseño físico. Cada objeto dispone de un grupo propio con posición, escala, materiales y orientación. Las texturas observadas envuelven esferas o elipsoides cuando corresponde. Los modelos GLB locales pueden sustituir geometrías procedurales después de normalizar sus límites correctamente.

La rotación interactiva afecta al objeto seleccionado mediante el puntero y no a todos los cuerpos de la secuencia. La rotación automática suave se detiene para ese objeto cuando la persona toma el control. Un contorno cartográfico puede mantenerse plano dentro de la escena tridimensional; no necesita un volumen ficticio. Las distancias orbitales y controles generales de cámara no forman parte del propósito inicial.

El modo predeterminado requerido es 3D. La jerarquía de recursos prioriza el GLB disponible y los procedimientos apropiados para cuerpos o estructuras conocidos; si no existe una representación volumétrica adecuada, utiliza la imagen del objeto, y deja el vector como última alternativa. Esa preferencia no implica que todos los registros tengan reconstrucciones volumétricas detalladas. Conserva una presentación fiel al recurso existente y documenta límites en enciclopedia e inventario. Un modelo de enseñanza hecho con formas básicas puede ser útil, pero no debe anunciarse como escaneo anatómico. No construyas edificios genéricos con cajas superpuestas. La carga asíncrona conserva escala e identidad; un modelo que llega tarde no puede reaparecer después de que el usuario haya eliminado su objeto. Los modelos con preserveModelAspect se normalizan uniformemente para conservar su forma irregular; su tamaño de referencia sigue definido en la ficha.

## 16. Un único control para tres representaciones

El botón general de representación recorre tres estados: 3D, textura bidimensional de menor resolución y vector bidimensional. Al entrar sin una preferencia explícita de enlace, comienza en 3D. No mantengas botones públicos separados para texturas y 2D/3D. La acción es cíclica y su icono, título accesible y estado deben permitir entender la representación activa. No emplees un interruptor deslizante ni abras una ventana de ajustes para una operación tan sencilla.

Cambiar representación no cambia medidas, selección, orden ni identidad. El modo de textura mantiene una apariencia superficial ligera; no presupone observación fotográfica para objetos que solo disponen de ilustración. El vector conserva silueta reconocible y proporciones correctas. La enciclopedia sigue la misma representación vigente sin añadir su propio botón 3D. Si se necesita traducir estados antiguos de enlaces, centraliza esa compatibilidad para evitar combinaciones contradictorias de modo y textura.

Cuando WebGL no está disponible, se conserva la comparación vectorial y los datos. Un fallo gráfico no puede vaciar el catálogo, bloquear descargas ni borrar la selección. La alternativa aplica el mismo diseño físico y criterio subpíxel. Verifica también pérdida de contexto durante el uso, no solo ausencia inicial. Los recursos visuales siguen siendo locales para que abrir una comparación no dependa de un servidor de modelos externo.

## 17. Recursos asíncronos y liberación de memoria

Una textura o un modelo puede tardar más que la siguiente acción del usuario. Identifica cada generación de escena o utiliza un mecanismo equivalente de cancelación. Si una respuesta pertenece a una selección obsoleta, descártala y libera sus recursos. No añadas mallas antiguas a la nueva comparación. Geometrías, materiales, texturas y bucles de animación consumen memoria aunque el elemento no esté visible.

Al quitar un objeto o cerrar una vista previa, se liberan los recursos que esa instancia posee. Si se utiliza una memoria compartida de texturas, define quién es su propietario para no destruir una textura que todavía emplea otro objeto. La escena principal y la vista de enciclopedia son instancias diferentes, aunque comparten la implementación y los recursos de catálogo.

Cerrar la enciclopedia debe cancelar animación, desconectar observadores de tamaño, eliminar su lienzo y liberar memoria gráfica. Un panel que tapa la comparación puede pausar la animación principal sin borrar su estado. Las pestañas ocultas no deben seguir consumiendo actividad innecesaria. Respeta la preferencia de movimiento reducido para giros y transiciones. Comprueba repetidamente abrir, cerrar, añadir, sustituir y eliminar; una única carga correcta no detecta acumulaciones que terminarían agotando un móvil o varios contextos WebGL.

## 18. Transiciones y rendimiento

El cambio de objetos debe transmitir continuidad. Cuando cambian las proporciones calculadas, los cuerpos se acercan suavemente a sus tamaños finales en lugar de parpadear o aparecer de golpe. Utiliza interpolación dependiente del tiempo para que diferencias de frecuencia de pantalla no alteren el resultado. Limita el salto temporal al volver de una pestaña oculta. Las medidas finales pueden actualizarse inmediatamente; animar cifras intermedias aporta confusión sin mejorar el significado físico.

No construyas geometrías completas en cada fotograma. Reutiliza recursos mientras el objeto permanezca activo y cambia transformaciones. El motor actual limita la densidad de píxeles para evitar costes excesivos en móviles. Los módulos gráficos y de exportación pueden cargarse cuando se necesitan. Optimiza fondos pesados si las mediciones muestran un problema real, conservando atribución y significado de cualquier procesamiento.

El Sol requiere una recreación gráfica cuidada: superficie granular animada, corona, regiones activas irregulares y plasma con volumen y filamentos. No vuelvas a colocar toros o arcos idénticos equidistantes como pendientes alrededor de una esfera. src/solar.js utiliza shaders y geometría tridimensional para representar movimiento y turbulencia; el color y el tiempo son interpretativos y la medida corresponde a la fotosfera, no al resplandor. Sirio A y Betelgeuse tienen estilos estelares propios y no reutilizan protuberancias solares como si hubieran sido observadas en esas estrellas. Una miniatura no necesita efectos volumétricos costosos. Aumentar resolución, partículas o vistas simultáneas requiere observar su efecto en dispositivos representativos. El rendimiento incluye respuesta del catálogo, apertura de paneles y desplazamiento fluido, además de fotogramas. No sacrifiques claridad de iconos y cuerpos por llenar el selector de animaciones pesadas que el usuario no ha solicitado.

El lienzo de la escena tiene el tamaño del área visible, no el de toda la secuencia. El desplazamiento actualiza la ventana ortográfica de la cámara y la posición del lienzo, mientras las etiquetas pertenecen al documento completo. Esto evita superar los límites de textura al apilar muchos objetos. Los efectos exteriores declaran effectExtent para reservar espacio, sin modificar el diámetro físico. El móvil puede usar una textura reducida cuando su tamaño proyectado no justifica cargar un mapa de cuatro mil píxeles; el modo 3D permanece activo y no se sustituyen modelos por vectores para ahorrar trabajo. src/representation.js centraliza qué estructuras tienen un procedimiento tridimensional apropiado y cómo se conservan las proporciones de imágenes con una única medida de referencia. La escena, la escala y la enciclopedia deben usar ese mismo criterio.

## 19. Diámetros astronómicos y definiciones

Un planeta puede describirse mediante diámetro ecuatorial, polar, medio volumétrico o extensión proyectada. Son magnitudes relacionadas, pero diferentes. Las entradas planetarias iniciales emplean diámetros ecuatoriales procedentes de fichas de NASA. Las lunas importadas utilizan radios medios o ejes principales cuando están disponibles. La definición debe consultarse en detalles y enciclopedia. Actualizar una cifra implica conservar o corregir su convención, no solo sustituir el número.

Los gigantes gaseosos tienen achatamiento relevante. Los cuerpos pequeños irregulares pueden presentar ejes muy distintos. Si se mejora su elipsoide, conserva anchura, altura, profundidad y orientación apropiadas. Los límites estelares también dependen del modelo: radio fotosférico, corona y atmósfera extendida no son equivalentes. Un disco de acreción iluminado no coincide con el diámetro del horizonte de un agujero negro.

Las galaxias no poseen un borde material nítido; disco estelar, halo y contornos de brillo dan extensiones diferentes. El universo observable utiliza una extensión comóvil, no la edad multiplicada ingenuamente por la velocidad de la luz. El fondo cósmico de microondas describe radiación de una etapa temprana y no una bola material de tamaño conocido que englobe todo el universo. Estos matices aportan contenido útil sin sobrecargar la escena principal ni fingir certeza mediante imágenes pulidas.

## 20. Lunas e importación de Universal

Universal ofrece datos astronómicos y recursos locales previamente reunidos por el propietario. La importación inicial registra procedencia en data/import-provenance.json y en los registros cuando corresponde. Incluye lunas de los principales planetas y de Plutón presentes en aquella instantánea. Descubrimientos y designaciones cambian; una importación congelada no debe anunciarse como una colección eternamente completa de todas las lunas conocidas.

Antes de ampliar cobertura, compara el catálogo con referencias actuales pertinentes de JPL, NASA o la Unión Astronómica Internacional. Mantén separada la identidad confirmada de un objeto y la precisión de sus medidas. Una esfera genérica facilita representar una extensión conocida, pero no es una reconstrucción de superficie. Algunas lunas grandes disponen de cartografía observada; pequeños satélites pueden ofrecer solo estimaciones de forma o puntos observacionales.

radiusUnknown sigue siendo decisivo para interpretar los datos iniciales. Crear un modelo procedural no convierte un diámetro desconocido en conocido. Al copiar recursos mejorados, conserva la fuente observacional original además de la referencia al proyecto hermano. Comprueba tamaño del archivo, distribución permitida y compatibilidad con la publicación estática. El selector agrupa lunas por relaciones útiles, incluidos sus planetas, sin obligar a recorrer cientos de entradas al abrir la familia principal. Una búsqueda concreta debe encontrarlas globalmente.

## 21. Animales y variación biológica

El tamaño de un animal depende de individuo, sexo, edad, población, postura y método de medida. Una ballena azul representativa no es el mayor ejemplar verificado. La altura de hombro difiere de la longitud corporal; incluir cola cambia una referencia de longitud. El nombre, basis o explicación debe revelar la elección. Los ejemplos iniciales son ilustraciones educativas y sus dimensiones secundarias pueden necesitar una revisión especializada.

Las familias hacen accesibles ballenas, razas de perro, peces, insectos y animales extintos. El cuerpo principal de una ficha agrega un representante declarado; el signo más expande su contenido. Perros puede usar labrador, tiburones tiburón blanco y dinosaurios tiranosaurio como referencias familiares. Esos representantes corresponden a registros concretos y no a un supuesto promedio universal de toda la familia. Una familia amplia puede contener otras familias y entradas individuales.

Las medidas de animales extintos son estimaciones fundamentadas en evidencia incompleta. Megalodón no dispone de un ejemplar completo de tejidos blandos medido como un barco moderno. La confianza del modelo debe reflejar esa limitación. Si se incorporan imágenes realistas, utiliza recursos distribuibles, orientación consistente y proporciones adecuadas. La perspectiva fotográfica o una postura encogida no pueden sustituir silenciosamente la extensión declarada. Una imagen atractiva todavía necesita una relación geométrica comprensible con la escala.

## 22. Microorganismos y ejemplos humanos

Virus, bacterias y células suelen presentar intervalos de tamaño. Una referencia representativa puede ser útil si declara qué se ha escogido. La longitud y anchura de una bacteria no se intercambian porque su miniatura esté girada. En un virus, diámetro de cápside, envoltura y extensión entre extremos de espículas pueden ser distintos. La definición pertenece al registro y sigue accesible en los paneles informativos.

Glóbulos rojos, óvulos y espermatozoides humanos sirven como referencias reconocibles. Deben describirse con su morfología y contexto correctos. La longitud total de un espermatozoide incluye partes mucho más delgadas que su cuerpo principal. Virus y bacterias pueden organizarse dentro de microorganismos, manteniendo subfamilias que ayuden a encontrar formas y especies concretas. Las imágenes deben expresar lo que representan, no reutilizar un círculo para cualquier estructura.

El propietario mencionó embriones y fetos humanos como ampliación posible. Si se añaden, declara etapa, convención de edad gestacional, longitud cráneo-rabadilla o cráneo-talón y fuente. No es necesario construir un catálogo equivalente para embriones de todos los animales. Estas comparaciones son divulgativas, no diagnóstico médico. Un fondo microscópico difuminado es ambientación; no implica una fotografía real del objeto situado en un torrente sanguíneo con la magnificación mostrada. El contexto visual nunca reemplaza la información medible.

## 23. Átomos, moléculas y referencias de partículas

Un átomo no tiene la frontera sólida de una esfera de fabricación. Radio covalente, radio de van der Waals, radio metálico y extensión orbital responden a definiciones distintas. El ejemplo de hidrógeno inicial usa dos veces el radio de Bohr. Otras entradas declaran su convención. Compararlas requiere conservar esa información, especialmente cuando se mezclan modelos. Los elementos muy pesados pueden tener radios predichos y su estado teórico debe quedar documentado.

La familia de átomos agrega un registro concreto conocido, como carbono, al activar su cuerpo. El signo más revela elementos específicos. No inventes un tamaño medio válido para todos los átomos. Moléculas puede representar agua con su registro y dimensión declarada, sin afirmar que sea una molécula promedio. La doble hélice de ADN necesita una imagen reconocible como hélice, no un símbolo arbitrario. Las conformaciones moleculares y su criterio de extensión importan tanto como el nombre.

El electrón se trata como partícula puntual en el modelo estándar y no dispone de un diámetro rígido medido utilizable aquí. Su registro puede quedar pendiente. El radio clásico del electrón es una escala definida por fórmula, no su radio físico. La longitud de Planck es una escala natural derivada, no el menor objeto demostrado. Cuerdas, branas y otras propuestas requieren modelo y estado teórico explícitos; nunca se presentan como fotografías ni como tamaños universalmente establecidos.

## 24. Tecnología y objetos de referencia cotidiana

Las etiquetas de fabricación no siempre coinciden con dimensiones físicas. El nombre comercial de un nodo de semiconductores no determina por sí solo la longitud de puerta de un transistor. La referencia inicial de transistor declara una longitud ilustrativa, sin atribuirla a un proceso comercial concreto. Si se añaden componentes reales, indica elemento medido, documentación del fabricante y fecha pertinente. Diagonal de pantalla, envolvente de producto y tamaño de embalaje son magnitudes distintas.

Los objetos familiares permiten relacionar escalas abstractas con experiencia cotidiana. Un campo de fútbol de referencia declara sus dimensiones elegidas, pues existen configuraciones reglamentarias distintas. Una persona de referencia declara altura; no finge describir a toda la humanidad. El dibujo humano debe ser reconocible y proporcionado, sin convertir una ilustración genérica en una afirmación sobre anatomía individual.

En barcos, eslora, manga, altura sobre quilla y altura sobre agua no se mezclan. Los navíos históricos dependen de reconstrucciones y estimaciones. Santa María no tiene el mismo tipo de documentación dimensional que un crucero moderno. Transportes debe agrupar barcos, aviones y naves en estructuras expandibles, con representantes conocidos. Si una dimensión secundaria se inventó para una silueta, debe identificarse como esquemática y no exportarse como medida de ingeniería confirmada. La fidelidad visual debe mejorar sin falsear la base numérica.

## 25. Edificios y altura de comparación

Altura arquitectónica, altura total hasta la punta, cubierta y último piso ocupado pueden ser diferentes. El registro del edificio elige una convención y la declara. El catálogo inicial contiene ejemplos con distintas definiciones y algún ejemplo de altura proyectada. Una construcción en curso no posee automáticamente su altura final prevista en la fecha actual. Revisa estos estados cuando cambie la información real y conserva las fechas de referencia.

Las fuentes apropiadas incluyen operador, arquitecto, documentación técnica y bases reconocidas de edificios altos. Los modelos iniciales son ilustraciones procedurales. Su anchura puede ser esquemática y no debe parecer una medición independiente de la planta. La altura contrastada de un edificio no otorga autoridad a todos los ejes dibujados. Si se sustituye el modelo por uno más fiel, comprueba la correspondencia entre sus límites y la dimensión de comparación.

Una ampliación de edificios conocidos se organiza como carpetas individuales con fuentes, recursos y nombres adecuados. Torres, rascacielos y monumentos forman familias útiles sin crear una lista inicial interminable. Un modelo con escalones o cuerpos geométricos diferentes de la arquitectura real debe quedar identificado como ilustración. La petición de realismo no obliga a fabricar exactitud inexistente: se puede mejorar un recurso o mantenerlo pendiente, pero no adjudicarle un levantamiento métrico que nadie ha realizado.

## 26. Contornos geográficos y conservación de superficie

Las formas iniciales de países proceden de Natural Earth mediante world-atlas y tienen resolución cartográfica limitada. Cada entrada conserva boundary.geojson. La importación utiliza una proyección azimutal equivalente centrada localmente, deriva límites proyectados y calcula superficie esférica. Una proyección equivalente conserva superficie, pero no todas las distancias ni ángulos. Anchura y altura proyectadas son extensiones cartográficas, no distancias geodésicas exactas.

No emplees coordenadas de latitud y longitud directamente ni siluetas de Mercator como si mantuvieran superficies reales. Esa decisión exageraría regiones situadas en latitudes altas. La escala de contornos necesita una proyección coherente. Trata multipolígonos, islas, huecos y cruces del cambio de fecha con cuidado. Una simplificación cartográfica puede eliminar detalles relevantes para pequeñas islas y debe conservar su procedencia y resolución.

Las fronteras de un conjunto de datos expresan decisiones cartográficas y no constituyen una declaración definitiva sobre soberanía disputada. Si se añade superficie administrativa oficial, almacénala aparte de la superficie derivada de polígonos. No sobrescribas una definición con otra para evitar discrepancias. La enciclopedia debe permitir entender qué se compara. La referencia The True Size ilustra el problema de percepción por proyección, pero no obliga a copiar su interfaz ni a convertir Sizes en un mapa mundial arrastrable.

## 27. Ciudades, provincias y límites administrativos

Comparar Tokio, Bangkok, Nueva York o Berlín exige definir el territorio. Municipio, prefectura, región metropolitana, mancha urbana e isla central no abarcan la misma superficie ni población. Las entradas iniciales de ciudades nombran su alcance y pueden usar cuadrados de superficie equivalente. Esos cuadrados son una construcción explicada, no contornos reales. Un dibujo alargado inventado sería más engañoso aunque resultara atractivo.

Al sustituir una referencia equivalente por límites auténticos, consigue una geometría distribuible, registra fecha y ámbito, y aplica una proyección coherente. La población debe corresponder al mismo territorio y a un censo o estimación fechados. La densidad se calcula con población y superficie compatibles. Nunca atribuyas a una ciudad una altura media de edificios a partir de su fama, una fotografía o su densidad de habitantes.

El propietario quiere comparaciones adicionales entre miembros de una familia, pero esas propiedades se incorporan cuando existan datos. Diferencias administrativas entre países necesitan explicación accesible. Provincias y regiones siguen las mismas reglas. Es preferible ampliar ciudades con definiciones sólidas que publicar miles de nombres con rectángulos arbitrarios. Un registro pendiente de límites puede ser útil para investigación; una ciudad no debe convertirse en un objeto físicamente comparable mediante una extensión escogida únicamente para completar una ficha.

## 28. Fondos y entornos contextuales

El fondo ayuda a situar la comparación visualmente. Astronomía puede usar una imagen de la Vía Láctea; animales terrestres, marinos o microscópicos pueden sugerir entornos distintos mediante colores y recursos difuminados. No forma parte de la medida. Debe mantenerse discreto, con contraste suficiente para cuerpos, nombres, iconos y anotaciones. No necesita gran resolución ni detalles que compitan con los objetos.

La implementación inicial utiliza un recurso astronómico local y campos de color según categorías generales. El metadato de entorno puede mejorarse por objeto. Si todos comparten un hábitat, ese dato ayuda a elegir ambiente; si las categorías son muy distintas, conviene un fondo neutro. No fuerces una ballena, una galaxia y un edificio a aparecer dentro del hábitat de uno de ellos como si coexistieran físicamente.

El fondo cambia de tono con mañana, tarde o noche cuando corresponde, pero no debe alterar científicamente los colores de superficie ni ocultar objetos oscuros. Evita panoramas con perspectiva que sugieran distancias entre cuerpos, porque Sizes compara tamaños consecutivos. No descargues imágenes remotas en cada selección. Cualquier recurso ambiental se guarda localmente y conserva atribución. La ambientación funciona cuando refuerza la lectura sin convertirse en una portada decorativa que reduzca el espacio dedicado a la comparación.

## 29. Catálogo jerárquico y expansión por familias

El selector se organiza por conceptos y familias, con niveles anidados cuando son útiles. La vista inicial puede mostrar átomos, moléculas, microorganismos, animales, transportes, edificios, territorios y familias astronómicas. Dentro de animales pueden aparecer perros, ballenas, peces o dinosaurios; dentro de perros, razas. Dentro de astronomía, planetas y lunas pueden conducir a agrupaciones más concretas. No limites la estructura a una sola fila de categorías seguida de una lista plana.

Cada ficha de familia tiene dos acciones claramente distintas. Activar su cuerpo añade o sustituye con el representante real declarado. Activar el signo más expande contenido interno mediante una transición breve. El signo más de una familia no agrega ese representante. Las fichas terminales seleccionan su objeto. La expansión debe funcionar con clic, teclado y tacto; nunca depende exclusivamente de mantener el ratón encima.

La jerarquía es una capa de navegación sobre registros canónicos, no una colección duplicada de datos. Un objeto puede ser localizable en más de un recorrido sin crear copias contradictorias en SQLite. El representante debe existir y disponer de una definición válida. Si no hay miembro comparable, la familia puede abrirse o explicar esa limitación, pero no inventar un promedio físico. Mantén claro el objetivo de sustitución y conserva la posición original al cambiar un objeto.

## 30. Búsqueda global y carga progresiva

Todo el catálogo está disponible desde el selector. Se elimina el botón que alternaba entre destacados y catálogo completo. También desaparece el contador aislado de resultados como elemento decorativo. La búsqueda puede comunicar su alcance mediante etiqueta, ayuda o texto breve integrado en el campo, sin ocupar una línea adicional con estadísticas. Busca nombres de los idiomas disponibles, alias, identificadores, familias, relaciones y etiquetas pertinentes.

Una consulta global no debe quedar restringida silenciosamente por familias contraídas ni por un antiguo filtro de objetos con medidas o modelos teóricos. Las categorías visibles sirven para navegar, no para borrar contenido del catálogo. Si existe un filtro de navegación explícito, debe ser reconocible y fácil de limpiar. Normaliza acentos para localizar Júpiter con o sin tilde, sin modificar el nombre original mostrado o exportado.

Las fichas son estrechas y la cuadrícula adapta su cantidad de columnas al ancho. No fuerces tres columnas gigantes en una pantalla grande. A medida que se desplaza el contenido, se incorporan más resultados; no hace falta un botón para cargar cada bloque. Esa carga progresiva limita trabajo visual y no convierte los objetos restantes en inexistentes. Los resultados ya seleccionados se identifican y las entradas pendientes explican por qué no pueden compararse. La búsqueda vacía permite volver a explorar familias sin una operación técnica complicada.

## 31. Añadir, eliminar y sustituir en la comparación

Los controles de añadir se sitúan en los bordes izquierdo y derecho siguiendo la misma altura horizontal de los selectores de objeto en escritorio. En la secuencia vertical aparecen al principio y al final de la lista. No ocupan un lugar permanente dentro del grupo de iconos generales de la esquina. Su posición debe mantenerse comprensible en selecciones de dos objetos, secuencias largas y pantalla vacía. El control inicial inserta al principio y el final añade al final, desplazándose después hacia el elemento incorporado.

Cada objeto conserva un selector por nombre y una X para retirarlo. Sustituirlo abre el mismo catálogo jerárquico, mantiene su posición y aplica las restricciones reales de comparación. Añadir no introduce un máximo arbitrario. El estado de selección debe gestionar duplicados según la política implementada; la base inicial deduplica identificadores. Si se desea permitir instancias repetidas en el futuro, será necesario separar identidad de catálogo e identidad de instancia.

Los nombres y medidas se sitúan de forma que no tapen innecesariamente los cuerpos. Los controles conservan objetivos cómodos aunque el objeto sea diminuto. Al eliminar el último objeto, la página sigue operativa con acceso a añadir. No rellenes ese estado con publicidad, sugerencias ni estadísticas. La intención del usuario continúa siendo comparar, y la acción principal debe permitir volver a hacerlo directamente.

## 32. Enlaces de comparación y preferencias

Los identificadores seleccionados y la representación se reflejan en el fragmento de la dirección. Eso permite volver a una comparación sin servidor. Interpreta los enlaces de forma defensiva: ignora identificadores desconocidos, gestiona duplicados y no conviertas un objeto pendiente en comparable porque esté escrito en una dirección. Una selección vacía es válida. Cuando cambie el formato de representación, conserva compatibilidad razonable con enlaces anteriores que separaban modo y textura.

Idioma y tema son preferencias locales del navegador. Leer o escribir localStorage puede fallar en entornos restringidos, por lo que debe conservarse un valor razonable sin romper la aplicación. No almacenes modelos binarios ni datos personales para recordar un idioma. Tampoco conviertas cada fotograma de una animación en una entrada de historial. Los cambios de selección y modo son acciones de navegación; los movimientos de geometría no necesitan actualizar continuamente la dirección.

Si se conserva una acción discreta de compartir, copia un enlace y ofrece una alternativa seleccionable cuando falle el portapapeles. No publica información en cuentas externas ni envía mensajes. El usuario no considera compartir un elemento central del diseño; no le concedas protagonismo añadido. Rotaciones manuales pueden quedarse locales mientras no exista un formato explícito y probado que permita reproducir orientación con estabilidad.

## 33. Controles generales y arquitectura pública

El grupo superior derecho contiene acciones necesarias como representación, enciclopedia, detalles, tema, idioma e información. Los iconos utilizan recursos locales, nombres accesibles y una apariencia coherente. No se conserva una ventana de filtros generales para limitar medidas disponibles o modelos teóricos. La navegación del catálogo tiene sus propios controles compactos y el inventario tiene filtros de diagnóstico con otra finalidad.

Cada botón debe expresar su estado cuando procede. El tema no utiliza siempre un sol: mañana muestra sol, tarde un ocaso, noche luna y automático una esfera dividida en dos tonos. El idioma automático utiliza su icono neutral; una elección manual muestra la bandera acordada para esa opción. El control de representación también informa del estado activo. Evita añadir texto persistente al grupo cuando una etiqueta accesible y una ayuda breve resuelven la identificación.

No hay un control público de zoom porque el comparador adapta la escala a los cuerpos seleccionados. Los iconos generales no forman una franja de navegación. About es la sede de identidad y enlaces. El acceso interno mediante Alt y la información se mantiene discreto. No es autenticación: los datos estáticos y el documento publicado son descargables. Ninguna credencial ni información privada debe colocarse en ese panel por considerarlo oculto.

## 34. Enciclopedia compacta y coherente

La enciclopedia permite comprender qué es cada objeto, qué dimensión se compara y qué limitaciones tiene su representación. No es necesario escribir un tratado por entrada. El encabezado utiliza un título con familia y objeto, por ejemplo Planetas / Tierra. En su extremo derecho se organizan un buscador compacto, un selector compacto y la X de cierre sin cuadro. No dupliques el título en una segunda cabecera ornamental.

El contenido sigue un orden sencillo: vista del objeto, explicación y detalles. La vista emplea la representación activa del comparador. Con 3D seleccionado, Tierra y Luna muestran su escena tridimensional disponible, con rotación e interacción adecuadas; con vector, la imagen conserva proporción. Se elimina el botón propio de 3D, el distintivo de disponible y el texto redundante de textura observada. Los límites científicos siguen explicados en campos o texto donde aportan información.

La vista no estira una imagen hasta deformarla para llenar un recuadro. Utiliza límites del recurso, relación de aspecto y medidas cuando sean conocidas. En entradas pendientes puede mostrar imagen documental sin tamaño inventado. El cuerpo se desplaza sin barras visibles. La búsqueda permite encontrar otras entradas sin un bloque excesivo encima. Al cerrar, libera su escena; al cambiar de objeto, descarta cargas antiguas. La misma implementación visual evita mantener dos reconstrucciones contradictorias.

## 35. Detalles y propiedades compatibles

Detalles resume dimensiones y definiciones de los objetos seleccionados. Las propiedades adicionales aparecen cuando tienen sentido conjuntamente. Superficie es útil para territorios y densidad para ciertos cuerpos; población requiere límites administrativos y fechas compatibles. No compares cifras diferentes solo porque sean números. Pisos de un edificio, densidad planetaria y distancia de una galaxia no comparten significado ni unidad.

La implementación inicial muestra algunas propiedades cuando todos los seleccionados las tienen y pertenecen a una categoría amplia común. Esa regla puede necesitar mayor precisión por familia, unidad, definición y fecha. Cada ampliación debe revelar el criterio y conservar los valores ausentes como ausentes. Una ciudad más extensa puede tener menos habitantes; un planeta mayor puede ser menos denso. La explicación se fundamenta en datos, no en intuiciones sobre fotografías o fama.

El panel debe ser compacto, con tabla legible, X sin borde y espacio útil para valores. No añadas avisos obvios solo para rellenar. Una nota sobre razones de longitud puede ser pertinente cuando evita confundirlas con volumen, pero no debe convertirse en un bloque desproporcionado. La tabla permite desplazamiento necesario sin barras visibles. Nuevas comparaciones de masa o volumen exigen magnitudes propias; una malla ilustrativa no aporta automáticamente un volumen medido a partir del que calcular masa.

## 36. Idiomas y selección automática

La interfaz admite castellano, catalán, inglés, francés, alemán, portugués, italiano, chino, japonés e hindi. La denominación del idioma de India es hindi, no hindú. El modo inicial toma preferencias del navegador, recorre navigator.languages por prioridad y busca un idioma compatible. Si no encuentra ninguno, utiliza el idioma de reserva definido por la aplicación. Una elección manual prevalece y se guarda localmente. document.lang debe corresponder al idioma visible.

El selector de idioma es un menú pequeño junto al botón superior. No necesita una ventana grande ni una X enmarcada. Automático conserva el icono general; una opción manual cambia a la bandera definida para ella. Las banderas son ayudas de identificación y no sustituyen nombres accesibles. El menú debe seguir siendo operable por teclado y poder cerrarse sin alterar la elección anterior accidentalmente.

src/i18n.js contiene cadenas de interfaz y parte de los nombres astronómicos. Los metadatos aportan nombres y resúmenes adicionales. La integridad de diccionarios no demuestra que todo el catálogo esté traducido. Un resumen inexistente debe utilizar una reserva comprensible sin atribuir a ese idioma una traducción que no existe. Chino, japonés e hindi necesitan espacio y fuentes adecuadas. El superprompt permanece siempre en castellano, con independencia del idioma de interfaz, porque el propietario necesita comprender el documento que entrega a otro asistente.

## 37. Temas automáticos y ciclo de control

El botón de tema recorre automático, mañana, tarde y noche, sin abrir un panel de ajustes. Cada estado utiliza su icono específico. La selección automática depende de fecha y hora local del sistema de la persona, no de la zona horaria del servidor de publicación ni de una hora española fija. La implementación inicial aproxima franjas de iluminación según estación sin pedir ubicación. Eso es una regla visual, no un cálculo exacto de elevación solar en cualquier latitud.

No prometas amanecer geográficamente preciso utilizando únicamente mes y hora. Si posteriormente se solicita precisión real, harán falta una ubicación explícita o elegida y un método astronómico documentado. No se necesita geolocalización para el comportamiento básico actual. Actualiza periódicamente el tema automático para que una pestaña abierta cambie cuando corresponda. Una selección manual permanece fija hasta la siguiente acción del usuario.

Las paletas mantienen contraste en nombres, iconos, textos y campos. La escena puede conservar oscuridad suficiente para leer planetas aunque el tema de controles sea más claro. No inviertas fotografías o mapas científicos para fabricar una apariencia nocturna. Las transiciones son breves y evitan destellos de pantalla completa. Comprueba mañana, tarde, noche y automático en escritorio y móvil, además de cómo se expresa el estado accesible del botón cíclico.

## 38. Inventario como panel de control

El menú oculto se abre con Alt y el botón de información; la alternativa de teclado existente puede mantenerse. Su finalidad es que el propietario conozca todo el contenido y detecte trabajo pendiente. El encabezado incorpora título Sizes, pestañas Inventario y Superprompt y X sin cuadro en el extremo. No reserves varias líneas para un nombre repetido o explicaciones que reduzcan el área útil.

La siguiente línea reúne búsqueda, filtros de estado y calidad y botones de descarga compactos. Debajo aparece un resumen útil de registros, categorías, orígenes, avisos y estructura. Estas cifras pertenecen al control interno y no a la portada pública. La tabla conserva identidad, familia, dimensiones, definición, fuente, revisión, recursos y diagnósticos necesarios. Los problemas reales se destacan en rojo acompañados de texto o símbolos; el color solo no basta.

La revisión científica y la validación estructural son estados distintos. Un registro puede estar técnicamente correcto y aún no tener fuentes revisadas. El inventario permite filtrar revisados, no revisados, fallos y avisos según información real. No inventes auditorías ni fechas comunes para simular completitud. Un registro pendiente no desaparece: explica medidas ausentes. Las categorías y familias deben conducir al mismo registro canónico que utiliza la aplicación. El propietario debe poder identificar qué corregir y exportar ese diagnóstico.

## 39. Diagnósticos y trazabilidad de calidad

El sistema de control comprueba presencia y coherencia de datos. Entre los posibles problemas están dimensiones ausentes en objetos comparables, valores inválidos, incoherencia entre estado y medidas, recursos declarados que no existen, nombres o resúmenes requeridos vacíos, fuentes deficientes y definiciones incompletas. Diferencia un fallo estructural de una advertencia de revisión. Un registro correctamente pendiente puede requerir investigación sin ser un archivo corrupto.

Los diagnósticos deben proceder de reglas explícitas y datos observables. La lista de recursos declarados no prueba que una textura cargue ni que su licencia esté documentada. La aplicación estática puede usar información preparada durante construcción para incorporar comprobaciones de archivos. Documenta qué comprueba el diagnóstico visible y qué sigue dependiendo del proceso de validación. No anuncies comprobaciones de archivos que el navegador no ha realizado ni recibido como resultado.

El estado revisado requiere una marca o evidencia real de revisión. Inicial o no revisado es un valor honesto para importaciones sin auditoría posterior. Exporta códigos, explicación y severidad de problemas junto con los campos del objeto para que puedan revisarse fuera de la página. Los resúmenes se calculan sobre el conjunto pertinente y los filtros no modifican el catálogo. Una corrección se hace en la fuente, se regenera y desaparece del diagnóstico cuando la causa ha quedado resuelta.

## 40. Exportaciones del inventario

El inventario permite descargar XLSX, CSV, JSON y texto, además de la base SQLite publicada. Las exportaciones de tabla reflejan el filtro activo, de forma que el propietario pueda obtener solo pendientes o problemas. Las descargas de catálogo completo deben identificarse como completas para no confundirse con un subconjunto. JSON conserva metadatos y los diagnósticos pertinentes. Los formatos tabulares utilizan columnas estables, encabezados comprensibles y valores del Sistema Internacional.

Las cifras numéricas permanecen numéricas en XLSX, incluidas referencias muy pequeñas expresadas mediante notación exponencial. Un campo vacío no se convierte en cero. Los nombres y rutas conservan Unicode. No exportes una etiqueta formateada en kilómetros bajo una columna que promete metros. Un resultado sin filas sigue produciendo un archivo coherente con encabezados. El propietario puede combinar búsqueda y calidad sin perder los errores que intenta estudiar.

El escritor XLSX genera un contenedor ZIP con documentos XML adecuados, usando fflate. Escapa texto XML y trata cadenas parecidas a fórmulas como texto. CSV neutraliza valores que podrían ejecutarse como fórmulas al abrirlos. No renombres una tabla HTML como .xls. Comprueba acentos, saltos de línea, comillas, campos vacíos y notación científica. El módulo se carga cuando se requiere y no depende de un servicio de hojas de cálculo externo.

## 41. El superprompt como documento mantenido

AGENTS.md es simultáneamente una guía para colaboradores y el contexto transferible solicitado por el propietario. Explica producto, arquitectura, datos, reglas visuales, capacidades reales y expansión futura. No es una lista de comandos ni una pieza comercial. Está íntegramente en castellano salvo nombres propios, identificadores y código. No se traduce al cambiar el idioma de la aplicación. La descarga debe entregar el mismo documento mantenido en la raíz.

La construcción copia AGENTS.md al contenido publicado para que el panel interno pueda leerlo y descargarlo. No mantengas una versión breve independiente con instrucciones diferentes. Si cambia arquitectura, esquema, convención científica, interacción principal o publicación, corrige el capítulo correspondiente. No basta con añadir una nota al inicio mientras el resto sigue ordenando comportamientos opuestos. Mantén una descripción coherente del estado resultante.

La validación del repositorio exige al menos diez mil palabras sustanciales. Esa condición no autoriza repetir frases, volcar el catálogo entero ni conservar párrafos obsoletos para alcanzar la cantidad. Explica decisiones, límites, recuperación, revisión y mantenimiento con contenido útil. Un cambio menor en la medida de un animal no exige reescribirlo todo, pero una nueva convención sí debe quedar registrada. Las instrucciones actuales del usuario prevalecen y el documento no introduce permisos innecesarios para trabajo ya autorizado.

## 42. Información del producto y referencia de Nucleidos

El panel de información presenta Sizes como producto: qué permite comprender, cuál es su propósito y qué carácter divulgativo tiene. Se inspira en la organización del panel de Nucleidos que el propietario ha señalado expresamente. Antes de afirmar que se imita un detalle concreto, consulta el recurso real y distingue observación de interpretación. El contenido combina explicación clara, identidad y datos breves de versión, propósito o carácter cuando aportan orientación.

No conviertas About en una exhibición de tecnologías. SQLite, Workers, bibliotecas, ausencia de cuentas y decisiones de despliegue pertenecen a esta documentación, no a frases para vender la experiencia. Elimina textos como primera edición o catálogo ampliable si no explican algo útil al visitante. Los enlaces inferiores a Alejandro Pico Portfolio y GitHub se conservan en esta ubicación, sin repetirse públicamente fuera de ella.

El diseño debe ser cuidado, compacto y recto. El favicon puede acompañar la identidad dentro del panel. La X cierra sin recuadro. Una explicación comercial no exige un lema permanente en la comparación: es contenido solicitado para esta ventana. El título, texto y datos no necesitan ocupar varias pantallas ni grandes bloques vacíos. La versión mostrada procede de la edición real; no la inventes para aparentar evolución. La revisión gráfica actual corresponde a 0.3.0 cuando los archivos y publicación coincidan con esa edición.

## 43. Preparación y comandos de trabajo

Instala dependencias con npm ci cuando se utiliza el archivo de bloqueo sin cambios. npm install corresponde a modificaciones intencionales de entradas de dependencias. npm run dev prepara el catálogo mediante predev y arranca Vite localmente. npm run build ejecuta prebuild y crea dist. npm test ejecuta pruebas de aritmética y exportación. npm run check comprueba integridad, traducciones, archivos de publicación y extensión del superprompt. npm run test:browser verifica el resultado construido en un navegador real.

Ejecuta estos comandos desde Sizes, no desde el directorio padre compartido. Una aplicación que funciona en desarrollo todavía puede fallar por rutas o archivos omitidos al construir. No mantengas manualmente copias cuando el constructor ya sabe generarlas. Comprueba que el documento público se actualiza con el de la raíz; una versión antigua en dist no demuestra que el cambio documental haya llegado al sitio.

El script de sembrado inicial documenta una importación concreta y no es el procedimiento habitual para editar. Volver a ejecutarlo puede sobrescribir medidas y recursos revisados. Utilízalo únicamente para una migración intencional con protección de los cambios existentes. Un aviso de característica experimental de SQLite en Node puede no representar fallo. Un recurso obligatorio ausente, una entrada inválida, una base desactualizada o un enlace relativo roto sí exige resolver la causa antes de publicar.

## 44. Pruebas de proporciones y datos

Las pruebas importantes protegen el significado del producto. Tierra y Luna deben mantener la relación de sus diámetros bajo una escala común. Objetos alargados conservan su relación entre anchura y altura. Una secuencia de más de diez entradas sigue siendo válida. La longitud de Planck frente al universo observable produce transformaciones finitas y positivas, aunque la menor no se resuelva. Dimensiones desconocidas permanecen nulas y una comparación vacía no lanza errores.

No escribas pruebas que repitan una constante interna sin defender un comportamiento relevante. Si se modifica aritmética, conversión o cámara, prueba un caso que podría romper una proporción. Si se añade un modo de superficie, comprueba conservación de áreas independientemente de longitudes. Cambiar la definición de un diámetro para incluir anillos necesita nuevas etiquetas y pruebas coherentes. Las etiquetas redondeadas jamás alimentan los cálculos.

La taxonomía también necesita garantías: los representantes existen, cada objeto esperado es localizable y las expansiones no duplican ni pierden identidades. Los diagnósticos deben distinguir fallos, avisos y pendientes sin inventar revisiones. Una exportación filtrada conserva valores y problemas correctos. Adapta el alcance de comprobación al riesgo del cambio. Corregir una frase no justifica una batería nueva que refleje esa frase; un cambio de estructura física sí necesita evidencia suficiente para evitar distorsionar toda la comparación.

## 45. Verificación real en navegador

scripts/check-browser.mjs comprueba la aplicación construida mediante un servidor de vista previa. Su cobertura debe evolucionar con la interfaz requerida: selección inicial, añadir desde ambos bordes, sustituir, eliminar, ciclo de representación, familias anidadas, búsqueda global, carga progresiva, enciclopedia coherente, inventario, exportación, superprompt castellano, tema, idioma y recuperación sin WebGL. Una prueba antigua que espera botones retirados debe actualizarse al contrato nuevo, no forzar su reaparición.

La comprobación debe detectar errores de consola, rutas fallidas y solicitudes externas inesperadas. Utiliza capturas representativas como evidencia visual, pero inspecciónalas: un lienzo existente no garantiza cuerpos visibles ni proporciones correctas. Revisa nombres que se superponen, objetos deformados, fichas gigantes, controles fuera del móvil y espacios desaprovechados. Los paneles deben permitir leer y cerrar sin mostrar barras de desplazamiento.

Después de un cambio visual importante, observa al menos escritorio amplio, móvil y estados de luz distintos. Si una afirmación automatizada pasa y la imagen muestra un defecto, corrige la experiencia. Las capturas son ayudas de revisión y no recursos de producto por defecto. No afirmes que se verificó la publicación remota usando únicamente imágenes del servidor local. El resultado construido y la página publicada son niveles de comprobación diferentes que deben identificarse cuando se informa al propietario.

## 46. Accesibilidad y objetivos de interacción

Los botones tienen nombres accesibles, foco visible y comportamiento de teclado adecuado. Una X sin cuadro sigue siendo un botón y conserva un área suficiente de activación. Los iconos no dependen de que alguien entienda intuitivamente su dibujo. Las familias expresan si están expandidas y relacionan el control con su contenido. El cuerpo seleccionable y el botón más deben poder activarse por separado sin que un evento agregue un objeto al intentar expandir.

Las ventanas utilizan un mecanismo de diálogo que mantiene foco y devuelve la interacción a un punto útil al cerrarse. Escape cierra sin modificar la comparación. Los campos de búsqueda tienen etiquetas en el idioma de interfaz. Ocultar barras no elimina desplazamiento por rueda, teclado, panel táctil o gesto. Tampoco debe impedir descubrir una sección que aún no cabe dentro del panel.

En 3D, el arrastre del ratón rota el objeto señalado y la cancelación del puntero termina el gesto. En pantallas táctiles el gesto de un dedo se reserva para recorrer la comparación; no se captura para girar accidentalmente un planeta mientras se desplaza la lista. La comparación se desplaza en su propia área, sin ensanchar accidentalmente todo el documento, y cambia de eje cuando cambia la orientación. Fuentes y alturas de línea permiten todos los alfabetos ofrecidos. El movimiento reducido desactiva giros continuos y transiciones innecesarias. Un estado pendiente, fallo o selección se indica mediante texto o símbolo además del color. El usuario no necesita conocer términos como WebGL o GLB para utilizar la función principal.

## 47. Seguridad y privacidad de publicación estática

Todo lo incluido en dist puede descargarse. El menú Alt no es un sistema de protección y no debe contener claves, tokens, datos personales, notas privadas ni recursos confidenciales. La aplicación pública no requiere cuentas ni privilegios de escritura. Las credenciales de un proceso futuro, si fueran necesarias, pertenecen a la configuración protegida de su plataforma, nunca a metadatos o al superprompt. GitHub Pages utiliza su identidad de publicación prevista y no necesita un token escrito dentro de src.

Escapa cadenas de catálogo antes de incorporarlas a HTML. Un nombre con caracteres especiales se muestra como texto. Valida rutas de recursos para impedir recorridos hacia otros directorios. Mantén protección de XML y neutralización de fórmulas en exportaciones. Las fuentes externas se abren con esquemas adecuados y comportamiento explícito. No permitas que un enlace en datos se convierta en ejecución de contenido.

Revisa dependencias cuando se cambian, especialmente lectores de formatos y archivos comprimidos. Valora vulnerabilidades según uso real y prefiere versiones mantenidas. Las comprobaciones de ausencia de solicitudes externas ayudan a detectar fuentes remotas, analítica o imágenes enlazadas por accidente. Una mejora visual no justifica introducir seguimiento. El propósito es comparar tamaños con recursos del proyecto y conservar preferencias mínimas en el navegador, no construir perfiles de visitantes.

## 48. Licencias, fuentes y recursos generados

La licencia del código no sustituye las condiciones de imágenes, modelos y datos de terceros. NASA, Natural Earth, ESO, artículos científicos y proyectos hermanos tienen procedencias y términos distintos. Conserva atribución en ASSETS.md o el archivo de créditos mantenido, además de metadatos pertinentes. Que una imagen sea accesible públicamente no implica que pueda redistribuirse sin condiciones.

Los recursos generados para Sizes deben identificarse como ilustraciones. Una imagen realista generada no es observación fotográfica. El modelo geométrico de una molécula tampoco es una imagen experimental por tener apariencia convincente. Texturas planetarias observadas conservan su fuente y contexto; un modelo importado mantiene la diferencia entre reconstrucción y observación directa. Los fondos decorativos también necesitan crédito cuando corresponde.

Al optimizar una imagen, conserva atribución y registra un procesamiento relevante si afecta la interpretación. No uses enlaces remotos para evitar comprender derechos de distribución. La publicación local implica que se redistribuyen archivos. Si no puede enviarse legalmente un recurso, utiliza una ilustración propia clara o conserva pendiente ese componente. La mejora de realismo no autoriza describir regiones sintéticas como observadas. Un mapa parcial mantiene esa limitación, aunque una zona neutra o una reconstrucción explícita complete su presentación visual.

## 49. GitHub Actions y publicación

.github/workflows/pages.yml ejecuta construcción y comprobaciones en cambios a main, solicitudes de incorporación y ejecuciones manuales. Instala las dependencias, construye, prueba, valida, prepara Chromium y verifica la aplicación real. En los eventos adecuados genera el recurso de Pages y un trabajo de publicación lo despliega mediante acciones oficiales. La configuración del repositorio debe utilizar GitHub Actions como fuente de Pages.

Tener Actions activado no demuestra que un proceso concreto terminó ni que la página utiliza el archivo nuevo. Distingue cambios guardados, código subido, construcción en marcha, publicación completada y resultado remoto verificado. Después de publicar, comprueba el proceso y la dirección real cuando haya acceso. Nunca anuncies éxito porque la subida de código terminó sin error.

Conserva cambios remotos y evita forzar una rama para resolver divergencias ordinarias. Recupera e inspecciona el estado y mezcla con normalidad. Las ramas utilizan el prefijo codex/ salvo petición distinta. El flujo de ramas y solicitudes sigue las instrucciones vigentes del propietario. No crees un alojamiento de pago ni otro sitio público independiente para reemplazar el repositorio que ya ha indicado. Si un fallo ocurre durante despliegue, informa de la etapa exacta y conserva el resultado preparado para poder resolverlo sin perder trabajo.

## 50. Dependencias y decisiones de arquitectura

Three.js, sql.js y fflate son dependencias de ejecución. Vite facilita construcción y Playwright las comprobaciones de navegador. d3-geo, topojson-client y world-atlas participan en la preparación cartográfica. Conserva versiones fijadas y package-lock.json. Una actualización puede afectar gestión de color, carga de GLTF, empaquetado de Workers, ubicación de WebAssembly y herramientas de navegador. Comprueba documentación oficial y resultado real antes de atribuir comportamientos a una versión distinta.

Node 24 aporta SQLite durante preparación. Python no es una dependencia obligatoria del proceso rutinario del proyecto. Los visitantes no necesitan Node, Python ni programas gráficos de escritorio. Utilizan un navegador con JavaScript y WebGL o la alternativa SVG. No incorpores un servidor genérico mientras el producto sigue siendo un comparador estático de catálogo.

Una dependencia nueva debe resolver una necesidad concreta y justificarse frente a módulos existentes. Una pequeña acción de menú no requiere una biblioteca pesada. La calidad visual puede proceder de recursos correctos y geometría adecuada, sin acumular motores. Mantén carga diferida de capacidades opcionales y prueba compatibilidad de APIs realmente utilizadas. Un objetivo de compilación de Vite no convierte automáticamente cualquier función moderna en compatible con todos los navegadores. Documenta límites verificables sin introducir advertencias hipotéticas en cada flujo público.

## 51. Revisión científica y correcciones de contenido

La primera colección amplia constituye una base que necesita curación. Revisa grupos acotados y comprueba identidad, definición de medida, unidades, valor, incertidumbre, fuente específica, fecha, descripción y procedencia visual. Una dimensión principal contrastada no valida todas las dimensiones secundarias. Si alguna es esquemática, indícalo o sepárala de medidas verificadas. Guarda evidencia de correcciones importantes cuando una cifra cambia sustancialmente.

La validación estructural confirma que los archivos y valores cumplen reglas, pero no sabe si la longitud elegida de una ballena es representativa ni si el área urbana coincide con el territorio de su población. El inventario debe mostrar esa diferencia. Un estado revisado necesita criterios reales y fecha; no marques toda una importación como revisada por haberla generado en un mismo día.

Consulta fuentes primarias actuales cuando un hecho pueda haber cambiado. La fecha de consulta no equivale a fecha de observación, publicación o revisión. Mantén esas nociones diferenciadas cuando sean relevantes. Si una afirmación científica está en duda, conserva incertidumbre o estado pendiente sin transformar el dato en verdad mediante una imagen atractiva. La curación y la presentación avanzan conjuntamente: mejorar un dibujo sin aclarar su base puede hacer más creíble un error, por lo que ambos aspectos merecen revisión.

## 52. Incorporación de nuevas colecciones

Una solicitud de ochenta edificios conocidos, todas las lunas con medidas publicadas o varias razas de perro tiene alcances distintos. Define criterios de inclusión, fuentes probables, convenciones de medida y recursos distribuibles antes de crear carpetas. Utiliza identificadores estables y nombres canónicos ordenables. Aporta nombres y resúmenes útiles, al menos castellano e inglés mientras se amplían traducciones del contenido.

Cada objeto nuevo permanece revisable en su propia carpeta. No escondas la única fuente editable dentro de un script monolítico. Las medidas ausentes siguen nulas. Un modelo procedural se describe como tal y no recibe fidelidad observada. Incluye familia y relaciones apropiadas para que la jerarquía lo encuentre. Si se incorpora una familia nueva, declara un representante que exista y tenga una definición válida; evita elegirlo por ser el primero alfabético si eso produce un ejemplo poco reconocible.

Regenera SQLite, valida y comprueba búsqueda y recursos de miembros representativos. Una colección que añade tipo visual o convención necesita pruebas específicas. Una actualización solo de contenido no exige repetir indefinidamente todas las interacciones gráficas si no cambian. Informa por separado de entradas comparables y pendientes cuando el dato ayude a evaluar la entrega. No amplíes el alcance con miles de resultados poco documentados solo porque una fuente permite descargarlos fácilmente.

## 53. Recursos tridimensionales futuros

Modelos más fieles de animales, barcos, edificios y estructuras microscópicas pueden mejorar el producto. Los formatos autocontenidos como GLB permiten cargar mallas con materiales locales. Antes de incorporarlos, comprueba límites, ejes, origen, elementos auxiliares y escala. Un recurso creado para entretenimiento puede exagerar proporciones y no constituye evidencia científica. Las medidas del catálogo deben proceder de una fuente adecuada aunque el modelo sea únicamente ilustrativo.

La revisión actual evita animales formados por bolas cuando producen resultados poco reconocibles. Si no hay un modelo volumétrico fiable, una ilustración recortada y proporcionada puede mantenerse plana dentro de la escena 3D. Esa alternativa no finge una anatomía tridimensional detallada. Mejorar un recurso es preferible a prometer volumen con geometría incorrecta. Cuando se incorpore un modelo apropiado, la transición conserva identidad y definición.

Futuros niveles de detalle, compresión y simplificación necesitan pruebas de rendimiento. No cargues una malla enorme para un cuerpo subpíxel. Tampoco completes una cara no observada de un planeta con imagen sintética sin señalarlo en su información. Un Sol animado puede ser una ilustración físicamente inspirada; no se presenta como actividad solar en directo sin un sistema de datos diseñado expresamente. La fidelidad se documenta en enciclopedia e inventario, sin etiquetas públicas redundantes junto a cada cuerpo.

## 54. Superficie, volumen y masa como ampliaciones

La función básica compara longitudes y extensiones visibles. Un futuro modo de superficie necesita un contrato propio: formas de áreas A y B ocupan píxeles proporcionales a sus superficies y sus longitudes características cambian con raíces cuadradas. En esferas, la razón de volúmenes puede derivarse del cubo de la razón de diámetros bajo la hipótesis esférica. Una malla animal ilustrativa no proporciona un volumen corporal medido.

Masa, densidad y dimensiones no se intercambian. Calcular masa requiere datos o un modelo físico defendible, no una fotografía. Si se añaden modos nuevos, define selector, etiquetas, unidades y pruebas. No mezcles objetos escalados por longitud con otros escalados por superficie dentro de una escena sin explicar la regla. Un cuadrado equivalente de ciudad puede representar una longitud característica mientras la tabla informa de área; son representaciones relacionadas pero distintas.

Estas capacidades son futuras salvo implementación comprobada. Su incorporación no obliga a llenar la portada de controles. Encájalas en acciones existentes o paneles adecuados, manteniendo sencillo el recorrido habitual. Los datos deben permitir reproducir derivaciones y distinguir valor de fuente de valor calculado. Evita que una mejora técnica vuelva inconsistente el lenguaje visual. El propietario pide profundidad disponible, pero la primera experiencia sigue centrada en comprender tamaños sin estudiar un manual.

## 55. Orientación, límites de imagen y proporciones

Una silueta SVG puede contener mucho espacio vacío en su viewBox. Si se escala toda esa caja como dimensión física, el cuerpo dibujado queda menor de lo debido. Recorta o declara sus límites para que la extensión significativa coincida con la medida. Una ilustración realista con transparencia necesita el mismo cuidado. Sus límites alfa describen la zona dibujada y no convierten píxeles en evidencia métrica independiente.

Las imágenes nuevas pueden utilizar visual.image y visual.imageBounds para relacionar recorte y presentación. Conserva proporción y evita estirar el recurso para llenar cualquier espacio. La dimensión de catálogo gobierna escala; el recorte ayuda a colocar el dibujo correctamente. En edificios con schematicWidth la altura es la referencia métrica: displayDimensions conserva la proporción del recorte en lugar de forzarlo a una anchura esquemática antigua. Para recortes de animales y vehículos con una longitud o altura de referencia, imageScaleBasis especifica width o height. El eje de referencia conserva la medida; el transversal se obtiene de las proporciones de esa pose y se identifica como ilustrativo en auditoría. No se reescriben los valores originales para fingir que la imagen los confirma. Esa anchura o altura proyectada no pasa a ser una medida topográfica ni se utiliza para calcular superficie. La corrección se aplica cuando se muestra una imagen, y no deforma una malla GLB ni un modelo biológico tridimensional a partir de la pose de su imagen alternativa. El mismo tratamiento debe aplicarse a comparación, miniaturas y enciclopedia, con sus objetivos de tamaño diferentes. Una miniatura encajada no implica que los cuerpos principales se escalen por separado.

En GLB, un elemento oculto distante o una raíz desplazada puede alterar la caja envolvente. Inspecciona transformaciones y geometría útil antes de normalizar. Girar un objeto alargado modifica su proyección visible pero no su tamaño físico. La vista plana comienza en la orientación documentada; detalles siguen mostrando la longitud real después de rotarlo. No cambies medidas de un barco para corregir una captura en la que se orientó de frente. El arreglo pertenece a geometría, cámara u orientación.

## 56. Fechas y actualización de información

Fecha de consulta, época de observación, publicación, finalización de una obra y revisión son conceptos distintos. No uses una fecha generada para reemplazarlos todos. Designaciones de lunas cambian, cruceros entran en servicio, edificios alcanzan alturas previstas y censos se actualizan. Cada revisión utiliza fuentes pertinentes y conserva la fecha del hecho cuando afecta a su interpretación.

Una referencia de persona elegida a una altura convencional no requiere fingir una observación fechada. Una constante física puede remitir a una edición concreta de valores de referencia cuando corresponde. La hora local del navegador cambia el tema, pero no actualiza datos científicos. Abrir la página otro año no convierte automáticamente una población antigua en población actual.

Si se solicita actualizar contenido de forma periódica en el futuro, diseña una preparación controlada en el repositorio con cambios revisables y fuentes. No añadas recopilación de datos en cada navegador por iniciativa propia. Tampoco crees automatizaciones recurrentes sin una petición real. Una publicación que cambia catálogo y recursos debe considerar archivos antiguos y caché. Mantén direcciones estables donde sea posible y comprueba que la nueva edición utiliza su documento y diagnósticos correspondientes. El diseño estático sigue siendo útil cuando describe honestamente fechas, definiciones y límites.

## 57. Errores y recuperación práctica

Un error debe preservar la información útil restante. Una textura opcional fallida puede dejar una silueta o color adecuado sin perder medidas. Un catálogo obligatorio ausente debe ofrecer reintento. Una entrada inválida se identifica por su objeto en construcción. Un fallo de exportación no anuncia descarga terminada. Si falla copiar un enlace, una alternativa seleccionable permite completar esa acción.

La interfaz pública ofrece explicación breve y siguiente paso práctico. Los detalles técnicos pertenecen a registros de desarrollo e inventario, no a trazas largas dentro de botones. No captures todas las excepciones para ocultarlas y dejar una escena aparentemente funcional con datos incompletos. Un error gráfico activa alternativa vectorial. Una medida desconocida produce una explicación de pendiente. Una búsqueda sin resultados permite modificar consulta o navegar familias.

Los diagnósticos distinguen errores que comprometen funcionamiento de ausencias documentales previstas. Un satélite pendiente no debe bloquear toda publicación si cumple el contrato de desconocido. Un recurso declarado obligatorio que falta merece tratamiento de fallo. Una secuencia larga sigue operativa si un modelo opcional no carga. Comprueba que respuestas tardías o errores asíncronos no borran selección ajena. La recuperación se organiza alrededor de proporciones y datos, mientras la riqueza visual puede degradarse de manera controlada.

## 58. Favicon e identidad visual

favicon.svg permanece en la raíz por petición explícita. Su lógica combina cuerpos de tamaños distintos y una referencia común de medida. Debe entenderse a dieciséis o treinta y dos píxeles; una escena con animales, planetas, edificios y átomos resultaría ilegible. SVG facilita nitidez e inspección. La construcción prepara una copia inequívoca en la publicación y index.html la referencia mediante una ruta compatible con Pages.

La identidad se muestra en About y en la pestaña del navegador. No justifica reintroducir una cabecera de marca ni un pie con autor. El resto de la escena obtiene interés de los cuerpos. Los iconos de acciones son reconocibles, discretos y consistentes. Las miniaturas del catálogo deben describir contenido: átomo con estructura comprensible, ADN con hélice, agua con representación molecular apropiada y animales con imagen identificable.

Un mismo símbolo puede ayudar a reconocer miembros de una familia cuando resulta adecuado, pero no debe borrar diferencias importantes de forma. La petición de imágenes realistas se satisface con recursos locales correctos y procedencia clara, no con emojis arbitrarios ni círculos universales. La selección, pendiente y diagnóstico siguen distinguibles. Cambiar iconografía conserva etiquetas accesibles y no requiere una biblioteca remota. La coherencia visual apoya la comprensión de los tamaños y no compite con ella mediante decoración persistente.

La revisión de 0.3.0 añade veintidós recortes a los ocho ya existentes para cubrir las treinta fichas de vida, microorganismos y objetos; también incorpora los seis edificios. Los cuerpos con GLB disponen de quince vistas fijas obtenidas del mismo modelo mediante Three.js, sin inventar una fotografía nueva. Sus archivos y límites de transparencia se declaran en visual.image y visual.imageBounds. La fidelidad generated-realistic identifica las ilustraciones generadas, mientras los mapas institucionales y modelos NASA mantienen su procedencia y límites propios. Los prompts y referencias están en data/image-prompts-0.3.json y data/building-image-prompts-0.3.json, junto a los documentos de recursos. El ADN se representa mediante geometría de doble hélice y los átomos con estructura reconocible. Ningún recurso generado se convierte en una fotografía ni modifica por sí mismo una medida física.

## 59. Referencias del propietario y autonomía del proyecto

Las referencias incluyen el comparador espacial original, Universal, Bum, Formulas, Arteteca, Games, Nucleidos y The True Size. Cada una comunica una intención: suavidad, realismo, iconos discretos, control interno completo, panel informativo cuidado o respeto a distorsiones cartográficas. Consulta los ejemplos pertinentes antes de decir que se ha seguido su diseño. No copies código, imágenes o identidad de terceros sin comprender términos y contexto.

Universal tiene objetivos distintos, con órbitas, observadores y herramientas astronómicas. Sizes no hereda esos controles por importar lunas. Formulas aporta ideas de inventario y validación, pero sus estados específicos no se convierten automáticamente en categorías de Sizes. Nucleidos orienta la presentación del producto, no obliga a repetir explicaciones de otra materia. Las referencias informan una solución propia y mantenible.

Una descarga nueva de Sizes debe construirse de manera independiente. No enlaces recursos mediante rutas al proyecto vecino. Si se reutiliza un archivo, copia la versión necesaria y conserva procedencia. No afirmes que un panel tiene un detalle particular sin haberlo inspeccionado. El propietario ha pedido actuar y corregir; no detengas cambios rutinarios para pedir confirmación de cada elección reversible. Completa resultados concretos y comunicables, reservando preguntas para información realmente indispensable que no pueda obtenerse ni deducirse del contexto.

## 60. Criterios de terminación y dirección permanente

Una modificación termina cuando existe el comportamiento solicitado, sus datos y recursos necesarios están preparados, la documentación refleja la estructura y las comprobaciones pertinentes pasan. Una edición funcional puede estar completa mientras el catálogo a largo plazo sigue ampliándose. Explica esa distinción sin afirmar que ya existe todo objeto imaginable. No describas modelos procedurales como fotorealistas ni atribuyas traducción completa a un catálogo porque diez idiomas tengan menús.

Cambios gráficos requieren observar funcionamiento y liberación de recursos. Cambios de contenido requieren fuentes, definición y regeneración. Cambios de publicación requieren conocer el resultado del proceso real. Exportaciones necesitan archivos utilizables y unidades correctas. Un diagnóstico técnico satisfactorio no resuelve incertidumbre científica. Conserva estados honestos y explica límites materiales cuando corresponda.

La dirección permanente de Sizes es sencilla: poner algo familiar junto a algo menos familiar y hacer comprensible su tamaño relativo. La ambición de unir disciplinas se sostiene con escala común, definiciones explícitas, SQLite interno, carpetas canónicas, recursos locales, interacción accesible y documentación actual. Mantén la pantalla limpia aunque aumenten profundidad y control interno. Mejora realismo donde existan recursos adecuados, crea familias donde faciliten búsqueda y conserva el inventario como reflejo verdadero de lo que queda por hacer. No adornes una carencia con cifras o imágenes que la vuelvan menos visible.
