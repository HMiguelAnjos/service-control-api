# Service Control API

API REST para controle de gastos, estoque e lucros de uma empresa de serviços. Permite gerenciar clientes, tipos de procedimento, serviços prestados, despesas, produtos, inventário e lucros.

## Tecnologias

- **Node.js** + **TypeScript**
- **Express** — framework HTTP
- **Prisma ORM** — acesso ao banco de dados
- **PostgreSQL** — banco de dados relacional
- **Zod** — validação de schemas e sanitização de entrada
- **JWT** (`jsonwebtoken`) — autenticação stateless
- **bcryptjs** — hash seguro de senhas
- **Swagger UI** — documentação interativa da API
- **Chalk** — logs coloridos no terminal

## Arquitetura

O projeto segue os princípios da **Arquitetura Hexagonal (Ports & Adapters)**, com separação clara entre camadas:

```
src/
├── main/               # Bootstrap da aplicação (Express, Swagger)
├── domain/
│   └── entities/       # Entidades de domínio com regras de negócio
├── application/
│   ├── dto/            # Data Transfer Objects
│   ├── ports/          # Interfaces dos repositórios (contratos)
│   └── use-cases/      # Casos de uso (orquestração da lógica)
├── infrastructure/
│   └── db/             # Implementações Prisma dos repositórios
├── adapters/
│   └── controllers/    # Adaptadores HTTP (controllers Express)
├── routes/             # Definição de rotas e injeção de dependências
└── middlewares/        # Logger e tratamento de erros
```

### Fluxo de uma requisição

```
HTTP Request → Routes → Controller → Use Case → Repository (Port) → Prisma → PostgreSQL
```

## Pré-requisitos

- Node.js 18+
- PostgreSQL rodando localmente (ou via Docker)

## Configuração

1. Clone o repositório e instale as dependências:

```bash
npm install
```

2. Crie o arquivo `.env` a partir do exemplo:

```bash
cp .env.example .env
```

Edite o `.env` com suas credenciais:

```env
PORT=3000
DATABASE_URL=postgresql://usuario:senha@localhost:5432/service-control
JWT_SECRET=troque-por-uma-string-longa-e-segura
JWT_EXPIRES_IN=7d
CORS_ORIGIN=*
```

> **Importante:** `JWT_SECRET` deve ser uma string longa, aleatória e secreta. Nunca exponha este valor em repositórios públicos.

3. Execute as migrations do banco de dados:

```bash
npx prisma migrate dev --name add-user-auth
```

> Use `migrate dev` em desenvolvimento (cria o banco se não existir e aplica as migrations).  
> Em produção, use `npx prisma migrate deploy`.

4. (Opcional) Gere o Prisma Client manualmente caso necessário:

```bash
npx prisma generate
```

## Executando

### Desenvolvimento (hot-reload)

```bash
npm run dev
```

### Produção

```bash
npm run build
npm start
```

## Documentação da API

Com o servidor rodando, acesse a documentação Swagger em:

```
http://localhost:3000/api-docs
```

## Autenticação

A API usa **JWT Bearer Token**. O fluxo é:

1. **Registrar** → `POST /api/auth/register` — cria o usuário e retorna um token
2. **Login** → `POST /api/auth/login` — autentica e retorna um token
3. **Usar o token** → inclua o header em todas as demais requisições:

```
Authorization: Bearer <seu_token_aqui>
```

Todos os endpoints sob `/api` (exceto `/api/auth`) exigem o token. Cada usuário enxerga e gerencia apenas os seus próprios dados.

### Registro

`POST /api/auth/register`

```json
{
  "name": "Maria Souza",
  "email": "maria@email.com",
  "password": "senha123"
}
```

Resposta `201`:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { "id": 1, "name": "Maria Souza", "email": "maria@email.com" }
}
```

### Login

`POST /api/auth/login`

```json
{
  "email": "maria@email.com",
  "password": "senha123"
}
```

Resposta `200`:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { "id": 1, "name": "Maria Souza", "email": "maria@email.com" }
}
```

