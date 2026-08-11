// Ordine preferito delle categorie in sidebar; le categorie non elencate
// qui vengono aggiunte in coda in ordine alfabetico.
const CATEGORY_ORDER = ["Guida", "Montagna", "Trekking", "Sopravvivenza", "Meteo", "Altro"];

const state = {
  manifest: [],
  current: null,
  pendingUpdate: null,
};

const els = {
  sidebar: document.getElementById("sidebar"),
  emptyState: document.getElementById("empty-state"),
  cardPreview: document.getElementById("card-preview"),
  a5Single: document.getElementById("a5-single"),
  sourcesPanel: document.getElementById("sources-panel"),
  btnExportSingle: document.getElementById("btn-export-single"),
  btnExportAll: document.getElementById("btn-export-all"),
  printArea: document.getElementById("print-area"),
  btnOpenUpdate: document.getElementById("btn-open-update"),
  updateModal: document.getElementById("update-modal"),
  btnCloseUpdate: document.getElementById("btn-close-update"),
  lastPrintedDate: document.getElementById("last-printed-date"),
  btnCheckUpdates: document.getElementById("btn-check-updates"),
  updateResults: document.getElementById("update-results"),
  updateSummary: document.getElementById("update-summary"),
  updateList: document.getElementById("update-list"),
  btnExportUpdate: document.getElementById("btn-export-update"),
};

init();

async function init() {
  state.manifest = await loadManifest();
  renderSidebar(state.manifest);
  els.btnExportAll.disabled = state.manifest.length === 0;

  els.btnExportSingle.addEventListener("click", exportCurrentCard);
  els.btnExportAll.addEventListener("click", exportAllCards);

  els.btnOpenUpdate.addEventListener("click", openUpdateModal);
  els.btnCloseUpdate.addEventListener("click", closeUpdateModal);
  els.updateModal.querySelector(".modal-backdrop").addEventListener("click", closeUpdateModal);
  els.btnCheckUpdates.addEventListener("click", checkUpdates);
  els.btnExportUpdate.addEventListener("click", exportUpdate);
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

function renderSidebar(manifest) {
  els.sidebar.innerHTML = "";

  if (manifest.length === 0) {
    const p = document.createElement("p");
    p.className = "empty-manifest";
    p.textContent = "Nessuna scheda ancora presente. Aggiungile in manifest.json.";
    els.sidebar.appendChild(p);
    return;
  }

  const byCategory = groupByCategory(manifest);

  for (const category of sortCategories(Object.keys(byCategory))) {
    const section = document.createElement("details");
    section.className = "category";
    section.open = !isCategoryCollapsed(category);
    section.addEventListener("toggle", () => {
      setCategoryCollapsed(category, !section.open);
    });

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
      a.addEventListener("click", (e) => {
        e.preventDefault();
        selectCard(entry, a);
      });
      li.appendChild(a);
      list.appendChild(li);
    }

    section.appendChild(list);
    els.sidebar.appendChild(section);
  }
}

const COLLAPSED_CATEGORIES_KEY = "collapsedCategories";

function getCollapsedCategories() {
  try {
    return new Set(JSON.parse(localStorage.getItem(COLLAPSED_CATEGORIES_KEY)) || []);
  } catch {
    return new Set();
  }
}

function isCategoryCollapsed(category) {
  return getCollapsedCategories().has(category);
}

