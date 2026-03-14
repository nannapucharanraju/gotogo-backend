import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBZzfr18LVvQ3t_jbXJ873POtjt1pZMPPU",
  authDomain: "gotogo-daae1.firebaseapp.com",
  projectId: "gotogo-daae1",
  appId: "1:304486869625:web:57f67fabebb3f6570902a8",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
