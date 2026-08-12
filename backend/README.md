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

Crie `.env` a partir de `.env.example` e preencha `OPENAI_API_KEY`.

## 3) Execução

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

## 4) Integração com frontend

No frontend, configure o arquivo `.env` com:

```bash
VITE_API_BASE_URL=http://localhost:8000
```

Se `VITE_API_BASE_URL` não for definido, o frontend usa rota relativa (`/api/...`).
