# Recursos realistas de la edición 0.3

Revisión visual de 2026-10-13. Se incorporan 22 ilustraciones educativas originales mediante la herramienta integrada OpenAI ImageGen: diez animales, seis microorganismos/células y seis objetos. Los ocho recortes de la edición 0.2 se conservan; los 30 registros de estas tres categorías disponen ahora de una imagen local.

Son ilustraciones realistas generadas, no fotografías observadas, microscopías, escaneos ni modelos técnicos medidos. Los seres extintos y la Santa María son reconstrucciones interpretativas; los colores microscópicos son didácticos. Los barcos y la ISS incluyen detalles interpretativos y no sustituyen planos de ingeniería. Las referencias institucionales orientan identidad y morfología; no convierten el resultado generado en una reproducción documental.

## Archivos y encuadres

Cada imagen vive en su carpeta canónica bajo objetos. Se conserva su canal alfa sin editar píxeles, redimensionar ni recortar físicamente. visual.imageBounds declara la caja visible utilizando alfa >16 para ignorar residuos casi invisibles. visual.imageProvenance registra proveedor, fecha, naturaleza generada, observed:false y referencias donde corresponde.

Los prompts exactos, rutas relativas y verificaciones de transparencia están en [data/image-prompts-0.3.json](data/image-prompts-0.3.json). Los modelos JSON existentes se mantienen para que el motor pueda utilizar una geometría apropiada, la imagen o el vector según disponibilidad. No se añaden registros ni se cambian medidas.

| Objeto | Imagen | Dimensiones (px) | Bounds x,y,w,h |
|---|---|---:|---|
| Ant (5 mm example) | [ant](objetos/Ant%20(5%20mm%20example)/image.png) | 1536 × 1024 | 45,180,1425,705 |
| Chihuahua | [dog-chihuahua](objetos/Chihuahua/image.png) | 1536 × 1024 | 196,10,1179,988 |
| Common squid | [squid](objetos/Common%20squid/image.png) | 1774 × 887 | 24,153,1733,551 |
| Giant squid | [giant-squid](objetos/Giant%20squid/image.png) | 2172 × 724 | 22,26,2136,666 |
| Giraffe | [giraffe](objetos/Giraffe/image.png) | 1312 × 1199 | 112,12,1097,1164 |
| Humpback whale | [humpback](objetos/Humpback%20whale/image.png) | 1950 × 807 | 22,82,1905,648 |
| Impala | [antelope](objetos/Impala/image.png) | 1312 × 1199 | 107,4,1109,1167 |
| Megalodon | [megalodon](objetos/Megalodon/image.png) | 1942 × 809 | 27,13,1904,782 |
| Sperm whale | [sperm-whale](objetos/Sperm%20whale/image.png) | 1983 × 793 | 41,184,1920,418 |
| Wild boar | [boar](objetos/Wild%20boar/image.png) | 1536 × 1024 | 35,73,1468,880 |
| Escherichia coli | [ecoli](objetos/Escherichia%20coli/image.png) | 1774 × 887 | 42,197,1681,527 |
| Human ovum | [ovum](objetos/Human%20ovum/image.png) | 1254 × 1254 | 80,79,1094,1088 |
| Human red blood cell | [red-blood-cell](objetos/Human%20red%20blood%20cell/image.png) | 1312 × 1199 | 76,83,1189,1005 |
| Human sperm cell | [sperm](objetos/Human%20sperm%20cell/image.png) | 2172 × 724 | 49,278,2075,150 |
| Influenza virus | [influenza](objetos/Influenza%20virus/image.png) | 1254 × 1254 | 60,57,1139,1135 |
| SARS-CoV-2 | [sars-cov-2](objetos/SARS-CoV-2/image.png) | 1254 × 1254 | 17,23,1221,1207 |
| Airbus A380 | [a380](objetos/Airbus%20A380/image.png) | 1312 × 1199 | 6,11,1300,1162 |
| Football pitch (105 × 68 m) | [football-field](objetos/Football%20pitch%20(105%20×%2068%20m)/image.png) | 1536 × 1024 | 42,78,1453,862 |
| International Space Station | [iss](objetos/International%20Space%20Station/image.png) | 1536 × 1024 | 46,45,1448,927 |
| Santa María (reconstruction) | [santa-maria](objetos/Santa%20María%20(reconstruction)/image.png) | 1536 × 1024 | 10,10,1520,986 |
| Titanic | [titanic](objetos/Titanic/image.png) | 2172 × 724 | 24,102,2129,524 |
| Icon of the Seas | [icon-of-the-seas](objetos/Icon%20of%20the%20Seas/image.png) | 1983 × 793 | 13,262,1958,381 |

## Referencias de objetos

- A380: [Airbus](https://www.airbus.com/en/products-services/commercial-aircraft/passenger-aircraft/a380). Se corrige el enlace previo de su ficha, que apuntaba por error a Icon of the Seas. Vista cenital para relacionar envergadura y longitud.
- Campo de fútbol: [IFAB, The field of play](https://www.theifab.com/laws/latest/the-field-of-play/). Vista cenital, eje largo horizontal.
- ISS: [NASA, Facts and Figures](https://www.nasa.gov/international-space-station/space-station-facts-and-figures/). Representación de conjunto; detalles no levantados ni contados como un plano técnico.
- Santa María: [Royal Museums Greenwich, reconstrucción](https://www.rmg.co.uk/collections/objects/rmgc-object-153072). Reconstrucción histórica plausible, no atribución de aspecto exacto al original.
- Titanic: [Royal Museums Greenwich, modelo histórico](https://www.rmg.co.uk/collections/objects/rmgc-object-67368). Perfil con cuatro chimeneas y casco completo.
- Icon of the Seas: [Royal Caribbean Press Center](https://royalcaribbeanpresscenter.com/Icon). Reconstrucción ilustrativa del crucero, con detalles interpretativos.

## Alcance de la comprobación y trabajo pendiente

Se comprueban existencia local, RGBA, presencia de transparencia total, límites alfa y visualización de cada salida generada. Esta revisión completa las imágenes faltantes de life, micro y objects; no valida científicamente dimensiones, taxonomía o cada detalle anatómico/técnico. Los estados reviewStatus existentes no se elevan automáticamente. Continúan pendientes modelos 3D anatómicos/constructivos fiables y referencias específicas de medidas donde el inventario ya indique carencias. El proceso principal debe regenerar SQLite y verificar el comparador después de integrar estos metadatos.

## Escala de los recortes

Los recortes de animales, microorganismos y barcos declaran visual.imageScaleBasis: height para jirafa, width para los demás recursos nuevos de esos grupos. El motor conserva proporción original y ancla la extensión de referencia; no estira el dibujo para convertir el eje secundario ilustrativo en una medición. Los apéndices, cuernos, postura, flippers o flagelo pueden ampliar la silueta. visual.note, en castellano e inglés, explica esa convención. A380, campo e ISS mantienen el contrato de sus dos ejes sin esta ancla. Los modelos tridimensionales apropiados usan su propio contrato, independientemente de esta alternativa de imagen.

Las ediciones de Titanic e Icon of the Seas mejoran la proporción inicial mediante ImageGen; sus prompts de edición se conservan en el manifiesto. La edición propuesta del campo se rechazó porque no mejoró la proporción, y se conserva la primera imagen. Ninguna corrección alteró las dimensiones del catálogo.
