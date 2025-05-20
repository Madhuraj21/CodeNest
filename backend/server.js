const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs').promises;
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Vite's default port
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// Serve frontend static files in production
if (process.env.NODE_ENV === 'production') {
  const clientBuildPath = path.join(__dirname, '../code-editor/dist');
  app.use(express.static(clientBuildPath));
  app.all('*', (req, res) => {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
}

// Create a workspace directory for code files
const workspaceDir = path.join(__dirname, 'workspace');
fs.mkdir(workspaceDir, { recursive: true }).catch(console.error);

// Store active processes
const activeProcesses = new Map();

// Execute code based on language
async function executeCode(code, language, socket) {
  const filename = `code_${socket.id}.${language === 'javascript' ? 'js' : 'py'}`;
  const filepath = path.join(workspaceDir, filename);

  try {
    // Write code to file
    await fs.writeFile(filepath, code);

    // Execute based on language
    let process;
    if (language === 'javascript') {
      process = spawn('node', [filepath]);
    } else if (language === 'python') {
      process = spawn('python', [filepath]);
    }

    // Store process
    activeProcesses.set(socket.id, process);

    // Handle process output
    process.stdout.on('data', (data) => {
      socket.emit('terminal:data', data.toString());
    });

    process.stderr.on('data', (data) => {
      socket.emit('terminal:data', `\x1b[31m${data.toString()}\x1b[0m`);
    });

    process.on('close', async (code) => {
      socket.emit('terminal:data', `\r\nProcess exited with code ${code}\r\n`);
      // Cleanup
      try {
        await fs.unlink(filepath);
      } catch (error) {
        console.error('Error cleaning up file:', error);
      }
      activeProcesses.delete(socket.id);
    });

  } catch (error) {
    console.error('Execution error:', error);
    socket.emit('error', error.message);
  }
}

io.on('connection', (socket) => {
  console.log('Client connected');

  socket.on('execute', async ({ code, language }) => {
    // Kill any existing process for this socket
    const existingProcess = activeProcesses.get(socket.id);
    if (existingProcess) {
      existingProcess.kill();
      activeProcesses.delete(socket.id);
    }

    await executeCode(code, language, socket);
  });

  socket.on('terminal:input', (data) => {
    const process = activeProcesses.get(socket.id);
    if (process) {
      process.stdin.write(data);
    }
  });

  socket.on('disconnect', () => {
    // Cleanup
    const process = activeProcesses.get(socket.id);
    if (process) {
      process.kill();
      activeProcesses.delete(socket.id);
    }
  });
});

const PORT = 4000;  // Hardcoded to 4000 to avoid any environment variable issues
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});