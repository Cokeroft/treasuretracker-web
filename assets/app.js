// ── Config ────────────────────────────────────────────────────────────────────
const API_BASE = 'https://treasuretracker-production.up.railway.app';

const ALL_SETS = [
  // ── Booster Sets ──
  { code: 'OP01',  name: 'Romance Dawn',                group: 'booster', available: true  },
  { code: 'OP02',  name: 'Paramount War',               group: 'booster', available: true  },
  { code: 'OP03',  name: 'Pillars of Strength',         group: 'booster', available: true  },
  { code: 'OP04',  name: 'Kingdoms of Intrigue',        group: 'booster', available: true  },
  { code: 'OP05',  name: 'Awakening of the New Era',    group: 'booster', available: true  },
  { code: 'OP06',  name: 'Wings of the Captain',        group: 'booster', available: true  },
  { code: 'OP07',  name: '500 Years in the Future',     group: 'booster', available: true  },
  { code: 'OP08',  name: 'Two Legends',                 group: 'booster', available: true  },
  { code: 'OP09',  name: 'Emperors in the New World',   group: 'booster', available: true  },
  { code: 'OP10',  name: 'Royal Blood',                 group: 'booster', available: true  },
  { code: 'OP11',  name: 'A Fist of Divine Speed',      group: 'booster', available: true  },
  { code: 'OP12',  name: 'Legacy of the Master',        group: 'booster', available: true  },
  { code: 'OP13',  name: 'Carrying on His Will',        group: 'booster', available: true  },
  { code: 'OP14',  name: 'The Azure Seas Seven',        group: 'booster', available: true  },
  { code: 'OP15',  name: "Adventure on Kami's Island",  group: 'booster', available: true  },
  { code: 'OP16',  name: 'The Time of Battle',          group: 'booster', available: true  },
  { code: 'PRB01', name: 'Premium Booster The Best',    group: 'booster', available: false },
  { code: 'PRB02', name: 'Premium Booster The Best Vol.2', group: 'booster', available: true  },
  // ── Starter Decks ──
  { code: 'ST01',  name: 'Straw Hat Crew',                  group: 'starter', available: true  },
  { code: 'ST02',  name: 'Worst Generation',                group: 'starter', available: true  },
  { code: 'ST03',  name: 'The Seven Warlords of the Sea',   group: 'starter', available: true  },
  { code: 'ST04',  name: 'Animal Kingdom Pirates',          group: 'starter', available: true  },
  { code: 'ST05',  name: 'ONE PIECE FILM RED',              group: 'starter', available: true  },
  { code: 'ST06',  name: 'Absolute Justice',                group: 'starter', available: true  },
  { code: 'ST07',  name: 'Big Mom Pirates',                 group: 'starter', available: true  },
  { code: 'ST08',  name: 'Monkey D. Luffy',                 group: 'starter', available: true  },
  { code: 'ST09',  name: 'Yamato',                          group: 'starter', available: true  },
  { code: 'ST10',  name: 'Ultra Deck: The Three Captains',  group: 'starter', available: true  },
  { code: 'ST11',  name: 'Uta',                             group: 'starter', available: true  },
  { code: 'ST12',  name: 'Zoro & Sanji',                    group: 'starter', available: true  },
  { code: 'ST13',  name: 'The Three Brothers',              group: 'starter', available: false },
  { code: 'ST14',  name: 'Cross Guild',                     group: 'starter', available: false },
  { code: 'ST15',  name: 'Red Edward Newgate',              group: 'starter', available: false },
  { code: 'ST16',  name: 'Green Uta',                       group: 'starter', available: false },
  { code: 'ST17',  name: 'Blue Donquixote Doflamingo',      group: 'starter', available: false },
  { code: 'ST18',  name: 'Purple Monkey D. Luffy',          group: 'starter', available: false },
  { code: 'ST19',  name: 'Black Smoker',                    group: 'starter', available: false },
  { code: 'ST20',  name: 'Yellow Charlotte Katakuri',       group: 'starter', available: false },
  { code: 'ST21',  name: 'EX Gear 5',                       group: 'starter', available: false },
  { code: 'ST22',  name: 'Ace & Newgate',                   group: 'starter', available: false },
  { code: 'ST23',  name: 'Red Shanks',                      group: 'starter', available: false },
  { code: 'ST24',  name: 'Green Jewelry Bonney',            group: 'starter', available: false },
  { code: 'ST25',  name: 'Blue Buggy',                      group: 'starter', available: false },
  { code: 'ST26',  name: 'Purple/Black Monkey D. Luffy',    group: 'starter', available: false },
  { code: 'ST27',  name: 'Black Marshall D. Teach',         group: 'starter', available: false },
  { code: 'ST28',  name: 'Green/Yellow Yamato',             group: 'starter', available: false },
  { code: 'ST29',  name: 'Starter Deck 29',                 group: 'starter', available: false },
  { code: 'ST30',  name: 'Starter Deck 30',                 group: 'starter', available: false },
  // ── Extra Boosters ──
  { code: 'EB01',  name: 'Memorial Collection',         group: 'extra',   available: true  },
  { code: 'EB02',  name: 'Anime 25th Collection',       group: 'extra',   available: true  },
  { code: 'EB03',  name: 'ONE PIECE Heroines Edition',  group: 'extra',   available: true  },
  { code: 'EB04',  name: 'Egghead Crisis',             group: 'extra',   available: true  },
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
let allCards       = [];
let allCardsCache  = null;   // every card across every available set, for affiliation search
let allCardsCacheLoading = false;
let activeSets     = new Set();
let collapsedGroups= new Set();           // accordion collapse state
let activeColors   = new Set();
let colorMode      = 'any'; // 'any' = OR, 'all' = AND
let activeTypes    = new Set();
let activeRarities = new Set();
let activeAffiliations = new Set();
let affiliationMode = 'any'; // 'any' = OR, 'all' = AND
let activeSort     = 'id';
let searchTerm     = '';
let currentCardList  = [];   // cards in current filter/sort order, for modal nav
let currentCardIndex = -1;   // index of currently open card within currentCardList

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

// ── Build set nav (accordion) ─────────────────────────────────────────────────
const GROUP_LABELS = { booster: 'Booster Sets', starter: 'Starter Decks', extra: 'Extra Boosters' };
const GROUP_ORDER  = ['booster', 'starter', 'extra'];

function buildSetNav() {
  const accordion = document.getElementById('setAccordion');
  if (!accordion) return;

  accordion.innerHTML = GROUP_ORDER.map(group => {
    const sets           = ALL_SETS.filter(s => s.group === group);
    const groupAvailable = sets.filter(s => s.available);
    const allGroupSel    = groupAvailable.length > 0 && groupAvailable.every(s => activeSets.has(s.code));
    const isOpen         = !collapsedGroups.has(group);

    const btns = sets.map(s => `
      <button
        class="set-btn${activeSets.has(s.code) ? ' active' : ''}${!s.available ? ' unavailable' : ''}"
        data-set="${s.code}"
        title="${s.name}${!s.available ? ' (coming soon)' : ''}"
      >${s.code}</button>
    `).join('');

    return `<div class="accordion-group">
      <div class="accordion-header">
        <button class="accordion-toggle" data-group="${group}" aria-expanded="${isOpen}">
          <svg class="accordion-chevron${isOpen ? ' open' : ''}" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
          ${GROUP_LABELS[group]}
        </button>
        <button class="set-group-all-btn${allGroupSel ? ' active' : ''}" data-group="${group}">All</button>
      </div>
      <div class="accordion-body${isOpen ? ' open' : ''}">
        <div class="set-btn-group">${btns}</div>
      </div>
    </div>`;
  }).join('');

  syncAllBtn();

  // Accordion toggles
  accordion.querySelectorAll('.accordion-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const g = btn.dataset.group;
      collapsedGroups.has(g) ? collapsedGroups.delete(g) : collapsedGroups.add(g);
      buildSetNav();
    });
  });

  // Per-group All buttons
  accordion.querySelectorAll('.set-group-all-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const groupSets = ALL_SETS.filter(s => s.group === btn.dataset.group && s.available);
      const allSel    = groupSets.every(s => activeSets.has(s.code));
      allSel ? groupSets.forEach(s => activeSets.delete(s.code))
             : groupSets.forEach(s => activeSets.add(s.code));
      buildSetNav();
      loadActiveSets();
    });
  });

  // Individual set buttons
  accordion.querySelectorAll('.set-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const set = ALL_SETS.find(s => s.code === btn.dataset.set);
      if (!set || !set.available) return;
      toggleSet(set.code);
      buildSetNav();
      loadActiveSets();
    });
  });

  // Global All button
  const allBtn = document.getElementById('setAllBtn');
  if (allBtn) {
    allBtn.onclick = () => {
      const available = ALL_SETS.filter(s => s.available);
      const allSel    = available.every(s => activeSets.has(s.code));
      allSel ? activeSets.clear() : available.forEach(s => activeSets.add(s.code));
      buildSetNav();
      loadActiveSets();
    };
  }
}

