import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBvIqD-zNmLVRVv2Yu5YcUmjEnSPoYpoxU",
  authDomain: "nettside2-1d0e5.firebaseapp.com",
  projectId: "nettside2-1d0e5",
  storageBucket: "nettside2-1d0e5.firebasestorage.app",
  messagingSenderId: "459166647993",
  appId: "1:459166647993:web:6e41edc74f75fb8e0fbd68",
  measurementId: "G-4CSX4251X9",
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);

// Få Firestore-databasen
export const db = getFirestore(app);
export default app;
