# Samsung Catálogo 2026

Sistema de gestión de catálogos de productos Samsung con panel de administración.

## 📁 Estructura del Proyecto

```
Samsung Catalogo/
├── admin/                      # Panel de administración
│   ├── admin.html             # Interfaz del admin
│   ├── admin.js               # Lógica del admin
│   └── admin_color_modal_fragment.html
│
├── assets/                     # Recursos estáticos
│   ├── fonts/                 # Fuentes personalizadas
│   └── images/                # Imágenes del proyecto
│
├── catalog/                    # Archivos del catálogo (legacy)
│   ├── data.js
│   └── script.js
│
├── data/                       # Datos de la aplicación
│   └── csv/                   # Archivos CSV
│       ├── productos.csv      # Base de datos de productos
│       └── database_export.csv # Exportación de la BD
│
├── database/                   # Archivos Excel
│   ├── Catalogo empresa 10122025.xlsx
│   ├── Database_samsung_catalogo.xlsx
│   └── Samsung_Colores.xlsx
│
├── docs/                       # Documentación
│   ├── CSV_FORMAT.md
│   ├── DATABASE_README.md
│   ├── MEJORAS_JULIUS.md
│   ├── PERSISTENCIA.md
│   ├── README.md
│   └── SISTEMA_CATEGORIAS.md
│
├── scripts/                    # Scripts de Node.js
│   ├── download_csv.js
│   ├── extract_colors.js
│   ├── maintenance.js
│   ├── update_data_from_csv.js
│   └── ... (otros scripts)
│
├── index.html                  # Página principal del catálogo
├── script.js                   # Lógica principal
├── style.css                   # Estilos principales
├── data.js                     # Datos de productos
├── color-variables.js          # Variables de colores
├── server.js                   # Servidor Node.js
└── package.json               # Configuración de npm
```

## 🚀 Inicio Rápido

### Instalación

```bash
npm install
```

### Ejecutar el proyecto

```bash
# Servidor de desarrollo
npm start

# O usar http-server para archivos estáticos
npx http-server -p 3000 -o
```

### Acceder a la aplicación

- **Catálogo público**: http://localhost:3000/
- **Panel de administración**: http://localhost:3000/admin/admin.html

## 📝 Scripts Disponibles

```bash
# Actualizar datos desde CSV
npm run update-data

# Sincronizar desde Excel
npm run sync-from-excel

# Sincronizar a Excel
npm run sync-to-excel

# Analizar archivo Excel
npm run analyze-excel

# Crear preview CSV
npm run create-preview
```

## 🎨 Características

- ✅ Panel de administración completo
- ✅ Gestión de productos y catálogos
- ✅ Sistema de categorías
- ✅ Variables de colores personalizables
- ✅ Exportación a CSV y Excel
- ✅ Interfaz responsive
- ✅ Persistencia de datos en localStorage

## 📦 Tecnologías

- **Frontend**: HTML, CSS, JavaScript (Vanilla)
- **Backend**: Node.js
- **Datos**: CSV, Excel (xlsx)
- **Servidor**: http-server / Express

## 🔧 Mantenimiento

Los archivos CSV de ejemplo/prueba han sido eliminados para mantener el proyecto limpio:
- ❌ accesorios_gaming.csv
- ❌ catalogo_verano_2026.csv
- ❌ lanzamiento_galaxy_z.csv
- ❌ ofertas_cyber_monday.csv
- ❌ outlet_tablets.csv
- ❌ preview_catalogo.csv

Solo se mantienen los archivos CSV activos en `data/csv/`.

## 📄 Licencia

MIT

---

**Samsung Catalog v2.3** - Sistema de gestión de catálogos
