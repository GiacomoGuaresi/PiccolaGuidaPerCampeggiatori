// Ordine preferito delle categorie in sidebar; le categorie non elencate
// qui vengono aggiunte in coda in ordine alfabetico.
const CATEGORY_ORDER = ["Guida", "Montagna", "Trekking", "Sopravvivenza", "Meteo", "Altro"];

const state = {
  manifest: [],
  current: null,
  zoom: 1,
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
  updateModal: document.getElementById("update-modal"),
  btnCloseUpdate: document.getElementById("btn-close-update"),
  lastPrintedDate: document.getElementById("last-printed-date"),
  btnCheckUpdates: document.getElementById("btn-check-updates"),
  updateTopicPickerList: document.getElementById("update-topic-picker-list"),
  btnSelectAllUpdateTopics: document.getElementById("btn-select-all-update-topics"),
  btnSelectNoneUpdateTopics: document.getElementById("btn-select-none-update-topics"),
  btnOpenPrintBook: document.getElementById("btn-open-print-book"),
  printBookModal: document.getElementById("print-book-modal"),
  btnClosePrintBook: document.getElementById("btn-close-print-book"),
  topicPickerList: document.getElementById("topic-picker-list"),
  btnSelectAllTopics: document.getElementById("btn-select-all-topics"),
  btnSelectNoneTopics: document.getElementById("btn-select-none-topics"),
  btnConfirmPrintBook: document.getElementById("btn-confirm-print-book"),
};

init();

async function init() {
  state.manifest = await loadManifest();
  renderSidebar(state.manifest);
  els.btnOpenPrintBook.disabled = state.manifest.length === 0;

  els.btnExportSingle.addEventListener("click", exportCurrentCard);
  els.btnOpenPrintBook.addEventListener("click", openPrintBookModal);
  els.btnClosePrintBook.addEventListener("click", closePrintBookModal);
  els.printBookModal.querySelector(".modal-backdrop").addEventListener("click", closePrintBookModal);
  els.btnSelectAllTopics.addEventListener("click", () => setAllCheckboxesIn(els.topicPickerList, true));
  els.btnSelectNoneTopics.addEventListener("click", () => setAllCheckboxesIn(els.topicPickerList, false));
  els.topicPickerList.addEventListener("change", () => persistCategorySelection(els.topicPickerList));
  els.btnConfirmPrintBook.addEventListener("click", printBook);

  els.btnZoomOut.addEventListener("click", () => setZoom(state.zoom - ZOOM_STEP));
  els.btnZoomIn.addEventListener("click", () => setZoom(state.zoom + ZOOM_STEP));
  els.btnZoomReset.addEventListener("click", () => setZoom(1));
  setZoom(loadZoom());

  els.sidebarToggle.addEventListener("click", toggleSidebar);
  els.sidebarBackdrop.addEventListener("click", closeSidebar);
  MOBILE_QUERY.addEventListener("change", (e) => {
    if (!e.matches) closeSidebar();
  });

  els.btnOpenUpdate.addEventListener("click", openUpdateModal);
  els.btnCloseUpdate.addEventListener("click", closeUpdateModal);
  els.updateModal.querySelector(".modal-backdrop").addEventListener("click", closeUpdateModal);
  els.btnSelectAllUpdateTopics.addEventListener("click", () =>
    setAllCheckboxesIn(els.updateTopicPickerList, true)
  );
  els.btnSelectNoneUpdateTopics.addEventListener("click", () =>
    setAllCheckboxesIn(els.updateTopicPickerList, false)
  );
  els.updateTopicPickerList.addEventListener("change", () =>
    persistCategorySelection(els.updateTopicPickerList)
  );
  els.btnCheckUpdates.addEventListener("click", checkAndPrintUpdate);

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
      searchIndex.set(entry.id, normalizeSearchText(`${entry.title} ${entry.category} ${text}`));
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
    const text = indexed || normalizeSearchText(`${entry.title} ${entry.category}`);
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

  const byCategory = groupByCategory(filtered);
  const openCategory = getOpenCategory();
  const sections = [];

  for (const category of sortCategories(Object.keys(byCategory))) {
    const section = document.createElement("details");
    section.className = "category";
    section.open = searching ? true : category === openCategory;
    if (!searching) {
      section.addEventListener("toggle", () => {
        if (section.open) {
          sections.forEach((s) => {
            if (s !== section) s.open = false;
          });
          setOpenCategory(category);
        } else if (getOpenCategory() === category) {
          setOpenCategory(null);
        }
      });
    }

    const summary = document.createElement("summary");
    summary.textContent = category;
    section.appendChild(summary);

    const list = document.createElement("ul");
    list.className = "card-list";

    for (const entry of byCategory[category]) {
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
      list.appendChild(li);
    }

    section.appendChild(list);
    els.sidebarList.appendChild(section);
    sections.push(section);
  }
}