function toggleSet(code) {
  activeSets.has(code) ? activeSets.delete(code) : activeSets.add(code);
}

function syncAllBtn() {
  const btn = document.getElementById('setAllBtn');
  if (!btn) return;
  const available  = ALL_SETS.filter(s => s.available);
  const allSelected = available.length > 0 && available.every(s => activeSets.has(s.code));
  btn.classList.toggle('active', allSelected);
}

// ── Fetch ─────────────────────────────────────────────────────────────────────
async function loadActiveSets() {
  const available = ALL_SETS.filter(s => s.available && activeSets.has(s.code));

  if (available.length === 0) {
    allCards = [];
    updateHero();
    renderAffilChips();
    showState('coming-soon');
    return;
  }

  showState('loading');
  updateHero();

  try {
    const results = await Promise.all(
      available.map(s =>
        fetch(`${API_BASE}/sets/${s.code}/cards`)
          .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
          .then(d => d.cards || [])
      )
    );

    allCards = results.flat();
    updateHero();
    updateCollapsedLabel();
    renderAffilChips();
    showState('grid');
    render();
  } catch (err) {
    console.error(err);
    showState('error');
  }
}

function updateHero() {
  const selected = ALL_SETS.filter(s => activeSets.has(s.code) && s.available);

  if (selected.length === 0) {
    heroTitle.innerHTML = 'TreasureTracker';
    heroSub.textContent = '';
    return;
  }

  if (selected.length === 1) {
    const s = selected[0];
    heroTitle.innerHTML = `${s.name} <span class="set-code">${s.code}</span>`;
  } else {
    const codes = selected.map(s => s.code).join(' + ');
    heroTitle.innerHTML = `${selected.length} sets <span class="set-code">${codes}</span>`;
  }

  if (allCards.length > 0) {
    const totalVariants = allCards.reduce((sum, c) => sum + (c.variants || []).length, 0);
    heroSub.textContent = `${allCards.length} cards · ${totalVariants} variants · click any card to see all prints`;
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
    if (colorMode === 'all') {
      // AND: card must have ALL selected colors
      cards = cards.filter(c =>
        [...activeColors].every(col => (c.color || []).includes(col))
      );
    } else {
      // OR: card must have ANY of the selected colors
      cards = cards.filter(c =>
        (c.color || []).some(col => activeColors.has(col))
      );
    }
  }

  if (activeTypes.size > 0) {
    cards = cards.filter(c => activeTypes.has(c.type));
  }

  if (activeRarities.size > 0) {
    cards = cards.filter(c => activeRarities.has(c.rarity));
  }

  if (activeAffiliations.size > 0) {
    if (affiliationMode === 'all') {
      // AND: card must have ALL selected affiliations
      cards = cards.filter(c =>
        [...activeAffiliations].every(aff => (c.affiliations || []).includes(aff))
      );
    } else {
      // OR: card must have ANY of the selected affiliations
      cards = cards.filter(c =>
        (c.affiliations || []).some(aff => activeAffiliations.has(aff))
      );
    }
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
  const variants  = (card.variants || []).filter(
    v => v.tcgplayer_image_url && !v.tcgplayer_image_url.includes(MISSING_PLACEHOLDER)
  );

  // Build an ordered list: preferred first, then other base-set-ish variants, then rest
  const BASE_METHODS = ['booster_pack', 'starter_deck', 'retail_product'];
  const baseVariants = variants.filter(v =>
    BASE_METHODS.includes(v.acquisition?.method) &&
    v.tcgplayer_image_url !== preferred
  );
  const otherVariants = variants.filter(v =>
    !BASE_METHODS.includes(v.acquisition?.method) &&
    v.tcgplayer_image_url !== preferred
  );

  const ordered = [
    ...(preferred ? [preferred] : []),
    ...baseVariants.map(v => v.tcgplayer_image_url),
    ...otherVariants.map(v => v.tcgplayer_image_url),
  ];

  // Dedupe while preserving order
  return [...new Set(ordered)];
}

// Priority order for picking the "hero" display image:
// Prefer the base set print — Normal from booster/starter, then Parallel, then Revision Pack, then anything
const LABEL_PRIORITY = [
  { label: 'normal', methods: ['booster_pack', 'starter_deck'] },
  { label: 'parallel rare', methods: ['booster_pack', 'starter_deck'] },
  { label: 'parallel', methods: ['booster_pack', 'starter_deck'] },
];

function getMainImageUrl(card) {
  const variants = (card.variants || []).filter(
    v => v.tcgplayer_image_url && !v.tcgplayer_image_url.includes(MISSING_PLACEHOLDER)
  );
  if (!variants.length) return null;

  // If a Revision Pack variant exists, always prefer it — it has the cleanest image
  const revision = variants.find(v => v.label === 'Revision Pack');
  if (revision) return revision.tcgplayer_image_url;

  // Otherwise prefer base set Normal/Parallel
  for (const { label, methods } of LABEL_PRIORITY) {
    const match = variants.find(v =>
      (v.label || '').toLowerCase().startsWith(label) &&
      methods.includes(v.acquisition?.method)
    );
    if (match) return match.tcgplayer_image_url;
  }

  return variants[0]?.tcgplayer_image_url || null;
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
          ${activeSets.size > 1 ? `<span class="badge badge-set">${card.set || card.id.split('-')[0]}</span>` : ''}
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

  // Track position within the currently filtered/sorted list for prev/next nav
  currentCardList = getFilteredCards();
  currentCardIndex = currentCardList.findIndex(c => c.id === cardId);

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

  updateModalNavButtons();

  overlay.style.display = 'flex';
  document.body.style.overflow = 'hidden';
  document.getElementById('closeBtn').focus();
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

// ── Event listeners ───────────────────────────────────────────────────────────
document.getElementById('closeBtn').addEventListener('click', closeModal);
overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });

