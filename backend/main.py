import json
import logging
import random
import threading
import time
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import ValidationError

import llm
from prompts import JSON_HINT, build_mission_prompt
from schemas import Mission, MissionPack, MissionRequest, MissionResponse

log = logging.getLogger("safari")


@asynccontextmanager
async def lifespan(app: FastAPI):
    threading.Thread(target=llm.warm_up, daemon=True).start()
    yield


app = FastAPI(title="Sidewalk Safari API", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

FALLBACK = json.loads((Path(__file__).parent / "fallback.json").read_text(encoding="utf-8"))
MISSION_SCHEMA = MissionPack.model_json_schema()


def fit_minutes(missions: list[Mission], total: int) -> list[Mission]:
    """Scale the estimated minutes down so they never add up to more than the chosen walk."""
    used = sum(m.minutes for m in missions)
    if used <= total:
        return missions
    factor = total / used
    return [m.model_copy(update={"minutes": max(1, int(m.minutes * factor))}) for m in missions]


def fallback_response(notice: str, started: float, total: int) -> MissionResponse:
    picks = [Mission(**m) for m in random.sample(FALLBACK, 3)]
    return MissionResponse(
        missions=fit_minutes(picks, total),
        source="fallback",
        model=None,
        notice=notice,
        elapsed_seconds=round(time.perf_counter() - started, 1),
    )


@app.get("/api/health")
def health():
    models = llm.installed_models()
    return {
        "ollama_reachable": bool(models),
        "text_model": llm.TEXT_MODEL,
        "text_model_installed": llm.TEXT_MODEL in models,
        "vision_model": llm.VISION_MODEL,
        "vision_model_installed": llm.VISION_MODEL in models,
        "format_mode": llm.FORMAT_MODE,
    }


@app.post("/api/missions", response_model=MissionResponse)
def missions(req: MissionRequest):
    started = time.perf_counter()
    prompt = build_mission_prompt(req)
    if llm.FORMAT_MODE == "prompt":
        prompt += JSON_HINT

    for attempt in (1, 2):  # one retry on bad output
        try:
            raw = llm.generate_json(prompt, MISSION_SCHEMA)
            pack = MissionPack.model_validate(raw)
            elapsed = round(time.perf_counter() - started, 1)
            log.info("Generated missions in %ss (attempt %d)", elapsed, attempt)
            return MissionResponse(
                missions=fit_minutes(pack.missions, req.duration),
                source="ai",
                model=llm.TEXT_MODEL,
                elapsed_seconds=elapsed,
            )
        except llm.LLMUnavailable as e:
            log.warning("LLM unavailable: %s", e)
            return fallback_response(
                "The local AI model isn't available, so here is the built-in offline mission pack.",
                started,
                req.duration,
            )
        except (llm.LLMBadOutput, ValidationError) as e:
            log.warning("Bad model output (attempt %d): %s", attempt, e)
            prompt += (
                "\n\nYour previous answer was rejected. Use eyes only: never mention "
                "touching, feeling, hands, fingers, smelling, or closing your eyes. "
                "Return valid JSON matching the schema."
            )

    return fallback_response(
        "The AI returned something unusable twice, so here is the built-in offline mission pack.",
        started,
        req.duration,
    )