# Backend FastAPI - Missao Vieira

Este backend expõe os endpoints usados pelo frontend React:

- `GET /api/health`
- `POST /api/chat`
- `POST /api/admin/login`
- `GET /api/submissions`
- `POST /api/submissions`
- `DELETE /api/submissions`

## 1) Instalação

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

## 2) Configuração

Crie `.env` a partir de `.env.example` e preencha:

- `DATABASE_URL` com sua conexão PostgreSQL
- `OPENAI_API_KEY` (opcional, sem chave o chat usa fallback)

## 3) Execução

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

## 4) Teste fim a fim (pytest)

Defina também `TEST_DATABASE_URL` no `.env` (pode apontar para um banco de teste separado):

```bash
TEST_DATABASE_URL=postgresql://postgres:postgres@localhost:5432/missao_vieira_test
```

Depois execute:

```bash
pytest -q
```

### Execução com um comando (PostgreSQL + pytest)

Para subir um PostgreSQL local via Docker e rodar o E2E automaticamente:

```powershell
./scripts/run-e2e.ps1
```

Se quiser manter o container do banco ativo ao final:

```powershell
./scripts/run-e2e.ps1 -KeepRunning
```

## 5) Integração com frontend

No frontend, configure o arquivo `.env` com:

```bash
VITE_API_BASE_URL=http://localhost:8000
```

Se `VITE_API_BASE_URL` não for definido, o frontend usa rota relativa (`/api/...`).
