import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC-8Qd9ejnIGR7rJp1c4aQJyp4DJk0GpIQ",
  authDomain: "mkrfoods2025-1b513.firebaseapp.com",
  projectId: "mkrfoods2025-1b513",
  storageBucket: "mkrfoods2025-1b513.firebasestorage.app",
  messagingSenderId: "1030575240046",
  appId: "1:1030575240046:web:aedb5669880e1158a3877f",
  measurementId: "G-Q4VWQDNT93",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);