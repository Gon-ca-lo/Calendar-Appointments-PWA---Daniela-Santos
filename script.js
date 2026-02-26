document.addEventListener('DOMContentLoaded', () => {
    // Start with the current week (Monday of the week containing today)
    let currentWeekStart = getMonday(new Date());

    // Helper: get Monday of the week for any given date
    function getMonday(date) {
        const d = new Date(date);
        const day = d.getDay();
        const diff = day === 0 ? -6 : 1 - day; // Sunday → -6, Monday → 0, etc.
        d.setDate(d.getDate() + diff);
        d.setHours(0, 0, 0, 0);
        return d;
    }

    function renderWeekHeader() {
        const dayCells = document.querySelectorAll('.col:not(.hour) .cell.day');

        if (dayCells.length !== 7) {
            console.warn("Expected 7 day header cells, found:", dayCells.length);
            return;
        }

        dayCells.forEach((cell, index) => {
            const dayDate = new Date(currentWeekStart);
            dayDate.setDate(dayDate.getDate() + index);

            // Full weekday name in Portuguese
            const weekday = dayDate.toLocaleDateString('pt-PT', { weekday: 'long' });

            // Format day/month as dd/mm
            const day   = String(dayDate.getDate()).padStart(2, '0');
            const month = String(dayDate.getMonth() + 1).padStart(2, '0');

            // Final format: "Segunda [paragraph] 26/04/26"
            cell.textContent = `${weekday}\n${day}/${month}`;

            // Highlight today
            const today = new Date();
            if (dayDate.toDateString() === today.toDateString()) {
                cell.classList.add('today');
            } else {
                cell.classList.remove('today');
            }
        });
    }

    // Navigation – previous / next week
    document.getElementById('prevWeek').addEventListener('click', () => {
        currentWeekStart.setDate(currentWeekStart.getDate() - 7);
        renderWeekHeader();
        // Later: also call function to re-render events if you add them
    });

    document.getElementById('nextWeek').addEventListener('click', () => {
        currentWeekStart.setDate(currentWeekStart.getDate() + 7);
        renderWeekHeader();
    });

    // Initial render
    renderWeekHeader();
});

document.addEventListener('DOMContentLoaded', () => {
  // ────────────────────────────────────────────────
  // Modal controls
  // ────────────────────────────────────────────────
  const eventModal = document.getElementById('eventModal');
  const serviceModal = document.getElementById('serviceModal');
  const eventBtn = document.getElementById('eventBtn');
  const serviceBtn = document.getElementById('serviceBtn');

  // Open event modal
  eventBtn.addEventListener('click', () => {
    eventModal.style.display = 'flex';     // or 'block' — flex centers better
  });

  // Open services modal
  serviceBtn.addEventListener('click', () => {
    serviceModal.style.display = 'flex';
  });

  // Close any open modal when clicking ×
  document.querySelectorAll('.closeBtn').forEach(btn => {
    btn.addEventListener('click', () => {
      eventModal.style.display = 'none';
      serviceModal.style.display = 'none';
    });
  });

  // Close modal when clicking outside (backdrop)
  [eventModal, serviceModal].forEach(modal => {
    modal.addEventListener('click', (e) => {
      // Only close if clicked directly on the modal backdrop (not inside .modal-content)
      if (e.target === modal) {
        modal.style.display = 'none';
      }
    });
  });
});