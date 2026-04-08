import httpx

from app.core.config import settings


async def generate_summary(content: str) -> str:
    if not settings.openai_api_key:
        text = content.strip().replace("\n", " ")
        return f"Summary: {text[:180]}..." if len(text) > 180 else f"Summary: {text}"

    headers = {"Authorization": f"Bearer {settings.openai_api_key}"}
    payload = {
        "model": settings.openai_model,
        "input": f"Summarize this weekly internship report in 3 concise sentences:\n\n{content}",
    }

    try:
        async with httpx.AsyncClient(timeout=20) as client:
            response = await client.post("https://api.openai.com/v1/responses", headers=headers, json=payload)
            response.raise_for_status()
            return response.json().get("output_text", "Summary unavailable")
    except Exception:
        text = content.strip().replace("\n", " ")
        return f"Summary: {text[:180]}..." if len(text) > 180 else f"Summary: {text}"
