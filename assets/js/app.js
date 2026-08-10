// Ordine preferito delle categorie in sidebar; le categorie non elencate
// qui vengono aggiunte in coda in ordine alfabetico.
const CATEGORY_ORDER = ["Montagna", "Trekking", "Sopravvivenza", "Meteo", "Altro"];

const state = {
  manifest: [],
  current: null,
};

const els = {
  sidebar: document.getElementById("sidebar"),
  emptyState: document.getElementById("empty-state"),
  cardPreview: document.getElementById("card-preview"),
  a6Single: document.getElementById("a6-single"),
  btnExportSingle: document.getElementById("btn-export-single"),
  btnExportAll: document.getElementById("btn-export-all"),
  printArea: document.getElementById("print-area"),
};

init();

async function init() {
  state.manifest = await loadManifest();
  renderSidebar(state.manifest);
  els.btnExportAll.disabled = state.manifest.length === 0;

  els.btnExportSingle.addEventListener("click", exportCurrentCard);
  els.btnExportAll.addEventListener("click", exportAllCards);
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
    const section = document.createElement("div");
    section.className = "category";

    const h2 = document.createElement("h2");
    h2.textContent = category;
    section.appendChild(h2);

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

  els.a6Single.innerHTML = html;
  els.emptyState.hidden = true;
  els.cardPreview.hidden = false;
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
  els.printArea.innerHTML = `<div class="a6-page">${els.a6Single.innerHTML}</div>`;
  window.print();
}

async function exportAllCards() {
  if (state.manifest.length === 0) return;

  const fragments = await Promise.all(
    state.manifest.map((entry) => fetchFragment(entry.file))
  );

  els.printArea.innerHTML = fragments
    .filter((html) => html !== null)
    .map((html) => `<div class="a6-page">${html}</div>`)
    .join("");

  window.print();
}
