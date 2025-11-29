// PERFIL.JS - Gerenciamento do perfil do usuário

// Funções globais de modal
window.mostrarModal = window.mostrarModal || function(mensagem, icone = 'fa-check-circle') {
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

window.mostrarConfirm = window.mostrarConfirm || function(mensagem, callback) {
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

// Carregar dados do usuário ao iniciar
document.addEventListener('DOMContentLoaded', () => {
  carregarPerfilUsuario();
  carregarCompras();
  carregarAgendamentos();
  configurarAbas();
});


// Configurar navegação das abas
function configurarAbas() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabName = btn.getAttribute('data-tab');

      // Remover active de todos
      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));

      // Adicionar active no clicado
      btn.classList.add('active');
      document.getElementById(`tab-${tabName}`).classList.add('active');
    });
  });
}

// Carregar informações do perfil
function carregarPerfilUsuario() {
  const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado') || '{}');
  
  if (!usuarioLogado.nome) {
    // Se não houver usuário logado, redirecionar para login
    window.location.href = 'Login.html';
    return;
  }

  // Exibir informações do usuário na página
  document.getElementById('perfil-nome').textContent = usuarioLogado.nome;
  document.getElementById('perfil-email').textContent = usuarioLogado.email;
}

// Editar perfil
function editarPerfil() {
  const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado') || '{}');
  
  document.getElementById('edit-nome').value = usuarioLogado.nome || '';
  document.getElementById('edit-email').value = usuarioLogado.email || '';
  document.getElementById('edit-telefone').value = usuarioLogado.telefone || '';

  const modal = new bootstrap.Modal(document.getElementById('modalEditarPerfil'));
  modal.show();
}

// Salvar alterações do perfil
function salvarPerfil() {
  const nome = document.getElementById('edit-nome').value;
  const email = document.getElementById('edit-email').value;
  const telefone = document.getElementById('edit-telefone').value;

  if (!nome || !email) {
    mostrarModal('Por favor, preencha nome e e-mail', 'fa-exclamation-circle');
    return;
  }

  // Atualizar usuário logado
  const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado') || '{}');
  usuarioLogado.nome = nome;
  usuarioLogado.email = email;
  usuarioLogado.telefone = telefone;
  
  localStorage.setItem('usuarioLogado', JSON.stringify(usuarioLogado));
  
  // Atualizar também na lista de usuários
  const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
  const index = usuarios.findIndex(u => u.email === usuarioLogado.email);
  if (index !== -1) {
    usuarios[index] = { ...usuarios[index], nome, email, telefone };
    localStorage.setItem('usuarios', JSON.stringify(usuarios));
  }
  
  // Atualizar na tela
  document.getElementById('perfil-nome').textContent = nome;
  document.getElementById('perfil-email').textContent = email;

  // Fechar modal
  const modal = bootstrap.Modal.getInstance(document.getElementById('modalEditarPerfil'));
  modal.hide();

  mostrarModal('Perfil atualizado com sucesso!', 'fa-check-circle');
}

