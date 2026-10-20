(() => {
  const body = document.body;
  const display = document.querySelector('[data-display]');
  const history = document.querySelector('[data-history]');
  const collectionTab = document.querySelector('.collection-tab');
  const tabs = [...document.querySelectorAll('[data-tab]')];
  const views = [...document.querySelectorAll('[data-view]')];
  const toast = document.querySelector('[data-toast]');
  const activityStage = document.querySelector('[data-activity-stage]');

  const calculator = {
    current: '0',
    stored: null,
    operator: null,
    waiting: false,
    resetAfterEquals: false,
  };

  const prettyOperator = (operator) => ({ '/': '÷', '*': '×', '-': '−', '+': '+' }[operator] || operator);

  function formatNumber(value) {
    const text = String(value);
    if (text.length <= 11) return text;
    const number = Number(value);
    return Number.isFinite(number) ? number.toExponential(6) : 'Error';
  }

  function updateDisplay() {
    display.textContent = formatNumber(calculator.current);
    history.textContent = calculator.stored !== null && calculator.operator
      ? `${formatNumber(calculator.stored)} ${prettyOperator(calculator.operator)}`
      : '\u00a0';
  }

  function clearCalculator() {
    calculator.current = '0';
    calculator.stored = null;
    calculator.operator = null;
    calculator.waiting = false;
    calculator.resetAfterEquals = false;
    updateDisplay();
  }

  function inputNumber(number) {
    if (calculator.waiting || calculator.resetAfterEquals || calculator.current === 'Error') {
      calculator.current = number;
      calculator.waiting = false;
      calculator.resetAfterEquals = false;
    } else {
      calculator.current = calculator.current === '0' ? number : `${calculator.current}${number}`;
    }
    if (calculator.current.replace('-', '').replace('.', '').length > 11) calculator.current = calculator.current.slice(0, -1);
    updateDisplay();
  }

  function inputDecimal() {
    if (calculator.waiting || calculator.resetAfterEquals) {
      calculator.current = '0.';
      calculator.waiting = false;
      calculator.resetAfterEquals = false;
    } else if (!calculator.current.includes('.')) {
      calculator.current += '.';
    }
    updateDisplay();
  }

  function calculate(a, b, operator) {
    if (operator === '+') return a + b;
    if (operator === '-') return a - b;
    if (operator === '*') return a * b;
    if (operator === '/') return b === 0 ? NaN : a / b;
    return b;
  }

  function chooseOperator(nextOperator) {
    const value = Number(calculator.current);
    if (calculator.operator && !calculator.waiting) {
      const result = calculate(calculator.stored, value, calculator.operator);
      calculator.current = Number.isFinite(result) ? String(Number(result.toPrecision(12))) : 'Error';
      calculator.stored = Number.isFinite(result) ? result : null;
    } else {
      calculator.stored = value;
    }
    calculator.operator = nextOperator;
    calculator.waiting = true;
    calculator.resetAfterEquals = false;
    updateDisplay();
  }

  function equals() {
    if (!calculator.operator && calculator.current === '1771') {
      unlock();
      clearCalculator();
      return;
    }
    if (!calculator.operator || calculator.stored === null || calculator.waiting) return;
    const right = Number(calculator.current);
    const expression = `${formatNumber(calculator.stored)} ${prettyOperator(calculator.operator)} ${formatNumber(right)}`;
    const result = calculate(calculator.stored, right, calculator.operator);
    calculator.current = Number.isFinite(result) ? String(Number(result.toPrecision(12))) : 'Error';
    calculator.stored = null;
    calculator.operator = null;
    calculator.waiting = false;
    calculator.resetAfterEquals = true;
    history.textContent = expression;
    display.textContent = formatNumber(calculator.current);
  }

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('is-visible');
    window.setTimeout(() => toast.classList.remove('is-visible'), 1800);
  }

  function setView(name) {
    tabs.forEach((tab) => {
      const active = tab.dataset.tab === name;
      tab.classList.toggle('is-active', active);
      active ? tab.setAttribute('aria-current', 'page') : tab.removeAttribute('aria-current');
    });
    views.forEach((view) => {
      const active = view.dataset.view === name;
      view.classList.toggle('is-active', active);
      view.hidden = !active;
    });
  }

  function unlock() {
    body.classList.remove('is-locked');
    collectionTab.hidden = false;
    document.querySelector('[data-brand-title]').textContent = 'Collection';
    document.querySelector('[data-brand-subtitle]').textContent = 'Interactive suite';
    document.title = 'Collection';
    setView('collection');
    showToast('Collection unlocked');
  }

  function lock() {
    window.ActivityCollection?.stopAll?.();
    body.classList.add('is-locked');
    collectionTab.hidden = true;
    document.querySelector('[data-brand-title]').textContent = 'Calculator';
    document.querySelector('[data-brand-subtitle]').textContent = 'Everyday utility';
    document.title = 'Calculator';
    closeActivity();
    clearCalculator();
    setView('calculator');
  }

  function openActivity(name) {
    activityStage.hidden = false;
    body.classList.add('activity-open');
    document.querySelectorAll('[data-activity-panel]').forEach((panel) => {
      panel.hidden = panel.dataset.activityPanel !== name;
    });
    window.ActivityCollection?.start?.(name);
  }

  function closeActivity() {
    window.ActivityCollection?.stopAll?.();
    body.classList.remove('activity-open');
    activityStage.hidden = true;
    document.querySelectorAll('[data-activity-panel]').forEach((panel) => { panel.hidden = true; });
  }

  document.querySelector('.keypad').addEventListener('click', (event) => {
    const button = event.target.closest('button');
    if (!button) return;
    if (button.dataset.number !== undefined) inputNumber(button.dataset.number);
    else if (button.dataset.operator) chooseOperator(button.dataset.operator);
    else if (button.dataset.action === 'decimal') inputDecimal();
    else if (button.dataset.action === 'clear') clearCalculator();
    else if (button.dataset.action === 'sign') { calculator.current = String(Number(calculator.current) * -1); updateDisplay(); }
    else if (button.dataset.action === 'percent') { calculator.current = String(Number(calculator.current) / 100); updateDisplay(); }
    else if (button.dataset.action === 'equals') equals();
  });

  document.addEventListener('keydown', (event) => {
    const activeActivity = document.querySelector('[data-activity-panel]:not([hidden])');
    if (activeActivity && !body.classList.contains('is-locked')) return;
    if (/^[0-9]$/.test(event.key)) inputNumber(event.key);
    else if (['+', '-', '*', '/'].includes(event.key)) chooseOperator(event.key);
    else if (event.key === '.') inputDecimal();
    else if (event.key === 'Enter' || event.key === '=') { event.preventDefault(); equals(); }
    else if (event.key === 'Escape' || event.key === 'Delete') clearCalculator();
    else if (event.key === 'Backspace') {
      calculator.current = calculator.current.length > 1 ? calculator.current.slice(0, -1) : '0';
      updateDisplay();
    }
  });

  tabs.forEach((tab) => tab.addEventListener('click', () => {
    if (tab.dataset.tab === 'calculator') lock();
    else if (!body.classList.contains('is-locked')) { closeActivity(); setView('collection'); }
  }));

  document.querySelectorAll('[data-open-activity]').forEach((button) => button.addEventListener('click', () => openActivity(button.dataset.openActivity)));
  document.querySelector('[data-close-activity]').addEventListener('click', closeActivity);
  document.querySelector('.brand').addEventListener('click', (event) => { event.preventDefault(); lock(); });

  clearCalculator();
  lock();
})();