const OPEN_CATEGORY_KEY = "openCategory";

function getOpenCategory() {
  return localStorage.getItem(OPEN_CATEGORY_KEY);
}

function setOpenCategory(category) {
  if (category) {
    localStorage.setItem(OPEN_CATEGORY_KEY, category);
  } else {
    localStorage.removeItem(OPEN_CATEGORY_KEY);
  }
}

function groupByCategory(manifest) {
  return manifest.reduce((acc, entry) => {
    const category = entry.category || "Altro";
    (acc[category] = acc[category] || []).push(entry);
    return acc;
  }, {});
}

function sortCategories(categories) {
  return categories.sort((a, b) => {
    const ia = CATEGORY_ORDER.indexOf(a);
    const ib = CATEGORY_ORDER.indexOf(b);
    if (ia === -1 && ib === -1) return a.localeCompare(b);
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });
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
  extractSources();
  els.emptyState.hidden = true;
  els.cardPreview.hidden = false;
  els.cardToolbar.hidden = false;
  els.btnExportSingle.hidden = entry.printable === false;

  if (MOBILE_QUERY.matches) closeSidebar();
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
  els.printArea.innerHTML = `<div class="a5-page">${els.a5Single.innerHTML}</div>`;
  window.print();
}

/* ---------------------------------- Stampa libro (selezione sezioni) ---------------------------------- */

const PRINTED_CATEGORIES_KEY = "lastPrintedCategories";

function selectableTopics() {
  return state.manifest.filter((entry) => entry.category !== "Guida" && entry.printable !== false);
}

function selectableCategories() {
  return sortCategories(Object.keys(groupByCategory(selectableTopics())));
}

function openPrintBookModal() {
  const defaultSelected = loadPrintedCategories() || selectableCategories();
  renderCategoryPicker(els.topicPickerList, defaultSelected);
  els.printBookModal.hidden = false;
}

function closePrintBookModal() {
  els.printBookModal.hidden = true;
}

function renderCategoryPicker(container, defaultSelectedCategories) {
  container.innerHTML = "";

  const categories = selectableCategories();
  const byCategory = groupByCategory(selectableTopics());
  const defaultSelected = new Set(defaultSelectedCategories);

  for (const category of categories) {
    const label = document.createElement("label");
    label.className = "topic-picker-item";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = category;
    checkbox.checked = defaultSelected.has(category);

    label.appendChild(checkbox);
    label.appendChild(
      document.createTextNode(`${category} (${byCategory[category].length})`)
    );
    container.appendChild(label);
  }
}

function setAllCheckboxesIn(container, checked) {
  container
    .querySelectorAll('input[type="checkbox"]')
    .forEach((cb) => (cb.checked = checked));
  persistCategorySelection(container);
}

function getSelectedCategoriesFrom(container) {
  return Array.from(
    container.querySelectorAll('input[type="checkbox"]:checked')
  ).map((cb) => cb.value);
}

async function printBook() {
  const selectedCategories = getSelectedCategoriesFrom(els.topicPickerList);
  if (selectedCategories.length === 0) return;

  const today = new Date().toISOString().slice(0, 10);
  const selectedSet = new Set(selectedCategories);
  const entries = state.manifest.filter((entry) => selectedSet.has(entry.category));

  const [coverHtml, ...fragments] = await Promise.all([
    fetchFragment("content/copertina.html"),
    ...entries.map((entry) => fetchFragment(entry.file)),
  ]);

  const htmlById = Object.fromEntries(entries.map((entry, i) => [entry.id, fragments[i]]));
  const byCategory = groupByCategory(entries);

  const pages = [];
  if (coverHtml !== null) pages.push(coverHtml);
  pages.push(buildVersionPage(today, sortCategories(selectedCategories)));
  for (const category of sortCategories(Object.keys(byCategory))) {
    for (const entry of byCategory[category]) {
      if (htmlById[entry.id] !== null) pages.push(htmlById[entry.id]);
    }
  }

  els.printArea.innerHTML = pages.map((html) => `<div class="a5-page">${html}</div>`).join("");
  window.print();

  localStorage.setItem(LAST_PRINTED_DATE_KEY, today);
  els.lastPrintedDate.value = today;
  closePrintBookModal();
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
  savePrintedCategories(getSelectedCategoriesFrom(container));
}

