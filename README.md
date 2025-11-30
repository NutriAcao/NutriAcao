# 🌱 NutriAção - Conectando Excedentes à Esperança

[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![Node.js](https://img.shields.io/badge/Node.js-22.x-green.svg)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-blue.svg)](https://supabase.com/)

**NutriAção** é uma plataforma inovadora que conecta empresas com excedentes alimentares a ONGs que atendem comunidades em situação de vulnerabilidade. Nosso objetivo é combater o desperdício de alimentos e a fome, alinhando-nos com os **Objetivos de Desenvolvimento Sustentável (ODS 2)** da ONU.

## 🎯 Objetivo do Projeto

Transformar excedentes alimentares em oportunidades de alimentação para quem mais precisa, criando uma ponte eficiente entre doadores e receptores através de uma plataforma digital segura e intuitiva.

## 🚀 Funcionalidades Principais

### Para Empresas Doadoras
- **Cadastro de Excedentes** - Registrar alimentos disponíveis para doação
- **Gestão de Doações** - Acompanhar status das doações (disponível, reservado, concluído)
- **Histórico Completo** - Visualizar todas as doações realizadas
- **Relatórios de Impacto** - Métricas de contribuição social

### Para ONGs Receptoras
- **Solicitações de Alimentos** - Cadastrar necessidades específicas
- **Busca de Doações** - Encontrar excedentes disponíveis
- **Gestão de Reservas** - Reservar e gerenciar doações
- **Histórico de Recebimentos** - Controle de alimentos recebidos

### Sistema Geral
- **Autenticação Segura** - JWT com diferentes níveis de acesso
- **Categorização** - Organização por tipos de alimentos e unidades de medida
- **Sistema de Contato** - Comunicação direta entre partes
- **Interface Responsiva** - Acesso via desktop e mobile

## 🛠️ Tecnologias Utilizadas

### Frontend
- **HTML5** - Estrutura semântica
- **CSS3** - Estilização responsiva e moderna
- **JavaScript (ES6+)** - Interatividade e consumo de APIs
- **Font Awesome** - Ícones e elementos visuais
- **Leaflet** - Integração com mapas

### Backend
- **Node.js** - Ambiente de execução JavaScript
- **Express.js** - Framework web para APIs RESTful
- **JSON Web Tokens (JWT)** - Autenticação segura
- **bcrypt** - Criptografia de senhas
- **cookie-parser** - Gerenciamento de cookies

### Banco de Dados & Infraestrutura
- **PostgreSQL** - Banco de dados relacional
- **Supabase** - Plataforma backend-as-a-service
- **Render** - Hospedagem e deploy da aplicação
- **SendGrid** - Serviço de e-mail transacional

### Segurança
- **express-rate-limit** - Proteção contra ataques de força bruta
- **Validação de Dados** - Verificação em frontend e backend
- **CORS** - Controle de acesso entre origens

## 📋 Pré-requisitos

- Node.js 18.x ou superior
- npm ou yarn
- Conta no Supabase (para banco de dados)
- Conta no SendGrid (para e-mails)

## 🚀 Como Executar o Projeto Localmente

### 1. Clone o Repositório
```bash
git clone https://github.com/NutriAcao/NutriAcao.git
cd NutriAcao
```

### 2. Instale as Dependências
```bash
npm install
```

### 3. Configure as Variáveis de Ambiente
Crie um arquivo `.env` na raiz do projeto com:
```env
# Banco de Dados Supabase
SUPABASE_URL=sua_url_do_supabase
SUPABASE_KEY=sua_chave_do_supabase

# Configurações do Servidor
PORT=5501
NODE_ENV=development

# Email (SendGrid)
EMAIL_RENDER_SENDGRID_KEY=sua_chave_sendgrid
EMAIL_RECIPIENT=email_destinatario
EMAIL_REMETENTE=email_remetente

# JWT Secret
JWT_SECRET=seu_jwt_secret
```

### 4. Execute a Aplicação
```bash
# Modo desenvolvimento
npm start

# Ou para desenvolvimento com auto-reload
npm install -g nodemon
nodemon backend/index.js
```

### 5. Acesse a Aplicação
Abra seu navegador e acesse: `http://localhost:5501`

## 🗄️ Estrutura do Banco de Dados

### Tabelas Principais
- **usuarios** - Dados base de todos os usuários
- **empresas** - Informações específicas de empresas doadoras
- **ongs** - Dados das organizações receptoras
- **excedentes** - Registro de alimentos disponíveis
- **solicitacoes_ong** - Pedidos de alimentos por ONGs
- **doacoes_disponiveis** - Doações ativas para reserva
- **doacoes_concluidas** - Histórico de doações finalizadas
- **categorias** - Tipos de alimentos (grãos, laticínios, etc.)
- **unidades_medida** - Unidades de medida (kg, litros, unidades)

## 🌐 Deploy e Produção

### URLs de Produção
- **Aplicação Principal**: https://nutriacao.onrender.com
- **Repositório**: https://github.com/NutriAcao/NutriAcao

### Serviços em Produção
- **Backend API**: Render
- **Banco de Dados**: Supabase
- **Email Service**: SendGrid

## 🔧 Desenvolvimento

### Estrutura de Pastas
```
NutriAcao/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Lógica de negócio
│   │   ├── models/          # Modelos de dados
│   │   ├── routes/          # Definição de rotas
│   │   └── config/          # Configurações
│   └── index.js            # Entry point
├── private/
│   ├── ong/                # Páginas HTML protegidas de ONG
│   ├── empresa/            # Páginas HTML protegidas de empresa
├── public/
│   ├── pages/              # Páginas HTML
│   ├── styles/             # Arquivos CSS
│   ├── js/                 # JavaScript do frontend
│   └── assets/             # Imagens e recursos
└── package.json
```

### Scripts Disponíveis
```bash
npm start          # Inicia o servidor
npm test           # Executa testes (a implementar)
```

## 📄 Licença

Este projeto está sob a licença ISC. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👥 Equipe de Desenvolvimento

- **Gustavo Amorim** 
- **Enzo Rafael** 
- **Gabriel Freitas** 
- **Rafael Ryu** 
- **Thiago Farias**
- **Erick Brito** 
- **Equipe NutriAção** 

## 📞 Suporte

Para reportar bugs ou solicitar funcionalidades, abra uma [issue](https://github.com/NutriAcao/NutriAcao/issues) no GitHub.

**Juntos contra o desperdício, unidos pela nutrição!** 🌱
