// =============================================
// INTEGRAÇÃO MERCADO PAGO - CARTÃO DE CRÉDITO/DÉBITO
// =============================================

// Usar a mesma API_URL já declarada em mercadopago.js
// const API_URL já existe no escopo global

// IMPORTANTE: Cole sua PUBLIC KEY aqui
const PUBLIC_KEY = 'APP_USR-80c8ff46-8eb0-4f45-961f-06040b561fc5';

let mp = null;
let cardForm = null;

// =============================================
// INICIALIZAR MERCADO PAGO SDK
// =============================================
function inicializarMercadoPago() {
  if (!PUBLIC_KEY || PUBLIC_KEY === 'SUA_PUBLIC_KEY_AQUI') {
    console.warn('⚠️ Public Key não configurada! Configure no arquivo mercadopago-cartao.js');
    return;
  }

  try {
    mp = new MercadoPago(PUBLIC_KEY);
    console.log('✅ Mercado Pago SDK inicializado com sucesso!');
    return true;
  } catch (error) {
    console.error('❌ Erro ao inicializar Mercado Pago:', error);
    return false;
  }
}

// Inicializar automaticamente quando o script carregar
if (typeof MercadoPago !== 'undefined') {
  inicializarMercadoPago();
} else {
  console.warn('⚠️ SDK do Mercado Pago ainda não carregou. Tentando novamente...');
  window.addEventListener('load', () => {
    setTimeout(inicializarMercadoPago, 500);
  });
}

// =============================================
// PROCESSAR PAGAMENTO COM CARTÃO
// =============================================
window.processarPagamentoCartao = async function(paymentMethodId) {
  console.log('💳 Processando pagamento com cartão...', paymentMethodId);

  if (!mp) {
    if (typeof mostrarModal === 'function') {
      mostrarModal('Erro: Mercado Pago não inicializado. Configure a Public Key.', 'fa-exclamation-circle');
    } else if (typeof mostrarModalMensagem === 'function') {
      mostrarModalMensagem('Erro: Mercado Pago não inicializado. Configure a Public Key.');
    } else {
      console.error('Erro: Mercado Pago não inicializado. Configure a Public Key.');
    }
    return;
  }

  // Obter dados do carrinho
  const carrinho = JSON.parse(localStorage.getItem('carrinho') || '[]');
  const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado') || 'null');

  // Calcular total
  let total = 0;
  carrinho.forEach(item => {
    const preco = parseFloat(item.preco) || 0;
    const quantidade = parseInt(item.quantidade) || 1;
    total += preco * quantidade;
  });

  if (total === 0) {
    console.error('❌ Carrinho vazio!');
    return;
  }

  // Obter dados do formulário
  const form = document.getElementById('card-form');
  if (!form || !form.checkValidity()) {
    if (typeof mostrarModal === 'function') {
      mostrarModal('Por favor, preencha todos os dados do cartão corretamente.', 'fa-exclamation-circle');
    } else if (typeof mostrarModalMensagem === 'function') {
      mostrarModalMensagem('Por favor, preencha todos os dados do cartão corretamente.');
    } else {
      console.error('Por favor, preencha todos os dados do cartão corretamente.');
    }
    form.reportValidity();
    return;
  }

  const cardNumber = document.getElementById('card-number').value.replace(/\s/g, '');
  const cardholderName = document.getElementById('cardholder-name').value;
  const cardExpirationMonth = document.getElementById('card-expiration-month').value;
  const cardExpirationYear = document.getElementById('card-expiration-year').value;
  const securityCode = document.getElementById('security-code').value;
  const installments = document.getElementById('installments')?.value || 1;

  try {
    mostrarLoading(true);

    // Criar token do cartão
    console.log('🔐 Criando token do cartão...');
    const cardToken = await mp.fields.createCardToken({
      cardNumber: cardNumber,
      cardholderName: cardholderName,
      cardExpirationMonth: cardExpirationMonth,
      cardExpirationYear: cardExpirationYear,
      securityCode: securityCode
    });

    console.log('✅ Token criado:', cardToken);

    // Enviar para o backend
    const API_ENDPOINT = window.location.hostname === 'localhost' 
      ? 'http://localhost:3000/api/mercadopago/processar-pagamento'
      : '/api/mercadopago/processar-pagamento';
    
    console.log('📤 Enviando para:', API_ENDPOINT);
    
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: cardToken.id,
        transaction_amount: total.toFixed(2),
        description: `Serviços do Salão - ${carrinho.map(i => i.nome).join(', ')}`,
        email: usuarioLogado ? usuarioLogado.email : 'cliente@email.com',
        payment_method_id: paymentMethodId,
        installments: installments
      })
    });

    const data = await response.json();
    console.log('📥 Resposta do servidor:', data);

    if (data.status === 'approved') {
      console.log('✅ Pagamento aprovado!', data);
      
      // Salvar no histórico de compras
      const carrinho = JSON.parse(localStorage.getItem('carrinho') || '[]');
      salvarHistoricoCompra(carrinho, `Cartão de ${paymentMethodId === 'visa' || paymentMethodId === 'master' ? 'Crédito/Débito' : paymentMethodId}`, 'aprovado');
      
      // Salvar serviços comprados para pré-preencher agendamento
      const servicosComprados = carrinho.map(item => ({
        id: item.id,
        nome: item.nome,
        preco: item.preco
      }));
      localStorage.setItem('servicosParaAgendar', JSON.stringify(servicosComprados));
      
      // Limpar carrinho
      localStorage.setItem('carrinho', '[]');
      localStorage.setItem('metodoPagamento', paymentMethodId);
      
      // Mostrar modal de sucesso
      mostrarModalSucesso();
      
      // Redirecionar para agendamento
      setTimeout(() => {
        window.location.href = 'index.html#agendamento';
      }, 2000);

    } else if (data.status === 'pending' || data.status === 'in_process') {
      // Pagamento pendente
      mostrarLoading(false);
      if (typeof mostrarModal === 'function') {
        mostrarModal(`Pagamento em processamento: ${data.status_detail || 'Aguardando confirmação'}`, 'fa-clock');
      } else if (typeof mostrarModalMensagem === 'function') {
        mostrarModalMensagem(`Pagamento em processamento: ${data.status_detail || 'Aguardando confirmação'}`);
      }
    } else {
      // Pagamento rejeitado
      mostrarLoading(false);
      if (typeof mostrarModal === 'function') {
        mostrarModal(`Pagamento não aprovado: ${data.status_detail || 'Verifique os dados do cartão'}`, 'fa-times-circle');
      } else if (typeof mostrarModalMensagem === 'function') {
        mostrarModalMensagem(`Pagamento não aprovado: ${data.status_detail || 'Verifique os dados do cartão'}`);
      }
    }

  } catch (error) {
    console.error('❌ Erro:', error);
    mostrarLoading(false);
    if (typeof mostrarModal === 'function') {
      mostrarModal('Erro ao processar pagamento com cartão. Verifique os dados e tente novamente.', 'fa-exclamation-circle');
    } else if (typeof mostrarModalMensagem === 'function') {
      mostrarModalMensagem('Erro ao processar pagamento com cartão. Verifique os dados e tente novamente.');
    } else {
      console.error('Erro ao processar pagamento com cartão. Verifique os dados e tente novamente.');
    }
  }
};

