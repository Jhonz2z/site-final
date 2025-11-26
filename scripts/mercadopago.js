// =============================================
// INTEGRAÇÃO MERCADO PAGO - FRONTEND
// =============================================

const API_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3000'
  : window.location.origin;

// =============================================
// CRIAR PAGAMENTO PIX VIA MERCADO PAGO
// =============================================
window.criarPagamentoMercadoPago = async function() {
  console.log('💳 Iniciando pagamento via Mercado Pago...');
  
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
  
  try {
    // Mostrar loading
    mostrarLoading(true);
    
    // Chamar backend para criar pagamento
    const response = await fetch(`${API_URL}/criar-pagamento`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        valor: total.toFixed(2),
        email: usuarioLogado ? usuarioLogado.email : 'cliente@email.com',
        nome: usuarioLogado ? usuarioLogado.nome : 'Cliente'
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Pagamento criado!', data);
      
      // Atualizar QR Code na página
      const qrCodeImg = document.querySelector('#pix-details .pix-qrcode img');
      console.log('🖼️ Elemento da imagem encontrado:', qrCodeImg);
      
      if (qrCodeImg && data.qrCodeBase64) {
        qrCodeImg.src = `data:image/png;base64,${data.qrCodeBase64}`;
        console.log('✅ QR Code atualizado!');
      } else {
        console.warn('⚠️ Não foi possível atualizar QR Code. Imagem:', qrCodeImg, 'Base64:', data.qrCodeBase64);
      }
      
      // Atualizar código PIX
      const pixCode = document.getElementById('pix-code');
      console.log('📝 Elemento do código PIX encontrado:', pixCode);
      
      if (pixCode && data.qrCode) {
        pixCode.textContent = data.qrCode;
        console.log('✅ Código PIX atualizado!');
      } else {
        console.warn('⚠️ Não foi possível atualizar código PIX. Elemento:', pixCode, 'Código:', data.qrCode);
      }
      
      // Salvar ID do pagamento
      localStorage.setItem('paymentId', data.paymentId);
      
      // Iniciar verificação automática
      iniciarVerificacaoPagamento(data.paymentId);
      
      mostrarLoading(false);
      
    } else {
      throw new Error(data.error || 'Erro ao criar pagamento');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
    mostrarLoading(false);
    if (typeof mostrarModal === 'function') {
      mostrarModal('Erro ao criar pagamento. Tente novamente.', 'fa-exclamation-circle');
    } else if (typeof mostrarModalMensagem === 'function') {
      mostrarModalMensagem('Erro ao criar pagamento. Tente novamente.');
    } else {
      console.error('Erro ao criar pagamento. Tente novamente.');
    }
  }
};

// =============================================
// VERIFICAR STATUS DO PAGAMENTO
// =============================================
let verificacaoInterval = null;

function iniciarVerificacaoPagamento(paymentId) {
  console.log('🔍 Iniciando verificação automática do pagamento...');
  
  // Limpar intervalo anterior se existir
  if (verificacaoInterval) {
    clearInterval(verificacaoInterval);
  }
  
  // Verificar a cada 3 segundos
  verificacaoInterval = setInterval(async () => {
    try {
      const response = await fetch(`${API_URL}/verificar-pagamento/${paymentId}`);
      const data = await response.json();
      
      console.log('📊 Status:', data.status);
      
      if (data.approved) {
        console.log('✅ PAGAMENTO APROVADO!');
        clearInterval(verificacaoInterval);
        
        // Mostrar modal de sucesso
        mostrarModalPagamentoAprovado();
      }
      
    } catch (error) {
      console.error('❌ Erro ao verificar pagamento:', error);
    }
  }, 3000);
  
  // Parar verificação após 10 minutos
  setTimeout(() => {
    if (verificacaoInterval) {
      clearInterval(verificacaoInterval);
      console.log('⏰ Tempo limite de verificação atingido');
    }
  }, 600000);
}

// =============================================
// MOSTRAR MODAL DE PAGAMENTO APROVADO
// =============================================
function mostrarModalPagamentoAprovado() {
  const modal = document.getElementById('modal-sucesso');
  const nomeCliente = document.getElementById('cliente-nome');
  const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado') || 'null');
  
  // Obter carrinho para identificar serviços comprados
  const carrinho = JSON.parse(localStorage.getItem('carrinho') || '[]');
  
  // Salvar no histórico de compras
  salvarHistoricoCompra(carrinho, 'PIX - Mercado Pago', 'aprovado');
  
  if (modal && nomeCliente) {
    nomeCliente.textContent = usuarioLogado ? usuarioLogado.nome : 'Cliente';
    
    const modalTitle = modal.querySelector('h2');
    const modalText = modal.querySelector('p');
    const modalBtn = modal.querySelector('.modal-custom-btn');
    
    if (modalTitle) modalTitle.textContent = '✅ Pagamento Confirmado!';
    if (modalText) modalText.innerHTML = '<p style="font-size:1.1rem;">Seu pagamento foi aprovado!<br>Redirecionando para o agendamento...</p>';
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
        
        localStorage.setItem('carrinho', '[]');
        localStorage.setItem('metodoPagamento', 'pix-mercadopago');
        window.location.href = '../index.html#agendamento';
      };
    }
    
    modal.style.display = 'flex';
    
    // Auto-redirecionar após 3 segundos
    setTimeout(function() {
      // Salvar serviços comprados para pré-preencher agendamento
      const servicosComprados = carrinho.map(item => ({
        id: item.id,
        nome: item.nome,
        preco: item.preco
      }));
      localStorage.setItem('servicosParaAgendar', JSON.stringify(servicosComprados));
      localStorage.setItem('carrinho', '[]');
      localStorage.setItem('metodoPagamento', 'pix-mercadopago');
      window.location.href = '../index.html#agendamento';
    }, 3000);
  }
}

