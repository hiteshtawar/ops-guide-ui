# Windows Setup Guide - OpsGuide UI

## Prerequisites to Install

### 1. Node.js 18 or Higher (Includes npm)
**Download**: https://nodejs.org/

**Installation Steps**:
1. Download the **LTS (Long Term Support)** version (recommended)
2. Run the installer (.msi file)
3. Follow the installation wizard (default settings are fine)
4. **Includes npm automatically** (no separate download needed)

**Verify Installation**:
```powershell
node --version
# Should show: v18.x.x or higher

npm --version
# Should show: 9.x.x or higher
```

### 2. Git (Optional but Recommended)
**Download**: https://git-scm.com/download/win

**Why**: For cloning the repository
- If already installed for backend, you're good!

---

## Setup Steps (After Prerequisites)

### Step 1: Clone/Download the Repository
```powershell
# If you have Git:
git clone https://github.com/hiteshtawar/ops-guide-ui.git
cd ops-guide-ui

# Or download ZIP from GitHub and extract it
```

### Step 2: Open PowerShell or Command Prompt
Navigate to the project directory:
```powershell
cd C:\path\to\ops-guide-ui
```

### Step 3: Install Dependencies (First Time Only)
```powershell
npm install
```

**What happens**:
- Downloads all required packages (~150 MB)
- Takes 1-3 minutes depending on internet speed
- Creates `node_modules` folder

### Step 4: Start the Development Server
```powershell
npm run dev
```

**What you'll see**:
```
  VITE v7.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### Step 5: Open in Browser
Click the link or manually open: `http://localhost:5173`

---

## Windows-Specific Notes

### PowerShell Execution Policy
If you get execution policy errors, run:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Port Conflicts
- Vite will automatically use next available port (5174, 5175, etc.)
- Check terminal output for actual port number

### Antivirus/Windows Defender
- May take longer on first run (scanning node_modules)
- Can add project folder to exclusions if needed

---

## Troubleshooting

### "npm is not recognized"
- Node.js not installed or not in PATH
- Reinstall Node.js and restart terminal
- Or use full path: `C:\Program Files\nodejs\npm.cmd`

### "node_modules is too large"
- This is normal (~150-200 MB)
- Required for React, TypeScript, and build tools
- Can exclude from antivirus scans if needed

### Slow npm install
- Use faster registry: `npm config set registry https://registry.npmjs.org/`
- Or use Yarn instead: `npm install -g yarn` then `yarn install`

### Port Already in Use
```powershell
# Find process using port 5173
netstat -ano | findstr :5173

# Kill the process (replace PID)
taskkill /PID <PID> /F
```

### Build Errors
```powershell
# Clear cache and reinstall
rm -r node_modules
rm package-lock.json
npm install
```

---

## What Gets Installed

When you run `npm install`, it installs:
- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **All dependencies** (~150 packages)

**Total download size**: ~150-200 MB
**Installation time**: 1-3 minutes

---

## Full Demo Setup (Two Terminals)

### Terminal 1 - Backend:
```powershell
cd ops-guide-ai
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
python server.py
```

### Terminal 2 - Frontend:
```powershell
cd ops-guide-ui
npm install        # First time only
npm run dev
```

### Browser:
Open `http://localhost:5173`

---

## Alternative: Use Git Bash

If you prefer Unix-like commands:
1. Install Git for Windows (includes Git Bash)
2. Open Git Bash
3. Use commands from Linux/Mac guides (they work in Git Bash!)

```bash
npm install
npm run dev
```

