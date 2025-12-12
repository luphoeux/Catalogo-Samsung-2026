# Sistema de Base de Datos Excel

## 📋 Descripción

El sistema ahora usa `database/Database_samsung_catalogo.xlsx` como **fuente de verdad** para todos los datos.

## 📊 Estructura del Excel

### Hoja 1: `id1_productos`
Contiene todos los productos del catálogo.

**Columnas:**
- `id`: ID único del producto
- `name`: Nombre del producto
- `category`: Categoría (key)
- `price`: Precio actual
- `originalPrice`: Precio original (0 si no hay descuento)
- `link`: URL del producto
- `description`: Descripción
- `badge`: Etiqueta (texto plano)
- `sku`: SKU principal
- `image`: URL de imagen principal
- `variants_count`: Número de variantes de color
- `storage`: Capacidades de almacenamiento

### Hoja 2: `id2_colores`
Contiene la paleta de colores disponibles.

**Columnas:**
- `nombre`: Nombre del color (ej: "Azul Metálico")
- `hex`: Código hexadecimal (ej: "#3c5b8a")
- `preview`: Vista previa del color

### Hoja 3: `id3_categorias`
Contiene las categorías de productos.

**Columnas:**
- `key`: ID de la categoría (ej: "smartphones")
- `nombre`: Nombre visible (ej: "Smartphones")
- `icono`: Icono o identificador
- `productos`: Cantidad de productos (calculado automáticamente)

### Hoja 4: `id4_etiquetas`
Contiene las etiquetas/badges disponibles.

**Columnas:**
- `texto`: Texto del badge (ej: "Nuevo", "Oferta")
- `sistema`: "Sí" o "No" (indica si es editable)

## 🔄 Scripts Disponibles

### 1. Sincronizar desde Excel → Sistema
```bash
node scripts/sync-from-excel.js
```

**Qué hace:**
- Lee el Excel
- Actualiza `data.js` con los productos
- Actualiza `colors.js` con los colores
- Actualiza `categories.js` con las categorías
- Actualiza `badges.js` con las etiquetas

**Cuándo usar:**
- Después de editar el Excel manualmente
- Al iniciar el proyecto
- Para restaurar datos desde el Excel

### 2. Sincronizar desde Sistema → Excel
```bash
node scripts/sync-to-excel.js
```

**Qué hace:**
- Lee los archivos JS del sistema
- Actualiza el Excel con los cambios
- Crea un backup automático

**Cuándo usar:**
- Después de hacer cambios en el admin
- Antes de compartir el Excel
- Para crear un backup

### 3. Analizar estructura del Excel
```bash
node scripts/analyze-excel.js
```

**Qué hace:**
- Muestra la estructura del Excel
- Lista las hojas y columnas
- Muestra ejemplos de datos

## 📝 Flujo de Trabajo

### Opción A: Editar en Excel
1. Abrir `database/Database_samsung_catalogo.xlsx`
2. Editar los datos en las hojas correspondientes
3. Guardar el Excel
4. Ejecutar: `node scripts/sync-from-excel.js`
5. Recargar el admin en el navegador

### Opción B: Editar en el Admin
1. Hacer cambios en el panel de administración
2. Los cambios se guardan en `data.js`, `colors.js`, etc.
3. Ejecutar: `node scripts/sync-to-excel.js`
4. El Excel se actualiza automáticamente

## 🔒 Backups

Cada vez que se ejecuta `sync-to-excel.js`, se crea un backup automático:
- Ubicación: `backups/Database_samsung_catalogo.YYYY-MM-DD.backup.xlsx`
- Formato: Fecha en el nombre del archivo

## ⚠️ Notas Importantes

1. **Productos con Variantes**: Las variantes de color se mantienen en `data.js` y NO se sincronizan al Excel (son demasiado complejas para Excel)

2. **IDs Únicos**: Nunca cambies los IDs de los productos en el Excel

3. **Formato de Categorías**: Usa el formato `key` correcto (minúsculas, guiones bajos)

4. **Badges**: Solo texto plano, los estilos se aplican automáticamente

5. **Colores**: Usa formato hexadecimal (#RRGGBB)

## 🚀 Comandos Rápidos

```bash
# Importar desde Excel
npm run sync-from-excel

# Exportar a Excel
npm run sync-to-excel

# Ver estructura
npm run analyze-excel
```

## 📂 Archivos Generados

- `data.js` - Productos
- `colors.js` - Colores
- `categories.js` - Categorías
- `badges.js` - Etiquetas
- `backups/*.xlsx` - Backups automáticos
