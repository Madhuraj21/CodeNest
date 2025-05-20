import { useState, useRef, useEffect } from 'react'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Editor from '@monaco-editor/react'
import { io } from 'socket.io-client'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Snackbar from '@mui/material/Snackbar'
import MuiAlert from '@mui/material/Alert'

// Add Google Fonts import for a playful look
const fontUrl = 'https://fonts.googleapis.com/css2?family=Fredoka:wght@400;600;700&display=swap'
if (!document.getElementById('fredoka-font')) {
  const link = document.createElement('link')
  link.id = 'fredoka-font'
  link.rel = 'stylesheet'
  link.href = fontUrl
  document.head.appendChild(link)
}

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#6C63FF' },
    secondary: { main: '#FFD166' },
    background: {
      default: '#181c24',
      paper: '#23283a',
    },
    text: {
      primary: '#F3F6F9',
      secondary: '#B9B9B9',
    },
    terminal: {
      main: '#B9FBC0',
      error: '#FF6B6B',
    },
  },
  typography: {
    fontFamily: 'Fredoka, Fira Mono, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    h4: { fontWeight: 700, letterSpacing: '0.03em' },
    h6: { fontWeight: 700 },
    body1: { fontSize: '1.12rem' },
  },
  shape: {
    borderRadius: 10,
  },
})

const DEFAULT_CODE = `print('Hello, Python!')`

const SNIPPETS = [
  { name: 'Hello World', code: `print('Hello, World!')` },
  { name: 'Input & Output', code: `name = input('What is your name? ')
print('Hello,', name)` },
  { name: 'For Loop', code: `for i in range(5):
    print('Number:', i)` },
  { name: 'If Statement', code: `num = int(input('Enter a number: '))
if num % 2 == 0:
    print('Even')
else:
    print('Odd')` },
  { name: 'List Example', code: `fruits = ['apple', 'banana', 'cherry']
for fruit in fruits:
    print(fruit)` },
]

const TIPS = [
  'Use input() to get user input!',
  'Indentation matters in Python.',
  'Use print() to show output.',
  'Try using for loops to repeat actions.',
  'You can use # to write comments.',
  'Use Ctrl+Enter to run your code quickly!',
]

