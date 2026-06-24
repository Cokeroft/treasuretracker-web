// ── Config ────────────────────────────────────────────────────────────────────
const API_BASE = 'https://treasuretracker-production.up.railway.app';

// Mirror of ALL_SETS from app.js — kept in sync manually when sets are added
const ALL_SETS = [
  { code: 'OP01',  available: true }, { code: 'OP02',  available: true },
  { code: 'OP03',  available: true }, { code: 'OP04',  available: true },
  { code: 'OP05',  available: false },{ code: 'OP06',  available: false },
  { code: 'OP07',  available: false },{ code: 'OP08',  available: true },
  { code: 'OP09',  available: true }, { code: 'OP10',  available: true },
  { code: 'OP11',  available: true }, { code: 'OP12',  available: true },
  { code: 'OP13',  available: true }, { code: 'OP14',  available: true },
  { code: 'OP15',  available: true }, { code: 'OP16',  available: true },
  { code: 'PRB01', available: false },{ code: 'PRB02', available: false },
  { code: 'ST01',  available: true }, { code: 'ST02',  available: true },
  { code: 'ST03',  available: true }, { code: 'ST04',  available: true },
  { code: 'ST05',  available: false },{ code: 'ST06',  available: false },
  { code: 'ST07',  available: false },{ code: 'ST08',  available: false },
  { code: 'ST09',  available: false },{ code: 'ST10',  available: false },
  { code: 'ST11',  available: false },{ code: 'ST12',  available: false },
  { code: 'ST13',  available: false },{ code: 'ST14',  available: false },
  { code: 'ST15',  available: false },{ code: 'ST16',  available: false },
  { code: 'ST17',  available: false },{ code: 'ST18',  available: false },
  { code: 'ST19',  available: false },{ code: 'ST20',  available: false },
  { code: 'ST21',  available: false },{ code: 'ST22',  available: false },
  { code: 'ST23',  available: false },{ code: 'ST24',  available: false },
  { code: 'ST25',  available: false },{ code: 'ST26',  available: false },
  { code: 'ST27',  available: false },{ code: 'ST28',  available: false },
  { code: 'ST29',  available: false },{ code: 'ST30',  available: false },
  { code: 'EB01',  available: true }, { code: 'EB02',  available: true },
  { code: 'EB03',  available: true }, { code: 'EB04',  available: true },
];

const COLOR_BADGE = {
  Red: 'badge-red', Green: 'badge-green', Blue: 'badge-blue',
  Purple: 'badge-purple', Black: 'badge-black', Yellow: 'badge-yellow',
};
const RARITY_LABEL = { L: 'Leader', C: 'Common', UC: 'Uncommon', R: 'Rare', SR: 'Super Rare', SEC: 'Secret Rare' };
const MAX_COPIES = 4;
const DECK_SIZE = 50;

// ── State ─────────────────────────────────────────────────────────────────────
let allCards = [];          // every card across every available set
let selectedLeader = null;  // the chosen leader card object
let deck = new Map();       // cardId -> { card, count }
let currentView = 'browse'; // 'browse' | 'deck'
let poolSearchTerm = '';
let poolType = 'all';
let poolSort = 'id';
let currentCardList = [];   // for modal prev/next nav
let currentCardIndex = -1;
let modalContext = 'pool';  // 'pool' | 'deck' | 'leader' — affects modal deck-action button

// ── DOM refs ──────────────────────────────────────────────────────────────────
const leaderSelectSection = document.getElementById('leaderSelectSection');
const builderSection      = document.getElementById('builderSection');
const leaderGrid          = document.getElementById('leaderGrid');
const leaderLoadingMsg    = document.getElementById('leaderLoadingMsg');
const leaderSearchInput   = document.getElementById('leaderSearchInput');
const poolGrid            = document.getElementById('poolGrid');
const poolEmptyMsg        = document.getElementById('poolEmptyMsg');
const poolSearchInput     = document.getElementById('poolSearchInput');
const poolSortSelect      = document.getElementById('poolSortSelect');
const browseView          = document.getElementById('browseView');
const deckView             = document.getElementById('deckView');
const deckList            = document.getElementById('deckList');
const deckEmptyMsg        = document.getElementById('deckEmptyMsg');
const deckRulesWarnings   = document.getElementById('deckRulesWarnings');
const overlay             = document.getElementById('overlay');

