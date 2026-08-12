import json
import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List, Optional, Literal

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

try:
    from openai import OpenAI
except Exception:
    OpenAI = None

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent
DB_FILE = BASE_DIR / "submissions_db.json"

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


def read_submissions() -> List[SubmissionRecord]:
    if not DB_FILE.exists():
        return []

    try:
        raw = DB_FILE.read_text(encoding="utf-8")
        payload = json.loads(raw)
        return [SubmissionRecord.model_validate(item) for item in payload]
    except Exception:
        return []


def write_submissions(records: List[SubmissionRecord]) -> None:
    serializable = [record.model_dump() for record in records]
    DB_FILE.write_text(json.dumps(serializable, ensure_ascii=False, indent=2), encoding="utf-8")


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
    return {"status": "ok", "app": "Missao Vieira FastAPI"}


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

        submissions = read_submissions()

        new_record = SubmissionRecord(
            id=f"sub_{int(datetime.now().timestamp() * 1000)}",
            studentInfo=student_info,
            topPath=top_path,
            topPathTitle=top_path_title,
            matchPercentage=match_percentage,
            scores=scores,
            submittedAt=datetime.now(timezone.utc).isoformat(),
        )

        existing_index = -1
        for idx, item in enumerate(submissions):
            same_phone = bool(student_info.phone) and item.studentInfo.phone == student_info.phone
            same_student = (
                item.studentInfo.fullName.strip().lower() == student_info.fullName.strip().lower()
                and item.studentInfo.classGroup == student_info.classGroup
            )
            if same_phone or same_student:
                existing_index = idx
                break

        if existing_index >= 0:
            submissions[existing_index] = new_record
        else:
            submissions.append(new_record)

        write_submissions(submissions)

        return {
            "success": True,
            "record": new_record.model_dump(),
            "totalSubmissions": len(submissions),
        }
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Erro ao salvar respostas do aluno: {exc}") from exc


@app.delete("/api/submissions")
def clear_submissions() -> Dict[str, object]:
    write_submissions([])
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

    uvicorn.run("main:app", host="0.0.0.0", port=int(os.getenv("PORT", "8000")), reload=True)
