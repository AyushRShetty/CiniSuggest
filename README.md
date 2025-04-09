# CiniSuggest

A web application that provides movie and TV show recommendations based on genre or similarity to a given title.

## Features

- Genre-based recommendations
- Similarity-based recommendations
- Fetches data and posters from TMDB
- Uses Google Gemini for recommendation generation
- Modern, interactive frontend built with React and Tailwind CSS
- Serverless backend functions (compatible with Vercel/Netlify)

## Tech Stack

- **Frontend:** React, Vite, Tailwind CSS, Framer Motion
- **Backend:** Node.js, Express (running as serverless functions)
- **APIs:** TMDB API, Google Gemini API
- **Hosting:** Vercel / Netlify

## Setup

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd CiniSuggest
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Set up environment variables:**
    *   Rename `.env.example` to `.env`.
    *   Add your TMDB API key and Google Gemini API key to the `.env` file.
4.  **Run the development servers:**
    *   In one terminal, start the frontend (Vite dev server with proxy):
        ```bash
        npm run dev
        ```
    *   In another terminal, start the backend API server (for local development):
        ```bash
        npm run api
        ```
    *   Open your browser to `http://localhost:5173` (or the port Vite assigns).



## Project Structure

```
/CiniSuggest
├── api/              # Serverless functions (backend)
│   ├── _utils/       # Shared backend utilities (API clients)
│   ├── recommend/    # Recommendation endpoints
│   └── server.js     # Local Express server wrapper
├── public/           # Static assets
├── src/              # Frontend source code (React)
│   ├── components/   # React components
│   ├── hooks/        # Custom React hooks
│   ├── services/     # Frontend API client
│   ├── App.jsx       # Main application component
│   ├── index.css     # Global styles & Tailwind directives
│   └── main.jsx      # React entry point
├── .env.example      # Environment variable template
├── .gitignore
├── index.html        # Main HTML file
├── package.json
├── tailwind.config.js
├── postcss.config.js
└── vite.config.js
``` 