// ── Fetch all cards across every available set ──────────────────────────────
async function loadAllCards() {
  const available = ALL_SETS.filter(s => s.available);
  const results = await Promise.all(
    available.map(s =>
      fetch(`${API_BASE}/sets/${s.code}/cards`)
        .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
        .then(d => d.cards || [])
        .catch(() => [])
    )
  );
  allCards = results.flat();
}

// ── Leader selection ─────────────────────────────────────────────────────────
function getAllLeaders() {
  return allCards.filter(c => c.type === 'Leader');
}

function renderLeaderGrid(searchTerm = '') {
  let leaders = getAllLeaders();
  if (searchTerm) {
    const q = searchTerm.toLowerCase();
    leaders = leaders.filter(c =>
      c.id.toLowerCase().includes(q) || (c.name || '').toLowerCase().includes(q)
    );
  }
  leaders.sort((a, b) => a.id.localeCompare(b.id));

  leaderGrid.innerHTML = leaders.map(card => {
    const img = getMainImageUrl(card);
    const imgHtml = img
      ? `<div class="card-img-wrap"><img class="card-img" src="${img}" alt="${escHtml(card.name || card.id)}" loading="lazy" data-fallback="1"></div>`
      : `<div class="card-img-wrap"><div class="card-img-ph">${cardIconSvg()}</div></div>`;
    return `
      <article class="card" data-id="${card.id}" tabindex="0" role="button" aria-label="Select ${escHtml(card.name || card.id)} as Leader">
        ${imgHtml}
        <div class="card-body">
          <div class="card-id">${card.id}</div>
          <div class="card-name">${escHtml(card.name || '—')}</div>
          <div class="card-meta">
            ${colorBadgeHtml(card.color)}
            <span class="badge badge-gray">${card.set || card.id.split('-')[0]}</span>
          </div>
        </div>
      </article>`;
  }).join('');

  leaderGrid.querySelectorAll('.card').forEach(el => {
    el.addEventListener('click', () => selectLeader(el.dataset.id));
  });

  leaderGrid.querySelectorAll('img[data-fallback]').forEach(img => {
    const card = leaders.find(c => c.id === img.closest('.card').dataset.id);
    const urls = card ? getImageUrls(card) : [];
    attachSmartFallback(img, urls, `<div class="card-img-ph">${cardIconSvg()}</div>`);
  });
}

function selectLeader(cardId) {
  const card = allCards.find(c => c.id === cardId);
  if (!card) return;

  selectedLeader = card;
  deck.clear();

  document.getElementById('selLeaderImg').src = getMainImageUrl(card) || '';
  document.getElementById('selLeaderName').textContent = card.name || card.id;
  document.getElementById('selLeaderMeta').textContent =
    `${card.id} · ${(card.color || []).join('/')} · Life ${card.life ?? '—'}`;

  leaderSelectSection.style.display = 'none';
  builderSection.style.display = 'block';

  setView('browse');
  renderPool();
  updateDeckProgress();
}

function changeLeader() {
  selectedLeader = null;
  deck.clear();
  builderSection.style.display = 'none';
  leaderSelectSection.style.display = 'block';
  leaderSearchInput.value = '';
  renderLeaderGrid();
}

// ── Card pool (browse view, color-locked to leader) ─────────────────────────
function getLeaderColors() {
  return selectedLeader ? (selectedLeader.color || []) : [];
}

