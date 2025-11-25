# Salão da Netinha

Projeto desenvolvido para a disciplina de Desenvolvimento Web — aplicação **Full Stack** que simula um site de salão, com catálogo de serviços, sistema de agendamento, autenticação, e banco de dados **MongoDB** hospedada na **Vercel**.

## Visão Geral

- **Stack:** Front-end (**HTML, CSS, JavaScript**) + Backend **Node.js/Express**
- **Banco de Dados:** [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- **Hospedagem Backend & Frontend:** [Vercel](https://vercel.com/)
- **Layout:** Responsivo, design customizado via CSS próprio.
- **Ícones:** [Font Awesome](https://fontawesome.com/), [Google Fonts](https://fonts.google.com/).

## Configuração de Variáveis de Ambiente

⚠️ **IMPORTANTE**: Nunca comite tokens, senhas ou chaves secretas no código-fonte!

### Passo a Passo

1. Copie o arquivo `.env.example` para `.env`:
   ```bash
   cp .env.example .env
   ```

2. Configure as variáveis necessárias no arquivo `.env`:

| Variável | Descrição | Onde Obter |
|----------|-----------|------------|
| `MONGODB_URI` | URI de conexão MongoDB Atlas | [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) |
| `JWT_SECRET` | Chave secreta para tokens JWT | Gere com `openssl rand -base64 32` |
| `MERCADOPAGO_ACCESS_TOKEN` | Access Token do Mercado Pago | [Painel de Desenvolvedores](https://www.mercadopago.com.br/developers/panel/app) |
| `MERCADOPAGO_PUBLIC_KEY` | Public Key do Mercado Pago | [Painel de Desenvolvedores](https://www.mercadopago.com.br/developers/panel/app) |

### Configuração na Vercel

Na Vercel, configure as variáveis de ambiente em:
**Project Settings → Environment Variables**

### Configuração do Frontend (PUBLIC_KEY)

Para o frontend, a `MERCADOPAGO_PUBLIC_KEY` deve ser disponibilizada antes de carregar o script:

```html
<script>
  window.MERCADOPAGO_PUBLIC_KEY = 'SUA_PUBLIC_KEY_AQUI';
</script>
<script src="scripts/mercadopago-cartao.js"></script>
```

## Funcionalidades

### Catálogo de Serviços
- Consome dados de serviços via API (backend Express conectado ao MongoDB).
- Cards exibindo preço, imagem, categoria e duração vindos do banco de dados.

### Busca e Filtros
- Busca instantânea por nome do serviço.
- Filtros: **Cabelos**, **Unhas**, **Estética**, **Maquiagem**.

### Sistema de Agendamento
- Formulário validado no frontend e backend.
- Agendamentos são salvos e recuperados do banco MongoDB.
- Consulta pela API, exibição dinâmica, botão limpar agendamentos (requisição ao backend).

### Sistema de Login e Autenticação
- Cadastro e login conectados ao backend, com dados armazenados no MongoDB.
- Proteção de rotas e redirecionamento via autenticação JWT.
- Suporte futuro para login via Google OAuth (Google Sign-In).

### Backend & API (Node.js + Express)
- API RESTful para manipulação de serviços, usuários, agendamentos e autenticação.
- Hospedagem serverless na Vercel (arquivos em `/api`).
- Integração total com **MongoDB Atlas**.

## Observações

- O sistema usa **MongoDB Atlas** para persistência de usuários, serviços e agendamentos.
- Autenticação JWT protege rotas do backend e navegação do frontend.
- O Google Sign-In será habilitado em breve.
- Funcionalidades do Bootstrap são utilizadas principalmente em modais e componentes.
