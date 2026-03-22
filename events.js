import {
  getEvents, createEvent, updateEvent, deleteEvent, toggleEventPaidStatus, getEventById,
  getTemplates, saveTemplates, createTemplate, updateTemplate, deleteTemplate, getTemplateByName
} from './dataManager.js';

document.addEventListener('DOMContentLoaded', () => {
  const eventForm = document.getElementById('eventForm');
  const templateForm = document.getElementById('templateForm');
  const eventModal = document.getElementById('eventModal');
  const modalTitle = eventModal.querySelector('h2');
  const serviceInput = document.getElementById('service');
  const eventColorInput = document.getElementById('eventColor');
  const eventPriceInput = document.getElementById('eventPrice');
  const suggestionsDatalist = document.getElementById('serviceSuggestions');
  const templatesListContainer = document.getElementById('templatesList');
  const modalDeleteBtn = document.getElementById('modalDelete');

  let editingTemplateId = null;
  let editingEventId = null;
  let draggedItem = null;

  function updateServiceSuggestions() {
    suggestionsDatalist.innerHTML = '';
    getTemplates().forEach(t => {
      const opt = document.createElement('option');
      opt.value = t.name;
      suggestionsDatalist.appendChild(opt);
    });
  }

  serviceInput.addEventListener('input', () => {
    const enteredName = serviceInput.value.trim();
    const template = getTemplateByName(enteredName);

    if (template) {
      eventColorInput.value = template.color || '#f8c8dc';
      eventPriceInput.value = Number(template.price).toFixed(2);
    }
  });

  serviceInput.addEventListener('change', () => {
    serviceInput.dispatchEvent(new Event('input'));
  });

  // Drag and drop handlers
  function handleDragStart(e) {
    draggedItem = this;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', this.getAttribute('data-id'));
    this.classList.add('dragging');
    
    // Required for Firefox
    e.dataTransfer.setDragImage(this, 0, 0);
  }

  function handleDragEnd(e) {
    this.classList.remove('dragging');
    document.querySelectorAll('.template-item').forEach(item => {
      item.classList.remove('drag-over');
    });
    draggedItem = null;
  }

  function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    if (this === draggedItem) return;
    this.classList.add('drag-over');
  }

  function handleDragLeave(e) {
    this.classList.remove('drag-over');
  }

  function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    
    this.classList.remove('drag-over');
    
    if (this === draggedItem) return;
    
    const draggedId = draggedItem.getAttribute('data-id');
    const targetId = this.getAttribute('data-id');
    
    if (!draggedId || !targetId) return;
    
    // Reorder templates
    const templates = getTemplates();
    const draggedIndex = templates.findIndex(t => t.id === draggedId);
    const targetIndex = templates.findIndex(t => t.id === targetId);
    
    if (draggedIndex === -1 || targetIndex === -1) return;
    
    // Remove dragged item and insert at new position
    const [draggedTemplate] = templates.splice(draggedIndex, 1);
    templates.splice(targetIndex, 0, draggedTemplate);
    
    // Save new order
    saveTemplates(templates);
    
    // Re-render the list
    renderTemplatesList();
    updateServiceSuggestions();
  }

  function renderTemplatesList() {
    templatesListContainer.innerHTML = '';
    const templates = getTemplates();

    if (templates.length === 0) {
      templatesListContainer.innerHTML = '<p style="text-align:center; color:#d4aabc;">Nenhum template criado ainda.</p>';
      return;
    }

    templates.forEach((t, index) => {
      const item = document.createElement('div');
      item.className = 'template-item';
      item.setAttribute('data-id', t.id);
      item.setAttribute('data-index', index);
      item.setAttribute('draggable', 'true');
      item.innerHTML = `
        <div style="display:flex; align-items:center; gap:12px; flex:1;">
          <div class="template-preview" style="background:${t.color || '#f8c8dc'};"></div>
          <div>
            <strong>${escapeHtml(t.name)}</strong><br>
            <small>€${Number(t.price).toFixed(2)}</small>
          </div>
        </div>
        <div style="display:flex; gap:8px;">
          <button class="edit-template" data-id="${t.id}">Editar</button>
          <button class="delete-template" data-id="${t.id}">Apagar</button>
        </div>
      `;
      
      // Drag and drop event listeners
      item.addEventListener('dragstart', handleDragStart);
      item.addEventListener('dragend', handleDragEnd);
      item.addEventListener('dragover', handleDragOver);
      item.addEventListener('dragleave', handleDragLeave);
      item.addEventListener('drop', handleDrop);
      
      templatesListContainer.appendChild(item);
    });

    document.querySelectorAll('.edit-template').forEach(btn => {
      btn.addEventListener('click', () => editTemplate(btn.dataset.id));
    });

    document.querySelectorAll('.delete-template').forEach(btn => {
      btn.addEventListener('click', () => {
        if (confirm('Tem certeza que deseja apagar este serviço?')) {
          deleteTemplate(btn.dataset.id);
          renderTemplatesList();
          updateServiceSuggestions();
        }
      });
    });
  }

  function editTemplate(id) {
    const template = getTemplates().find(t => t.id === id);
    if (!template) return;

    editingTemplateId = id;

    document.getElementById('templateName').value = template.name;
    document.getElementById('templateColor').value = template.color || '#f8c8dc';
    document.getElementById('templatePrice').value = template.price;

    templateForm.querySelector('.yesBtn').textContent = 'Atualizar';
  }

  templateForm.addEventListener('submit', e => {
    e.preventDefault();

    const name = document.getElementById('templateName').value.trim();
    const color = document.getElementById('templateColor').value;
    const price = parseFloat(document.getElementById('templatePrice').value);

    if (!name || isNaN(price)) {
      alert('Preencha nome e preço corretamente.');
      return;
    }

    if (editingTemplateId) {
      updateTemplate(editingTemplateId, { name, color, price });
      editingTemplateId = null;
      templateForm.querySelector('.yesBtn').textContent = 'Guardar';
    } else {
      createTemplate({ name, color, price });
    }

    templateForm.reset();
    document.getElementById('templateColor').value = '#f8c8dc';
    renderTemplatesList();
    updateServiceSuggestions();
  });

  document.getElementById('serviceModal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('serviceModal')) {
      editingTemplateId = null;
      templateForm.reset();
      templateForm.querySelector('.yesBtn').textContent = 'Guardar';
      document.getElementById('templateColor').value = '#f8c8dc';
    }
  });

  function isTimeSlotFree(dateStr, startStr, endStr, excludeEventId = null) {
    const events = getEvents();
    const newStart = new Date(`${dateStr}T${startStr}:00`);
    const newEnd = new Date(`${dateStr}T${endStr}:00`);

    return !events.some(event => {
      if (excludeEventId && event.id === excludeEventId) return false;
      if (event.date !== dateStr) return false;

      const existingStart = new Date(`${event.date}T${event.start}:00`);
      const existingEnd = new Date(`${event.date}T${event.end}:00`);

      return newStart < existingEnd && newEnd > existingStart;
    });
  }

  function openNewEventModal() {
    editingEventId = null;
    modalTitle.textContent = 'Adicionar Marcação';
    modalDeleteBtn.style.display = 'none';
    eventForm.reset();
    eventColorInput.value = '#f8c8dc';
    
    const existingToggle = document.querySelector('.payment-toggle-container');
    if (existingToggle) existingToggle.remove();
    
    eventModal.style.display = 'flex';
  }

  function openEditEventModal(eventId) {
    const event = getEvents().find(e => e.id === eventId);
    if (!event) return;

    editingEventId = eventId;
    modalTitle.textContent = 'Editar Marcação';
    modalDeleteBtn.style.display = 'inline-block';

    document.getElementById('service').value = event.service || '';
    document.getElementById('eventColor').value = event.color || '#f8c8dc';
    document.getElementById('client').value = event.client || '';
    document.getElementById('eventPrice').value = Number(event.price).toFixed(2);
    document.getElementById('date').value = event.date;
    document.getElementById('start').value = event.start;
    document.getElementById('end').value = event.end;

    addPaymentToggle(event);

    eventModal.style.display = 'flex';
  }

  function addPaymentToggle(event) {
    const modalBtns = document.querySelector('.modalBtns');
    let toggleContainer = document.querySelector('.payment-toggle-container');
    
    if (!toggleContainer) {
      toggleContainer = document.createElement('div');
      toggleContainer.className = 'payment-toggle-container';
      modalBtns.appendChild(toggleContainer);
    }
    
    const isPaid = event.paid || false;
    toggleContainer.innerHTML = `
      <button class="payment-toggle ${isPaid ? 'paid' : ''}" data-event-id="${event.id}">
        <div class="toggle-circle"></div>
        <span class="toggle-text">${isPaid ? 'Pago ✓' : 'Não Pago'}</span>
      </button>
    `;
    
    const toggleBtn = toggleContainer.querySelector('.payment-toggle');
    toggleBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      const newPaidStatus = toggleEventPaidStatus(event.id);
      toggleBtn.classList.toggle('paid', newPaidStatus);
      const textSpan = toggleBtn.querySelector('.toggle-text');
      textSpan.textContent = newPaidStatus ? 'Pago ✓' : 'Não Pago';
      updateBillingBar();
      renderCalendarEvents();
    });
  }

  function updateBillingBar() {
    const events = getEvents();
    // Usar a mesma lógica de semana que o calendário
    const currentWeekStart = window.getCurrentWeekStart ? window.getCurrentWeekStart() : getMonday(new Date());
  
    const weekStart = new Date(currentWeekStart);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);
  
    const weekEvents = events.filter(event => {
      const eventDate = new Date(event.date);
      // Garantir que comparamos apenas as datas, ignorando horas
      return eventDate >= weekStart && eventDate <= weekEnd;
    });
  
    let potentialTotal = 0;
    let paidTotal = 0;
  
    weekEvents.forEach(event => {
      const price = Number(event.price) || 0;
      potentialTotal += price;
      if (event.paid) {
        paidTotal += price;
      }
    });
  
    const potentialSpan = document.querySelector('#calc .values .potential');
    const paidSpan = document.querySelector('#calc .values .paid');
  
    if (potentialSpan) {
      potentialSpan.textContent = `€${potentialTotal.toFixed(2)}`;
   }
    if (paidSpan) {
      paidSpan.textContent = `€${paidTotal.toFixed(2)}`;
    }
  
    const barFill = document.querySelector('#bar .fill');
    if (barFill) {
      const percentage = potentialTotal > 0 ? (paidTotal / potentialTotal) * 100 : 0;
      barFill.style.width = `${percentage}%`;
    }
  }

  eventForm.addEventListener('submit', e => {
    e.preventDefault();

    const serviceName = document.getElementById('service').value.trim();
    const eventColor = document.getElementById('eventColor').value;
    const client = document.getElementById('client').value.trim();
    const price = parseFloat(document.getElementById('eventPrice').value);
    const date = document.getElementById('date').value;
    const start = document.getElementById('start').value;
    const end = document.getElementById('end').value;

    if (!serviceName || !client || isNaN(price) || !date || !start || !end) {
      alert('Preencha todos os campos obrigatórios.');
      return;
    }

    const isFree = isTimeSlotFree(date, start, end, editingEventId);
    if (!isFree) {
      alert('Este horário já está ocupado! Por favor, selecione outro horário ou dia.');
      return;
    }

    const template = getTemplateByName(serviceName);
    const finalColor = template ? template.color : eventColor;

    const eventData = {
      service: serviceName,
      color: finalColor,
      client,
      price,
      date,
      start,
      end
    };

    if (editingEventId) {
      const existingEvent = getEventById(editingEventId);
      if (existingEvent) {
        eventData.paid = existingEvent.paid;
      }
      updateEvent(editingEventId, eventData);
    } else {
      createEvent(eventData);
    }

    eventForm.reset();
    document.getElementById('eventColor').value = '#f8c8dc';
    eventModal.style.display = 'none';

    renderCalendarEvents();
    updateBillingBar();
  });

  modalDeleteBtn.addEventListener('click', () => {
    if (editingEventId && confirm('Tem certeza que deseja eliminar esta marcação?')) {
      deleteEvent(editingEventId);
      eventModal.style.display = 'none';
      renderCalendarEvents();
      updateBillingBar();
    }
  });

  function renderCalendarEvents() {
    document.querySelectorAll('.cell.event').forEach(cell => {
      cell.innerHTML = '';
      cell.style.position = 'relative';
    });

    const events = getEvents();
    const currentWeekStart = window.getCurrentWeekStart ? window.getCurrentWeekStart() : getMonday(new Date());

    events.forEach(event => {
      const eventDate = new Date(event.date);
      const [startH, startM] = event.start.split(':').map(Number);
      const [endH, endM] = event.end.split(':').map(Number);

      const weekStart = new Date(currentWeekStart);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      if (eventDate < weekStart || eventDate > weekEnd) {
        return;
      }

      let dayIndex = eventDate.getDay();
      const columnIndex = dayIndex === 0 ? 6 : dayIndex - 1;

      const startHourIndex = startH - 8;
      const durationHours = (endH - startH) + (endM - startM) / 60;

      if (startHourIndex < 0 || startHourIndex > 12 || columnIndex < 0 || columnIndex > 6) {
        console.warn('Event outside calendar range:', event);
        return;
      }

      const dayColumns = document.querySelectorAll('.col:not(.hour)');
      if (dayColumns.length <= columnIndex) return;
      
      const targetColumn = dayColumns[columnIndex];
      const targetCells = targetColumn.querySelectorAll('.cell.event');
      if (targetCells.length <= startHourIndex) return;
      
      const targetCell = targetCells[startHourIndex];

      if (!targetCell) return;

      const block = document.createElement('div');
      block.className = 'event-block';
      
      if (!event.paid) {
        block.classList.add('unpaid');
      }
      
      block.dataset.eventId = event.id;
      block.style.background = event.color || '#f8c8dc';
      
      const rowHeight = targetCell.offsetHeight;
      if (rowHeight > 0) {
        block.style.height = `${durationHours * rowHeight}px`;
      } else {
        block.style.height = `${durationHours * 80}px`;
      }
      
      block.style.position = 'absolute';
      block.style.top = '0';
      block.style.left = '0';
      block.style.right = '0';
      block.style.cursor = 'pointer';
      
      const paidIcon = event.paid ? '✓' : '⚠️';
      block.innerHTML = `
        <strong>${escapeHtml(event.service)}</strong><br>
        <small>${escapeHtml(event.client)} - €${Number(event.price).toFixed(2)} ${paidIcon}</small>
      `;

      block.addEventListener('click', (e) => {
        e.stopPropagation();
        openEditEventModal(event.id);
      });

      targetCell.appendChild(block);
      targetCell.style.position = 'relative';
    });
  }

  function getMonday(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
      if (m === '&') return '&amp;';
      if (m === '<') return '&lt;';
      if (m === '>') return '&gt;';
      return m;
    });
  }

  window.refreshCalendarEvents = renderCalendarEvents;
  window.updateBillingBar = updateBillingBar;

  updateServiceSuggestions();
  renderTemplatesList();
  renderCalendarEvents();
  updateBillingBar();
  
  const eventBtn = document.getElementById('eventBtn');
  if (eventBtn) {
    eventBtn.addEventListener('click', openNewEventModal);
  }
  
  const prevWeekBtn = document.getElementById('prevWeek');
  const nextWeekBtn = document.getElementById('nextWeek');
  if (prevWeekBtn && nextWeekBtn) {
    const updateBarOnNav = () => setTimeout(updateBillingBar, 100);
    prevWeekBtn.addEventListener('click', updateBarOnNav);
    nextWeekBtn.addEventListener('click', updateBarOnNav);
  }
});