function getPoolCards() {
  const leaderColors = getLeaderColors();
  let cards = allCards.filter(c =>
    c.type !== 'Leader' &&
    (c.color || []).some(col => leaderColors.includes(col))
  );

  if (poolSearchTerm) {
    const q = poolSearchTerm.toLowerCase();
    cards = cards.filter(c =>
      c.id.toLowerCase().includes(q) ||
      (c.name || '').toLowerCase().includes(q) ||
      (c.affiliations || []).some(a => a.toLowerCase().includes(q))
    );
  }

  if (poolType !== 'all') {
    cards = cards.filter(c => c.type === poolType);
  }

  if (poolSort === 'cost') {
    cards.sort((a, b) => (a.cost ?? 99) - (b.cost ?? 99));
  } else if (poolSort === 'name') {
    cards.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  } else {
    cards.sort((a, b) => a.id.localeCompare(b.id));
  }

  return cards;
}

function renderPool() {
  const cards = getPoolCards();
  currentCardList = cards;

  if (!cards.length) {
    poolGrid.style.display = 'none';
    poolEmptyMsg.style.display = 'block';
    return;
  }
  poolEmptyMsg.style.display = 'none';
  poolGrid.style.display = 'grid';

  poolGrid.innerHTML = cards.map(card => {
    const img = getMainImageUrl(card);
    const inDeck = deck.get(card.id);
    const count = inDeck ? inDeck.count : 0;
    const maxed = count >= MAX_COPIES;

    const imgHtml = img
      ? `<div class="card-img-wrap"><img class="card-img" src="${img}" alt="${escHtml(card.name || card.id)}" loading="lazy" data-fallback="1"></div>`
      : `<div class="card-img-wrap"><div class="card-img-ph">${cardIconSvg()}</div></div>`;

    return `
      <div class="pool-card-wrap${maxed ? ' pool-card-maxed' : ''}">
        <article class="card" data-id="${card.id}" tabindex="0">
          ${imgHtml}
          <div class="card-body">
            <div class="card-id">${card.id}</div>
            <div class="card-name">${escHtml(card.name || '—')}</div>
            <div class="card-meta">
              ${colorBadgeHtml(card.color)}
              <span class="badge badge-gray">${card.type}</span>
              ${card.cost != null ? `<span class="badge badge-gray">Cost ${card.cost}</span>` : ''}
            </div>
          </div>
        </article>
        ${count > 0 ? `<span class="pool-card-count-badge">${count}</span>` : ''}
        ${count > 0 ? `<button class="pool-sub-btn" data-id="${card.id}" title="Remove one" aria-label="Remove one ${escHtml(card.name || card.id)} from deck">−</button>` : ''}
        <button class="pool-add-btn" data-id="${card.id}" title="Add to deck" aria-label="Add ${escHtml(card.name || card.id)} to deck" ${maxed ? 'disabled' : ''}>+</button>
      </div>`;
  }).join('');

  poolGrid.querySelectorAll('.card').forEach(el => {
    el.addEventListener('click', () => { modalContext = 'pool'; openCard(el.dataset.id); });
  });

  poolGrid.querySelectorAll('.pool-add-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      addToDeck(btn.dataset.id);
    });
  });

  poolGrid.querySelectorAll('.pool-sub-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      removeFromDeck(btn.dataset.id);
    });
  });

  poolGrid.querySelectorAll('img[data-fallback]').forEach(img => {
    const card = cards.find(c => c.id === img.closest('.card').dataset.id);
    const urls = card ? getImageUrls(card) : [];
    attachSmartFallback(img, urls, `<div class="card-img-ph">${cardIconSvg()}</div>`);
  });

  renderSidebar();
}

// ── Deck management ───────────────────────────────────────────────────────────
function getMainDeckCount() {
  let total = 0;
  for (const { count } of deck.values()) total += count;
  return total;
}

function addToDeck(cardId) {
  const card = allCards.find(c => c.id === cardId);
  if (!card) return;
  const existing = deck.get(cardId);
  const count = existing ? existing.count : 0;
  if (count >= MAX_COPIES) return;
  deck.set(cardId, { card, count: count + 1 });
  updateDeckProgress();
  if (currentView === 'browse') renderPool();
  if (currentView === 'deck') renderDeckList();
  updateModalDeckActions();
}

