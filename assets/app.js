// ── Config ────────────────────────────────────────────────────────────────────
const API_BASE = 'https://treasuretracker-production.up.railway.app';

const SET_NAMES = {
  OP01: 'Romance Dawn',
  OP02: 'Paramount War',
  OP03: 'Pillars of Strength',
  OP04: 'Kingdoms of Intrigue',
  OP05: 'Awakening of the New Era',
  OP06: 'Wings of the Captain',
  OP07: '500 Years in the Future',
  OP08: 'Two Legends',
  OP09: 'The Four Emperors',
};

const COLOR_BADGE = {
  Red:    'badge-red',
  Green:  'badge-green',
  Blue:   'badge-blue',
  Purple: 'badge-purple',
  Black:  'badge-multi',
  Yellow: 'badge-multi',
};

const RARITY_LABEL = {
  L:   'Leader',
  C:   'Common',
  UC:  'Uncommon',
  R:   'Rare',
  SR:  'Super Rare',
  SEC: 'Secret Rare',
};

// ── State ─────────────────────────────────────────────────────────────────────
let allCards      = [];
let activeSet     = 'OP01';
let activeColor   = 'all';
let activeType    = 'all';
let activeSort    = 'id';
let searchTerm    = '';

// ── DOM refs ──────────────────────────────────────────────────────────────────
const cardGrid    = document.getElementById('cardGrid');
const loadingMsg  = document.getElementById('loadingMsg');
const errorMsg    = document.getElementById('errorMsg');
const emptyMsg    = document.getElementById('emptyMsg');
const heroTitle   = document.getElementById('heroTitle');
const heroSub     = document.getElementById('heroSub');
const searchInput = document.getElementById('searchInput');
const sortSelect  = document.getElementById('sortSelect');
const overlay     = document.getElementById('overlay');

// ── Fetch ─────────────────────────────────────────────────────────────────────
async function loadSet(setCode) {
  showState('loading');
  document.getElementById('apiUrlDisplay').textContent = `${API_BASE}/sets/${setCode}/cards`;

  try {
    const res = await fetch(`${API_BASE}/sets/${setCode}/cards`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    allCards = data.cards || [];

    const totalVariants = allCards.reduce((sum, c) => sum + (c.variants || []).length, 0);
    const setName = SET_NAMES[setCode] || setCode;

    heroTitle.innerHTML = `${setName} <span class="set-code">${setCode}</span>`;
    heroSub.textContent = `${allCards.length} cards · ${totalVariants} variants · click any card to see all prints`;

    showState('grid');
    render();
  } catch (err) {
    console.error(err);
    showState('error');
  }
}

function showState(state) {
  loadingMsg.style.display = state === 'loading' ? 'flex' : 'none';
  errorMsg.style.display   = state === 'error'   ? 'flex' : 'none';
  emptyMsg.style.display   = state === 'empty'   ? 'flex' : 'none';
  cardGrid.style.display   = state === 'grid'    ? 'grid' : 'none';
}

// ── Render ────────────────────────────────────────────────────────────────────
function getFilteredCards() {
  let cards = [...allCards];

  if (searchTerm) {
    const q = searchTerm.toLowerCase();
    cards = cards.filter(c =>
      c.id.toLowerCase().includes(q) ||
      (c.name || '').toLowerCase().includes(q) ||
      (c.affiliations || []).some(a => a.toLowerCase().includes(q))
    );
  }

  if (activeColor !== 'all') {
    cards = cards.filter(c => (c.color || []).includes(activeColor));
  }

  if (activeType !== 'all') {
    cards = cards.filter(c => c.type === activeType);
  }

  if (activeSort === 'variants') {
    cards.sort((a, b) => (b.variants || []).length - (a.variants || []).length);
  } else if (activeSort === 'name') {
    cards.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  } else {
    cards.sort((a, b) => a.id.localeCompare(b.id));
  }

  return cards;
}

function colorBadgeHtml(colors) {
  if (!colors || !colors.length) return '';
  if (colors.length > 1) return `<span class="badge badge-multi">${colors.join('/')}</span>`;
  const cls = COLOR_BADGE[colors[0]] || 'badge-gray';
  return `<span class="badge ${cls}">${colors[0]}</span>`;
}

function getMainImageUrl(card) {
  const v = (card.variants || [])[0];
  return v && v.tcgplayer_image_url ? v.tcgplayer_image_url : null;
}

function cardHtml(card) {
  const img = getMainImageUrl(card);
  const variantCount = (card.variants || []).length;

  const imgHtml = img
    ? `<div class="card-img-wrap"><img class="card-img" src="${img}" alt="${escHtml(card.name || card.id)}" loading="lazy" onerror="this.parentElement.innerHTML='<div class=\\'card-img-ph\\'>${cardIconSvg()}</div>'"></div>`
    : `<div class="card-img-wrap"><div class="card-img-ph">${cardIconSvg()}</div></div>`;

  return `
    <article class="card" onclick="openCard('${card.id}')" tabindex="0" role="button" aria-label="View ${escHtml(card.name || card.id)} variants">
      ${imgHtml}
      <div class="card-body">
        <div class="card-id">${card.id}</div>
        <div class="card-name">${escHtml(card.name || '—')}</div>
        <div class="card-meta">
          ${colorBadgeHtml(card.color)}
          <span class="badge badge-gray">${RARITY_LABEL[card.rarity] || card.rarity || '—'}</span>
          <span class="badge badge-gray">${variantCount} variant${variantCount !== 1 ? 's' : ''}</span>
        </div>
      </div>
    </article>`;
}

function render() {
  const cards = getFilteredCards();

  if (!cards.length) {
    showState('empty');
    return;
  }

  showState('grid');
  cardGrid.innerHTML = cards.map(cardHtml).join('');

  // keyboard support
  cardGrid.querySelectorAll('.card').forEach(el => {
    el.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        el.click();
      }
    });
  });
}

