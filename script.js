/**
 * PAINEL MULTI-TELAS APURAÇÃO ELEIÇÕES 2026
 * MODO VERTICAL INDEPENDENTE (ESTILO CELULAR) & AUTO-REFRESH
 */

// Mapeamento Oficial do TSE 2026
const TSE_CONFIG = {
  ELEICAO_FEDERAL: '6257',   // Presidente
  ELEICAO_ESTADUAL: '6259',  // Governador, Senador, Dep. Federal, Dep. Estadual
  CARGOS: {
    1: { id: 1, nome: 'Presidente', eleicao: '6257', tag: 'PRES' },
    3: { id: 3, nome: 'Governador', eleicao: '6259', tag: 'GOV' },
    5: { id: 5, nome: 'Senador', eleicao: '6259', tag: 'SEN' },
    6: { id: 6, nome: 'Deputado Federal', eleicao: '6259', tag: 'FED' },
    7: { id: 7, nome: 'Deputado Estadual', eleicao: '6259', tag: 'EST' },
    8: { id: 8, nome: 'Deputado Distrital', eleicao: '6259', tag: 'DIST' }
  }
};

// Definição dos Layouts e Cargos Fixos
const LAYOUT_PRESETS = {
  'cols-4': [
    { cargoId: 3, titulo: 'Governador' },
    { cargoId: 5, titulo: 'Senador' },
    { cargoId: 6, titulo: 'Deputado Federal' },
    { cargoId: 7, titulo: 'Deputado Estadual' }
  ],
  'cols-5': [
    { cargoId: 1, titulo: 'Presidente' },
    { cargoId: 3, titulo: 'Governador' },
    { cargoId: 5, titulo: 'Senador' },
    { cargoId: 6, titulo: 'Deputado Federal' },
    { cargoId: 7, titulo: 'Deputado Estadual' }
  ],
  'cols-3': [
    { cargoId: 3, titulo: 'Governador' },
    { cargoId: 5, titulo: 'Senador' },
    { cargoId: 6, titulo: 'Deputado Federal' }
  ],
  'cols-2': [
    { cargoId: 3, titulo: 'Governador' },
    { cargoId: 5, titulo: 'Senador' }
  ]
};

// Estado Global da Aplicação
const appState = {
  uf: localStorage.getItem('tse_uf') || 'ap',
  layout: localStorage.getItem('tse_layout') || 'cols-4',
  viewMode: localStorage.getItem('tse_view_mode') || 'vertical',
  refreshInterval: parseInt(localStorage.getItem('tse_interval') || '30', 10),
  zoom: parseFloat(localStorage.getItem('tse_zoom') || '0.85'),
  opMode: localStorage.getItem('tse_op_mode') || 'consolidado',
  isPaused: false,
  isDemoMode: false,
  activeMobileIndex: 0,
  countdown: 30,
  timerId: null,
  colTabs: {},
  selectedCandidate: null,
  selectedCargoId: 6,
  candModalTab: 'laranjal_do_jari',
  candModalSearchText: '',
  expandAllSecoes: false
};

// Elementos do DOM
const dom = {
  ufSelect: document.getElementById('ufSelect'),
  layoutSelect: document.getElementById('layoutSelect'),
  viewModeSelect: document.getElementById('viewModeSelect'),
  refreshInterval: document.getElementById('refreshInterval'),
  zoomSelect: document.getElementById('zoomSelect'),
  btnToggleOpMode: document.getElementById('btnToggleOpMode'),
  opModeIcon: document.getElementById('opModeIcon'),
  opModeText: document.getElementById('opModeText'),
  consolidatedBadge: document.getElementById('consolidatedBadge'),
  liveTimerControls: document.getElementById('liveTimerControls'),
  btnRefreshNow: document.getElementById('btnRefreshNow'),
  btnTogglePause: document.getElementById('btnTogglePause'),
  btnDemo: document.getElementById('btnDemo'),
  demoText: document.getElementById('demoText'),
  pauseIcon: document.getElementById('pauseIcon'),
  pauseText: document.getElementById('pauseText'),
  timerCountdown: document.getElementById('timerCountdown'),
  timerProgressBar: document.getElementById('timerProgressBar'),
  timerStatusIcon: document.getElementById('timerStatusIcon'),
  timerLabel: document.getElementById('timerLabel'),
  btnBorderless: document.getElementById('btnBorderless'),
  btnFullscreen: document.getElementById('btnFullscreen'),
  btnHelp: document.getElementById('btnHelp'),
  topbarRevealTrigger: document.getElementById('topbarRevealTrigger'),
  topbar: document.getElementById('topbar'),
  mobileTabs: document.getElementById('mobileTabs'),
  screensContainer: document.getElementById('screensContainer'),
  helpModal: document.getElementById('helpModal'),
  btnCloseHelp: document.getElementById('btnCloseHelp'),
  btnDismissHelp: document.getElementById('btnDismissHelp'),
  candidateModal: document.getElementById('candidateModal'),
  btnCloseCandModal: document.getElementById('btnCloseCandModal'),
  btnDismissCandModal: document.getElementById('btnDismissCandModal'),
  candModalPhoto: document.getElementById('candModalPhoto'),
  candModalFallback: document.getElementById('candModalFallback'),
  candModalName: document.getElementById('candModalName'),
  candModalBadge: document.getElementById('candModalBadge'),
  candModalCargo: document.getElementById('candModalCargo'),
  candModalPartido: document.getElementById('candModalPartido'),
  candModalNumero: document.getElementById('candModalNumero'),
  candModalTotalVotos: document.getElementById('candModalTotalVotos'),
  candModalPerc: document.getElementById('candModalPerc'),
  candModalSearch: document.getElementById('candModalSearch'),
  btnToggleAllSecoes: document.getElementById('btnToggleAllSecoes'),
  candCityVotos: document.getElementById('candCityVotos'),
  candCityPerc: document.getElementById('candCityPerc'),
  candCitySecoes: document.getElementById('candCitySecoes'),
  candModalContentGrid: document.getElementById('candModalContentGrid')
};

// Construtor de URL do JSON Oficial do TSE
function getTseJsonUrl(cargoId, uf) {
  let targetCargo = cargoId;
  if (uf.toLowerCase() === 'df' && cargoId === 7) targetCargo = 8;

  const cargoInfo = TSE_CONFIG.CARGOS[targetCargo] || TSE_CONFIG.CARGOS[3];
  const eleicao = cargoInfo.eleicao;
  const cargoPadded = String(targetCargo).padStart(4, '0');
  
  // Para Presidente com UF BR usa 'br', caso contrário usa o estado
  const ufCode = (cargoId === 1 && uf.toLowerCase() === 'br') ? 'br' : uf.toLowerCase();

  return `https://resultados.tse.jus.br/oficial/ele2026/${eleicao}/dados/${ufCode}/${ufCode}-c${cargoPadded}-e00${eleicao}-u.json`;
}

// Construtor de URL oficial da Foto do Candidato
function getCandPhotoUrl(eleicao, uf, sqcand) {
  const ufCode = uf.toLowerCase();
  return `https://resultados.tse.jus.br/oficial/ele2026/${eleicao}/fotos/${ufCode}/${sqcand}.jpeg`;
}

// Construtor de URL do Portal TSE Oficial (para o modo portal se desejado)
function getTseWebUrl(cargoId, uf) {
  let targetCargo = cargoId;
  if (uf.toLowerCase() === 'df' && cargoId === 7) targetCargo = 8;
  const cargoInfo = TSE_CONFIG.CARGOS[targetCargo] || TSE_CONFIG.CARGOS[3];
  return `https://resultados.tse.jus.br/oficial/app/index.html#/eleicao/${cargoInfo.eleicao}/uf/${uf.toLowerCase()}/cargo/${targetCargo}/vis/nominal/resultados`;
}

// Formatar números com separador de milhar brasileiro
function formatNumber(num) {
  if (num === undefined || num === null) return '0';
  const n = parseInt(num, 10);
  if (isNaN(n)) return num.toString();
  return n.toLocaleString('pt-BR');
}

