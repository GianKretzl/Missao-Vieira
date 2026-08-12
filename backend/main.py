import os
from datetime import datetime, timezone
from typing import Dict, List, Optional, Literal

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from psycopg import connect
from psycopg.rows import dict_row

try:
    from openai import OpenAI
except Exception:
    OpenAI = None

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/missao_vieira")

app = FastAPI(title="Missao Vieira API", version="1.0.0")

cors_origins_env = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173")
allowed_origins = [origin.strip() for origin in cors_origins_env.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    init_db()


class StudentInfo(BaseModel):
    fullName: str
    classGroup: str
    phone: str = ""
    guardianName: str = ""


class Scores(BaseModel):
    regular: int = 0
    administracao: int = 0
    eletromecanica: int = 0


class SubmissionRecord(BaseModel):
    id: str
    studentInfo: StudentInfo
    topPath: str
    topPathTitle: str
    matchPercentage: int
    scores: Scores
    submittedAt: str


class AdminLoginRequest(BaseModel):
    username: str
    password: str


class ChatMessage(BaseModel):
    id: str
    sender: Literal["ai", "user"]
    text: str
    timestamp: Optional[str] = None


class ChatRequest(BaseModel):
    message: str
    turn_count: int = Field(default=0, ge=0)
    history: List[ChatMessage] = []


class ChatResponse(BaseModel):
    reply: str
    options: Optional[List[str]] = None
    scores: Scores


def get_connection():
    return connect(DATABASE_URL, autocommit=True, row_factory=dict_row)


def init_db() -> None:
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                CREATE TABLE IF NOT EXISTS submissions (
                    id TEXT PRIMARY KEY,
                    full_name TEXT NOT NULL,
                    class_group TEXT NOT NULL,
                    phone TEXT NOT NULL DEFAULT '',
                    guardian_name TEXT NOT NULL DEFAULT '',
                    top_path TEXT NOT NULL,
                    top_path_title TEXT NOT NULL,
                    match_percentage INTEGER NOT NULL,
                    score_regular INTEGER NOT NULL DEFAULT 0,
                    score_administracao INTEGER NOT NULL DEFAULT 0,
                    score_eletromecanica INTEGER NOT NULL DEFAULT 0,
                    submitted_at TIMESTAMPTZ NOT NULL
                )
                """
            )
            cur.execute(
                """
                CREATE INDEX IF NOT EXISTS idx_submissions_phone ON submissions (phone)
                """
            )
            cur.execute(
                """
                CREATE INDEX IF NOT EXISTS idx_submissions_name_class ON submissions ((lower(full_name)), class_group)
                """
            )


def to_submission_record(row: Dict[str, object]) -> SubmissionRecord:
    submitted_at = row["submitted_at"]
    submitted_text = submitted_at.isoformat() if hasattr(submitted_at, "isoformat") else str(submitted_at)
    return SubmissionRecord(
        id=str(row["id"]),
        studentInfo=StudentInfo(
            fullName=str(row["full_name"]),
            classGroup=str(row["class_group"]),
            phone=str(row["phone"] or ""),
            guardianName=str(row["guardian_name"] or ""),
        ),
        topPath=str(row["top_path"]),
        topPathTitle=str(row["top_path_title"]),
        matchPercentage=int(row["match_percentage"]),
        scores=Scores(
            regular=int(row["score_regular"]),
            administracao=int(row["score_administracao"]),
            eletromecanica=int(row["score_eletromecanica"]),
        ),
        submittedAt=submitted_text,
    )


def read_submissions() -> List[SubmissionRecord]:
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT *
                FROM submissions
                ORDER BY submitted_at DESC
                """
            )
            rows = cur.fetchall()
    return [to_submission_record(row) for row in rows]