function App() {
  const [code, setCode] = useState(DEFAULT_CODE)
  const [output, setOutput] = useState('')
  const [input, setInput] = useState('')
  const [tipIdx, setTipIdx] = useState(0)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' })
  const socketRef = useRef(null)

  useEffect(() => {
    const backendUrl = process.env.NODE_ENV === "production"
      ? "https://codenest-0zm5.onrender.com"
      : "http://localhost:4000";
    socketRef.current = io(backendUrl)
    socketRef.current.on('terminal:data', (data) => {
      setOutput((prev) => prev + data)
    })
    socketRef.current.on('error', (err) => {
      setSnackbar({ open: true, message: `[Error]: ${err}`, severity: 'error' })
      setOutput((prev) => prev + `\n[Error]: ${err}`)
    })
    return () => {
      socketRef.current.disconnect()
    }
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setTipIdx((idx) => (idx + 1) % TIPS.length)
    }, 6000)
    return () => clearInterval(interval)
  }, [])

  const handleRun = () => {
    setOutput('')
    setSnackbar({ open: true, message: 'Running code...', severity: 'info' })
    socketRef.current.emit('execute', { code, language: 'python' })
  }

  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (input.trim() !== '') {
        socketRef.current.emit('terminal:input', input + '\n')
        setOutput((prev) => prev + input + '\n')
        setInput('')
      }
    }
  }

  const handleSnippet = (snippet) => {
    setCode(snippet)
    setOutput('')
  }

  const handleReset = () => {
    setCode(DEFAULT_CODE)
    setOutput('')
    setSnackbar({ open: true, message: 'Editor reset!', severity: 'success' })
  }

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      {/* Top Navigation Bar */}
      <AppBar position="static" color="transparent" elevation={0} sx={{
        background: '#181c24',
        color: '#F3F6F9',
        boxShadow: 2,
        mb: 2,
        borderBottom: '1.5px solid #23283a',
      }}>
        <Toolbar>
          <span style={{ fontSize: 32, marginRight: 8 }}>💻</span>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700, fontFamily: 'Fredoka', letterSpacing: '0.05em', color: '#F3F6F9' }}>
            CodeNest
          </Typography>
        </Toolbar>
      </AppBar>
      <Box sx={{
        display: 'flex',
        minHeight: '100vh',
        width: '100vw',
        maxWidth: '100vw',
        overflowX: 'hidden',
        background: '#181c24',
        color: 'text.primary',
        flexDirection: { xs: 'column', md: 'row' },
        fontFamily: 'Fredoka, Fira Mono, monospace',
        justifyContent: 'center',
        alignItems: 'stretch',
        boxSizing: 'border-box',
      }}>
        {/* Sidebar for snippets */}
        <Box sx={{
          width: { xs: '100%', sm: 220, md: 240, lg: 260 },
          minWidth: { md: 180 },
          maxWidth: { xs: '100%', md: 280 },
          flexShrink: 0,
          bgcolor: '#23283a',
          p: { xs: 1.5, sm: 2 },
          borderRight: { md: '1.5px solid #23283a' },
          borderBottom: { xs: '1.5px solid #23283a', md: 'none' },
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          boxShadow: { md: 2 },
          zIndex: 2,
        }}>
          <Typography variant="h6" sx={{ mb: 1, color: '#6C63FF', fontWeight: 700, letterSpacing: '0.04em', fontFamily: 'Fredoka' }}>
            🧩 Snippets
          </Typography>
          {SNIPPETS.map((s, i) => (
            <Button key={i} variant="outlined" color="secondary" startIcon={<span>▶️</span>} sx={{
              textTransform: 'none',
              mb: 1,
              fontWeight: 600,
              borderRadius: 3,
              fontFamily: 'Fredoka',
              fontSize: '1.03em',
              borderWidth: 1.5,
              color: '#FFD166',
              borderColor: '#FFD166',
              background: 'transparent',
              '&:hover': { bgcolor: '#FFD16622', borderColor: '#FFD166', color: '#FFD166' },
            }} onClick={() => handleSnippet(s.code)}>{s.name}</Button>
          ))}
          <Button variant="contained" color="primary" startIcon={<span>🔄</span>} sx={{
            mt: 2,
            fontWeight: 700,
            borderRadius: 3,
            fontFamily: 'Fredoka',
            fontSize: '1.08em',
            boxShadow: 2,
            letterSpacing: '0.02em',
            background: '#6C63FF',
            color: '#F3F6F9',
            '&:hover': { bgcolor: '#554fd8', color: '#FFD166' },
          }} onClick={handleReset}>Reset</Button>
          <Box sx={{
            mt: 4,
            p: 2,
            bgcolor: '#23283a',
            borderRadius: 3,
            minHeight: 60,
            display: 'flex',
            alignItems: 'center',
            boxShadow: 1,
            fontFamily: 'Fredoka',
            border: '1px solid #23283a',
          }}>
            <Typography variant="body2" sx={{ color: '#B9B9B9', fontWeight: 600, fontFamily: 'Fredoka' }}>
              💡 Tip: {TIPS[tipIdx]}
            </Typography>
          </Box>
        </Box>
        {/* Main content */}
        <Box sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          p: { xs: 1, sm: 2, md: 4 },
          gap: 2,
          zIndex: 1,
          maxWidth: { xs: '100vw', md: 'calc(100vw - 260px)', lg: 1200 },
          margin: '0 auto',
          justifyContent: 'center',
          minWidth: 0,
        }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{
            fontFamily: 'Fredoka',
            color: '#6C63FF',
            textAlign: { xs: 'center', md: 'left' },
            mt: { xs: 2, md: 0 },
            letterSpacing: '0.04em',
            textShadow: '0 2px 8px #6C63FF22',
            animation: 'fadeInDown 1s',
          }}>
            <span style={{ fontSize: '1.2em', marginRight: 8 }}>🐍</span>Python Code Editor
          </Typography>
          <Box sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 2,
            flex: 1,
            minWidth: 0,
            width: '100%',
          }}>
            <Box sx={{
              flex: 1,
              minWidth: 0,
              width: '100%',
              height: { xs: 220, sm: 260, md: 400, lg: 480 },
              border: '1.5px solid #23283a',
              borderRadius: 4,
              overflow: 'hidden',
              boxShadow: 2,
              background: '#23283a',
              transition: 'box-shadow 0.2s',
              mb: { xs: 2, md: 0 },
            }}>
              <Editor
                height="100%"
                defaultLanguage="python"
                language="python"
                value={code}
                theme="vs-dark"
                onChange={(value) => setCode(value)}
                options={{
                  fontSize: 16,
                  minimap: { enabled: false },
                  fontFamily: 'Fira Mono, Fredoka, monospace',
                  smoothScrolling: true,
                  fontLigatures: true,
                  cursorSmoothCaretAnimation: true,
                  cursorBlinking: 'phase',
                  lineNumbers: 'on',
                  scrollBeyondLastLine: false,
                  roundedSelection: true,
                  scrollbar: { vertical: 'visible', horizontal: 'visible' },
                  theme: 'vs-dark',
                }}
              />
            </Box>
            <Box sx={{
              flex: 1,
              minWidth: 0,
              width: '100%',
              height: { xs: 220, sm: 260, md: 400, lg: 480 },
              bgcolor: '#23283a',
              color: '#B9FBC0',
              p: 2,
              borderRadius: 4,
              fontFamily: 'Fira Mono, Fredoka, monospace',
              overflow: 'auto',
              border: '1.5px solid #FFD16644',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: 2,
              background: '#23283a',
              transition: 'box-shadow 0.2s',
              mb: { xs: 2, md: 0 },
            }}>
              <Typography variant="subtitle1" sx={{ color: '#FFD166', mb: 1, fontFamily: 'Fredoka', fontWeight: 600, letterSpacing: '0.03em' }}>Terminal Output:</Typography>
              <pre style={{ margin: 0, whiteSpace: 'pre-wrap', flex: 1, fontSize: '1.05em', fontFamily: 'Fira Mono, Fredoka, monospace', color: '#B9FBC0', background: 'none' }}>{output}</pre>
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleInputKeyDown}
                placeholder="Type input and press Enter..."
                style={{
                  background: '#181c24',
                  color: '#FFD166',
                  border: '1.5px solid #FFD16644',
                  outline: 'none',
                  padding: '12px',
                  fontFamily: 'Fira Mono, Fredoka, monospace',
                  fontSize: '1.05em',
                  borderRadius: '6px',
                  marginTop: '10px',
                  width: '100%',
                  boxSizing: 'border-box',
                  transition: 'background 0.2s, color 0.2s',
                }}
              />
            </Box>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: { xs: 'center', md: 'flex-end' }, mt: 2 }}>
            <Button variant="contained" color="secondary" size="large" startIcon={<span>▶️</span>} sx={{
              fontWeight: 700,
              px: 4,
              fontSize: '1.12em',
              boxShadow: 2,
              borderRadius: 3,
              fontFamily: 'Fredoka',
              letterSpacing: '0.03em',
              background: '#FFD166',
              color: '#23283a',
              '&:hover': { bgcolor: '#FFD166cc', color: '#23283a', transform: 'scale(1.05)' },
            }} onClick={handleRun}>
              Run Code
            </Button>
          </Box>
        </Box>
      </Box>
      {/* Footer */}
      <Box component="footer" sx={{
        width: '100%',
        py: 2,
        mt: 4,
        textAlign: 'center',
        bgcolor: '#181c24',
        color: '#6C63FF',
        fontFamily: 'Fredoka',
        fontWeight: 600,
        letterSpacing: '0.03em',
        fontSize: '1.05em',
        boxShadow: 1,
        borderTop: '1.5px solid #23283a',
      }}>
        Made with ❤️ for young coders | CodeNest
      </Box>
      {/* Snackbar for feedback */}
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <MuiAlert elevation={6} variant="filled" severity={snackbar.severity} sx={{ fontFamily: 'Fredoka' }}>
          {snackbar.message}
        </MuiAlert>
      </Snackbar>
      {/* Animations */}
      <style>{`
        @keyframes fadeInDown {
          0% { opacity: 0; transform: translateY(-30px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
      `}</style>
    </ThemeProvider>
  )
}

export default App