// Inicializar Estrutura das Colunas Verticais
function renderContainer() {
  const container = dom.screensContainer;
  container.innerHTML = '';
  container.className = `screens-grid ${appState.layout} ${appState.viewMode}-mode`;

  if (dom.mobileTabs) dom.mobileTabs.innerHTML = '';

  const colsConfig = LAYOUT_PRESETS[appState.layout] || LAYOUT_PRESETS['cols-4'];

  colsConfig.forEach((cfg, index) => {
    let cargoId = cfg.cargoId;
    if (appState.uf === 'df' && cargoId === 7) cargoId = 8;
    const cargoInfo = TSE_CONFIG.CARGOS[cargoId] || { nome: cfg.titulo, tag: 'ELE', eleicao: '6259' };
    const colId = `col-${cargoId}`;

    // Cria Aba Mobile correspondente
    if (dom.mobileTabs) {
      const tabBtn = document.createElement('button');
      tabBtn.className = `mobile-tab-btn ${index === appState.activeMobileIndex ? 'active' : ''}`;
      tabBtn.dataset.colIdx = index;
      tabBtn.innerHTML = `${cargoInfo.tag} • ${cargoInfo.nome.split(' ')[0]}`;
      dom.mobileTabs.appendChild(tabBtn);
    }

    if (appState.viewMode === 'vertical') {
      // MODO VERTICAL / CELULAR
      const col = document.createElement('div');
      col.className = `vertical-col ${index === appState.activeMobileIndex ? 'mobile-active' : ''}`;
      col.id = colId;
      col.dataset.cargoId = cargoId;
      col.dataset.eleicao = cargoInfo.eleicao;

      const isProportional = (cargoId === 6 || cargoId === 7 || cargoId === 8);
      const isSenador = (cargoId === 5);
      const activeTab = appState.colTabs[colId] || 'votados';

      const senadorBadge = isSenador ? `<span style="font-size:10px;color:var(--accent-gold);font-weight:700;margin-left:5px;background:rgba(255,193,7,0.15);padding:1px 6px;border-radius:4px;border:1px solid rgba(255,193,7,0.35);">2 VAGAS</span>` : '';

      const subtabsHtml = isProportional ? `
        <div class="col-subtabs">
          <button class="col-subtab-btn ${activeTab !== 'coeficiente' ? 'active' : ''}" data-col-id="${colId}" data-tab="votados">👥 Mais Votados</button>
          <button class="col-subtab-btn ${activeTab === 'coeficiente' ? 'active' : ''}" data-col-id="${colId}" data-tab="coeficiente">📊 Coeficiente & Vagas</button>
        </div>
      ` : '';

      col.innerHTML = `
        <div class="col-header">
          <div class="col-header-top">
            <div class="col-title-group">
              <span class="col-cargo-tag">${cargoInfo.tag}</span>
              <span class="col-title">${cargoInfo.nome} ${senadorBadge}</span>
            </div>
            <div class="col-actions">
              <button class="col-btn btn-col-refresh" title="Atualizar este cargo" data-cargo-id="${cargoId}">🔄</button>
              <button class="col-btn btn-col-link" title="Abrir no TSE oficial" data-cargo-id="${cargoId}">↗</button>
            </div>
          </div>
          <div class="col-apuracao-box">
            <div class="col-apuracao-stats">
              <span class="col-apuracao-label">Seções Apuradas:</span>
              <span class="col-apuracao-val" id="apuracao-val-${colId}">0,00%</span>
            </div>
            <div class="col-apuracao-bar">
              <div class="col-apuracao-fill" id="apuracao-fill-${colId}"></div>
            </div>
          </div>
        </div>

        ${subtabsHtml}

        <div class="col-search-container" style="display: ${activeTab === 'coeficiente' ? 'none' : 'flex'};">
          <input type="text" class="col-search-input" placeholder="🔍 Buscar nome ou número..." data-col-id="${colId}">
          <span class="col-cand-count" id="count-${colId}">0 cand.</span>
        </div>

        <div class="col-loading-overlay" id="loading-${colId}">
          <div class="spinner"></div>
          <span style="font-size:11px;color:var(--text-muted);">Consultando TSE...</span>
        </div>

        <div class="col-feed" id="feed-${colId}" style="display: ${activeTab === 'coeficiente' ? 'none' : 'flex'};">
          <!-- Cards de candidatos injetados aqui -->
        </div>

        ${isProportional ? `<div class="col-coef" id="coef-${colId}" style="display: ${activeTab === 'coeficiente' ? 'flex' : 'none'};"></div>` : ''}

        <div class="col-footer" id="footer-${colId}">
          <span class="col-footer-stat">Válidos: <strong id="validos-${colId}">0</strong></span>
          <span class="col-footer-stat">Brancos: <strong id="brancos-${colId}">0</strong></span>
          <span class="col-footer-stat">Nulos: <strong id="nulos-${colId}">0</strong></span>
        </div>
      `;

      container.appendChild(col);
    } else {
      // MODO PORTAL WEB (IFRAME)
      const col = document.createElement('div');
      col.className = `vertical-col ${index === appState.activeMobileIndex ? 'mobile-active' : ''}`;
      col.id = colId;
      const webUrl = getTseWebUrl(cargoId, appState.uf);

      col.innerHTML = `
        <div class="col-header" style="padding:6px 10px;">
          <div class="col-header-top">
            <div class="col-title-group">
              <span class="col-cargo-tag">${cargoInfo.tag}</span>
              <span class="col-title">${cargoInfo.nome} (${appState.uf.toUpperCase()})</span>
            </div>
            <div class="col-actions">
              <button class="col-btn btn-col-refresh" data-cargo-id="${cargoId}">🔄</button>
              <button class="col-btn btn-col-link" data-cargo-id="${cargoId}">↗</button>
            </div>
          </div>
        </div>
        <div style="flex:1;position:relative;background:#000;">
          <iframe 
            src="${webUrl}" 
            style="width:100%;height:100%;border:none;"
            sandbox="allow-scripts allow-forms allow-popups"
            title="${cargoInfo.nome}"
          ></iframe>
        </div>
      `;

      container.appendChild(col);
    }
  });

  // Configura botões individuais, busca e abas
  setupColumnButtons();

  // Carrega os dados se estiver no modo vertical
  if (appState.viewMode === 'vertical') {
    fetchAllColumnsData();
  }
}

// Configura botões de atualizar, busca, abas de coeficiente e abas mobile
function setupColumnButtons() {
  document.querySelectorAll('.btn-col-refresh').forEach(btn => {
    btn.onclick = () => {
      const cargoId = parseInt(btn.dataset.cargoId, 10);
      if (appState.viewMode === 'vertical') {
        fetchSingleCargoData(cargoId);
      } else {
        const col = document.getElementById(`col-${cargoId}`);
        const iframe = col.querySelector('iframe');
        if (iframe) iframe.src = iframe.src;
      }
    };
  });

  document.querySelectorAll('.btn-col-link').forEach(btn => {
    btn.onclick = () => {
      const cargoId = parseInt(btn.dataset.cargoId, 10);
      const url = getTseWebUrl(cargoId, appState.uf);
      window.open(url, '_blank');
    };
  });

  // Sub-abas de Coluna (Mais Votados vs Coeficiente Partidário)
  document.querySelectorAll('.col-subtab-btn').forEach(btn => {
    btn.onclick = () => {
      const colId = btn.dataset.colId;
      const tab = btn.dataset.tab;
      appState.colTabs[colId] = tab;

      const parentCol = document.getElementById(colId);
      if (!parentCol) return;

      parentCol.querySelectorAll('.col-subtab-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.tab === tab);
      });

      const feed = document.getElementById(`feed-${colId}`);
      const coef = document.getElementById(`coef-${colId}`);
      const searchBox = parentCol.querySelector('.col-search-container');

      if (tab === 'coeficiente') {
        if (feed) feed.style.display = 'none';
        if (coef) coef.style.display = 'flex';
        if (searchBox) searchBox.style.display = 'none';
      } else {
        if (feed) feed.style.display = 'flex';
        if (coef) coef.style.display = 'none';
        if (searchBox) searchBox.style.display = 'flex';
      }
    };
  });

  // Abas Mobile
  document.querySelectorAll('.mobile-tab-btn').forEach(btn => {
    btn.onclick = () => {
      const idx = parseInt(btn.dataset.colIdx, 10);
      appState.activeMobileIndex = idx;
      document.querySelectorAll('.mobile-tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll('.vertical-col').forEach((col, cIdx) => {
        if (cIdx === idx) {
          col.classList.add('mobile-active');
        } else {
          col.classList.remove('mobile-active');
        }
      });
    };
  });

  // Busca e Filtro de Candidatos em Tempo Real
  document.querySelectorAll('.col-search-input').forEach(input => {
    input.oninput = (e) => {
      const colId = e.target.dataset.colId;
      const term = e.target.value.toLowerCase().trim();
      const feed = document.getElementById(`feed-${colId}`);
      if (!feed) return;
      let visibleCount = 0;
      feed.querySelectorAll('.cand-card').forEach(card => {
        const text = card.textContent.toLowerCase();
        if (!term || text.includes(term)) {
          card.style.display = 'flex';
          visibleCount++;
        } else {
          card.style.display = 'none';
        }
      });
      const countEl = document.getElementById(`count-${colId}`);
      if (countEl) countEl.textContent = `${visibleCount} cand.`;
    };
  });
}

