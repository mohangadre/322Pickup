/**
 * Lightweight client session for Pickup Ball (placeholder until backend auth).
 */
(function () {
   const STORAGE_USER_KEY = 'pickupball_current_user';

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
   }

   function clearCurrentUser() {
      localStorage.removeItem(STORAGE_USER_KEY);
   }

   window.PickupBallAuth = {
      getCurrentUser,
      setCurrentUser,
      clearCurrentUser,
      isLoggedIn: function () {
         return !!getCurrentUser();
      },
   };

   document.addEventListener('DOMContentLoaded', function () {
      var submitBtn = document.getElementById('submit');
      var loginBox = document.querySelector('.loginbox');
      if (!submitBtn || !loginBox || !loginBox.querySelector('form')) return;

      var loginInput = document.getElementById('login');
      var errEl = document.getElementById('formErrors');

      submitBtn.addEventListener('click', function (e) {
         e.preventDefault();
         var id = loginInput && loginInput.value ? loginInput.value.trim() : '';
         if (!id) {
            if (errEl) errEl.textContent = 'Please enter a login ID.';
            return;
         }
         if (errEl) errEl.textContent = '';
         setCurrentUser(id);
         window.location.href = 'availability.html';
      });
   });
})();
