/**
 * Shared pickup game definitions + roster storage (availability + schedule).
 */
(function (global) {
   'use strict';

   /** 0 Sun … 6 Sat */
   var DEFS = [
      {
         id: 'cas-1',
         mode: 'casual',
         weekday: 6,
         hour: 9,
         minute: 0,
         location: 'Joseph Alioto Recreation Center',
      },
      {
         id: 'cas-2',
         mode: 'casual',
         weekday: 3,
         hour: 12,
         minute: 0,
         location: 'Moraga Commons',
      },
      {
         id: 'cas-3',
         mode: 'casual',
         weekday: 0,
         hour: 14,
         minute: 0,
         location: 'Moraga Commons',
      },
      {
         id: 'cmp-1',
         mode: 'competitive',
         weekday: 2,
         hour: 18,
         minute: 0,
         location: 'Joseph Alioto Recreation Center',
      },
      {
         id: 'cmp-2',
         mode: 'competitive',
         weekday: 4,
         hour: 19,
         minute: 0,
         location: 'Joseph Alioto Recreation Center',
      },
      {
         id: 'cmp-3',
         mode: 'competitive',
         weekday: 0,
         hour: 17,
         minute: 0,
         location: 'Moraga Commons',
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

   function formatTime12(h, m) {
      var period = h >= 12 ? 'PM' : 'AM';
      var h12 = h % 12;
      if (h12 === 0) h12 = 12;
      var mmStr = m === 0 ? '' : ':' + (m < 10 ? '0' : '') + m;
      return h12 + mmStr + ' ' + period;
   }

   function formatLongDate(d) {
      return d.toLocaleDateString('en-US', {
         weekday: 'long',
         year: 'numeric',
         month: 'long',
         day: 'numeric',
      });
   }

   /** Next calendar day matching game weekday starting from today (time-aware for same weekday). */
   function getNextOccurrenceDate(game) {
      var now = new Date();
      var deadline = now.getTime() + 371 * 24 * 60 * 60 * 1000;
      var startMin = game.hour * 60 + game.minute;
      var cursor = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      while (cursor.getTime() < deadline) {
         if (cursor.getDay() === game.weekday) {
            var isToday =
               cursor.getFullYear() === now.getFullYear() &&
               cursor.getMonth() === now.getMonth() &&
               cursor.getDate() === now.getDate();
            var nowMin = now.getHours() * 60 + now.getMinutes();
            if (!isToday || nowMin < startMin) {
               return new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate());
            }
         }
         cursor.setDate(cursor.getDate() + 1);
      }
      return cursor;
   }

   function formatAvailabilityDetail(game) {
      var next = getNextOccurrenceDate(game);
      var kindLabel = game.mode === 'casual' ? 'Casual' : 'Competitive';
      return (
         formatLongDate(next) +
         ' · ' +
         formatTime12(game.hour, game.minute) +
         ' · ' +
         game.location +
         ' · ' +
         kindLabel +
         ' (repeats weekly)'
      );
   }

   /** Games hosted at location on calendar day (same weekday recurrence). */
   function gamesMatchingCalendarDay(locationName, year, monthIndex, dayNum) {
      var d = new Date(year, monthIndex, dayNum);
      var dow = d.getDay();
      return DEFS.filter(function (g) {
         return g.location === locationName && g.weekday === dow;
      });
   }

   function popoverSummaryLine(game) {
      var kind = game.mode === 'casual' ? 'Casual' : 'Competitive';
      return formatTime12(game.hour, game.minute) + ' · ' + kind;
   }

   global.PICKUP_GAME_DEFINITIONS = DEFS.slice();

   global.pickupGames = {
      defs: DEFS,
      rosterKey: ROSTER_KEY,
      getRoster: getRoster,
      setRoster: setRoster,
      formatAvailabilityDetail: formatAvailabilityDetail,
      gamesMatchingCalendarDay: gamesMatchingCalendarDay,
      popoverSummaryLine: popoverSummaryLine,
   };
})(typeof window !== 'undefined' ? window : globalThis);
