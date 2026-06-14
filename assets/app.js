// ── Config ────────────────────────────────────────────────────────────────────
const API_BASE = 'https://treasuretracker-production.up.railway.app';

// All sets in order — add new ones here as you build them out
// "available: true" means the API has data for this set
// "available: false" means it's coming soon
const ALL_SETS = [
  { code: 'OP01', name: 'Romance Dawn',             available: true  },
  { code: 'OP02', name: 'Paramount War',            available: true  },
  { code: 'OP03', name: 'Pillars of Strength',      available: false },
  { code: 'OP04', name: 'Kingdoms of Intrigue',     available: false },
  { code: 'OP05', name: 'Awakening of the New Era', available: false },
  { code: 'OP06', name: 'Wings of the Captain',     available: false },
  { code: 'EB01', name: 'Memorial Collection',      available: false },
  { code: 'OP07', name: '500 Years in the Future',  available: false },
  { code: 'OP08', name: 'Two Legends',              available: false },
  { code: 'OP09', name: 'The Four Emperors',        available: false },
];

const COLOR_BADGE = {
  Red:    'badge-red',
  Green:  'badge-green',
  Blue:   'badge-blue',
  Purple: 'badge-purple',
  Black:  'badge-black',
  Yellow: 'badge-yellow',
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
let activeColors  = new Set();  // empty = All
let activeTypes   = new Set();  // empty = All
let activeRarities= new Set();  // empty = All
let activeSort    = 'id';
let searchTerm    = '';

// ── DOM refs ──────────────────────────────────────────────────────────────────
const cardGrid    = document.getElementById('cardGrid');
const loadingMsg  = document.getElementById('loadingMsg');
const errorMsg    = document.getElementById('errorMsg');
const emptyMsg    = document.getElementById('emptyMsg');
const comingSoon  = document.getElementById('comingSoon');
const heroTitle   = document.getElementById('heroTitle');
const heroSub     = document.getElementById('heroSub');
const searchInput = document.getElementById('searchInput');
const sortSelect  = document.getElementById('sortSelect');
const overlay     = document.getElementById('overlay');
const setNav      = document.getElementById('setNav');

// ── Build set nav ─────────────────────────────────────────────────────────────
function buildSetNav() {
  setNav.innerHTML = ALL_SETS.map(s => `
    <button
      class="set-btn${s.code === activeSet ? ' active' : ''}${!s.available ? ' unavailable' : ''}"
      data-set="${s.code}"
      data-available="${s.available}"
      title="${s.name}${!s.available ? ' (coming soon)' : ''}"
    >${s.code}</button>
  `).join('');

  setNav.querySelectorAll('.set-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const set = ALL_SETS.find(s => s.code === btn.dataset.set);
      if (!set) return;

      setNav.querySelectorAll('.set-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeSet = set.code;

      // Reset filters
      activeColors.clear();
      activeTypes.clear();
      activeRarities.clear();
      searchTerm    = '';
      searchInput.value = '';
      document.querySelectorAll('.pill[data-group]').forEach(p => {
        p.classList.toggle('active', p.dataset.value === 'all');
      });

      if (set.available) {
        loadSet(set.code);
      } else {
        showComingSoon(set);
      }
    });
  });
}

