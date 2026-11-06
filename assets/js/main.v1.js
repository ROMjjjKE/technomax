/* ЧПУП «Техномакс-компани»: меню-панель, фильтр работ, заявка */

var WA_BASE = 'https://wa.me/375292624957';

document.addEventListener('DOMContentLoaded', function () {
  initDrawer();
  initWorks();
  initForm();
  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
});

/* Полноэкранная панель: блокировка прокрутки, закрытие по ссылке, фону, кнопке и Escape */
function initDrawer() {
  var burger = document.getElementById('burger');
  var drawer = document.getElementById('drawer');
  if (!burger || !drawer) return;
  var lastFocus = null;

  function open() {
    lastFocus = document.activeElement;
    drawer.hidden = false;
    burger.setAttribute('aria-expanded', 'true');
    document.body.classList.add('is-locked');
    var closeBtn = document.getElementById('drawer-close');
    if (closeBtn) closeBtn.focus({ preventScroll: true });
  }

  function close() {
    drawer.hidden = true;
    burger.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('is-locked');
    if (lastFocus) lastFocus.focus({ preventScroll: true });
  }

  burger.addEventListener('click', function () {
    if (drawer.hidden) open(); else close();
  });

  var closeBtn = document.getElementById('drawer-close');
  if (closeBtn) closeBtn.addEventListener('click', close);

  drawer.addEventListener('click', function (e) {
    if (e.target.closest('a')) { close(); return; }
    if (!e.target.closest('.drawer__inner')) close();
  });

  document.addEventListener('keydown', function (e) {
    if (drawer.hidden) return;
    if (e.key === 'Escape') { close(); return; }
    if (e.key !== 'Tab') return;
    var items = drawer.querySelectorAll('a, button');
    if (!items.length) return;
    var first = items[0], last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  window.addEventListener('resize', function () {
    if (window.innerWidth > 1180 && !drawer.hidden) close();
  });
}

/* Фильтр работ */
function initWorks() {
  var chips = document.getElementById('chips');
  if (!chips) return;
  var works = [].slice.call(document.querySelectorAll('.work'));
  chips.addEventListener('click', function (e) {
    var btn = e.target.closest('.chip');
    if (!btn) return;
    var cat = btn.getAttribute('data-cat');
    [].forEach.call(chips.querySelectorAll('.chip'), function (c) {
      c.classList.toggle('is-on', c === btn);
      c.setAttribute('aria-selected', String(c === btn));
    });
    var shown = 0;
    works.forEach(function (w) {
      var hit = cat === 'all' || w.getAttribute('data-cat') === cat;
      w.classList.toggle('is-hidden', !hit);
      if (hit) shown++;
    });
    var lead = document.querySelector('.phead__lead');
    if (lead && !lead.dataset.base) lead.dataset.base = lead.textContent;
    if (lead) lead.textContent = cat === 'all'
      ? lead.dataset.base
      : 'Показано ' + shown + ' из ' + works.length + ': ' + btn.textContent.trim().toLowerCase() + '.';
  });
}

/* Заявка: собираем текст и открываем WhatsApp */
function initForm() {
  var form = document.getElementById('lead-form');
  if (!form) return;
  var ok = document.getElementById('form-ok');
  var out = document.getElementById('order-text');
  var send = document.getElementById('order-send');
  var copy = document.getElementById('order-copy');

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var name = document.getElementById('f-name');
    var contact = document.getElementById('f-contact');
    var what = document.getElementById('f-what');
    var note = document.getElementById('f-note');
    var bad = false;
    [name, contact].forEach(function (el) {
      if (!el.value.trim()) { el.style.borderColor = '#C0392B'; bad = true; }
      else el.style.borderColor = '';
    });
    if (bad) return;

    var text = 'Заявка с сайта Техномакс-компани\n' +
      'Имя: ' + name.value.trim() + '\n' +
      'Контакт: ' + contact.value.trim() + '\n' +
      'Что нужно: ' + what.value + '\n' +
      (note.value.trim() ? 'Детали: ' + note.value.trim() + '\n' : '') +
      'Фото приложу в чате.';
    out.textContent = text;
    send.href = WA_BASE + '?text=' + encodeURIComponent(text);
    if (ok.hidden) {
      ok.hidden = false;
      form.querySelectorAll('input, select, textarea, .form__btn').forEach(function (el) { el.disabled = true; });
    }
    ok.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  });

  if (copy) {
    copy.addEventListener('click', function () {
      var text = out.textContent || '';
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text);
      } else {
        var ta = document.createElement('textarea');
        ta.value = text; document.body.appendChild(ta); ta.select();
        document.execCommand('copy'); document.body.removeChild(ta);
      }
      copy.textContent = 'Скопировано';
      setTimeout(function () { copy.textContent = 'Скопировать текст'; }, 1800);
    });
  }
}
