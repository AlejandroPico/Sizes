# Ilustraciones arquitectónicas de Sizes · 0.3

Se han generado seis recortes independientes con la herramienta integrada `image_gen`, el 13 de octubre de 2026. Los archivos PNG conservan su canal alpha original: no se han modificado píxeles ni aplicado recortes destructivos. Los límites visibles se han inspeccionado y están declarados en los metadatos.

Son ilustraciones realistas generadas basadas en especificaciones y referencias oficiales, no fotografías, escaneos ni modelos tridimensionales. Los detalles ornamentales y las proporciones de cada ilustración no son documentación de ingeniería. La altura establece la escala; las anchuras continúan marcadas como esquemáticas.

| Objeto | Archivo final | Referencias oficiales |
|---|---|---|
| burj-khalifa | `objetos/Burj Khalifa/image-0.3.png` | [Referencia principal](https://www.burjkhalifa.ae/the-tower/architecture-design/) · [Referencia adicional](https://www.burjkhalifa.ae/en/assets/FACT-SHEET.pdf) |
| eiffel | `objetos/Eiffel Tower/image-0.3.png` | [Referencia principal](https://www.toureiffel.paris/en/the-monument/key-figures) |
| empire-state | `objetos/Empire State Building/image-0.3.png` | [Referencia principal](https://www.esbnyc.com/about/facts-figures) · [Referencia adicional](https://www.esbnyc.com/about/architecture-design) |
| sagrada-familia | `objetos/Sagrada Familia (planned height)/image-0.3.png` | [Referencia principal](https://sagradafamilia.org/en/-/una-creu-que-arriba-al-cel-de-barcelona?redirect=/en/home) · [Referencia adicional](https://sagradafamilia.org/documents/20142/1693659/SF_Booklet_01_20260227_digital_AF.pdf/a44dfe77-d5af-412f-0657-e203984acd73) |
| shanghai-tower | `objetos/Shanghai Tower/image-0.3.png` | [Referencia principal](https://www.gensler.com/projects/shanghai-tower) · [Referencia adicional](https://www.gensler.com/uploads/document/242/file/Shanghai_Tower_Facade_Design_Process_11_10_2011.pdf) |
| tokyo-skytree | `objetos/Tokyo Skytree/image-0.3.png` | [Referencia principal](https://www.tokyo-skytree.jp/about/outline/) |

Los prompts completos y la inspección del recorte de cada entrega están guardados en `data/building-image-prompts-0.3.json`. Se ha utilizado la herramienta integrada, no la alternativa CLI.

## Correcciones de medidas y alcance

- **Empire State Building:** se representa la antena actual. La altura pasa de los 381 m de la cubierta a la altura total de **443,2 m**, conversión redondeada de los **1.454 pies** publicados por el propietario. Se conserva la altura de cubierta como dato secundario. La base es `total-height`, y la anchura continúa siendo esquemática.
- **Sagrada Familia:** el nombre y la base dejan de afirmar que 172,5 m es una altura todavía proyectada. La Fundación documentó la culminación exterior de la torre de Jesucristo el **20 de febrero de 2026**. La basílica continúa en obras; la imagen reconstruye su diseño completo y no pretende ser una fotografía del estado actual. Se conserva la carpeta anterior para no alterar rutas de recursos existentes.
- **Burj Khalifa, Torre Eiffel, Shanghai Tower y Tokyo Skytree:** se mantienen alturas y bases anteriores. Torre Eiffel incluye antena; Tokyo Skytree incluye su mástil superior; Shanghai Tower conserva su remate inclinado; Burj Khalifa conserva la aguja final.

No se cambia `reviewStatus`: comprobar un recurso gráfico y corregir una referencia puntual no equivale a aprobar toda la ficha científicamente.

