// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBc6SeYhIVBKTx8tPsQACZMSHrjSH_Jd5c",
    authDomain: "pantrytracker-b8257.firebaseapp.com",
    projectId: "pantrytracker-b8257",
    storageBucket: "pantrytracker-b8257.appspot.com",
    messagingSenderId: "624947698102",
    appId: "1:624947698102:web:a6397d7edbe079ba86c917"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app)