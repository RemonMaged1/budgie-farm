import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// ⚠️ استبدل القيم دي باللي نسخته من Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAGo3pdpPzRRDLKdpqE9dDXwTQMMwDrq_Q",
  authDomain: "budgie-farm.firebaseapp.com",
  projectId: "budgie-farm",
  storageBucket: "budgie-farm.firebasestorage.app",
  messagingSenderId: "994188086598",
  appId: "1:994188086598:web:08022d60476a9edd5a2947"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);