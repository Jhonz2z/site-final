// Gerenciamento de usuário (não força login na visualização do site)
// Mantemos a informação do usuário em uma variável global para checagens específicas
window.usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado') || 'null');

// FUNÇÕES GLOBAIS DE MODAL
window.mostrarModal = function(mensagem, icone = 'fa-check-circle') {
  const modalCustom = document.createElement('div');
  modalCustom.className = 'modal-custom-overlay';
  modalCustom.innerHTML = `
    <div class="modal-custom-content">
      <div class="modal-custom-icon">
        <i class="fas ${icone}"></i>
      </div>
      <div class="modal-custom-body">${mensagem.replace(/\n/g, '<br>')}</div>
      <button class="modal-custom-btn" onclick="this.closest('.modal-custom-overlay').remove()">OK</button>
    </div>
  `;
  document.body.appendChild(modalCustom);
  
  modalCustom.addEventListener('click', (e) => {
    if (e.target === modalCustom) {
      modalCustom.remove();
    }
  });
};

window.mostrarConfirm = function(mensagem, callback) {
  return new Promise((resolve) => {
    const modalConfirm = document.createElement('div');
    modalConfirm.className = 'modal-confirm-overlay';
    modalConfirm.innerHTML = `
      <div class="modal-confirm-content">
        <div class="modal-confirm-icon warning">
          <i class="fas fa-question-circle"></i>
        </div>
        <div class="modal-confirm-body">${mensagem.replace(/\n/g, '<br>')}</div>
        <div class="modal-confirm-buttons">
          <button class="modal-confirm-btn cancel">Cancelar</button>
          <button class="modal-confirm-btn confirm">Confirmar</button>
        </div>
      </div>
    `;
    document.body.appendChild(modalConfirm);
    
    modalConfirm.querySelector('.cancel').addEventListener('click', () => {
      modalConfirm.remove();
      resolve(false);
      if (callback) callback(false);
    });
    
    modalConfirm.querySelector('.confirm').addEventListener('click', () => {
      modalConfirm.remove();
      resolve(true);
      if (callback) callback(true);
    });
    
    modalConfirm.addEventListener('click', (e) => {
      if (e.target === modalConfirm) {
        modalConfirm.remove();
        resolve(false);
        if (callback) callback(false);
      }
    });
  });
};

// CARREGAR SERVIÇOS (servicos.json)
// Detectar se estamos em pages/ ou na raiz
const isInPagesFolder = window.location.pathname.includes('/pages/');
const servicosPath = isInPagesFolder ? '../data/servicos.json' : 'data/servicos.json';

fetch(`${servicosPath}?v=${Date.now()}`)
  .then(res => res.json())
  .then(servicos => {
    renderServicos(servicos);
    configurarBuscaECategorias(servicos);
  })
  .catch(err => console.error('Erro ao carregar serviços:', err));

// Moeda REAL
const R$ = n => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

// CARRINHO DE COMPRAS
const carrinhoKey = 'carrinho';
let carrinho = JSON.parse(localStorage.getItem(carrinhoKey) || '[]');

function salvarCarrinho() {
  localStorage.setItem(carrinhoKey, JSON.stringify(carrinho));
  atualizarContadorCarrinho();
  
  // Atualizar também o contador do sidebar
  const sidebarCartCount = document.getElementById('sidebar-cart-count');
  if (sidebarCartCount) {
    sidebarCartCount.textContent = carrinho.length;
  }
}

function adicionarAoCarrinho(servico) {
  const itemExistente = carrinho.find(item => item.id === servico.id);
  
  if (itemExistente) {
    itemExistente.quantidade = (itemExistente.quantidade || 1) + 1;
  } else {
    carrinho.push({ ...servico, quantidade: 1 });
  }
  
  salvarCarrinho();
  mostrarNotificacao(`${servico.nome} adicionado ao carrinho!`);
  
  // Abrir o carrinho automaticamente
  setTimeout(() => {
    toggleCarrinho();
  }, 500);
}

