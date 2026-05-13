// =================== Bonknate.gg — front-end logic ===================
// Pure vanilla JS. No deps. All state local; wallet flow is mocked so the
// site is fully runnable as static files.

// ---------- Data: featured partner charities ----------
const CHARITIES = [
  { id: 'st-jude',    name: "St. Jude Children's Research Hospital", tag: 'Kids · Health',  initials: 'SJ', wallet: 'StJudeF1xCh4r1tyWa11et4Bonknate1111111111' },
  { id: 'water-org',  name: 'Water.org',                              tag: 'Clean water',    initials: 'WO', wallet: 'WaTeR0rgF1xCh4r1tyWa11et4Bonknate11111' },
  { id: 'team-trees', name: 'Team Trees',                             tag: 'Reforestation',  initials: 'TT', wallet: 'TeamTreesF1xCh4r1tyWa11et4Bonknate1111' },
  { id: 'doctors',    name: 'Doctors Without Borders',                tag: 'Humanitarian',   initials: 'DWB',wallet: 'D0ct0rsF1xCh4r1tyWa11et4Bonknate111111' },
  { id: 'givedirect', name: 'GiveDirectly',                           tag: 'Cash transfers', initials: 'GD', wallet: 'G1veD1rectF1xCh4r1tyWa11et4Bonknate11' },
  { id: 'rainforest', name: 'Rainforest Foundation',                  tag: 'Environment',    initials: 'RF', wallet: 'Ra1nF0restF1xCh4r1tyWa11et4Bonknate1' },
];

// ---------- Helpers ----------
const $  = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => Array.from(root.querySelectorAll(s));

const fmt = (n) => n.toLocaleString('en-US');

function toast(msg, ms = 3500){
  const el = $('#toast'); if (!el) return;
  el.textContent = msg; el.hidden = false;
  clearTimeout(toast._t);
  toast._t = setTimeout(() => { el.hidden = true; }, ms);
}