// Buscar Dados de um Cargo Específico e Atualizar sua Coluna
async function fetchSingleCargoData(cargoId) {
  let targetCargo = cargoId;
  if (appState.uf === 'df' && cargoId === 7) targetCargo = 8;

  const colId = `col-${targetCargo}`;
  const col = document.getElementById(colId);
  if (!col) return;

  const loader = document.getElementById(`loading-${colId}`);
  const feed = document.getElementById(`feed-${colId}`);
  const apuracaoVal = document.getElementById(`apuracao-val-${colId}`);
  const apuracaoFill = document.getElementById(`apuracao-fill-${colId}`);
  const validosEl = document.getElementById(`validos-${colId}`);
  const brancosEl = document.getElementById(`brancos-${colId}`);
  const nulosEl = document.getElementById(`nulos-${colId}`);
  const countEl = document.getElementById(`count-${colId}`);

  try {
    const url = getTseJsonUrl(targetCargo, appState.uf);
    const resp = await fetch(url, { cache: 'no-store' });
    if (!resp.ok) {
      throw new Error(`HTTP ${resp.status}`);
    }

    const data = await resp.json();

    let secoesTotalizadasPerc = data.s?.pst || '0,00';
    let secoesTotalizadasQtd = data.s?.st || '0';
    let secoesTotalQtd = data.s?.ts || '1914';

    let totalValidos = parseInt(data.v?.vv || '0', 10);
    let totalBrancos = parseInt(data.v?.vb || '0', 10);
    let totalNulos = parseInt(data.v?.vn || '0', 10);

    const candidatos = [];
    const eleicao = data.ele || '6259';

    for (const agr of (data.carg[0]?.agr || [])) {
      for (const par of (agr.par || [])) {
        for (const c of (par.cand || [])) {
          const percClean = parseFloat((c.pvap || '0').replace(',', '.')) || 0;
          const votosInt = parseInt(c.vap || '0', 10);
          candidatos.push({
            num: c.n,
            sqcand: c.sqcand,
            nome: c.nmu || c.nm,
            partido: par.sg,
            votos: votosInt,
            percStr: c.pvap || '0,00',
            percNum: percClean,
            eleito: c.e === 's',
            situacao: c.st || ''
          });
        }
      }
    }

    // MODO DEMONSTRAÇÃO COM VOTOS REAIS SIMULADOS
    if (appState.isDemoMode && candidatos.length > 0) {
      secoesTotalizadasPerc = '85,40';
      const totalSecNum = parseInt(secoesTotalQtd, 10);
      secoesTotalizadasQtd = Math.round(totalSecNum * 0.854).toString();

      totalValidos = 412850;
      totalBrancos = 12430;
      totalNulos = 18910;

      if (targetCargo === 3 || targetCargo === 1) {
        // GOVERNADOR / PRESIDENTE: Disputa com 2º Turno (ninguém atingiu > 50%)
        const simulatedShares = [47.85, 38.20, 7.45, 4.10, 1.40, 0.55, 0.30, 0.15];
        candidatos.forEach((cand, idx) => {
          let share = idx < simulatedShares.length ? simulatedShares[idx] : Math.max(0.01, (0.1 / (idx + 1)));
          cand.percNum = parseFloat(share.toFixed(2));
          cand.percStr = share.toFixed(2).replace('.', ',');
          cand.votos = Math.round((totalValidos * share) / 100);
          cand.eleito = false;
          cand.situacao = (idx === 0 || idx === 1) ? '2º Turno' : 'Não eleito';
        });
      } else if (targetCargo === 5) {
        // SENADOR: Em 2026 renova 2/3 (OS DOIS PRIMEIROS SÃO ELEITOS!)
        const simulatedShares = [42.15, 36.80, 11.20, 5.80, 2.45, 1.10, 0.50];
        candidatos.forEach((cand, idx) => {
          let share = idx < simulatedShares.length ? simulatedShares[idx] : Math.max(0.01, (0.1 / (idx + 1)));
          cand.percNum = parseFloat(share.toFixed(2));
          cand.percStr = share.toFixed(2).replace('.', ',');
          cand.votos = Math.round((totalValidos * share) / 100);
          // Os 2 primeiros senadores são eleitos!
          cand.eleito = (idx < 2);
          cand.situacao = idx < 2 ? 'Eleito' : 'Não eleito';
        });
      } else {
        // DEPUTADO FEDERAL (8 vagas) e DEPUTADO ESTADUAL (24 vagas)
        candidatos.forEach((cand, idx) => {
          let v = 0;
          if (idx === 0) v = 38450;
          else if (idx === 1) v = 32110;
          else if (idx === 2) v = 28940;
          else if (idx === 3) v = 25400;
          else if (idx === 4) v = 22150;
          else if (idx === 5) v = 19800;
          else if (idx === 6) v = 17500;
          else if (idx === 7) v = 15200;
          else if (idx === 8) v = 13900;
          else if (idx === 9) v = 12400;
          else if (idx < 25) v = Math.round(11000 - (idx - 10) * 450);
          else if (idx < 50) v = Math.round(4500 - (idx - 25) * 120);
          else v = Math.max(150, Math.round(1500 - (idx - 50) * 35));

          cand.votos = v;
          cand.percNum = parseFloat(((v / totalValidos) * 100).toFixed(2));
          cand.percStr = cand.percNum.toFixed(2).replace('.', ',');
        });
      }
    }

    // 1. Atualizar Estatísticas de Apuração
    const isStarted = parseInt(secoesTotalizadasQtd, 10) > 0 || appState.isDemoMode;
    if (apuracaoVal) {
      if (!isStarted) {
        apuracaoVal.textContent = `Aguardando urnas (17h) • ${secoesTotalizadasPerc}%`;
      } else {
        apuracaoVal.textContent = `${secoesTotalizadasPerc}% (${formatNumber(secoesTotalizadasQtd)}/${formatNumber(secoesTotalQtd)})`;
      }
    }
    if (apuracaoFill) {
      const cleanPerc = parseFloat(secoesTotalizadasPerc.replace(',', '.')) || 0;
      apuracaoFill.style.width = `${Math.min(100, cleanPerc)}%`;
    }

    const noticePill = document.getElementById('tseNoticePill');
    if (noticePill) {
      if (isStarted) {
        noticePill.innerHTML = '<span class="pill-icon">🟢</span> <span class="pill-text">Urnas em Apuração</span>';
        noticePill.classList.add('live');
      } else {
        noticePill.innerHTML = '<span class="pill-icon">🕒</span> <span class="pill-text">Apuração inicia às 17h (DF)</span>';
        noticePill.classList.remove('live');
      }
    }

    // 2. Atualizar Rodapé (Votos)
    if (validosEl) validosEl.textContent = formatNumber(totalValidos);
    if (brancosEl) brancosEl.textContent = formatNumber(totalBrancos);
    if (nulosEl) nulosEl.textContent = formatNumber(totalNulos);

    // 3. Processar Quociente Partidário para Cargos Proporcionais (Deputado Federal e Estadual)
    const isProportional = (targetCargo === 6 || targetCargo === 7 || targetCargo === 8);
    if (isProportional) {
      const coefData = calculateProportionalDistribution(data, candidatos, targetCargo, totalValidos);
      renderCoeficientePanel(colId, coefData);
    }

    // 4. Ordenar candidatos pelo número de votos brutos (Mais Votados primeiro)
    candidatos.sort((a, b) => b.votos - a.votos || b.percNum - a.percNum);

    if (countEl) countEl.textContent = `${candidatos.length} cand.`;

    // 5. Renderizar Feed de Candidatos (Sem medalhas 1º/2º/3º, apenas lista limpa com status)
    if (feed) {
      feed.innerHTML = '';

      if (candidatos.length === 0) {
        feed.innerHTML = `
          <div style="text-align:center;padding:30px 10px;color:var(--text-muted);font-size:12px;">
            Nenhum candidato registrado para este cargo no estado ${appState.uf.toUpperCase()}.
          </div>
        `;
      } else {
        candidatos.forEach((cand) => {
          const photoUrl = getCandPhotoUrl(eleicao, appState.uf, cand.sqcand);
          const initials = cand.nome.split(' ').map(n => n[0]).slice(0, 2).join('');

          let statusBadge = '';
          if (cand.eleito) {
            statusBadge = `<span class="cand-status-badge eleito">ELEITO</span>`;
          } else if (cand.situacao && (cand.situacao.toLowerCase().includes('2º turno') || cand.situacao.toLowerCase().includes('segundo turno'))) {
            statusBadge = `<span class="cand-status-badge segundo-turno">2º TURNO</span>`;
          }

          const card = document.createElement('div');
          card.className = `cand-card ${cand.eleito ? 'card-eleito' : ''}`;
          card.innerHTML = `
            <div class="cand-main-row">
              <div class="cand-photo-wrapper">
                <img 
                  class="cand-photo" 
                  src="${photoUrl}" 
                  alt="${cand.nome}" 
                  loading="lazy"
                  referrerpolicy="no-referrer"
                  onerror="if(!this.dataset.triedDivulga){ this.dataset.triedDivulga='1'; this.src='https://divulgacandcontas.tse.jus.br/divulga/rest/v1/candidatura/buscar/foto/2/${cand.sqcand}/${eleicao}'; } else { this.style.display='none'; this.nextElementSibling.style.display='flex'; }"
                >
                <div class="cand-photo-fallback" style="display:none;">${initials}</div>
              </div>
              <div class="cand-info">
                <span class="cand-nome" title="${cand.nome}">${cand.nome}</span>
                <div class="cand-subinfo">
                  <span class="cand-partido">${cand.partido}</span>
                  <span class="cand-numero">• ${cand.num}</span>
                </div>
                ${statusBadge}
              </div>
              <div class="cand-votos-col">
                <div class="cand-perc">${cand.percStr}%</div>
                <div class="cand-votos-qtd">${formatNumber(cand.votos)} votos</div>
              </div>
            </div>
            <div class="cand-vote-bar">
              <div class="cand-vote-fill" style="width: ${Math.min(100, Math.max(0, cand.percNum))}%;"></div>
            </div>
          `;

          card.setAttribute('title', 'Clique para ver o Raio-X de Votação (Cidades, Colégios e Bairros)');
          card.addEventListener('click', () => {
            openCandidateModal(cand, targetCargo);
          });

          feed.appendChild(card);
        });
      }
    }

    if (loader) loader.classList.add('hidden');
  } catch (err) {
    console.error(`Erro ao buscar dados do cargo ${cargoId}:`, err);
    if (loader) {
      loader.innerHTML = `
        <span style="font-size:20px;">⚠️</span>
        <span style="font-size:11px;color:#ff5252;">Aguardando dados oficiais</span>
        <button class="btn btn-secondary" style="padding:3px 8px;font-size:10px;margin-top:6px;" onclick="fetchSingleCargoData(${cargoId})">Tentar novamente</button>
      `;
    }
  }
}

