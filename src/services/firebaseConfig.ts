
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";


// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBaQ3goHlT-UI2Q6sUq3qz5Wyk1P-FLevQ",
  authDomain: "vishu-dev-2da2c.firebaseapp.com",
  projectId: "vishu-dev-2da2c",
  storageBucket: "vishu-dev-2da2c.firebasestorage.app",
  messagingSenderId: "539680846970",
  appId: "1:539680846970:web:bad5bc0dff5e0b02d077c3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