// =============================================
// MOSTRAR/ESCONDER LOADING
// =============================================
function mostrarLoading(show) {
  let loading = document.getElementById('loading-overlay');
  
  if (show) {
    if (!loading) {
      loading = document.createElement('div');
      loading.id = 'loading-overlay';
      loading.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.7);
        backdrop-filter: blur(5px);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 99999;
      `;
      loading.innerHTML = `
        <div style="background: white; padding: 30px; border-radius: 12px; text-align: center; box-shadow: 0 10px 40px rgba(0,0,0,0.3);">
          <div style="font-size: 3rem; margin-bottom: 15px;">⏳</div>
          <p style="font-size: 1.2rem; font-weight: 600; color: #333;">Gerando pagamento...</p>
        </div>
      `;
      document.body.appendChild(loading);
    }
    loading.style.display = 'flex';
  } else {
    if (loading) {
      loading.style.display = 'none';
      // Remover após animação
      setTimeout(() => {
        if (loading && loading.parentNode) {
          loading.parentNode.removeChild(loading);
        }
      }, 300);
    }
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
    transacaoId: window.currentPaymentId || null
  };
  
  historicoCompras.unshift(compra); // Adicionar no início do array
  localStorage.setItem('historicoCompras', JSON.stringify(historicoCompras));
  
  console.log('Compra salva no histórico:', compra);
}

function toggleLoading(show) {
  let loading = document.getElementById('loading-pagamento');
  if (!loading && show) {
    loading = document.createElement('div');
    loading.id = 'loading-pagamento';
    loading.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999;
    `;
    loading.innerHTML = `
      <div style="background: white; padding: 30px; border-radius: 12px; text-align: center;">
        <div style="font-size: 3rem; margin-bottom: 15px;">⏳</div>
        <p style="font-size: 1.2rem; font-weight: 600; color: #333;">Gerando pagamento...</p>
      </div>
    `;
    document.body.appendChild(loading);
  }
  if (loading) {
    loading.style.display = show ? 'flex' : 'none';
  }
}
