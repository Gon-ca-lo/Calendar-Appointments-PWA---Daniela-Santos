// events.js

import {
  getEvents, createEvent, updateEvent, deleteEvent,
  getTemplates, createTemplate, updateTemplate, deleteTemplate, getTemplateByName
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
  const modalSaveBtn = eventForm.querySelector('.yesBtn');

  let editingTemplateId = null;
  let editingEventId = null;

  // ────────────────────────────────────────────────
  // Update datalist suggestions for event form
  // ────────────────────────────────────────────────
  function updateServiceSuggestions() {
    suggestionsDatalist.innerHTML = '';
    getTemplates().forEach(t => {
      const opt = document.createElement('option');
      opt.value = t.name;
      suggestionsDatalist.appendChild(opt);
    });
  }

  // ────────────────────────────────────────────────
  // Auto-fill color & price when service name matches a template
  // ────────────────────────────────────────────────
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

  // ────────────────────────────────────────────────
  // Render full list of templates (editable/deletable)
  // ────────────────────────────────────────────────
  function renderTemplatesList() {
    templatesListContainer.innerHTML = '';
    const templates = getTemplates();

    if (templates.length === 0) {
      templatesListContainer.innerHTML = '<p style="text-align:center; color:#aaa;">Nenhum serviço cadastrado ainda.</p>';
      return;
    }

    templates.forEach(t => {
      const item = document.createElement('div');
      item.className = 'template-item';
      item.innerHTML = `
        <div style="display:flex; align-items:center; gap:12px; flex:1;">
          <div class="template-preview" style="background:${t.color || '#f8c8dc'};"></div>
          <div>
            <strong>${t.name}</strong><br>
            <small>€${Number(t.price).toFixed(2)}</small>
          </div>
        </div>
        <div style="display:flex; gap:8px;">
          <button class="edit-template" data-id="${t.id}">Editar</button>
          <button class="delete-template" data-id="${t.id}">Apagar</button>
        </div>
      `;
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

  // ────────────────────────────────────────────────
  // Edit existing template
  // ────────────────────────────────────────────────
  function editTemplate(id) {
    const template = getTemplates().find(t => t.id === id);
    if (!template) return;

    editingTemplateId = id;

    document.getElementById('templateName').value = template.name;
    document.getElementById('templateColor').value = template.color || '#f8c8dc';
    document.getElementById('templatePrice').value = template.price;

    templateForm.querySelector('.yesBtn').textContent = 'Atualizar';
  }

  // ────────────────────────────────────────────────
  // Template form (add / update)
  // ────────────────────────────────────────────────
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

  // ────────────────────────────────────────────────
  // Check if a time slot on a given date is free
  // ────────────────────────────────────────────────
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

  // ────────────────────────────────────────────────
  // Open event modal for NEW appointment
  // ────────────────────────────────────────────────
  function openNewEventModal() {
    editingEventId = null;
    modalTitle.textContent = 'Adicionar Marcação';
    modalDeleteBtn.style.display = 'none';
    eventForm.reset();
    eventColorInput.value = '#f8c8dc';
    eventModal.style.display = 'flex';
  }

  // ────────────────────────────────────────────────
  // Open event modal for EDITING existing appointment
  // ────────────────────────────────────────────────
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

    eventModal.style.display = 'flex';
  }

  // ────────────────────────────────────────────────
  // Event form submit (create or update + conflict check)
  // ────────────────────────────────────────────────
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

    // Conflict check
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
      updateEvent(editingEventId, eventData);
    } else {
      createEvent(eventData);
    }

    eventForm.reset();
    document.getElementById('eventColor').value = '#f8c8dc';
    eventModal.style.display = 'none';

    renderCalendarEvents(); // Refresh calendar
  });

  // ────────────────────────────────────────────────
  // Delete current event (from modal)
  // ────────────────────────────────────────────────
  modalDeleteBtn.addEventListener('click', () => {
    if (editingEventId && confirm('Tem certeza que deseja eliminar esta marcação?')) {
      deleteEvent(editingEventId);
      eventModal.style.display = 'none';
      renderCalendarEvents();
    }
  });

  // ────────────────────────────────────────────────
  // Render all events on the calendar grid + click to edit/delete
  // ────────────────────────────────────────────────
  function renderCalendarEvents() {
    // Clear previous blocks
    document.querySelectorAll('.cell.event').forEach(cell => {
      cell.innerHTML = '';
      cell.style.background = '';
      cell.style.overflow = 'hidden';
    });

    const events = getEvents();

    events.forEach(event => {
      const eventDate = new Date(event.date);
      const [startH, startM] = event.start.split(':').map(Number);
      const [endH, endM] = event.end.split(':').map(Number);

      // Column (Monday=0 ... Sunday=6)
      let dayIndex = eventDate.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
      const columnIndex = dayIndex === 0 ? 6 : dayIndex - 1;

      // Start row index (08:00 → 0, 09:00 → 1, ..., 20:00 → 12)
      const startHourIndex = startH - 8;

      // Exact duration in hours (including minutes)
      const durationHours = (endH - startH) + (endM - startM) / 60;

      if (startHourIndex < 0 || startHourIndex > 12 || columnIndex < 0 || columnIndex > 6) {
        console.warn('Event outside calendar range:', event);
        return;
      }

      const dayColumns = document.querySelectorAll('.col:not(.hour)');
      const targetColumn = dayColumns[columnIndex];
      const targetCell = targetColumn.querySelectorAll('.cell.event')[startHourIndex];

      if (!targetCell) return;

      const block = document.createElement('div');
      block.className = 'event-block';
      block.dataset.eventId = event.id;
      block.style.background = event.color || '#f8c8dc';
      block.style.height = `${durationHours * 100}%`;  // ← This is now correct (e.g. 3.5h = 350%)
      block.style.position = 'absolute';
      block.style.top = '0';
      block.style.left = '0';
      block.style.right = '0';
      block.style.cursor = 'pointer';
      block.innerHTML = `
        <strong>${event.service}</strong><br>
        <small>${event.client} - €${Number(event.price).toFixed(2)}</small>
      `;

      block.addEventListener('click', () => {
        openEditEventModal(event.id);
      });

      targetCell.appendChild(block);
      targetCell.style.position = 'relative';
      targetCell.style.overflow = 'visible'; // allow block to overflow downward
    });
  }

  // ────────────────────────────────────────────────
  // Initial load
  // ────────────────────────────────────────────────
  updateServiceSuggestions();
  renderTemplatesList();
  renderCalendarEvents();
});