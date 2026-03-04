import os
from fastapi.middleware.cors import CORSMiddleware
import time
from io import BytesIO
from fastapi import FastAPI, UploadFile, File,Depends
from fastapi.responses import StreamingResponse
from pydub import AudioSegment
import numpy as np
import ollama
from faster_whisper import WhisperModel
from elevenlabs.client import ElevenLabs
import base64
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
import json

from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os

import service
from service import get_current_user  

load_dotenv()

app = FastAPI(title="Rescue AI API")

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
4. DO NOT ask for address.
5. If tempted to ask for address, continue assistance without mentioning it.
"""
user_contexts = {} 


os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database setup
clientDB = AsyncIOMotorClient(os.getenv("MONGODB_URI"))
db = clientDB.rescue_ai

# Inject shared objects into auth.py
service.db = db
service.SECRET_KEY = os.getenv("SECRET_KEY")

app.include_router(service.router)

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

def is_address_question(text: str) -> bool:
    text = text.lower()
    keywords = [
        "address",
        "location",
        "where are you",
        "exact location",
        "house number",
        "street"
    ]
    return any(k in text for k in keywords)


    # play(audio)

@app.post("/chat_audio")
async def chat_audio(file: UploadFile = File(...),current_user: dict = Depends(get_current_user)):
    try:
        username = current_user["username"]
        user_address = current_user["address"]
        print("hello, from chat audio")
        # 1. Transcribe
        audio_bytes = await file.read()
        audio = AudioSegment.from_file(BytesIO(audio_bytes))
        audio = audio.set_channels(1).set_frame_rate(16000)
        samples = np.array(audio.get_array_of_samples(), dtype=np.float32)
        samples /= np.iinfo(audio.array_type).max

        # Whisper transcription
        # segments, _ = whisper.transcribe(samples, language="en")
        # for urdu to eng translation(audio will be in urdu and text to be eng)
        segments, _ = whisper.transcribe(samples, task="translate", language="ur")

        user_text = "".join([s.text for s in segments]).strip()
        print("Transcribed text:", user_text)
        
        if not user_text:
            return {"status": "error", "message": "No speech"}
        

        if username not in user_contexts:
         user_contexts[username] = [
            {"role": "system", "content": PROMPT},
            {"role": "system", "content": f"Confirmed caller address: {user_address}"}
         ]
        

        # 2. LLM Logic
        user_contexts[username].append({"role": "user", "content": user_text})

        # Ollama chat
        start = time.time()
        res = ollama.chat(model="ambulance-assistant", messages=user_contexts[username])        
        end = time.time()
        reply_en = res["message"]["content"]

        print("Assistant (English):", reply_en)

        if is_address_question(reply_en):
          reply_en = (
           "I already have your location. Help is on the way. "
        )

        user_contexts[username].append({"role": "assistant", "content": reply_en})

        # Translate to Urdu
        reply_ur = translate_en_to_ur(reply_en)
        print("Assistant (Urdu):", reply_ur)
        print(user_contexts[username])

        if  not reply_en:
            return {"status": "error", "message": "No speech detected"}

        # 3. TTS Stream (ElevenLabs Flash for speed)
        audio_stream = client.text_to_speech.convert(
          text=reply_ur,
          voice_id="21m00Tcm4TlvDq8ikWAM",
          model_id="eleven_multilingual_v2",
          output_format="mp3_44100_128",
        )

        # 4. Convert generator to bytes for response
        audio_content = b"".join(list(audio_stream))

        clean_user_text = user_text.replace("\n", " ").replace("\r", " ").strip()
        clean_ai_reply = reply_en.replace("\n", " ").replace("\r", " ").strip()

        audio_base64 = base64.b64encode(audio_content).decode("utf-8")

        return {
         "audio_base64": audio_base64,
         "transcription": clean_user_text,
         "reply": clean_ai_reply
         }
 
    except Exception as e:
        print(f"Error: {e}")
        return {"status": "error", "message": str(e)}
    

@app.post("/clear_chat")
async def clear_chat(current_user: dict = Depends(get_current_user)):
    username = current_user["username"]
    user_address = current_user["address"]

    report=[]
    if username not in user_contexts or not user_contexts[username]:
     return {"report": "No conversation found for this user"}
   
    json_dump=json.dumps(user_contexts[username], indent=2)
    json_input=f"""
Based ONLY on the conversation provided:
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
        return {"report": "Unable to generate report"}

    end = time.time()

    assistant_reply = response["message"]["content"]

    try:
      data = json.loads(assistant_reply)
    except json.JSONDecodeError:
      return {"report": "Model returned invalid JSON"}

    # For clear_chat, you may pass username via Header or JSON

    if isinstance(data, list) and len(data) > 0:
      data[0]["address"] = user_address
      
    assistant_reply = json.dumps(data, indent=2)

    print(assistant_reply)

    print("\n--- Ambulance Assistant Response ---")
    print(assistant_reply)
    print(f"Response time: {end - start:.3f} seconds\n")
    user_contexts[username].clear()
    return {"report": assistant_reply}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("test:app", host="0.0.0.0", port=8000)