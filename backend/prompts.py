import random

from schemas import MissionRequest

DIFFICULTY_NOTES = {
    "easy": "Very simple things almost anyone can find within a minute or two.",
    "curious": "Needs some close looking, comparing, or noticing small details.",
    "explorer": "Needs patience: patterns, changes over time, or relationships between living things.",
}

SURROUNDING_NOTES = {
    "campus": "a college campus (lawns, trees, hedges, flower beds)",
    "park": "a park or garden",
    "neighborhood": "a residential neighborhood (street trees, verges, small gardens, walls with moss)",
    "anywhere": "any ordinary outdoor space",
}

# Grouped so the 3 missions always come from 3 different groups (no two leaf missions).
THEME_GROUPS = [
    ["leaf color or leaf shape", "how two different nearby plants differ"],
    ["bark or tree trunk texture (look only)", "a tree's branching pattern"],
    [
        "signs that an insect or small animal has been around (nibbled leaves, webs, tiny holes)",
        "something small most people walk past (moss, lichen, seeds, tiny flowers)",
    ],
    ["light and shadow on a plant", "sky, clouds, or how the wind moves things"],
    ["a flower, seed pod, or fruit growing on a plant (look only)"],
    ["soil, stones, or what grows in cracks"],
]

EXAMPLES = """Style examples (do NOT copy them):
- Title: "Three Shades of Green" | Task: "Find one leaf that shows three different shades of green." | Hint: "Check the underside and near the veins."
- Title: "Who Visited This Plant?" | Task: "Find a sign that an insect has been on a plant, such as a nibbled edge or a tiny hole." | Hint: "Lower leaves are easiest to check."
"""


def build_mission_prompt(req: MissionRequest) -> str:
    groups = random.sample(THEME_GROUPS, 3)
    themes = [random.choice(g) for g in groups]
    per_mission = "\n".join(f"- Mission {i + 1} focus: {t}" for i, t in enumerate(themes))

    return f"""You design short nature-observation missions for a walking app.
The person has {req.duration} minutes outdoors in {SURROUNDING_NOTES[req.surroundings]}.
Difficulty: {req.difficulty}. {DIFFICULTY_NOTES[req.difficulty]}

Create exactly 3 different missions, one per focus:
{per_mission}

Rules:
- Only natural things: plants, soil, stones, insects' traces, sky, light, sounds of nature. No buildings, paths, vehicles, or other man-made objects.
- Every task must end with something concrete the person can find, see, hear, or point to. Never "remember it in your mind" or "think about".
- Never ask the person to use the internet, read, or look at their phone.
- Eyes and ears only: never ask the person to touch, feel, smell, or taste anything, and never ask them to close their eyes. Also no picking flowers, no approaching animals, no climbing, no leaving paths, no entering traffic.
- Achievable in ordinary surroundings with no equipment and no rare species. Do not claim certainty about species.
- Together the 3 missions fit in {req.duration} minutes ("minutes" is 1 to 5 each).
- "title": short, specific and engaging; avoid generic words like "Treasures" or "Secrets". "task": one clear sentence. "hint": one helpful nudge. "learn": one or two simple sentences.

{EXAMPLES}
Return only JSON matching the schema."""

JSON_HINT = """

Respond with ONLY one JSON object (no markdown, no commentary), shaped exactly like this, with 3 items in "missions":
{"missions": [{"title": "...", "task": "...", "hint": "...", "minutes": 3, "learn": "..."}]}"""