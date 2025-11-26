// ===================================
// FUNÇÕES GLOBAIS
// ===================================

// Copiar código PIX
window.copiarCodigoPix = function() {
  const codigo = document.getElementById('pix-code').textContent;
  navigator.clipboard.writeText(codigo).then(() => {
    console.log('✓ Código PIX copiado com sucesso!');
  }).catch(err => {
    console.error('Erro ao copiar:', err);
    // Fallback para navegadores antigos
    const textarea = document.createElement('textarea');
    textarea.value = codigo;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    console.log('✓ Código PIX copiado com sucesso!');
  });
};

// Confirmar pagamento PIX e redirecionar para agendamento
window.confirmarPagamentoPix = function() {
  console.log('💰 Cliente confirmou pagamento PIX');
  
  // Obter carrinho para salvar serviços comprados
  const carrinho = JSON.parse(localStorage.getItem('carrinho') || '[]');
  
  // Mostrar modal de redirecionamento
  const modal = document.getElementById('modal-sucesso');
  const nomeCliente = document.getElementById('cliente-nome');
  const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado') || 'null');
  
  if (modal && nomeCliente) {
    nomeCliente.textContent = usuarioLogado ? usuarioLogado.nome : 'Cliente';
    
    // Customizar modal
    const modalTitle = modal.querySelector('h2');
    const modalText = modal.querySelector('p');
    const modalBtn = modal.querySelector('.modal-custom-btn');
    
    if (modalTitle) modalTitle.textContent = 'Pagamento Recebido!';
    if (modalText) modalText.innerHTML = '<p style="font-size:1.1rem;">Redirecionando para o agendamento...</p>';
    if (modalBtn) {
      modalBtn.textContent = 'Ir para Agendamento';
      modalBtn.onclick = function() {
        // Salvar serviços comprados para pré-preencher agendamento
        const servicosComprados = carrinho.map(item => ({
          id: item.id,
          nome: item.nome,
          preco: item.preco
        }));
        localStorage.setItem('servicosParaAgendar', JSON.stringify(servicosComprados));
        
        // Limpar carrinho
        localStorage.setItem('carrinho', '[]');
        localStorage.setItem('metodoPagamento', 'pix');
        // Redirecionar para agendamento
        window.location.href = '../index.html#agendamento';
      };
    }
    
    modal.style.display = 'flex';
    
    // Auto-redirecionar após 2 segundos
    setTimeout(function() {
      // Salvar serviços comprados para pré-preencher agendamento
      const servicosComprados = carrinho.map(item => ({
        id: item.id,
        nome: item.nome,
        preco: item.preco
      }));
      localStorage.setItem('servicosParaAgendar', JSON.stringify(servicosComprados));
      
      localStorage.setItem('carrinho', '[]');
      localStorage.setItem('metodoPagamento', 'pix');
      window.location.href = '../index.html#agendamento';
    }, 2000);
  }
};

// Voltar para o carrinho
window.voltarParaCarrinho = function() {
  console.log('🔙 Função voltarParaCarrinho chamada - redirecionando...');
  window.location.href = '../index.html';
};

// Finalizar e voltar
window.finalizarEVoltar = function() {
  console.log('Finalizando e voltando');
  window.location.href = '../index.html';
};

// Confirmar pagamento
window.confirmarPagamento = function() {
  const selectedMethod = window.selectedPaymentMethod;
  const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado') || 'null');
  
  console.log('Confirmando pagamento. Método:', selectedMethod);
  
  if (!selectedMethod) {
    console.warn('⚠️ Nenhuma forma de pagamento selecionada');
    return;
  }

  // =============================================
  // CARTÃO DE CRÉDITO/DÉBITO - VIA MERCADO PAGO
  // =============================================
  if (selectedMethod === 'credito' || selectedMethod === 'debito') {
    const form = document.getElementById('card-form');
    if (form && !form.checkValidity()) {
      form.reportValidity();
      return;
    }
    
    // Processar via Mercado Pago
    const paymentMethodId = selectedMethod === 'credito' ? 'credit_card' : 'debit_card';
    processarPagamentoCartao(paymentMethodId);
    return;
  }

  // =============================================
  // PIX - VIA MERCADO PAGO
  // =============================================
  if (selectedMethod === 'pix') {
    criarPagamentoMercadoPago();
    return;
  }

  // =============================================
  // DINHEIRO - SEM INTEGRAÇÃO
  // =============================================
  if (selectedMethod === 'dinheiro') {
    // Mostrar mensagem rápida
    const modal = document.getElementById('modal-sucesso');
    const nomeCliente = document.getElementById('cliente-nome');
    
    if (modal && nomeCliente) {
      nomeCliente.textContent = usuarioLogado ? usuarioLogado.nome : 'Cliente';
      
      // Mudar texto do modal para agendamento
      const modalTitle = modal.querySelector('h2');
      const modalText = modal.querySelector('p');
      const modalBtn = modal.querySelector('.modal-custom-btn');
      
      if (modalTitle) modalTitle.textContent = 'Pagamento Confirmado!';
      if (modalText) modalText.innerHTML = `<p style="font-size:1.1rem;">Pagamento em dinheiro confirmado. Agora vamos agendar!</p>`;
      if (modalBtn) {
        modalBtn.textContent = 'Fazer Agendamento';
        modalBtn.onclick = function() {
          // Limpar carrinho
          localStorage.setItem('carrinho', '[]');
          // Redirecionar para seção de agendamento na página inicial
          window.location.href = '../index.html#agendamento';
        };
      }
      
      modal.style.display = 'flex';
    }
  }
}

