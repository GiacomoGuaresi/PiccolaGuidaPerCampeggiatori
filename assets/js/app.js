// Ordine preferito dei gruppi e, dentro ognuno, delle categorie. Gruppi e
// categorie non elencati qui vengono aggiunti in coda in ordine alfabetico.
const GROUP_ORDER = ["Guida", "Regole e ambiente", "Attrezzatura", "Tecnica sul terreno", "Meteo e natura", "Salute e sicurezza", "Pianificazione e logistica", "Altro"];

const CATEGORY_ORDER = {
  "Guida": ["Guida"],
  "Regole e ambiente": ["Normativa bivacco", "Etica e ambiente"],
  "Attrezzatura": ["Tenda e riparo", "Sacco a pelo e riposo", "Trekking", "Cucina e acqua"],
  "Tecnica sul terreno": ["Trekking", "Vie ferrate", "Neve e valanghe", "Inverno", "Orientamento"],
  "Meteo e natura": ["Meteo", "Fauna e flora"],
  "Salute e sicurezza": ["Salute in montagna", "Igiene", "Emergenze e soccorso", "Sopravvivenza"],
  "Pianificazione e logistica": ["Prima di partire", "Rifugi e bivacchi fissi", "Campeggio e camper"],
};

// Lo stesso nome di categoria esiste sotto gruppi diversi (Attrezzatura >
// Trekking e Tecnica sul terreno > Trekking): ovunque serva identificare una
// categoria si usa la chiave composta "Gruppo > Categoria".
const TOPIC_SEP = " > ";

function topicKeyOf(group, category) {
  return `${group || "Altro"}${TOPIC_SEP}${category || "Altro"}`;
}

function entryTopicKey(entry) {
  return topicKeyOf(entry.group, entry.category);
}

const state = {
  manifest: [],
  current: null,
  zoom: 1,
  favorites: new Set(),
};

const searchIndex = new Map();

const els = {
  appRoot: document.getElementById("app"),
  sidebarToggle: document.getElementById("btn-toggle-sidebar"),
  sidebarBackdrop: document.getElementById("sidebar-backdrop"),
  sidebarList: document.getElementById("sidebar-list"),
  searchInput: document.getElementById("search-input"),
  emptyState: document.getElementById("empty-state"),
  content: document.querySelector(".content"),
  cardPreview: document.getElementById("card-preview"),
  cardToolbar: document.getElementById("card-toolbar"),
  a5Single: document.getElementById("a5-single"),
  sourcesPanel: document.getElementById("sources-panel"),
  btnZoomOut: document.getElementById("btn-zoom-out"),
  btnZoomIn: document.getElementById("btn-zoom-in"),
  btnZoomReset: document.getElementById("btn-zoom-reset"),
  btnExportSingle: document.getElementById("btn-export-single"),
  printArea: document.getElementById("print-area"),
  btnOpenUpdate: document.getElementById("btn-open-update"),
  btnOpenPrintBook: document.getElementById("btn-open-print-book"),
  wizardModal: document.getElementById("wizard-modal"),
  wizardTitle: document.getElementById("wizard-title"),
  wizardHint: document.getElementById("wizard-hint"),
  wizardStepsNav: document.getElementById("wizard-steps"),
  wizardSteps: Array.from(document.querySelectorAll(".wizard-step")),
  wizardSummary: document.getElementById("wizard-summary"),
  wizardWarning: document.getElementById("wizard-warning"),
  wizardProgress: document.getElementById("wizard-progress"),
  btnWizardClose: document.getElementById("btn-wizard-close"),
  btnWizardBack: document.getElementById("btn-wizard-back"),
  btnWizardNext: document.getElementById("btn-wizard-next"),
  btnWizardExport: document.getElementById("btn-wizard-export"),
  lastPrintedDate: document.getElementById("last-printed-date"),
  scopeRadios: Array.from(document.querySelectorAll('input[name="wizard-scope"]')),
  scopeFavoritesRadio: document.getElementById("wizard-scope-favorites"),
  formatRadios: Array.from(document.querySelectorAll('input[name="wizard-format"]')),
  topicPickerList: document.getElementById("topic-picker-list"),
  btnSelectAllTopics: document.getElementById("btn-select-all-topics"),
  btnSelectNoneTopics: document.getElementById("btn-select-none-topics"),
  favoritesCounts: Array.from(document.querySelectorAll(".favorites-count")),
};

init();

async function init() {
  state.manifest = await loadManifest();
  state.favorites = loadFavorites();
  renderSidebar(state.manifest);
  els.btnOpenPrintBook.disabled = state.manifest.length === 0;

  els.btnExportSingle.addEventListener("click", exportCurrentCard);
  initWizard();

  els.btnZoomOut.addEventListener("click", () => setZoom(state.zoom - ZOOM_STEP));
  els.btnZoomIn.addEventListener("click", () => setZoom(state.zoom + ZOOM_STEP));
  els.btnZoomReset.addEventListener("click", () => setZoom(1));
  setZoom(loadZoom());

  els.sidebarToggle.addEventListener("click", toggleSidebar);
  els.sidebarBackdrop.addEventListener("click", closeSidebar);
  MOBILE_QUERY.addEventListener("change", (e) => {
    if (!e.matches) closeSidebar();
  });

  els.searchInput.addEventListener("input", () => {
    renderSidebar(state.manifest, els.searchInput.value);
  });
  buildSearchIndex(state.manifest).then(() => {
    els.searchInput.disabled = false;
    els.searchInput.placeholder = "Cerca scheda...";
  });

  await selectDefaultCard();
}

