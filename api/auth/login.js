const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { connectToDatabase } = require('./db');

const JWT_SECRET = process.env.JWT_SECRET || 'seu-secret-super-seguro-aqui-mude-isso';

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
    const { email, senha } = req.body;

    // Validação
    if (!email || !senha) {
      return res.status(400).json({ success: false, error: 'Email e senha são obrigatórios' });
    }

    // Conectar ao banco
    const { db } = await connectToDatabase();
    const users = db.collection('users');

    // Buscar usuário
    const user = await users.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return res.status(401).json({ success: false, error: 'Email ou senha incorretos' });
    }

    // Verificar senha
    const isPasswordValid = await bcrypt.compare(senha, user.senha);
    
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, error: 'Email ou senha incorretos' });
    }

    // Gerar token JWT
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Retornar dados do usuário (sem senha)
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        nome: user.nome,
        email: user.email,
        telefone: user.telefone || ''
      },
      token
    });

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ success: false, error: 'Erro ao fazer login' });
  }
};
