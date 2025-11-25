// =============================================
// API DE REGISTRO - AUTENTICAÇÃO JWT
// =============================================
// ATENÇÃO: Tokens, senhas e chaves secretas devem SEMPRE
// estar configurados no arquivo .env, NUNCA no código-fonte.
// Variáveis necessárias: JWT_SECRET, MONGODB_URI
// =============================================

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { connectToDatabase } = require('./db');

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error('❌ JWT_SECRET não configurado nas variáveis de ambiente');
  throw new Error('JWT_SECRET não configurado. Configure nas variáveis de ambiente.');
}

module.exports = async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Método não permitido' });
  }

  try {
    const { nome, email, telefone, senha } = req.body;

    // Validação
    if (!nome || !email || !senha) {
      return res.status(400).json({ success: false, error: 'Nome, email e senha são obrigatórios' });
    }

    // Conectar ao banco
    const { db } = await connectToDatabase();
    const users = db.collection('users');

    // Verificar se usuário já existe
    const existingUser = await users.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'Email já cadastrado' });
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(senha, 10);

    // Criar usuário
    const newUser = {
      nome,
      email: email.toLowerCase(),
      telefone: telefone || '',
      senha: hashedPassword,
      criadoEm: new Date(),
      historicoCompras: [],
      agendamentos: []
    };

    const result = await users.insertOne(newUser);

    // Gerar token JWT
    const token = jwt.sign(
      { userId: result.insertedId, email: email.toLowerCase() },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Retornar dados do usuário (sem senha)
    res.status(201).json({
      success: true,
      user: {
        id: result.insertedId,
        nome,
        email: email.toLowerCase(),
        telefone
      },
      token
    });

  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({ success: false, error: 'Erro ao criar conta' });
  }
};
