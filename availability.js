
(function () {
   var MAX_PLAYERS = 10;

   function getDefs() {
      return typeof window.pickupGames !== 'undefined'
         ? window.pickupGames.defs
         : window.PICKUP_GAME_DEFINITIONS || [];
   }

   function getRoster(gameId) {
      return typeof window.pickupGames !== 'undefined'
         ? window.pickupGames.getRoster(gameId)
         : [];
   }

   function setRoster(gameId, players) {
      if (typeof window.pickupGames !== 'undefined') {
         window.pickupGames.setRoster(gameId, players);
      }
   }

   function formatDetail(game) {
      if (typeof window.pickupGames !== 'undefined' && window.pickupGames.formatAvailabilityDetail) {
         return window.pickupGames.formatAvailabilityDetail(game);
      }
      return game.location || '';
   }

   function escapeHtml(s) {
      var d = document.createElement('div');
      d.textContent = s;
      return d.innerHTML;
   }

   function render() {
      var defs = getDefs();
      var user =
         window.PickupBallAuth && window.PickupBallAuth.getCurrentUser
            ? window.PickupBallAuth.getCurrentUser()
            : null;
      var loggedIn = !!user;

      var casualMount = document.getElementById('casual-games-list');
      var compMount = document.getElementById('competitive-games-list');
      var sessionLabel = document.getElementById('session-label');
      var logoutLink = document.getElementById('logout-link');

      if (sessionLabel) {
         sessionLabel.textContent = loggedIn
            ? 'Signed in as ' + user + '.'
            : 'You are not signed in. Join and leave actions are disabled until you log in.';
      }
      if (logoutLink) {
         logoutLink.style.display = loggedIn ? 'inline' : 'none';
      }

      function renderColumn(mountEl, mode) {
         if (!mountEl) return;
         mountEl.innerHTML = defs
            .filter(function (g) {
               return g.mode === mode;
            })
            .map(function (g) {
               return renderGameCard(g, user, loggedIn);
            })
            .join('');
      }

      renderColumn(casualMount, 'casual');
      renderColumn(compMount, 'competitive');

      attachHandlers(user, loggedIn);
   }

   function renderGameCard(game, user, loggedIn) {
      var roster = getRoster(game.id);
      var n = roster.length;
      var inGame = loggedIn && roster.indexOf(user) !== -1;
      var full = n >= MAX_PLAYERS;

      var namesHtml = roster.length
         ? '<ul class="player-list">' +
           roster.map(function (p) {
              return '<li' + (loggedIn && p === user ? ' class="player-self"' : '') + '>' + escapeHtml(p) + '</li>';
           }).join('') +
           '</ul>'
         : '<p class="player-empty">No players yet.</p>';

      var actionHtml;
      if (!loggedIn) {
         actionHtml =
            '<div class="game-actions">' +
            '<button type="button" class="btn-action btn-action-locked" disabled title="Log in on the Login page to join or leave games.">Sign in to join</button>' +
            '</div>';
      } else if (inGame) {
         actionHtml =
            '<div class="game-actions">' +
            '<button type="button" class="btn-action btn-leave" data-game-id="' +
            escapeHtml(game.id) +
            '" data-action="leave">Leave game</button>' +
            '</div>';
      } else if (full) {
         actionHtml =
            '<div class="game-actions">' +
            '<button type="button" class="btn-action btn-action-locked" disabled>This game is full (' +
            MAX_PLAYERS +
            '/' +
            MAX_PLAYERS +
            ')</button>' +
            '</div>';
      } else {
         actionHtml =
            '<div class="game-actions">' +
            '<button type="button" class="btn-action btn-join" data-game-id="' +
            escapeHtml(game.id) +
            '" data-action="join">Join game</button>' +
            '</div>';
      }

      var detailLine = formatDetail(game);

      return (
         '<article class="game-card' +
         (inGame ? ' game-card--joined' : '') +
         '" data-game-id="' +
         escapeHtml(game.id) +
         '">' +
         '<header class="game-card-head">' +
         '<p class="game-card-detail game-card-detail-only">' +
         escapeHtml(detailLine) +
         '</p>' +
         '</header>' +
         '<p class="player-count">Players: <strong>' +
         n +
         '</strong> / ' +
         MAX_PLAYERS +
         '</p>' +
         namesHtml +
         actionHtml +
         '</article>'
      );
   }

   function attachHandlers(user, loggedIn) {
      if (!loggedIn || !user) return;

      document.querySelectorAll('.btn-join[data-game-id], .btn-leave[data-game-id]').forEach(function (btn) {
         btn.addEventListener('click', function () {
            var gameId = btn.getAttribute('data-game-id');
            var action = btn.getAttribute('data-action');
            if (!gameId) return;

            function afterWrite(err) {
               if (err) {
                  console.error('[Availability] Roster update failed:', err);
               }
               render();
            }

            if (window.__USE_FIREBASE_ROSTERS__ && window.PickupRoster) {
               if (action === 'join') {
                  window.PickupRoster.join(gameId, user, afterWrite);
               } else if (action === 'leave') {
                  window.PickupRoster.leave(gameId, user, afterWrite);
               }
               return;
            }

            var roster = getRoster(gameId);
            if (action === 'join') {
               if (roster.length >= MAX_PLAYERS) return;
               if (roster.indexOf(user) !== -1) return;
               roster.push(user);
            } else if (action === 'leave') {
               roster = roster.filter(function (p) {
                  return p !== user;
               });
            } else {
               return;
            }
            setRoster(gameId, roster);
            render();
         });
      });
   }

   window.addEventListener('pickup-rosters-updated', function () {
      render();
   });

   document.addEventListener('DOMContentLoaded', function () {
      var logoutLink = document.getElementById('logout-link');
      if (logoutLink) {
         logoutLink.addEventListener('click', function (e) {
            e.preventDefault();
            if (window.PickupBallAuth) window.PickupBallAuth.clearCurrentUser();
            render();
         });
      }
      render();
   });
})();
