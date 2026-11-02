import { el } from '../lib/dom';
import {
  clearToken,
  getToken,
  getTokenSource,
  hasEnvToken,
  setToken,
  validateToken,
} from '../lib/token';

let dialog: HTMLDialogElement | null = null;
let input: HTMLInputElement | null = null;
let status: HTMLElement | null = null;
let sourceNote: HTMLElement | null = null;
let clearButton: HTMLButtonElement | null = null;

function ensureDialog(): HTMLDialogElement {
  if (dialog) return dialog;

  dialog = el('dialog', 'token-dialog');
  dialog.setAttribute('aria-labelledby', 'token-dialog-title');
  dialog.innerHTML = `
    <form class="token-dialog__form" novalidate>
      <p class="eyebrow">Mapbox access</p>
      <h2 id="token-dialog-title">Add a public token</h2>
      <p class="token-dialog__lede">
        The maps are rendered by Mapbox GL JS. Use a public token that starts with
        <code>pk.</code> and restrict it to this site in your Mapbox account.
      </p>
      <label class="field">
        <span>Public access token</span>
        <input
          class="field__input"
          type="text"
          name="token"
          autocomplete="off"
          spellcheck="false"
          placeholder="pk.…"
        />
      </label>
      <p class="token-dialog__status" role="status" aria-live="polite"></p>
      <p class="token-dialog__source"></p>
      <div class="token-dialog__actions">
        <button class="button button--ghost" type="button" data-action="clear">Clear saved token</button>
        <span class="token-dialog__spacer"></span>
        <button class="button button--ghost" type="button" data-action="cancel">Cancel</button>
        <button class="button button--dark" type="submit">Use token</button>
      </div>
      <p class="token-dialog__fineprint">
        Tokens are stored in this browser only. Never use a secret <code>sk.</code> token
        in client-side code.
      </p>
    </form>
  `;

  const form = dialog.querySelector('form') as HTMLFormElement;
  input = dialog.querySelector('input[name="token"]') as HTMLInputElement;
  status = dialog.querySelector('.token-dialog__status') as HTMLElement;
  sourceNote = dialog.querySelector('.token-dialog__source') as HTMLElement;
  clearButton = dialog.querySelector('[data-action="clear"]') as HTMLButtonElement;

  const close = () => dialog?.close();

  dialog.querySelector('[data-action="cancel"]')?.addEventListener('click', close);
  clearButton.addEventListener('click', () => {
    clearToken();
    refreshSourceNote();
    if (status) status.textContent = 'Saved token cleared.';
    window.dispatchEvent(new CustomEvent('token-updated'));
  });

  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) close();
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!input || !status) return;
    const validation = validateToken(input.value);
    if (!validation.ok) {
      status.textContent = validation.message ?? 'That token is not valid.';
      input.focus();
      return;
    }
    const result = setToken(input.value);
    if (!result.ok) {
      status.textContent = result.message ?? 'That token is not valid.';
      return;
    }
    input.value = '';
    status.textContent = 'Token saved. Loading the map…';
    close();
    window.dispatchEvent(new CustomEvent('token-updated'));
  });

  document.body.append(dialog);
  return dialog;
}

function refreshSourceNote(): void {
  if (!sourceNote) return;
  const source = getTokenSource();
  if (source === 'env') {
    sourceNote.textContent = 'Currently using the token from .env. A saved token overrides it.';
    if (clearButton) clearButton.hidden = true;
  } else if (source === 'local') {
    sourceNote.textContent = 'Currently using a token saved in this browser.';
    if (clearButton) clearButton.hidden = false;
  } else {
    sourceNote.textContent = hasEnvToken()
      ? 'No saved token yet.'
      : 'No token found in .env or local storage.';
    if (clearButton) clearButton.hidden = true;
  }
}

export function openTokenDialog(message?: string): void {
  const node = ensureDialog();
  refreshSourceNote();
  if (status) status.textContent = message ?? '';
  if (input) {
    input.value = '';
    input.placeholder = getToken() ? 'Paste a replacement token' : 'pk.…';
  }
  if (!node.open) node.showModal();
  window.setTimeout(() => input?.focus(), 30);
}