function setCategoryCollapsed(category, collapsed) {
  const collapsedSet = getCollapsedCategories();
  if (collapsed) {
    collapsedSet.add(category);
  } else {
    collapsedSet.delete(category);
  }
  localStorage.setItem(COLLAPSED_CATEGORIES_KEY, JSON.stringify([...collapsedSet]));
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

async function exportAllCards() {
  if (state.manifest.length === 0) return;

  const today = new Date().toISOString().slice(0, 10);

  const fragments = await Promise.all(
    state.manifest.map((entry) => fetchFragment(entry.file))
  );

  const pages = [];
  state.manifest.forEach((entry, i) => {
    if (fragments[i] === null) return;
    pages.push(fragments[i]);
    if (entry.id === "copertina") pages.push(buildVersionPage(today));
  });

  els.printArea.innerHTML = pages.map((html) => `<div class="a5-page">${html}</div>`).join("");

  window.print();

  localStorage.setItem(LAST_PRINTED_DATE_KEY, today);
  els.lastPrintedDate.value = today;
}

function buildVersionPage(today) {
  return `
    <h2>Versione stampata</h2>
    <span class="tag">Guida</span>
    <span class="tag">agg. ${today}</span>

    <p>Questo set contiene tutte le schede aggiornate al <strong>${today}</strong>.</p>

    <h3>Per il prossimo aggiornamento</h3>
    <p>Conserva questa pagina nel raccoglitore. Al prossimo aggiornamento inserisci la data <strong>${today}</strong> nella sezione "Aggiornamento stampa" del sito.</p>
  `;
}

/* ---------------------------------- Aggiornamento stampa ---------------------------------- */

const LAST_PRINTED_DATE_KEY = "lastPrintedDate";
const UPDATE_DATE_TAG_RE = /agg\.\s*(\d{4}-\d{2}-\d{2})/;

function openUpdateModal() {
  els.lastPrintedDate.value = localStorage.getItem(LAST_PRINTED_DATE_KEY) || "";
  els.updateResults.hidden = true;
  els.btnExportUpdate.disabled = true;
  state.pendingUpdate = null;
  els.updateModal.hidden = false;
}

function closeUpdateModal() {
  els.updateModal.hidden = true;
}

async function checkUpdates() {
  const refDate = els.lastPrintedDate.value;
  if (!refDate) return;

  localStorage.setItem(LAST_PRINTED_DATE_KEY, refDate);

  els.btnCheckUpdates.disabled = true;
  try {
    const entries = state.manifest.filter((entry) => entry.category !== "Guida");
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

    renderUpdateResults(refDate, changed);
  } finally {
    els.btnCheckUpdates.disabled = false;
  }
}

function renderUpdateResults(refDate, changed) {
  els.updateResults.hidden = false;
  els.updateList.innerHTML = "";

  if (changed.length === 0) {
    els.updateSummary.textContent = `Nessuna scheda nuova o aggiornata dopo il ${refDate}: sei già alla versione più recente.`;
    els.btnExportUpdate.disabled = true;
    state.pendingUpdate = null;
    return;
  }

  els.updateSummary.textContent = `${changed.length} scheda/e nuova/e o aggiornata/e dopo il ${refDate}.`;

  const dateById = Object.fromEntries(changed.map((c) => [c.entry.id, c.date]));
  const byCategory = groupByCategory(changed.map((c) => c.entry));

  for (const category of sortCategories(Object.keys(byCategory))) {
    const h3 = document.createElement("h3");
    h3.textContent = category;
    els.updateList.appendChild(h3);

    const ul = document.createElement("ul");
    for (const entry of byCategory[category]) {
      const li = document.createElement("li");
      li.textContent = `${entry.title} (agg. ${dateById[entry.id]})`;
      ul.appendChild(li);
    }
    els.updateList.appendChild(ul);
  }

  state.pendingUpdate = { refDate, changed };
  els.btnExportUpdate.disabled = false;
}

async function exportUpdate() {
  if (!state.pendingUpdate) return;
  const { refDate, changed } = state.pendingUpdate;
  const today = new Date().toISOString().slice(0, 10);

  const coverHtml = await fetchFragment("content/copertina.html");
  const summaryHtml = buildUpdateSummaryPage(refDate, today, changed);

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

function buildUpdateSummaryPage(refDate, today, changed) {
  const byCategory = groupByCategory(changed.map((c) => c.entry));
  const dateById = Object.fromEntries(changed.map((c) => [c.entry.id, c.date]));

  const sections = sortCategories(Object.keys(byCategory))
    .map((category) => {
      const items = byCategory[category]
        .map(
          (entry) =>
            `<li>${escapeHtml(entry.title)} <span class="update-date">(agg. ${dateById[entry.id]})</span></li>`
        )
        .join("");
      return `<h3>${escapeHtml(category)}</h3><ul>${items}</ul>`;
    })
    .join("");

  return `
    <h2>Versione stampata</h2>
    <span class="tag">Guida</span>
    <span class="tag">agg. ${today}</span>

    <p>Aggiornamento rispetto alla versione stampata il <strong>${refDate}</strong>: ${changed.length} scheda/e nuova/e o modificata/e incluse in questo pacchetto.</p>

    ${sections}

    <h3>Per il prossimo aggiornamento</h3>
    <p>Conserva questa pagina nel raccoglitore. Al prossimo aggiornamento inserisci la data <strong>${today}</strong> nella sezione "Aggiornamento stampa" del sito.</p>
  `;
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