async function buildSearchIndex(manifest) {
  await Promise.all(
    manifest.map(async (entry) => {
      const html = await fetchFragment(entry.file);
      if (html === null) return;
      const text = htmlToText(html);
      searchIndex.set(entry.id, normalizeSearchText(`${entry.title} ${entry.group} ${entry.category} ${text}`));
    })
  );
}

function htmlToText(html) {
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.textContent || "";
}

function normalizeSearchText(str) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function filterManifest(manifest, query) {
  const q = normalizeSearchText(query.trim());
  if (!q) return manifest;
  return manifest.filter((entry) => {
    const indexed = searchIndex.get(entry.id);
    const text = indexed || normalizeSearchText(`${entry.title} ${entry.group} ${entry.category}`);
    return text.includes(q);
  });
}

async function selectDefaultCard() {
  const entry = state.manifest.find((e) => e.id === "copertina");
  const linkEl = entry && els.sidebarList.querySelector(`a[data-id="${entry.id}"]`);
  if (!entry || !linkEl) return;
  await selectCard(entry, linkEl);
}

async function loadManifest() {
  try {
    const res = await fetch("manifest.json");
    if (!res.ok) throw new Error(`manifest.json: HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("Impossibile caricare manifest.json", err);
    return [];
  }
}

function renderSidebar(manifest, query = "") {
  els.sidebarList.innerHTML = "";

  if (manifest.length === 0) {
    const p = document.createElement("p");
    p.className = "empty-manifest";
    p.textContent = "Nessuna scheda ancora presente. Aggiungile in manifest.json.";
    els.sidebarList.appendChild(p);
    return;
  }

  const searching = query.trim() !== "";
  const filtered = filterManifest(manifest, query);

  if (filtered.length === 0) {
    const p = document.createElement("p");
    p.className = "empty-manifest";
    p.textContent = "Nessuna scheda trovata.";
    els.sidebarList.appendChild(p);
    return;
  }

  const byGroup = groupByGroup(filtered);
  const openGroup = getOpenGroup();
  const openCategories = getOpenCategories();
  const groupSections = [];

  const favoritesSection = renderFavoritesSection(filtered, searching, groupSections);
  if (favoritesSection) {
    els.sidebarList.appendChild(favoritesSection);
    groupSections.push(favoritesSection);
  }

  for (const group of sortGroups(Object.keys(byGroup))) {
    const groupSection = document.createElement("details");
    groupSection.className = "group";
    groupSection.open = searching ? true : group === openGroup;
    if (!searching) {
      groupSection.addEventListener("toggle", () => {
        if (groupSection.open) {
          groupSections.forEach((s) => {
            if (s !== groupSection) s.open = false;
          });
          setOpenGroup(group);
        } else if (getOpenGroup() === group) {
          setOpenGroup(null);
        }
      });
    }

    const groupSummary = document.createElement("summary");
    groupSummary.textContent = group;
    groupSection.appendChild(groupSummary);

    const byCategory = byGroup[group];

    // Dentro un gruppo le categorie sono indipendenti: aprirne una non chiude
    // le altre (l'accordion "una alla volta" vale solo fra i gruppi).
    for (const category of sortCategories(group, Object.keys(byCategory))) {
      const section = document.createElement("details");
      section.className = "category";
      section.open = searching ? true : (openCategories[group] || []).includes(category);
      if (!searching) {
        section.addEventListener("toggle", () => {
          setCategoryOpen(group, category, section.open);
        });
      }

      const summary = document.createElement("summary");
      summary.textContent = category;
      section.appendChild(summary);

      const list = document.createElement("ul");
      list.className = "card-list";

      for (const entry of byCategory[category]) {
        list.appendChild(createCardListItem(entry));
      }

      section.appendChild(list);
      groupSection.appendChild(section);
    }

    els.sidebarList.appendChild(groupSection);
    groupSections.push(groupSection);
  }
}

// La sezione Preferiti sta in cima e si comporta come un gruppo: sotto ricerca
// mostra solo i preferiti che corrispondono alla query.
const FAVORITES_GROUP = "Preferiti";

function renderFavoritesSection(filtered, searching, groupSections) {
  const favorites = filtered.filter((entry) => state.favorites.has(entry.id));
  if (searching && favorites.length === 0) return null;

  const section = document.createElement("details");
  section.className = "group favorites-group";
  section.open = searching ? true : getOpenGroup() === FAVORITES_GROUP;
  if (!searching) {
    section.addEventListener("toggle", () => {
      if (section.open) {
        groupSections.forEach((s) => {
          if (s !== section) s.open = false;
        });
        setOpenGroup(FAVORITES_GROUP);
      } else if (getOpenGroup() === FAVORITES_GROUP) {
        setOpenGroup(null);
      }
    });
  }

  const summary = document.createElement("summary");
  summary.textContent = `${FAVORITES_GROUP} (${favorites.length})`;
  section.appendChild(summary);

  if (favorites.length === 0) {
    const hint = document.createElement("p");
    hint.className = "empty-manifest favorites-empty";
    hint.textContent = "Nessun preferito: tocca la stella accanto a una scheda per aggiungerla qui.";
    section.appendChild(hint);
    return section;
  }

  const list = document.createElement("ul");
  list.className = "card-list";
  for (const entry of favorites) {
    list.appendChild(createCardListItem(entry));
  }
  section.appendChild(list);
  return section;
}

const OPEN_GROUP_KEY = "openGroup";
const OPEN_CATEGORIES_KEY = "openCategoryByGroup";

function getOpenGroup() {
  return localStorage.getItem(OPEN_GROUP_KEY);
}

function setOpenGroup(group) {
  if (group) {
    localStorage.setItem(OPEN_GROUP_KEY, group);
  } else {
    localStorage.removeItem(OPEN_GROUP_KEY);
  }
}

// { gruppo: [categorie aperte] }
function getOpenCategories() {
  try {
    const parsed = JSON.parse(localStorage.getItem(OPEN_CATEGORIES_KEY));
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function setCategoryOpen(group, category, open) {
  const all = getOpenCategories();
  const current = new Set(all[group] || []);
  if (open) {
    current.add(category);
  } else {
    current.delete(category);
  }
  if (current.size === 0) {
    delete all[group];
  } else {
    all[group] = Array.from(current);
  }
  localStorage.setItem(OPEN_CATEGORIES_KEY, JSON.stringify(all));
}

// { gruppo: { categoria: [entry] } }, ognuno nell'ordine del manifest.
function groupByGroup(manifest) {
  return manifest.reduce((acc, entry) => {
    const group = entry.group || "Altro";
    const category = entry.category || "Altro";
    const categories = (acc[group] = acc[group] || {});
    (categories[category] = categories[category] || []).push(entry);
    return acc;
  }, {});
}

function sortByPreferredOrder(values, preferred) {
  return values.slice().sort((a, b) => {
    const ia = preferred.indexOf(a);
    const ib = preferred.indexOf(b);
    if (ia === -1 && ib === -1) return a.localeCompare(b);
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });
}

function sortGroups(groups) {
  return sortByPreferredOrder(groups, GROUP_ORDER);
}

function sortCategories(group, categories) {
  return sortByPreferredOrder(categories, CATEGORY_ORDER[group] || []);
}

// Ordina chiavi "Gruppo > Categoria" per gruppo e poi per categoria.
function sortTopicKeys(keys) {
  const byGroup = {};
  for (const key of keys) {
    const [group, category] = key.split(TOPIC_SEP);
    (byGroup[group] = byGroup[group] || []).push(category);
  }
  return sortGroups(Object.keys(byGroup)).flatMap((group) =>
    sortCategories(group, byGroup[group]).map((category) => topicKeyOf(group, category))
  );
}

/* ---------------------------------- Preferiti (cookie) ---------------------------------- */

// I preferiti vivono in un cookie e non in localStorage: così restano legati
// al dominio anche quando il sito viene aperto da un'altra pagina dello stesso
// host (es. un indice statico) e sopravvivono alla pulizia dello storage.
const FAVORITES_COOKIE = "preferiti";
const FAVORITES_ONLY_COOKIE = "stampaSoloPreferiti";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 anno
// I cookie hanno un tetto di ~4 KB per dominio: sotto questa soglia si sta
// larghi anche con tutte le schede preferite.
const COOKIE_MAX_BYTES = 3800;

function readCookie(name) {
  const prefix = `${name}=`;
  const found = document.cookie
    .split("; ")
    .find((chunk) => chunk.startsWith(prefix));
  if (!found) return null;
  try {
    return decodeURIComponent(found.slice(prefix.length));
  } catch {
    return null;
  }
}

function writeCookie(name, value) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
}

function loadFavorites() {
  const raw = readCookie(FAVORITES_COOKIE);
  if (!raw) return new Set();
  return new Set(raw.split(",").filter(Boolean));
}

function saveFavorites(ids) {
  const value = Array.from(ids).join(",");
  if (encodeURIComponent(value).length > COOKIE_MAX_BYTES) return false;
  writeCookie(FAVORITES_COOKIE, value);
  return true;
}

function isFavorite(id) {
  return state.favorites.has(id);
}

function toggleFavorite(id) {
  const next = new Set(state.favorites);
  if (next.has(id)) {
    next.delete(id);
  } else {
    next.add(id);
  }

  if (!saveFavorites(next)) {
    alert(
      "Non ci stanno altri preferiti: il cookie ha raggiunto il limite di spazio del browser.\n\n" +
        "Togli la stella a qualche scheda prima di aggiungerne altre."
    );
    return;
  }

  state.favorites = next;
  updateFavoritesCounts();
  renderSidebar(state.manifest, els.searchInput.value);
}

// Preferiti nell'ordine del manifest (non nell'ordine in cui sono stati aggiunti).
function favoriteEntries() {
  return state.manifest.filter((entry) => state.favorites.has(entry.id));
}

function printableFavorites() {
  return favoriteEntries().filter(
    (entry) => entry.printable !== false && entry.id !== "copertina"
  );
}

function updateFavoritesCounts() {
  const count = printableFavorites().length;
  els.favoritesCounts.forEach((el) => (el.textContent = String(count)));
  // Senza preferiti quel ramo del wizard non porta da nessuna parte.
  els.scopeFavoritesRadio.disabled = count === 0;
  if (count === 0 && els.scopeFavoritesRadio.checked) {
    els.scopeRadios.find((r) => r.value === "topics").checked = true;
  }
}

function createFavoriteButton(entry) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "fav-toggle";
  button.dataset.id = entry.id;
  const active = isFavorite(entry.id);
  button.classList.toggle("is-favorite", active);
  button.setAttribute("aria-pressed", String(active));
  button.title = active ? "Togli dai preferiti" : "Aggiungi ai preferiti";
  button.setAttribute("aria-label", `${button.title}: ${entry.title}`);
  button.innerHTML =
    '<svg class="icon" aria-hidden="true" focusable="false"><use href="assets/img/icons.svg#i-star"></use></svg>';
  button.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(entry.id);
  });
  return button;
}

function createCardListItem(entry) {
  const li = document.createElement("li");
  const a = document.createElement("a");
  a.href = "#";
  a.textContent = entry.title;
  a.dataset.id = entry.id;
  if (state.current && state.current.id === entry.id) a.classList.add("active");
  a.addEventListener("click", (e) => {
    e.preventDefault();
    selectCard(entry, a);
  });
  li.appendChild(a);
  li.appendChild(createFavoriteButton(entry));
  return li;
}

/* ---------------------------------- Sidebar mobile ---------------------------------- */

const MOBILE_QUERY = window.matchMedia("(max-width: 780px)");

function toggleSidebar() {
  setSidebarOpen(!els.appRoot.classList.contains("sidebar-open"));
}

function setSidebarOpen(open) {
  els.appRoot.classList.toggle("sidebar-open", open);
  els.sidebarToggle.setAttribute("aria-expanded", String(open));
  els.sidebarBackdrop.hidden = !open;
}

function closeSidebar() {
  setSidebarOpen(false);
}

/* ---------------------------------- Zoom preview ---------------------------------- */

const ZOOM_KEY = "previewZoom";
const ZOOM_STEP = 0.1;
const ZOOM_MIN = 0.5;
const ZOOM_MAX = 2;

function loadZoom() {
  const stored = parseFloat(localStorage.getItem(ZOOM_KEY));
  return Number.isFinite(stored) ? stored : defaultZoomForViewport();
}

function defaultZoomForViewport() {
  const MM_TO_PX = 96 / 25.4;
  const a5WidthPx = 148 * MM_TO_PX;
  const style = getComputedStyle(els.content);
  const padding = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
  const available = els.content.clientWidth - padding;
  if (available <= 0) return 1;
  return Math.min(1, Math.max(ZOOM_MIN, available / a5WidthPx));
}

function setZoom(value) {
  state.zoom = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, value));
  els.a5Single.style.zoom = state.zoom;
  els.btnZoomReset.textContent = `${Math.round(state.zoom * 100)}%`;
  els.btnZoomOut.disabled = state.zoom <= ZOOM_MIN;
  els.btnZoomIn.disabled = state.zoom >= ZOOM_MAX;
  localStorage.setItem(ZOOM_KEY, state.zoom);
}

async function selectCard(entry, linkEl) {
  const html = await fetchFragment(entry.file);
  if (html === null) return;

  state.current = entry;

  document
    .querySelectorAll(".sidebar .card-list a.active")
    .forEach((a) => a.classList.remove("active"));
  linkEl.classList.add("active");

  els.a5Single.innerHTML = html;
  decorateTags(els.a5Single);
  extractSources();
  els.emptyState.hidden = true;
  els.cardPreview.hidden = false;
  els.cardToolbar.hidden = false;
  els.btnExportSingle.hidden = entry.printable === false;

  if (MOBILE_QUERY.matches) closeSidebar();
}

// I primi due tag di ogni scheda sono gruppo e categoria: li marca cosi' che
// il CSS possa dare al gruppo lo sfondo pieno del suo colore e alla categoria
// solo il bordo dello stesso colore. Il terzo tag ("agg. ...") resta neutro.
function decorateTags(root) {
  const pages = root.classList && root.classList.contains("a5-page")
    ? [root]
    : Array.from(root.querySelectorAll(".a5-page"));

  for (const page of pages) {
    const tags = page.querySelectorAll(":scope > .tag");
    if (!tags.length) continue;

    const group = slugifyGroup(tags[0].textContent);
    tags[0].classList.add("tag-group");
    tags[0].dataset.group = group;

    if (tags[1]) {
      tags[1].classList.add("tag-category");
      tags[1].dataset.group = group;
    }
  }
}

function slugifyGroup(text) {
  return (text || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function extractSources() {
  const sources = els.a5Single.querySelector(".sources");
  const heading = sources && sources.previousElementSibling;

  els.sourcesPanel.innerHTML = "";

  if (!sources || !heading || heading.tagName !== "H3") {
    els.sourcesPanel.hidden = true;
    return;
  }

  els.sourcesPanel.appendChild(heading);
  els.sourcesPanel.appendChild(sources);
  els.sourcesPanel.hidden = false;
  decorateSourceLinks(sources);
}

function decorateSourceLinks(sources) {
  sources.querySelectorAll("a[href]").forEach((link) => {
    let hostname;
    try {
      hostname = new URL(link.href).hostname.replace(/^www\./, "");
    } catch {
      return;
    }

    link.textContent = hostname;
    link.title = link.href;

    const favicon = document.createElement("img");
    favicon.className = "source-favicon";
    favicon.src = `https://www.google.com/s2/favicons?sz=32&domain=${hostname}`;
    favicon.alt = "";
    favicon.width = 14;
    favicon.height = 14;
    link.prepend(favicon);
  });
}

