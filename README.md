# FABRIC GUARD AI

An AI-powered fabric defect detection system.

## Features
- **Live Camera Detection**: Real-time analysis using your device's webcam.
- **Image Upload Detection**: Detailed analysis of uploaded fabric photos.
- **AI-Powered**: Uses Google Gemini 2.0 Flash for accurate classification.
- **Defect Types**: Detects Stains, Holes, Broken Yarn, and non-fabric images.

## Tech Stack
- **Frontend**: React 19, Tailwind CSS, Framer Motion, Lucide Icons.
- **Backend**: Node.js with Express.
- **AI**: Google Gemini API (@google/genai).

## Setup Instructions

### 1. Environment Variables
Ensure you have your Gemini API key set in your environment:
```env
GEMINI_API_KEY=your_api_key_here
```

### 2. Installation
```bash
npm install
```

### 3. Running the App
```bash
npm run dev
```
The app will be available at `http://localhost:3000`.

## Project Structure
- `server.ts`: Express backend with Auth API and Vite middleware.
- `src/App.tsx`: Main React application with routing and UI components.
- `src/services/geminiService.ts`: AI integration service.
- `src/index.css`: Global styles and theme configuration.
