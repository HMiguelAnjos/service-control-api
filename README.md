# nine6 Software — API

Backend do sistema **nine6 Software**, uma plataforma SaaS para profissionais autônomos gerenciarem atendimentos, clientes, estoque, despesas e finanças do próprio negócio.

Construído com **Node.js + Express + Prisma + PostgreSQL**, seguindo arquitetura limpa (Clean Architecture).

---

## Sumário

- [O que o sistema faz](#o-que-o-sistema-faz)
- [Tecnologias](#tecnologias)
- [Arquitetura](#arquitetura)
- [Pré-requisitos](#pré-requisitos)
- [Instalação e configuração](#instalação-e-configuração)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Execução](#execução)
- [Roles de usuário](#roles-de-usuário)
- [Planos e permissões](#planos-e-permissões)
- [Endpoints da API](#endpoints-da-api)
- [Modelo de dados](#modelo-de-dados)
- [Segurança](#segurança)

---

## O que o sistema faz

O nine6 Software é voltado para profissionais como cabeleireiros, esteticistas, tatuadores, manicures e similares. Cada usuário cadastrado gerencia o próprio negócio de forma isolada (multi-tenancy por `userId`).

**Funcionalidades principais:**

| Módulo | O que faz |
|--------|-----------|
| **Atendimentos** | Registra serviços prestados a clientes, com múltiplos procedimentos por atendimento. Ao criar um atendimento, o sistema automaticamente deduz o estoque dos produtos utilizados e registra as despesas de material. |
| **Clientes** | Cadastro completo de clientes com histórico de atendimentos e galeria de fotos por cliente. |
| **Produtos** | Catálogo de insumos com custo unitário, usado como base para cálculo automático de custos de procedimentos. |
| **Estoque** | Controle de quantidade disponível de cada produto, com suporte a quantidades fracionadas (ex.: meio frasco). |
| **Despesas** | Registro de despesas gerais do negócio (aluguel, energia, transporte) ou vinculadas a um atendimento específico. Despesas de material são criadas automaticamente ao registrar atendimentos. |
| **Tipos de Procedimento** | Define os serviços oferecidos (ex.: corte, coloração) com lista de produtos utilizados e quantidade por procedimento. O sistema calcula automaticamente o custo do procedimento com base nos produtos. |
| **Lucros** | Cálculo e histórico de margem de lucro por atendimento. |
| **Dashboard** | Métricas consolidadas: receita total, despesas, lucro líquido, atendimentos do mês e top clientes. |
| **Fotos de clientes** | Upload de fotos associadas a cada cliente, organizadas por data, armazenadas localmente no servidor. |

---

## Tecnologias

| Tecnologia | Versão | Função |
|-----------|--------|--------|
| Node.js | 20+ | Runtime |
| Express | 4.x | Framework HTTP |
| TypeScript | 5.x | Tipagem estática |
| Prisma | 6.x | ORM + migrações |
| PostgreSQL | 14+ | Banco de dados |
| JWT (jsonwebtoken) | 9.x | Autenticação stateless |
| bcryptjs | 3.x | Hash de senhas |
| Zod | 3.x | Validação de entrada |
| Multer | 2.x | Upload de arquivos |
| Helmet | 8.x | Headers de segurança HTTP |
| express-rate-limit | 8.x | Proteção contra brute force |
| Nodemailer | 8.x | Envio de e-mails (reset de senha) |
| Swagger UI | 4.x | Documentação interativa da API |

---

## Arquitetura

O projeto segue **Clean Architecture** com separação em camadas:

```
src/
├── domain/
│   └── entities/          # Entidades de negócio puras (sem dependências externas)
│       ├── user.ts
│       ├── client.ts
│       ├── service.ts
│       ├── plan.ts
│       └── ...
├── application/
│   ├── ports/             # Interfaces dos repositórios (contratos)
│   └── use-cases/         # Regras de negócio organizadas por módulo
│       ├── auth/
│       ├── client/
│       ├── client-photo/
│       ├── service/
│       └── ...
├── adapters/
│   └── controllers/       # Recebem req/res do Express, delegam aos use-cases
├── infrastructure/
│   └── db/                # Implementações Prisma dos repositórios
├── middlewares/
│   ├── auth/              # authMiddleware, adminMiddleware
│   ├── validation/        # Schemas Zod + middleware validate()
│   ├── errors/            # Tratamento global de erros
│   └── logger/            # Logger de requisições
├── routes/                # Declaração de rotas + injeção de dependências
├── config/                # Logger, e-mail
└── main/
    └── index.ts           # Entry point: Express app, middlewares, server
```

**Fluxo de uma requisição:**

```
Request → authMiddleware → Controller → Use Case → Repository (Prisma) → PostgreSQL
```

---

## Pré-requisitos

- Node.js 20+
- PostgreSQL 14+
- npm 9+

---

## Instalação e configuração

```bash
# 1. Instale as dependências
npm install

# 2. Configure as variáveis de ambiente
cp .env.example .env
# Edite o .env com suas configurações

# 3. Sincronize o banco de dados
npx prisma db push

# 4. Popule os planos padrão
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const plans = [
  { name: 'Grátis',       price: 0,  features: { maxClients: 10,   maxServices: 30,   photos: false, expenses: false, inventory: false, reports: false } },
  { name: 'Essencial',    price: 49, features: { maxClients: 50,   maxServices: null, photos: true,  expenses: true,  inventory: true,  reports: false } },
  { name: 'Profissional', price: 99, features: { maxClients: null, maxServices: null, photos: true,  expenses: true,  inventory: true,  reports: true  } }
];
Promise.all(plans.map(p => prisma.plan.upsert({ where:{name:p.name}, update:p, create:p })))
  .then(() => { console.log('Planos criados.'); prisma.\$disconnect(); });
"

# 5. (Opcional) Torne seu usuário admin após se cadastrar no sistema
# Substitua pelo seu e-mail:
psql $DATABASE_URL -c "UPDATE \"user\" SET role = 'admin' WHERE email = 'seu@email.com';"
```

---

## Variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# Banco de dados
DATABASE_URL="postgresql://usuario:senha@localhost:5432/service-control"

# JWT
JWT_SECRET="sua_chave_secreta_longa_e_aleatoria"
JWT_EXPIRES_IN="7d"

# Servidor
PORT=3000
NODE_ENV=development
CORS_ORIGIN="http://localhost:3001"

# E-mail (reset de senha)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="seu@email.com"
SMTP_PASS="sua_senha_de_app"
SMTP_FROM="seu@email.com"
```

---

## Execução

```bash
# Desenvolvimento (watch mode)
npm run dev

# Build de produção
npm run build

# Iniciar build de produção
npm start
```

A documentação interativa da API estará disponível em:
**`http://localhost:3000/api-docs`**

---

## Roles de usuário

O sistema possui dois papéis (roles), controlados pelo campo `role` na tabela `user`:

### `user` (padrão)

- Role atribuída automaticamente a todo novo usuário cadastrado.
- Acessa **apenas os próprios dados** — isolamento total por `userId`.
- O que pode fazer depende do **plano contratado** (ver seção abaixo).
- Não tem acesso a nenhum dado de outros usuários.
- Não acessa rotas `/admin/*`.

### `admin`

- Papel reservado ao operador/dono do sistema.
- **Definido manualmente no banco de dados** — não existe fluxo de auto-promoção via API.
- Acessa o painel de administração (`/api/admin/*`).
- Pode visualizar todos os usuários cadastrados no sistema.
- Pode atribuir, remover ou trocar o plano de qualquer usuário.
- Pode promover ou rebaixar outros usuários para/de admin.
- Pode ativar ou desativar qualquer conta de usuário.
- **Não está sujeito a limitações de plano** — tem acesso irrestrito a todos os recursos.

**Como definir um admin (execute diretamente no banco):**

```sql
UPDATE "user" SET role = 'admin' WHERE email = 'seu@email.com';
```

> ⚠️ Adicione apenas usuários de confiança total como admin. Um admin pode modificar qualquer conta no sistema.

---

## Planos e permissões

Os planos controlam quais funcionalidades cada usuário com role `user` pode acessar. O plano fica armazenado no campo `plan_id` da tabela `user`.

### Planos disponíveis

| Plano | Preço | Clientes | Atendimentos | Fotos | Despesas | Estoque | Lucros |
|-------|-------|:--------:|:------------:|:-----:|:--------:|:-------:|:------:|
| **Grátis** | R$ 0/mês | até 10 | até 30 | ✗ | ✗ | ✗ | ✗ |
| **Essencial** | R$ 49/mês | até 50 | ilimitado | ✓ | ✓ | ✓ | ✗ |
| **Profissional** | R$ 99/mês | ilimitado | ilimitado | ✓ | ✓ | ✓ | ✓ |

### Estrutura das features no banco

Cada plano armazena suas permissões em uma coluna JSON (`features`):

```json
{
  "maxClients": 50,
  "maxServices": null,
  "photos": true,
  "expenses": true,
  "inventory": true,
  "reports": false
}
```

- `maxClients` / `maxServices`: número inteiro (limite) ou `null` (ilimitado).
- `photos`, `expenses`, `inventory`, `reports`: booleanos que liberam módulos específicos.

### Usuário sem plano

Um usuário sem plano atribuído é tratado como plano **Grátis** pelo frontend. O admin pode atribuir um plano a qualquer momento pelo painel de administração.

### Conta desativada (`is_active = false`)

Quando o admin desativa uma conta:
- O usuário é **bloqueado imediatamente** — o `authMiddleware` consulta o banco a cada requisição para verificar `is_active`.
- Tentativas de login também são recusadas.
- Os dados do usuário são **preservados** no banco.
- O admin pode reativar a conta a qualquer momento.

---

## Endpoints da API

Todos os endpoints (exceto `/auth`) exigem o header:
```
Authorization: Bearer <token>
```

### Autenticação

| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/api/auth/register` | Cadastro de novo usuário |
| `POST` | `/api/auth/login` | Login — retorna JWT + dados do usuário com plano e role |
| `POST` | `/api/auth/forgot-password` | Solicita reset de senha por e-mail |
| `POST` | `/api/auth/reset-password` | Redefine senha com o token recebido por e-mail |

**Resposta do login:**
```json
{
  "token": "eyJ...",
  "user": {
    "id": 1,
    "name": "João Silva",
    "email": "joao@email.com",
    "role": "user",
    "planId": 2,
    "isActive": true,
    "plan": {
      "id": 2,
      "name": "Essencial",
      "price": 49,
      "features": {
        "maxClients": 50,
        "maxServices": null,
        "photos": true,
        "expenses": true,
        "inventory": true,
        "reports": false
      }
    }
  }
}
```

### Administração _(somente admin)_

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/api/admin/users` | Lista todos os usuários do sistema com seus planos |
| `GET` | `/api/admin/plans` | Lista os planos disponíveis |
| `PUT` | `/api/admin/users/:id/plan` | Atribui ou remove plano — body: `{ "planId": 2 }` ou `{ "planId": null }` |
| `PUT` | `/api/admin/users/:id/role` | Altera o papel — body: `{ "role": "admin" }` ou `{ "role": "user" }` |
| `PUT` | `/api/admin/users/:id/active` | Ativa ou desativa a conta — body: `{ "isActive": false }` |

### Clientes

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/api/clients` | Lista clientes do usuário |
| `POST` | `/api/clients` | Cria cliente |
| `GET` | `/api/clients/:id` | Busca um cliente específico |
| `PUT` | `/api/clients/:id` | Atualiza cliente |
| `DELETE` | `/api/clients/:id` | Remove cliente (soft delete) |
| `GET` | `/api/clients/:id/services` | Histórico de atendimentos do cliente |

### Fotos de clientes

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/api/clients/:clientId/photos` | Lista fotos do cliente — retorna URLs assinadas (presigned) com TTL de 1h |
| `POST` | `/api/clients/:clientId/photos` | Upload de foto (`multipart/form-data`, campo `photo`; body: `takenAt`, `tag` (`before`/`after`/`reference`/`progress`/`other`), `notes`) |
| `PATCH` | `/api/clients/:clientId/photos/:id` | Atualiza `tag`, `notes` ou `takenAt` |
| `DELETE` | `/api/clients/:clientId/photos/:id` | Soft-delete + remove do storage |
| `POST` | `/api/admin/maintenance/cleanup-photos` | Hard-delete de fotos soft-deletadas há mais de N dias (`retentionDays`, padrão 30). Admin only. |

#### Storage

- **Em produção**: Cloudflare R2 (S3-compatível, 10 GB grátis, **sem custo de saída**). Configure as variáveis `R2_*` em `.env`. As fotos não ficam públicas — o backend gera URLs assinadas com expiração.
- **Em desenvolvimento**: se as variáveis R2 não estiverem definidas, o backend usa disco local (`UPLOAD_DIR`) e serve em `GET /uploads/clients/:userId/:clientId/<id>.jpg`.
- **Pipeline de upload**:
  1. Compressão client-side via `browser-image-compression` (4 MB → ~400 KB).
  2. `sharp` no servidor gera duas versões: original (1600px, q=82) e thumbnail (400×400, q=75).
  3. Ambas vão pro storage; metadados (tag, dimensões, mime, tamanho) ficam em `client_photo`.
- **Custo estimado**: 500 clientes × 20 fotos × 400 KB ≈ 4 GB → **grátis** no plano free do R2.

### Atendimentos

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/api/services` | Lista atendimentos |
| `POST` | `/api/services` | Cria atendimento (deduz estoque + gera despesas de material automaticamente) |
| `PUT` | `/api/services/:id` | Atualiza atendimento |
| `DELETE` | `/api/services/:id` | Remove atendimento |

### Produtos

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/api/products` | Lista produtos |
| `POST` | `/api/products` | Cria produto |
| `PUT` | `/api/products/:id` | Atualiza produto |
| `DELETE` | `/api/products/:id` | Remove produto |

### Estoque

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/api/inventory` | Lista entradas de estoque |
| `POST` | `/api/inventory` | Cria entrada de estoque |
| `PUT` | `/api/inventory/:id` | Atualiza quantidade (suporta decimais, ex.: `0.5`) |
| `DELETE` | `/api/inventory/:id` | Remove entrada |

### Despesas

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/api/expenses` | Lista despesas (gerais + vinculadas a atendimentos) |
| `POST` | `/api/expenses` | Cria despesa |
| `PUT` | `/api/expenses/:id` | Atualiza despesa |
| `DELETE` | `/api/expenses/:id` | Remove despesa |

### Tipos de Procedimento

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/api/procedure-types` | Lista tipos de procedimento |
| `POST` | `/api/procedure-types` | Cria tipo |
| `PUT` | `/api/procedure-types/:id` | Atualiza tipo |
| `DELETE` | `/api/procedure-types/:id` | Remove tipo |
| `GET` | `/api/procedure-types/:id/products` | Lista produtos vinculados ao tipo |
| `POST` | `/api/procedure-types/:id/products` | Vincula produto ao tipo com quantidade (upsert) |
| `DELETE` | `/api/procedure-types/:id/products/:productId` | Remove vínculo |

### Lucros

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/api/profits` | Lista lucros |
| `POST` | `/api/profits` | Registra lucro |
| `PUT` | `/api/profits/:id` | Atualiza lucro |
| `DELETE` | `/api/profits/:id` | Remove lucro |

### Dashboard

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/api/dashboard` | Retorna métricas consolidadas do usuário |

---

## Modelo de dados

### Diagrama resumido

```
plan ─────────────── user ──┬── client ──┬── service ──┬── service_procedure ── procedure_type ── procedure_type_product ── product
                            │            │             ├── expense                                                          │
                            │            └── client_photo             │                                                    └── inventory
                            │                         └── profit
                            ├── product
                            ├── procedure_type
                            ├── service
                            └── expense
```

### Campos principais por tabela

**`plan`**
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `name` | String (unique) | Nome do plano |
| `price` | Decimal | Preço mensal |
| `features` | JSON | Objeto com permissões e limites |
| `is_active` | Boolean | Se o plano está disponível para atribuição |

**`user`**
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `role` | String | `"user"` (padrão) ou `"admin"` |
| `plan_id` | Int? | FK para `plan` — `null` = sem plano |
| `is_active` | Boolean | `false` = conta bloqueada imediatamente |
| `reset_token` | String? | Token temporário para reset de senha |

**`client`**
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `user_id` | Int | Dono do registro (multi-tenancy) |
| `deleted_at` | DateTime? | Soft delete |

**`service`**
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `total_price` | Decimal | Soma dos preços dos procedimentos |
| `procedures` | Relation | Ligação N:N com `procedure_type` via `service_procedure` |

**`inventory.quantity`** e **`procedure_type_product.quantity`** usam `Decimal(10,3)` para suportar frações como `0.5`.

---

## Segurança

| Mecanismo | Detalhe |
|-----------|---------|
| **Helmet** | Headers HTTP seguros (CSP, HSTS, X-Frame-Options), `crossOriginResourcePolicy: cross-origin` para imagens |
| **CORS** | Origem configurável via `CORS_ORIGIN` no `.env` |
| **Rate limiting** | 200 req/IP a cada 15 min |
| **JWT** | Expiração configurável (padrão 7 dias) |
| **isActive no banco** | `authMiddleware` consulta o DB a cada request — bloqueio de conta é imediato |
| **Isolamento de dados** | Todos os repositórios filtram por `userId` — zero acesso cruzado entre usuários |
| **Soft deletes** | Dados nunca são apagados permanentemente |
| **Zod** | Todos os bodies validados antes de chegar nos use cases |
| **bcrypt** | Senhas sempre hasheadas, nunca em texto puro |
| **Admin manual** | Não existe endpoint de auto-promoção para admin — definido diretamente no banco |