async function fetchFragment(path) {
  try {
    const res = await fetch(path);
    if (!res.ok) throw new Error(`${path}: HTTP ${res.status}`);
    return await res.text();
  } catch (err) {
    console.error("Impossibile caricare la scheda", err);
    return null;
  }
}

function exportCurrentCard() {
  if (!state.current) return;
  renderPrintPages([els.a5Single.innerHTML]);
  window.print();
}

/* ---------------------------------- Modalità A4 (2 schede per foglio) ---------------------------------- */

const A4_MODE_KEY = "printA4Mode";
const PAGE_SIZE_STYLE_ID = "print-page-size";

function isA4Mode() {
  return localStorage.getItem(A4_MODE_KEY) === "1";
}

function setA4Mode(a4) {
  localStorage.setItem(A4_MODE_KEY, a4 ? "1" : "0");
}

// @page non può essere condizionato da una classe: la regola viene riscritta
// in un <style> dedicato prima di ogni stampa.
function setPrintPageSize(a4) {
  let styleEl = document.getElementById(PAGE_SIZE_STYLE_ID);
  if (!styleEl) {
    styleEl = document.createElement("style");
    styleEl.id = PAGE_SIZE_STYLE_ID;
    document.head.appendChild(styleEl);
  }
  const size = a4 ? "297mm 210mm" : "148mm 210mm";
  styleEl.textContent = `@page { size: ${size}; margin: 0; }`;
}

