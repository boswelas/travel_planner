import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBBfOZvahIPuCOv7Hzy8z_GByGdzGYq3h0",
  authDomain: "travelapp-9e26b.firebaseapp.com",
  projectId: "travelapp-9e26b",
  storageBucket: "travelapp-9e26b.appspot.com",
  messagingSenderId: "681955749548",
  appId: "1:681955749548:web:33f3cb8e77f4274b5cb909"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth();
export const storage = getStorage(app);

