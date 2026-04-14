from datetime import datetime
from typing import Literal

from fastapi import APIRouter
from pydantic import BaseModel


router = APIRouter(tags=["Suggestions"])


class SuggestInput(BaseModel):
    crowd_level: Literal["low", "medium", "high"]


def get_time_slot_and_level(current_hour: int) -> tuple[str, Literal["low", "medium", "high"]]:
    if 6 <= current_hour <= 11:
        return "morning", "high"
    if 12 <= current_hour <= 16:
        return "afternoon", "medium"
    return "evening_or_night", "low"


def level_to_score(level: Literal["low", "medium", "high"]) -> int:
    if level == "low":
        return 1
    if level == "medium":
        return 2
    return 3


def score_to_level(score: int) -> Literal["low", "medium", "high"]:
    if score <= 1:
        return "low"
    if score == 2:
        return "medium"
    return "high"


def suggestion_for_level(level: Literal["low", "medium", "high"]) -> str:
    if level == "high":
        return "Add bus"
    if level == "medium":
        return "No change"
    return "Reduce bus"


@router.post("/suggest")
def suggest_bus_action(payload: SuggestInput) -> dict[str, str | int]:
    current_hour = datetime.now().hour
    time_slot, time_based_level = get_time_slot_and_level(current_hour)

    user_score = level_to_score(payload.crowd_level)
    time_score = level_to_score(time_based_level)
    # Round half up to blend user input and time-based baseline.
    blended_score = int(((user_score + time_score) / 2) + 0.5)
    effective_level = score_to_level(blended_score)
    action = suggestion_for_level(effective_level)

    return {
        "suggestion": action,
        "crowd_level": effective_level,
        "user_crowd_level": payload.crowd_level,
        "time_based_crowd_level": time_based_level,
        "effective_crowd_level": effective_level,
        "time_slot": time_slot,
        "current_hour": current_hour,
    }
