// ── Config ────────────────────────────────────────────────────────────────────
const API_BASE = 'https://treasuretracker-production.up.railway.app';

// Mirror of ALL_SETS from app.js — kept in sync manually when sets are added
const ALL_SETS = [
  { code: 'OP01',  available: true }, { code: 'OP02',  available: true },
  { code: 'OP03',  available: true }, { code: 'OP04',  available: true },
  { code: 'OP05',  available: true }, { code: 'OP06',  available: true },
  { code: 'OP07',  available: true }, { code: 'OP08',  available: true },
  { code: 'OP09',  available: true }, { code: 'OP10',  available: true },
  { code: 'OP11',  available: true }, { code: 'OP12',  available: true },
  { code: 'OP13',  available: true }, { code: 'OP14',  available: true },
  { code: 'OP15',  available: true }, { code: 'OP16',  available: true },
  { code: 'PRB01', available: true  },{ code: 'PRB02', available: true },
  { code: 'ST01',  available: true }, { code: 'ST02',  available: true },
  { code: 'ST03',  available: true }, { code: 'ST04',  available: true },
  { code: 'ST05',  available: true }, { code: 'ST06',  available: true },
  { code: 'ST07',  available: true }, { code: 'ST08',  available: true },
  { code: 'ST09',  available: true }, { code: 'ST10',  available: true },
  { code: 'ST11',  available: true }, { code: 'ST12',  available: true },
  { code: 'ST13',  available: true }, { code: 'ST14',  available: true },
  { code: 'ST15',  available: true }, { code: 'ST16',  available: true },
  { code: 'ST17',  available: true }, { code: 'ST18',  available: true },
  { code: 'ST19',  available: true }, { code: 'ST20',  available: true },
  { code: 'ST21',  available: true }, { code: 'ST22',  available: true },
  { code: 'ST23',  available: true }, { code: 'ST24',  available: true },
  { code: 'ST25',  available: true }, { code: 'ST26',  available: true },
  { code: 'ST27',  available: true }, { code: 'ST28',  available: true },
  { code: 'ST29',  available: true }, { code: 'ST30',  available: true },
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
let poolBlock = 'all';
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
  try {
    const res = await fetch(`${API_BASE}/cards`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const availableCodes = new Set(ALL_SETS.filter(s => s.available).map(s => s.code));
    allCards = (data.cards || []).filter(c => availableCodes.has(c.set));
  } catch (err) {
    console.error('Failed to load card catalog:', err);
    allCards = [];
  }
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

  // Recalculate after layout settles (image may still be loading, which can
  // change the leader bar's height slightly)
  requestAnimationFrame(updateSidebarOffset);
  document.getElementById('selLeaderImg').addEventListener('load', updateSidebarOffset, { once: true });
  setTimeout(updateSidebarOffset, 200);
}

function changeLeader() {
  selectedLeader = null;
  deck.clear();
  builderSection.style.display = 'none';
  leaderSelectSection.style.display = 'block';
  leaderSearchInput.value = '';
  renderLeaderGrid();
}

function clearDeck() {
  if (deck.size === 0) return; // nothing to clear
  const confirmed = window.confirm('Clear all cards from your deck? Your Leader will stay selected. This cannot be undone.');
  if (!confirmed) return;

  deck.clear();
  updateDeckProgress();
  if (currentView === 'browse') renderPool();
  if (currentView === 'deck') renderDeckList();
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

  if (poolBlock !== 'all') {
    // Cards with no block assigned yet are excluded from a specific-block filter.
    cards = cards.filter(c => c.block != null && String(c.block) === poolBlock);
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
    const img = getDisplayImageUrl(card);
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
  deck.set(cardId, { card, count: count + 1, preferredVariantId: existing?.preferredVariantId || null });
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
    deck.set(cardId, { card: existing.card, count: existing.count - 1, preferredVariantId: existing.preferredVariantId });
  }
  updateDeckProgress();
  if (currentView === 'browse') renderPool();
  if (currentView === 'deck') renderDeckList();
  updateModalDeckActions();
}

function setPreferredVariant(cardId, variantId) {
  const existing = deck.get(cardId);
  if (!existing) return;
  // Toggle off if clicking the already-selected variant
  const newPref = existing.preferredVariantId === variantId ? null : variantId;
  deck.set(cardId, { ...existing, preferredVariantId: newPref });
  if (currentView === 'browse') renderPool();
  if (currentView === 'deck') renderDeckList();
}

// All variants of a card that actually have artwork — used to know whether
// cycling makes sense (need at least 2) and to step through them in order.
function getArtVariants(card) {
  return (card.variants || []).filter(v => v.tcgplayer_image_url && !v.tcgplayer_image_url.includes(MISSING_PLACEHOLDER));
}

// Advances a card's preferred variant to the next available art, wrapping
// back to the first after the last. Mirrors getDisplayImageUrl's notion of
// "current" art so cycling feels continuous regardless of how it got there.
function cycleArt(cardId) {
  const entry = deck.get(cardId);
  if (!entry) return;
  const variants = getArtVariants(entry.card);
  if (variants.length < 2) return;

  const currentUrl = getDisplayImageUrl(entry.card);
  const currentIndex = variants.findIndex(v => v.tcgplayer_image_url === currentUrl);
  const nextIndex = (currentIndex + 1) % variants.length;
  const nextVariant = variants[nextIndex];

  deck.set(cardId, { ...entry, preferredVariantId: nextVariant.variant_id });
  if (currentView === 'browse') renderPool();
  if (currentView === 'deck') renderDeckList();
}

// Returns the image to display for a card, respecting any preferred variant
// chosen in the deck. Falls back to the default hero image otherwise.
function getDisplayImageUrl(card) {
  const entry = deck.get(card.id);
  if (entry?.preferredVariantId) {
    const v = (card.variants || []).find(v => v.variant_id === entry.preferredVariantId);
    if (v?.tcgplayer_image_url) return v.tcgplayer_image_url;
  }
  return getMainImageUrl(card);
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
  currentCardList = entries.map(e => e.card); // deck-order nav when modal opened from this view

  if (!entries.length) {
    deckList.style.display = 'none';
    deckEmptyMsg.style.display = 'block';
    return;
  }
  deckEmptyMsg.style.display = 'none';
  deckList.style.display = 'grid';

  deckList.innerHTML = entries.map(({ card, count }) => {
    const img = getDisplayImageUrl(card);
    const imgHtml = img
      ? `<div class="card-img-wrap"><img class="card-img" src="${img}" alt="${escHtml(card.name || card.id)}" loading="lazy" data-fallback="1"></div>`
      : `<div class="card-img-wrap"><div class="card-img-ph">${cardIconSvg()}</div></div>`;

    const artCount = getArtVariants(card).length;
    const cycleBtn = artCount > 1
      ? `<button class="cycle-art-btn" data-action="cycle-art" data-id="${card.id}" title="Cycle art (${artCount} versions)" aria-label="Cycle artwork for ${escHtml(card.name || card.id)}">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>
        </button>`
      : '';

    return `
      <div class="deck-card-wrap">
        <article class="card" data-id="${card.id}" tabindex="0">
          ${imgHtml}
          <div class="card-body">
            <div class="card-id">${card.id}</div>
            <div class="card-name">${colorDotHtml(card.color)} ${escHtml(card.name || '—')}</div>
            <div class="card-meta">
              ${colorBadgeHtml(card.color)}
              <span class="badge badge-gray">${card.type}</span>
            </div>
          </div>
        </article>
        <span class="pool-card-count-badge">${count}</span>
        ${cycleBtn}
        <div class="deck-card-controls">
          <button class="deck-qty-btn" data-action="dec" data-id="${card.id}" aria-label="Remove one">−</button>
          <button class="deck-qty-btn" data-action="inc" data-id="${card.id}" ${count >= MAX_COPIES ? 'disabled' : ''} aria-label="Add one">+</button>
          <button class="deck-card-remove" data-action="remove" data-id="${card.id}" aria-label="Remove all copies" title="Remove all copies">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
          </button>
        </div>
      </div>`;
  }).join('');

  deckList.querySelectorAll('.card').forEach(el => {
    el.addEventListener('click', () => { modalContext = 'deck'; openCard(el.dataset.id); });
  });
  deckList.querySelectorAll('[data-action="inc"]').forEach(btn => btn.addEventListener('click', e => { e.stopPropagation(); addToDeck(btn.dataset.id); }));
  deckList.querySelectorAll('[data-action="dec"]').forEach(btn => btn.addEventListener('click', e => { e.stopPropagation(); removeFromDeck(btn.dataset.id); }));
  deckList.querySelectorAll('[data-action="remove"]').forEach(btn => btn.addEventListener('click', e => { e.stopPropagation(); removeFromDeck(btn.dataset.id, true); }));
  deckList.querySelectorAll('[data-action="cycle-art"]').forEach(btn => btn.addEventListener('click', e => { e.stopPropagation(); cycleArt(btn.dataset.id); }));

  deckList.querySelectorAll('img[data-fallback]').forEach(img => {
    const card = entries.map(e => e.card).find(c => c.id === img.closest('.card').dataset.id);
    const urls = card ? getImageUrls(card) : [];
    attachSmartFallback(img, urls, `<div class="card-img-ph">${cardIconSvg()}</div>`);
  });
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
    const img = getDisplayImageUrl(card);
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

  const deckEntry = deck.get(card.id);
  const inDeck = !!deckEntry && card.type !== 'Leader';

  document.getElementById('vGrid').innerHTML = variants.map(v => {
    const method = v.acquisition && v.acquisition.method ? v.acquisition.method.replace(/_/g, ' ') : '';
    const link = v.tcgplayer_url
      ? `<a class="tcg-link" href="${v.tcgplayer_url}" target="_blank" rel="noopener">TCGPlayer <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg></a>`
      : '';

    const isSelected = inDeck && (
      deckEntry.preferredVariantId === v.variant_id ||
      (!deckEntry.preferredVariantId && v.tcgplayer_image_url === getMainImageUrl(card))
    );

    const selectBtn = inDeck && v.tcgplayer_image_url
      ? `<button class="variant-select-btn${isSelected ? ' selected' : ''}" data-variant-id="${v.variant_id}" data-card-id="${card.id}" title="${isSelected ? 'Currently displayed in your deck' : 'Use this art for your deck'}">
          ${isSelected
            ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>'
            : ''}
        </button>`
      : '';

    return `<div class="variant-card${isSelected ? ' variant-card-selected' : ''}">
      <div class="variant-img-wrap">
        ${selectBtn}
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

  document.querySelectorAll('.variant-select-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      setPreferredVariant(btn.dataset.cardId, btn.dataset.variantId);
      openCard(btn.dataset.cardId); // re-render modal to reflect new selection
    });
  });

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

document.querySelectorAll('#poolBlockPills .pill').forEach(pill => {
  pill.addEventListener('click', () => {
    document.querySelectorAll('#poolBlockPills .pill').forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
    poolBlock = pill.dataset.value;
    renderPool();
  });
});

document.querySelectorAll('.db-view-btn').forEach(btn => {
  btn.addEventListener('click', () => setView(btn.dataset.view));
});

document.getElementById('changeLeaderBtn')?.addEventListener('click', changeLeader);
document.getElementById('clearDeckBtn')?.addEventListener('click', clearDeck);

document.getElementById('exportBtn')?.addEventListener('click', openExportModal);
document.getElementById('exportCloseBtn')?.addEventListener('click', closeExportModal);
document.getElementById('exportOverlay')?.addEventListener('click', e => {
  if (e.target.id === 'exportOverlay') closeExportModal();
});
document.getElementById('copySimBtn')?.addEventListener('click', e => {
  copyToClipboard(document.getElementById('simExportText').value, e.target);
});
document.getElementById('copyTcgBtn')?.addEventListener('click', e => {
  copyToClipboard(document.getElementById('tcgExportText').value, e.target);
});

document.getElementById('importBtnLeaderScreen')?.addEventListener('click', openImportModal);
document.getElementById('importBtnBuilder')?.addEventListener('click', openImportModal);
document.getElementById('importCloseBtn')?.addEventListener('click', closeImportModal);
document.getElementById('importOverlay')?.addEventListener('click', e => {
  if (e.target.id === 'importOverlay') closeImportModal();
});
document.getElementById('importConfirmBtn')?.addEventListener('click', handleImportConfirm);

document.getElementById('closeBtn')?.addEventListener('click', closeModal);
overlay?.addEventListener('click', e => { if (e.target === overlay) closeModal(); });

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

// ── Sidebar sticky offset (avoids hardcoded magic numbers that drift
// out of sync with the actual topbar + leader bar height) ───────────────────
function updateSidebarOffset() {
  const sidebar = document.querySelector('.deck-sidebar');
  if (!sidebar) return;
  const topbar = document.querySelector('.topbar');
  const leaderBar = document.querySelector('.selected-leader-bar');
  const offset = (topbar?.offsetHeight || 0) + (leaderBar?.offsetHeight || 0);
  sidebar.style.top = `${offset}px`;
  sidebar.style.height = `calc(100vh - ${offset}px)`;
}

window.addEventListener('resize', updateSidebarOffset);

// ── Export ────────────────────────────────────────────────────────────────────
function extractProductId(url) {
  const m = (url || '').match(/\/product\/(\d+)\//);
  return m ? m[1] : null;
}

// Picks the variant whose product page we export — respects the art the
// person explicitly selected for this card in their deck, falling back to
// the same default priority as the main site's hero image otherwise.
function getExportVariant(card) {
  const variants = (card.variants || []).filter(v => v.tcgplayer_url);
  if (!variants.length) return null;

  const entry = deck.get(card.id);
  if (entry?.preferredVariantId) {
    const preferred = variants.find(v => v.variant_id === entry.preferredVariantId);
    if (preferred) return preferred;
  }

  for (const { label, methods } of LABEL_PRIORITY) {
    const match = variants.find(v => (v.label || '').toLowerCase().startsWith(label) && methods.includes(v.acquisition?.method));
    if (match) return match;
  }
  return variants[0];
}

function buildSimExport() {
  const lines = [];
  if (selectedLeader) {
    lines.push(`1x${selectedLeader.id}`);
  }
  const entries = [...deck.values()].sort((a, b) => a.card.id.localeCompare(b.card.id));
  for (const { card, count } of entries) {
    lines.push(`${count}x${card.id}`);
  }
  return lines.join('\n');
}

function buildTcgExport() {
  const lines = [];
  const missing = [];
  const entries = [...deck.values()].sort((a, b) => a.card.id.localeCompare(b.card.id));

  // Include the leader too — it's part of the physical deck purchase
  const allEntries = selectedLeader ? [{ card: selectedLeader, count: 1 }, ...entries] : entries;

  for (const { card, count } of allEntries) {
    const variant = getExportVariant(card);
    const productId = variant ? extractProductId(variant.tcgplayer_url) : null;
    if (productId) {
      lines.push(`${count}-${productId}`);
    } else {
      missing.push(card.name || card.id);
    }
  }
  return { text: lines.join('\n'), missing, entries: lines };
}

function buildTcgUrl(entries) {
  if (!entries.length) return null;
  const cParam = entries.join('||');
  return `https://www.tcgplayer.com/massentry?productline=${encodeURIComponent('One Piece Card Game')}&c=${encodeURIComponent(cParam)}`;
}

function openExportModal() {
  document.getElementById('simExportText').value = buildSimExport();
  const { text, missing, entries } = buildTcgExport();
  document.getElementById('tcgExportText').value = text;
  const noteEl = document.getElementById('tcgExportNote');
  noteEl.textContent = missing.length
    ? `Note: ${missing.length} card${missing.length !== 1 ? 's' : ''} couldn't be matched to a TCGPlayer listing and ${missing.length !== 1 ? 'were' : 'was'} skipped: ${missing.join(', ')}`
    : '';

  const tcgLinkBtn = document.getElementById('tcgGoToBtn');
  const url = buildTcgUrl(entries);
  if (url) {
    tcgLinkBtn.href = url;
    tcgLinkBtn.classList.remove('disabled');
  } else {
    tcgLinkBtn.href = '#';
    tcgLinkBtn.classList.add('disabled');
  }

  document.getElementById('exportOverlay').style.display = 'flex';
}

function closeExportModal() {
  document.getElementById('exportOverlay').style.display = 'none';
}

async function copyToClipboard(text, btn) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    // Fallback for environments without clipboard API permission
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  }
  const original = btn.textContent;
  btn.textContent = 'Copied!';
  btn.classList.add('copied');
  setTimeout(() => { btn.textContent = original; btn.classList.remove('copied'); }, 1500);
}

// ── Import ────────────────────────────────────────────────────────────────────
function parseImportText(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const parsed = [];
  const errors = [];

  for (const line of lines) {
    const m = line.match(/^(\d+)\s*x\s*([A-Za-z0-9]+-\d+)$/i);
    if (!m) {
      errors.push(line);
      continue;
    }
    parsed.push({ count: parseInt(m[1], 10), cardId: m[2].toUpperCase() });
  }

  return { parsed, errors };
}

function buildDeckFromImport(parsed) {
  const notFound = [];
  const skippedLeaders = [];
  let detectedLeader = null;
  const newDeck = new Map();

  for (const { count, cardId } of parsed) {
    const card = allCards.find(c => c.id === cardId);
    if (!card) {
      notFound.push(cardId);
      continue;
    }
    if (card.type === 'Leader') {
      // First Leader found in the list becomes the selected leader;
      // any others are skipped (a deck only has one Leader)
      if (!detectedLeader) {
        detectedLeader = card;
      } else {
        skippedLeaders.push(cardId);
      }
      continue;
    }
    const existing = newDeck.get(cardId);
    newDeck.set(cardId, {
      card,
      count: Math.min(MAX_COPIES, (existing?.count || 0) + count),
      preferredVariantId: null,
    });
  }

  return { newDeck, detectedLeader, notFound, skippedLeaders };
}

let importAutoCloseTimer = null;

function openImportModal() {
  clearTimeout(importAutoCloseTimer);
  document.getElementById('importInputText').value = '';
  document.getElementById('importErrorMsg').style.display = 'none';
  document.getElementById('importSummaryMsg').style.display = 'none';
  document.getElementById('importOverlay').style.display = 'flex';
}

function closeImportModal() {
  clearTimeout(importAutoCloseTimer);
  document.getElementById('importOverlay').style.display = 'none';
}

function handleImportConfirm() {
  const text = document.getElementById('importInputText').value;
  const errorEl = document.getElementById('importErrorMsg');
  const summaryEl = document.getElementById('importSummaryMsg');
  errorEl.style.display = 'none';
  summaryEl.style.display = 'none';

  const { parsed, errors } = parseImportText(text);

  if (!parsed.length) {
    errorEl.textContent = errors.length
      ? `Couldn't parse any lines. Expected format like "4xOP16-080". ${errors.length} line(s) unrecognized.`
      : 'Paste a deck list first.';
    errorEl.style.display = 'block';
    return;
  }

  const { newDeck, detectedLeader, notFound, skippedLeaders } = buildDeckFromImport(parsed);

  if (!detectedLeader && !selectedLeader) {
    errorEl.textContent = 'No Leader card found in the import list, and no Leader is currently selected. Include a Leader card ID in your import.';
    errorEl.style.display = 'block';
    return;
  }

  // Apply the import
  if (detectedLeader) {
    selectedLeader = detectedLeader;
  }
  deck = newDeck;

  // Build the summary message
  const summaryParts = [`Imported ${[...newDeck.values()].reduce((s, e) => s + e.count, 0)} cards.`];
  if (detectedLeader) summaryParts.push(`Leader set to ${detectedLeader.name || detectedLeader.id}.`);
  if (notFound.length) summaryParts.push(`${notFound.length} card ID${notFound.length !== 1 ? 's' : ''} not found: ${notFound.join(', ')}.`);
  if (skippedLeaders.length) summaryParts.push(`Extra Leader card${skippedLeaders.length !== 1 ? 's' : ''} ignored: ${skippedLeaders.join(', ')}.`);
  if (errors.length) summaryParts.push(`${errors.length} line(s) couldn't be parsed and were skipped.`);

  summaryEl.textContent = summaryParts.join(' ');
  summaryEl.style.display = 'block';

  // Switch into the builder view with the new deck loaded
  document.getElementById('selLeaderImg').src = getMainImageUrl(selectedLeader) || '';
  document.getElementById('selLeaderName').textContent = selectedLeader.name || selectedLeader.id;
  document.getElementById('selLeaderMeta').textContent =
    `${selectedLeader.id} · ${(selectedLeader.color || []).join('/')} · Life ${selectedLeader.life ?? '—'}`;

  leaderSelectSection.style.display = 'none';
  builderSection.style.display = 'block';

  setView('browse');
  renderPool();
  updateDeckProgress();
  requestAnimationFrame(updateSidebarOffset);
  setTimeout(updateSidebarOffset, 200);

  importAutoCloseTimer = setTimeout(closeImportModal, 15000);
}

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