function removeFromDeck(cardId, removeAll = false) {
  const existing = deck.get(cardId);
  if (!existing) return;
  if (removeAll || existing.count <= 1) {
    deck.delete(cardId);
  } else {
    deck.set(cardId, { card: existing.card, count: existing.count - 1 });
  }
  updateDeckProgress();
  if (currentView === 'browse') renderPool();
  if (currentView === 'deck') renderDeckList();
  updateModalDeckActions();
}

function updateDeckProgress() {
  const total = getMainDeckCount();
  document.getElementById('deckMainCount').textContent = total;
  document.getElementById('deckCountBadge').textContent = total;

  const fill = document.getElementById('deckProgressFill');
  const pct = Math.min(100, (total / DECK_SIZE) * 100);
  fill.style.width = `${pct}%`;
  fill.classList.toggle('over', total > DECK_SIZE);
  fill.classList.toggle('complete', total === DECK_SIZE);
}

function renderDeckRulesWarnings() {
  const total = getMainDeckCount();
  const warnings = [];

  if (total < DECK_SIZE) {
    warnings.push(`Your deck needs ${DECK_SIZE - total} more card${DECK_SIZE - total !== 1 ? 's' : ''} to reach the required 50.`);
  } else if (total > DECK_SIZE) {
    warnings.push(`Your deck has ${total - DECK_SIZE} too many cards. Remove some to reach exactly 50.`);
  }

  deckRulesWarnings.innerHTML = warnings.map(w => `
    <div class="deck-warning">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      ${w}
    </div>
  `).join('');
}

function renderDeckList() {
  renderDeckRulesWarnings();

  const entries = [...deck.values()].sort((a, b) => a.card.id.localeCompare(b.card.id));

  if (!entries.length) {
    deckList.style.display = 'none';
    deckEmptyMsg.style.display = 'block';
    return;
  }
  deckEmptyMsg.style.display = 'none';
  deckList.style.display = 'flex';

  deckList.innerHTML = entries.map(({ card, count }) => {
    const img = getMainImageUrl(card);
    const thumb = img
      ? `<img class="deck-row-thumb" src="${img}" alt="${escHtml(card.name || card.id)}" data-id="${card.id}" loading="lazy">`
      : `<div class="deck-row-thumb-ph" data-id="${card.id}">${cardIconSvg()}</div>`;

    return `
      <div class="deck-row">
        ${thumb}
        <div class="deck-row-info" data-id="${card.id}">
          <div class="deck-row-name">${colorDotHtml(card.color)} ${escHtml(card.name || card.id)}</div>
          <div class="deck-row-meta">
            <span>${card.id}</span>
            ${colorBadgeHtml(card.color)}
            <span class="badge badge-gray">${card.type}</span>
          </div>
        </div>
        <div class="deck-row-controls">
          <button class="deck-qty-btn" data-action="dec" data-id="${card.id}" aria-label="Remove one">−</button>
          <span class="deck-qty-count">${count}</span>
          <button class="deck-qty-btn" data-action="inc" data-id="${card.id}" ${count >= MAX_COPIES ? 'disabled' : ''} aria-label="Add one">+</button>
          <button class="deck-row-remove" data-action="remove" data-id="${card.id}" aria-label="Remove all copies">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
          </button>
        </div>
      </div>`;
  }).join('');

  deckList.querySelectorAll('.deck-row-info, .deck-row-thumb, .deck-row-thumb-ph').forEach(el => {
    el.addEventListener('click', () => { modalContext = 'deck'; openCard(el.dataset.id); });
  });
  deckList.querySelectorAll('[data-action="inc"]').forEach(btn => btn.addEventListener('click', () => addToDeck(btn.dataset.id)));
  deckList.querySelectorAll('[data-action="dec"]').forEach(btn => btn.addEventListener('click', () => removeFromDeck(btn.dataset.id)));
  deckList.querySelectorAll('[data-action="remove"]').forEach(btn => btn.addEventListener('click', () => removeFromDeck(btn.dataset.id, true)));
}

