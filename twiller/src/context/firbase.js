
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCu0Z1InMQX2S0WTA9ZlirooEJAe5-zxVM",
  authDomain: "twitterclone-23008.firebaseapp.com",
  projectId: "twitterclone-23008",
  storageBucket: "twitterclone-23008.firebasestorage.app",
  messagingSenderId: "322564546603",
  appId: "1:322564546603:web:306cbb2106539b7c258a6e",
  measurementId: "G-4EXKQPJ0JC"
};


const app = initializeApp(firebaseConfig);
export const auth=getAuth(app)
export default app
// const analytics = getAnalytics(app);
