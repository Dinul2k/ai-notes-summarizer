import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { firebaseConfig } from "../config/firebase.config";

// Initialize once (Expo fast-refresh safe)
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0]!;
}

// Use simple memory persistence to avoid Metro issues with RN subpath
const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);

export { app, auth, db };