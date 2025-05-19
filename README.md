# CodeNest

A modern, minimal, and responsive online code editor for young coders. Built with React (Vite) and Node.js backend for real-time Python code execution.

## Features

- Real-time Python code execution
- Monaco Editor with syntax highlighting
- Minimal, beautiful, and accessible UI
- Responsive design for all devices
- Code snippets and helpful tips
- Live terminal output and input

## Getting Started

### Prerequisites

- Node.js (v16 or higher recommended)
- Python 3.x (for Python code execution)

### Installation

1. **Clone the repository:**
   ```sh
   git clone https://github.com/your-username/codenest.git
   cd codenest
   ```

2. **Install frontend dependencies:**
   ```sh
   cd code-editor
   npm install
   ```

3. **Install backend dependencies:**
   ```sh
   cd ../backend
   npm install
   ```

### Running Locally

1. **Start the backend server:**
   ```sh
   cd backend
   npm start
   ```
   The backend runs on port 4000 by default.

2. **Start the frontend (in a new terminal):**
   ```sh
   cd code-editor
   npm run dev
   ```
   The frontend runs on port 5173 by default.

3. **Open your browser:**
   Go to [http://localhost:5173](http://localhost:5173)

### Deployment

- Push this repository to GitHub.
- Deploy the frontend (code-editor) to Vercel, Netlify, or any static host.
- Deploy the backend (backend) to Render, Railway, or any Node.js host.
- Update CORS and API URLs as needed for production.

## License

MIT