import re
from typing import Literal, Optional
from pydantic import BaseModel, Field, field_validator

UNSAFE = re.compile(
    r"\b(close your eyes|closing your eyes|eyes closed|"
    r"touch\w*|feel\w*|smell\w*|taste\w*|finger\w*|hands?|"
    r"rub\w*|squeez\w*|pluck\w*|picking|pick up)\b",
    re.I,
)

class MissionRequest(BaseModel):
    duration: Literal[5, 10, 15]
    surroundings: Literal["campus", "park", "neighborhood", "anywhere"]
    difficulty: Literal["easy", "curious", "explorer"] = "easy"


class Mission(BaseModel):
    title: str = Field(min_length=3, max_length=80)
    task: str = Field(min_length=10, max_length=300)
    hint: str = Field(min_length=3, max_length=200)
    minutes: int = Field(ge=1, le=10)
    learn: str = Field(min_length=10, max_length=300)
    @field_validator("task", "hint")
    @classmethod
    def no_unsafe_instructions(cls, v: str) -> str:
        if UNSAFE.search(v):
            raise ValueError("unsafe instruction")
        return v


class MissionPack(BaseModel):
    missions: list[Mission] = Field(min_length=3, max_length=3)


class MissionResponse(BaseModel):
    missions: list[Mission]
    source: Literal["ai", "fallback"]
    model: Optional[str] = None
    notice: Optional[str] = None
    elapsed_seconds: Optional[float] = None