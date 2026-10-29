"""Gnani Prisma (STT) and Timbre (TTS) clients. Key stays on the server.
Endpoint URLs/payloads come from env: adjust to match your Gnani dashboard docs."""
import os, httpx

KEY = lambda: os.getenv("GNANI_API_KEY", "")
STT = lambda: os.getenv("GNANI_STT_URL", "")
TTS = lambda: os.getenv("GNANI_TTS_URL", "")
LANG = lambda: os.getenv("GNANI_LANG", "en-IN")

def configured() -> bool:
    return bool(KEY() and KEY() != "your_api_key")

async def transcribe(audio: bytes, filename: str, content_type: str) -> str:
    async with httpx.AsyncClient(timeout=60) as c:
        r = await c.post(STT(), headers={"Authorization": f"Bearer {KEY()}", "X-API-Key": KEY()},
                         files={"file": (filename, audio, content_type)}, data={"language": LANG()})
        r.raise_for_status()
        j = r.json()
        return j.get("transcript") or j.get("text") or j.get("result", "")

async def synthesize(text: str) -> tuple[bytes, str]:
    async with httpx.AsyncClient(timeout=60) as c:
        r = await c.post(TTS(), headers={"Authorization": f"Bearer {KEY()}", "X-API-Key": KEY()},
                         json={"text": text, "language": LANG()})
        r.raise_for_status()
        return r.content, r.headers.get("content-type", "audio/mpeg")