// ── Sidebar (always-visible deck list while browsing) ────────────────────────
function renderSidebar() {
  const sidebarCount = document.getElementById('sidebarDeckCount');
  const sidebarEmpty = document.getElementById('sidebarEmptyMsg');
  const sidebarList  = document.getElementById('sidebarDeckList');
  const sidebarWarnings = document.getElementById('sidebarDeckRulesWarnings');
  if (!sidebarList) return;

  const total = getMainDeckCount();
  sidebarCount.textContent = `${total} / ${DECK_SIZE}`;
  sidebarCount.style.color = total === DECK_SIZE ? '#4ade80' : total > DECK_SIZE ? '#f87171' : '';

  const warnings = [];
  if (total > DECK_SIZE) warnings.push(`${total - DECK_SIZE} too many`);
  sidebarWarnings.innerHTML = warnings.length
    ? `<div class="deck-warning" style="font-size:11px;padding:5px 8px">${warnings[0]}</div>`
    : '';

  const entries = [...deck.values()].sort((a, b) => a.card.id.localeCompare(b.card.id));

  if (!entries.length) {
    sidebarList.style.display = 'none';
    sidebarEmpty.style.display = 'block';
    return;
  }
  sidebarEmpty.style.display = 'none';
  sidebarList.style.display = 'flex';

  sidebarList.innerHTML = entries.map(({ card, count }) => {
    const img = getMainImageUrl(card);
    const thumb = img
      ? `<img class="sidebar-row-thumb" src="${img}" alt="${escHtml(card.name || card.id)}" data-id="${card.id}" loading="lazy">`
      : `<div class="sidebar-row-thumb-ph" data-id="${card.id}">${cardIconSvg()}</div>`;

    return `
      <div class="sidebar-row">
        ${thumb}
        ${colorDotHtml(card.color)}
        <span class="sidebar-row-name" data-id="${card.id}" title="${escHtml(card.name || card.id)}">${escHtml(card.name || card.id)}</span>
        <div class="sidebar-row-controls">
          <button class="sidebar-qty-btn" data-action="dec" data-id="${card.id}" aria-label="Remove one">−</button>
          <span class="sidebar-qty-count">${count}</span>
          <button class="sidebar-qty-btn" data-action="inc" data-id="${card.id}" ${count >= MAX_COPIES ? 'disabled' : ''} aria-label="Add one">+</button>
        </div>
      </div>`;
  }).join('');

  sidebarList.querySelectorAll('.sidebar-row-thumb, .sidebar-row-thumb-ph, .sidebar-row-name').forEach(el => {
    el.addEventListener('click', () => {
      modalContext = 'deck';
      // Use the deck (sorted) order for prev/next nav when opened from sidebar
      currentCardList = entries.map(e => e.card);
      openCard(el.dataset.id);
    });
  });
  sidebarList.querySelectorAll('[data-action="inc"]').forEach(btn => btn.addEventListener('click', () => addToDeck(btn.dataset.id)));
  sidebarList.querySelectorAll('[data-action="dec"]').forEach(btn => btn.addEventListener('click', () => removeFromDeck(btn.dataset.id)));
}

// ── View switching ────────────────────────────────────────────────────────────
function setView(view) {
  currentView = view;
  browseView.style.display = view === 'browse' ? 'block' : 'none';
  deckView.style.display   = view === 'deck'   ? 'block' : 'none';

  document.querySelectorAll('.db-view-btn').forEach(b => b.classList.toggle('active', b.dataset.view === view));

  if (view === 'deck') renderDeckList();
}

// ── Card detail modal (adapted from main app.js pattern) ────────────────────
const MISSING_PLACEHOLDER = 'image-missing';

