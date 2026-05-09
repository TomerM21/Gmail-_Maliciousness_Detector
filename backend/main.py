from fastapi import FastAPI, Path
from pydantic import BaseModel
import google.generativeai as genai
import json
from dotenv import load_dotenv
import os
from pathlib import Path



#gemini settings
load_dotenv()
app = FastAPI(title="Email Security Analyzer")
# find the .env file in the current directory
current_dir = Path(__file__).resolve().parent
env_path = current_dir / ".env"
load_dotenv(dotenv_path=env_path)

api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    raise ValueError("Could not find GEMINI_API_KEY in .env file!")

genai.configure(api_key=api_key)
model = genai.GenerativeModel("gemini-2.5-flash") #gemini-2.5-pro

# Define the data structure we expect from the Add-on
class EmailPayload(BaseModel):
    message_id: str
    sender: str  
    body: str

@app.get("/")
def read_root():
    return {"status": "Backend is running securely."}

@app.post("/analyze")
async def analyze_email(payload: EmailPayload):
    prompt = prompt = f"""
Analyze this email for phishing as a cybersecurity expert:
Sender: {payload.sender}
Content: {payload.body}

For each analysis section, provide EXACTLY 2 short, professional sentences detailing the risks.
Return ONLY a JSON object with this EXACT structure (the 'points' must be a LIST of strings):
While the rank and the score are the percentage of how likely the email is to be malicious -0 is not malicious at all, and 100 is definitely malicious.
{{
    "total_score": (0-100),
    "sender_analysis": {{"points": ["sentence 1", "sentence 2"], "rank": 0-100}},
    "content_analysis": {{"points": ["sentence 1", "sentence 2"], "rank": 0-100}},
    "links_analysis": {{"points": ["sentence 1", "sentence 2"], "rank": 0-100}},
    "files_analysis": {{"points": ["sentence 1", "sentence 2" ], "rank": 0-100}}
}}
"""
    
    response = model.generate_content(prompt)
    # clean the response to extract the JSON part
    clean_json = response.text.replace('```json', '').replace('```', '').strip()
    result = json.loads(clean_json, strict=False)
    return result