function buildVersionPage(today, categories, note) {
  const categoryList = categories
    .map((category) => `<li>${escapeHtml(category)}</li>`)
    .join("");

  return `
    <h2>Versione stampata</h2>
    <span class="tag">Guida</span>
    <span class="tag">agg. ${today}</span>

    <h3>Sintesi</h3>
    <p>Ricevuta di questa stampa: tienila davanti alle altre schede nel raccoglitore. Dice cosa hai stampato, quando, e come aggiornarlo in futuro.</p>

    ${note ? `<p>${note}</p>` : ""}

    <h3>Argomenti stampati il ${today}</h3>
    <ul>${categoryList}</ul>

    <h3>Come aggiornare in futuro</h3>
    <ul>
      <li>Sul sito apri "Aggiornamento stampa"</li>
      <li>Inserisci la data <strong>${today}</strong> (quella di questo foglio)</li>
      <li>Conferma le sezioni da controllare (precompilate come sopra)</li>
      <li>Se ci sono schede nuove/modificate si apre subito la stampa: sostituiscile nel raccoglitore</li>
      <li>Sostituisci questo foglio con quello nuovo, con la data aggiornata</li>
    </ul>
  `;
}

/* ---------------------------------- Aggiornamento stampa ---------------------------------- */

const LAST_PRINTED_DATE_KEY = "lastPrintedDate";
const UPDATE_DATE_TAG_RE = /agg\.\s*(\d{4}-\d{2}-\d{2})/;

function openUpdateModal() {
  els.lastPrintedDate.value = localStorage.getItem(LAST_PRINTED_DATE_KEY) || "";
  const defaultSelected = loadPrintedCategories() || selectableCategories();
  renderCategoryPicker(els.updateTopicPickerList, defaultSelected);
  els.updateModal.hidden = false;
}

function closeUpdateModal() {
  els.updateModal.hidden = true;
}

async function checkAndPrintUpdate() {
  const refDate = els.lastPrintedDate.value;
  if (!refDate) return;

  localStorage.setItem(LAST_PRINTED_DATE_KEY, refDate);

  const selectedCategories = getSelectedCategoriesFrom(els.updateTopicPickerList);
  if (selectedCategories.length === 0) return;

  els.btnCheckUpdates.disabled = true;
  try {
    const selectedSet = new Set(selectedCategories);
    const entries = selectableTopics().filter((entry) => selectedSet.has(entry.category));
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
      alert(`Nessuna scheda nuova o aggiornata dopo il ${refDate}: sei già alla versione più recente.`);
      return;
    }

    await printUpdate(refDate, changed, sortCategories(selectedCategories));
    closeUpdateModal();
  } finally {
    els.btnCheckUpdates.disabled = false;
  }
}

async function printUpdate(refDate, changed, categories) {
  const today = new Date().toISOString().slice(0, 10);
  const note = `Aggiornamento rispetto alla versione stampata il <strong>${refDate}</strong>: ${changed.length} scheda/e nuova/e o modificata/e incluse in questo pacchetto.`;

  const coverHtml = await fetchFragment("content/copertina.html");
  const summaryHtml = buildVersionPage(today, categories, note);

  const htmlById = Object.fromEntries(changed.map((c) => [c.entry.id, c.html]));
  const byCategory = groupByCategory(changed.map((c) => c.entry));

  const pages = [];
  if (coverHtml !== null) pages.push(coverHtml);
  pages.push(summaryHtml);
  for (const category of sortCategories(Object.keys(byCategory))) {
    for (const entry of byCategory[category]) {
      pages.push(htmlById[entry.id]);
    }
  }

  els.printArea.innerHTML = pages.map((html) => `<div class="a5-page">${html}</div>`).join("");
  window.print();

  localStorage.setItem(LAST_PRINTED_DATE_KEY, today);
  els.lastPrintedDate.value = today;
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