function getImageUrls(card) {
  const preferred = getMainImageUrl(card);
  const variants  = (card.variants || []).filter(v => v.tcgplayer_image_url && !v.tcgplayer_image_url.includes(MISSING_PLACEHOLDER));
  const BASE_METHODS = ['booster_pack', 'starter_deck', 'retail_product'];
  const baseVariants  = variants.filter(v => BASE_METHODS.includes(v.acquisition?.method) && v.tcgplayer_image_url !== preferred);
  const otherVariants = variants.filter(v => !BASE_METHODS.includes(v.acquisition?.method) && v.tcgplayer_image_url !== preferred);
  const ordered = [...(preferred ? [preferred] : []), ...baseVariants.map(v => v.tcgplayer_image_url), ...otherVariants.map(v => v.tcgplayer_image_url)];
  return [...new Set(ordered)];
}

const LABEL_PRIORITY = [
  { label: 'normal', methods: ['booster_pack', 'starter_deck'] },
  { label: 'parallel rare', methods: ['booster_pack', 'starter_deck'] },
  { label: 'parallel', methods: ['booster_pack', 'starter_deck'] },
];

function getMainImageUrl(card) {
  const variants = (card.variants || []).filter(v => v.tcgplayer_image_url && !v.tcgplayer_image_url.includes(MISSING_PLACEHOLDER));
  if (!variants.length) return null;
  const revision = variants.find(v => v.label === 'Revision Pack');
  if (revision) return revision.tcgplayer_image_url;
  for (const { label, methods } of LABEL_PRIORITY) {
    const match = variants.find(v => (v.label || '').toLowerCase().startsWith(label) && methods.includes(v.acquisition?.method));
    if (match) return match.tcgplayer_image_url;
  }
  return variants[0]?.tcgplayer_image_url || null;
}

function attachSmartFallback(img, urls, fallbackHtml) {
  let idx = 0;
  function tryNext() {
    idx++;
    if (idx < urls.length) img.src = urls[idx];
    else img.parentElement.innerHTML = fallbackHtml;
  }
  img.addEventListener('load', () => { if (img.naturalWidth > 0 && img.naturalWidth < 10) tryNext(); });
  img.addEventListener('error', tryNext);
}

function colorBadgeHtml(colors) {
  if (!colors || !colors.length) return '';
  if (colors.length > 1) return `<span class="badge badge-multi">${colors.join('/')}</span>`;
  const cls = COLOR_BADGE[colors[0]] || 'badge-gray';
  return `<span class="badge ${cls}">${colors[0]}</span>`;
}

// Returns a small color swatch (1 or 2 dots split diagonally for hybrid cards)
// for use in compact rows like the deck sidebar, where badges are too wide.
const COLOR_HEX = {
  Red: '#ef4444', Green: '#22c55e', Blue: '#3b82f6',
  Purple: '#a855f7', Black: '#9ca3af', Yellow: '#eab308',
};

function colorDotHtml(colors) {
  if (!colors || !colors.length) return '<span class="color-dot color-dot-empty"></span>';
  if (colors.length === 1) {
    const hex = COLOR_HEX[colors[0]] || '#6b7280';
    return `<span class="color-dot" style="background:${hex}" title="${escHtml(colors[0])}"></span>`;
  }
  // Hybrid: split gradient showing both colors, diagonal
  const [c1, c2] = colors;
  const hex1 = COLOR_HEX[c1] || '#6b7280';
  const hex2 = COLOR_HEX[c2] || '#6b7280';
  return `<span class="color-dot color-dot-split" style="background:linear-gradient(135deg, ${hex1} 50%, ${hex2} 50%)" title="${escHtml(colors.join('/'))}"></span>`;
}

