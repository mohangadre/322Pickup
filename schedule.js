
(function () {
   const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
   ];
   const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

   function formatTimeLabel(totalMinutes) {
      const h24 = Math.floor(totalMinutes / 60);
      const m = totalMinutes % 60;
      const period = h24 >= 12 ? 'PM' : 'AM';
      let h12 = h24 % 12;
      if (h12 === 0) h12 = 12;
      const mm = m === 0 ? '' : `:${String(m).padStart(2, '0')}`;
      return `${h12}${mm} ${period}`;
   }

   function buildNinetyMinuteSlots() {
      const slots = [];
      const dayEnd = 18 * 60;
      for (let start = 9 * 60; start + 90 <= dayEnd; start += 90) {
         const end = start + 90;
         slots.push(`${formatTimeLabel(start)} – ${formatTimeLabel(end)}`);
      }
      return slots;
   }

   const SLOT_LINES = buildNinetyMinuteSlots();

   function daysInMonth(year, monthIndex) {
      return new Date(year, monthIndex + 1, 0).getDate();
   }

   function firstWeekdayOfMonth(year, monthIndex) {
      return new Date(year, monthIndex, 1).getDay();
   }

   function escapeHtml(s) {
      const d = document.createElement('div');
      d.textContent = s;
      return d.innerHTML;
   }

   function renderSlotsHtml() {
      return (
         '<ul class="slot-list">' +
         SLOT_LINES.map((line) => `<li>${escapeHtml(line)}</li>`).join('') +
         '</ul>'
      );
   }

   function mountCalendar(root) {
      if (!root) return;

      const locationName = root.dataset.location || 'Location';
      let viewYear = new Date().getFullYear();
      let viewMonth = new Date().getMonth();

      function paint() {
         const pad = firstWeekdayOfMonth(viewYear, viewMonth);
         const dim = daysInMonth(viewYear, viewMonth);
         const title = `${monthNames[viewMonth]} ${viewYear}`;

         const padCells = Array.from({ length: pad }, () =>
            '<li class="calendar-pad" aria-hidden="true"></li>',
         );
         const dayCells = Array.from({ length: dim }, (_, i) => {
            const day = i + 1;
            const id = `cal-${root.id}-d-${viewYear}-${viewMonth + 1}-${day}`;
            const dayAria = `${monthNames[viewMonth]} ${day}, ${viewYear} at ${locationName}. Focus or hover for pickup time windows.`;
            return (
               `<li class="calendar-day" id="${id}" tabindex="0" aria-label="${escapeHtml(dayAria)}">` +
               `<span class="day-num">${day}</span>` +
               `<div class="day-slots-popover" role="tooltip">` +
               `<p class="popover-heading">${escapeHtml(locationName)}</p>` +
               `<p class="popover-date">${escapeHtml(monthNames[viewMonth])} ${day}, ${viewYear}</p>` +
               `<p class="popover-label">Pickup windows</p>` +
               renderSlotsHtml() +
               `</div></li>`
            );
         });

         root.innerHTML =
            '<div class="calendar-wrapper">' +
            '<div class="calendar-toolbar">' +
            `<button type="button" class="cal-nav cal-prev" aria-label="Previous month">‹</button>` +
            `<h4 class="calendar-month-title">${escapeHtml(title)}</h4>` +
            `<button type="button" class="cal-nav cal-next" aria-label="Next month">›</button>` +
            '</div>' +
            '<ul class="calendar">' +
            weekdays.map((w) => `<li class="weekday">${w}</li>`).join('') +
            padCells.join('') +
            dayCells.join('') +
            '</ul></div>';

         root.querySelector('.cal-prev').addEventListener('click', () => {
            viewMonth -= 1;
            if (viewMonth < 0) {
               viewMonth = 11;
               viewYear -= 1;
            }
            paint();
         });
         root.querySelector('.cal-next').addEventListener('click', () => {
            viewMonth += 1;
            if (viewMonth > 11) {
               viewMonth = 0;
               viewYear += 1;
            }
            paint();
         });
      }

      paint();
   }

   document.addEventListener('DOMContentLoaded', () => {
      mountCalendar(document.getElementById('calendar-alioto'));
      mountCalendar(document.getElementById('calendar-moraga'));
   });
})();