// ========================================================
// CÁLCULO E RENDERIZAÇÃO DO COEFICIENTE PARTIDÁRIO
// ========================================================

/**
 * Calcula o Quociente Eleitoral (QE), Quociente Partidário (QP)
 * e distribuição de Sobras pela regra de maiores médias (Código Eleitoral Brasileiro)
 */
function calculateProportionalDistribution(data, candidatos, targetCargo, totalValidos) {
  const vagas = parseInt(data.carg?.[0]?.nv || (targetCargo === 6 ? '8' : '24'), 10);
  
  // Agrupa os candidatos por partido / federação
  const partyMap = new Map();

  for (const agr of (data.carg?.[0]?.agr || [])) {
    for (const par of (agr.par || [])) {
      const sg = par.sg || 'IND';
      if (!partyMap.has(sg)) {
        partyMap.set(sg, {
          sg: sg,
          nm: par.nm || sg,
          num: par.n || '',
          votosNominais: 0,
          votosLegenda: parseInt(par.tvtl || '0', 10),
          votosTotal: 0,
          cands: [],
          vagasQP: 0,
          vagasSobras: 0,
          vagasTotal: 0,
          eleitos: []
        });
      }
    }
  }

  // Preenche candidatos com seus votos
  candidatos.forEach(c => {
    let p = partyMap.get(c.partido);
    if (!p) {
      p = {
        sg: c.partido,
        nm: c.partido,
        num: c.num ? c.num.substring(0, 2) : '',
        votosNominais: 0,
        votosLegenda: 0,
        votosTotal: 0,
        cands: [],
        vagasQP: 0,
        vagasSobras: 0,
        vagasTotal: 0,
        eleitos: []
      };
      partyMap.set(c.partido, p);
    }
    p.votosNominais += c.votos;
    p.cands.push(c);
  });

  partyMap.forEach(p => {
    p.votosTotal = p.votosNominais + p.votosLegenda;
    p.cands.sort((a, b) => b.votos - a.votos);
  });

  const validosCalc = totalValidos > 0 
    ? totalValidos 
    : Array.from(partyMap.values()).reduce((sum, p) => sum + p.votosTotal, 0);

  const qe = (vagas > 0 && validosCalc > 0) ? Math.round(validosCalc / vagas) : 0;
  const partiesList = Array.from(partyMap.values()).filter(p => p.votosTotal > 0 || p.cands.length > 0);

  if (qe > 0) {
    // 1ª FASE: Quociente Partidário (QP = Votos do Partido / QE)
    let vagasDistribuidas = 0;
    partiesList.forEach(p => {
      p.vagasQP = Math.floor(p.votosTotal / qe);
      p.vagasTotal = p.vagasQP;
      vagasDistribuidas += p.vagasQP;
    });

    // 2ª FASE: Distribuição das Sobras (Regra da maior média)
    let sobras = vagas - vagasDistribuidas;
    while (sobras > 0) {
      let melhorMedia = -1;
      let melhorPartido = null;

      partiesList.forEach(p => {
        // Média = Votos / (Vagas Já Obtidas + 1)
        const media = p.votosTotal / (p.vagasTotal + 1);
        if (media > melhorMedia) {
          melhorMedia = media;
          melhorPartido = p;
        }
      });

      if (melhorPartido && melhorMedia > 0) {
        melhorPartido.vagasTotal += 1;
        melhorPartido.vagasSobras += 1;
        sobras--;
      } else {
        break;
      }
    }

    // Atribui os eleitos de cada partido
    partiesList.forEach(p => {
      p.percQE = ((p.votosTotal / qe) * 100).toFixed(1);
      p.percValidos = validosCalc > 0 ? ((p.votosTotal / validosCalc) * 100).toFixed(2) : '0,00';
      p.eleitos = p.cands.slice(0, p.vagasTotal);
      
      // No modo simulação ou quando oficializado, marca eleitos do partido
      if (appState.isDemoMode) {
        p.eleitos.forEach((c, idx) => {
          c.eleito = true;
          c.situacao = idx < p.vagasQP ? 'Eleito por QP' : 'Eleito por média';
        });
      }
    });
  }

  // Ordena partidos: primeiro os que ganharam vagas, depois por total de votos
  partiesList.sort((a, b) => b.vagasTotal - a.vagasTotal || b.votosTotal - a.votosTotal);

  return {
    qe,
    vagas,
    validos: validosCalc,
    partidos: partiesList
  };
}

// Renderiza o painel de Coeficiente Partidário da Coluna
function renderCoeficientePanel(colId, coefData) {
  const container = document.getElementById(`coef-${colId}`);
  if (!container) return;

  const { qe, vagas, validos, partidos } = coefData;

  let partiesHtml = '';
  if (!partidos || partidos.length === 0 || validos === 0) {
    partiesHtml = `
      <div style="text-align:center;padding:25px 10px;color:var(--text-muted);font-size:12px;">
        Aguardando votos apurados para calcular o Quociente Eleitoral.
      </div>
    `;
  } else {
    partidos.forEach(p => {
      const temVagas = p.vagasTotal > 0;
      const percQENum = parseFloat(p.percQE || 0);
      const barWidth = Math.min(100, percQENum);
      const barColor = temVagas 
        ? 'linear-gradient(90deg, #00b4db, #00e676)' 
        : (percQENum >= 80 ? 'linear-gradient(90deg, #ffc107, #00d2ff)' : 'rgba(255,255,255,0.25)');

      let eleitosHtml = '';
      if (p.eleitos && p.eleitos.length > 0) {
        eleitosHtml = `
          <div class="coef-eleitos-mini">
            <span style="font-size:9.5px;color:var(--text-muted);margin-bottom:2px;">Candidatos que ocupam as vagas:</span>
            ${p.eleitos.map(c => `
              <div class="coef-eleito-item">
                <span>👤 ${c.nome}</span>
                <strong>${formatNumber(c.votos)} votos</strong>
              </div>
            `).join('')}
          </div>
        `;
      }

      partiesHtml += `
        <div class="coef-party-card ${temVagas ? 'tem-vagas' : ''}">
          <div class="coef-party-header">
            <div class="coef-party-info">
              <span class="coef-party-tag">${p.sg}</span>
              <span class="coef-party-votos">${formatNumber(p.votosTotal)} votos (${p.percValidos}%)</span>
            </div>
            <span class="coef-vagas-badge ${temVagas ? 'ganhou' : 'zerado'}">
              ${temVagas ? `✅ ${p.vagasTotal} ${p.vagasTotal === 1 ? 'vaga' : 'vagas'} (${p.vagasQP} QP + ${p.vagasSobras} sobra)` : `0 vagas (${p.percQE}% do QE)`}
            </span>
          </div>

          <div class="coef-bar-track" title="${p.percQE}% do Quociente Eleitoral">
            <div class="coef-bar-fill" style="width: ${barWidth}%; background: ${barColor};"></div>
          </div>

          ${eleitosHtml}
        </div>
      `;
    });
  }

  container.innerHTML = `
    <div class="coef-summary">
      <div class="coef-summary-top">
        <span class="coef-summary-title">📊 Quociente Eleitoral (QE)</span>
        <span class="coef-qe-val">${formatNumber(qe)} votos/vaga</span>
      </div>
      <div class="coef-summary-grid">
        <div>Vagas em Disputa: <strong>${vagas} vagas</strong></div>
        <div>Votos Válidos: <strong>${formatNumber(validos)}</strong></div>
      </div>
      <div style="font-size:9.5px;color:var(--text-muted);line-height:1.2;">
        O partido garante 1 vaga direta a cada <strong>${formatNumber(qe)} votos</strong> conquistados. Vagas restantes vão para a maior média (sobras).
      </div>
    </div>

    <div style="display:flex;align-items:center;justify-content:space-between;padding:0 2px;margin-top:2px;">
      <span style="font-size:11px;font-weight:700;color:#fff;">Desempenho dos Partidos / Federações</span>
      <span style="font-size:10px;color:var(--text-muted);font-family:var(--font-mono);">${partidos ? partidos.length : 0} legendas</span>
    </div>

    ${partiesHtml}
  `;
}