// Riempie #print-area con le schede da stampare: una per pagina A5, oppure
// due affiancate per foglio A4 orizzontale (l'ultima metà resta bianca se il
// numero di schede è dispari).
function renderPrintPages(pages) {
  const a4 = isA4Mode();
  setPrintPageSize(a4);
  els.printArea.classList.toggle("a4-mode", a4);

  const cards = pages.map((html) => `<div class="a5-page">${html}</div>`);

  if (!a4) {
    els.printArea.innerHTML = cards.join("");
    decorateTags(els.printArea);
    return;
  }

  const blank = '<div class="a5-page a5-blank"></div>';
  const sheets = [];
  for (let i = 0; i < cards.length; i += 2) {
    sheets.push(`<div class="a4-sheet">${cards[i]}${cards[i + 1] || blank}</div>`);
  }
  els.printArea.innerHTML = sheets.join("");
  decorateTags(els.printArea);
}

/* ---------------------------------- Wizard di stampa ---------------------------------- */

// Stampa libro e aggiornamento sono lo stesso wizard: cambiano solo il primo
// passo (la data, che serve solo all'aggiornamento) e cosa succede alla fine.
const WIZARD_FLOWS = {
  book: {
    title: "Stampa libro",
    hint: "Prepara il PDF del raccoglitore: copertina e pagina \"Versione stampata\" incluse.",
    exportLabel: "Esporta PDF",
    run: printBook,
  },
  update: {
    title: "Aggiornamento stampa",
    hint: "Prepara il PDF delle sole schede cambiate dopo la data dell'ultima stampa.",
    exportLabel: "Verifica ed esporta PDF",
    run: checkAndPrintUpdate,
  },
};

