// Proteção de rota (login obrigatório)
let usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado') || 'null');
if (!usuarioLogado) {
  window.location.href = 'login.html';
}

// Carregar serviços (a partir de servicos.json)
fetch('servicos.json')
  .then(res => res.json())
  .then(servicos => {
    renderServicos(servicos);
    configurarBuscaECategorias(servicos);
  })
  .catch(err => console.error('Erro ao carregar serviços:', err));

// Utilitário para formatar valores 
const R$ = n => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

// Renderizar cartões de serviços 
const grid = document.getElementById('prod-grid');

function cardServico(s) {
  const el = document.createElement('article');
  el.className = 'card col-3 fade-in';
  el.dataset.nome = s.nome.toLowerCase();
  el.dataset.categoria = s.categoria;

  el.innerHTML = `
    <div class="card-content">
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <strong>${s.nome}</strong>
        ${s.duracao ? `<span class="pill">${s.duracao}</span>` : ''}
      </div>
      ${s.descricao ? `<p class="note">${s.descricao}</p>` : ''}
      <div style="margin:10px 0;font-size:14px;color:#555;">Categoria: ${s.categoria}</div>
      <div class="price">${R$(s.preco)}</div>
      <div class="actions" style="margin-top:10px;">
        <button class="btn" style="background:#ec4899;color:white;" onclick='scheduleService("${s.id}")'>
          Agendar
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

// Filtro e busca 
function configurarBuscaECategorias(servicos) {
  const busca = document.getElementById('busca');
  const botoesCategorias = document.getElementById('botoes-categorias');
  let filtroCategoria = 'todos';

  function aplicarFiltros() {
    const q = (busca.value || '').toLowerCase();
    const filtrados = servicos.filter(s => {
      const matchTexto = s.nome.toLowerCase().includes(q);
      const matchCat = filtroCategoria === 'todos' || s.categoria === filtroCategoria;
      return matchTexto && matchCat;
    });
    renderServicos(filtrados);
  }

  busca.addEventListener('input', aplicarFiltros);
  botoesCategorias.addEventListener('click', e => {
    if (e.target.matches('[data-cat]')) {
      filtroCategoria = e.target.dataset.cat;
      aplicarFiltros();
    }
  });
}

// Agendar: rola até o formulário e pré-seleciona 
function scheduleService(serviceId) {
  const path = window.location.pathname.toLowerCase();
  const onIndex = path.endsWith('/index.html') || path.endsWith('/index.htm') || path === '/' || path === '' || path.includes('/index');
  if (!onIndex) {

    window.location.href = `Index.html#agendamento?servico=${encodeURIComponent(serviceId)}`;
    return;
  }

  document.getElementById('agendamento').scrollIntoView({ behavior: 'smooth' });
  const select = document.getElementById('tipo-servico');
  if (select) select.value = serviceId;
}
// Header: ir para agendamento 
const btnAgendamento = document.getElementById('btn-agendamento');
if (btnAgendamento) btnAgendamento.addEventListener('click', () => {
  const path = window.location.pathname.toLowerCase();
  const onIndex = path.endsWith('/index.html') || path.endsWith('/index.htm') || path === '/' || path === '' || path.includes('/index');
  if (!onIndex) {
    window.location.href = 'Index.html#agendamento';
    return;
  }
  const alvo = document.getElementById('agendamento');
  if (alvo) alvo.scrollIntoView({ behavior: 'smooth' });
});

document.addEventListener('DOMContentLoaded', function() {
  const hash = window.location.hash;
  if (hash && hash.startsWith('#agendamento?servico=')) {
    const servicoId = decodeURIComponent(hash.split('=')[1] || '');
    const select = document.getElementById('tipo-servico');
    if (select && servicoId) {
      select.value = servicoId;
      const agendamento = document.getElementById('agendamento');
      if (agendamento) agendamento.scrollIntoView({ behavior: 'smooth' });
    }
  }
});


// Header: ir para serviços 
const btnServicos = document.getElementById('btn-servicos');
if (btnServicos) btnServicos.addEventListener('click', (e) => {
  window.location.href = 'servicos.html';
});

// Header: ir para início (Index.html)
const btnInicio = document.getElementById('btn-inicio');
if (btnInicio) btnInicio.addEventListener('click', () => {
  window.location.href = 'Index.html';
});

// Header: ir para agendamento (Index.html#agendamento)
const btnAgendamento2 = document.getElementById('btn-agendamento');
if (btnAgendamento2) btnAgendamento2.addEventListener('click', () => {
  window.location.href = 'Index.html#agendamento';
});

// Agendamentos no localStorage 
const agendaKey = 'agendamentos';
let agendamentos = JSON.parse(localStorage.getItem(agendaKey) || '[]');
function salvarAgendamentos() {
  localStorage.setItem(agendaKey, JSON.stringify(agendamentos));
}

// Envio do formulário de agendamento 
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
      alert('Por favor, preencha todos os campos obrigatórios.');
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
    alert('Agendamento realizado com sucesso!');
  });
}

// Exibir agendamentos
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

// Botão: limpar agendamentos 
document.addEventListener('DOMContentLoaded', function() {
  const btnLimpar = document.getElementById('btn-limpar-ag');
  if (btnLimpar) {
    btnLimpar.addEventListener('click', function(e) {
      e.preventDefault();
      if (!agendamentos.length) {
        alert('Não há agendamentos para limpar.');
        return;
      }
      if (confirm('Deseja realmente limpar todos os agendamentos?')) {
        agendamentos = [];
        salvarAgendamentos();
        renderAgendamentos();
        alert('Agendamentos foram limpos com sucesso!');
      }
    });
  }
});

// Botões de perfil 
const btnPerfil = document.getElementById('btn-perfil');
if (btnPerfil) btnPerfil.addEventListener('click', () => {
  const perfilEl = document.getElementById('perfil');
  if (perfilEl) perfilEl.scrollIntoView({ behavior: 'smooth' });
});


// Logout 
const btnSair = document.getElementById('btn-sair');
if (btnSair) btnSair.addEventListener('click', () => {
  localStorage.removeItem('usuarioLogado');
  window.location.href = 'login.html';
});

// Atualizar footer com o ano 
const ano = document.getElementById('ano');
if (ano) ano.textContent = new Date().getFullYear();