function removerDoCarrinho(servicoId) {
  carrinho = carrinho.filter(item => item.id !== servicoId);
  salvarCarrinho();
  renderCarrinho();
}

function atualizarQuantidade(servicoId, novaQuantidade) {
  const item = carrinho.find(item => item.id === servicoId);
  if (item) {
    item.quantidade = Math.max(1, novaQuantidade);
    salvarCarrinho();
    renderCarrinho();
  }
}

function calcularTotal() {
  return carrinho.reduce((total, item) => total + (item.preco * item.quantidade), 0);
}

function atualizarContadorCarrinho() {
  const contador = document.getElementById('cart-count');
  if (contador) {
    const totalItens = carrinho.reduce((sum, item) => sum + item.quantidade, 0);
    contador.textContent = totalItens;
    contador.style.display = totalItens > 0 ? 'flex' : 'none';
  }
}

function mostrarNotificacao(mensagem) {
  // Criar elemento de notificação
  const notif = document.createElement('div');
  notif.className = 'cart-notification';
  notif.textContent = mensagem;
  document.body.appendChild(notif);
  
  // Animar entrada
  setTimeout(() => notif.classList.add('show'), 10);
  
  // Remover após 3 segundos
  setTimeout(() => {
    notif.classList.remove('show');
    setTimeout(() => notif.remove(), 300);
  }, 3000);
}

function renderCarrinho() {
  const modal = document.getElementById('modal-carrinho');
  if (!modal) return;
  
  const listaCarrinho = document.getElementById('lista-carrinho');
  const totalCarrinho = document.getElementById('total-carrinho');
  
  if (!carrinho.length) {
    listaCarrinho.innerHTML = '<p style="text-align:center;color:#999;padding:20px;">Seu carrinho está vazio</p>';
    totalCarrinho.textContent = R$(0);
    return;
  }
  
  listaCarrinho.innerHTML = carrinho.map(item => `
    <div class="cart-item">
      <img src="${item.imagem}" alt="${item.nome}" class="cart-item-img">
      <div class="cart-item-info">
        <strong>${item.nome}</strong>
        <div class="cart-item-price">${R$(item.preco)} × ${item.quantidade}</div>
      </div>
      <div class="cart-item-actions">
        <button class="btn-qty" onclick="atualizarQuantidade('${item.id}', ${item.quantidade - 1})">-</button>
        <span>${item.quantidade}</span>
        <button class="btn-qty" onclick="atualizarQuantidade('${item.id}', ${item.quantidade + 1})">+</button>
        <button class="btn-remove" onclick="removerDoCarrinho('${item.id}')"><i class="fas fa-trash"></i></button>
      </div>
    </div>
  `).join('');
  
  totalCarrinho.textContent = R$(calcularTotal());
}

function toggleCarrinho() {
  const modal = document.getElementById('modal-carrinho');
  if (modal) {
    modal.classList.toggle('show');
    if (modal.classList.contains('show')) {
      renderCarrinho();
    }
  }
}

function finalizarCompra() {
  if (!carrinho.length) {
    mostrarModalMensagem('Seu carrinho está vazio!');
    return;
  }
  
  // Verificar se estamos em pages/ ou na raiz
  const isInPagesFolder = window.location.pathname.includes('/pages/');
  const pagamentoUrl = isInPagesFolder ? 'pagamento.html' : 'pages/pagamento.html';
  
  // Redirecionar para página de pagamento
  window.location.href = pagamentoUrl;
}

function mostrarModalMensagem(mensagem) {
  // Verificar se o modal do Bootstrap existe (index.html)
  const modalElement = document.getElementById('modalMensagem');
  if (modalElement && typeof bootstrap !== 'undefined') {
    const modalTexto = document.getElementById('modalTexto');
    if (modalTexto) {
      modalTexto.innerText = mensagem;
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
      return;
    }
  }
  
  // Criar modal customizado se Bootstrap não estiver disponível
  const modalCustom = document.createElement('div');
  modalCustom.className = 'modal-custom-overlay';
  modalCustom.innerHTML = `
    <div class="modal-custom-content">
      <div class="modal-custom-body">${mensagem.replace(/\n/g, '<br>')}</div>
      <button class="modal-custom-btn" onclick="this.closest('.modal-custom-overlay').remove()">OK</button>
    </div>
  `;
  document.body.appendChild(modalCustom);
  
  // Auto-remover ao clicar fora
  modalCustom.addEventListener('click', (e) => {
    if (e.target === modalCustom) {
      modalCustom.remove();
    }
  });
}

