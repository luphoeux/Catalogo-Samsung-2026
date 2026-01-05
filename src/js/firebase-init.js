// Import configuration from the ignored file
import { firebaseConfig } from './firebase-config.js';

// Import Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
    getFirestore, 
    collection, 
    getDocs, 
    doc, 
    setDoc, 
    addDoc, 
    updateDoc, 
    deleteDoc,
    query,
    where 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { 
    getStorage, 
    ref, 
    uploadBytes, 
    getDownloadURL 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";
import { 
    getAuth, 
    GoogleAuthProvider, 
    signInWithPopup, 
    onAuthStateChanged,
    signOut 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Export services and functions for use in other files
export { 
    db, 
    storage, 
    auth, 
    googleProvider,
    collection, 
    getDocs, 
    doc, 
    setDoc, 
    addDoc, 
    updateDoc, 
    deleteDoc,
    query,
    where,
    ref, 
    uploadBytes, 
    getDownloadURL,
    signInWithPopup, 
    onAuthStateChanged,
    signOut
};