const WIZARD_STEP_LABELS = {
  date: "Data",
  scope: "Contenuto",
  topics: "Capitoli",
  format: "Formato",
  done: "Fine",
};

const wizard = { mode: "book", index: 0 };

function initWizard() {
  els.btnOpenPrintBook.addEventListener("click", () => openWizard("book"));
  els.btnOpenUpdate.addEventListener("click", () => openWizard("update"));
  els.btnWizardClose.addEventListener("click", closeWizard);
  els.wizardModal.querySelector(".modal-backdrop").addEventListener("click", closeWizard);
  els.btnWizardBack.addEventListener("click", () => goToStep(wizard.index - 1));
  els.btnWizardNext.addEventListener("click", () => goToStep(wizard.index + 1));
  els.btnWizardExport.addEventListener("click", runWizardExport);

  els.btnSelectAllTopics.addEventListener("click", () => {
    setAllCheckboxesIn(els.topicPickerList, true);
    refreshWizard();
  });
  els.btnSelectNoneTopics.addEventListener("click", () => {
    setAllCheckboxesIn(els.topicPickerList, false);
    refreshWizard();
  });
  els.topicPickerList.addEventListener("change", () => {
    persistCategorySelection(els.topicPickerList);
    refreshWizard();
  });

  els.lastPrintedDate.addEventListener("input", refreshWizard);
  els.scopeRadios.forEach((radio) =>
    radio.addEventListener("change", () => {
      writeCookie(FAVORITES_ONLY_COOKIE, isFavoritesScope() ? "1" : "0");
      refreshWizard();
    })
  );
  els.formatRadios.forEach((radio) =>
    radio.addEventListener("change", () => {
      setA4Mode(radio.value === "a4" && radio.checked);
      refreshWizard();
    })
  );

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !els.wizardModal.hidden) closeWizard();
  });

  updateFavoritesCounts();
}

// Il passo "capitoli" esiste solo se si stampa per capitoli: l'elenco dei passi
// va ricalcolato ogni volta, non fissato all'apertura.
function wizardStepIds() {
  const ids = [];
  if (wizard.mode === "update") ids.push("date");
  ids.push("scope");
  if (!isFavoritesScope()) ids.push("topics");
  ids.push("format", "done");
  return ids;
}