---

## Endpoints

Todos os recursos seguem o padrão REST. A base da URL é `/api`.  
**Todos os endpoints abaixo exigem** `Authorization: Bearer <token>`.

### Clientes — `/api/clients`

| Método | Endpoint                       | Descrição                        |
|--------|--------------------------------|----------------------------------|
| POST   | `/api/clients`                 | Criar cliente                    |
| GET    | `/api/clients`                 | Listar todos os clientes         |
| GET    | `/api/clients/:id/services`    | Histórico de serviços do cliente |
| PUT    | `/api/clients/:id`             | Atualizar cliente                |
| DELETE | `/api/clients/:id`             | Remover cliente (soft)           |

**Corpo (POST/PUT):**
```json
{
  "name": "João Silva",
  "phone": "11999999999",
  "email": "joao@email.com"
}
```

---

### Tipos de Procedimento — `/api/procedure-types`

| Método | Endpoint                   | Descrição                        |
|--------|----------------------------|----------------------------------|
| POST   | `/api/procedure-types`     | Criar tipo de procedimento       |
| GET    | `/api/procedure-types`     | Listar tipos de procedimento     |
| PUT    | `/api/procedure-types/:id` | Atualizar tipo de procedimento   |
| DELETE | `/api/procedure-types/:id` | Remover tipo de procedimento     |

**Corpo (POST/PUT):**
```json
{
  "name": "Corte de Cabelo",
  "description": "Corte masculino ou feminino"
}
```

---

### Serviços — `/api/services`

| Método | Endpoint           | Descrição             |
|--------|--------------------|-----------------------|
| POST   | `/api/services`    | Registrar serviço     |
| GET    | `/api/services`    | Listar serviços       |
| PUT    | `/api/services/:id`| Atualizar serviço     |
| DELETE | `/api/services/:id`| Remover serviço       |

**Corpo (POST/PUT):**
```json
{
  "clientId": 1,
  "procedureId": 2,
  "price": 150.00,
  "date": "2024-04-10T10:00:00Z",
  "description": "Corte e barba"
}
```

---

### Despesas — `/api/expenses`

| Método | Endpoint            | Descrição         |
|--------|---------------------|-------------------|
| POST   | `/api/expenses`     | Registrar despesa |
| GET    | `/api/expenses`     | Listar despesas   |
| PUT    | `/api/expenses/:id` | Atualizar despesa |
| DELETE | `/api/expenses/:id` | Remover despesa   |

**Corpo (POST/PUT):**
```json
{
  "serviceId": 1,
  "category": "Material",
  "amount": 25.50,
  "notes": "Produtos utilizados no serviço"
}
```

---

### Produtos — `/api/products`

| Método | Endpoint            | Descrição         |
|--------|---------------------|-------------------|
| POST   | `/api/products`     | Cadastrar produto |
| GET    | `/api/products`     | Listar produtos   |
| PUT    | `/api/products/:id` | Atualizar produto |
| DELETE | `/api/products/:id` | Remover produto   |

**Corpo (POST/PUT):**
```json
{
  "name": "Shampoo Profissional",
  "unitCost": 35.00,
  "description": "500ml"
}
```

---

### Inventário — `/api/inventory`

| Método | Endpoint             | Descrição               |
|--------|----------------------|-------------------------|
| POST   | `/api/inventory`     | Criar entrada no estoque |
| GET    | `/api/inventory`     | Listar estoque          |
| PUT    | `/api/inventory/:id` | Atualizar quantidade    |
| DELETE | `/api/inventory/:id` | Remover item do estoque |

**Corpo (POST/PUT):**
```json
{
  "productId": 1,
  "quantity": 50
}
```

---

### Produtos por Serviço — `/api/service-products`

