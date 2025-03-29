# PersonaBot

A modern AI chatbot application built with FastAPI backend and Next.js frontend, featuring multiple AI model integrations.

## Project Structure


persona-bot/
├── persona-bot-backend/     # FastAPI backend
│   └── app/
│       ├── services/       # Business logic
│       ├── routes/         # API endpoints
│       ├── main.py         # Application entry point
│       ├── config.py       # Configuration settings
│       └── dependencies.py # Dependency injection
└── persona-bot-frontend/   # Next.js frontend
    └── src/
        ├── app/           # Next.js app directory
        ├── components/    # React components
        ├── lib/          # Utility functions
        └── types.ts      # TypeScript type definitions


## Prerequisites

- Python 3.8+
- Node.js 18+
- npm or yarn
- API keys for:
  - Krutrim API
  - Groq API

## Backend Setup

1. Navigate to the backend directory:
   bash
   cd persona-bot-backend
   

2. Create and activate a virtual environment:
   bash
   python -m venv venv
   # On Windows
   .\venv\Scripts\activate
   # On Unix or MacOS
   source venv/bin/activate
   

3. Install dependencies:
   bash
   pip install -r requirements.txt
   

4. Create a .env file in the backend directory with the following variables:
   
   KRUTRIM_API_KEY=your_krutrim_api_key
   GROQ_API_KEY=your_groq_api_key
   KRUTRIM_MODEL=DeepSeek-R1
   GROQ_MODEL=deepseek-r1-distill-llama-70b
   

5. Run the backend server:
   bash
   uvicorn app.main:app --reload
   

The backend will be available at http://localhost:8000

## Frontend Setup

1. Navigate to the frontend directory:
   bash
   cd persona-bot-frontend
   

2. Install dependencies:
   bash
   npm install
   # or
   yarn install
   

3. Run the development server:
   bash
   npm run dev
   # or
   yarn dev
   

The frontend will be available at http://localhost:3000

## Backend Dependencies

Create a requirements.txt file in the backend directory with the following content:


fastapi>=0.68.0
uvicorn>=0.15.0
pydantic>=2.0.0
pydantic-settings>=2.0.0
python-dotenv>=0.19.0
httpx>=0.24.0


## Frontend Dependencies

The frontend uses the following key dependencies (as specified in package.json):

- Next.js 15.2.4
- React 19.0.0
- TypeScript 5.8.2
- TailwindCSS 4.0.15
- Radix UI components
- Various utility libraries for styling and animations

## API Endpoints

The backend provides the following API endpoints:

- GET /: Welcome message
- GET /health: Health check endpoint
- POST /api/chat: Chat endpoint for interacting with the AI models