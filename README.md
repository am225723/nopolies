# Nopolies - 3D Monopoly Game

A immersive 3D Monopoly-style board game built with React, Three.js, and Google Gemini AI integration.

## Features

- 🎮 Immersive 3D game board with smooth camera controls
- 🤖 AI-powered token generation using Google Gemini API
- 🎨 Custom themes and board creation
- 🎵 Sound effects and background music
- 📱 Responsive design
- ⚡ Optimized performance

## Quick Start

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

## Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set environment variable:
   - `GEMINI_API_KEY=AIzaSyBIe4GwIk7V1snPyfSi1qKF4OZ0a-CEofQ`

The app will automatically deploy with the following configuration:
- Static site from the `dist` directory
- Serverless API functions for AI token generation
- Optimized build with asset bundling

## Game Controls

- **Mouse drag**: Rotate camera around the board
- **Mouse wheel**: Zoom in/out
- **Q/E keys**: Rotate camera left/right
- **R key**: Flip camera view
- **Space bar**: Reset camera position

## Environment Variables

- `GEMINI_API_KEY`: Your Google Gemini API key (included)
- `VITE_API_URL`: API endpoint URL

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **3D Rendering**: Three.js, React Three Fiber, React Three Drei
- **AI Integration**: Google Gemini API
- **Styling**: Tailwind CSS, Radix UI
- **Animation**: Framer Motion, React Spring
- **Deployment**: Vercel

## Free Services Used

- Google Gemini API (free tier)
- DiceBear API for token avatars
- Vercel for hosting

## Development Notes

- The app uses Vite for fast development and optimized builds
- All 3D models and textures are properly optimized
- The AI service generates unique tokens using Gemini's text generation
- Camera controls provide an immersive 3D experience
- Built-in responsive design works on all devices