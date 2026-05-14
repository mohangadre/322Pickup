/**
 * Shared game rosters via Firebase Firestore (falls back to localStorage when config is empty).
 */
(function () {
   'use strict';

   var MAX_PLAYERS = 10;

   window.PICKUP_ROSTER_CACHE = window.PICKUP_ROSTER_CACHE || {};
   window.__USE_FIREBASE_ROSTERS__ = false;

   function firebaseReady() {
      return typeof firebase !== 'undefined' && typeof firebase.firestore === 'function';
   }

   function configOk() {
      var c = window.__FIREBASE_CONFIG__;
      if (!c || typeof c.apiKey !== 'string') return false;
      if (!c.apiKey.trim()) return false;
      if (!c.projectId || typeof c.projectId !== 'string' || !String(c.projectId).trim()) return false;
      return true;
   }

   function dispatchRosterUpdate() {
      try {
         window.dispatchEvent(new CustomEvent('pickup-rosters-updated'));
      } catch (_) {}
   }

   window.PickupRoster = {
      join: function (gameId, username, cb) {
         if (!window.__USE_FIREBASE_ROSTERS__ || !firebaseReady()) {
            if (cb) cb(new Error('Firebase rosters not active'));
            return;
         }
         var u = String(username).trim();
         if (!u) {
            if (cb) cb(new Error('No username'));
            return;
         }
         var db = firebase.firestore();
         var ref = db.collection('rosters').doc(gameId);
         db.runTransaction(function (transaction) {
            return transaction.get(ref).then(function (doc) {
               var players = [];
               if (doc.exists && doc.data().players) {
                  players = doc.data().players.slice();
               }
               if (players.indexOf(u) !== -1) return;
               if (players.length >= MAX_PLAYERS) return;
               players.push(u);
               transaction.set(
                  ref,
                  {
                     players: players,
                     updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                  },
                  { merge: true },
               );
            });
         })
            .then(function () {
               if (cb) cb(null);
            })
            .catch(function (e) {
               if (cb) cb(e);
            });
      },

      leave: function (gameId, username, cb) {
         if (!window.__USE_FIREBASE_ROSTERS__ || !firebaseReady()) {
            if (cb) cb(new Error('Firebase rosters not active'));
            return;
         }
         var u = String(username).trim();
         var db = firebase.firestore();
         var ref = db.collection('rosters').doc(gameId);
         db.runTransaction(function (transaction) {
            return transaction.get(ref).then(function (doc) {
               var players = [];
               if (doc.exists && doc.data().players) {
                  players = doc.data().players.slice();
               }
               players = players.filter(function (p) {
                  return p !== u;
               });
               transaction.set(
                  ref,
                  {
                     players: players,
                     updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                  },
                  { merge: true },
               );
            });
         })
            .then(function () {
               if (cb) cb(null);
            })
            .catch(function (e) {
               if (cb) cb(e);
            });
      },
   };

   if (!firebaseReady()) {
      console.info('[PickupRoster] Firebase SDK not loaded — using local rosters only.');
      return;
   }

   if (!configOk()) {
      console.info('[PickupRoster] Add your Firebase web config in firebase-config.js for shared rosters.');
      return;
   }

   try {
      if (firebase.apps.length === 0) {
         firebase.initializeApp(window.__FIREBASE_CONFIG__);
      }
      var db = firebase.firestore();
      window.__USE_FIREBASE_ROSTERS__ = true;

      db.collection('rosters').onSnapshot(
         function (snapshot) {
            window.PICKUP_ROSTER_CACHE = {};
            snapshot.forEach(function (doc) {
               var data = doc.data();
               var arr = data && data.players;
               if (!Array.isArray(arr)) arr = [];
               window.PICKUP_ROSTER_CACHE[doc.id] = arr.slice();
            });
            dispatchRosterUpdate();
         },
         function (err) {
            console.error('[PickupRoster] Firestore error:', err);
            window.__USE_FIREBASE_ROSTERS__ = false;
         },
      );
   } catch (e) {
      console.error('[PickupRoster] Init failed:', e);
      window.__USE_FIREBASE_ROSTERS__ = false;
   }
})();