// ===================================
// INICIALIZAÇÃO
// ===================================

console.log('===== PAGAMENTO.JS CARREGADO =====');

// Carregar dados do carrinho
let carrinho = JSON.parse(localStorage.getItem('carrinho') || '[]');
const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado') || 'null');

console.log('🛒 CARRINHO CARREGADO:', carrinho);
console.log('📊 QUANTIDADE DE ITENS NO CARRINHO:', carrinho.length);

console.log('Carrinho carregado:', carrinho);
console.log('Quantidade de itens:', carrinho.length);
console.log('Usuário:', usuarioLogado);

// Verificar se há itens no carrinho
if (!carrinho || carrinho.length === 0) {
  console.warn('⚠️ AVISO: Carrinho vazio! Redirecionando...');
  setTimeout(() => {
    window.location.href = '../index.html';
  }, 500);
}

// Formatar moeda
const R$ = n => {
  if (typeof n !== 'number') n = parseFloat(n) || 0;
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

// ===================================
// RENDERIZAR PEDIDO
// ===================================

function renderizarPedido() {
  console.log('🔄 Renderizando pedido...');
  
  const container = document.getElementById('order-items');
  const totalElement = document.getElementById('order-total');
  
  console.log('Container encontrado:', !!container);
  console.log('Total element encontrado:', !!totalElement);
  console.log('Itens no carrinho:', carrinho ? carrinho.length : 0);
  
  if (!container || !totalElement) {
    console.error('❌ ERRO: Elementos não encontrados!');
    return;
  }
  
  let total = 0;
  let html = '';
  
  if (!carrinho || carrinho.length === 0) {
    console.warn('⚠️ Carrinho vazio');
    html = '<p style="text-align:center;color:#999;padding:20px;"><i class="fas fa-shopping-cart"></i><br><br>Nenhum item no carrinho</p>';
    container.innerHTML = html;
    totalElement.textContent = 'R$ 0,00';
    return;
  }
  
  console.log('Renderizando', carrinho.length, 'itens');
  
  carrinho.forEach((item, index) => {
    console.log(`Item ${index}:`, item);
    const preco = parseFloat(item.preco) || 0;
    const quantidade = parseInt(item.quantidade) || 1;
    const subtotal = preco * quantidade;
    total += subtotal;
    
    const imagemUrl = item.imagem || './img/default.jpg';
    
    html += `
      <div class="order-item">
        <img src="${imagemUrl}" alt="${item.nome}" class="order-item-img">
        <div class="order-item-info">
          <div class="order-item-name">${item.nome || 'Produto'}</div>
          <div class="order-item-qty">Quantidade: ${quantidade}</div>
        </div>
        <div class="order-item-price">${R$(subtotal)}</div>
      </div>
    `;
  });
  
  console.log('HTML gerado, atualizando DOM...');
  container.innerHTML = html;
  totalElement.textContent = R$(total);
  
  // Atualizar o valor no PIX também
  const pixValue = document.querySelector('#pix-details p[style*="font-size: 1.2rem"]');
  if (pixValue) {
    pixValue.textContent = R$(total);
  }
  
  console.log('✓ Pedido renderizado com sucesso!');
  console.log('✓ Total:', R$(total));
}

// ===================================
// MÉTODOS DE PAGAMENTO
// ===================================

function inicializarMetodosPagamento() {
  const paymentMethods = document.querySelectorAll('.payment-method');
  const btnConfirm = document.getElementById('btn-confirm');
  window.selectedPaymentMethod = null;

  console.log('Inicializando métodos de pagamento...');
  console.log('Métodos encontrados:', paymentMethods.length);

  paymentMethods.forEach(method => {
    method.addEventListener('click', function() {
      // Remover seleção anterior
      paymentMethods.forEach(m => m.classList.remove('selected'));
      
      // Adicionar seleção atual
      this.classList.add('selected');
      const radio = this.querySelector('input[type="radio"]');
      radio.checked = true;
      window.selectedPaymentMethod = radio.value;
      
      console.log('Método selecionado:', window.selectedPaymentMethod);
      
      // Esconder todos os detalhes
      document.querySelectorAll('.payment-details').forEach(d => d.classList.remove('active'));
      
      // Esconder botão confirmar por padrão
      if (btnConfirm) {
        btnConfirm.classList.remove('show');
        btnConfirm.disabled = true;
      }
      
      // Mostrar detalhes específicos
      if (window.selectedPaymentMethod === 'pix') {
        document.getElementById('pix-details')?.classList.add('active');
        // Para PIX, NÃO mostrar o botão confirmar (usar "Já realizei o pagamento")
        if (btnConfirm) {
          btnConfirm.classList.remove('show');
          btnConfirm.disabled = true;
        }
        
        // Gerar pagamento via Mercado Pago automaticamente
        if (typeof criarPagamentoMercadoPago === 'function') {
          criarPagamentoMercadoPago();
        }
      } else if (window.selectedPaymentMethod === 'credito') {
        document.getElementById('card-details')?.classList.add('active');
        const installmentsGroup = document.getElementById('installments-group');
        if (installmentsGroup) installmentsGroup.style.display = 'block';
      } else if (window.selectedPaymentMethod === 'debito') {
        document.getElementById('card-details')?.classList.add('active');
        const installmentsGroup = document.getElementById('installments-group');
        if (installmentsGroup) installmentsGroup.style.display = 'none';
      } else if (window.selectedPaymentMethod === 'dinheiro') {
        document.getElementById('cash-details')?.classList.add('active');
        // Para dinheiro, mostrar botão imediatamente
        if (btnConfirm) {
          btnConfirm.classList.add('show');
          btnConfirm.disabled = false;
        }
      }
    });
  });
  
  // Validar campos do cartão para mostrar botão
  validarCamposCartao();
}

// ===================================
// VALIDAR CAMPOS DO CARTÃO
// ===================================

function validarCamposCartao() {
  const cardNumber = document.getElementById('card-number');
  const cardName = document.getElementById('card-name');
  const cardExpiry = document.getElementById('card-expiry');
  const cardCvv = document.getElementById('card-cvv');
  const btnConfirm = document.getElementById('btn-confirm');
  
  const campos = [cardNumber, cardName, cardExpiry, cardCvv];
  
  campos.forEach(campo => {
    if (campo) {
      campo.addEventListener('input', function() {
        // Verificar se todos os campos estão preenchidos
        const todosCamposPreenchidos = campos.every(c => c && c.value.trim().length > 0);
        const metodoCartao = window.selectedPaymentMethod === 'credito' || window.selectedPaymentMethod === 'debito';
        
        if (todosCamposPreenchidos && metodoCartao && btnConfirm) {
          btnConfirm.classList.add('show');
          btnConfirm.disabled = false;
        } else if (metodoCartao && btnConfirm) {
          btnConfirm.classList.remove('show');
          btnConfirm.disabled = true;
        }
      });
    }
  });
}

// ===================================
// FORMATAÇÃO DE CAMPOS
// ===================================

function inicializarFormatacaoCampos() {
  // Formatar número do cartão
  const cardNumberInput = document.getElementById('card-number');
  if (cardNumberInput) {
    cardNumberInput.addEventListener('input', function(e) {
      let value = e.target.value.replace(/\s/g, '');
      let formatted = value.match(/.{1,4}/g)?.join(' ') || value;
      e.target.value = formatted;
    });
  }

  // Formatar data de validade
  const cardExpiryInput = document.getElementById('card-expiry');
  if (cardExpiryInput) {
    cardExpiryInput.addEventListener('input', function(e) {
      let value = e.target.value.replace(/\D/g, '');
      if (value.length >= 2) {
        value = value.substring(0, 2) + '/' + value.substring(2, 4);
      }
      e.target.value = value;
    });
  }
}

// ===================================
// LOGOUT
// ===================================

function inicializarLogout() {
  const btnSair = document.getElementById('btn-sair');
  if (btnSair) {
    btnSair.addEventListener('click', () => {
      localStorage.removeItem('usuarioLogado');
      window.location.href = 'login.html';
    });
  }
}

// ===================================
// INICIALIZAÇÃO PRINCIPAL
// ===================================

console.log('Configurando inicialização...');

// Executar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
  console.log('>>> DOM CARREGADO - INICIALIZANDO <<<');
  
  // Aguardar 200ms para garantir que tudo está pronto
  setTimeout(function() {
    console.log('Chamando renderizarPedido()...');
    renderizarPedido();
    
    console.log('Chamando inicializarMetodosPagamento()...');
    inicializarMetodosPagamento();
    
    console.log('Chamando inicializarFormatacaoCampos()...');
    inicializarFormatacaoCampos();
    
    console.log('Chamando inicializarLogout()...');
    inicializarLogout();
    
    console.log('✓✓✓ INICIALIZAÇÃO COMPLETA ✓✓✓');
  }, 200);
});