function isFavoritesScope() {
  return els.scopeFavoritesRadio.checked && !els.scopeFavoritesRadio.disabled;
}

function wizardConfig() {
  const favoritesOnly = isFavoritesScope();
  return {
    favoritesOnly,
    categories: favoritesOnly ? [] : getSelectedCategoriesFrom(els.topicPickerList),
    refDate: els.lastPrintedDate.value,
  };
}

function openWizard(mode) {
  wizard.mode = mode;
  wizard.index = 0;

  els.lastPrintedDate.value = localStorage.getItem(LAST_PRINTED_DATE_KEY) || "";
  renderCategoryPicker(els.topicPickerList, loadPrintedCategories() || selectableCategories());
  els.formatRadios.forEach((radio) => (radio.checked = radio.value === (isA4Mode() ? "a4" : "a5")));
  const favoritesScope = readCookie(FAVORITES_ONLY_COOKIE) === "1";
  els.scopeRadios.forEach(
    (radio) => (radio.checked = radio.value === (favoritesScope ? "favorites" : "topics"))
  );
  // Va dopo: se i preferiti sono spariti disattiva quel ramo e riporta su "capitoli".
  updateFavoritesCounts();

  const flow = WIZARD_FLOWS[mode];
  els.wizardTitle.textContent = flow.title;
  els.wizardHint.textContent = flow.hint;
  els.btnWizardExport.textContent = flow.exportLabel;

  els.wizardModal.hidden = false;
  refreshWizard();
}

function closeWizard() {
  els.wizardModal.hidden = true;
}

function goToStep(index) {
  const steps = wizardStepIds();
  wizard.index = Math.min(steps.length - 1, Math.max(0, index));
  refreshWizard();
}

function refreshWizard() {
  const steps = wizardStepIds();
  wizard.index = Math.min(wizard.index, steps.length - 1);
  const currentId = steps[wizard.index];
  const isLast = wizard.index === steps.length - 1;

  els.wizardSteps.forEach((section) => {
    section.hidden = section.dataset.step !== currentId;
  });

  renderWizardStepsNav(steps, currentId);
  els.wizardProgress.textContent = `Passo ${wizard.index + 1} di ${steps.length}`;
  els.btnWizardBack.disabled = wizard.index === 0;
  els.btnWizardNext.hidden = isLast;
  els.btnWizardNext.disabled = !isStepComplete(currentId);

  if (isLast) renderWizardSummary();
}

function renderWizardStepsNav(steps, currentId) {
  els.wizardStepsNav.innerHTML = "";
  steps.forEach((id, i) => {
    const li = document.createElement("li");
    li.className = "wizard-steps-item";
    li.classList.toggle("is-current", id === currentId);
    li.classList.toggle("is-done", i < wizard.index);

    const button = document.createElement("button");
    button.type = "button";
    button.textContent = `${i + 1}. ${WIZARD_STEP_LABELS[id]}`;
    // Indietro si torna liberamente, avanti solo passando dai passi.
    button.disabled = i > wizard.index;
    button.addEventListener("click", () => goToStep(i));

    li.appendChild(button);
    els.wizardStepsNav.appendChild(li);
  });
}

function isStepComplete(stepId) {
  if (stepId === "date") return els.lastPrintedDate.value !== "";
  if (stepId === "topics") return getSelectedCategoriesFrom(els.topicPickerList).length > 0;
  return true;
}

function renderWizardSummary() {
  const { favoritesOnly, categories, refDate } = wizardConfig();
  const entries = entriesForSelection({ favoritesOnly, categories });

  const rows = [];
  if (wizard.mode === "update") rows.push(["Ultima stampa", refDate || "—"]);
  rows.push(["Contenuto", favoritesOnly ? "Solo i preferiti" : `${categories.length} categorie`]);
  rows.push(["Schede", String(entries.length)]);
  rows.push(["Formato", isA4Mode() ? "A4, 2 schede per foglio" : "A5, una scheda per pagina"]);

  els.wizardSummary.innerHTML = "";
  for (const [label, value] of rows) {
    const li = document.createElement("li");
    li.innerHTML = `<span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong>`;
    els.wizardSummary.appendChild(li);
  }

  const problem = entries.length === 0 ? "Nessuna scheda da stampare con queste scelte." : "";
  els.wizardWarning.textContent = problem;
  els.wizardWarning.hidden = problem === "";
  els.btnWizardExport.disabled = entries.length === 0;
}

async function runWizardExport() {
  const config = wizardConfig();
  els.btnWizardExport.disabled = true;
  try {
    const printed = await WIZARD_FLOWS[wizard.mode].run(config);
    if (printed) closeWizard();
  } finally {
    els.btnWizardExport.disabled = false;
  }
}

/* ---------------------------------- Stampa libro (selezione sezioni) ---------------------------------- */

// v2: le selezioni salvate con i vecchi nomi di categoria non sono più valide.
const PRINTED_CATEGORIES_KEY = "lastPrintedCategories.v2";

function selectableTopics() {
  return state.manifest.filter((entry) => entry.group !== "Guida" && entry.printable !== false);
}

// Chiavi "Gruppo > Categoria" selezionabili, nell'ordine di stampa.
function selectableCategories() {
  return sortTopicKeys(Array.from(new Set(selectableTopics().map(entryTopicKey))));
}