| Método | Endpoint                    | Descrição                              |
|--------|-----------------------------|----------------------------------------|
| POST   | `/api/service-products`     | Vincular produto a um serviço          |
| GET    | `/api/service-products`     | Listar produtos utilizados em serviços |
| PUT    | `/api/service-products/:id` | Atualizar quantidade usada             |
| DELETE | `/api/service-products/:id` | Remover vínculo                        |

**Corpo (POST/PUT):**
```json
{
  "serviceId": 1,
  "productId": 2,
  "quantity": 2
}
```

---

### Dashboard — `/api/dashboard`

| Método | Endpoint          | Descrição                  |
|--------|-------------------|----------------------------|
| GET    | `/api/dashboard`  | Resumo financeiro do usuário |

Resposta `200`:
```json
{
  "totalRevenue": 5000.00,
  "totalExpenses": 1200.50,
  "netProfit": 3799.50,
  "totalServices": 32,
  "servicesThisMonth": 8,
  "topProcedures": [
    { "id": 1, "name": "Corte de Cabelo", "count": 15, "revenue": 2250.00 }
  ],
  "topClients": [
    { "id": 3, "name": "Maria Souza", "count": 7, "revenue": 1050.00 }
  ]
}
```

---

### Lucros — `/api/profits`

| Método | Endpoint           | Descrição              |
|--------|--------------------|------------------------|
| POST   | `/api/profits`     | Registrar lucro        |
| GET    | `/api/profits`     | Listar lucros          |
| PUT    | `/api/profits/:id` | Atualizar lucro        |
| DELETE | `/api/profits/:id` | Remover registro       |

**Corpo (POST/PUT):**
```json
{
  "serviceId": 1,
  "totalProfit": 124.50,
  "marginPct": 83.0
}
```

---

## Regras de Negócio

- **Lucro automático:** ao criar um serviço, um registro de lucro é criado automaticamente (`totalProfit = price`, `marginPct = 100%`). O lucro é recalculado automaticamente sempre que uma despesa é criada, atualizada ou removida, e também quando o preço do serviço é atualizado.
- **Cascade delete:** ao remover um serviço, todas as suas despesas, produtos utilizados e o registro de lucro são removidos junto (soft delete em cascata).
- **Isolamento por usuário:** cada usuário acessa apenas seus próprios dados. O token JWT identifica o usuário e filtra todos os dados automaticamente.

---

## Modelo de Dados

```
client ──< service >── procedure_type
              │
              ├──< expense
              ├──< service_product >── product ──── inventory
              └──── profit
```

- **client**: clientes da empresa
- **procedure_type**: categorias de serviço (ex: corte, tintura)
- **service**: atendimento realizado para um cliente
- **expense**: custo vinculado a um serviço
- **product**: produto/insumo cadastrado
- **inventory**: estoque atual de cada produto
- **service_product**: produtos usados em um determinado serviço
- **profit**: lucro calculado por serviço

> Todos os registros utilizam **soft delete** — nenhum dado é apagado fisicamente do banco. O campo `deletedAt` é preenchido na remoção.

## Respostas de Erro

| Status | Significado                                      |
|--------|--------------------------------------------------|
| 400    | Dados inválidos (validação Zod falhou)           |
| 401    | Token ausente, inválido ou expirado              |
| 404    | Recurso não encontrado                           |
| 409    | Conflito (ex: e-mail já cadastrado)              |
| 500    | Erro interno do servidor                         |

Erro de validação (400):
```json
{
  "error": "Dados inválidos",
  "details": [
    { "field": "email", "message": "Invalid email" },
    { "field": "password", "message": "String must contain at least 6 character(s)" }
  ]
}
```

Erro de autenticação (401):
```json
{
  "error": "Token não fornecido"
}
```

## Scripts Disponíveis

| Comando           | Descrição                              |
|-------------------|----------------------------------------|
| `npm run dev`     | Inicia em modo desenvolvimento         |
| `npm run build`   | Compila TypeScript para JavaScript     |
| `npm start`       | Inicia o servidor compilado            |
