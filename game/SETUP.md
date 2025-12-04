# PixelVerse - Setup Guide

Complete setup instructions for the PixelVerse Space Exploration Game.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **Git** (optional, for version control)
- A modern web browser (Chrome, Firefox, Safari, or Edge)

### Verify Installation

```bash
node --version  # Should show v18.0.0 or higher
npm --version   # Should show 9.0.0 or higher
```

## 🚀 Installation Steps

### Step 1: Navigate to Project Directory

```bash
cd C:\Users\antik\Desktop\Interstellar
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages:
- **Frontend**: React, TypeScript, Vite
- **Backend**: Express, CORS
- **Dev Tools**: TypeScript compiler, ESLint, Concurrently

**Expected output**: Installation should complete in 1-3 minutes depending on your internet connection.

### Step 3: Environment Setup (Optional)

Create a `.env` file for custom configuration:

```bash
copy .env.example .env
```

Edit `.env` if you want to change default ports:
```env
PORT=3001  # API server port
```

## 🎮 Running the Game

### Development Mode (Recommended for Testing)

Start both the game client and API server:

```bash
npm run dev
```

This command runs:
- **Vite dev server** on `http://localhost:3000` (game client)
- **Express API server** on `http://localhost:3001` (backend)

**What to expect**:
```
> pixelverse-space-explorer@1.0.0 dev
> concurrently "npm run dev:client" "npm run dev:server"

[0]
[0]   VITE v5.0.8  ready in 523 ms
[0]
[0]   ➜  Local:   http://localhost:3000/
[1] 🚀 PixelVerse API Server running on port 3001
[1] 📡 Health check: http://localhost:3001/api/health
```

### Open the Game

Open your browser and navigate to: **http://localhost:3000**

You should see:
1. Loading screen with "◆ INITIALIZING SYSTEMS ◆"
2. Game starts with your ship in the Kepler-442 star system
3. HUD showing ship systems, radar, and controls at the bottom

### Testing the API (Optional)

Test the backend API:

```bash
# Health check
curl http://localhost:3001/api/health

# Expected response:
# {"status":"ok","message":"PixelVerse API Server Running"}
```

## 🏗️ Production Build

### Build the Project

```bash
# Build frontend
npm run build

# Build backend
npm run build:server
```

This creates optimized production files in:
- `dist/` - Frontend build
- `dist/server/` - Backend build

### Run Production Build

```bash
npm start
```

For a complete production deployment, you'll need:
1. A static hosting service for the frontend (Vercel, Netlify, etc.)
2. A Node.js hosting service for the backend (Heroku, Railway, etc.)

## 🎯 First Time Playing

### Controls Overview

**Keyboard**:
- `W` / `↑` - Thrust forward
- `S` / `↓` - Thrust backward
- `A` / `←` - Rotate left
- `D` / `→` - Rotate right
- `Space` - Fire plasma cannons
- `Shift` - Charge & engage warp drive
- `X` - Brake/Inertial dampening
- `Z` - Activate shields

**Mouse**:
- `Left Click` - Fire weapons
- `Right Click` - Activate shields

**Touch (Mobile)**:
- Left side virtual joystick - Movement
- Right side fire button - Weapons

### Gameplay Tips

1. **Fuel Management**: Watch your fuel gauge! Thrusting and warping consume fuel.
2. **Power Management**: Weapons and shields use power. It recharges automatically.
3. **Shield Strategy**: Use shields (`Z` key) when under heavy fire. They drain quickly!
4. **Warp Drive**: Hold `Shift` for 3 seconds to charge, then engage. Cannot warp near planets!
5. **Combat**: Enemies have red health bars. They'll patrol, pursue, attack, or flee based on AI.
6. **Gravity Wells**: Planets and stars have gravity - use it strategically!

### Your First Mission

1. **Get familiar with controls** - Fly around, test thrust and rotation
2. **Engage an enemy** - Use radar (bottom right) to find red triangles
3. **Use your weapons** - Fire plasma cannons with `Space`
4. **Try the warp drive** - Fly away from the star, hold `Shift`
5. **Explore the system** - Visit planets, asteroids, and space stations

## 🐛 Troubleshooting

### Problem: "Port 3000 is already in use"

**Solution**: Kill the process using port 3000:

```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F

# Or change the port in vite.config.ts
```

### Problem: "Port 3001 is already in use"

**Solution**: Kill the process or change the port in `.env`:

```bash
PORT=3002
```

### Problem: Game runs slowly / low FPS

**Possible solutions**:
1. Close other browser tabs and applications
2. Try a different browser (Chrome recommended for best performance)
3. Reduce browser zoom to 100%
4. Check if hardware acceleration is enabled in browser settings

### Problem: "Module not found" errors

**Solution**: Reinstall dependencies:

```bash
rm -rf node_modules package-lock.json
npm install
```

### Problem: Black screen / game doesn't load

**Checklist**:
1. Check browser console (F12) for errors
2. Ensure both dev servers are running
3. Try clearing browser cache (Ctrl + Shift + R)
4. Check that canvas is supported (modern browsers only)

### Problem: Touch controls not working

**Solution**: Touch controls only appear on touch-enabled devices. Test on mobile or use browser dev tools to simulate touch.

## 📁 Project Structure

```
Interstellar/
├── src/                     # Frontend source code
│   ├── components/
│   │   └── SpaceGame.tsx   # Main React component
│   ├── engine/
│   │   ├── Game.ts         # Core game engine (2000+ lines)
│   │   └── constants.ts    # Color palette & config
│   ├── types/
│   │   └── index.ts        # TypeScript interfaces
│   ├── utils/
│   │   └── SeededRandom.ts # Procedural generation
│   └── main.tsx            # App entry point
│
├── server/                  # Backend API
│   ├── routes/
│   │   ├── savegame.ts     # Save/load functionality
│   │   └── leaderboard.ts  # Score tracking
│   └── index.ts            # Express server
│
├── concepts/                # Reference images
├── index.html              # HTML template
├── package.json            # Dependencies
├── tsconfig.json           # TypeScript config
├── vite.config.ts          # Vite bundler config
└── README.md               # Documentation
```

## 🔧 Development

### Adding New Features

1. **Game Mechanics**: Edit `src/engine/Game.ts`
2. **Visual Changes**: Modify rendering methods in Game.ts
3. **New API Endpoints**: Add routes in `server/routes/`
4. **Type Definitions**: Update `src/types/index.ts`

### Code Style

- TypeScript strict mode enabled
- ESLint for code quality
- Pixel-perfect coordinates (always use `Math.floor()` for rendering)
- Color palette enforced (use `RETRO_PALETTE` constants)

### Testing Locally

```bash
# Lint code
npm run lint

# Build without running
npm run build

# Preview production build
npm run preview
```

## 📚 Next Steps

After setup:

1. ✅ Read the [README.md](./README.md) for game features
2. ✅ Check [Pixelvers.md](./Pixelvers.md) for the full development roadmap
3. ✅ Explore the concept art in `/concepts/` folder
4. ✅ Try modifying the color palette in `src/engine/constants.ts`
5. ✅ Add your own features!

## 🆘 Need Help?

- **Game Code**: All logic is in `src/engine/Game.ts`
- **API**: Server code in `server/index.ts`
- **Types**: Type definitions in `src/types/index.ts`

## 🎉 You're Ready!

Your PixelVerse installation is complete. Fire up those engines and explore the cosmos!

```bash
npm run dev
```

**Happy exploring, Commander! 🚀**