// =============================================
// FUNÇÕES AUXILIARES
// =============================================
function mostrarModalSucesso() {
  const modal = document.getElementById('modal-sucesso');
  const nomeCliente = document.getElementById('cliente-nome');
  const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado') || 'null');
  
  if (modal && nomeCliente) {
    nomeCliente.textContent = usuarioLogado ? usuarioLogado.nome : 'Cliente';
    modal.style.display = 'flex';
  }
}

// =============================================
// SALVAR HISTÓRICO DE COMPRA
// =============================================
function salvarHistoricoCompra(carrinho, metodoPagamento, status) {
  const historicoCompras = JSON.parse(localStorage.getItem('historicoCompras') || '[]');
  
  const compra = {
    id: Date.now().toString(),
    data: new Date().toISOString().split('T')[0],
    hora: new Date().toLocaleTimeString('pt-BR'),
    itens: carrinho.map(item => ({
      id: item.id,
      nome: item.nome,
      preco: item.preco,
      descricao: item.descricao || ''
    })),
    metodoPagamento: metodoPagamento,
    status: status,
    transacaoId: null
  };
  
  historicoCompras.unshift(compra); // Adicionar no início do array
  localStorage.setItem('historicoCompras', JSON.stringify(historicoCompras));
  
  console.log('Compra salva no histórico:', compra);
}

// =============================================
// INICIALIZAR AO CARREGAR PÁGINA
// =============================================
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', inicializarMercadoPago);
} else {
  inicializarMercadoPago();
}
