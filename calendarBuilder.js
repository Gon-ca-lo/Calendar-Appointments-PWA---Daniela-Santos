// Calendar Builder - generates calendar structure dynamically
export function buildCalendar() {
  const calendarContainer = document.getElementById('calendar');
  if (!calendarContainer) return;
  
  calendarContainer.innerHTML = '';
  
  // Hours column
  const hours = ['', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'];
  
  const hourCol = document.createElement('div');
  hourCol.className = 'col hour';
  hours.forEach(hour => {
    const cell = document.createElement('div');
    cell.className = 'cell hour';
    cell.textContent = hour;
    hourCol.appendChild(cell);
  });
  calendarContainer.appendChild(hourCol);
  
  // Days of week
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  days.forEach(day => {
    const dayCol = document.createElement('div');
    dayCol.className = 'col';
    
    // Day header
    const headerCell = document.createElement('div');
    headerCell.className = 'cell day';
    headerCell.textContent = day;
    dayCol.appendChild(headerCell);
    
    // 13 time slots (08:00 to 20:00)
    for (let i = 0; i < 13; i++) {
      const eventCell = document.createElement('div');
      eventCell.className = 'cell event';
      dayCol.appendChild(eventCell);
    }
    
    calendarContainer.appendChild(dayCol);
  });
}

// Rebuild calendar when needed (e.g., after theme changes)
export function rebuildCalendar() {
  buildCalendar();
  // Trigger re-render of events if there's a global function
  if (window.refreshCalendarEvents) {
    setTimeout(() => window.refreshCalendarEvents(), 50);
  }
}