// dataManager.js
// LocalStorage-based CRUD for Events and Service Templates

// ────────────────────────────────────────────────
// LocalStorage Keys
// ────────────────────────────────────────────────
const EVENTS_KEY = 'glowSchedule_events';
const TEMPLATES_KEY = 'glowSchedule_serviceTemplates';

// ────────────────────────────────────────────────
// Helper: Generate unique ID
// ────────────────────────────────────────────────
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

// ────────────────────────────────────────────────
// Events (Appointments)
// ────────────────────────────────────────────────

export function getEvents() {
  const data = localStorage.getItem(EVENTS_KEY);
  return data ? JSON.parse(data) : [];
}
export function saveEvents(events) {
  localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
}
export function createEvent(eventData) {
  const events = getEvents();
  const newEvent = {
    id: generateId(),
    ...eventData,
    createdAt: new Date().toISOString()
  };
  events.push(newEvent);
  saveEvents(events);
  return newEvent;
}
export function updateEvent(id, updates) {
  let events = getEvents();
  const index = events.findIndex(e => e.id === id);
  if (index === -1) return null;

  events[index] = { ...events[index], ...updates };
  saveEvents(events);
  return events[index];
}
export function deleteEvent(id) {
  let events = getEvents();
  events = events.filter(e => e.id !== id);
  saveEvents(events);
  return true;
}
export function getEventById(id) {
  return getEvents().find(e => e.id === id) || null;
}

// ────────────────────────────────────────────────
// Service Templates
// ────────────────────────────────────────────────

export function getTemplates() {
  const data = localStorage.getItem(TEMPLATES_KEY);
  return data ? JSON.parse(data) : [];
}
export function saveTemplates(templates) {
  localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
}
export function createTemplate(templateData) {
  const templates = getTemplates();
  const newTemplate = {
    id: generateId(),
    ...templateData,
    createdAt: new Date().toISOString()
  };
  templates.push(newTemplate);
  saveTemplates(templates);
  return newTemplate;
}
export function updateTemplate(id, updates) {
  let templates = getTemplates();
  const index = templates.findIndex(t => t.id === id);
  if (index === -1) return null;

  templates[index] = { ...templates[index], ...updates };
  saveTemplates(templates);
  return templates[index];
}
export function deleteTemplate(id) {
  let templates = getTemplates();
  templates = templates.filter(t => t.id !== id);
  saveTemplates(templates);
  return true;
}
export function getTemplateById(id) {
  return getTemplates().find(t => t.id === id) || null;
}
export function getTemplateByName(name) {
  return getTemplates().find(t => t.name.toLowerCase() === name.trim().toLowerCase()) || null;
}