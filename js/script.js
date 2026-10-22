'use strict';

// Update this single value when a real contact email is ready.
const CONTACT_EMAIL = 'your-email@example.com';
const SUPABASE_CONFIG = window.SUPABASE_CONFIG || { url: '', anonKey: '' };
const root = document.documentElement;

function initTheme() {
  const button = document.querySelector('#theme-toggle');
  let savedTheme = null;
  try { savedTheme = localStorage.getItem('sahil-portfolio-theme'); } catch (_) { /* Storage can be disabled. */ }
  if (savedTheme === 'dark' || savedTheme === 'light') root.dataset.theme = savedTheme;
  button?.addEventListener('click', () => {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    button.setAttribute('aria-label', `Switch to ${next === 'dark' ? 'light' : 'dark'} theme`);
    try { localStorage.setItem('sahil-portfolio-theme', next); } catch (_) { /* Theme still works for this page view. */ }
  });
}

function initNavigation() {
  const toggle = document.querySelector('.menu-toggle');
  const links = document.querySelector('#nav-links');
  const closeMenu = () => { links.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); toggle.setAttribute('aria-label', 'Open navigation'); };
  toggle?.addEventListener('click', () => {
    const isOpen = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(isOpen));
    toggle.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
    links.classList.toggle('open', isOpen);
  });
  links?.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
}

