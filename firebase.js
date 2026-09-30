import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";

import {
  getFirestore
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

import {
  getAuth
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";


const firebaseConfig = {
  apiKey: "AIzaSyDIkkViHYfk6Fci8uNNPSB4VsSrYXx6ZpE",
  authDomain: "amc-siteflow.firebaseapp.com",
  projectId: "amc-siteflow",
  storageBucket: "amc-siteflow.firebasestorage.app",
  messagingSenderId: "869621160578",
  appId: "1:869621160578:web:ead5365bbd8e084a54329b",
  measurementId: "G-7DD9V477L2"
};


const app = initializeApp(firebaseConfig);

const firestoreDb = getFirestore(app);

const auth = getAuth(app);


export {
  firestoreDb,
  auth,
  firebaseConfig
};