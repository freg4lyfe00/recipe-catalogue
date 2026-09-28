// Path to your recipe catalogue — update this if you move recipes.html
const CATALOGUE_URL = 'https://recipe-catalogue-lyart.vercel.app';

// ── Self-contained extraction function injected into the recipe page ──────────
// Must not reference any variables outside itself.
function extractRecipeFromPage() {
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
    'cup':236.588,'cups':236.588,'tbsp':14.787,'tbs':14.787,'tablespoon':14.787,'tablespoons':14.787,
    'tsp':4.929,'teaspoon':4.929,'teaspoons':4.929,
    'fl oz':29.574,'fluid oz':29.574,'fluid ounce':29.574,'fluid ounces':29.574,
    'pint':473.176,'pints':473.176,'pt':473.176,'quart':946.353,'quarts':946.353,
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

  function frac(s) {
    s = (s||'').trim();
    let m = s.match(/^(\d+)\s+(\d+)\/(\d+)$/); if (m) return +m[1] + +m[2] / +m[3];
    m = s.match(/^(\d+)\/(\d+)$/); if (m) return +m[1] / +m[2];
    const n = parseFloat(s); return isNaN(n) ? null : n;
  }
  function parseIng(s) {
    s = (s||'').replace(/(\d)½/g,'$1 1/2').replace(/½/g,'1/2').replace(/(\d)¼/g,'$1 1/4').replace(/¼/g,'1/4').replace(/(\d)¾/g,'$1 3/4').replace(/¾/g,'3/4')
      .replace(/(\d)⅓/g,'$1 1/3').replace(/⅓/g,'1/3').replace(/(\d)⅔/g,'$1 2/3').replace(/⅔/g,'2/3').replace(/(\d)⅛/g,'$1 1/8').replace(/⅛/g,'1/8').trim();
    let qty = null, unit = '', name = s;
    const qm = s.match(/^((?:\d+\s+)?\d+\/\d+|\d+(?:\.\d+)?)/);
    if (qm) { qty = frac(qm[1]); name = s.slice(qm[1].length).trim(); }
    for (const u of UL) {
      const re = new RegExp('^' + u.replace(/[.*+?^${}()|[\]\\]/g,'\\$&') + 's?\\.?(?!\\w)\\s*', 'i');
      if (re.test(name)) { unit = u.toLowerCase(); name = name.replace(re,'').trim(); break; }
    }
    return { qty, unit, name: name.replace(/^[,;]\s*/,'') };
  }
  function clean(s) { return (s||'').replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim(); }

  function fromSchema(d) {
    const ings = (d.recipeIngredient||[]).map(s => parseIng(clean(s)));
    const steps = [];
    let raw = d.recipeInstructions || []; if (!Array.isArray(raw)) raw = [raw];
    for (const item of raw) {
      if (typeof item === 'string') steps.push(clean(item));
      else if (item['@type'] === 'HowToStep') steps.push(clean(item.text||item.name));
      else if (item['@type'] === 'HowToSection')
        for (const st of (item.itemListElement||[])) steps.push(clean(st.text||st.name||st));
    }
    const yld = d.recipeYield, srv = yld ? parseInt(Array.isArray(yld)?yld[0]:yld) : NaN;
    return {
      name: clean(d.name),
      servings: isNaN(srv) ? null : srv,
      category: clean(d.recipeCategory||d.recipeCuisine||''),
      notes: clean(d.description||''),
      image: pickImage(d.image), ings, steps: steps.filter(Boolean),
    };
  }

  function pickImage(schemaImg) {
    if (schemaImg) {
      const c = Array.isArray(schemaImg) ? schemaImg[0] : schemaImg;
      const u = typeof c === 'string' ? c : (c?.url || '');
      if (u) return u;
    }
    // og:image meta
    const og = document.querySelector('meta[property="og:image"]')?.content || '';
    if (og) return og;
    // twitter:image
    const tw = document.querySelector('meta[name="twitter:image"]')?.content || '';
    if (tw) return tw;
    // Common recipe plugin image selectors
    const sels = [
      '.wprm-recipe-image img', '.tasty-recipe-image img', '.tasty-recipes-image img',
      '[class*="recipe-hero"] img', '[class*="recipe-image"] img',
      '[class*="featured-image"] img', 'article img',
    ];
    for (const sel of sels) {
      const el = document.querySelector(sel);
      if (el) {
        const src = el.src || el.dataset.src || el.dataset.lazySrc || '';
        if (src && !src.startsWith('data:') && src.length > 10) return src;
      }
    }
    return '';
  }

  function fromDOM() {
    let name='', servings=null, ings=[], steps=[];
    const wprm = document.querySelector('.wprm-recipe');
    if (wprm) {
      name = clean(wprm.querySelector('.wprm-recipe-name')?.textContent||'');
      servings = parseInt(wprm.querySelector('.wprm-recipe-servings')?.textContent)||null;
      wprm.querySelectorAll('.wprm-recipe-ingredient').forEach(el => {
        const q = el.querySelector('.wprm-recipe-ingredient-amount')?.textContent.trim()||'';
        const u = el.querySelector('.wprm-recipe-ingredient-unit')?.textContent.trim()||'';
        const n = el.querySelector('.wprm-recipe-ingredient-name')?.textContent.trim()||'';
        if (n) ings.push({ qty: q?frac(q):null, unit: u.toLowerCase(), name: n });
      });
      wprm.querySelectorAll('.wprm-recipe-instruction-text').forEach(el => steps.push(el.textContent.trim()));
    }
    if (!ings.length) {
      const tr = document.querySelector('.tasty-recipe,.tasty-recipes');
      if (tr) {
        name = name||clean(tr.querySelector('.tasty-recipes-title,.tasty-recipe-title')?.textContent||'');
        tr.querySelectorAll('.tasty-recipes-ingredients li,.tasty-recipe-ingredients li').forEach(el => ings.push(parseIng(el.textContent.trim())));
        tr.querySelectorAll('.tasty-recipes-instructions li,.tasty-recipes-instructions p,.tasty-recipe-instructions li,.tasty-recipe-instructions p').forEach(el => steps.push(el.textContent.trim()));
      }
    }
    if (!ings.length) {
      const mv = document.querySelector('[class*="mv-create"]');
      if (mv) {
        name = name||clean(mv.querySelector('[class*="mv-create-title"]')?.textContent||'');
        mv.querySelectorAll('[class*="ingredient"]').forEach(el => { const t=el.textContent.trim(); if(t&&t.length<200) ings.push(parseIng(t)); });
        mv.querySelectorAll('[class*="instruction"] p,[class*="instruction"] li').forEach(el => steps.push(el.textContent.trim()));
      }
    }
    if (!ings.length) {
      document.querySelectorAll('[itemprop="recipeIngredient"],[class*="ingredient-item"],[class*="recipe-ingredient"]').forEach(el => {
        const t=el.textContent.trim(); if(t&&t.length<200&&t.length>2) ings.push(parseIng(t));
      });
      document.querySelectorAll('[itemprop="recipeInstructions"] p,[itemprop="recipeInstructions"] li,[class*="instruction"] li,[class*="direction"] li').forEach(el => {
        const t=el.textContent.trim(); if(t&&t.length>20) steps.push(t);
      });
    }
    if (!name) name = (document.querySelector('h1')?.textContent||document.title).trim();
    return { name, servings, category:'', notes:'', image: pickImage(null), ings, steps: steps.filter(Boolean) };
  }

  // Run extraction
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

  return {
    name: (recipe && recipe.name) || document.title,
    servings: recipe && recipe.servings,
    category: (recipe && recipe.category) || '',
    notes: (recipe && recipe.notes) || '',
    image: (recipe && recipe.image) || '',
    source: location.href,
    ingredients: (recipe && recipe.ings) || [],
    instructions: (recipe && recipe.steps) || [],
  };
}