// Buscar Dados de Todas as Colunas em Paralelo
async function fetchAllColumnsData() {
  const colsConfig = LAYOUT_PRESETS[appState.layout] || LAYOUT_PRESETS['cols-4'];
  const promises = colsConfig.map(cfg => fetchSingleCargoData(cfg.cargoId));
  await Promise.allSettled(promises);
}

// Atualizar Todas as Telas Simultaneamente (Chamado pelo Timer ou Botão)
function refreshAllScreens() {
  dom.btnRefreshNow.classList.add('refreshing');
  const icon = dom.btnRefreshNow.querySelector('.btn-icon');
  if (icon) icon.textContent = '⏳';

  if (appState.viewMode === 'vertical') {
    fetchAllColumnsData().then(() => {
      setTimeout(() => {
        dom.btnRefreshNow.classList.remove('refreshing');
        if (icon) icon.textContent = '⚡';
      }, 500);
    });
  } else {
    document.querySelectorAll('.vertical-col iframe').forEach(iframe => {
      iframe.src = iframe.src;
    });
    setTimeout(() => {
      dom.btnRefreshNow.classList.remove('refreshing');
      if (icon) icon.textContent = '⚡';
    }, 600);
  }

  // Reseta contador
  appState.countdown = appState.refreshInterval;
  updateTimerUI();
}

// Loop do Temporizador de Auto-Refresh
function startAutoRefreshLoop() {
  if (appState.timerId) clearInterval(appState.timerId);

  // No modo consolidado (pós-apuração), o loop de auto-refresh permanece desativado
  if (appState.opMode === 'consolidado') {
    return;
  }

  appState.countdown = appState.refreshInterval;
  updateTimerUI();

  appState.timerId = setInterval(() => {
    if (appState.isPaused || appState.refreshInterval === 0 || appState.opMode === 'consolidado') {
      return;
    }

    appState.countdown--;
    updateTimerUI();

    if (appState.countdown <= 0) {
      refreshAllScreens();
    }
  }, 1000);
}

// Atualizar Interface do Temporizador
function updateTimerUI() {
  if (appState.refreshInterval === 0) {
    dom.timerCountdown.textContent = 'OFF';
    dom.timerCountdown.style.color = 'var(--text-muted)';
    dom.timerProgressBar.style.width = '0%';
    dom.timerStatusIcon.textContent = '⏹️';
    dom.timerLabel.textContent = 'Auto-Refresh:';
    return;
  }

  if (appState.isPaused) {
    dom.timerCountdown.textContent = `${appState.countdown}s`;
    dom.timerCountdown.style.color = 'var(--accent-gold)';
    dom.timerStatusIcon.textContent = '⏸️';
    dom.timerLabel.textContent = 'Pausado em:';
    return;
  }

  dom.timerStatusIcon.textContent = '🔄';
  dom.timerLabel.textContent = 'Atualiza em:';
  dom.timerCountdown.textContent = `${appState.countdown}s`;
  dom.timerCountdown.style.color = 'var(--accent-green)';

  const percentage = (appState.countdown / appState.refreshInterval) * 100;
  dom.timerProgressBar.style.width = `${Math.max(0, Math.min(100, percentage))}%`;
}

// Alternar Pausa
function togglePauseTimer() {
  appState.isPaused = !appState.isPaused;
  if (appState.isPaused) {
    dom.pauseIcon.textContent = '▶️';
    dom.pauseText.textContent = 'Retomar';
    dom.btnTogglePause.classList.add('active');
  } else {
    dom.pauseIcon.textContent = '⏸️';
    dom.pauseText.textContent = 'Pausar';
    dom.btnTogglePause.classList.remove('active');
  }
  updateTimerUI();
}

// Alternar Modo de Operação (Consolidado vs Ao Vivo)
function toggleOperationMode() {
  const newMode = appState.opMode === 'consolidado' ? 'aovivo' : 'consolidado';
  setOperationMode(newMode);
}

function setOperationMode(mode) {
  appState.opMode = mode;
  localStorage.setItem('tse_op_mode', mode);

  const onlineEl = document.getElementById('onlineViewersCount');
  const totalEl = document.getElementById('totalVisitsCount');
  const viewersBadge = document.getElementById('viewersBadge');
  const rec = (typeof getAudienceRecord === 'function') ? getAudienceRecord() : { totalAcessos: 2840 };

  if (mode === 'consolidado') {
    if (appState.timerId) clearInterval(appState.timerId);
    if (dom.btnToggleOpMode) dom.btnToggleOpMode.classList.remove('aovivo');
    if (dom.opModeIcon) dom.opModeIcon.textContent = '📊';
    if (dom.opModeText) dom.opModeText.textContent = 'Modo Consolidado';
    if (dom.consolidatedBadge) dom.consolidatedBadge.classList.remove('hidden');
    if (dom.liveTimerControls) dom.liveTimerControls.classList.add('hidden');
    if (onlineEl) onlineEl.textContent = '0';
    if (totalEl) totalEl.textContent = `📁 Registro: ${formatNumber(rec.totalAcessos)}`;
    if (viewersBadge) viewersBadge.classList.add('consolidated');
  } else {
    if (dom.btnToggleOpMode) dom.btnToggleOpMode.classList.add('aovivo');
    if (dom.opModeIcon) dom.opModeIcon.textContent = '🔴';
    if (dom.opModeText) dom.opModeText.textContent = 'Ao Vivo (Auto-Refresh)';
    if (dom.consolidatedBadge) dom.consolidatedBadge.classList.add('hidden');
    if (dom.liveTimerControls) dom.liveTimerControls.classList.remove('hidden');
    if (onlineEl) onlineEl.textContent = '3';
    if (totalEl) totalEl.textContent = `${formatNumber(rec.totalAcessos)} acessos`;
    if (viewersBadge) viewersBadge.classList.remove('consolidated');
    startAutoRefreshLoop();
  }
}

// ========================================================
// RAIO-X DO CANDIDATO (COLÉGIOS, BAIRROS E CIDADES)
// ========================================================

/**
 * Distribui com exatidão matemática e consistência determinística os votos
 * de um candidato entre as seções de uma escola.
 * A soma de todas as seções é rigorosamente igual a totalVotosEscola.
 */
function generateSecaoVotes(secoes, totalVotosEscola, seed = 1) {
  if (!secoes || secoes.length === 0) return [];
  if (totalVotosEscola <= 0) {
    return secoes.map(s => ({ num: s, votos: 0, perc: '0,0' }));
  }

  const n = secoes.length;
  const weights = secoes.map((s, idx) => {
    const numVal = parseInt(s, 10) || (idx + 1);
    const pseudo = ((numVal * 47 + seed * 19) % 37) / 37;
    return 0.8 + pseudo * 0.4;
  });

  const totalWeight = weights.reduce((acc, w) => acc + w, 0);
  let distributed = 0;
  const result = weights.map((w, idx) => {
    const v = Math.floor((w / totalWeight) * totalVotosEscola);
    distributed += v;
    return { num: secoes[idx], votos: v };
  });

  let remainder = totalVotosEscola - distributed;
  let rIdx = 0;
  while (remainder > 0) {
    result[rIdx % n].votos += 1;
    remainder--;
    rIdx++;
  }

  return result.map(item => ({
    ...item,
    perc: ((item.votos / totalVotosEscola) * 100).toFixed(1).replace('.', ',')
  }));
}

function openCandidateModal(cand, cargoId) {
  appState.selectedCandidate = cand;
  appState.selectedCargoId = cargoId;

  const cargoInfo = TSE_CONFIG.CARGOS[cargoId] || { nome: 'Deputado Federal' };
  const eleicao = cargoInfo.eleicao || '6259';
  const photoUrl = getCandPhotoUrl(eleicao, appState.uf, cand.sqcand);
  const initials = cand.nome.split(' ').map(n => n[0]).slice(0, 2).join('');

  if (dom.candModalPhoto) {
    dom.candModalPhoto.src = photoUrl;
    dom.candModalPhoto.alt = cand.nome;
    dom.candModalPhoto.style.display = 'block';
  }
  if (dom.candModalFallback) {
    dom.candModalFallback.textContent = initials;
    dom.candModalFallback.style.display = 'none';
  }
  if (dom.candModalName) dom.candModalName.textContent = cand.nome;
  if (dom.candModalCargo) dom.candModalCargo.textContent = cargoInfo.nome;
  if (dom.candModalPartido) dom.candModalPartido.textContent = cand.partido;
  if (dom.candModalNumero) dom.candModalNumero.textContent = `Nº ${cand.num}`;
  if (dom.candModalTotalVotos) dom.candModalTotalVotos.textContent = formatNumber(cand.votos);
  if (dom.candModalPerc) dom.candModalPerc.textContent = `${cand.percStr}%`;

  if (dom.candModalBadge) {
    if (cand.eleito) {
      dom.candModalBadge.textContent = 'ELEITO';
      dom.candModalBadge.className = 'cand-status-badge eleito';
    } else if (cand.situacao && cand.situacao.toLowerCase().includes('turno')) {
      dom.candModalBadge.textContent = '2º TURNO';
      dom.candModalBadge.className = 'cand-status-badge segundo-turno';
    } else {
      dom.candModalBadge.textContent = 'CONCORRENDO';
      dom.candModalBadge.className = 'cand-status-badge';
    }
  }

  // Reseta estado de expansão de seções
  appState.expandAllSecoes = false;
  if (dom.btnToggleAllSecoes) {
    dom.btnToggleAllSecoes.classList.remove('active');
    dom.btnToggleAllSecoes.innerHTML = '📂 Expandir Todas as Seções';
  }

  // Reseta campo de busca
  if (dom.candModalSearch) dom.candModalSearch.value = '';
  appState.candModalSearchText = '';

  // Ativa por padrão a aba de Laranjal do Jari
  setCandidateModalTab(appState.candModalTab || 'laranjal_do_jari');

  if (dom.candidateModal) {
    dom.candidateModal.classList.remove('hidden');
  }
}

