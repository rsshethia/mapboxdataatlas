import { el } from './dom';

export interface Panel {
  root: HTMLElement;
  body: HTMLElement;
}

export function createPanel(title?: string): Panel {
  const root = el('div', 'panel');
  if (title) root.append(el('p', 'panel__title', title));
  const body = el('div', 'panel__body');
  root.append(body);
  return { root, body };
}

export function createMapUi(
  container: HTMLElement,
  position: 'left' | 'right' = 'left',
): HTMLElement {
  const root = el('div', `map-ui${position === 'right' ? ' map-ui--right' : ''}`);
  container.append(root);
  return root;
}

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
}

export function createSegmented<T extends string>(
  options: SegmentedOption<T>[],
  value: T,
  onChange: (value: T) => void,
): HTMLElement {
  const root = el('div', 'segmented');
  root.setAttribute('role', 'group');
  for (const option of options) {
    const button = el('button');
    button.type = 'button';
    button.textContent = option.label;
    button.setAttribute('aria-pressed', String(option.value === value));
    button.addEventListener('click', () => {
      for (const child of root.querySelectorAll('button')) {
        child.setAttribute('aria-pressed', String(child === button));
      }
      onChange(option.value);
    });
    root.append(button);
  }
  return root;
}

export interface RangeOptions {
  label: string;
  min: number;
  max: number;
  step?: number;
  value: number;
  format?: (value: number) => string;
  onInput: (value: number) => void;
}

export function createRange(options: RangeOptions): HTMLElement {
  const root = el('label', 'control-row');
  const label = el('span', '', options.label);
  const input = el('input');
  input.type = 'range';
  input.min = String(options.min);
  input.max = String(options.max);
  input.step = String(options.step ?? 1);
  input.value = String(options.value);
  const output = el('span', 'panel__value');
  const render = () =>
    (output.textContent = options.format ? options.format(Number(input.value)) : input.value);
  render();
  input.addEventListener('input', () => {
    render();
    options.onInput(Number(input.value));
  });
  root.append(label, input, output);
  return root;
}

export function createCheckbox(
  label: string,
  checked: boolean,
  onChange: (checked: boolean) => void,
): HTMLElement {
  const root = el('label', 'check-row');
  const input = el('input');
  input.type = 'checkbox';
  input.checked = checked;
  input.addEventListener('change', () => onChange(input.checked));
  root.append(input, el('span', '', label));
  return root;
}

export function createPlayButton(onClick: () => void, label = 'Play'): HTMLButtonElement {
  const button = el('button', 'play-button');
  button.type = 'button';
  button.textContent = '▶';
  button.setAttribute('aria-label', label);
  button.title = label;
  button.addEventListener('click', onClick);
  return button;
}

export function createMetric(label: string, value: string): HTMLElement {
  const root = el('div', 'metric');
  root.append(el('p', 'metric__value', value), el('p', 'metric__label', label));
  return root;
}

export function createNote(text: string): HTMLElement {
  return el('p', 'panel__note', text);
}

export function addOverlay(
  container: HTMLElement,
  node: HTMLElement,
  position: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right' = 'bottom-left',
): void {
  node.classList.add('map-overlay', `map-overlay--${position}`);
  container.append(node);
}
