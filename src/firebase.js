//import { initializeApp } from 'firebase/app';
//import { getFirestore } from 'firebase/firestore';
//import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCuDx2u6ismS9sDuXHCG8RVtYQUyxtVMdU",
  authDomain: "smartstock-6fb23.firebaseapp.com",
  projectId: "smartstock-6fb23",
  storageBucket: "smartstock-6fb23.firebasestorage.app",
  messagingSenderId: "34425306401",
  appId: "1:34425306401:web:0aaff54be62a28af251260",
  measurementId: "G-GC1R46FWWD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore and Auth
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };

