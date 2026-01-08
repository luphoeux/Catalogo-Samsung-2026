
import { initializeApp } from "firebase/app";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";
import { getAuth, connectAuthEmulator } from "firebase/auth";

// These are placeholders, for local debug with emulator most of these don't matter 
// but are needed for the SDK to initialize.
const firebaseConfig = {
  apiKey: "local-debug-key",
  authDomain: "catalogosamsung-d3832.firebaseapp.com",
  projectId: "catalogosamsung-d3832",
  storageBucket: "catalogosamsung-d3832.appspot.com",
  appId: "local-debug-app-id"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

// Connect to Emulators
if (location.hostname === "localhost" || location.hostname === "127.0.0.1") {
    console.log("Connect to Firebase Emulators");
    connectFirestoreEmulator(db, 'localhost', 8080);
    connectStorageEmulator(storage, 'localhost', 9199);
    connectAuthEmulator(auth, "http://localhost:9099");
}

export { db, storage, auth };