function openCard(cardId) {
  const card = allCards.find(c => c.id === cardId);
  if (!card) return;

  currentCardIndex = currentCardList.findIndex(c => c.id === cardId);

  document.getElementById('mTitle').textContent = card.name || card.id;
  document.getElementById('mSub').textContent = `${card.id} · ${card.type || ''} · ${(card.color || []).join('/')}`;

  const allImgUrls = getImageUrls(card);
  const mImg = document.getElementById('mImg');
  const mImgPh = document.getElementById('mImgPh');
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
    ['Type', card.type || '—'],
    ['Color', (card.color || []).join(', ') || '—'],
    ['Rarity', RARITY_LABEL[card.rarity] || card.rarity || '—'],
    ['Power', card.power != null ? card.power : '—'],
    ['Attribute', card.attribute || '—'],
    card.cost != null ? ['Cost', card.cost] : card.life != null ? ['Life', card.life] : null,
  ].filter(Boolean);

  let attrsHtml = attrRows.map(([l, v]) => `<div><div class="attr-label">${l}</div><div class="attr-val">${escHtml(String(v))}</div></div>`).join('');
  if (card.affiliations && card.affiliations.length) {
    attrsHtml += `<div style="grid-column:1/-1"><div class="attr-label">Subtype</div><div class="attr-val" style="font-size:13px">${escHtml(card.affiliations.join(', '))}</div></div>`;
  }
  document.getElementById('mAttrs').innerHTML = attrsHtml;

  const effectWrap = document.getElementById('mEffectWrap');
  if (card.effect) {
    document.getElementById('mEffect').textContent = card.effect;
    effectWrap.style.display = 'block';
  } else {
    effectWrap.style.display = 'none';
  }

  renderModalDeckActions(card);

  const variants = card.variants || [];
  document.getElementById('vHeading').textContent = `${variants.length} variant${variants.length !== 1 ? 's' : ''}`;
  document.getElementById('vGrid').innerHTML = variants.map(v => {
    const method = v.acquisition && v.acquisition.method ? v.acquisition.method.replace(/_/g, ' ') : '';
    const link = v.tcgplayer_url
      ? `<a class="tcg-link" href="${v.tcgplayer_url}" target="_blank" rel="noopener">TCGPlayer <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg></a>`
      : '';
    return `<div class="variant-card">
      <div class="variant-img-wrap">
        ${v.tcgplayer_image_url ? `<img class="variant-img" src="${v.tcgplayer_image_url}" alt="${escHtml(v.label)}" loading="lazy" data-fallback="1">` : `<div class="variant-img-ph">${cardIconSvg()}</div>`}
      </div>
      <div class="variant-info">
        <div class="variant-label">${escHtml(v.label)}</div>
        <div class="variant-finish">${escHtml(v.finish || '')}</div>
        ${method ? `<div class="variant-method">${escHtml(method)}</div>` : ''}
        ${link}
      </div>
    </div>`;
  }).join('');

  document.querySelectorAll('#vGrid img[data-fallback]').forEach(img => {
    attachSmartFallback(img, [img.src], `<div class="variant-img-ph">${cardIconSvg()}</div>`);
  });

  updateModalNavButtons();
  overlay.style.display = 'flex';
  document.body.style.overflow = 'hidden';
  document.getElementById('closeBtn').focus();
}

function renderModalDeckActions(card) {
  const actionsEl = document.getElementById('modalDeckActions');
  if (card.type === 'Leader') {
    actionsEl.innerHTML = `
      <span class="modal-deck-actions-label">This is a Leader card</span>
      ${selectedLeader && selectedLeader.id === card.id
        ? '<span style="color:var(--gold);font-size:13px;font-weight:600">Currently selected</span>'
        : `<button class="modal-add-btn" id="modalSelectLeaderBtn">Select as Leader</button>`}
    `;
    const btn = document.getElementById('modalSelectLeaderBtn');
    if (btn) btn.addEventListener('click', () => { closeModal(); selectLeader(card.id); });
    return;
  }

  const inDeck = deck.get(card.id);
  const count = inDeck ? inDeck.count : 0;
  const maxed = count >= MAX_COPIES;

  actionsEl.innerHTML = `
    <span class="modal-deck-actions-label">${count} of ${MAX_COPIES} copies in your deck</span>
    <button class="deck-qty-btn" id="modalDecBtn" ${count === 0 ? 'disabled' : ''} aria-label="Remove one">−</button>
    <span class="deck-qty-count">${count}</span>
    <button class="deck-qty-btn" id="modalIncBtn" ${maxed ? 'disabled' : ''} aria-label="Add one">+</button>
  `;
  document.getElementById('modalDecBtn')?.addEventListener('click', () => { removeFromDeck(card.id); renderModalDeckActions(card); });
  document.getElementById('modalIncBtn')?.addEventListener('click', () => { addToDeck(card.id); renderModalDeckActions(card); });
}

