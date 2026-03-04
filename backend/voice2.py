from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydub import AudioSegment
from io import BytesIO
import numpy as np
from faster_whisper import WhisperModel
import time
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
import os
from elevenlabs import ElevenLabs, play
from elevenlabs.client import ElevenLabs
from elevenlabs.play import play
import json
import ollama

api_key = os.getenv("api_key")

client = ElevenLabs(api_key=api_key)

if not api_key:
    raise ValueError("ELEVEN_API_KEY environment variable not set")

whisper_model_name = "small"
whisper = WhisperModel(whisper_model_name, device="cpu", compute_type="int8")

translation_model_name = "facebook/nllb-200-distilled-600M"
tokenizer = AutoTokenizer.from_pretrained(translation_model_name)
translation_model = AutoModelForSeq2SeqLM.from_pretrained(translation_model_name)

PROMPT = """
You are an emergency ambulance assistant.

Goals:
1. Calm the caller.
2. Identify the emergency type.
3. Collect and CONFIRM the exact address.
4. If the address is unclear, ask follow-up questions.
"""

messages = [
        {"role": "system", "content": PROMPT},
]

os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

def translate_en_to_ur(text: str) -> str:
    inputs = tokenizer(text, return_tensors="pt")
    translated_tokens = translation_model.generate(
        **inputs,
        forced_bos_token_id=tokenizer.convert_tokens_to_ids("urd_Arab")
    )
    return tokenizer.decode(translated_tokens[0], skip_special_tokens=True)

def speak_tts(text: str):
    audio = client.text_to_speech.convert(
        text=text,
        voice_id="21m00Tcm4TlvDq8ikWAM",
        model_id="eleven_multilingual_v2",
        output_format="mp3_44100_128",
    )

    play(audio)

@app.post("/clear_chat")
async def clear_chat():
    report=[]
    global messages
    json_dump=json.dumps(messages, indent=2)
    json_input=f"""
Based ONLY on the conversation provided:
- Extract the confirmed address
- Identify emergency type
- List observed symptoms explicitly mentioned
- Assign a criticality level (LOW, MEDIUM, HIGH, LIFE-THREATENING)

Output STRICT JSON.
Do not invent facts.
{json_dump}
    """
    report.append({"role": "user", "content": json_input})
    start = time.time()
    try:
        response = ollama.chat(model="ambulance-assistant", messages=report)
    except Exception as e:
        print(f"An error occurred: {e}")
        messages.pop() 

    end = time.time()

    assistant_reply = response["message"]["content"]

    print("\n--- Ambulance Assistant Response ---")
    print(assistant_reply)
    print(f"Response time: {end - start:.3f} seconds\n")
    messages.clear()
    messages.append({"role": "system", "content": PROMPT})
    return {"report": assistant_reply}


@app.post("/chat_audio")
async def chat_audio(file: UploadFile = File(...)):
    audio_bytes = await file.read()
    print("Received bytes:", len(audio_bytes))

    try:
        audio = AudioSegment.from_file(BytesIO(audio_bytes), format="webm")
        audio = audio.set_channels(1).set_frame_rate(16000)

        samples = np.array(audio.get_array_of_samples(), dtype=np.float32)
        samples /= np.iinfo(audio.array_type).max

        # Whisper transcription
        segments, _ = whisper.transcribe(samples, language="en")
        user_text = "".join([s.text for s in segments]).strip()
        print("Transcribed text:", user_text)

        if not user_text:
            return {"status": "error", "message": "No speech detected"}

        # Append user message
        messages.append({"role": "user", "content": user_text})

        # Ollama chat
        start = time.time()
        res = ollama.chat(model="ambulance-assistant", messages=messages)
        end = time.time()
        reply_en = res["message"]["content"]
        messages.append({"role": "assistant", "content": reply_en})
        print("Assistant (English):", reply_en)

        if "ACTION_REQUIRED" in reply_en:
          print("→ Agent decided to act")

        # Translate to Urdu
        reply_ur = translate_en_to_ur(reply_en)
        print("Assistant (Urdu):", reply_ur)
        print(messages)

        # TTS playback
        speak_tts(reply_ur)

        return {
            "status": "success",
            "user_text": user_text,
            "reply_en": reply_en,
            "reply_ur": reply_ur,
            "response_time_sec": end - start
        }

    except Exception as e:
        print("Error processing audio:", e)
        return {"status": "error", "message": str(e)}