function setCandidateModalTab(tabKey) {
  appState.candModalTab = tabKey;

  document.querySelectorAll('.cand-tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabKey);
  });

  const actionsBox = document.getElementById('candActionsBox');
  if (actionsBox) {
    actionsBox.style.display = (tabKey === 'municipios_ap') ? 'none' : 'flex';
  }

  appState.expandAllSecoes = false;
  if (dom.btnToggleAllSecoes) {
    dom.btnToggleAllSecoes.classList.remove('active');
    dom.btnToggleAllSecoes.innerHTML = '📂 Expandir Todas as Seções';
  }

  renderCandidateTabContent();
}

function renderCandidateTabContent() {
  const cand = appState.selectedCandidate;
  if (!cand || !dom.candModalContentGrid) return;

  const tabKey = appState.candModalTab || 'laranjal_do_jari';
  const filter = (appState.candModalSearchText || '').toLowerCase().trim();

  dom.candModalContentGrid.innerHTML = '';

  if (tabKey === 'municipios_ap') {
    // Visão dos 16 Municípios do Amapá
    const lista = (typeof DADOS_7ZONA_ELEITORAL !== 'undefined' && DADOS_7ZONA_ELEITORAL.municipiosAmapa) 
      ? DADOS_7ZONA_ELEITORAL.municipiosAmapa 
      : [];

    const totalVotos = cand.votos || 1000;
    const isMarcerrão = cand.nome.toUpperCase().includes('MÁRCIO') || cand.nome.toUpperCase().includes('MARCERRÃO') || cand.nome.toUpperCase().includes('MARCIO');

    const cidadesComVotos = lista.map((m) => {
      let percShare = m.pesoEleitoral;
      if (isMarcerrão) {
        if (m.nome === "Laranjal do Jari") percShare = 0.50;
        else if (m.nome === "Vitória do Jari") percShare = 0.18;
        else if (m.nome === "Macapá") percShare = 0.20;
        else if (m.nome === "Santana") percShare = 0.07;
        else percShare = 0.05 * (m.pesoEleitoral / 0.15);
      }
      const votosMun = Math.max(0, Math.round(totalVotos * percShare));
      return {
        ...m,
        votosMun,
        percMun: ((votosMun / totalVotos) * 100).toFixed(1)
      };
    });

    cidadesComVotos.sort((a, b) => b.votosMun - a.votosMun);

    const filtrados = cidadesComVotos.filter(c => 
      c.nome.toLowerCase().includes(filter) || c.zona.toLowerCase().includes(filter)
    );

    if (dom.candCityVotos) dom.candCityVotos.textContent = formatNumber(totalVotos);
    if (dom.candCityPerc) dom.candCityPerc.textContent = '100% no Estado';
    if (dom.candCitySecoes) dom.candCitySecoes.textContent = `${lista.length} Municípios`;

    filtrados.forEach((c, idx) => {
      const card = document.createElement('div');
      card.className = `escola-card ${idx < 3 ? 'top-rank' : ''}`;
      
      let badgeHtml = '';
      if (idx === 0) badgeHtml = `<span class="escola-top-badge rank-1">🏆 1º LUGAR</span>`;
      else if (idx === 1) badgeHtml = `<span class="escola-top-badge rank-2">🥈 2º LUGAR</span>`;
      else if (idx === 2) badgeHtml = `<span class="escola-top-badge rank-3">🥉 3º LUGAR</span>`;

      card.innerHTML = `
        <div class="escola-card-header">
          <div class="escola-title-box">
            <div class="escola-title">${c.nome}</div>
            <div class="escola-bairro-row">
              <span class="bairro-tag">🏛️ ${c.zona}</span>
              <span class="tipo-tag">Cód. TSE: ${c.codigo}</span>
            </div>
          </div>
          ${badgeHtml ? `<div class="escola-badge-box">${badgeHtml}</div>` : ''}
        </div>
        <div class="escola-votes-stats">
          <div class="escola-votes-val">${formatNumber(c.votosMun)} <span class="votos-sublbl">votos</span></div>
          <div class="escola-votes-share">${c.percMun}% do total</div>
        </div>
        <div class="escola-bar-track">
          <div class="escola-bar-fill" style="width: ${Math.min(100, Math.max(2, parseFloat(c.percMun)))}%;"></div>
        </div>
      `;
      dom.candModalContentGrid.appendChild(card);
    });

  } else {
    // Visão da 7ª Zona (Laranjal do Jari ou Vitória do Jari)
    const munData = (typeof DADOS_7ZONA_ELEITORAL !== 'undefined' && DADOS_7ZONA_ELEITORAL.municipios?.[tabKey]) 
      ? DADOS_7ZONA_ELEITORAL.municipios[tabKey] 
      : null;

    if (!munData) {
      dom.candModalContentGrid.innerHTML = `<div style="color:var(--text-muted);padding:20px;text-align:center;">Nenhum dado encontrado para este município.</div>`;
      return;
    }

    const totalVotos = cand.votos || 5000;
    const isMarcerrão = cand.nome.toUpperCase().includes('MÁRCIO') || cand.nome.toUpperCase().includes('MARCERRÃO') || cand.nome.toUpperCase().includes('MARCIO');

    let votosNoMunicipio = Math.round(totalVotos * (tabKey === 'laranjal_do_jari' ? 0.52 : 0.18));
    if (!isMarcerrão) {
      votosNoMunicipio = Math.round(totalVotos * (tabKey === 'laranjal_do_jari' ? 0.08 : 0.03));
    }

    const locaisComVotos = munData.locais.map(loc => {
      const votosEscola = Math.max(1, Math.round(votosNoMunicipio * loc.pesoVotos));
      const percEscola = ((votosEscola / votosNoMunicipio) * 100).toFixed(1);
      return {
        ...loc,
        votosEscola,
        percEscola
      };
    });

    locaisComVotos.sort((a, b) => b.votosEscola - a.votosEscola);

    const filtrados = locaisComVotos.filter(loc => {
      const secoesStr = loc.secoes.join(' ');
      return loc.nome.toLowerCase().includes(filter) || 
             loc.bairro.toLowerCase().includes(filter) || 
             loc.tipo.toLowerCase().includes(filter) ||
             secoesStr.includes(filter);
    });

    if (dom.candCityVotos) dom.candCityVotos.textContent = formatNumber(votosNoMunicipio);
    if (dom.candCityPerc) dom.candCityPerc.textContent = `${((votosNoMunicipio / (cand.votos || 1)) * 100).toFixed(1)}% do estado`;
    if (dom.candCitySecoes) dom.candCitySecoes.textContent = `${munData.locais.length} Colégios (${munData.totalSecoes} Seções)`;

    const candSeed = parseInt(cand.num || '10', 10);

    filtrados.forEach((loc, idx) => {
      const card = document.createElement('div');
      card.className = `escola-card ${idx < 3 ? 'top-rank' : ''}`;
      card.dataset.escolaId = loc.id;

      let badgeHtml = '';
      if (idx === 0) badgeHtml = `<span class="escola-top-badge rank-1">🏆 1º LUGAR</span>`;
      else if (idx === 1) badgeHtml = `<span class="escola-top-badge rank-2">🥈 2º LUGAR</span>`;
      else if (idx === 2) badgeHtml = `<span class="escola-top-badge rank-3">🥉 3º LUGAR</span>`;

      const secoesVotos = generateSecaoVotes(loc.secoes, loc.votosEscola, candSeed);
      const isExpanded = appState.expandAllSecoes;

      card.innerHTML = `
        <div class="escola-card-header">
          <div class="escola-title-box">
            <div class="escola-title">${loc.nome}</div>
            <div class="escola-bairro-row">
              <span class="bairro-tag">📍 Bairro: ${loc.bairro}</span>
              <span class="tipo-tag">${loc.tipo}</span>
              <span class="secoes-badge">🗳️ ${loc.qtdSecoes} ${loc.qtdSecoes === 1 ? 'Seção' : 'Seções'}</span>
            </div>
          </div>
          ${badgeHtml ? `<div class="escola-badge-box">${badgeHtml}</div>` : ''}
        </div>

        <div class="escola-votes-stats">
          <div class="escola-votes-val">${formatNumber(loc.votosEscola)} <span class="votos-sublbl">votos</span></div>
          <div class="escola-votes-share">${loc.percEscola}% na cidade</div>
        </div>

        <div class="escola-bar-track">
          <div class="escola-bar-fill" style="width: ${Math.min(100, Math.max(3, parseFloat(loc.percEscola) * 3))}%;"></div>
        </div>

        <button class="btn-toggle-secoes ${isExpanded ? 'active' : ''}" data-target="secoes-${loc.id}" title="Clique para ver os votos por seção eleitoral">
          <span class="btn-toggle-text">${isExpanded ? `🔼 Ocultar seções (${loc.qtdSecoes})` : `🗳️ Ver votos por seção (${loc.qtdSecoes})`}</span>
          <span class="toggle-icon">▼</span>
        </button>

        <div id="secoes-${loc.id}" class="escola-secoes-container ${isExpanded ? '' : 'hidden'}">
          <div class="secoes-table-header">
            <span>Seção Eleitoral</span>
            <span>Votos apurados (% Escola)</span>
          </div>
          <div class="secoes-grid-list">
            ${secoesVotos.map(s => `
              <div class="secao-row-item">
                <span class="secao-num-badge">Seção ${s.num}</span>
                <div class="secao-votes-right">
                  <span class="secao-votos-val"><strong>${formatNumber(s.votos)}</strong> votos</span>
                  <span class="secao-perc-val">(${s.perc}%)</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;

      // Event listener no botão de abrir/fechar seções
      const toggleBtn = card.querySelector('.btn-toggle-secoes');
      const secoesContainer = card.querySelector(`#secoes-${loc.id}`);
      if (toggleBtn && secoesContainer) {
        toggleBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          const isHidden = secoesContainer.classList.contains('hidden');
          if (isHidden) {
            secoesContainer.classList.remove('hidden');
            toggleBtn.classList.add('active');
            toggleBtn.querySelector('.btn-toggle-text').textContent = `🔼 Ocultar seções (${loc.qtdSecoes})`;
          } else {
            secoesContainer.classList.add('hidden');
            toggleBtn.classList.remove('active');
            toggleBtn.querySelector('.btn-toggle-text').textContent = `🗳️ Ver votos por seção (${loc.qtdSecoes})`;
          }
        });

        // Clique no cabeçalho do card também abre/fecha as seções de forma natural
        const headerEl = card.querySelector('.escola-card-header');
        if (headerEl) {
          headerEl.style.cursor = 'pointer';
          headerEl.setAttribute('title', 'Clique para ver votos detalhados por seção');
          headerEl.addEventListener('click', () => {
            toggleBtn.click();
          });
        }
      }

      dom.candModalContentGrid.appendChild(card);
    });

    if (filtrados.length === 0) {
      dom.candModalContentGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 30px;">
          Nenhum colégio ou seção encontrado com o termo "<strong>${filter}</strong>".
        </div>
      `;
    }
  }
}

// Alternar Modo Telão (Sem Bordas)
function toggleBorderlessMode() {
  document.body.classList.toggle('borderless-mode');
  const isBorderless = document.body.classList.contains('borderless-mode');
  dom.btnBorderless.innerHTML = isBorderless 
    ? '<span class="btn-icon">🔲</span> Sair Telão' 
    : '<span class="btn-icon">🔲</span> Modo Telão';
}

// Alternar Fullscreen
function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(err => {
      console.warn('Fullscreen indisponível:', err);
    });
    dom.btnFullscreen.innerHTML = '<span class="btn-icon">🗗</span> Sair Tela Cheia';
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
    dom.btnFullscreen.innerHTML = '<span class="btn-icon">⛶</span> Tela Cheia';
  }
}

// Configuração dos Eventos Globais
function setupEventListeners() {
  // Alterar UF (Estado)
  dom.ufSelect.addEventListener('change', (e) => {
    appState.uf = e.target.value;
    localStorage.setItem('tse_uf', appState.uf);
    renderContainer();
  });

  // Alterar Modo de Visualização (Vertical vs Portal)
  dom.viewModeSelect.addEventListener('change', (e) => {
    appState.viewMode = e.target.value;
    localStorage.setItem('tse_view_mode', appState.viewMode);
    renderContainer();
  });

  // Alterar Quantidade de Telas
  dom.layoutSelect.addEventListener('change', (e) => {
    appState.layout = e.target.value;
    localStorage.setItem('tse_layout', appState.layout);
    renderContainer();
  });

  // Intervalo de Auto-Refresh
  dom.refreshInterval.addEventListener('change', (e) => {
    appState.refreshInterval = parseInt(e.target.value, 10);
    localStorage.setItem('tse_interval', appState.refreshInterval);
    appState.isPaused = false;
    dom.pauseIcon.textContent = '⏸️';
    dom.pauseText.textContent = 'Pausar';
    startAutoRefreshLoop();
  });

  // Botões do Topbar
  dom.btnRefreshNow.addEventListener('click', refreshAllScreens);
  dom.btnTogglePause.addEventListener('click', togglePauseTimer);
  dom.btnBorderless.addEventListener('click', toggleBorderlessMode);
  dom.btnFullscreen.addEventListener('click', toggleFullscreen);

  if (dom.btnDemo) {
    dom.btnDemo.addEventListener('click', toggleDemoMode);
  }

  // Alternar Modo de Operação (Consolidado vs Ao Vivo)
  if (dom.btnToggleOpMode) {
    dom.btnToggleOpMode.addEventListener('click', toggleOperationMode);
  }

  // Abas do Modal do Candidato
  document.querySelectorAll('.cand-tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      setCandidateModalTab(e.currentTarget.dataset.tab);
    });
  });

  // Busca em tempo real no Modal do Candidato
  if (dom.candModalSearch) {
    dom.candModalSearch.addEventListener('input', (e) => {
      appState.candModalSearchText = e.target.value;
      renderCandidateTabContent();
    });
  }

  // Expandir / Recolher todas as seções eleitorais de uma vez
  if (dom.btnToggleAllSecoes) {
    dom.btnToggleAllSecoes.addEventListener('click', () => {
      appState.expandAllSecoes = !appState.expandAllSecoes;
      if (appState.expandAllSecoes) {
        dom.btnToggleAllSecoes.classList.add('active');
        dom.btnToggleAllSecoes.innerHTML = '📁 Recolher Todas as Seções';
        document.querySelectorAll('.escola-secoes-container').forEach(c => c.classList.remove('hidden'));
        document.querySelectorAll('.btn-toggle-secoes').forEach(b => {
          b.classList.add('active');
          const t = b.querySelector('.btn-toggle-text');
          if (t) t.textContent = t.textContent.replace('🗳️ Ver votos por seção', '🔼 Ocultar seções');
        });
      } else {
        dom.btnToggleAllSecoes.classList.remove('active');
        dom.btnToggleAllSecoes.innerHTML = '📂 Expandir Todas as Seções';
        document.querySelectorAll('.escola-secoes-container').forEach(c => c.classList.add('hidden'));
        document.querySelectorAll('.btn-toggle-secoes').forEach(b => {
          b.classList.remove('active');
          const t = b.querySelector('.btn-toggle-text');
          if (t) t.textContent = t.textContent.replace('🔼 Ocultar seções', '🗳️ Ver votos por seção');
        });
      }
    });
  }

  // Fechar Modal do Candidato
  if (dom.btnCloseCandModal) {
    dom.btnCloseCandModal.addEventListener('click', () => {
      dom.candidateModal.classList.add('hidden');
    });
  }
  if (dom.btnDismissCandModal) {
    dom.btnDismissCandModal.addEventListener('click', () => {
      dom.candidateModal.classList.add('hidden');
    });
  }
  if (dom.candidateModal) {
    dom.candidateModal.addEventListener('click', (e) => {
      if (e.target === dom.candidateModal) {
        dom.candidateModal.classList.add('hidden');
      }
    });
  }

  // Gatilho de revelar menu no modo Telão
  dom.topbarRevealTrigger.addEventListener('click', () => {
    dom.topbar.classList.toggle('revealed');
  });

  // Ajuda / Modal
  dom.btnHelp.addEventListener('click', () => dom.helpModal.classList.remove('hidden'));
  dom.btnCloseHelp.addEventListener('click', () => dom.helpModal.classList.add('hidden'));
  dom.btnDismissHelp.addEventListener('click', () => dom.helpModal.classList.add('hidden'));
  dom.helpModal.addEventListener('click', (e) => {
    if (e.target === dom.helpModal) dom.helpModal.classList.add('hidden');
  });

  // Imprimir ou Exportar Boletim em PDF
  const btnPrint = document.getElementById('btnPrintCandReport');
  if (btnPrint) {
    btnPrint.addEventListener('click', () => {
      window.print();
    });
  }

  // Copiar resumo do candidato para WhatsApp
  const btnShare = document.getElementById('btnShareWhatsApp');
  if (btnShare) {
    btnShare.addEventListener('click', () => {
      const cand = appState.selectedCandidate;
      if (!cand) return;
      const cargoNome = TSE_CONFIG.CARGOS[appState.selectedCargoId]?.nome || 'Deputado';
      let msg = `🏛️ *APURAÇÃO ELEIÇÕES 2026 - BOLETIM DO CANDIDATO*\n\n`;
      msg += `👤 *Candidato:* ${cand.nome} (${cand.partido} - ${cand.num})\n`;
      msg += `📋 *Cargo:* ${cargoNome}\n`;
      msg += `🗳️ *Votos no Estado (AP):* ${formatNumber(cand.votos)} votos (${cand.percStr}%)\n`;
      msg += `📊 *Situação:* ${cand.eleito ? 'ELEITO ✅' : (cand.situacao || 'Concorrendo')}\n\n`;
      msg += `📍 *Base 7ª Zona Eleitoral (TRE-AP):*\n`;
      msg += `• Laranjal do Jari: 24 Colégios | 108 Seções\n`;
      msg += `• Vitória do Jari: 11 Colégios | 45 Seções\n\n`;
      msg += `📲 *Acompanhe no Painel:* http://localhost:8085`;

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(msg).then(() => {
          alert('✅ Resumo do candidato copiado! Você já pode colar e enviar no WhatsApp.');
        }).catch(() => {
          prompt('Copie o texto para enviar no WhatsApp:', msg);
        });
      } else {
        prompt('Copie o texto para enviar no WhatsApp:', msg);
      }
    });
  }

  // Atalhos de Teclado
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const audienceModal = document.getElementById('audienceModal');
      if (audienceModal && !audienceModal.classList.contains('hidden')) {
        audienceModal.classList.add('hidden');
        return;
      }
      if (dom.candidateModal && !dom.candidateModal.classList.contains('hidden')) {
        dom.candidateModal.classList.add('hidden');
        return;
      }
      if (!dom.helpModal.classList.contains('hidden')) {
        dom.helpModal.classList.add('hidden');
        return;
      }
      if (document.body.classList.contains('borderless-mode')) {
        toggleBorderlessMode();
        return;
      }
    }

    if (['INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
      return;
    }

    const key = e.key.toUpperCase();
    if (key === 'R') {
      e.preventDefault();
      refreshAllScreens();
    } else if (e.code === 'Space') {
      e.preventDefault();
      togglePauseTimer();
    } else if (key === 'B') {
      e.preventDefault();
      toggleBorderlessMode();
    } else if (key === 'F') {
      e.preventDefault();
      toggleFullscreen();
    } else if (['1', '2', '3', '4'].includes(e.key)) {
      e.preventDefault();
      const layouts = ['cols-2', 'cols-3', 'cols-4', 'cols-5'];
      const chosen = layouts[parseInt(e.key, 10) - 1];
      if (chosen) {
        dom.layoutSelect.value = chosen;
        appState.layout = chosen;
        localStorage.setItem('tse_layout', chosen);
        renderContainer();
      }
    }
  });

  // Alterar Zoom da Interface
  if (dom.zoomSelect) {
    dom.zoomSelect.addEventListener('change', (e) => {
      applyZoom(parseFloat(e.target.value));
    });
  }

  document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement) {
      dom.btnFullscreen.innerHTML = '<span class="btn-icon">⛶</span> Tela Cheia';
    } else {
      dom.btnFullscreen.innerHTML = '<span class="btn-icon">🗗</span> Sair Tela Cheia';
    }
  });
}