def upsert_submission(record: SubmissionRecord) -> None:
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT id
                FROM submissions
                WHERE (
                    %s <> '' AND phone = %s
                )
                OR (
                    lower(full_name) = lower(%s) AND class_group = %s
                )
                ORDER BY submitted_at DESC
                LIMIT 1
                """,
                (
                    record.studentInfo.phone,
                    record.studentInfo.phone,
                    record.studentInfo.fullName,
                    record.studentInfo.classGroup,
                ),
            )
            existing = cur.fetchone()
            submission_id = existing["id"] if existing else record.id

            cur.execute(
                """
                INSERT INTO submissions (
                    id,
                    full_name,
                    class_group,
                    phone,
                    guardian_name,
                    top_path,
                    top_path_title,
                    match_percentage,
                    score_regular,
                    score_administracao,
                    score_eletromecanica,
                    submitted_at
                )
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (id) DO UPDATE SET
                    full_name = EXCLUDED.full_name,
                    class_group = EXCLUDED.class_group,
                    phone = EXCLUDED.phone,
                    guardian_name = EXCLUDED.guardian_name,
                    top_path = EXCLUDED.top_path,
                    top_path_title = EXCLUDED.top_path_title,
                    match_percentage = EXCLUDED.match_percentage,
                    score_regular = EXCLUDED.score_regular,
                    score_administracao = EXCLUDED.score_administracao,
                    score_eletromecanica = EXCLUDED.score_eletromecanica,
                    submitted_at = EXCLUDED.submitted_at
                """,
                (
                    submission_id,
                    record.studentInfo.fullName,
                    record.studentInfo.classGroup,
                    record.studentInfo.phone,
                    record.studentInfo.guardianName,
                    record.topPath,
                    record.topPathTitle,
                    record.matchPercentage,
                    record.scores.regular,
                    record.scores.administracao,
                    record.scores.eletromecanica,
                    datetime.fromisoformat(record.submittedAt),
                ),
            )


def clear_submissions_db() -> None:
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("DELETE FROM submissions")


def score_from_text(text: str) -> Scores:
    user_text = text.lower()
    scores = Scores()

    if any(word in user_text for word in ["ferramenta", "montar", "elétrica", "eletrica", "máquina", "maquina", "prática", "pratica", "desmontar"]):
        scores.eletromecanica += 3

    if any(word in user_text for word in ["organizar", "evento", "projeto", "vendas", "negócio", "negocio", "equipe", "liderar"]):
        scores.administracao += 3

    if any(word in user_text for word in ["livro", "escrever", "estudar", "enem", "pesquisar", "teoria", "faculdade"]):
        scores.regular += 3

    return scores


def build_fallback_reply(turn_count: int) -> Dict[str, Optional[List[str]]]:
    if turn_count == 0:
        return {
            "reply": "Entendi perfeitamente! E quando se trata de usar tecnologia no dia a dia, o que você acha mais empolgante?",
            "options": [
                "🤖 Entender como funcionam os circuitos, motores e robôs por dentro",
                "📱 Usar ferramentas digitais para criar campanhas, gerenciar projetos e dados",
                "🔬 Usar simulações digitais e softwares para pesquisas de disciplinas escolares",
            ],
        }
    if turn_count == 1:
        return {
            "reply": "Fantástico! Suas respostas nos deram uma visão clara e objetiva sobre suas habilidades principais!",
            "options": None,
        }

    return {
        "reply": "Sensacional! Sua escolha revela muito sobre a forma como você resolve problemas e pensa o seu futuro.",
        "options": None,
    }


def build_openai_reply(message: str, turn_count: int, history: List[ChatMessage]) -> Optional[str]:
    api_key = os.getenv("OPENAI_API_KEY")
    model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

    if not api_key or OpenAI is None:
        return None

    try:
        client = OpenAI(api_key=api_key)

        previous_lines = "\n".join([f"{item.sender}: {item.text}" for item in history[-6:]])
        prompt = (
            "Você é um orientador vocacional jovem para estudantes brasileiros do ensino médio. "
            "Responda em português do Brasil, em 2-3 frases, com tom motivador e prático."
            f"\nTurno: {turn_count}"
            f"\nHistórico recente:\n{previous_lines}"
            f"\nMensagem do aluno: {message}"
        )

        completion = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": "Você orienta estudantes a descobrirem interesses profissionais com clareza e empatia."},
                {"role": "user", "content": prompt},
            ],
            temperature=0.7,
            max_tokens=220,
        )

        answer = completion.choices[0].message.content if completion.choices else None
        return answer.strip() if answer else None
    except Exception:
        return None


@app.get("/api/health")
def health() -> Dict[str, str]:
    try:
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT 1")
                cur.fetchone()
        return {"status": "ok", "app": "Missao Vieira FastAPI", "database": "ok"}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Database unavailable: {exc}") from exc


@app.post("/api/admin/login")
def admin_login(payload: AdminLoginRequest) -> Dict[str, object]:
    valid_users = {
        "admin": "missaovieira",
        "direcao": "missaovieira",
        "coordenacao": "admin123",
    }

    user_key = payload.username.lower()
    if user_key in valid_users and valid_users[user_key] == payload.password:
        display_name = "Administrador Missao Vieira"
        if user_key == "direcao":
            display_name = "Direcao Escolar"
        elif user_key == "coordenacao":
            display_name = "Coordenacao Pedagogica"

        return {
            "success": True,
            "token": f"mv_admin_{int(datetime.now().timestamp())}",
            "user": {
                "username": payload.username,
                "name": display_name,
                "role": "Administrator",
            },
        }

    raise HTTPException(status_code=401, detail="Usuário ou senha incorretos. Tente: admin / missaovieira")


@app.get("/api/submissions")
def get_submissions() -> List[Dict[str, object]]:
    return [record.model_dump() for record in read_submissions()]


@app.post("/api/submissions")
def create_submission(payload: Dict[str, object]) -> Dict[str, object]:
    try:
        student_info_raw = payload.get("studentInfo")
        if not isinstance(student_info_raw, dict):
            raise HTTPException(status_code=400, detail="Dados do aluno incompletos.")

        student_info = StudentInfo.model_validate(student_info_raw)
        if not student_info.fullName or not student_info.classGroup:
            raise HTTPException(status_code=400, detail="Dados do aluno incompletos.")

        scores = Scores.model_validate(payload.get("scores") or {})
        top_path = str(payload.get("topPath") or "regular")
        top_path_title = str(payload.get("topPathTitle") or "Ensino Médio Regular")
        match_percentage = int(payload.get("matchPercentage") or 85)

        new_record = SubmissionRecord(
            id=f"sub_{int(datetime.now().timestamp() * 1000)}",
            studentInfo=student_info,
            topPath=top_path,
            topPathTitle=top_path_title,
            matchPercentage=match_percentage,
            scores=scores,
            submittedAt=datetime.now(timezone.utc).isoformat(),
        )

        upsert_submission(new_record)
        total_submissions = len(read_submissions())

        return {
            "success": True,
            "record": new_record.model_dump(),
            "totalSubmissions": total_submissions,
        }
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Erro ao salvar respostas do aluno: {exc}") from exc


@app.delete("/api/submissions")
def clear_submissions() -> Dict[str, object]:
    clear_submissions_db()
    return {"success": True, "message": "Todas as respostas foram limpas."}


@app.post("/api/chat", response_model=ChatResponse)
def chat(payload: ChatRequest) -> ChatResponse:
    scores = score_from_text(payload.message)
    fallback = build_fallback_reply(payload.turn_count)

    ai_reply = build_openai_reply(payload.message, payload.turn_count, payload.history)

    return ChatResponse(
        reply=ai_reply or fallback["reply"] or "Ótima resposta! Isso ajuda muito a definir seu perfil.",
        options=fallback["options"],
        scores=scores,
    )


if __name__ == "__main__":
    import uvicorn

    init_db()

    uvicorn.run("main:app", host="0.0.0.0", port=int(os.getenv("PORT", "8000")), reload=True)
