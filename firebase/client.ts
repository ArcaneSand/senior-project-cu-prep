// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "cu-prep.firebaseapp.com",
  projectId: "cu-prep",
  storageBucket: "cu-prep.firebasestorage.app",
  messagingSenderId: "247976550241",
  appId: "1:247976550241:web:de5774f6b5c73a63ae2f20",
  measurementId: "G-FVTLE13WNH"
};

// Initialize Firebase
const app = !getApps.length?initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);
