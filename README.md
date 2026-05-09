
#  Malicious Email Scorer– AI-Powered Gmail Security Add-on

## Overview

**Malicious Email Scorer** is a cybersecurity tool designed to detect phishing attempts directly within Gmail.
It uses a hybrid architecture combining **Google Apps Script (frontend)**, a **FastAPI backend**, and **Google Gemini AI** for intelligent email risk analysis.

The system evaluates email content, metadata, links, and attachments to generate a **Maliciousness Score (0–100%)** along with a detailed breakdown of potential threats.

---

##  Architecture

The system is composed of three main components:

###  Gmail Add-on (Frontend)

* Built with **Google Apps Script (Card Service)**
* Extracts email data from Gmail
* Sends analysis requests to the backend via HTTP POST

###  FastAPI Backend (Core Engine)

* Python-based server using **FastAPI + Pydantic**
* Processes incoming email data
* Sends structured prompts to **Google Gemini AI**
* Returns risk scoring and detailed analysis

###  Ngrok Tunnel (Development Bridge)

* Connects local backend to Google cloud environment
* Enables real-time testing during development

---

##  Features

*  **Automated Risk Scoring** – Generates a 0–100% maliciousness score per email
*  **Multi-Vector Analysis**

  * Sender validation (domain & identity checks)
  * Content analysis (tone, phishing patterns)
  * Link inspection (redirects, suspicious URLs)
  * Attachment risk evaluation
*  **AI-Powered Reasoning** using Google Gemini
* **Contextual UI Feedback**

  * Dynamic risk-based messages
  * Visual indicators and emojis for user clarity

---

##  Tech Stack

**Frontend**

* Google Apps Script (Card Service)

**Backend**

* Python
* FastAPI
* Pydantic

**AI Engine**

* Google Gemini (gemini-2.5-flash)

**Dev Tools**

* ngrok (local tunneling)
* python-dotenv (environment management)
* pathlib (file handling)

---

##  Setup & Installation

### 1. Backend Setup

Navigate to the backend directory:

```bash
cd backend/
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create a `.env` file:

```env
GEMINI_API_KEY=your_api_key_here
```

---

### 2. Run the Server

Start FastAPI:

```bash
uvicorn main:app --reload
```

Expose using ngrok:

```bash
ngrok http 8000
```

---

### 3. Google Apps Script Setup

In `Code.gs`, update the backend URL:

```javascript
var backendUrl = "https://your-ngrok-url.ngrok-free.dev/analyze";
```

Test on any Gmail.

---

##  Future Development Roadmap


### 1. Adaptive LLM Selection

*Adaptive LLM Selection – Routes requests between fast and advanced models (including Gemini, OpenAI, and Claude families) depending on the depth of analysis required for each email.


### 2. Temporal Analysis

* Detect unusual email arrival patterns based on user behavior(time)

### 3. Advanced Prompt Engineering

* Improve structured JSON outputs
* Enhance cybersecurity-specific reasoning

### 4. UI/UX Improvements

* Interactive analysis cards
* Improved visual risk indicators
* More intuitive summaries for non-technical users

### 5. Product Strategy

* Add **“Simple Mode” vs “Detailed Mode”**
* Balance technical depth with usability

### 6. Cloud Deployment

* Migrate from ngrok to **Google Cloud Run**
* Enable production-grade scalability and availability

---

##  About the Author

* **Tomer**  
Computer Science Student, Tel Aviv University  
Former Professional Swimmer & Combat Commander in Special Artillery Forces


