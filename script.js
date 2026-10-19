const stories = window.STORIES || [];
const KEY = 'sonhos-da-mary-read-v1';
const categoryNames = [...new Set(stories.flatMap(story => story.category.split(',').map(name => name.trim()).filter(Boolean)))].sort((a, b) => a.localeCompare(b, 'pt-BR'));
const icons = [
  { test: 'Bíblicas', icon: 'fa-book-bible', cover: 'cover-star' },
  { test: 'Dinossauros', icon: 'fa-dragon', cover: 'cover-forest' },
  { test: 'Animais', icon: 'fa-paw', cover: 'cover-forest' },
  { test: 'Aventura', icon: 'fa-compass', cover: 'cover-sky' },
  { test: 'Princesa', icon: 'fa-crown', cover: 'cover-star' },
  { test: 'Natal', icon: 'fa-snowflake', cover: 'cover-moon' },
  { test: 'Clássicos', icon: 'fa-book-open', cover: 'cover-cozy' },
  { test: 'Curtas', icon: 'fa-feather', cover: 'cover-sea' },
  { test: 'Dormir', icon: 'fa-moon', cover: 'cover-moon' },
];
const validStoryIds = new Set(stories.map(story => story.id));
const grid = document.getElementById('storyGrid');
const empty = document.getElementById('emptyState');
const filters = document.getElementById('filters');
let readIds = new Set(loadReadIds().filter(id => validStoryIds.has(id)));
let filter = 'Todas';
let activeStory = null;
let readingSize = 16;

function loadReadIds() {
  try {
    const ids = JSON.parse(localStorage.getItem(KEY) || '[]');
    return Array.isArray(ids) ? ids : [];
  }
  catch { return []; }
}

function escapeHTML(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
}

function getStyle(story) {
  const found = icons.find(item => story.category.toLocaleLowerCase('pt-BR').includes(item.test.toLocaleLowerCase('pt-BR')));
  return found || { icon: 'fa-book-open', cover: 'cover-star' };
}

function categoriesFor(story) {
  return story.category.split(',').map(name => name.trim()).filter(Boolean);
}

function renderFilters() {
  const search = filters.querySelector('.search');
  filters.querySelectorAll('[data-filter]').forEach(button => button.remove());
  const buttons = [
    { name: 'Todas', label: `Todas <span>${stories.length}</span>` },
    ...categoryNames.map(name => ({ name, label: `${escapeHTML(name)} <span>${stories.filter(story => categoriesFor(story).includes(name)).length}</span>` })),
    { name: 'Já li', label: '<i class="fa-solid fa-check"></i> Já li' },
  ];
  for (const item of buttons) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `filter${item.name === filter ? ' active' : ''}`;
    button.dataset.filter = item.name;
    button.innerHTML = item.label;
    filters.insertBefore(button, search);
  }
}

function render() {
  const query = document.getElementById('search').value.trim().toLocaleLowerCase('pt-BR');
  const list = stories.filter(story => {
    const inFilter = filter === 'Todas' || (filter === 'Já li' ? readIds.has(story.id) : categoriesFor(story).includes(filter));
    const matches = `${story.title} ${story.desc} ${story.category}`.toLocaleLowerCase('pt-BR').includes(query);
    return inFilter && matches;
  });

  grid.innerHTML = list.map((story, index) => {
    const style = getStyle(story);
    const image = story.image ? `<img src="${escapeHTML(story.image)}" alt="" loading="lazy" onerror="this.remove()">` : '';
    const tags = categoriesFor(story);
    return `<article class="story-card" style="animation-delay:${Math.min(index * 20, 280)}ms"><div class="card-cover ${style.cover}"><i class="cover-icon fa-solid ${style.icon}"></i>${image}${readIds.has(story.id) ? '<span class="card-read"><i class="fa-solid fa-check"></i> Lida</span>' : ''}</div><div class="card-content"><div class="card-meta"><span class="card-category">${escapeHTML(tags[0] || 'História')}</span><span><i class="fa-regular fa-clock"></i> ${Number(story.minutes) || 1} min</span></div><h3 class="card-title">${escapeHTML(story.title)}</h3><p class="card-desc">${escapeHTML(story.desc)}</p><div class="card-bottom"><span>${readIds.has(story.id) ? 'Lida com carinho' : 'Uma história para sonhar'}</span><button class="read-link" data-open="${escapeHTML(story.id)}">Ler agora <i class="fa-solid fa-arrow-right"></i></button></div></div></article>`;
  }).join('');

  empty.hidden = list.length > 0;
  document.getElementById('readCount').textContent = readIds.size;
  document.getElementById('progressBar').style.width = `${stories.length ? readIds.size / stories.length * 100 : 0}%`;
  document.getElementById('progressText').textContent = readIds.size === 0
    ? `Você ainda não leu nenhuma das ${stories.length} histórias. Que tal começar?`
    : readIds.size >= stories.length
      ? 'Você leu todas! Que noite cheia de sonhos lindos.'
      : `Você já leu ${readIds.size} de ${stories.length} histórias. Continue sua coleção de sonhos!`;
  renderFilters();
}