// ── Card detail modal ─────────────────────────────────────────────────────────
function openCard(cardId) {
  const card = allCards.find(c => c.id === cardId);
  if (!card) return;

  // Header
  document.getElementById('mTitle').textContent = card.name || card.id;
  document.getElementById('mSub').textContent = `${card.id} · ${card.type || ''} · ${(card.color || []).join('/')}`;

  // Main image
  const mainImg = getMainImageUrl(card);
  const mImg    = document.getElementById('mImg');
  const mImgPh  = document.getElementById('mImgPh');
  if (mainImg) {
    mImg.src = mainImg;
    mImg.alt = card.name || card.id;
    mImg.style.display = 'block';
    mImgPh.style.display = 'none';
  } else {
    mImg.style.display = 'none';
    mImgPh.style.display = 'flex';
  }

  // Attributes
  const attrRows = [
    ['Type',      card.type      || '—'],
    ['Color',     (card.color || []).join(', ') || '—'],
    ['Rarity',    RARITY_LABEL[card.rarity] || card.rarity || '—'],
    ['Power',     card.power != null ? card.power.toLocaleString() : '—'],
    ['Attribute', card.attribute || '—'],
    card.cost  != null ? ['Cost',  card.cost]  :
    card.life  != null ? ['Life',  card.life]  : ['', ''],
  ].filter(([l]) => l);

  document.getElementById('mAttrs').innerHTML = attrRows.map(([l, v]) =>
    `<div><div class="attr-label">${l}</div><div class="attr-val">${escHtml(String(v))}</div></div>`
  ).join('');

  // Affiliations row
  if (card.affiliations && card.affiliations.length) {
    document.getElementById('mAttrs').innerHTML +=
      `<div style="grid-column:1/-1"><div class="attr-label">Affiliations</div><div class="attr-val" style="font-size:13px">${escHtml(card.affiliations.join(', '))}</div></div>`;
  }

  // Effect
  const effectWrap = document.getElementById('mEffectWrap');
  if (card.effect) {
    document.getElementById('mEffect').textContent = card.effect;
    effectWrap.style.display = 'block';
  } else {
    effectWrap.style.display = 'none';
  }

  // Variants
  const variants = card.variants || [];
  document.getElementById('vHeading').textContent = `${variants.length} variant${variants.length !== 1 ? 's' : ''}`;

  document.getElementById('vGrid').innerHTML = variants.map(v => {
    const vi = v.tcgplayer_image_url
      ? `<div class="variant-img-wrap"><img class="variant-img" src="${v.tcgplayer_image_url}" alt="${escHtml(v.label)}" loading="lazy" onerror="this.parentElement.innerHTML='<div class=\\'variant-img-ph\\'>${cardIconSvg()}</div>'"></div>`
      : `<div class="variant-img-wrap"><div class="variant-img-ph">${cardIconSvg()}</div></div>`;

    const method = v.acquisition && v.acquisition.method
      ? v.acquisition.method.replace(/_/g, ' ')
      : '';

    const link = v.tcgplayer_url
      ? `<a class="tcg-link" href="${v.tcgplayer_url}" target="_blank" rel="noopener">
           TCGPlayer
           <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
         </a>`
      : '';

    return `
      <div class="variant-card">
        ${vi}
        <div class="variant-info">
          <div class="variant-label">${escHtml(v.label)}</div>
          <div class="variant-finish">${escHtml(v.finish || '')}</div>
          ${method ? `<div class="variant-method">${escHtml(method)}</div>` : ''}
          ${link}
        </div>
      </div>`;
  }).join('');

  overlay.style.display = 'flex';
  document.body.style.overflow = 'hidden';
  document.getElementById('closeBtn').focus();
}

function closeModal() {
  overlay.style.display = 'none';
  document.body.style.overflow = '';
}

// ── Event listeners ───────────────────────────────────────────────────────────
document.getElementById('closeBtn').addEventListener('click', closeModal);

overlay.addEventListener('click', e => {
  if (e.target === overlay) closeModal();
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && overlay.style.display === 'flex') closeModal();
});

searchInput.addEventListener('input', e => {
  searchTerm = e.target.value.trim();
  render();
});

sortSelect.addEventListener('change', e => {
  activeSort = e.target.value;
  render();
});

// Color filter pills
document.querySelectorAll('.pill[data-filter]').forEach(pill => {
  pill.addEventListener('click', () => {
    document.querySelectorAll('.pill[data-filter]').forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
    activeColor = pill.dataset.filter;
    render();
  });
});

// Type filter pills
document.querySelectorAll('.pill[data-type]').forEach(pill => {
  pill.addEventListener('click', () => {
    document.querySelectorAll('.pill[data-type]').forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
    activeType = pill.dataset.type;
    render();
  });
});

// Set switcher
document.querySelectorAll('.set-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.set-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeSet = btn.dataset.set;
    activeColor = 'all';
    activeType = 'all';
    searchTerm = '';
    searchInput.value = '';
    document.querySelectorAll('.pill[data-filter]').forEach((p, i) => p.classList.toggle('active', i === 0));
    document.querySelectorAll('.pill[data-type]').forEach((p, i) => p.classList.toggle('active', i === 0));
    loadSet(activeSet);
  });
});

// ── Helpers ───────────────────────────────────────────────────────────────────
function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function cardIconSvg() {
  return `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="18" rx="2"/><line x1="9" y1="9" x2="15" y2="9"/><line x1="9" y1="13" x2="15" y2="13"/></svg>`;
}

// ── Init ──────────────────────────────────────────────────────────────────────
loadSet(activeSet);