const modalPrevBtn = document.getElementById('modalPrevBtn');
const modalNextBtn = document.getElementById('modalNextBtn');
if (modalPrevBtn) modalPrevBtn.addEventListener('click', () => navigateModal(-1));
if (modalNextBtn) modalNextBtn.addEventListener('click', () => navigateModal(1));

document.addEventListener('keydown', e => {
  if (overlay.style.display !== 'flex') return;
  if (e.key === 'Escape') { closeModal(); return; }
  if (e.key === 'ArrowLeft')  { e.preventDefault(); navigateModal(-1); return; }
  if (e.key === 'ArrowRight') { e.preventDefault(); navigateModal(1); return; }
});

searchInput.addEventListener('input', e => { searchTerm = e.target.value.trim(); render(); });
sortSelect.addEventListener('change', e => { activeSort = e.target.value; render(); });

const colorModeBtn = document.getElementById('colorModeBtn');
if (colorModeBtn) {
  colorModeBtn.addEventListener('click', () => {
    colorMode = colorMode === 'any' ? 'all' : 'any';
    colorModeBtn.textContent = colorMode === 'any' ? 'Any' : 'All';
    colorModeBtn.classList.toggle('active', colorMode === 'all');
    render();
  });
}

// ── Affiliation autocomplete ─────────────────────────────────────────────────
// Fetches every available set once, caches the result, so the affiliation/subtype
// search always has the full catalog regardless of which sets are currently browsed.
async function loadAllCardsCache() {
  if (allCardsCache || allCardsCacheLoading) return allCardsCache;
  allCardsCacheLoading = true;

  const available = ALL_SETS.filter(s => s.available);
  try {
    const results = await Promise.all(
      available.map(s =>
        fetch(`${API_BASE}/sets/${s.code}/cards`)
          .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
          .then(d => d.cards || [])
          .catch(() => [])  // don't let one failed set break the whole cache
      )
    );
    allCardsCache = results.flat();
  } catch (err) {
    console.error('Failed to build full card cache for subtype search:', err);
    allCardsCache = [...allCards]; // fall back to whatever's currently loaded
  } finally {
    allCardsCacheLoading = false;
  }
  return allCardsCache;
}

