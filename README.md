# Salão da Netinha

Projeto desenvolvido para a disciplina de Desenvolvimento Web — aplicação **Full Stack** que simula um site de salão, com catálogo de serviços, sistema de agendamento, autenticação, e banco de dados **MongoDB** hospedada na **Vercel**.

## Visão Geral

- **Stack:** Front-end (**HTML, CSS, JavaScript**) + Backend **Node.js/Express**
- **Banco de Dados:** [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- **Hospedagem Backend & Frontend:** [Vercel](https://vercel.com/)
- **Layout:** Responsivo, design customizado via CSS próprio.
- **Ícones:** [Font Awesome](https://fontawesome.com/), [Google Fonts](https://fonts.google.com/).

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