function createProjectCard(project, index) {
  const card = document.createElement('article');
  card.className = 'project-card reveal';
  const preview = document.createElement('div');
  preview.className = 'project-preview';
  if (project.preview) {
    const image = document.createElement('img'); image.src = project.preview; image.alt = `${project.title} preview`;
    image.addEventListener('error', () => { preview.innerHTML = `<span class="preview-mark" aria-hidden="true">0${index + 1}</span>`; });
    preview.append(image);
  } else {
    const mark = document.createElement('span'); mark.className = 'preview-mark'; mark.setAttribute('aria-hidden', 'true'); mark.textContent = `0${index + 1}`; preview.append(mark);
  }
  const body = document.createElement('div'); body.className = 'project-body';
  const title = document.createElement('h3'); title.textContent = project.title;
  const description = document.createElement('p'); description.textContent = project.description;
  const tags = document.createElement('div'); tags.className = 'tags';
  (Array.isArray(project.technologies) ? project.technologies : []).slice(0, 4).forEach(label => { const tag = document.createElement('span'); tag.textContent = label; tags.append(tag); });
  body.append(title, description, tags);
  if (project.repository && project.repository.startsWith('https://github.com/')) {
    const actions = document.createElement('div'); actions.className = 'project-actions';
    const repo = document.createElement('a'); repo.href = project.repository; repo.target = '_blank'; repo.rel = 'noopener noreferrer'; repo.textContent = 'GitHub ↗'; actions.append(repo);
    if (project.demo && /^https:\/\//.test(project.demo)) { const demo = document.createElement('a'); demo.href = project.demo; demo.target = '_blank'; demo.rel = 'noopener noreferrer'; demo.textContent = 'Live Demo ↗'; actions.append(demo); }
    body.append(actions);
  }
  card.append(preview, body); return card;
}

async function loadProjects() {
  const grid = document.querySelector('#project-grid');
  try {
    const response = await fetch('data/projects.json');
    if (!response.ok) throw new Error(`Project data request failed (${response.status})`);
    const projects = await response.json();
    if (!Array.isArray(projects) || projects.length === 0) throw new Error('No projects are listed yet.');
    grid.replaceChildren(...projects.map(createProjectCard));
    observeReveals(grid);
  } catch (error) {
    grid.innerHTML = '<p class="empty-state">Project details could not be loaded. Run this site through a local web server and check <code>data/projects.json</code>.</p>';
    console.warn('Could not load project data:', error);
  }
}

function initContactForm() {
  const form = document.querySelector('#contact-form');
  const feedback = document.querySelector('#form-feedback');
  const emailLink = document.querySelector('#email-link');
  const emailDisplay = document.querySelector('#email-display');
  const submitButton = form.querySelector('[type="submit"]');
  if (CONTACT_EMAIL && CONTACT_EMAIL !== 'your-email@example.com') {
    emailLink.href = `mailto:${CONTACT_EMAIL}`;
    emailDisplay.textContent = `${CONTACT_EMAIL} ↗`;
  }
  const prepareEmailDraft = data => {
    const subject = `Portfolio message from ${data.get('name')}`;
    const body = `Name: ${data.get('name')}\nEmail: ${data.get('email')}\n\n${data.get('message')}`;
    const recipient = CONTACT_EMAIL || 'your-email@example.com';
    window.location.href = `mailto:${encodeURIComponent(recipient)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };
  form.addEventListener('submit', async event => {
    event.preventDefault();
    const fields = [...form.querySelectorAll('input, textarea')];
    let valid = true;
    fields.forEach(field => {
      const fieldValid = field.checkValidity(); field.setAttribute('aria-invalid', String(!fieldValid));
      if (!fieldValid) valid = false;
    });
    if (!valid) { feedback.textContent = 'Please enter your name, a valid email address, and a message.'; form.querySelector('[aria-invalid="true"]')?.focus(); return; }
    const data = new FormData(form);
    const url = (SUPABASE_CONFIG.url || '').trim().replace(/\/$/, '');
    const anonKey = (SUPABASE_CONFIG.anonKey || '').trim();
    if (!url || !anonKey) {
      feedback.textContent = 'Supabase is not configured yet. Opening an email draft instead.';
      prepareEmailDraft(data);
      return;
    }
    submitButton.disabled = true;
    feedback.textContent = 'Saving your message…';
    try {
      const response = await fetch(`${url}/rest/v1/contact_messages`, {
        method: 'POST',
        headers: {
          apikey: anonKey,
          Authorization: `Bearer ${anonKey}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal'
        },
        body: JSON.stringify({ name: data.get('name'), email: data.get('email'), message: data.get('message') })
      });
      if (!response.ok) throw new Error(`Supabase returned ${response.status}`);
      form.reset();
      fields.forEach(field => field.removeAttribute('aria-invalid'));
      feedback.textContent = 'Your message was saved. Thanks for reaching out.';
    } catch (error) {
      console.warn('Could not save contact message:', error);
      feedback.textContent = 'We could not save this message right now. Opening an email draft instead.';
      prepareEmailDraft(data);
    } finally {
      submitButton.disabled = false;
    }
  });
  form.querySelectorAll('input, textarea').forEach(field => field.addEventListener('input', () => field.removeAttribute('aria-invalid')));
}

let revealObserver;
function observeReveals(scope = document) {
  const items = scope.querySelectorAll('.reveal:not(.visible)');
  if (!('IntersectionObserver' in window)) { items.forEach(item => item.classList.add('visible')); return; }
  if (!revealObserver) revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('visible'); revealObserver.unobserve(entry.target); }
  }), { threshold: 0.12 });
  items.forEach(item => revealObserver.observe(item));
}

function initActiveNavigation() {
  if (!('IntersectionObserver' in window)) return;
  const navAnchors = [...document.querySelectorAll('.nav-links a[href^="#"]')];
  const byId = new Map(navAnchors.map(link => [link.hash.slice(1), link]));
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) {
      navAnchors.forEach(link => link.classList.remove('active'));
      byId.get(entry.target.id)?.classList.add('active');
    }
  }), { rootMargin: '-25% 0px -65% 0px' });
  document.querySelectorAll('main section[id]').forEach(section => observer.observe(section));
}

document.documentElement.classList.add('js-ready');
initTheme();
initNavigation();
initContactForm();
initActiveNavigation();
observeReveals();
loadProjects();
document.querySelector('#copyright-year').textContent = new Date().getFullYear();
