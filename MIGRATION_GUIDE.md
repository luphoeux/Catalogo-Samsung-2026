# Guía de Migración a Firebase

Tu proyecto está configurado localmente para usar archivos .js y .xlsx. Sigue estos pasos para migrar a Firebase.

## 1. Configuración de Credenciales

Para que el frontend funcione, necesitas poner tus llaves reales en `src/js/firebase-init.js`.

1. Ve a [Firebase Console](https://console.firebase.google.com/).
2. Abre tu proyecto `samsung-catalogos`.
3. Ve a **Project Settings** (engranaje) -> **General**.
4. Baja hasta "Your apps" y copia el `firebaseConfig` object.
5. Pégalo en `src/js/firebase-init.js`.

## 2. Migración de Datos (Opcional pero Recomendado)

Para subir tus productos actuales de `products.js` a Firestore:

1. En Firebase Console, ve a **Project Settings** -> **Service Accounts**.
2. Dale click a "Generate new private key".
3. Guarda el archivo como `service-account.json` en la carpeta `scripts/`.
4. Ejecuta el script de migración:
   ```bash
   node scripts/migrate_to_firestore.js
   ```

## 3. Despliegue

Para subir tu sitio web:

```bash
npx firebase deploy
```

Esto subirá la carpeta `src` a Internet.

## Notas Importantes

- El archivo `server.js` **NO** se ejecutará en Firebase Hosting.
- Las funciones de "Guardar" en el Admin Panel dejarán de funcionar hasta que modifiquemos `admin.js` para usar `firebase-init.js` en lugar de llamar a `localhost:3000/api/...`.
