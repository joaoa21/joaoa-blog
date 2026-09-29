/* ============================================================
   MENU DE OPÇÕES PERSONALIZADO
   O <select> nativo abre um menu do sistema operacional, que não
   aceita estilo. Aqui ele fica escondido (continua valendo para os
   formulários e eventos) e um botão + lista na identidade do site
   assume a aparência. Teclado: setas, Home/End, Enter/Espaço, Esc
   e digitar a inicial de uma opção.
   ============================================================ */

let uid = 0;

export function enhanceSelect(select) {
  if (select.dataset.enhanced) return;
  select.dataset.enhanced = 'true';
  const id = `sel-${++uid}`;

  const wrap = document.createElement('div');
  wrap.className = 'dd';
  select.before(wrap);
  wrap.append(select);
  select.classList.add('dd-native');
  select.tabIndex = -1;
  select.setAttribute('aria-hidden', 'true');

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'dd-button';
  button.id = `${id}-button`;
  button.setAttribute('aria-haspopup', 'listbox');
  button.setAttribute('aria-expanded', 'false');
  button.setAttribute('aria-controls', `${id}-list`);
  const label = select.closest('label')?.querySelector('.sr-only, .mono');
  if (label) button.setAttribute('aria-label', label.textContent.trim());
  button.innerHTML = '<span class="dd-value"></span><span class="dd-arrow" aria-hidden="true"></span>';

  const list = document.createElement('ul');
  list.className = 'dd-list';
  list.id = `${id}-list`;
  list.setAttribute('role', 'listbox');
  list.tabIndex = -1;
  list.hidden = true;

  wrap.append(button, list);

  const options = () => [...select.options];
  let active = 0;

  function render() {
    list.replaceChildren(...options().map((option, index) => {
      const item = document.createElement('li');
      item.id = `${id}-opt-${index}`;
      item.className = 'dd-option';
      item.setAttribute('role', 'option');
      item.setAttribute('aria-selected', String(option.selected));
      item.textContent = option.textContent;
      item.addEventListener('mousedown', (event) => event.preventDefault());
      item.addEventListener('click', () => choose(index));
      item.addEventListener('mousemove', () => highlight(index));
      return item;
    }));
  }

  function sync() {
    button.querySelector('.dd-value').textContent = select.selectedOptions[0]?.textContent ?? '';
    list.querySelectorAll('.dd-option').forEach((item, index) => item.setAttribute('aria-selected', String(index === select.selectedIndex)));
  }

  function highlight(index) {
    const items = list.querySelectorAll('.dd-option');
    if (!items.length) return;
    active = Math.max(0, Math.min(index, items.length - 1));
    items.forEach((item, i) => item.classList.toggle('is-active', i === active));
    list.setAttribute('aria-activedescendant', items[active].id);
    items[active].scrollIntoView({ block: 'nearest' });
  }

  function open() {
    if (!list.hidden) return;
    render();
    list.hidden = false;
    wrap.classList.add('is-open');
    button.setAttribute('aria-expanded', 'true');
    // abre para cima se não couber embaixo
    const room = window.innerHeight - button.getBoundingClientRect().bottom;
    wrap.classList.toggle('dd--up', room < Math.min(list.scrollHeight, 280) + 16);
    highlight(Math.max(select.selectedIndex, 0));
    list.focus();
    document.addEventListener('pointerdown', outside, true);
  }

  function close(focusButton = true) {
    if (list.hidden) return;
    list.hidden = true;
    wrap.classList.remove('is-open');
    button.setAttribute('aria-expanded', 'false');
    document.removeEventListener('pointerdown', outside, true);
    if (focusButton) button.focus();
  }

  function outside(event) {
    if (!wrap.contains(event.target)) close(false);
  }

  function choose(index) {
    const changed = select.selectedIndex !== index;
    select.selectedIndex = index;
    sync();
    close();
    if (changed) {
      select.dispatchEvent(new Event('input', { bubbles: true }));
      select.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }

  button.addEventListener('click', () => (list.hidden ? open() : close()));
  button.addEventListener('keydown', (event) => {
    if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) {
      event.preventDefault();
      open();
    }
  });

  let typed = '';
  let typedTimer;
  list.addEventListener('keydown', (event) => {
    const count = options().length;
    switch (event.key) {
      case 'ArrowDown': event.preventDefault(); highlight(active + 1); break;
      case 'ArrowUp': event.preventDefault(); highlight(active - 1); break;
      case 'Home': event.preventDefault(); highlight(0); break;
      case 'End': event.preventDefault(); highlight(count - 1); break;
      case 'Enter':
      case ' ': event.preventDefault(); choose(active); break;
      case 'Escape': event.preventDefault(); close(); break;
      case 'Tab': close(false); break;
      default:
        if (event.key.length === 1) {
          typed += event.key.toLowerCase();
          clearTimeout(typedTimer);
          typedTimer = setTimeout(() => { typed = ''; }, 600);
          const match = options().findIndex((option) => option.textContent.toLowerCase().startsWith(typed));
          if (match >= 0) highlight(match);
        }
    }
  });

  // quando o código muda o valor (ex.: abrir um post no editor), o botão acompanha
  const descriptor = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value');
  Object.defineProperty(select, 'value', {
    get() { return descriptor.get.call(this); },
    set(value) { descriptor.set.call(this, value); sync(); },
  });
  select.addEventListener('change', sync);

  sync();
}