// Função para mostrar modal de confirmação
function mostrarConfirm(mensagem, callback) {
  const modalCustom = document.createElement('div');
  modalCustom.className = 'modal-custom-overlay';
  modalCustom.innerHTML = `
    <div class="modal-custom-content">
      <div class="modal-custom-body">${mensagem.replace(/\n/g, '<br>')}</div>
      <div style="display: flex; gap: 10px; justify-content: center;">
        <button class="modal-custom-btn" style="background: #666;" onclick="this.closest('.modal-custom-overlay').remove(); (${callback})(false);">Cancelar</button>
        <button class="modal-custom-btn" onclick="this.closest('.modal-custom-overlay').remove(); (${callback})(true);">Confirmar</button>
      </div>
    </div>
  `;
  
  // Armazenar callback globalmente
  const callbackId = 'callback_' + Date.now();
  window[callbackId] = callback;
  
  modalCustom.innerHTML = `
    <div class="modal-custom-content">
      <div class="modal-custom-body">${mensagem.replace(/\n/g, '<br>')}</div>
      <div style="display: flex; gap: 10px; justify-content: center;">
        <button class="modal-custom-btn" style="background: #666;" onclick="window['${callbackId}'](false); this.closest('.modal-custom-overlay').remove(); delete window['${callbackId}'];">Cancelar</button>
        <button class="modal-custom-btn" onclick="window['${callbackId}'](true); this.closest('.modal-custom-overlay').remove(); delete window['${callbackId}'];">Confirmar</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modalCustom);
}

// Inicializar contador ao carregar página
document.addEventListener('DOMContentLoaded', atualizarContadorCarrinho);


// RENDERIZAÇÃO DOS SERVIÇOS
const grid = document.getElementById('prod-grid');

function cardServico(s) {
  const el = document.createElement('article');
  el.className = 'card col-3 fade-in';
  el.dataset.nome = s.nome.toLowerCase();
  el.dataset.categoria = s.categoria;

  el.innerHTML = `
    <div class="card-content">

      ${s.imagem ? `<img src="${s.imagem}" class="servico-img">` : ''}

      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:10px;">
        <strong>${s.nome}</strong>
        ${s.duracao ? `<span class="pill">${s.duracao}</span>` : ''}
      </div>

      ${s.descricao ? `<p class="note">${s.descricao}</p>` : ''}

      <div style="margin:10px 0;font-size:14px;color:#555;">
        Categoria: ${s.categoria}
      </div>

      <div class="price">${R$(s.preco)}</div>

      <div class="actions" style="display:flex;gap:8px;">
        <button class="btn" style="background:#ec4899;color:white;flex:1;" onclick='scheduleService("${s.id}")'>
          Agendar
        </button>
        <button class="btn btn-comprar" style="background:#10b981;color:white;flex:1;" onclick='adicionarAoCarrinho(${JSON.stringify(s)})'>
          <i class="fas fa-shopping-cart"></i> Comprar
        </button>
      </div>
    </div>
  `;
  return el;
}

function renderServicos(list) {
  grid.innerHTML = '';
  list.forEach(s => grid.appendChild(cardServico(s)));
}

// BUSCA + FILTROS DE CATEGORIA
function configurarBuscaECategorias(servicos) {
  const busca = document.getElementById('busca');
  const botoesCategorias = document.getElementById('botoes-categorias');
  let filtroCategoria = 'todos';

  function aplicarFiltros() {
    const q = (busca.value || '').toLowerCase();
    const filtrados = servicos.filter(s => {
      const nome = (s.nome || '').toLowerCase();
      const categoria = (s.categoria || '').toLowerCase();
      const matchTexto = nome.includes(q);
      const matchCat = filtroCategoria === 'todos' || categoria === filtroCategoria;
      return matchTexto && matchCat;
    });
    renderServicos(filtrados);
  }

  busca.addEventListener('input', aplicarFiltros);

  botoesCategorias.addEventListener('click', e => {
    if (e.target.matches('[data-cat]')) {
      filtroCategoria = (e.target.dataset.cat || '').toLowerCase();
      aplicarFiltros();
    }
  });
}

// BOTÃO "AGENDAR" DO CARD → SCROLL PARA FORM
function scheduleService(serviceId) {
  const path = window.location.pathname.toLowerCase();
  const onIndex =
    path.endsWith('/index.html') ||
    path.endsWith('/index.htm') ||
    path === '/' ||
    path === '' ||
    path.includes('/index');

  if (!onIndex) {
    window.location.href = `index.html#agendamento?servico=${encodeURIComponent(serviceId)}`;
    return;
  }

  document.getElementById('agendamento').scrollIntoView({ behavior: 'smooth' });
  const select = document.getElementById('tipo-servico');
  if (select) select.value = serviceId;
}

