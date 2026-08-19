// Installazione come app (PWA) e funzionamento offline.
// - registra il service worker (sw.js), che tiene in cache shell e schede;
// - mostra il bottone "Installa app" quando il browser lo consente
//   (Chrome/Edge/Android: evento beforeinstallprompt);
// - su iOS/Safari, dove quell'evento non esiste, il bottone apre le
//   istruzioni manuali ("Condividi" -> "Aggiungi a schermata Home").
const INSTALL_DISMISSED_KEY = "installBannerChiuso";

const pwa = {
  deferredPrompt: null,
  btn: document.getElementById("btn-install-app"),
  modal: document.getElementById("install-modal"),
  btnClose: document.getElementById("btn-install-close"),
  iosBlock: document.getElementById("install-ios"),
  genericBlock: document.getElementById("install-generic"),
};

registerServiceWorker();
setupInstall();

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  // Il service worker sta nella root del sito, quindi copre anche le
  // sottocartelle content/ e assets/ sia in locale sia su GitHub Pages.
  const swUrl = new URL("sw.js", document.baseURI);
  window.addEventListener("load", () => {
    navigator.serviceWorker.register(swUrl).catch((err) => {
      console.error("Registrazione service worker fallita", err);
    });
  });
}

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true
  );
}

function isIos() {
  const ua = navigator.userAgent;
  return /iPad|iPhone|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
}

function setupInstall() {
  if (!pwa.btn) return;

  window.addEventListener("beforeinstallprompt", (event) => {
    // Si blocca il mini-banner automatico: l'installazione parte dal bottone.
    event.preventDefault();
    pwa.deferredPrompt = event;
    showInstallButton();
  });

  window.addEventListener("appinstalled", () => {
    pwa.deferredPrompt = null;
    hideInstallButton();
    closeInstallModal();
  });

  // iOS non espone beforeinstallprompt: il bottone c'è comunque e spiega
  // i due passaggi manuali, finché l'app non gira già in standalone.
  if (isIos() && !isStandalone() && localStorage.getItem(INSTALL_DISMISSED_KEY) !== "1") {
    showInstallButton();
  }

  pwa.btn.addEventListener("click", onInstallClick);
  if (pwa.btnClose) pwa.btnClose.addEventListener("click", closeInstallModal);
  if (pwa.modal) {
    const backdrop = pwa.modal.querySelector(".modal-backdrop");
    if (backdrop) backdrop.addEventListener("click", closeInstallModal);
  }
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && pwa.modal && !pwa.modal.hidden) closeInstallModal();
  });
}

function showInstallButton() {
  if (isStandalone()) return;
  pwa.btn.hidden = false;
}

function hideInstallButton() {
  pwa.btn.hidden = true;
}

async function onInstallClick() {
  if (pwa.deferredPrompt) {
    const prompt = pwa.deferredPrompt;
    pwa.deferredPrompt = null;
    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === "accepted") hideInstallButton();
    return;
  }
  openInstallModal();
}

function openInstallModal() {
  if (!pwa.modal) return;
  const ios = isIos();
  if (pwa.iosBlock) pwa.iosBlock.hidden = !ios;
  if (pwa.genericBlock) pwa.genericBlock.hidden = ios;
  pwa.modal.hidden = false;
}

function closeInstallModal() {
  if (!pwa.modal) return;
  pwa.modal.hidden = true;
  // Su iOS il bottone non ha modo di sapere se l'utente ha installato:
  // dopo aver chiuso le istruzioni non lo si ripropone a ogni visita.
  if (isIos() && !pwa.deferredPrompt) {
    localStorage.setItem(INSTALL_DISMISSED_KEY, "1");
    hideInstallButton();
  }
}
