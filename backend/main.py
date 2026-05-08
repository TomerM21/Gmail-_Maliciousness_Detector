from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="Email Security Analyzer")

# Define the data structure we expect from the Add-on
class EmailPayload(BaseModel):
    message_id: str
    # Later, we will add an access_token here so the backend can fetch the email

@app.get("/")
def read_root():
    return {"status": "Backend is running securely."}

@app.post("/analyze")
def analyze_email(payload: EmailPayload):
    # This is where your security logic, threat intel, and LLM calls will go.
    # For now, we return a mock response.
    
    mock_score = 85
    mock_verdict = "Suspicious"
    
    return {
        "message_id": payload.message_id,
        "score": mock_score,
        "verdict": mock_verdict,
        "reasoning": [
            "Sender domain does not match Reply-To address.",
            "Contains multiple links to newly registered domains.",
            "Urgent tone detected."
        ]
    }