/**
 * Copy this object from Firebase Console → Project settings → Your apps (Web).
 * 1. Create a Firebase project at https://console.firebase.google.com
 * 2. Add a Web app and paste the config below.
 * 3. Build → Firestore Database → Create database → Start in test mode (or use rules below for demos).
 *
 * Firestore security (demo — tighten for production):
 * rules_version = '2';
 * service cloud.firestore {
 *   match /databases/{database}/documents {
 *     match /rosters/{gameId} {
 *       allow read, write: if true;
 *     }
 *   }
 * }
 */
window.__FIREBASE_CONFIG__ = {
   apiKey: "AIzaSyAtrC7W504qppgc-OKpXLzPc2wE5qi5bq0",
   authDomain: "pickup-ab4ee.firebaseapp.com",
   projectId: "pickup-ab4ee",
   storageBucket: "pickup-ab4ee.firebasestorage.app",
   messagingSenderId: "981476415594",
   appId: "1:981476415594:web:213cb5410326485f979213",

};
