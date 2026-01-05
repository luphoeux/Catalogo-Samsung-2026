# Product Update Scripts

Este conjunto de scripts permite actualizar masivamente los productos en Firestore con información del Excel (SKU, colores e imágenes).

## 📋 Proceso Completo

### 1. Preparación Offline (Ya completado ✅)

```bash
node scripts/prepare_updates_offline.js
```

Este script:

- ✅ Lee los 700 productos del archivo Excel `Productos-de-la-Familia2025-12-01.xlsx`
- ✅ Detecta el color de cada producto basándose en el SKU
- ✅ Genera un archivo JSON con todas las actualizaciones preparadas
- ✅ Crea un reporte detallado con estadísticas

**Archivos generados:**

- `scripts/product_updates_offline.json` - Actualizaciones listas para aplicar
- `scripts/update_report_offline.txt` - Reporte con estadísticas

### 2. Revisión de Resultados

Revisa el archivo `scripts/update_report_offline.txt` para ver:

- Total de productos: **700**
- Productos con imágenes: **700** (100%)
- Distribución de colores:
  - Blanco: 649 (92.7%)
  - Azul: 23 (3.3%)
  - Negro: 17 (2.4%)
  - Plateado: 6 (0.9%)
  - Oro Rosa: 4 (0.6%)
  - Rojo: 1 (0.1%)

### 3. Aplicación de Actualizaciones (Cuando la cuota de Firestore esté disponible)

```bash
node scripts/apply_product_updates.js
```

Este script:

- Lee el archivo `product_updates_offline.json`
- Actualiza los productos en Firestore en lotes de 500
- Maneja errores de cuota automáticamente
- Genera un log de errores si es necesario

**IMPORTANTE:** Este script requiere que la cuota de Firestore esté disponible. Si encuentras el error "Quota exceeded", espera 24 horas y vuelve a intentar.

## 🎯 Ejemplo: Producto de Prueba

**Producto:** Split wind-free, inverter, 9000 btu, wi-fi, frío & calor

**Datos detectados:**

- SKU: `AR09TSEAAWK/ZS`
- Color: `Blanco` (detectado automáticamente)
- Imagen: `https://samsung-bolivia.s3.amazonaws.com/product-family-item-image/normal/product-family-item-image_6x183S5dUuNs24atOlfL.png`

## 🔍 Detección de Colores

El script detecta colores automáticamente basándose en:

1. **Patrones en el SKU:**

   - `WH` → Blanco
   - `BK` → Negro
   - `SL` → Plateado
   - `GR` → Gris
   - `BL` → Azul
   - etc.

2. **Palabras clave en el nombre del producto:**

   - "Negro", "Black" → Negro
   - "Blanco", "White" → Blanco
   - "Gris", "Gray" → Gris
   - etc.

3. **Color por defecto:** Si no se detecta ningún patrón, se asigna **Blanco**

## 📊 Estructura de Datos

Cada actualización incluye:

```json
{
  "productId": "AR09TSEAAWK-ZS",
  "productName": "Split wind-free, inverter, 9000 btu, wi-fi, frío & calor",
  "sku": "AR09TSEAAWK/ZS",
  "detectedColor": "Blanco",
  "imageUrl": "https://...",
  "colorData": {
    "id": "c007",
    "colorId": "c007",
    "name": "Blanco",
    "hex": "#f5f7f6",
    "sku": "AR09TSEAAWK/ZS",
    "images": ["https://..."],
    "image": "https://..."
  }
}
```

## ⚠️ Notas Importantes

1. **Cuota de Firestore:** El plan gratuito tiene límites de lectura/escritura. Si se agota, espera 24 horas.

2. **Backup:** Antes de aplicar las actualizaciones masivas, considera hacer un backup de Firestore.

3. **Validación:** Revisa el reporte antes de aplicar las actualizaciones para asegurarte de que la detección de colores es correcta.

4. **Productos no encontrados:** Si un producto del Excel no existe en Firestore, se registrará en el log de errores pero no detendrá el proceso.

## 🚀 Próximos Pasos

1. ✅ Revisar `scripts/update_report_offline.txt`
2. ⏳ Esperar a que la cuota de Firestore se restablezca (24 horas desde el último error)
3. ▶️ Ejecutar `node scripts/apply_product_updates.js`
4. ✅ Verificar en el admin panel que los productos tienen SKU, color e imagen
5. 🎉 ¡Listo!