// Pré-seleção quando vem do card OU de pagamento
document.addEventListener('DOMContentLoaded', function () {
  const hash = window.location.hash;

  // Verificar se vem de pagamento com serviços comprados
  const servicosParaAgendar = localStorage.getItem('servicosParaAgendar');
  
  if (servicosParaAgendar && hash === '#agendamento') {
    const servicos = JSON.parse(servicosParaAgendar);
    const select = document.getElementById('tipo-servico');
    
    if (select && servicos.length > 0) {
      // Mostrar mensagem de sucesso
      setTimeout(() => {
        if (typeof mostrarModal === 'function') {
          mostrarModal('Pagamento realizado com sucesso!\n\nAgora você pode agendar seu horário para o serviço.', 'fa-check-circle');
        }
      }, 500);
      
      // Aguardar um pouco para garantir que a página carregou
      setTimeout(() => {
        // Pré-selecionar o primeiro serviço comprado
        const primeiroServico = servicos[0];
        
        // Mapear nome do serviço para o value do select
        const servicoValue = mapearServicoParaSelect(primeiroServico.nome);
        
        if (servicoValue) {
          select.value = servicoValue;
          console.log('✅ Serviço pré-selecionado após pagamento:', primeiroServico.nome, '→', servicoValue);
        } else {
          console.warn('⚠️ Não foi possível mapear o serviço:', primeiroServico.nome);
        }
        
        // Scroll suave para o formulário de agendamento
        const agendamentoSection = document.getElementById('agendamento');
        if (agendamentoSection) {
          agendamentoSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        
        // Focar no próximo campo (data)
        setTimeout(() => {
          const dataInput = document.getElementById('data');
          if (dataInput) dataInput.focus();
        }, 500);
        
        // Limpar depois de usar
        localStorage.removeItem('servicosParaAgendar');
      }, 800);
    }
  }
  // Verificar se vem de um card específico
  else if (hash && hash.startsWith('#agendamento?servico=')) {
    const servicoId = decodeURIComponent(hash.split('=')[1] || '');
    const select = document.getElementById('tipo-servico');

    if (select && servicoId) {
      select.value = servicoId;
      document.getElementById('agendamento')?.scrollIntoView({ behavior: 'smooth' });
    }
  }
});

// Função auxiliar para mapear nome do serviço para o value do select
function mapearServicoParaSelect(nomeServico) {
  const mapeamento = {
    // Serviços do formulário
    'Corte de Cabelo': 'corte',
    'Corte Feminino': 'corte',
    'Corte Masculino': 'corte',
    'Manicure': 'manicure',
    'Pedicure': 'manicure',
    'Manicure & Pedicure': 'manicure',
    'Escova': 'escova',
    'Escova e Penteado': 'escova',
    'Progressiva': 'progressiva',
    'Maquiagem': 'maquiagem',
    'Maquiagem Social': 'maquiagem',
    'Maquiagem Profissional': 'maquiagem',
    'Tratamento Capilar': 'tratamento',
    'Hidratação Capilar': 'tratamento',
    'Depilação': 'depilacao',
    'Depilação Completa': 'depilacao',
    'Unhas em Gel': 'unhasgel',
    'Alongamento de Unhas em Gel': 'unhasgel',
    'Design de Sobrancelhas': 'estetica',
    'Limpeza de Pele': 'estetica'
  };
  
  // Buscar correspondência exata primeiro
  if (mapeamento[nomeServico]) {
    return mapeamento[nomeServico];
  }
  
  // Buscar correspondência (case insensitive)
  for (const [key, value] of Object.entries(mapeamento)) {
    if (nomeServico.toLowerCase().includes(key.toLowerCase()) || 
        key.toLowerCase().includes(nomeServico.toLowerCase())) {
      return value;
    }
  }
  
  return null;
}


// LOCALSTORAGE: AGENDAMENTOS
const agendaKey = 'agendamentos';
let agendamentos = JSON.parse(localStorage.getItem(agendaKey) || '[]');

function salvarAgendamentos() {
  localStorage.setItem(agendaKey, JSON.stringify(agendamentos));
}

// FORMULÁRIO DE AGENDAMENTO
const form = document.getElementById('form-agendamento');

if (form) {
  form.addEventListener('submit', e => {
    e.preventDefault();

    const servico = document.getElementById('tipo-servico').value;
    const nome = document.getElementById('nome').value.trim();
    const email = document.getElementById('email').value.trim();
    const data = document.getElementById('data').value;
    const hora = document.getElementById('hora').value;
    const telefone = document.getElementById('telefone').value.trim();
    const detalhes = document.getElementById('detalhes').value.trim();

    if (!servico || !nome || !email || !data || !hora) {
      mostrarMensagem("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    const novo = {
      id: crypto.randomUUID(),
      servico,
      nome,
      email,
      telefone,
      data,
      hora,
      detalhes
    };

    agendamentos.push(novo);
    salvarAgendamentos();
    renderAgendamentos();
    form.reset();

    mostrarMensagem("Agendamento realizado com sucesso!");
  });
}

// RENDERIZAR LISTA DE AGENDAMENTOS
function renderAgendamentos() {
  const lista = document.getElementById('lista-agendamentos');
  if (!lista) return;

  if (!agendamentos.length) {
    lista.textContent = 'Nenhum agendamento ainda.';
    return;
  }

  lista.innerHTML = agendamentos.map(a => `
    <div class="pill" style="display:block;margin-bottom:8px;">
      <strong>${a.data}</strong> • ${a.hora} — ${a.servico}<br>
      <span class="note">${a.nome} — ${a.email}</span>
    </div>
  `).join('');
}

renderAgendamentos();



// MODAL → MENSAGEM & CONFIRMAÇÃO
document.addEventListener('DOMContentLoaded', function () {
  const btnLimpar = document.getElementById('btn-limpar-ag');

  const modalMensagem = new bootstrap.Modal(document.getElementById('modalMensagem'));
  const modalConfirmar = new bootstrap.Modal(document.getElementById('modalConfirmar'));

  const modalTexto = document.getElementById('modalTexto');
  const modalConfirmarTexto = document.getElementById('modalConfirmarTexto');
  const btnConfirmarSim = document.getElementById('btnConfirmarSim');

  // Função de exibir modal de mensagem
  function mostrarMensagem(msg) {
    modalTexto.innerText = msg;
    modalMensagem.show();
  }

  if (btnLimpar) {
    btnLimpar.addEventListener('click', function (e) {
      e.preventDefault();

      if (!agendamentos.length) {
        mostrarMensagem("Não há agendamentos para limpar.");
        return;
      }

      modalConfirmarTexto.innerText = "Deseja realmente limpar todos os agendamentos?";
      modalConfirmar.show();

      btnConfirmarSim.onclick = function () {
        agendamentos = [];
        salvarAgendamentos();
        renderAgendamentos();
        modalConfirmar.hide();
        mostrarMensagem("Agendamentos foram limpos com sucesso!");
      };
    });
  }
});