// ── UI helpers ────────────────────────────────────────────────────────────────
function setLoading(id, loading) {
  const btn = document.getElementById(id);
  btn.disabled = loading;
  if (id === 'go')   btn.textContent = loading ? 'Loading…' : 'View Recipe';
  if (id === 'save') btn.textContent = loading ? 'Saving…'  : 'Save to Catalogue';
}
function showErr(msg) {
  const el = document.getElementById('err');
  el.textContent = msg;
  el.style.display = 'block';
}
function clearErr() {
  document.getElementById('err').style.display = 'none';
}
async function getTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab) throw new Error('No active tab found.');
  if (tab.url.startsWith('chrome://') || tab.url.startsWith('about:') || tab.url.startsWith('chrome-extension://')) {
    throw new Error('Navigate to a recipe website first.');
  }
  return tab;
}

// ── View Recipe ───────────────────────────────────────────────────────────────
document.getElementById('go').addEventListener('click', async () => {
  clearErr();
  setLoading('go', true);
  try {
    const tab = await getTab();
    await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ['content.js'] });
    window.close();
  } catch (e) {
    showErr(e.message);
    setLoading('go', false);
  }
});

// ── Save to Catalogue ─────────────────────────────────────────────────────────
document.getElementById('save').addEventListener('click', async () => {
  clearErr();
  setLoading('save', true);
  try {
    const tab = await getTab();
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: extractRecipeFromPage,
    });
    const recipe = results[0]?.result;
    if (!recipe || !recipe.name) throw new Error('Could not extract a recipe from this page.');

    // Encode recipe as URL-safe base64 and open the catalogue
    const json = JSON.stringify(recipe);
    const encoded = btoa(encodeURIComponent(json).replace(/%([0-9A-F]{2})/gi, (_, c) => String.fromCharCode(parseInt(c, 16))));
    await chrome.tabs.create({ url: CATALOGUE_URL + '#rcv=' + encoded });
    window.close();
  } catch (e) {
    showErr(e.message);
    setLoading('save', false);
  }
});