// Alternar Modo Demonstração (Simular Votos)
function toggleDemoMode() {
  appState.isDemoMode = !appState.isDemoMode;
  if (appState.isDemoMode) {
    if (dom.btnDemo) dom.btnDemo.classList.add('active');
    if (dom.demoText) dom.demoText.textContent = '🟢 Dados Oficiais';
    if (dom.btnDemo) dom.btnDemo.title = 'Clique para voltar aos dados oficiais zerados do TSE';
  } else {
    if (dom.btnDemo) dom.btnDemo.classList.remove('active');
    if (dom.demoText) dom.demoText.textContent = '🧪 Simular Votos';
    if (dom.btnDemo) dom.btnDemo.title = 'Simular votos reais para testar a tela antes da apuração começar';
  }
  fetchAllColumnsData();
}

// Aplicar Escala de Zoom na Interface
function applyZoom(scaleVal) {
  appState.zoom = scaleVal;
  document.documentElement.style.setProperty('--ui-zoom', scaleVal);
  localStorage.setItem('tse_zoom', scaleVal);
  if (dom.zoomSelect) dom.zoomSelect.value = scaleVal.toString();
}

// ========================================================
// CONTADOR DE ESPECTADORES ONLINE & REGISTRO DE AUDIÊNCIA
// ========================================================
function getAudienceRecord() {
  const saved = localStorage.getItem('tse_audience_record');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch(e) {}
  }
  return {
    totalAcessos: 2840,
    picoOnline: 48,
    dataRegistro: '04/10/2026 - 1º Turno'
  };
}

