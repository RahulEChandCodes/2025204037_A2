# Bowling Game - Three.js & Cannon.js

A realistic 3D single-lane bowling game built with Three.js for graphics and Cannon.js for physics simulation.

## Features

### Core Gameplay

- **Realistic Physics**: Powered by Cannon.js physics engine with proper ball dynamics, pin collisions, and gravity
- **Authentic Bowling Lane**: Standard 42-inch width lane with proper length proportions
- **10-Pin Setup**: Regulation triangular pin formation with accurate spacing
- **Complete Scoring System**: Full implementation of bowling scoring rules including strikes, spares, and 10th frame bonus rules

### Game Mechanics

- **Aiming System**: Move mouse left/right to aim your throw
- **Power Control**: Hold SPACEBAR or "Throw Ball" button to charge power, release to throw
- **Ball Physics**: Realistic ball weight (16 lbs), friction, and spin mechanics
- **Pin Physics**: Accurate pin weight (3.6 lbs) and collision detection
- **Lane Features**: Gutters, foul line, arrows for aiming, and pin deck markers

### Visual Features

- **Professional Lighting**: Multiple light sources with realistic shadows
- **Camera System**: Dynamic camera that follows the ball during throws
- **Material Properties**: Realistic materials with proper reflections and shine
- **Lane Markings**: Foul line, aiming arrows, and pin position markers
- **Strike/Spare Animations**: Visual feedback for special scoring

### User Interface

- **Live Scoreboard**: Real-time scoring with proper frame-by-frame tracking
- **Game Information**: Current frame, ball count, and pins down display
- **Power Meter**: Visual power indicator with color-coded zones
- **Instructions Panel**: Complete how-to-play guide
- **Game Status**: Strike/spare notifications and game over messages

## How to Play

### Controls

1. **Aiming**: Move your mouse left and right to aim the ball
2. **Power**: Hold SPACEBAR or click and hold the "Throw Ball" button
3. **Throwing**: Release SPACEBAR or the button to throw the ball
4. **New Game**: Click "New Game" button to restart

### Bowling Rules

- **Objective**: Knock down all 10 pins in each frame
- **Strike**: All pins down with first ball (marked as 'X')
- **Spare**: All pins down with two balls (marked as '/')
- **Scoring**:
  - Strike = 10 + next two balls
  - Spare = 10 + next one ball
  - Regular = total pins knocked down
- **10th Frame**: Special rules allow up to 3 balls if you get a strike or spare
- **Perfect Game**: 12 strikes in a row = 300 points

### Tips for Success

1. **Aim for the Headpin**: The front pin (#1) is your primary target
2. **Use the Arrows**: Lane arrows help with consistent aiming
3. **Control Your Power**: Too much power can cause the ball to bounce
4. **Watch the Spin**: Ball will naturally curve based on release angle
5. **Stay Consistent**: Find an aiming point and power level that works

## Technical Implementation

### Dependencies

- **Three.js**: 3D graphics rendering and scene management
- **Cannon.js**: Physics simulation for realistic ball and pin interactions
- **Vite**: Modern build tool for fast development and optimized production builds

### Key Components

- **Scene Setup**: Camera, lighting, and rendering configuration
- **Physics World**: Gravity, collision detection, and material properties
- **Game Logic**: Frame tracking, scoring calculation, and game state management
- **Visual Effects**: Shadows, lighting, and particle systems
- **User Interface**: Score tracking, controls, and game feedback

### Performance Features

- **Optimized Physics**: Efficient collision detection and physics stepping
- **Smooth Animations**: 60 FPS rendering with requestAnimationFrame
- **Responsive Design**: Adapts to different screen sizes
- **Memory Management**: Proper cleanup and resource management

## Installation & Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Game Architecture

The game is built with a modular class-based architecture:

1. **BowlingGame Class**: Main game controller
2. **Scene Management**: Three.js scene, camera, and renderer setup
3. **Physics Integration**: Cannon.js world with realistic material properties
4. **Game State Management**: Frame tracking, scoring, and progression
5. **UI Controller**: Real-time updates and user interaction handling

## Future Enhancements

Potential improvements for future versions:

- Multiple camera angles
- Sound effects and background music
- Particle effects for strikes and spares
- Multiple ball types with different properties
- Tournament mode with multiple games
- Online leaderboards
- Mobile touch controls
- VR support

## Browser Compatibility

This game works on all modern browsers that support:

- WebGL (for Three.js rendering)
- ES6 Modules (for modern JavaScript)
- Canvas API (for 2D UI elements)

Tested on: Chrome, Firefox, Safari, and Edge (latest versions)

---

**Enjoy your game of bowling!** 🎳
