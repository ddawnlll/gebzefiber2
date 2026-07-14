/* ============================================================
   Gebze Fiber Admin — UI engine
   Hand-rolled SVG charts (no CDN), live counter, table sort,
   count-up numbers and blog form helpers.
   ============================================================ */
(function () {
  'use strict';

  var COLORS = { mint: '#6bf0c2', amber: '#ffb25e', violet: '#9d8cff', muted: '#a59cc0' };
  var TYPE_COLORS = { phone: COLORS.violet, call: COLORS.violet, whatsapp: COLORS.mint, form: COLORS.amber };
  var TYPE_LABELS = { phone: 'Telefon', call: 'Arama', whatsapp: 'WhatsApp', form: 'Form' };
  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var NS = 'http://www.w3.org/2000/svg';

  function el(tag, attrs, parent) {
    var node = document.createElementNS(NS, tag);
    for (var k in attrs) node.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(node);
    return node;
  }

  function emptyChart(host, msg) {
    host.innerHTML =
      '<div class="chart-empty">' +
      '<svg viewBox="0 0 48 24" width="72" aria-hidden="true"><path d="M2 18 C 12 4, 22 22, 46 8" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-dasharray="3 4"/></svg>' +
      '<p>' + msg + '</p></div>';
  }

  /* Smooth path through points (Catmull-Rom → Bézier) */
  function smoothPath(pts) {
    if (pts.length < 2) return '';
    var d = 'M' + pts[0][0].toFixed(1) + ' ' + pts[0][1].toFixed(1);
    for (var i = 0; i < pts.length - 1; i++) {
      var p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
      var c1x = p1[0] + (p2[0] - p0[0]) / 6, c1y = p1[1] + (p2[1] - p0[1]) / 6;
      var c2x = p2[0] - (p3[0] - p1[0]) / 6, c2y = p2[1] - (p3[1] - p1[1]) / 6;
      d += ' C' + c1x.toFixed(1) + ' ' + c1y.toFixed(1) + ', ' + c2x.toFixed(1) + ' ' + c2y.toFixed(1) + ', ' + p2[0].toFixed(1) + ' ' + p2[1].toFixed(1);
    }
    return d;
  }

  function animateDraw(path) {
    if (REDUCED) return;
    var len = path.getTotalLength();
    path.style.strokeDasharray = len;
    path.style.strokeDashoffset = len;
    path.style.transition = 'stroke-dashoffset 1.1s cubic-bezier(0.4, 0, 0.2, 1)';
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { path.style.strokeDashoffset = '0'; });
    });
  }

  function toPoints(values, max, x0, x1, y0, y1) {
    var n = values.length;
    return values.map(function (v, i) {
      var x = n === 1 ? (x0 + x1) / 2 : x0 + (i * (x1 - x0)) / (n - 1);
      var y = y1 - (v / max) * (y1 - y0);
      return [x, y];
    });
  }

  /* ---------- Big area chart: views (mint area) + conversions (amber line) ---------- */
  function areaChart(host, labels, views, conversions) {
    if (!views.some(function (v) { return v > 0; }) && !conversions.some(function (v) { return v > 0; })) {
      return emptyChart(host, 'Bu aralıkta trafik yok — ışık henüz yolda.');
    }
    var W = 760, H = 260, L = 38, R = 10, T = 14, B = 28;
    var svg = el('svg', { viewBox: '0 0 ' + W + ' ' + H, preserveAspectRatio: 'none', 'aria-hidden': 'true' });
    svg.style.aspectRatio = W + '/' + H;

    var defs = el('defs', {}, svg);
    var grad = el('linearGradient', { id: 'agrad', x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
    el('stop', { offset: '0', 'stop-color': COLORS.mint, 'stop-opacity': '0.28' }, grad);
    el('stop', { offset: '1', 'stop-color': COLORS.mint, 'stop-opacity': '0' }, grad);

    var vMax = Math.max.apply(null, views.concat([4])) * 1.15;
    var cMax = Math.max.apply(null, conversions.concat([4])) * 1.15;

    /* y grid + labels (views scale) */
    for (var g = 0; g <= 3; g++) {
      var gy = T + (g * (H - T - B)) / 3;
      el('line', { x1: L, y1: gy, x2: W - R, y2: gy, stroke: 'rgba(237,234,246,0.06)', 'stroke-width': 1 }, svg);
      var lbl = el('text', { x: L - 7, y: gy + 3.5, 'text-anchor': 'end', fill: COLORS.muted, 'font-size': 10, 'font-family': 'inherit' }, svg);
      lbl.textContent = Math.round(vMax - (g * vMax) / 3);
    }

    /* x labels — at most 8, evenly picked */
    var n = labels.length;
    var step = Math.max(1, Math.ceil(n / 8));
    for (var i = 0; i < n; i += step) {
      var x = n === 1 ? (L + W - R) / 2 : L + (i * (W - R - L)) / (n - 1);
      var t = el('text', { x: x, y: H - 8, 'text-anchor': 'middle', fill: COLORS.muted, 'font-size': 10, 'font-family': 'inherit' }, svg);
      t.textContent = labels[i];
    }

    var vPts = toPoints(views, vMax, L, W - R, T, H - B);
    var area = smoothPath(vPts) + ' L' + (W - R) + ' ' + (H - B) + ' L' + L + ' ' + (H - B) + ' Z';
    el('path', { d: area, fill: 'url(#agrad)', stroke: 'none' }, svg);
    var vLine = el('path', { d: smoothPath(vPts), fill: 'none', stroke: COLORS.mint, 'stroke-width': 2.2, 'stroke-linecap': 'round' }, svg);

    var cPts = toPoints(conversions, cMax, L, W - R, T, H - B);
    var cLine = el('path', { d: smoothPath(cPts), fill: 'none', stroke: COLORS.amber, 'stroke-width': 1.8, 'stroke-linecap': 'round', 'stroke-dasharray': '1 0' }, svg);

    /* hover points with native tooltips */
    vPts.forEach(function (p, i) {
      var c = el('circle', { cx: p[0], cy: p[1], r: 7, fill: 'transparent' }, svg);
      el('title', {}, c).textContent = labels[i] + ' — ' + views[i] + ' görüntüleme, ' + conversions[i] + ' dönüşüm';
      el('circle', { cx: p[0], cy: p[1], r: 2.4, fill: COLORS.mint, 'pointer-events': 'none' }, svg);
    });

    host.innerHTML = '';
    host.appendChild(svg);
    animateDraw(vLine);
    animateDraw(cLine);
  }

  /* ---------- Sparkline inside KPI cards ---------- */
  function sparkline(svg, values, colorName) {
    var color = COLORS[colorName] || COLORS.mint;
    var W = 200, H = 34;
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    svg.setAttribute('preserveAspectRatio', 'none');
    if (!values || values.length < 2 || !values.some(function (v) { return v > 0; })) {
      el('line', { x1: 0, y1: H - 4, x2: W, y2: H - 4, stroke: 'rgba(237,234,246,0.12)', 'stroke-width': 1.5, 'stroke-dasharray': '3 4' }, svg);
      return;
    }
    var max = Math.max.apply(null, values) * 1.1;
    var pts = toPoints(values, max, 2, W - 2, 4, H - 3);
    var id = 'sg' + Math.random().toString(36).slice(2, 7);
    var defs = el('defs', {}, svg);
    var grad = el('linearGradient', { id: id, x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
    el('stop', { offset: '0', 'stop-color': color, 'stop-opacity': '0.22' }, grad);
    el('stop', { offset: '1', 'stop-color': color, 'stop-opacity': '0' }, grad);
    el('path', { d: smoothPath(pts) + ' L' + (W - 2) + ' ' + H + ' L2 ' + H + ' Z', fill: 'url(#' + id + ')' }, svg);
    el('path', { d: smoothPath(pts), fill: 'none', stroke: color, 'stroke-width': 1.8, 'stroke-linecap': 'round' }, svg);
    var last = pts[pts.length - 1];
    el('circle', { cx: last[0], cy: last[1], r: 2.6, fill: color }, svg);
  }

  /* ---------- Conversion type ring ---------- */
  function ring(host, segments) {
    var total = segments.reduce(function (s, x) { return s + x.c; }, 0);
    if (total === 0) return emptyChart(host, 'Bu aralıkta dönüşüm yok.');

    var size = 160, r = 62, cx = size / 2, cy = size / 2;
    var C = 2 * Math.PI * r;
    var svg = el('svg', { viewBox: '0 0 ' + size + ' ' + size, width: size, height: size, 'aria-hidden': 'true' });
    el('circle', { cx: cx, cy: cy, r: r, fill: 'none', stroke: 'rgba(255,255,255,0.05)', 'stroke-width': 12 }, svg);

    var offset = 0;
    segments.forEach(function (s) {
      var frac = s.c / total;
      var seg = el('circle', {
        cx: cx, cy: cy, r: r, fill: 'none',
        stroke: TYPE_COLORS[s.type] || COLORS.violet,
        'stroke-width': 12, 'stroke-linecap': 'butt',
        'stroke-dasharray': (frac * C - (segments.length > 1 ? 3 : 0)) + ' ' + C,
        'stroke-dashoffset': -offset * C,
        transform: 'rotate(-90 ' + cx + ' ' + cy + ')',
      }, svg);
      el('title', {}, seg).textContent = (TYPE_LABELS[s.type] || s.type) + ': ' + s.c;
      offset += frac;
    });

    var num = el('text', { x: cx, y: cy - 2, 'text-anchor': 'middle', fill: '#edeaf6', 'font-size': 30, 'font-weight': 700, 'font-family': '"Bricolage Grotesque", sans-serif' }, svg);
    num.textContent = total;
    var cap = el('text', { x: cx, y: cy + 18, 'text-anchor': 'middle', fill: COLORS.muted, 'font-size': 9.5, 'letter-spacing': '0.14em' }, svg);
    cap.textContent = 'DÖNÜŞÜM';

    var legend = document.createElement('div');
    legend.className = 'ring-legend';
    segments.forEach(function (s) {
      var row = document.createElement('div');
      row.className = 'ring-legend-item';
      row.innerHTML = '<i class="legend-dot" style="background:' + (TYPE_COLORS[s.type] || COLORS.violet) + '"></i>' +
        '<span>' + (TYPE_LABELS[s.type] || s.type) + '</span>' +
        '<strong>' + s.c + ' · %' + Math.round((s.c / total) * 100) + '</strong>';
      legend.appendChild(row);
    });

    host.innerHTML = '';
    host.appendChild(svg);
    host.appendChild(legend);
  }

  /* ---------- Day × hour heatmap ---------- */
  function heatmap(host, matrix) {
    var DAYS = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
    var max = 0;
    matrix.forEach(function (row) { row.forEach(function (v) { if (v > max) max = v; }); });
    if (max === 0) return emptyChart(host, 'Son 30 günde trafik yok.');

    var grid = document.createElement('div');
    grid.className = 'hm';
    grid.appendChild(document.createElement('span'));
    for (var h = 0; h < 24; h++) {
      var hl = document.createElement('span');
      hl.className = 'hm-hourlabel';
      hl.textContent = h % 3 === 0 ? String(h).padStart(2, '0') : '';
      grid.appendChild(hl);
    }
    matrix.forEach(function (row, d) {
      var dl = document.createElement('span');
      dl.className = 'hm-daylabel';
      dl.textContent = DAYS[d];
      grid.appendChild(dl);
      row.forEach(function (v, h) {
        var cell = document.createElement('div');
        cell.className = 'hm-cell';
        cell.style.setProperty('--heat', (v / max).toFixed(3));
        cell.title = DAYS[d] + ' ' + String(h).padStart(2, '0') + ':00 — ' + v + ' görüntüleme';
        grid.appendChild(cell);
      });
    });
    host.innerHTML = '';
    host.appendChild(grid);
  }

  /* ---------- Hourly bar chart (conversions page) ---------- */
  function hourBars(host, values) {
    if (!values.some(function (v) { return v > 0; })) {
      return emptyChart(host, 'Bu aralıkta dönüşüm yok.');
    }
    var W = 760, H = 170, B = 24, T = 10;
    var svg = el('svg', { viewBox: '0 0 ' + W + ' ' + H, preserveAspectRatio: 'none', 'aria-hidden': 'true' });
    svg.style.aspectRatio = W + '/' + H;
    var max = Math.max.apply(null, values);
    var bw = W / 24;
    values.forEach(function (v, h) {
      var bh = v > 0 ? Math.max(4, (v / max) * (H - B - T)) : 2;
      var bar = el('rect', {
        x: h * bw + bw * 0.18, y: H - B - bh,
        width: bw * 0.64, height: bh, rx: 3,
        fill: v > 0 ? COLORS.amber : 'rgba(255,255,255,0.05)',
        opacity: v > 0 ? 0.55 + 0.45 * (v / max) : 1,
      }, svg);
      el('title', {}, bar).textContent = String(h).padStart(2, '0') + ':00 — ' + v + ' dönüşüm';
      if (h % 3 === 0) {
        var t = el('text', { x: h * bw + bw / 2, y: H - 7, 'text-anchor': 'middle', fill: COLORS.muted, 'font-size': 10 }, svg);
        t.textContent = String(h).padStart(2, '0');
      }
    });
    host.innerHTML = '';
    host.appendChild(svg);
  }

  /* ---------- Count-up numbers ---------- */
  function countUp() {
    document.querySelectorAll('[data-count]').forEach(function (node) {
      var target = parseInt(node.getAttribute('data-count'), 10) || 0;
      if (REDUCED || target === 0) { node.textContent = target.toLocaleString('tr-TR'); return; }
      var start = null, DUR = 700;
      function tick(ts) {
        if (!start) start = ts;
        var p = Math.min(1, (ts - start) / DUR);
        var eased = 1 - Math.pow(1 - p, 3);
        node.textContent = Math.round(target * eased).toLocaleString('tr-TR');
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    });
  }

  /* ---------- Live visitor poll ---------- */
  function livePoll() {
    var node = document.getElementById('liveCount');
    if (!node) return;
    function refresh() {
      fetch('/admin/api/live', { headers: { 'X-Requested-With': 'XMLHttpRequest' } })
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (d) { if (d) node.textContent = d.live; })
        .catch(function () {});
    }
    refresh();
    setInterval(refresh, 30000);
  }

  /* ---------- Sortable tables ---------- */
  function sortableTables() {
    document.querySelectorAll('table[data-sortable]').forEach(function (table) {
      var heads = table.querySelectorAll('th[data-sort]');
      heads.forEach(function (th) {
        th.addEventListener('click', function () {
          var asc = th.classList.contains('is-sorted') && !th.classList.contains('sort-asc');
          heads.forEach(function (h) { h.classList.remove('is-sorted', 'sort-asc'); });
          th.classList.add('is-sorted');
          if (asc) th.classList.add('sort-asc');

          var idx = Array.prototype.indexOf.call(th.parentNode.children, th);
          var tbody = table.querySelector('tbody');
          var rows = Array.prototype.slice.call(tbody.querySelectorAll('tr'));
          rows.sort(function (a, b) {
            var av = parseFloat(a.children[idx].getAttribute('data-v')) || 0;
            var bv = parseFloat(b.children[idx].getAttribute('data-v')) || 0;
            return asc ? av - bv : bv - av;
          });
          rows.forEach(function (r) { tbody.appendChild(r); });
        });
      });
    });
  }

  /* ---------- Blog form helpers ---------- */
  function slugify(s) {
    var map = { ç: 'c', ğ: 'g', ı: 'i', i̇: 'i', ö: 'o', ş: 's', ü: 'u', Ç: 'c', Ğ: 'g', İ: 'i', I: 'i', Ö: 'o', Ş: 's', Ü: 'u' };
    return s
      .split('').map(function (ch) { return map[ch] || ch; }).join('')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 80);
  }

  function blogForm() {
    var form = document.getElementById('postForm');
    if (!form) return;
    var title = document.getElementById('fTitle');
    var slug = document.getElementById('fSlug');
    var excerpt = document.getElementById('fExcerpt');
    var content = document.getElementById('fContent');
    var excerptCount = document.getElementById('excerptCount');
    var contentCount = document.getElementById('contentCount');
    var toggle = document.getElementById('previewToggle');
    var pane = document.getElementById('previewPane');

    var slugAuto = slug.value === '';
    slug.addEventListener('input', function () { slugAuto = false; });
    title.addEventListener('input', function () { if (slugAuto) slug.value = slugify(title.value); });

    function counts() {
      if (excerptCount) excerptCount.textContent = excerpt.value.length;
      if (contentCount) contentCount.textContent = content.value.length.toLocaleString('tr-TR');
    }
    excerpt.addEventListener('input', counts);
    content.addEventListener('input', counts);
    counts();

    if (toggle && pane) {
      toggle.addEventListener('click', function () {
        var showing = !pane.hidden;
        if (showing) {
          pane.hidden = true;
          content.hidden = false;
          toggle.textContent = 'Önizleme';
        } else {
          /* Admin's own HTML, rendered back to the admin only */
          pane.innerHTML = content.value || '<p style="color:#a59cc0">İçerik boş.</p>';
          pane.hidden = false;
          content.hidden = true;
          toggle.textContent = 'Düzenle';
        }
      });
    }
  }

  /* ---------- Copy snippet (settings) ---------- */
  function copySnippet() {
    var btn = document.getElementById('copySnippet');
    var pre = document.getElementById('snippet');
    if (!btn || !pre) return;
    btn.addEventListener('click', function () {
      navigator.clipboard.writeText(pre.innerText).then(function () {
        var old = btn.textContent;
        btn.textContent = 'Kopyalandı ✓';
        setTimeout(function () { btn.textContent = old; }, 1600);
      }).catch(function () {});
    });
  }

  /* ---------- Boot ---------- */
  document.addEventListener('DOMContentLoaded', function () {
    // Data is passed via a JSON-typed script tag (not window.__DATA) so it
    // is exempt from the page's script-src CSP, which intentionally has no
    // 'unsafe-inline'.
    var dataEl = document.getElementById('admin-data');
    var D = null;
    if (dataEl) {
      try { D = JSON.parse(dataEl.textContent); } catch (e) { D = null; }
    }

    if (D) {
      var area = document.getElementById('areaChart');
      if (area && D.labels) areaChart(area, D.labels, D.views || [], D.conversions || []);

      document.querySelectorAll('.spark[data-spark]').forEach(function (svg) {
        sparkline(svg, D[svg.getAttribute('data-spark')] || [], svg.getAttribute('data-color'));
      });

      var ringHost = document.getElementById('convRing');
      if (ringHost && D.convTypes) ring(ringHost, D.convTypes);

      var heatHost = document.getElementById('heatmap');
      if (heatHost && D.heat) heatmap(heatHost, D.heat);

      var barsHost = document.getElementById('hourBars');
      if (barsHost && D.byHour) hourBars(barsHost, D.byHour);
    }

    countUp();
    livePoll();
    sortableTables();
    blogForm();
    copySnippet();
  });
})();