// ---------- Animated counters ----------
function animateCounters(){
  const els = $$('.count');
  const io = new IntersectionObserver((entries) => {
    entries.forEach((ent) => {
      if (!ent.isIntersecting) return;
      const el = ent.target;
      io.unobserve(el);
      const target = Number(el.dataset.target || 0);
      if (target === 0){ el.textContent = '0'; return; }
      const dur = 1100, start = performance.now();
      const tick = (t) => {
        const p = Math.min(1, (t - start) / dur);
        const ease = 1 - Math.pow(1 - p, 3);
        el.textContent = fmt(Math.round(target * ease));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }, { threshold: 0.3 });
  els.forEach((e) => io.observe(e));
}

// ---------- Render charity cards on homepage ----------
function renderCharityGrid(){
  const grid = $('#charity-grid'); if (!grid) return;
  grid.innerHTML = CHARITIES.map((c) => `
    <article class="card" data-id="${c.id}">
      <div class="card-thumb">${c.initials}</div>
      <div class="card-body">
        <h3>${c.name}</h3>
        <div class="card-meta">
          <span>${c.tag}</span>
          <span class="tag">Eligible</span>
        </div>
        <p class="muted" style="margin:.7rem 0 0;font-size:.9rem">Receives fees in $BONK from creator tokens routed here.</p>
      </div>
    </article>
  `).join('');
}

// ---------- Render charity radio list inside modal ----------
function renderCharityPicker(){
  const pick = $('#charity-pick'); if (!pick) return;
  pick.innerHTML = CHARITIES.map((c, i) => `
    <label>
      <input type="radio" name="charity" value="${c.id}" ${i===0?'checked':''} />
      <span>${c.name}</span>
    </label>
  `).join('');
}

// ---------- Modal control ----------
function openModal(id){
  const el = document.getElementById(id); if (!el) return;
  el.hidden = false;
  document.body.style.overflow = 'hidden';
  const first = el.querySelector('input,button,textarea,select'); first?.focus();
}
function closeModal(el){
  el.hidden = true;
  document.body.style.overflow = '';
}
function wireModals(){
  document.addEventListener('click', (e) => {
    const t = e.target;
    if (t.matches('[data-close]')){
      const modal = t.closest('.modal'); if (modal) closeModal(modal);
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape'){
      $$('.modal:not([hidden])').forEach(closeModal);
    }
  });
}

// ---------- Wallet (mock) ----------
const wallet = {
  connected: false, name: null, address: null,
  short(){ return this.address ? `${this.address.slice(0,4)}…${this.address.slice(-4)}` : ''; },
};

function refreshWalletUI(){
  const btn = $('#connect-wallet');
  if (!btn) return;
  if (wallet.connected){
    btn.innerHTML = `${wallet.name} · ${wallet.short()}`;
    btn.title = wallet.address;
  } else {
    btn.textContent = 'Connect Wallet';
    btn.title = '';
  }
}

function mockAddress(){
  const alphabet = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  let s = ''; for (let i=0;i<44;i++) s += alphabet[Math.floor(Math.random()*alphabet.length)];
  return s;
}

function connectWalletFlow(){
  if (wallet.connected){
    if (confirm(`Disconnect ${wallet.name}?`)){
      wallet.connected = false; wallet.name = null; wallet.address = null;
      refreshWalletUI(); toast('Wallet disconnected.');
    }
    return;
  }
  openModal('wallet-modal');
}

function wireWallet(){
  $('#connect-wallet')?.addEventListener('click', connectWalletFlow);
  $('#cta-connect')?.addEventListener('click', connectWalletFlow);
  $$('.wallet-opt').forEach((b) => b.addEventListener('click', () => {
    wallet.connected = true;
    wallet.name = b.dataset.wallet;
    wallet.address = mockAddress();
    refreshWalletUI();
    closeModal($('#wallet-modal'));
    toast(`Connected to ${wallet.name}.`);
  }));
}

// ---------- Launch token modal ----------
function wireLaunch(){
  const openBtns = ['#open-launch', '#hero-launch', '#cta-launch', '#cta-launch-2'];
  openBtns.forEach((sel) => $(sel)?.addEventListener('click', () => openModal('launch-modal')));

  // Fee slider value
  const fee = $('#token-fee'), feeVal = $('#fee-val');
  fee?.addEventListener('input', () => { feeVal.textContent = Number(fee.value).toFixed(1); });

  // Ticker uppercase
  $('#token-ticker')?.addEventListener('input', (e) => {
    e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
  });

  // Image upload
  const drop = $('#upload'), input = $('#token-image'), inner = $('#upload-inner'), preview = $('#upload-preview');
  if (drop){
    drop.addEventListener('click', () => input.click());
    drop.addEventListener('dragover', (e) => { e.preventDefault(); drop.classList.add('drag'); });
    drop.addEventListener('dragleave', () => drop.classList.remove('drag'));
    drop.addEventListener('drop', (e) => {
      e.preventDefault(); drop.classList.remove('drag');
      const f = e.dataTransfer.files?.[0]; if (f) handleImage(f);
    });
    input.addEventListener('change', () => {
      const f = input.files?.[0]; if (f) handleImage(f);
    });
  }
  function handleImage(file){
    if (!file.type.startsWith('image/')) { toast('Please choose an image file.'); return; }
    if (file.size > 4 * 1024 * 1024) { toast('Image must be under 4 MB.'); return; }
    const reader = new FileReader();
    reader.onload = () => {
      preview.src = reader.result;
      preview.hidden = false;
      inner.hidden = true;
    };
    reader.readAsDataURL(file);
  }

  // Submit (mock deploy)
  $('#launch-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = $('#token-name').value.trim();
    const ticker = $('#token-ticker').value.trim();
    const supply = Number($('#token-supply').value);
    const feeP = Number($('#token-fee').value);
    const charityId = $('input[name="charity"]:checked')?.value;
    const custom = $('#custom-charity').value.trim();
    const charity = CHARITIES.find((c) => c.id === charityId);
    const charityName = custom ? `custom wallet (${custom.slice(0,4)}…${custom.slice(-4)})` : charity?.name;

    if (!name || !ticker){ toast('Name and ticker are required.'); return; }
    if (!supply || supply < 1000){ toast('Supply must be at least 1,000.'); return; }
    if (!preview.src){ toast('Please upload a token image.'); return; }
    if (!wallet.connected){
      closeModal($('#launch-modal'));
      toast('Connect a wallet first to deploy.');
      setTimeout(() => openModal('wallet-modal'), 250);
      return;
    }

    // Mock deploy
    closeModal($('#launch-modal'));
    toast(`$${ticker} (${name}) deploying · ${feeP.toFixed(1)}% fees → ${charityName}`);
    console.log('[bonknate] launch payload', { name, ticker, supply, feeP, charityId: custom || charityId, by: wallet.address });
  });
}

// ---------- Mobile hamburger (simple toggle) ----------
function wireHamburger(){
  const h = $('#hamburger'), nav = $('.primary-nav');
  h?.addEventListener('click', () => {
    if (!nav) return;
    const visible = nav.style.display === 'flex';
    nav.style.display = visible ? '' : 'flex';
    nav.style.position = visible ? '' : 'absolute';
    nav.style.top = visible ? '' : '60px';
    nav.style.left = visible ? '' : '0';
    nav.style.right = visible ? '' : '0';
    nav.style.flexDirection = visible ? '' : 'column';
    nav.style.background = visible ? '' : 'var(--paper)';
    nav.style.padding = visible ? '' : '1rem 24px';
    nav.style.borderBottom = visible ? '' : '1px solid var(--line)';
  });
}

// ---------- Init ----------
document.addEventListener('DOMContentLoaded', () => {
  renderCharityGrid();
  renderCharityPicker();
  animateCounters();
  wireModals();
  wireWallet();
  wireLaunch();
  wireHamburger();
});