function getAffiliationCounts() {
  // Build a map of affiliation name -> count of cards with that affiliation,
  // scoped to the FULL catalog (all available sets), not just what's browsed
  const source = allCardsCache || allCards;
  const counts = {};
  for (const c of source) {
    for (const aff of (c.affiliations || [])) {
      counts[aff] = (counts[aff] || 0) + 1;
    }
  }
  return counts;
}

function renderAffilChips() {
  const chipsEl = document.getElementById('affilChips');
  if (!chipsEl) return;

  // Flag chips that don't exist in any currently-loaded (browsed) set,
  // so the person knows why results might look empty
  const loadedAffils = new Set();
  for (const c of allCards) {
    for (const aff of (c.affiliations || [])) loadedAffils.add(aff);
  }

  chipsEl.innerHTML = [...activeAffiliations].map(aff => {
    const notInView = allCards.length > 0 && !loadedAffils.has(aff);
    return `
      <span class="affil-chip${notInView ? ' not-in-view' : ''}" data-affil="${escHtml(aff)}" ${notInView ? `title="Not found in your currently selected sets"` : ''}>
        ${escHtml(aff)}${notInView ? ' <span class="affil-chip-warn">!</span>' : ''}
        <button type="button" aria-label="Remove ${escHtml(aff)}">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </span>
    `;
  }).join('');

  chipsEl.querySelectorAll('.affil-chip button').forEach(btn => {
    btn.addEventListener('click', () => {
      const aff = btn.closest('.affil-chip').dataset.affil;
      activeAffiliations.delete(aff);
      renderAffilChips();
      render();
    });
  });
}

