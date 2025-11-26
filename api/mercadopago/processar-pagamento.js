// =============================================
// API BACKEND - PROCESSAR PAGAMENTO MERCADO PAGO
// =============================================

const mercadopago = require('mercadopago');

export default async function handler(req, res) {
  // Apenas POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Configurar credenciais do Mercado Pago
    const ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN;
    
    if (!ACCESS_TOKEN) {
      console.error('❌ MERCADOPAGO_ACCESS_TOKEN não configurado nas variáveis de ambiente');
      return res.status(500).json({ 
        error: 'Erro de configuração do servidor. Entre em contato com o suporte.' 
      });
    }

    mercadopago.configure({
      access_token: ACCESS_TOKEN
    });

    const { token, transaction_amount, description, email, payment_method_id, installments } = req.body;

    // Validação
    if (!token || !transaction_amount || !email || !payment_method_id) {
      return res.status(400).json({ 
        error: 'Dados incompletos. Verifique os campos obrigatórios.' 
      });
    }

    // Criar pagamento
    const payment_data = {
      token,
      transaction_amount: parseFloat(transaction_amount),
      description: description || 'Serviços do Salão',
      payment_method_id,
      installments: parseInt(installments) || 1,
      payer: {
        email
      }
    };

    console.log('💳 Criando pagamento:', payment_data);

    const response = await mercadopago.payment.create(payment_data);
    const { status, status_detail, id } = response.body;

    console.log('✅ Pagamento criado:', { status, status_detail, id });

    return res.status(200).json({
      status,
      status_detail,
      id,
      message: status === 'approved' ? 'Pagamento aprovado!' : 'Pagamento em processamento'
    });

  } catch (error) {
    console.error('❌ Erro ao processar pagamento:', error);
    
    return res.status(500).json({ 
      error: 'Erro ao processar pagamento',
      details: error.message 
    });
  }
}
