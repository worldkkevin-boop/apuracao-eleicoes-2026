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
  isPaused: false,
  isDemoMode: false,
  activeMobileIndex: 0,
  countdown: 30,
  timerId: null
};

// Elementos do DOM
const dom = {
  ufSelect: document.getElementById('ufSelect'),
  layoutSelect: document.getElementById('layoutSelect'),
  viewModeSelect: document.getElementById('viewModeSelect'),
  refreshInterval: document.getElementById('refreshInterval'),
  zoomSelect: document.getElementById('zoomSelect'),
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
  btnDismissHelp: document.getElementById('btnDismissHelp')
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

      col.innerHTML = `
        <div class="col-header">
          <div class="col-header-top">
            <div class="col-title-group">
              <span class="col-cargo-tag">${cargoInfo.tag}</span>
              <span class="col-title">${cargoInfo.nome}</span>
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

        <div class="col-search-container">
          <input type="text" class="col-search-input" placeholder="🔍 Buscar nome ou número..." data-col-id="${colId}">
          <span class="col-cand-count" id="count-${colId}">0 cand.</span>
        </div>

        <div class="col-loading-overlay" id="loading-${colId}">
          <div class="spinner"></div>
          <span style="font-size:11px;color:var(--text-muted);">Consultando TSE...</span>
        </div>

        <div class="col-feed" id="feed-${colId}">
          <!-- Cards de candidatos injetados aqui -->
        </div>

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

// Configura botões de atualizar, busca e abas mobile
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
      secoesTotalizadasPerc = '82,64';
      const totalSecNum = parseInt(secoesTotalQtd, 10);
      secoesTotalizadasQtd = Math.round(totalSecNum * 0.8264).toString();

      totalValidos = 412850;
      totalBrancos = 12430;
      totalNulos = 18910;

      const simulatedShares = [47.85, 38.20, 7.45, 4.10, 1.40, 0.55, 0.30, 0.15];
      candidatos.forEach((cand, idx) => {
        let share = idx < simulatedShares.length ? simulatedShares[idx] : Math.max(0.01, (0.1 / (idx + 1)));
        cand.percNum = parseFloat(share.toFixed(2));
        cand.percStr = share.toFixed(2).replace('.', ',');
        cand.votos = Math.round((totalValidos * share) / 100);
        if (targetCargo === 3 || targetCargo === 1) { // Gov ou Pres
          cand.situacao = idx === 0 ? '2º Turno' : (idx === 1 ? '2º Turno' : 'Não eleito');
        } else if (targetCargo === 5) { // Senador
          cand.eleito = idx === 0;
        } else if (targetCargo === 6) { // Dep. Federal
          cand.eleito = idx < 8;
        } else if (targetCargo === 7 || targetCargo === 8) { // Dep. Estadual
          cand.eleito = idx < 24;
        }
      });
    }

    // 1. Atualizar Estatísticas de Apuração
    if (apuracaoVal) {
      apuracaoVal.textContent = `${secoesTotalizadasPerc}% (${formatNumber(secoesTotalizadasQtd)}/${formatNumber(secoesTotalQtd)})`;
    }
    if (apuracaoFill) {
      const cleanPerc = parseFloat(secoesTotalizadasPerc.replace(',', '.')) || 0;
      apuracaoFill.style.width = `${Math.min(100, cleanPerc)}%`;
    }

    // 2. Atualizar Rodapé (Votos)
    if (validosEl) validosEl.textContent = formatNumber(totalValidos);
    if (brancosEl) brancosEl.textContent = formatNumber(totalBrancos);
    if (nulosEl) nulosEl.textContent = formatNumber(totalNulos);

    // Ordenar pelo percentual de votos decrescente
    candidatos.sort((a, b) => b.percNum - a.percNum || b.votos - a.votos);

    if (countEl) countEl.textContent = `${candidatos.length} cand.`;

    // 4. Renderizar Cards no Feed
    if (feed) {
      feed.innerHTML = '';

      if (candidatos.length === 0) {
        feed.innerHTML = `
          <div style="text-align:center;padding:30px 10px;color:var(--text-muted);font-size:12px;">
            Nenhum candidato registrado para este cargo no estado ${appState.uf.toUpperCase()}.
          </div>
        `;
      } else {
        candidatos.forEach((cand, idx) => {
          const rank = idx + 1;
          const photoUrl = getCandPhotoUrl(eleicao, appState.uf, cand.sqcand);
          const initials = cand.nome.split(' ').map(n => n[0]).slice(0, 2).join('');

          let rankBadge = `${rank}º`;
          let rankClass = '';
          if (rank === 1) { rankBadge = '🥇 1º'; rankClass = 'medal-1'; }
          else if (rank === 2) { rankBadge = '🥈 2º'; rankClass = 'medal-2'; }
          else if (rank === 3) { rankBadge = '🥉 3º'; rankClass = 'medal-3'; }

          let statusBadge = '';
          if (cand.eleito) {
            statusBadge = '<span class="cand-status-badge eleito">ELEITO</span>';
          } else if (cand.situacao.toLowerCase().includes('2º turno') || cand.situacao.toLowerCase().includes('segundo turno')) {
            statusBadge = '<span class="cand-status-badge segundo-turno">2º TURNO</span>';
          }

          const card = document.createElement('div');
          card.className = `cand-card ${rank === 1 ? 'rank-1' : (rank === 2 ? 'rank-2' : (rank === 3 ? 'rank-3' : ''))}`;
          card.innerHTML = `
            <div class="cand-main-row">
              <span class="cand-rank ${rankClass}">${rankBadge}</span>
              <div class="cand-photo-wrapper">
                <img 
                  class="cand-photo" 
                  src="${photoUrl}" 
                  alt="${cand.nome}" 
                  loading="lazy"
                  onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
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

  appState.countdown = appState.refreshInterval;
  updateTimerUI();

  appState.timerId = setInterval(() => {
    if (appState.isPaused || appState.refreshInterval === 0) {
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

  // Atalhos de Teclado
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
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

// Inicialização Principal
function init() {
  dom.ufSelect.value = appState.uf;
  dom.layoutSelect.value = appState.layout;
  dom.viewModeSelect.value = appState.viewMode;
  dom.refreshInterval.value = appState.refreshInterval.toString();

  // Aplica zoom inicial
  applyZoom(appState.zoom);

  setupEventListeners();
  renderContainer();
  startAutoRefreshLoop();
}

document.addEventListener('DOMContentLoaded', init);