function renderCategoryPicker(container, defaultSelectedCategories) {
  container.innerHTML = "";

  const byGroup = groupByGroup(selectableTopics());
  const defaultSelected = new Set(defaultSelectedCategories);

  for (const group of sortGroups(Object.keys(byGroup))) {
    const byCategory = byGroup[group];
    const categories = sortCategories(group, Object.keys(byCategory));
    const groupCount = categories.reduce((n, c) => n + byCategory[c].length, 0);

    const groupLabel = document.createElement("label");
    groupLabel.className = "topic-picker-item topic-picker-group";

    const groupCheckbox = document.createElement("input");
    groupCheckbox.type = "checkbox";
    groupCheckbox.dataset.group = group;
    groupCheckbox.addEventListener("change", () => {
      container
        .querySelectorAll(`input[data-topic][data-group="${cssEscape(group)}"]`)
        .forEach((cb) => (cb.checked = groupCheckbox.checked));
      groupCheckbox.indeterminate = false;
    });

    groupLabel.appendChild(groupCheckbox);
    groupLabel.appendChild(document.createTextNode(`${group} (${groupCount})`));
    container.appendChild(groupLabel);

    for (const category of categories) {
      const label = document.createElement("label");
      label.className = "topic-picker-item topic-picker-category";

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.value = topicKeyOf(group, category);
      checkbox.dataset.topic = "1";
      checkbox.dataset.group = group;
      checkbox.checked = defaultSelected.has(checkbox.value);
      checkbox.addEventListener("change", () => syncGroupCheckbox(container, group));

      label.appendChild(checkbox);
      label.appendChild(
        document.createTextNode(`${category} (${byCategory[category].length})`)
      );
      container.appendChild(label);
    }

    syncGroupCheckbox(container, group);
  }
}

// Il checkbox di gruppo riflette i figli: pieno, vuoto o indeterminato.
function syncGroupCheckbox(container, group) {
  const selector = `[data-group="${cssEscape(group)}"]`;
  const groupCheckbox = container.querySelector(`input:not([data-topic])${selector}`);
  if (!groupCheckbox) return;
  const children = Array.from(container.querySelectorAll(`input[data-topic]${selector}`));
  const checked = children.filter((cb) => cb.checked).length;
  groupCheckbox.checked = checked === children.length;
  groupCheckbox.indeterminate = checked > 0 && checked < children.length;
}

function syncAllGroupCheckboxes(container) {
  container
    .querySelectorAll("input:not([data-topic])[data-group]")
    .forEach((cb) => syncGroupCheckbox(container, cb.dataset.group));
}

