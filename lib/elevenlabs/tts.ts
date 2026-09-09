export class TtsError extends Error {
  constructor(
    message: string,
    readonly reason: "tts_not_configured" | "tts_failed" | "voice_restricted",
  ) {
    super(message);
  }
}

const FREE_MODELS = ["eleven_multilingual_v2", "eleven_flash_v2_5", "eleven_turbo_v2_5"];
const PREMADE_VOICE_IDS = [
  "21m00Tcm4TlvDq8ikWAM",
  "EXAVITQu4vr4xnSDxMaL",
  "pNInz6obpgDQGcFmaJgB",
];

let cachedPremadeVoiceId: string | null | undefined;

export function isTtsConfigured() {
  return Boolean(process.env.ELEVENLABS_API_KEY);
}

export function isRestrictedVoiceError(detail: string) {
  const text = detail.toLowerCase();
  return (
    text.includes("free_users_not_allowed") ||
    text.includes("creator tier") ||
    text.includes("not available for free users") ||
    text.includes("library voice") ||
    text.includes("cloned voice")
  );
}

function unique(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

function modelCandidates() {
  const configured = process.env.ELEVENLABS_MODEL_ID?.trim() || "";
  return unique([...FREE_MODELS, configured]);
}

async function requestSpeech(apiKey: string, voiceId: string, text: string, model: string) {
  return fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: "POST",
    headers: {
      "xi-api-key": apiKey,
      Accept: "audio/mpeg",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text,
      model_id: model,
    }),
  });
}

async function firstPremadeVoiceId(apiKey: string) {
  if (cachedPremadeVoiceId !== undefined) {
    return cachedPremadeVoiceId;
  }

  const response = await fetch("https://api.elevenlabs.io/v1/voices", {
    headers: { "xi-api-key": apiKey },
  });
  if (!response.ok) {
    cachedPremadeVoiceId = PREMADE_VOICE_IDS[0];
    return cachedPremadeVoiceId;
  }

  const data = (await response.json()) as {
    voices?: { voice_id?: string; category?: string }[];
  };
  const premade = (data.voices ?? []).find((voice) => voice.category === "premade" && voice.voice_id);
  cachedPremadeVoiceId = premade?.voice_id ?? PREMADE_VOICE_IDS[0];
  return cachedPremadeVoiceId;
}

export async function synthesizeSpeech(text: string): Promise<Buffer> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    throw new TtsError("ElevenLabs is not configured", "tts_not_configured");
  }

  const preferredVoice = process.env.ELEVENLABS_VOICE_ID?.trim();
  const premadeVoice = await firstPremadeVoiceId(apiKey);
  const voices = unique([preferredVoice ?? "", premadeVoice, ...PREMADE_VOICE_IDS]);
  const models = modelCandidates();

  let lastDetail = "";
  let lastStatus = 0;
  let sawRestrictedVoice = false;

  for (const voiceId of voices) {
    for (const model of models) {
      const response = await requestSpeech(apiKey, voiceId, text, model);
      if (response.ok) {
        return Buffer.from(await response.arrayBuffer());
      }
      lastStatus = response.status;
      lastDetail = await response.text().catch(() => "");
      if (isRestrictedVoiceError(lastDetail)) {
        sawRestrictedVoice = true;
        break;
      }
    }
  }

  if (sawRestrictedVoice && isRestrictedVoiceError(lastDetail)) {
    throw new TtsError(
      "This ElevenLabs voice needs a paid plan. Leave ELEVENLABS_VOICE_ID empty or use a Default/premade voice.",
      "voice_restricted",
    );
  }

  const hint = lastDetail.slice(0, 180).trim();
  throw new TtsError(
    hint ? `Could not generate speech (${lastStatus}): ${hint}` : "Could not generate speech right now.",
    "tts_failed",
  );
}