function updateModalDeckActions() {
  if (overlay.style.display !== 'flex') return;
  const cardId = currentCardList[currentCardIndex]?.id;
  if (!cardId) return;
  const card = allCards.find(c => c.id === cardId);
  if (card) renderModalDeckActions(card);
}

function updateModalNavButtons() {
  const prevBtn = document.getElementById('modalPrevBtn');
  const nextBtn = document.getElementById('modalNextBtn');
  if (!prevBtn || !nextBtn) return;
  prevBtn.classList.toggle('hidden', currentCardIndex <= 0);
  nextBtn.classList.toggle('hidden', currentCardIndex >= currentCardList.length - 1 || currentCardIndex === -1);
}

function navigateModal(direction) {
  if (currentCardIndex === -1) return;
  const newIndex = currentCardIndex + direction;
  if (newIndex < 0 || newIndex >= currentCardList.length) return;
  openCard(currentCardList[newIndex].id);
}

function closeModal() {
  overlay.style.display = 'none';
  document.body.style.overflow = '';
  currentCardIndex = -1;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function escHtml(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function cardIconSvg() {
  return `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="18" rx="2"/><line x1="9" y1="9" x2="15" y2="9"/><line x1="9" y1="13" x2="15" y2="13"/></svg>`;
}

// ── Event listeners ───────────────────────────────────────────────────────────
leaderSearchInput.addEventListener('input', e => renderLeaderGrid(e.target.value.trim()));
poolSearchInput.addEventListener('input', e => { poolSearchTerm = e.target.value.trim(); renderPool(); });
poolSortSelect.addEventListener('change', e => { poolSort = e.target.value; renderPool(); });

document.querySelectorAll('#poolTypePills .pill').forEach(pill => {
  pill.addEventListener('click', () => {
    document.querySelectorAll('#poolTypePills .pill').forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
    poolType = pill.dataset.value;
    renderPool();
  });
});

document.querySelectorAll('.db-view-btn').forEach(btn => {
  btn.addEventListener('click', () => setView(btn.dataset.view));
});

document.getElementById('changeLeaderBtn').addEventListener('click', changeLeader);

document.getElementById('closeBtn').addEventListener('click', closeModal);
overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });

const modalPrevBtn = document.getElementById('modalPrevBtn');
const modalNextBtn = document.getElementById('modalNextBtn');
if (modalPrevBtn) modalPrevBtn.addEventListener('click', () => navigateModal(-1));
if (modalNextBtn) modalNextBtn.addEventListener('click', () => navigateModal(1));

document.addEventListener('keydown', e => {
  if (overlay.style.display !== 'flex') return;
  if (e.key === 'Escape') { closeModal(); return; }
  if (e.key === 'ArrowLeft') { e.preventDefault(); navigateModal(-1); return; }
  if (e.key === 'ArrowRight') { e.preventDefault(); navigateModal(1); return; }
});

// ── Init ──────────────────────────────────────────────────────────────────────
async function init() {
  leaderLoadingMsg.style.display = 'flex';
  leaderGrid.style.display = 'none';
  try {
    await loadAllCards();
    leaderLoadingMsg.style.display = 'none';
    leaderGrid.style.display = 'grid';
    renderLeaderGrid();
  } catch (err) {
    console.error(err);
    leaderLoadingMsg.innerHTML = '<div style="color:#f87171">Could not load cards. Please refresh.</div>';
  }
}

init();
