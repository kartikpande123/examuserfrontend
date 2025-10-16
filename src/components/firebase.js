// Import the functions you need from the Firebase SDK
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // Import Firestore
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCvPnG3aQxCR8OuEkhISnn_jOak8y2nq0Y",
  authDomain: "exam-web-749cd.firebaseapp.com",
  databaseURL: "https://exam-web-749cd-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "exam-web-749cd",
  storageBucket: "exam-web-749cd.firebasestorage.app",
  messagingSenderId: "194373268796",
  appId: "1:194373268796:web:9f28a7ea9c980ee9c49a39",
  measurementId: "G-6R0C46VXQ5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firestore
const db = getFirestore(app); // Initialize Firestore

// Export Firestore db to use it in other parts of your app
export { db };
