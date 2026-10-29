const B = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
export const API = B;
async function j(path: string, body?: any) {
  const r = await fetch(B + path, body ? { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) } : undefined);
  if (!r.ok) throw new Error((await r.json().catch(() => ({}))).detail || r.statusText);
  return r.json();
}
export const generate = (text: string, project_id?: string) => j("/api/design/generate", { text, project_id });
export const update = (project_id: string, text: string) => j("/api/design/update", { project_id, text });
export const health = () => j("/api/health");
export async function transcribe(blob: Blob): Promise<string> {
  const fd = new FormData(); fd.append("file", blob, "speech.webm");
  const r = await fetch(B + "/api/voice/transcribe", { method: "POST", body: fd });
  if (!r.ok) throw new Error((await r.json().catch(() => ({}))).detail || "Transcription failed");
  return (await r.json()).transcript;
}
export async function speak(text: string, useGnani: boolean) {
  if (useGnani) {
    try {
      const r = await fetch(B + "/api/voice/explain", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text }) });
      if (r.ok) { const a = new Audio(URL.createObjectURL(await r.blob())); await a.play(); return; }
    } catch {}
  }
  window.speechSynthesis?.speak(new SpeechSynthesisUtterance(text)); // browser fallback
}
