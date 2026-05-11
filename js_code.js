/**
 * Auth + navbar: PickupBallAuth (availability.js) plus MrOntime login/signup API + navbar UI.
 */
(function () {
   const STORAGE_USER_KEY = 'pickupball_current_user';
   /** Legacy key from earlier branch — migrated into STORAGE_USER_KEY on load */
   const LEGACY_USERNAME_KEY = 'pickupBallUsername';

   function getCurrentUser() {
      try {
         const raw = localStorage.getItem(STORAGE_USER_KEY);
         if (!raw) return null;
         const o = JSON.parse(raw);
         return typeof o.username === 'string' && o.username ? o.username : null;
      } catch {
         return null;
      }
   }

   function setCurrentUser(username) {
      const u = String(username).trim();
      if (!u) {
         localStorage.removeItem(STORAGE_USER_KEY);
         return;
      }
      localStorage.setItem(STORAGE_USER_KEY, JSON.stringify({ username: u }));
      try {
         localStorage.setItem(LEGACY_USERNAME_KEY, u);
      } catch (_) {}
   }

   function clearCurrentUser() {
      localStorage.removeItem(STORAGE_USER_KEY);
      localStorage.removeItem(LEGACY_USERNAME_KEY);
   }

   function migrateLegacySession() {
      if (getCurrentUser()) return;
      try {
         const old = localStorage.getItem(LEGACY_USERNAME_KEY);
         if (old && String(old).trim()) setCurrentUser(String(old).trim());
      } catch (_) {}
   }

   window.PickupBallAuth = {
      getCurrentUser,
      setCurrentUser,
      clearCurrentUser,
      isLoggedIn: function () {
         return !!getCurrentUser();
      },
   };

   function bindAuthLink(navUsername, authLink) {
      if (!authLink || authLink.dataset.authBound === 'true') return;
      authLink.dataset.authBound = 'true';
      authLink.addEventListener('click', function (event) {
         event.preventDefault();
         const userNow = getCurrentUser();
         if (userNow) {
            clearCurrentUser();
            if (navUsername) navUsername.textContent = '';
            authLink.textContent = 'Sign In';
            window.location.href = 'login.html';
         } else {
            window.location.href = 'login.html';
         }
      });
   }

   function updateNavbarLoginStatus() {
      const savedUsername = getCurrentUser();
      const navUsername = document.getElementById('navUsername');
      const authLink = document.getElementById('authLink');

      if (navUsername) {
         navUsername.textContent = savedUsername ? 'Logged in as: ' + savedUsername : '';
      }

      if (authLink) {
         bindAuthLink(navUsername, authLink);
         authLink.textContent = savedUsername ? 'Sign Out' : 'Sign In';
      }

      const welcome = document.getElementById('welcomeUser');
      if (welcome && savedUsername) {
         welcome.textContent = '';
      }
   }

   document.addEventListener('DOMContentLoaded', function () {
      migrateLegacySession();

      updateNavbarLoginStatus();

      const formErrors = document.getElementById('formErrors');

      const loginInput = document.getElementById('login');
      const loginPasswordInput = document.getElementById('password');
      const loginButton = document.getElementById('loginButton');

      if (loginButton && loginInput) {
         loginButton.addEventListener('click', async function (event) {
            event.preventDefault();
            const username = loginInput.value ? loginInput.value.trim() : '';
            if (!username) {
               if (formErrors) formErrors.textContent = 'Please enter a login ID.';
               return;
            }

            const errEl = formErrors || document.getElementById('formErrors');

            try {
               const response = await fetch('http://localhost:3000/login', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                     username,
                     password: loginPasswordInput ? loginPasswordInput.value : '',
                  }),
               });

               const data = await response.json();
               if (errEl) errEl.textContent = data.message || '';

               if (data.success) {
                  setCurrentUser(username);
                  updateNavbarLoginStatus();
                  window.location.href = 'index.html';
               }
            } catch (error) {
               if (errEl) errEl.textContent = '';
               setCurrentUser(username);
               updateNavbarLoginStatus();
               window.location.href = 'availability.html';
            }
         });
      }

      const fullnameInput = document.getElementById('fullname');
      const usernameInput = document.getElementById('username');
      const emailInput = document.getElementById('email');
      const phoneInput = document.getElementById('phone');
      const signupPasswordInput = document.getElementById('password2');
      const signupButton = document.getElementById('signupButton');

      if (signupButton && usernameInput) {
         signupButton.addEventListener('click', async function (event) {
            event.preventDefault();
            const errEl = document.getElementById('formErrors');

            try {
               const response = await fetch('http://localhost:3000/signup', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                     fullname: fullnameInput ? fullnameInput.value : '',
                     username: usernameInput.value,
                     email: emailInput ? emailInput.value : '',
                     phone: phoneInput ? phoneInput.value : '',
                     password: signupPasswordInput ? signupPasswordInput.value : '',
                  }),
               });

               const data = await response.json();
               if (errEl) errEl.textContent = data.message || '';

               if (data.success && usernameInput.value.trim()) {
                  setCurrentUser(usernameInput.value.trim());
                  updateNavbarLoginStatus();
                  window.location.href = 'index.html';
               }
            } catch (error) {
               if (errEl) errEl.textContent = 'Error connecting to server.';
            }
         });
      }
   });
})();