function showAffilDropdown(query) {
  const dropdown = document.getElementById('affilDropdown');
  if (!dropdown) return;

  if (!query) { dropdown.style.display = 'none'; return; }

  if (!allCardsCache) {
    dropdown.innerHTML = `<div class="affil-no-results">Loading full catalog...</div>`;
    dropdown.style.display = 'block';
    loadAllCardsCache().then(() => {
      // Re-run the search once the cache is ready, in case input is still focused
      if (affilInput && affilInput.value.trim() === query) showAffilDropdown(query);
    });
    return;
  }

  const counts = getAffiliationCounts();
  const q = query.toLowerCase();
  const matches = Object.entries(counts)
    .filter(([aff]) => aff.toLowerCase().includes(q) && !activeAffiliations.has(aff))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12);

  if (matches.length === 0) {
    dropdown.innerHTML = `<div class="affil-no-results">No matching subtypes found</div>`;
    dropdown.style.display = 'block';
    return;
  }

  dropdown.innerHTML = matches.map(([aff, count]) => `
    <div class="affil-option" data-affil="${escHtml(aff)}">
      <span>${escHtml(aff)}</span>
      <span class="affil-count">${count}</span>
    </div>
  `).join('');
  dropdown.style.display = 'block';

  dropdown.querySelectorAll('.affil-option').forEach(opt => {
    opt.addEventListener('click', () => {
      activeAffiliations.add(opt.dataset.affil);
      affilInput.value = '';
      dropdown.style.display = 'none';
      renderAffilChips();
      render();
    });
  });
}

const affilInput = document.getElementById('affilInput');
if (affilInput) {
  affilInput.addEventListener('input', e => showAffilDropdown(e.target.value.trim()));
  affilInput.addEventListener('focus', e => { if (e.target.value.trim()) showAffilDropdown(e.target.value.trim()); });
  document.addEventListener('click', e => {
    const dropdown = document.getElementById('affilDropdown');
    if (dropdown && !affilInput.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.style.display = 'none';
    }
  });
}

const affilModeBtn = document.getElementById('affilModeBtn');
if (affilModeBtn) {
  affilModeBtn.addEventListener('click', () => {
    affiliationMode = affiliationMode === 'any' ? 'all' : 'any';
    affilModeBtn.textContent = affiliationMode === 'any' ? 'Any' : 'All';
    affilModeBtn.classList.toggle('active', affiliationMode === 'all');
    render();
  });
}

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

// ── Panel collapse ────────────────────────────────────────────────────────────
let panelCollapsed = false;

function updateCollapsedLabel() {
  const label = document.getElementById('setCollapsedLabel');
  if (!label) return;
  const selected = ALL_SETS.filter(s => activeSets.has(s.code));
  if (selected.length === 0) {
    label.textContent = 'No sets selected';
  } else if (selected.length <= 4) {
    label.textContent = selected.map(s => s.code).join(' · ');
  } else {
    label.textContent = `${selected.length} sets selected`;
  }
}

function initCollapseToggle() {
  const collapseBtn   = document.getElementById('setCollapseBtn');
  const expandBtn     = document.getElementById('setExpandBtn');
  const panel         = document.getElementById('setPanel');
  const collapsedBar  = document.getElementById('setCollapsedBar');
  if (!collapseBtn || !expandBtn || !panel || !collapsedBar) return;

  collapseBtn.addEventListener('click', () => {
    panelCollapsed = true;
    panel.style.display = 'none';
    collapsedBar.style.display = 'block';
    updateCollapsedLabel();
  });

  expandBtn.addEventListener('click', () => {
    panelCollapsed = false;
    panel.style.display = 'block';
    collapsedBar.style.display = 'none';
  });
}
buildSetNav();
initCollapseToggle();
loadActiveSets();
loadAllCardsCache(); // warm the subtype/affiliation cache in the background