function cssEscape(value) {
  return window.CSS && CSS.escape ? CSS.escape(value) : value.replace(/"/g, '\\"');
}

function setAllCheckboxesIn(container, checked) {
  container
    .querySelectorAll('input[type="checkbox"]')
    .forEach((cb) => {
      cb.checked = checked;
      cb.indeterminate = false;
    });
  persistCategorySelection(container);
}

// Solo i checkbox di categoria: quello di gruppo è un comando, non una scelta.
function getSelectedCategoriesFrom(container) {
  return Array.from(
    container.querySelectorAll('input[data-topic]:checked')
  ).map((cb) => cb.value);
}

// Ordine di stampa: gruppo, categoria, e dentro la categoria l'ordine del manifest.
function sortEntriesForPrint(entries) {
  const byGroup = groupByGroup(entries);
  return sortGroups(Object.keys(byGroup)).flatMap((group) =>
    sortCategories(group, Object.keys(byGroup[group])).flatMap(
      (category) => byGroup[group][category]
    )
  );
}

// Le schede scelte nel wizard: i preferiti stampabili, oppure tutte quelle
// delle categorie selezionate.
function entriesForSelection({ favoritesOnly, categories }) {
  if (favoritesOnly) return printableFavorites();
  const selectedSet = new Set(categories);
  return selectableTopics().filter((entry) => selectedSet.has(entryTopicKey(entry)));
}

// `true` se la stampa è partita, `false` se è stata annullata (niente schede o
// frammenti che non si caricano): il wizard si chiude solo nel primo caso.
async function printBook({ favoritesOnly, categories }) {
  const entries = entriesForSelection({ favoritesOnly, categories });

  if (entries.length === 0) {
    alert(
      favoritesOnly
        ? "Nessuna scheda tra i preferiti: aggiungine con la stella nel menu."
        : "Nessuna scheda nelle categorie selezionate."
    );
    return false;
  }

  const today = new Date().toISOString().slice(0, 10);

  const [coverHtml, ...fragments] = await Promise.all([
    fetchFragment("content/copertina.html"),
    ...entries.map((entry) => fetchFragment(entry.file)),
  ]);

  const htmlById = Object.fromEntries(entries.map((entry, i) => [entry.id, fragments[i]]));

  // Una scheda che non si carica sparirebbe dal libro senza avvisare: meglio
  // fermarsi che stampare un raccoglitore a cui mancano dei fogli.
  const failedIds = entries
    .filter((entry) => htmlById[entry.id] === null)
    .map((entry) => entry.id);
  if (coverHtml === null || failedIds.length > 0) {
    const missing = coverHtml === null ? ["copertina", ...failedIds] : failedIds;
    alert(
      `Stampa annullata: ${missing.length} schede su ${entries.length + 1} non si sono caricate.\n\n` +
        `${missing.join(", ")}\n\n` +
        "Ricarica la pagina (forzando l'aggiornamento della cache) e riprova."
    );
    return false;
  }

  const pages = [coverHtml];
  pages.push(
    favoritesOnly
      ? buildVersionPage(today, entries.map((entry) => entry.title), { favoritesOnly: true })
      : buildVersionPage(today, sortTopicKeys(categories))
  );
  for (const entry of sortEntriesForPrint(entries)) {
    pages.push(htmlById[entry.id]);
  }

  renderPrintPages(pages);
  window.print();

  localStorage.setItem(LAST_PRINTED_DATE_KEY, today);
  return true;
}

function loadPrintedCategories() {
  try {
    const parsed = JSON.parse(localStorage.getItem(PRINTED_CATEGORIES_KEY));
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function savePrintedCategories(categories) {
  localStorage.setItem(PRINTED_CATEGORIES_KEY, JSON.stringify(categories));
}

function persistCategorySelection(container) {
  syncAllGroupCheckboxes(container);
  savePrintedCategories(getSelectedCategoriesFrom(container));
}

// `items` sono le categorie stampate, oppure i titoli delle schede quando la
// stampa è limitata ai preferiti.
function buildVersionPage(today, items, { note, favoritesOnly } = {}) {
  const itemList = items.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  const heading = favoritesOnly
    ? `Schede preferite stampate il ${today}`
    : `Argomenti stampati il ${today}`;

  const selectionStep = favoritesOnly
    ? "<li>Al passo <strong>Contenuto</strong> scegli <strong>Preferiti</strong>, come per questa stampa</li>"
    : "<li>Al passo <strong>Contenuto</strong> scegli <strong>Capitoli</strong> e conferma quelli qui sopra (gia' precompilati)</li>";

  return `
    <h2>Versione stampata</h2>
    <span class="tag">Guida</span>
    <span class="tag">agg. ${today}</span>

    <p>Ricevuta di questa stampa: tienila davanti alle altre schede nel raccoglitore. Dice cosa hai stampato, quando, e come aggiornarlo in futuro.</p>

    ${note ? `<p>${note}</p>` : ""}

    <h3>${heading}</h3>
    <ul>${itemList}</ul>

    <h3>Come aggiornare in futuro</h3>
    <ul>
      <li>Sul sito apri "Aggiornamento stampa" e segui il wizard</li>
      <li>Inserisci la data <strong>${today}</strong> (quella di questo foglio)</li>
      ${selectionStep}
      <li>Scegli il formato, poi <strong>Esporta PDF</strong>: se ci sono schede nuove/modificate parte la stampa, sostituiscile nel raccoglitore</li>
      <li>Sostituisci questo foglio con quello nuovo, con la data aggiornata</li>
    </ul>
  `;
}

/* ---------------------------------- Aggiornamento stampa ---------------------------------- */

const LAST_PRINTED_DATE_KEY = "lastPrintedDate";
const UPDATE_DATE_TAG_RE = /agg\.\s*(\d{4}-\d{2}-\d{2})/;

// Come printBook: `true` solo se si è arrivati alla stampa.
async function checkAndPrintUpdate({ refDate, favoritesOnly, categories }) {
  localStorage.setItem(LAST_PRINTED_DATE_KEY, refDate);

  const entries = entriesForSelection({ favoritesOnly, categories });
  if (entries.length === 0) {
    alert(
      favoritesOnly
        ? "Nessuna scheda tra i preferiti: aggiungine con la stella nel menu."
        : "Nessuna scheda nelle categorie selezionate."
    );
    return false;
  }

  const fragments = await Promise.all(entries.map((entry) => fetchFragment(entry.file)));

  const changed = [];
  entries.forEach((entry, i) => {
    const html = fragments[i];
    if (html === null) return;
    const match = html.match(UPDATE_DATE_TAG_RE);
    if (!match) return;
    if (match[1] > refDate) {
      changed.push({ entry, date: match[1], html });
    }
  });

  if (changed.length === 0) {
    const scope = favoritesOnly ? " fra i preferiti" : "";
    alert(`Nessuna scheda${scope} nuova o aggiornata dopo il ${refDate}: sei già alla versione più recente.`);
    return false;
  }

  const items = favoritesOnly
    ? entries.map((entry) => entry.title)
    : sortTopicKeys(categories);
  await printUpdate(refDate, changed, items, favoritesOnly);
  return true;
}

async function printUpdate(refDate, changed, items, favoritesOnly) {
  const today = new Date().toISOString().slice(0, 10);
  const scope = favoritesOnly ? " fra le schede preferite" : "";
  const note = `Aggiornamento${scope} rispetto alla versione stampata il <strong>${refDate}</strong>: ${changed.length} scheda/e nuova/e o modificata/e incluse in questo pacchetto.`;

  const coverHtml = await fetchFragment("content/copertina.html");
  const summaryHtml = buildVersionPage(today, items, { note, favoritesOnly });

  const htmlById = Object.fromEntries(changed.map((c) => [c.entry.id, c.html]));

  const pages = [];
  if (coverHtml !== null) pages.push(coverHtml);
  pages.push(summaryHtml);
  for (const entry of sortEntriesForPrint(changed.map((c) => c.entry))) {
    pages.push(htmlById[entry.id]);
  }

  renderPrintPages(pages);
  window.print();

  localStorage.setItem(LAST_PRINTED_DATE_KEY, today);
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
