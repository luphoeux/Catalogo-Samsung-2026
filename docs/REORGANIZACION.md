# Reorganización del Proyecto - Samsung Catálogo

## 📅 Fecha: 12 de diciembre de 2025

## ✅ Cambios Realizados

### 1. Archivos CSV Eliminados

Se eliminaron **6 archivos CSV** que no se estaban utilizando:

- ❌ `accesorios_gaming.csv` - Datos de ejemplo
- ❌ `catalogo_verano_2026.csv` - Datos de ejemplo
- ❌ `lanzamiento_galaxy_z.csv` - Datos de ejemplo
- ❌ `ofertas_cyber_monday.csv` - Datos de ejemplo
- ❌ `outlet_tablets.csv` - Datos de ejemplo
- ❌ `preview_catalogo.csv` - Archivo vacío/placeholder

### 2. Archivos CSV Mantenidos

Se conservaron **2 archivos CSV** activos en `data/csv/`:

- ✅ `productos.csv` - Base de datos principal de productos
- ✅ `database_export.csv` - Exportación de la base de datos

### 3. Nueva Estructura de Carpetas

```
Samsung Catalogo/
├── admin/          ← Panel de administración
├── assets/         ← Recursos estáticos (fonts, images)
├── catalog/        ← Archivos del catálogo (legacy)
├── data/           ← Datos de la aplicación
│   └── csv/        ← Archivos CSV activos
├── database/       ← Archivos Excel
├── docs/           ← Documentación
└── scripts/        ← Scripts de Node.js
```

### 4. Archivos Movidos

#### Admin
- `admin.html` → `admin/admin.html`
- `admin.js` → `admin/admin.js`
- `admin_color_modal_fragment.html` → `admin/admin_color_modal_fragment.html`

#### Assets
- `fonts/` → `assets/fonts/`
- `images/` → `assets/images/`

#### Data
- `productos.csv` → `data/csv/productos.csv`
- `database_export.csv` → `data/csv/database_export.csv`

#### Docs
- `*.md` → `docs/*.md` (todos los archivos de documentación)

#### Catalog
- `catalog-template/` → `catalog/` (renombrado y simplificado)

### 5. Rutas Actualizadas

Se actualizaron las rutas en `admin/admin.html`:

```html
<!-- Antes -->
<script src="color-variables.js"></script>
<script src="data.js"></script>
<script src="admin.js"></script>

<!-- Después -->
<script src="../color-variables.js"></script>
<script src="../data.js"></script>
<script src="admin.js"></script>
```

### 6. Archivos Creados

- ✅ `README.md` - Documentación principal actualizada
- ✅ `.gitignore` - Configuración de Git actualizada
- ✅ `docs/REORGANIZACION.md` - Este archivo

## 🎯 Beneficios

1. **Organización mejorada**: Estructura de carpetas clara y lógica
2. **Menos archivos**: Eliminación de archivos CSV no utilizados
3. **Mejor mantenibilidad**: Separación clara de responsabilidades
4. **Documentación actualizada**: README con la nueva estructura
5. **Control de versiones**: .gitignore actualizado

## 🚀 Cómo Usar

### Acceder al catálogo público
```
http://localhost:3000/
```

### Acceder al panel de administración
```
http://localhost:3000/admin/admin.html
```

### Ejecutar scripts
```bash
npm run update-data
npm run sync-from-excel
npm run sync-to-excel
```

## ⚠️ Notas Importantes

1. El servidor debe ejecutarse desde la raíz del proyecto
2. Las rutas relativas en `admin.html` ahora apuntan a `../` para acceder a archivos en la raíz
3. Los archivos CSV activos están en `data/csv/`
4. La documentación está en `docs/`

## 📝 Próximos Pasos Sugeridos

1. Actualizar scripts en `scripts/` para usar las nuevas rutas de CSV
2. Considerar mover `export_to_csv.js` a la carpeta `scripts/`
3. Revisar y actualizar referencias a archivos en otros scripts
4. Crear un script de migración para futuros cambios de estructura

---

**Reorganización completada exitosamente** ✨
