import httpx

from app.core.config import settings


async def fetch_github_activity(username: str | None) -> dict:
    if not username:
        return {"commits": 0, "recent_repos": []}

    headers = {"Accept": "application/vnd.github+json"}
    if settings.github_token:
        headers["Authorization"] = f"Bearer {settings.github_token}"

    async with httpx.AsyncClient(timeout=20) as client:
        response = await client.get(f"https://api.github.com/users/{username}/events", headers=headers)
        if response.status_code != 200:
            return {"commits": 0, "recent_repos": []}
        events = response.json()

    pushes = [event for event in events if event.get("type") == "PushEvent"]
    return {
        "commits": sum(len(event.get("payload", {}).get("commits", [])) for event in pushes),
        "recent_repos": list({event.get("repo", {}).get("name") for event in pushes if event.get("repo")})[:5],
    }
