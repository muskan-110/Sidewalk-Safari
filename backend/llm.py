"""Model-agnostic Ollama client. Swap models via environment variables."""
import json
import logging
import os

import httpx

logging.basicConfig(level=logging.INFO)
log = logging.getLogger("safari")

OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434")
TEXT_MODEL = os.getenv("TEXT_MODEL", "gemma3:4b")
VISION_MODEL = os.getenv("VISION_MODEL", "gemma3:4b")
TIMEOUT = float(os.getenv("LLM_TIMEOUT", "120"))
TEMPERATURE = float(os.getenv("LLM_TEMPERATURE", "0.3"))
FORMAT_MODE = os.getenv("LLM_FORMAT_MODE", "prompt")  # "schema" or "prompt"


class LLMUnavailable(Exception):
    """Ollama is down, the model is missing, or the request timed out."""


class LLMBadOutput(Exception):
    """The model replied, but not with parseable JSON."""


def installed_models() -> list[str]:
    try:
        r = httpx.get(f"{OLLAMA_URL}/api/tags", timeout=3)
        r.raise_for_status()
        return [m["name"] for m in r.json().get("models", [])]
    except (httpx.HTTPError, ValueError, KeyError):
        return []


def _extract_json(text: str) -> str:
    """Pull the JSON object out of a reply that may include markdown fences."""
    start, end = text.find("{"), text.rfind("}")
    return text[start : end + 1] if start != -1 and end > start else text


def generate_json(prompt: str, schema: dict, model: str | None = None) -> dict:
    payload = {
        "model": model or TEXT_MODEL,
        "messages": [{"role": "user", "content": prompt}],
        "stream": False,
        "keep_alive": "30m",
        "options": {"temperature": TEMPERATURE, "num_predict": 700},
    }
    if FORMAT_MODE == "schema":
        payload["format"] = schema  # Ollama constrains output to this JSON schema
    try:
        r = httpx.post(f"{OLLAMA_URL}/api/chat", json=payload, timeout=TIMEOUT)
        r.raise_for_status()
        data = r.json()
        content = data["message"]["content"]
        n, ns = data.get("eval_count"), data.get("eval_duration")
        if n and ns:
            log.info(
                "Generated %d tokens at %.1f tok/s (temp=%.2f, mode=%s)",
                n, n / (ns / 1e9), TEMPERATURE, FORMAT_MODE,
            )
        log.info(
            "load=%.1fs prompt_eval=%.1fs",
            data.get("load_duration", 0) / 1e9,
            data.get("prompt_eval_duration", 0) / 1e9,
        )
    except (httpx.HTTPError, KeyError, ValueError) as e:
        raise LLMUnavailable(str(e)) from e

    try:
        return json.loads(_extract_json(content))
    except json.JSONDecodeError as e:
        raise LLMBadOutput(str(e)) from e


def warm_up(model: str | None = None) -> None:
    """Load the model into memory so the first real request isn't the slow one."""
    try:
        httpx.post(
            f"{OLLAMA_URL}/api/generate",
            json={"model": model or TEXT_MODEL, "keep_alive": "30m"},
            timeout=TIMEOUT,
        )
    except httpx.HTTPError:
        pass