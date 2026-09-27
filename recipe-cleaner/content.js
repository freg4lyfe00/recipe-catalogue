(function () {
  const ID = '_rcv', STID = '_rcv_st';
  const ex = document.getElementById(ID);
  if (ex) { ex.remove(); document.getElementById(STID)?.remove(); return; }

  // ── Ingredient DB: [g_per_cup, is_liquid] ───────────────────────────────────
  const DB = {
    'flour':[120,0],'all-purpose flour':[120,0],'plain flour':[120,0],
    'bread flour':[127,0],'cake flour':[100,0],'whole wheat flour':[120,0],
    'wholemeal flour':[120,0],'almond flour':[96,0],'oat flour':[92,0],
    'rice flour':[158,0],'cornstarch':[128,0],'cornflour':[128,0],
    'cocoa powder':[85,0],'cacao powder':[85,0],
    'baking powder':[230,0],'baking soda':[230,0],'bicarbonate of soda':[230,0],
    'sugar':[200,0],'granulated sugar':[200,0],'caster sugar':[200,0],
    'white sugar':[200,0],'brown sugar':[195,0],'light brown sugar':[200,0],
    'dark brown sugar':[195,0],'raw sugar':[200,0],'coconut sugar':[180,0],
    'powdered sugar':[115,0],'icing sugar':[115,0],'confectioners sugar':[115,0],
    'butter':[227,0],'unsalted butter':[227,0],'salted butter':[227,0],
    'coconut oil':[218,0],'shortening':[191,0],
    'olive oil':[216,1],'vegetable oil':[218,1],'canola oil':[218,1],
    'sunflower oil':[218,1],'oil':[218,1],
    'water':[237,1],'milk':[244,1],'whole milk':[244,1],'oat milk':[240,1],
    'almond milk':[240,1],'soy milk':[240,1],'cream':[240,1],
    'heavy cream':[240,1],'double cream':[240,1],'whipping cream':[238,1],
    'sour cream':[240,1],'buttermilk':[245,1],'yogurt':[245,1],'greek yogurt':[250,1],
    'honey':[340,1],'maple syrup':[322,1],'agave':[340,1],'molasses':[328,1],
    'golden syrup':[330,1],'corn syrup':[328,1],
    'vinegar':[240,1],'apple cider vinegar':[240,1],'lemon juice':[244,1],
    'lime juice':[244,1],'orange juice':[248,1],
    'stock':[240,1],'broth':[240,1],'chicken stock':[240,1],'vegetable stock':[240,1],
    'soy sauce':[255,1],'fish sauce':[255,1],
    'oats':[90,0],'rolled oats':[90,0],'quick oats':[90,0],'rice':[185,0],
    'breadcrumbs':[108,0],'panko':[50,0],'quinoa':[170,0],
    'salt':[273,0],'kosher salt':[135,0],'sea salt':[273,0],
    'cream cheese':[230,0],'peanut butter':[258,0],'tahini':[240,1],
    'tomato paste':[262,0],'miso':[250,0],
  };
  const UML = {
    'cup':236.588,'cups':236.588,'tbsp':14.787,'tablespoon':14.787,'tablespoons':14.787,
    'tsp':4.929,'teaspoon':4.929,'teaspoons':4.929,
    'fl oz':29.574,'fluid oz':29.574,'fluid ounce':29.574,'fluid ounces':29.574,
    'pint':473.176,'pints':473.176,'pt':473.176,
    'quart':946.353,'quarts':946.353,'qt':946.353,
    'gallon':3785.41,'gallons':3785.41,
    'ml':1,'milliliter':1,'milliliters':1,'millilitre':1,'millilitres':1,
    'l':1000,'liter':1000,'liters':1000,'litre':1000,'litres':1000,
  };
  const UG = {
    'g':1,'gram':1,'grams':1,'kg':1000,'kilogram':1000,'kilograms':1000,
    'oz':28.3495,'ounce':28.3495,'ounces':28.3495,
    'lb':453.592,'lbs':453.592,'pound':453.592,'pounds':453.592,
  };
  const UL = [...Object.keys(UML), ...Object.keys(UG),
    'pinch','pinches','dash','dashes','bunch','bunches','clove','cloves',
    'slice','slices','sprig','sprigs','stalk','stalks','can','cans',
    'package','packages','pkg','strip','strips','piece','pieces',
  ].sort((a, b) => b.length - a.length);

  // ── Parsing ─────────────────────────────────────────────────────────────────
  function frac(s) {
    s = (s || '').trim();
    let m = s.match(/^(\d+)\s+(\d+)\/(\d+)$/);
    if (m) return +m[1] + +m[2] / +m[3];
    m = s.match(/^(\d+)\/(\d+)$/);
    if (m) return +m[1] / +m[2];
    const n = parseFloat(s);
    return isNaN(n) ? null : n;
  }
  function parseIng(s) {
    s = (s || '').replace(/[½]/g,'1/2').replace(/[¼]/g,'1/4')
      .replace(/[¾]/g,'3/4').replace(/[⅓]/g,'1/3')
      .replace(/[⅔]/g,'2/3').replace(/[⅛]/g,'1/8').trim();
    let qty = null, unit = '', name = s;
    const qm = s.match(/^((?:\d+\s+)?\d+\/\d+|\d+(?:\.\d+)?)/);
    if (qm) { qty = frac(qm[1]); name = s.slice(qm[1].length).trim(); }
    for (const u of UL) {
      const re = new RegExp('^' + u.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + 's?\\.?\\s*', 'i');
      if (re.test(name)) { unit = u.toLowerCase(); name = name.replace(re, '').trim(); break; }
    }
    name = name.replace(/^[,;]\s*/, '');
    return { qty, unit, name };
  }
  function lookup(name) {
    const k = name.toLowerCase().replace(/[,(].*/,'').replace(/\s+/g,' ').trim();
    if (DB[k]) return DB[k];
    let best = null, bl = 0;
    for (const [dk, dv] of Object.entries(DB)) {
      if ((k.includes(dk) || dk.includes(k)) && dk.length > bl) { best = dv; bl = dk.length; }
    }
    return best;
  }

  // ── Formatting ──────────────────────────────────────────────────────────────
  function fmtG(g) {
    if (g >= 1000) return (g/1000).toFixed(2).replace(/\.?0+$/,'') + ' kg';
    if (g >= 10) return Math.round(g) + ' g';
    return g.toFixed(1) + ' g';
  }
  function fmtMl(ml) {
    if (ml >= 1000) return (ml/1000).toFixed(2).replace(/\.?0+$/,'') + ' L';
    if (ml >= 10) return Math.round(ml) + ' ml';
    return ml.toFixed(1) + ' ml';
  }
  function fmtQ(n) {
    if (!n && n !== 0) return '';
    if (n === Math.floor(n)) return String(n);
    const fs = [[1,8,'⅛'],[1,4,'¼'],[1,3,'⅓'],[1,2,'½'],[2,3,'⅔'],[3,4,'¾']];
    const ii = Math.floor(n), d = n - ii;
    for (const [a, b, sym] of fs) if (Math.abs(d - a/b) < 0.04) return ii > 0 ? `${ii} ${sym}` : sym;
    return n.toFixed(2).replace(/\.?0+$/,'');
  }
  function cvt(ing, scale, doConvert) {
    const { qty, unit, name } = ing;
    const sq = qty != null ? qty * scale : null;
    if (!doConvert || !unit) {
      const p = []; if (sq != null) p.push(fmtQ(sq)); if (unit) p.push(unit);
      return { amt: p.join(' '), name };
    }
    if (UG[unit]) return { amt: fmtG(sq * UG[unit]), name };
    if (['ml','milliliter','milliliters','millilitre','millilitres'].includes(unit)) return { amt: fmtMl(sq), name };
    if (['l','liter','liters','litre','litres'].includes(unit)) return { amt: fmtMl(sq * 1000), name };
    if (UML[unit]) {
      const ml = sq * UML[unit], info = lookup(name);
      if (info) return info[1] ? { amt: fmtMl(ml), name } : { amt: fmtG(ml * (info[0] / 236.588)), name };
      return { amt: fmtMl(ml), name };
    }
    const p = []; if (sq != null) p.push(fmtQ(sq)); if (unit) p.push(unit);
    return { amt: p.join(' '), name };
  }

  function clean(s) { return (s || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim(); }
  function esc(s) { return (s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  // ── Schema.org extraction ───────────────────────────────────────────────────
  function fromSchema(d) {
    const ings = (d.recipeIngredient || []).map(s => parseIng(clean(s)));
    const steps = [];
    let raw = d.recipeInstructions || [];
    if (!Array.isArray(raw)) raw = [raw];
    for (const item of raw) {
      if (typeof item === 'string') steps.push(clean(item));
      else if (item['@type'] === 'HowToStep') steps.push(clean(item.text || item.name));
      else if (item['@type'] === 'HowToSection')
        for (const st of (item.itemListElement || [])) steps.push(clean(st.text || st.name || st));
    }
    const yld = d.recipeYield;
    const srv = yld ? parseInt(Array.isArray(yld) ? yld[0] : yld) : NaN;
    return { name: clean(d.name), servings: isNaN(srv) ? null : srv, ings, steps: steps.filter(Boolean) };
  }

  // ── DOM fallback ────────────────────────────────────────────────────────────
  function fromDOM() {
    let name = '', servings = null, ings = [], steps = [];

    // WP Recipe Maker
    const wprm = document.querySelector('.wprm-recipe');
    if (wprm) {
      name = clean(wprm.querySelector('.wprm-recipe-name')?.textContent || '');
      servings = parseInt(wprm.querySelector('.wprm-recipe-servings')?.textContent) || null;
      wprm.querySelectorAll('.wprm-recipe-ingredient').forEach(el => {
        const q = el.querySelector('.wprm-recipe-ingredient-amount')?.textContent.trim() || '';
        const u = el.querySelector('.wprm-recipe-ingredient-unit')?.textContent.trim() || '';
        const n = el.querySelector('.wprm-recipe-ingredient-name')?.textContent.trim() || '';
        if (n) ings.push({ qty: q ? frac(q) : null, unit: u.toLowerCase(), name: n });
      });
      wprm.querySelectorAll('.wprm-recipe-instruction-text').forEach(el => steps.push(el.textContent.trim()));
    }
    // Tasty Recipes
    if (!ings.length) {
      const tr = document.querySelector('.tasty-recipe, .tasty-recipes');
      if (tr) {
        name = name || clean(tr.querySelector('.tasty-recipes-title, .tasty-recipe-title')?.textContent || '');
        tr.querySelectorAll('.tasty-recipes-ingredients li, .tasty-recipe-ingredients li').forEach(el => ings.push(parseIng(el.textContent.trim())));
        tr.querySelectorAll('.tasty-recipes-instructions li, .tasty-recipes-instructions p, .tasty-recipe-instructions li, .tasty-recipe-instructions p').forEach(el => steps.push(el.textContent.trim()));
      }
    }
    // Mediavine Create
    if (!ings.length) {
      const mv = document.querySelector('[class*="mv-create"]');
      if (mv) {
        name = name || clean(mv.querySelector('[class*="mv-create-title"]')?.textContent || '');
        mv.querySelectorAll('[class*="ingredient"]').forEach(el => { const t = el.textContent.trim(); if (t && t.length < 200) ings.push(parseIng(t)); });
        mv.querySelectorAll('[class*="instruction"] p, [class*="instruction"] li').forEach(el => steps.push(el.textContent.trim()));
      }
    }
    // Generic itemprop / class fallback
    if (!ings.length) {
      document.querySelectorAll('[itemprop="recipeIngredient"], [class*="ingredient-item"], [class*="recipe-ingredient"]').forEach(el => {
        const t = el.textContent.trim();
        if (t && t.length < 200 && t.length > 2) ings.push(parseIng(t));
      });
      document.querySelectorAll('[itemprop="recipeInstructions"] p, [itemprop="recipeInstructions"] li, [class*="instruction"] li, [class*="direction"] li').forEach(el => {
        const t = el.textContent.trim();
        if (t && t.length > 20) steps.push(t);
      });
    }
    if (!name) name = (document.querySelector('h1')?.textContent || document.title).trim();
    return { name, servings, ings, steps: steps.filter(Boolean) };
  }

  // ── Extract ─────────────────────────────────────────────────────────────────
  let recipe = null;
  for (const s of document.querySelectorAll('script[type="application/ld+json"]')) {
    try {
      let d = JSON.parse(s.textContent);
      if (d['@graph']) d = d['@graph'].find(n => [].concat(n['@type']).includes('Recipe'));
      if (Array.isArray(d)) d = d.find(n => [].concat(n['@type']).includes('Recipe'));
      if (d && [].concat(d['@type']).includes('Recipe')) { recipe = fromSchema(d); break; }
    } catch {}
  }
  if (!recipe || !recipe.ings.length) recipe = fromDOM();
  if (!recipe) recipe = { name: document.title, servings: null, ings: [], steps: [] };

  let srv = recipe.servings || 4;
  const origSrv = recipe.servings || 4;
  let doConvert = true;

  function renderIngs() {
    const sc = srv / origSrv, items = recipe.ings || [];
    if (!items.length) return '<li style="color:#999;padding:.6rem .9rem;font-size:.85rem">No ingredients detected — this site may use JavaScript rendering</li>';
    return items.map(ing => {
      const { amt, name } = cvt(ing, sc, doConvert);
      return `<li><span class="r_nm">${esc(name)}</span>${amt ? `<span class="r_am">${esc(amt)}</span>` : ''}</li>`;
    }).join('');
  }

  // ── Styles ──────────────────────────────────────────────────────────────────
  const css = `
#_rcv{all:initial;position:fixed;inset:0;z-index:2147483647;background:rgba(0,0,0,.52);display:flex;align-items:flex-start;justify-content:center;padding:1.5rem 1rem;overflow-y:auto;font-family:system-ui,-apple-system,sans-serif}
#_rcv_c{background:#fff;border-radius:14px;max-width:820px;width:100%;margin:auto;padding:1.5rem 1.75rem;position:relative;box-shadow:0 12px 48px rgba(0,0,0,.35)}
#_rcv_c *{box-sizing:border-box;font-family:system-ui,-apple-system,sans-serif;margin:0;padding:0}
#_rcv_c h1{font-size:1.35rem;font-weight:700;letter-spacing:-.02em;margin:0 3rem .2rem 0;color:#1a1916;line-height:1.3}
#_rcv_x{position:absolute;top:.9rem;right:.9rem;background:#f5f5f4;border:1px solid #e5e2dd;border-radius:7px;cursor:pointer;font-size:.82rem;padding:.32rem .7rem;color:#555;line-height:1.4}
#_rcv_x:hover{background:#e5e2dd}
#_rcv_src{font-size:.72rem;color:#bbb;margin-bottom:.9rem;display:block}
#_rcv_src a{color:#c0735a;text-decoration:none}
#_rcv_a{display:flex;align-items:center;flex-wrap:wrap;gap:.55rem;background:#faf9f7;border:1px solid #e5e2dd;border-radius:9px;padding:.6rem .85rem;margin-bottom:1.1rem}
.rv_l{font-size:.78rem;color:#777}
.rv_sb{width:26px;height:26px;border:1px solid #e5e2dd;border-radius:6px;background:#fff;cursor:pointer;font-size:1.1rem;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;line-height:1;color:#333}
.rv_sb:hover{background:#e5e2dd}
#_rcv_sv{width:46px;text-align:center;border:1px solid #e5e2dd;border-radius:6px;font-size:.9rem;font-weight:600;padding:.25rem;background:#fff;color:#1a1916}
.rv_sp{flex:1}
.rv_tl{display:flex;align-items:center;gap:.4rem;font-size:.78rem;color:#777;cursor:pointer;user-select:none}
.rv_ts{display:inline-block;width:32px;height:17px;background:#d5d1cc;border-radius:17px;position:relative;transition:background .18s;flex-shrink:0}
.rv_ts::before{content:"";position:absolute;width:11px;height:11px;left:3px;top:3px;background:#fff;border-radius:50%;transition:transform .18s}
.rv_on{background:#c0735a !important}.rv_on::before{transform:translateX(15px)}
#_rcv_b{display:grid;grid-template-columns:260px 1fr;gap:1.5rem;align-items:start}
@media(max-width:600px){#_rcv_b{grid-template-columns:1fr}}
.rv_sh{font-size:.7rem;font-weight:600;text-transform:uppercase;letter-spacing:.06em;color:#999;margin-bottom:.5rem;display:block}
#_rcv_il{list-style:none;background:#faf9f7;border:1px solid #e5e2dd;border-radius:9px;overflow:hidden;padding:0;margin:0}
#_rcv_il li{display:flex;justify-content:space-between;align-items:baseline;padding:.52rem .9rem;border-bottom:1px solid #e5e2dd;font-size:.875rem;gap:.5rem;color:#1a1916}
#_rcv_il li:last-child{border-bottom:none}
.r_nm{flex:1}.r_am{font-weight:600;color:#c0735a;white-space:nowrap;font-size:.82rem}
.rv_sl{list-style:none;padding:0;margin:0}
.rv_sl li{display:flex;gap:.75rem;padding:.6rem 0;border-bottom:1px solid #e5e2dd;font-size:.875rem;line-height:1.65;color:#1a1916;align-items:flex-start}
.rv_sl li:last-child{border-bottom:none}
.rv_sn{min-width:26px;height:26px;border-radius:50%;background:#f5ede9;color:#c0735a;font-size:.72rem;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:.1rem}`;

  const st = document.createElement('style');
  st.id = STID; st.textContent = css;
  document.head.appendChild(st);

  // ── Build overlay ───────────────────────────────────────────────────────────
  const stepsHtml = (recipe.steps || []).map((s, i) =>
    `<li><div class="rv_sn">${i + 1}</div><span>${esc(s)}</span></li>`
  ).join('') || '<li style="color:#999;font-size:.85rem;padding:.3rem 0">No instructions detected</li>';

  const ol = document.createElement('div');
  ol.id = ID;
  ol.innerHTML = `<div id="_rcv_c">
    <button id="_rcv_x">✕ Close</button>
    <h1>${esc(recipe.name)}</h1>
    <span id="_rcv_src"><a href="${esc(location.href)}" target="_blank">← View original page</a></span>
    <div id="_rcv_a">
      <span class="rv_l">Servings</span>
      <button class="rv_sb" id="_rv_dn">−</button>
      <input id="_rcv_sv" type="number" min="1" value="${srv}">
      <button class="rv_sb" id="_rv_up">+</button>
      <span class="rv_sp"></span>
      <label class="rv_tl">
        <span class="rv_ts ${doConvert ? 'rv_on' : ''}" id="_rv_ts"></span>
        Convert to weights
      </label>
    </div>
    <div id="_rcv_b">
      <div>
        <span class="rv_sh">Ingredients</span>
        <ul id="_rcv_il">${renderIngs()}</ul>
      </div>
      <div>
        <span class="rv_sh">Instructions</span>
        <ol class="rv_sl">${stepsHtml}</ol>
      </div>
    </div>
  </div>`;
  document.body.appendChild(ol);

  const refresh = () => { document.getElementById('_rcv_il').innerHTML = renderIngs(); };

  document.getElementById('_rcv_x').onclick = () => { ol.remove(); st.remove(); };
  ol.addEventListener('click', e => { if (e.target === ol) { ol.remove(); st.remove(); } });
  document.getElementById('_rv_dn').onclick = () => { if (srv > 1) { srv--; document.getElementById('_rcv_sv').value = srv; refresh(); } };
  document.getElementById('_rv_up').onclick = () => { srv++; document.getElementById('_rcv_sv').value = srv; refresh(); };
  document.getElementById('_rcv_sv').addEventListener('change', e => { const v = parseInt(e.target.value); if (v > 0) { srv = v; refresh(); } });
  document.getElementById('_rv_ts').addEventListener('click', function () { doConvert = !doConvert; this.classList.toggle('rv_on', doConvert); refresh(); });
  document.addEventListener('keydown', function k(e) { if (e.key === 'Escape') { ol.remove(); st.remove(); document.removeEventListener('keydown', k); } });
})();
