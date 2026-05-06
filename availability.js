
(function () {
   var MAX_PLAYERS = 10;

   var GAMES = [
      {
         id: 'cas-1',
         mode: 'casual',
         detail: 'Sat · 9:00 AM · Joseph Alioto Recreation Center',
      },
      {
         id: 'cas-2',
         mode: 'casual',
         detail: 'Wed · 12:00 PM · Moraga Commons',
      },
      {
         id: 'cas-3',
         mode: 'casual',
         detail: 'Sun · 2:00 PM · Moraga Commons',
      },
      {
         id: 'cmp-1',
         mode: 'competitive',
         detail: 'Tue · 6:00 PM · Joseph Alioto Recreation Center',
      },
      {
         id: 'cmp-2',
         mode: 'competitive',
         detail: 'Thu · 7:00 PM · Joseph Alioto Recreation Center',
      },
      {
         id: 'cmp-3',
         mode: 'competitive',
         detail: 'Sun · 5:00 PM · Moraga Commons',
      },
   ];


   var ROSTER_KEY = 'pickupball_rosters_v2';

   function loadRosterMap() {
      try {
         var raw = localStorage.getItem(ROSTER_KEY);
         if (raw) return JSON.parse(raw);
      } catch (_) {}
      return null;
   }

   function saveRosterMap(map) {
      localStorage.setItem(ROSTER_KEY, JSON.stringify(map));
   }

   function getRoster(gameId) {
      var map = loadRosterMap();
      if (map && Object.prototype.hasOwnProperty.call(map, gameId)) {
         return map[gameId].slice();
      }
      return [];
   }

   function setRoster(gameId, players) {
      var map = loadRosterMap() || {};
      map[gameId] = players;
      saveRosterMap(map);
   }

   function escapeHtml(s) {
      var d = document.createElement('div');
      d.textContent = s;
      return d.innerHTML;
   }

   function render() {
      var user = window.PickupBallAuth && window.PickupBallAuth.getCurrentUser
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

      if (casualMount) {
         casualMount.innerHTML = GAMES.filter(function (g) { return g.mode === 'casual'; })
            .map(function (g) { return renderGameCard(g, user, loggedIn); })
            .join('');
      }
      if (compMount) {
         compMount.innerHTML = GAMES.filter(function (g) { return g.mode === 'competitive'; })
            .map(function (g) { return renderGameCard(g, user, loggedIn); })
            .join('');
      }

      attachHandlers(user, loggedIn);
   }

   function renderGameCard(game, user, loggedIn) {
      var roster = getRoster(game.id);
      var n = roster.length;
      var inGame = loggedIn && roster.indexOf(user) !== -1;
      var full = n >= MAX_PLAYERS;

      var namesHtml = roster.length
         ? '<ul class="player-list">' + roster.map(function (p) {
            return '<li' + (loggedIn && p === user ? ' class="player-self"' : '') + '>' + escapeHtml(p) + '</li>';
         }).join('') + '</ul>'
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
            '<button type="button" class="btn-action btn-leave" data-game-id="' + escapeHtml(game.id) + '" data-action="leave">Leave game</button>' +
            '</div>';
      } else if (full) {
         actionHtml =
            '<div class="game-actions">' +
            '<button type="button" class="btn-action btn-action-locked" disabled>This game is full (' + MAX_PLAYERS + '/' + MAX_PLAYERS + ')</button>' +
            '</div>';
      } else {
         actionHtml =
            '<div class="game-actions">' +
            '<button type="button" class="btn-action btn-join" data-game-id="' + escapeHtml(game.id) + '" data-action="join">Join game</button>' +
            '</div>';
      }

      return (
         '<article class="game-card" data-game-id="' + escapeHtml(game.id) + '">' +
         '<header class="game-card-head">' +
         '<p class="game-card-detail game-card-detail-only">' + escapeHtml(game.detail) + '</p>' +
         '</header>' +
         '<p class="player-count">Players: <strong>' + n + '</strong> / ' + MAX_PLAYERS + '</p>' +
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

            var roster = getRoster(gameId);
            if (action === 'join') {
               if (roster.length >= MAX_PLAYERS) return;
               if (roster.indexOf(user) !== -1) return;
               roster.push(user);
            } else if (action === 'leave') {
               roster = roster.filter(function (p) { return p !== user; });
            } else {
               return;
            }
            setRoster(gameId, roster);
            render();
         });
      });
   }

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
