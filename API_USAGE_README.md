# API Usage README

Is file me project me use hone wale APIs ka practical summary diya gaya hai (current working setup ke basis par).

## 1) Service Architecture

- Frontend: http://localhost:8080
- Backend API: http://localhost:5000
- ML API (Flask): http://localhost:5001

## 2) Internal APIs (Project ke andar)

### Backend Main Route Groups

- /api/auth
  - Login, register, profile, user management
- /api/alerts
  - POST /send (email alerts)
  - GET /history (backend alert history)
  - POST /broadcast (emergency alert broadcast)
- /api/community
  - Community CRUD
  - POST /sms, POST /whatsapp, POST /broadcast
- /api/authorities
  - Authority emails add/get/delete
- /api/iot
  - IoT sensor-related endpoints
- /api/analytics
  - Analytics endpoints
- /api/voice
  - Voice control/alerts endpoints
- /api/social
  - Social media monitoring endpoints
- /api/government
  - Government integration endpoints
- /api/chatbot
  - Chatbot message/history endpoints
- /api/dam
  - Dam image/analysis endpoints
- /api/pwa
  - PWA notification/subscription endpoints

### Additional Backend APIs

- POST /api/ai/risk-assessment
  - Backend ML API ko call karta hai (http://localhost:5001/predict)
  - ML down hone par fallback risk logic use hota hai
- GET /api/weather/current
- GET /api/weather/forecast
- GET /api/3d/dam-structure
- GET /api/3d/stress-points

### ML API Endpoints (Flask)

- GET /
- GET /health
- GET /model-info
- POST /predict

## 3) External APIs / Services Used

### Open-Meteo Weather API

- URL base: https://api.open-meteo.com/v1/forecast
- Use case: current weather + forecast data
- Called from backend weather handlers

### Gmail SMTP (Nodemailer)

- Use case: real email alert sending
- Required env:
  - GMAIL_USER
  - GMAIL_PASS (App Password)

### Generic SMTP (Optional fallback)

- Use case: email sending via custom SMTP provider
- Required env:
  - SMTP_HOST
  - SMTP_PORT
  - SMTP_USER
  - SMTP_PASS
  - SMTP_SECURE

### Twilio (Optional)

- Use case: SMS integration (currently app demo/simulated mode me bhi chal sakta hai)
- Required env:
  - TWILIO_ACCOUNT_SID
  - TWILIO_AUTH_TOKEN
  - TWILIO_PHONE_NUMBER

### WhatsApp Green API (Optional)

- Use case: WhatsApp alerts (credentials na hone par demo mode)
- Required env:
  - WHATSAPP_INSTANCE_ID
  - WHATSAPP_API_TOKEN

## 4) Real-time Channel Used

- Socket.IO
  - Realtime sensor-update events
  - Realtime ai-prediction events

## 5) Alert Flow (Current)

1. Frontend alert trigger karta hai
2. Backend /api/alerts/send hit hota hai
3. Recipients authority list se resolve hote hain (agar request me recipients blank ho)
4. Email send hota hai (Gmail/SMTP ya demo mode)
5. Alert record backend history me save hota hai
6. GET /api/alerts/history se history retrieve hoti hai

## 6) Important Note

Purane docs me kuch ports/endpoints outdated ho sakte hain.
Current active ML API port 5001 hai (3001 nahi).