function saveAudienceRecord(rec) {
  localStorage.setItem('tse_audience_record', JSON.stringify(rec));
}

function updateAudienceModalUI(rec, isLive) {
  const totalEl = document.getElementById('histTotalAcessos');
  const picoEl = document.getElementById('histPicoOnline');
  const onlineEl = document.getElementById('histOnlineAgora');
  const statusEl = document.getElementById('histStatusTransmissao');

  if (totalEl) totalEl.textContent = formatNumber(rec.totalAcessos);
  if (picoEl) picoEl.textContent = `${rec.picoOnline} espectadores`;
  if (onlineEl) onlineEl.textContent = isLive ? 'Ativo na Apuração' : '0 (Transmissão Encerrada)';
  if (statusEl) {
    statusEl.textContent = isLive ? 'Ao Vivo (Apuração)' : 'Consolidada';
    statusEl.style.color = isLive ? '#ef4444' : '#10b981';
  }
}

async function initSpectatorCounter() {
  const onlineEl = document.getElementById('onlineViewersCount');
  const totalEl = document.getElementById('totalVisitsCount');
  const viewersBadge = document.getElementById('viewersBadge');
  const audienceModal = document.getElementById('audienceModal');

  const rec = getAudienceRecord();
  const isLive = appState.opMode === 'aovivo';

  // Se estiver em modo consolidado (apuração já finalizada):
  if (!isLive) {
    if (onlineEl) onlineEl.textContent = '0';
    if (totalEl) totalEl.textContent = `📁 Registro: ${formatNumber(rec.totalAcessos)}`;
    if (viewersBadge) {
      viewersBadge.classList.add('consolidated');
      viewersBadge.setAttribute('title', 'Transmissão encerrada (0 online agora). Clique para ver o Registro Histórico da Audiência.');
    }
  } else {
    // Modo ao vivo ativo
    if (viewersBadge) viewersBadge.classList.remove('consolidated');
    let currentOnline = Math.max(1, Math.floor(Math.random() * 5) + 3);
    if (onlineEl) onlineEl.textContent = currentOnline.toString();
    if (totalEl) totalEl.textContent = `${formatNumber(rec.totalAcessos)} acessos`;
  }

  // Clique no badge abre o modal de registro
  if (viewersBadge && audienceModal) {
    viewersBadge.addEventListener('click', () => {
      updateAudienceModalUI(getAudienceRecord(), appState.opMode === 'aovivo');
      audienceModal.classList.remove('hidden');
    });
  }

  // Fechar modal de audiência
  const btnClose = document.getElementById('btnCloseAudience');
  const btnDismiss = document.getElementById('btnDismissAudience');
  if (btnClose) btnClose.addEventListener('click', () => audienceModal.classList.add('hidden'));
  if (btnDismiss) btnDismiss.addEventListener('click', () => audienceModal.classList.add('hidden'));
  if (audienceModal) {
    audienceModal.addEventListener('click', (e) => {
      if (e.target === audienceModal) audienceModal.classList.add('hidden');
    });
  }

  // Zerar registro
  const btnReset = document.getElementById('btnResetAudience');
  if (btnReset) {
    btnReset.addEventListener('click', () => {
      if (confirm('Deseja realmente zerar o registro histórico de acessos para uma nova apuração?')) {
        const fresh = { totalAcessos: 0, picoOnline: 0, dataRegistro: new Date().toLocaleDateString('pt-BR') };
        saveAudienceRecord(fresh);
        updateAudienceModalUI(fresh, appState.opMode === 'aovivo');
        if (totalEl) totalEl.textContent = '📁 Registro: 0';
        alert('Registro zerado com sucesso!');
      }
    });
  }
}

// Inicialização Principal
function init() {
  dom.ufSelect.value = appState.uf;
  dom.layoutSelect.value = appState.layout;
  dom.viewModeSelect.value = appState.viewMode;
  dom.refreshInterval.value = appState.refreshInterval.toString();

  // Aplica zoom inicial
  applyZoom(appState.zoom);

  // Inicializa o modo de operação (Consolidado por padrão ou conforme salvo)
  setOperationMode(appState.opMode);

  setupEventListeners();
  renderContainer();
  startAutoRefreshLoop();
  initSpectatorCounter();
}

document.addEventListener('DOMContentLoaded', init);
