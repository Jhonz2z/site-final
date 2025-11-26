// Conexão com MongoDB
const { MongoClient } = require('mongodb');

let cachedClient = null;
let cachedDb = null;

async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  // URL de conexão do MongoDB Atlas (será configurada nas variáveis de ambiente)
  const MONGODB_URI = process.env.MONGODB_URI;
  
  if (!MONGODB_URI) {
    throw new Error('Por favor, configure MONGODB_URI nas variáveis de ambiente do Vercel');
  }

  const client = await MongoClient.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const db = client.db('salao-netinha');

  cachedClient = client;
  cachedDb = db;

  return { client, db };
}

module.exports = { connectToDatabase };