// Carregar histórico de compras
function carregarCompras() {
  const compras = JSON.parse(localStorage.getItem('historicoCompras') || '[]');
  const listaCompras = document.getElementById('lista-compras');

  if (compras.length === 0) {
    listaCompras.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-shopping-bag"></i>
        <h3>Nenhuma compra realizada</h3>
        <p>Suas compras aparecerão aqui após a finalização</p>
      </div>
    `;
    return;
  }

  // Ordenar por data (mais recente primeiro)
  compras.sort((a, b) => new Date(b.data) - new Date(a.data));

  listaCompras.innerHTML = compras.map((compra, index) => {
    const total = compra.itens.reduce((sum, item) => sum + item.preco, 0);
    const statusClass = compra.status === 'aprovado' ? 'status-aprovado' : 
                        compra.status === 'pendente' ? 'status-pendente' : 'status-cancelado';
    const statusTexto = compra.status === 'aprovado' ? 'Aprovado' : 
                        compra.status === 'pendente' ? 'Pendente' : 'Cancelado';

    return `
      <div class="compra-card" data-index="${index}">
        <div class="compra-header">
          <div class="compra-id">
            <i class="fas fa-hashtag"></i> Pedido #${compra.id || 'N/A'}
          </div>
          <span class="compra-status ${statusClass}">${statusTexto}</span>
        </div>
        
        <div class="compra-info">
          <div class="info-linha">
            <i class="fas fa-calendar"></i>
            <span><strong>Data:</strong> ${formatarData(compra.data)}</span>
          </div>
          <div class="info-linha">
            <i class="fas fa-credit-card"></i>
            <span><strong>Pagamento:</strong> ${compra.metodoPagamento || 'Não informado'}</span>
          </div>
          <div class="info-linha">
            <i class="fas fa-box"></i>
            <span><strong>Itens:</strong> ${compra.itens.length} serviço(s)</span>
          </div>
        </div>

        <div class="compra-itens">
          <h4><i class="fas fa-list"></i> Serviços:</h4>
          ${compra.itens.map(item => `
            <div class="item-servico">
              <span>${item.nome}</span>
              <strong>R$ ${item.preco.toFixed(2)}</strong>
            </div>
          `).join('')}
        </div>

        <div class="compra-total">
          <span>Total:</span>
          <span>R$ ${total.toFixed(2)}</span>
        </div>

        <button class="btn-ver-detalhes" onclick="verDetalhesCompra(${index})">
          <i class="fas fa-eye"></i> Ver Detalhes
        </button>
      </div>
    `;
  }).join('');
}

// Ver detalhes da compra
function verDetalhesCompra(index) {
  const compras = JSON.parse(localStorage.getItem('historicoCompras') || '[]');
  const compra = compras[index];

  if (!compra) return;

  const total = compra.itens.reduce((sum, item) => sum + item.preco, 0);
  const statusClass = compra.status === 'aprovado' ? 'status-aprovado' : 
                      compra.status === 'pendente' ? 'status-pendente' : 'status-cancelado';
  const statusTexto = compra.status === 'aprovado' ? 'Aprovado' : 
                      compra.status === 'pendente' ? 'Pendente' : 'Cancelado';

  const detalhesBody = document.getElementById('detalhes-compra-body');
  detalhesBody.innerHTML = `
    <div style="padding: 20px;">
      <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
        <div>
          <h4 style="margin: 0 0 10px 0;">Pedido #${compra.id || 'N/A'}</h4>
          <p style="color: #666; margin: 0;">Data: ${formatarData(compra.data)}</p>
        </div>
        <span class="compra-status ${statusClass}">${statusTexto}</span>
      </div>

      <hr>

      <h5 style="margin: 20px 0 15px 0;">Serviços Adquiridos:</h5>
      <div style="background: #f9f9f9; padding: 15px; border-radius: 10px;">
        ${compra.itens.map(item => `
          <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e0e0e0;">
            <div>
              <strong>${item.nome}</strong>
              <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">${item.descricao || ''}</p>
            </div>
            <strong style="color: #e66ba6;">R$ ${item.preco.toFixed(2)}</strong>
          </div>
        `).join('')}
      </div>

      <div style="margin-top: 20px; padding: 20px; background: linear-gradient(135deg, #f8c6da 0%, #e66ba6 100%); border-radius: 10px; color: white;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 18px; font-weight: 600;">Total Pago:</span>
          <span style="font-size: 24px; font-weight: 700;">R$ ${total.toFixed(2)}</span>
        </div>
      </div>

      <div style="margin-top: 20px; padding: 15px; background: #f0f0f0; border-radius: 10px;">
        <p style="margin: 0;"><strong>Método de Pagamento:</strong> ${compra.metodoPagamento || 'Não informado'}</p>
        ${compra.transacaoId ? `<p style="margin: 10px 0 0 0;"><strong>ID da Transação:</strong> ${compra.transacaoId}</p>` : ''}
      </div>
    </div>
  `;

  const modal = new bootstrap.Modal(document.getElementById('modalDetalhesCompra'));
  modal.show();
}

// Carregar agendamentos
function carregarAgendamentos() {
  const agendamentos = JSON.parse(localStorage.getItem('agendamentos') || '[]');
  const listaAgendamentos = document.getElementById('lista-agendamentos-perfil');

  if (agendamentos.length === 0) {
    listaAgendamentos.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-calendar-times"></i>
        <h3>Nenhum agendamento encontrado</h3>
        <p>Agende um horário para aparecer aqui</p>
      </div>
    `;
    return;
  }

  // Ordenar por data (mais recente primeiro)
  agendamentos.sort((a, b) => new Date(b.data + ' ' + b.hora) - new Date(a.data + ' ' + a.hora));

  listaAgendamentos.innerHTML = agendamentos.map((ag, index) => {
    const dataAgendamento = new Date(ag.data + ' ' + ag.hora);
    const agora = new Date();
    const isPast = dataAgendamento < agora;

    return `
      <div class="agendamento-card ${isPast ? 'past-appointment' : ''}">
        <div class="agendamento-header">
          <div class="agendamento-servico">
            <i class="fas fa-cut"></i> ${ag.servico}
          </div>
        </div>
        
        <div class="agendamento-info">
          <div class="info-linha">
            <i class="fas fa-calendar"></i>
            <span><strong>Data:</strong> ${formatarData(ag.data)}</span>
          </div>
          <div class="info-linha">
            <i class="fas fa-clock"></i>
            <span><strong>Horário:</strong> ${ag.hora}</span>
          </div>
          <div class="info-linha">
            <i class="fas fa-user"></i>
            <span><strong>Nome:</strong> ${ag.nome}</span>
          </div>
          <div class="info-linha">
            <i class="fas fa-envelope"></i>
            <span><strong>E-mail:</strong> ${ag.email}</span>
          </div>
          <div class="info-linha">
            <i class="fas fa-phone"></i>
            <span><strong>Telefone:</strong> ${ag.telefone}</span>
          </div>
          ${ag.detalhes ? `
            <div class="info-linha">
              <i class="fas fa-comment"></i>
              <span><strong>Observações:</strong> ${ag.detalhes}</span>
            </div>
          ` : ''}
        </div>

        ${!isPast ? `
          <div class="agendamento-actions">
            <button class="btn-reagendar" onclick="reagendar(${index})">
              <i class="fas fa-edit"></i> Reagendar
            </button>
            <button class="btn-cancelar" onclick="cancelarAgendamento(${index})">
              <i class="fas fa-times"></i> Cancelar
            </button>
          </div>
        ` : '<p style="text-align: center; color: #999; margin-top: 15px; font-style: italic;">Agendamento realizado</p>'}
      </div>
    `;
  }).join('');
}

// Reagendar
function reagendar(index) {
  // Redirecionar para página inicial com foco no agendamento
  localStorage.setItem('reagendarIndex', index);
  window.location.href = 'index.html#agendamento';
}

// Cancelar agendamento
function cancelarAgendamento(index) {
  mostrarConfirm('Tem certeza que deseja cancelar este agendamento?', (confirmed) => {
    if (!confirmed) return;

    const agendamentos = JSON.parse(localStorage.getItem('agendamentos') || '[]');
    agendamentos.splice(index, 1);
    localStorage.setItem('agendamentos', JSON.stringify(agendamentos));

    mostrarModal('Agendamento cancelado com sucesso!', 'fa-check-circle');
    carregarAgendamentos();
  });
}

// Formatar data
function formatarData(data) {
  if (!data) return 'Data não informada';
  
  const partes = data.split('-');
  if (partes.length === 3) {
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  }
  return data;
  return data;
  return data;
}
