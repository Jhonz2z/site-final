// =============================================
// SERVIDOR BACKEND - INTEGRAÇÃO MERCADO PAGO
// =============================================
// ATENÇÃO: Tokens, senhas e chaves secretas devem SEMPRE
// estar configurados no arquivo .env, NUNCA no código-fonte.
// Variáveis necessárias: MERCADOPAGO_ACCESS_TOKEN
// =============================================

const express = require('express');
const cors = require('cors');
const { MercadoPagoConfig, Payment } = require('mercadopago');

const app = express();
const PORT = 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// CONFIGURAR MERCADO PAGO
// Access Token deve ser configurado via variável de ambiente
const ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN;

if (!ACCESS_TOKEN) {
  console.error('❌ MERCADOPAGO_ACCESS_TOKEN não configurado nas variáveis de ambiente');
}

const client = new MercadoPagoConfig({
  accessToken: ACCESS_TOKEN || '',
  options: { timeout: 5000 }
});

const payment = new Payment(client);

// =============================================
// ROTA: CRIAR PAGAMENTO PIX
// =============================================
app.post('/criar-pagamento', async (req, res) => {
  try {
    const { valor, email, nome } = req.body;

    console.log('📝 Criando pagamento PIX para:', nome, '- R$', valor);

    const paymentResponse = await payment.create({
      body: {
        transaction_amount: parseFloat(valor),
        description: 'Pagamento - Salão da Netinha',
        payment_method_id: 'pix',
        payer: {
          email: email || 'cliente@email.com',
          first_name: nome || 'Cliente'
        }
      }
    });

    const paymentData = paymentResponse;

    console.log('✅ Pagamento criado! ID:', paymentData.id);

    res.json({
      success: true,
      paymentId: paymentData.id,
      qrCode: paymentData.point_of_interaction.transaction_data.qr_code,
      qrCodeBase64: paymentData.point_of_interaction.transaction_data.qr_code_base64,
      ticketUrl: paymentData.point_of_interaction.transaction_data.ticket_url
    });

  } catch (error) {
    console.error('❌ Erro ao criar pagamento:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// =============================================
// ROTA: CRIAR PAGAMENTO COM CARTÃO
// =============================================
app.post('/criar-pagamento-cartao', async (req, res) => {
  try {
    const { valor, email, nome, token, installments, paymentMethodId } = req.body;

    console.log('💳 Criando pagamento com cartão para:', nome, '- R$', valor);

    const paymentResponse = await payment.create({
      body: {
        transaction_amount: parseFloat(valor),
        token: token,
        description: 'Pagamento - Salão da Netinha',
        installments: parseInt(installments) || 1,
        payment_method_id: paymentMethodId,
        payer: {
          email: email || 'cliente@email.com',
          first_name: nome || 'Cliente'
        }
      }
    });

    const paymentData = paymentResponse;

    console.log('✅ Pagamento com cartão criado! ID:', paymentData.id, 'Status:', paymentData.status);

    res.json({
      success: true,
      paymentId: paymentData.id,
      status: paymentData.status,
      statusDetail: paymentData.status_detail,
      approved: paymentData.status === 'approved'
    });

  } catch (error) {
    console.error('❌ Erro ao criar pagamento com cartão:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// =============================================
// ROTA: VERIFICAR STATUS DO PAGAMENTO
// =============================================
app.get('/verificar-pagamento/:id', async (req, res) => {
  try {
    const paymentId = req.params.id;

    const paymentData = await payment.get({ id: paymentId });
    const status = paymentData.status;

    console.log(`🔍 Verificando pagamento ${paymentId}: ${status}`);

    res.json({
      success: true,
      status: status,
      approved: status === 'approved'
    });

  } catch (error) {
    console.error('❌ Erro ao verificar pagamento:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// =============================================
// ROTA: WEBHOOK (Mercado Pago notifica aqui)
// =============================================
app.post('/webhook', async (req, res) => {
  try {
    console.log('🔔 Webhook recebido:', req.body);

    const { type, data } = req.body;

    if (type === 'payment') {
      const paymentId = data.id;
      const paymentData = await payment.get({ id: paymentId });
      
      console.log('💰 Status do pagamento:', paymentData.status);
      
      if (paymentData.status === 'approved') {
        console.log('✅ PAGAMENTO APROVADO!');
        // Aqui você pode salvar no banco de dados, enviar email, etc.
      }
    }

    res.sendStatus(200);

  } catch (error) {
    console.error('❌ Erro no webhook:', error);
    res.sendStatus(500);
  }
});

// =============================================
// INICIAR SERVIDOR
// =============================================
app.listen(PORT, () => {
  console.log('🚀 Servidor rodando em http://localhost:' + PORT);
  console.log('📝 Endpoints disponíveis:');
  console.log('   POST /criar-pagamento');
  console.log('   GET  /verificar-pagamento/:id');
  console.log('   POST /webhook');
});
