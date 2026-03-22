import { buildCalendar, rebuildCalendar } from './calendarBuilder.js';

document.addEventListener('DOMContentLoaded', () => {
    // Build calendar structure dynamically
    buildCalendar();
    
    // Start with the current week (Monday of the week containing today)
    let currentWeekStart = getMonday(new Date());

    // Helper: get Monday of the week for any given date
    function getMonday(date) {
        const d = new Date(date);
        const day = d.getDay();
        const diff = day === 0 ? -6 : 1 - day;
        d.setDate(d.getDate() + diff);
        d.setHours(0, 0, 0, 0);
        return d;
    }

    function renderWeekHeader() {
        const dayCells = document.querySelectorAll('.col:not(.hour) .cell.day');

        dayCells.forEach((cell, index) => {
            const dayDate = new Date(currentWeekStart);
            dayDate.setDate(dayDate.getDate() + index);

            const weekday = dayDate.toLocaleDateString('pt-PT', { weekday: 'long' });
            const weekdayCapitalized = weekday.charAt(0).toUpperCase() + weekday.slice(1);
            const day = String(dayDate.getDate()).padStart(2, '0');
            const month = String(dayDate.getMonth() + 1).padStart(2, '0');

            cell.textContent = `${weekdayCapitalized}\n${day}/${month}`;

            const today = new Date();
            if (dayDate.toDateString() === today.toDateString()) {
                cell.classList.add('today');
            } else {
                cell.classList.remove('today');
            }
        });
    }

    // Navigation
    document.getElementById('prevWeek').addEventListener('click', () => {
        currentWeekStart.setDate(currentWeekStart.getDate() - 7);
        renderWeekHeader();
        if (window.refreshCalendarEvents) {
            window.refreshCalendarEvents();
        }
        if (window.updateBillingBar) {
            // Pequeno delay para garantir que os eventos foram renderizados
            setTimeout(() => window.updateBillingBar(), 50);
        }
    });

    document.getElementById('nextWeek').addEventListener('click', () => {
        currentWeekStart.setDate(currentWeekStart.getDate() + 7);
        renderWeekHeader();
        if (window.refreshCalendarEvents) {
            window.refreshCalendarEvents();
        }
        if (window.updateBillingBar) {
            setTimeout(() => window.updateBillingBar(), 50);
        }
    });

    renderWeekHeader();
    
    // Store currentWeekStart globally for events.js to access
    window.getCurrentWeekStart = () => currentWeekStart;
    window.getMonday = getMonday;
});

document.addEventListener('DOMContentLoaded', () => {
    // Modal controls
    const eventModal = document.getElementById('eventModal');
    const serviceModal = document.getElementById('serviceModal');
    const eventBtn = document.getElementById('eventBtn');
    const serviceBtn = document.getElementById('serviceBtn');

    if (eventBtn) {
        eventBtn.addEventListener('click', () => {
            eventModal.style.display = 'flex';
        });
    }

    if (serviceBtn) {
        serviceBtn.addEventListener('click', () => {
            serviceModal.style.display = 'flex';
        });
    }

    document.querySelectorAll('.closeBtn').forEach(btn => {
        btn.addEventListener('click', () => {
            eventModal.style.display = 'none';
            serviceModal.style.display = 'none';
        });
    });

    [eventModal, serviceModal].forEach(modal => {
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.style.display = 'none';
                }
            });
        }
    });
});