// ── Fetch ─────────────────────────────────────────────────────────────────────
async function loadSet(setCode) {
  const set = ALL_SETS.find(s => s.code === setCode);
  showState('loading');
  updateHero(set, null);
  document.getElementById('apiUrlDisplay').textContent = `${API_BASE}/sets/${setCode}/cards`;

  try {
    const res = await fetch(`${API_BASE}/sets/${setCode}/cards`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    allCards = data.cards || [];

    const totalVariants = allCards.reduce((sum, c) => sum + (c.variants || []).length, 0);
    updateHero(set, { cards: allCards.length, variants: totalVariants });

    showState('grid');
    render();
  } catch (err) {
    console.error(err);
    showState('error');
  }
}

function showComingSoon(set) {
  allCards = [];
  updateHero(set, null);
  showState('coming-soon');
}

function updateHero(set, stats) {
  if (!set) return;
  heroTitle.innerHTML = `${set.name} <span class="set-code">${set.code}</span>`;
  if (stats) {
    heroSub.textContent = `${stats.cards} cards · ${stats.variants} variants · click any card to see all prints`;
  } else if (!set.available) {
    heroSub.textContent = 'This set hasn\'t been added yet — check back soon.';
  } else {
    heroSub.textContent = 'Loading...';
  }
}

function showState(state) {
  loadingMsg.style.display   = state === 'loading'      ? 'flex'  : 'none';
  errorMsg.style.display     = state === 'error'        ? 'flex'  : 'none';
  emptyMsg.style.display     = state === 'empty'        ? 'flex'  : 'none';
  comingSoon.style.display   = state === 'coming-soon'  ? 'flex'  : 'none';
  cardGrid.style.display     = state === 'grid'         ? 'grid'  : 'none';
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

  if (activeColors.size > 0) {
    cards = cards.filter(c => (c.color || []).some(col => activeColors.has(col)));
  }

  if (activeTypes.size > 0) {
    cards = cards.filter(c => activeTypes.has(c.type));
  }

  if (activeRarities.size > 0) {
    cards = cards.filter(c => activeRarities.has(c.rarity));
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

const MISSING_PLACEHOLDER = 'image-missing';

// All valid image URLs across a card's variants, with the preferred base image first
function getImageUrls(card) {
  const preferred = getMainImageUrl(card);
  const all = (card.variants || [])
    .map(v => v.tcgplayer_image_url)
    .filter(u => u && !u.includes(MISSING_PLACEHOLDER));
  if (!preferred) return all;
  return [preferred, ...all.filter(u => u !== preferred)];
}

// Priority order for picking the "hero" display image:
// Normal base print first, then parallel, then anything else
const LABEL_PRIORITY = ['normal', 'parallel rare', 'parallel'];

function getMainImageUrl(card) {
  const variants = (card.variants || []).filter(
    v => v.tcgplayer_image_url && !v.tcgplayer_image_url.includes(MISSING_PLACEHOLDER)
  );
  if (!variants.length) return null;

  // Try to find a base set print first
  for (const priority of LABEL_PRIORITY) {
    const match = variants.find(v =>
      (v.label || '').toLowerCase().startsWith(priority) &&
      (v.acquisition?.method === 'booster_pack' || v.acquisition?.method === 'starter_deck')
    );
    if (match) return match.tcgplayer_image_url;
  }

  // Fall back to first available
  return variants[0].tcgplayer_image_url;
}

// Attaches a smart fallback chain to an img element.
// On error OR if TCGPlayer serves their tiny placeholder (naturalWidth < 10),
// tries the next URL in the list. Falls back to the placeholder HTML when exhausted.
function attachSmartFallback(img, urls, fallbackHtml) {
  let idx = 0;

  function tryNext() {
    idx++;
    if (idx < urls.length) {
      img.src = urls[idx];
    } else {
      img.parentElement.innerHTML = fallbackHtml;
    }
  }

  img.addEventListener('load', () => {
    // TCGPlayer's missing image SVG loads as a 1px image
    if (img.naturalWidth > 0 && img.naturalWidth < 10) tryNext();
  });
  img.addEventListener('error', tryNext);
}

// Fix: use a data attribute + delegated JS handler instead of inline onerror
function cardHtml(card) {
  const img = getMainImageUrl(card);
  const variantCount = (card.variants || []).length;

  const imgHtml = img
    ? `<div class="card-img-wrap"><img class="card-img" src="${img}" alt="${escHtml(card.name || card.id)}" loading="lazy" data-fallback="1"></div>`
    : `<div class="card-img-wrap"><div class="card-img-ph">${cardIconSvg()}</div></div>`;

  return `
    <article class="card" data-id="${card.id}" tabindex="0" role="button" aria-label="View ${escHtml(card.name || card.id)} variants">
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

  // Attach click + keyboard handlers
  cardGrid.querySelectorAll('.card').forEach(el => {
    el.addEventListener('click', () => openCard(el.dataset.id));
    el.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openCard(el.dataset.id); }
    });
  });

  // Attach smart fallback to card grid images
  cardGrid.querySelectorAll('img[data-fallback]').forEach(img => {
    const card = allCards.find(c => c.id === img.closest('.card').dataset.id);
    const urls = card ? getImageUrls(card) : [];
    attachSmartFallback(img, urls, `<div class="card-img-ph">${cardIconSvg()}</div>`);
  });
}

// ── Card detail modal ─────────────────────────────────────────────────────────
function openCard(cardId) {
  const card = allCards.find(c => c.id === cardId);
  if (!card) return;

  document.getElementById('mTitle').textContent = card.name || card.id;
  document.getElementById('mSub').textContent = `${card.id} · ${card.type || ''} · ${(card.color || []).join('/')}`;

  const allImgUrls = getImageUrls(card);
  const mImg    = document.getElementById('mImg');
  const mImgPh  = document.getElementById('mImgPh');
  if (allImgUrls.length) {
    mImg.src = allImgUrls[0];
    mImg.alt = card.name || card.id;
    mImg.style.display = 'block';
    mImgPh.style.display = 'none';
    attachSmartFallback(mImg, allImgUrls, '');
    mImg.addEventListener('error', () => { mImg.style.display = 'none'; mImgPh.style.display = 'flex'; }, { once: true });
  } else {
    mImg.style.display = 'none';
    mImgPh.style.display = 'flex';
  }

  const attrRows = [
    ['Type',      card.type      || '—'],
    ['Color',     (card.color || []).join(', ') || '—'],
    ['Rarity',    RARITY_LABEL[card.rarity] || card.rarity || '—'],
    ['Power',     card.power != null ? card.power : '—'],
    ['Attribute', card.attribute || '—'],
    card.cost != null ? ['Cost', card.cost] :
    card.life != null ? ['Life', card.life] : null,
  ].filter(Boolean);

  let attrsHtml = attrRows.map(([l, v]) =>
    `<div><div class="attr-label">${l}</div><div class="attr-val">${escHtml(String(v))}</div></div>`
  ).join('');

  if (card.affiliations && card.affiliations.length) {
    attrsHtml += `<div style="grid-column:1/-1"><div class="attr-label">Affiliations</div><div class="attr-val" style="font-size:13px">${escHtml(card.affiliations.join(', '))}</div></div>`;
  }
  document.getElementById('mAttrs').innerHTML = attrsHtml;

  const effectWrap = document.getElementById('mEffectWrap');
  if (card.effect) {
    document.getElementById('mEffect').textContent = card.effect;
    effectWrap.style.display = 'block';
  } else {
    effectWrap.style.display = 'none';
  }

  const variants = card.variants || [];
  document.getElementById('vHeading').textContent = `${variants.length} variant${variants.length !== 1 ? 's' : ''}`;

  document.getElementById('vGrid').innerHTML = variants.map(v => {
    const method = v.acquisition && v.acquisition.method
      ? v.acquisition.method.replace(/_/g, ' ')
      : '';
    const link = v.tcgplayer_url
      ? `<a class="tcg-link" href="${v.tcgplayer_url}" target="_blank" rel="noopener">TCGPlayer ${externalLinkSvg()}</a>`
      : '';

    return `<div class="variant-card" data-img="${v.tcgplayer_image_url || ''}">
      <div class="variant-img-wrap">
        ${v.tcgplayer_image_url
          ? `<img class="variant-img" src="${v.tcgplayer_image_url}" alt="${escHtml(v.label)}" loading="lazy" data-fallback="1">`
          : `<div class="variant-img-ph">${cardIconSvg()}</div>`}
      </div>
      <div class="variant-info">
        <div class="variant-label">${escHtml(v.label)}</div>
        <div class="variant-finish">${escHtml(v.finish || '')}</div>
        ${method ? `<div class="variant-method">${escHtml(method)}</div>` : ''}
        ${link}
      </div>
    </div>`;
  }).join('');

  // Fallback for variant images (each variant only has one URL, so just handle missing)
  document.querySelectorAll('#vGrid img[data-fallback]').forEach(img => {
    attachSmartFallback(img, [img.src], `<div class="variant-img-ph">${cardIconSvg()}</div>`);
  });

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
overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && overlay.style.display === 'flex') closeModal();
});

searchInput.addEventListener('input', e => { searchTerm = e.target.value.trim(); render(); });
sortSelect.addEventListener('change', e => { activeSort = e.target.value; render(); });

document.querySelectorAll('.pill[data-group]').forEach(pill => {
  pill.addEventListener('click', () => {
    const group = pill.dataset.group;
    const value = pill.dataset.value;

    // Map group name to the active Set
    const stateMap = {
      color:  activeColors,
      type:   activeTypes,
      rarity: activeRarities,
    };
    const activeSet = stateMap[group];
    const allPillsInGroup = document.querySelectorAll(`.pill[data-group="${group}"]`);
    const allPill = document.querySelector(`.pill[data-group="${group}"][data-value="all"]`);

    if (value === 'all') {
      // Clicking All clears everything in this group
      activeSet.clear();
      allPillsInGroup.forEach(p => p.classList.remove('active'));
      allPill.classList.add('active');
    } else {
      // Toggle this value
      if (activeSet.has(value)) {
        activeSet.delete(value);
      } else {
        activeSet.add(value);
      }
      // If nothing selected, revert to All
      if (activeSet.size === 0) {
        allPill.classList.add('active');
      } else {
        allPill.classList.remove('active');
      }
      // Sync active class
      pill.classList.toggle('active', activeSet.has(value));
    }

    render();
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

function externalLinkSvg() {
  return `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>`;
}

// ── Init ──────────────────────────────────────────────────────────────────────
buildSetNav();
loadSet(activeSet);