function openStory(id) {
  activeStory = stories.find(story => story.id === id);
  if (!activeStory) return;
  const style = getStyle(activeStory);
  const tags = categoriesFor(activeStory);
  document.getElementById('readerCategory').textContent = `✦ ${tags.join(' · ')}`;
  document.getElementById('readerTime').textContent = `${Number(activeStory.minutes) || 1} min de leitura`;
  document.getElementById('readerMetaTime').textContent = `${Number(activeStory.minutes) || 1} min`;
  const wordCount = activeStory.body.join(' ').trim().split(/\s+/).filter(Boolean).length;
  document.getElementById('readerWordCount').textContent = `${wordCount.toLocaleString('pt-BR')} palavras`;
  const image = activeStory.image
    ? `<img src="${escapeHTML(activeStory.image)}" alt="Ilustração de ${escapeHTML(activeStory.title)}" onerror="this.remove()">`
    : `<i class="fa-solid ${style.icon}"></i>`;
  document.getElementById('readerIllustration').innerHTML = image;
  document.getElementById('readerTitle').textContent = activeStory.title;
  const content = document.getElementById('readerContent');
  content.replaceChildren(...activeStory.body.map(text => {
    const paragraph = document.createElement('p');
    paragraph.textContent = text;
    return paragraph;
  }));
  document.getElementById('readerSource').innerHTML = `<a href="${escapeHTML(activeStory.source)}" target="_blank" rel="noopener noreferrer">Fonte: Corujita <i class="fa-solid fa-arrow-up-right-from-square"></i></a>`;
  content.style.fontSize = `${readingSize}px`;
  const storyIndex = stories.findIndex(story => story.id === id);
  document.getElementById('previousStory').disabled = storyIndex <= 0;
  document.getElementById('nextStory').disabled = storyIndex < 0 || storyIndex >= stories.length - 1;
  document.getElementById('readerPanel').scrollTop = 0;
  const reader = document.getElementById('reader');
  reader.classList.add('open');
  reader.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  requestAnimationFrame(updateReaderProgress);
  document.getElementById('markRead').innerHTML = readIds.has(id) ? '<i class="fa-solid fa-heart"></i> Lida com carinho' : '<i class="fa-solid fa-check"></i> Terminei de ler';
}

function updateReaderProgress() {
  const panel = document.getElementById('readerPanel');
  const range = panel.scrollHeight - panel.clientHeight;
  const percent = range > 10 ? Math.round(panel.scrollTop / range * 100) : (activeStory ? 100 : 0);
  document.getElementById('readerProgressFill').style.width = `${percent}%`;
  document.getElementById('readerProgressLabel').textContent = `${percent}% lido`;
}

function changeStory(delta) {
  if (!activeStory) return;
  const index = stories.findIndex(story => story.id === activeStory.id) + delta;
  if (index >= 0 && index < stories.length) openStory(stories[index].id);
}

function closeReader() {
  const reader = document.getElementById('reader');
  reader.classList.remove('open');
  reader.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

function randomStory() {
  if (!stories.length) return;
  const unread = stories.filter(story => !readIds.has(story.id));
  const pool = unread.length ? unread : stories;
  openStory(pool[Math.floor(Math.random() * pool.length)].id);
}

filters.addEventListener('click', event => {
  const button = event.target.closest('[data-filter]');
  if (!button) return;
  filter = button.dataset.filter;
  render();
});
document.getElementById('search').addEventListener('input', render);
document.getElementById('randomStory').addEventListener('click', randomStory);
document.getElementById('heroRandom').addEventListener('click', randomStory);
document.getElementById('previousStory').addEventListener('click', () => changeStory(-1));
document.getElementById('nextStory').addEventListener('click', () => changeStory(1));
document.getElementById('readerPanel').addEventListener('scroll', updateReaderProgress, { passive: true });
document.querySelectorAll('[data-font-step]').forEach(button => button.addEventListener('click', () => {
  readingSize = Math.max(14, Math.min(24, readingSize + Number(button.dataset.fontStep)));
  document.getElementById('readerContent').style.fontSize = `${readingSize}px`;
}));
grid.addEventListener('click', event => {
  const button = event.target.closest('[data-open]');
  if (button) openStory(button.dataset.open);
});
document.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click', closeReader));
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeReader(); });
document.getElementById('markRead').addEventListener('click', () => {
  if (!activeStory) return;
  const isNew = !readIds.has(activeStory.id);
  readIds.add(activeStory.id);
  localStorage.setItem(KEY, JSON.stringify([...readIds]));
  render();
  closeReader();
  if (isNew) {
    const toast = document.getElementById('toast');
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2600);
  }
});

render();

let clickAudioContext;
function playClickSound() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return;
  clickAudioContext ||= new AudioContextClass();
  const context = clickAudioContext;
  if (context.state === 'suspended') context.resume().catch(() => {});

  const start = context.currentTime;
  const oscillator = context.createOscillator();
  const volume = context.createGain();
  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(880, start);
  oscillator.frequency.linearRampToValueAtTime(1320, start + 0.12);
  volume.gain.setValueAtTime(0.08, start);
  volume.gain.exponentialRampToValueAtTime(0.0001, start + 0.12);
  oscillator.connect(volume);
  volume.connect(context.destination);
  oscillator.start(start);
  oscillator.stop(start + 0.12);
}

document.addEventListener('click', event => {
  if (event.target.closest('button, a, [role="button"]')) playClickSound();
}, true);

const kuromiLoader = document.getElementById('kuromiLoader');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
window.addEventListener('load', () => {
  window.setTimeout(() => {
    kuromiLoader.classList.add('leaving');
    document.documentElement.classList.remove('is-loading');
    document.documentElement.classList.add('site-reveal');
    window.setTimeout(() => kuromiLoader.remove(), 750);
  }, reducedMotion ? 300 : 2100);
}, { once: true });
