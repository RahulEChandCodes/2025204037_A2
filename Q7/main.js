import * as THREE from "three";
import * as CANNON from "cannon-es";

class BowlingGame {
  constructor() {
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.world = null;

    // Game objects
    this.ball = null;
    this.ballBody = null;
    this.pins = [];
    this.pinBodies = [];
    this.lane = null;
    this.laneBody = null;

    // Game state
    this.gameState = {
      currentFrame: 1,
      currentBall: 1,
      scores: new Array(10).fill([]),
      totalScore: 0,
      pinsDown: 0,
      gameOver: false,
      ballThrown: false,
      ballSettled: true,
    };

    // Controls
    this.mouse = { x: 0, y: 0 };
    this.powerCharging = false;
    this.power = 0;
    this.aimAngle = 0;

    // Constants
    this.LANE_LENGTH = 12; // Shorter for better gameplay
    this.LANE_WIDTH = 1.05; // meters (42 inches)
    this.PIN_HEIGHT = 0.381; // meters (15 inches)
    this.BALL_RADIUS = 0.1085; // meters (4.27 inches)

    this.init();
  }

  init() {
    this.setupScene();
    this.setupPhysics();
    this.createLane();
    this.createBall();
    this.createPins();
    this.setupLighting();
    this.setupControls();
    this.setupUI();
    this.animate();
  }

  setupScene() {
    // Create scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x1a1a2e);
    this.scene.fog = new THREE.Fog(0x1a1a2e, 10, 50);

    // Create camera
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 2.5, -2.5);
    this.camera.lookAt(0, 0, 6);

    // Create renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: document.getElementById("gameCanvas"),
      antialias: true,
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1;

    // Handle window resize
    window.addEventListener("resize", () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  setupPhysics() {
    this.world = new CANNON.World();
    this.world.gravity.set(0, -9.82, 0);
    this.world.broadphase = new CANNON.NaiveBroadphase();

    // Create materials
    this.ballMaterial = new CANNON.Material("ball");
    this.pinMaterial = new CANNON.Material("pin");
    this.laneMaterial = new CANNON.Material("lane");

    // Contact materials
    const ballLaneContact = new CANNON.ContactMaterial(
      this.ballMaterial,
      this.laneMaterial,
      { friction: 0.02, restitution: 0.4 }
    );

    const ballPinContact = new CANNON.ContactMaterial(
      this.ballMaterial,
      this.pinMaterial,
      { friction: 0.05, restitution: 0.6 }
    );

    const pinPinContact = new CANNON.ContactMaterial(
      this.pinMaterial,
      this.pinMaterial,
      { friction: 0.1, restitution: 0.3 }
    );

    this.world.addContactMaterial(ballLaneContact);
    this.world.addContactMaterial(ballPinContact);
    this.world.addContactMaterial(pinPinContact);
  }

  createLane() {
    // Main lane geometry
    const laneGeometry = new THREE.BoxGeometry(
      this.LANE_WIDTH,
      0.1,
      this.LANE_LENGTH
    );
    const laneMaterial = new THREE.MeshLambertMaterial({
      color: 0x8b4513,
      transparent: true,
      opacity: 0.8,
    });
    this.lane = new THREE.Mesh(laneGeometry, laneMaterial);
    this.lane.position.set(0, -0.05, this.LANE_LENGTH / 2);
    this.lane.receiveShadow = true;
    this.scene.add(this.lane);

    // Pin collection area (behind pins)
    const pinAreaGeometry = new THREE.BoxGeometry(this.LANE_WIDTH, 0.1, 2);
    const pinAreaMaterial = new THREE.MeshLambertMaterial({ color: 0x654321 });
    this.pinArea = new THREE.Mesh(pinAreaGeometry, pinAreaMaterial);
    this.pinArea.position.set(0, -0.05, this.LANE_LENGTH + 1);
    this.pinArea.receiveShadow = true;
    this.scene.add(this.pinArea);

    // Lane physics body
    const laneShape = new CANNON.Box(
      new CANNON.Vec3(this.LANE_WIDTH / 2, 0.05, this.LANE_LENGTH / 2)
    );
    this.laneBody = new CANNON.Body({ mass: 0, material: this.laneMaterial });
    this.laneBody.addShape(laneShape);
    this.laneBody.position.set(0, -0.05, this.LANE_LENGTH / 2);
    this.world.addBody(this.laneBody);

    // Pin area physics body
    const pinAreaShape = new CANNON.Box(
      new CANNON.Vec3(this.LANE_WIDTH / 2, 0.05, 1)
    );
    this.pinAreaBody = new CANNON.Body({
      mass: 0,
      material: this.laneMaterial,
    });
    this.pinAreaBody.addShape(pinAreaShape);
    this.pinAreaBody.position.set(0, -0.05, this.LANE_LENGTH + 1);
    this.world.addBody(this.pinAreaBody);

    // Create gutters
    this.createGutters();

    // Create pin deck markers
    this.createPinDeckMarkers();

    // Create lane markings
    this.createLaneMarkings();
  }

  createGutters() {
    const gutterWidth = 0.2;
    const gutterHeight = 0.1;

    // Left gutter
    const leftGutterGeometry = new THREE.BoxGeometry(
      gutterWidth,
      gutterHeight,
      this.LANE_LENGTH
    );
    const gutterMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
    const leftGutter = new THREE.Mesh(leftGutterGeometry, gutterMaterial);
    leftGutter.position.set(
      -(this.LANE_WIDTH / 2 + gutterWidth / 2),
      gutterHeight / 2 - 0.05,
      this.LANE_LENGTH / 2
    );
    leftGutter.receiveShadow = true;
    this.scene.add(leftGutter);

    // Right gutter
    const rightGutter = new THREE.Mesh(leftGutterGeometry, gutterMaterial);
    rightGutter.position.set(
      this.LANE_WIDTH / 2 + gutterWidth / 2,
      gutterHeight / 2 - 0.05,
      this.LANE_LENGTH / 2
    );
    rightGutter.receiveShadow = true;
    this.scene.add(rightGutter);

    // Gutter physics bodies
    const gutterShape = new CANNON.Box(
      new CANNON.Vec3(gutterWidth / 2, gutterHeight / 2, this.LANE_LENGTH / 2)
    );

    const leftGutterBody = new CANNON.Body({
      mass: 0,
      material: this.laneMaterial,
    });
    leftGutterBody.addShape(gutterShape);
    leftGutterBody.position.copy(leftGutter.position);
    this.world.addBody(leftGutterBody);

    const rightGutterBody = new CANNON.Body({
      mass: 0,
      material: this.laneMaterial,
    });
    rightGutterBody.addShape(gutterShape);
    rightGutterBody.position.copy(rightGutter.position);
    this.world.addBody(rightGutterBody);
  }

  createPinDeckMarkers() {
    // Create triangular pin positions markers
    const markerGeometry = new THREE.CircleGeometry(0.02, 8);
    const markerMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.5,
    });

    const pinPositions = this.getPinPositions();
    pinPositions.forEach((pos) => {
      const marker = new THREE.Mesh(markerGeometry, markerMaterial);
      marker.rotation.x = -Math.PI / 2;
      marker.position.set(pos.x, 0.01, pos.z);
      this.scene.add(marker);
    });
  }

  createLaneMarkings() {
    // Foul line
    const foulLineGeometry = new THREE.BoxGeometry(this.LANE_WIDTH, 0.02, 0.05);
    const foulLineMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const foulLine = new THREE.Mesh(foulLineGeometry, foulLineMaterial);
    foulLine.position.set(0, 0.01, 0);
    this.scene.add(foulLine);

    // Arrows (aiming marks)
    for (let i = 0; i < 7; i++) {
      const arrowGeometry = new THREE.ConeGeometry(0.03, 0.1, 3);
      const arrowMaterial = new THREE.MeshBasicMaterial({ color: 0x333333 });
      const arrow = new THREE.Mesh(arrowGeometry, arrowMaterial);
      arrow.rotation.x = Math.PI / 2;
      arrow.position.set((i - 3) * 0.15, 0.02, 5);
      this.scene.add(arrow);
    }
  }

  createBall() {
    // Ball geometry
    const ballGeometry = new THREE.SphereGeometry(this.BALL_RADIUS, 32, 32);
    const ballMaterial = new THREE.MeshPhongMaterial({
      color: 0x000080,
      shininess: 100,
      specular: 0x222222,
    });
    this.ball = new THREE.Mesh(ballGeometry, ballMaterial);
    this.ball.position.set(0, this.BALL_RADIUS, 0);
    this.ball.castShadow = true;
    this.scene.add(this.ball);

    // Ball physics body
    const ballShape = new CANNON.Sphere(this.BALL_RADIUS);
    this.ballBody = new CANNON.Body({
      mass: 7.26, // kg (16 pounds)
      material: this.ballMaterial,
    });
    // Reduce damping for better ball movement
    this.ballBody.linearDamping = 0.01; // Very low damping
    this.ballBody.angularDamping = 0.01;
    this.ballBody.addShape(ballShape);
    this.ballBody.position.copy(this.ball.position);
    this.world.addBody(this.ballBody);
  }

  createPins() {
    this.pins = [];
    this.pinBodies = [];

    const pinPositions = this.getPinPositions();

    pinPositions.forEach((pos, index) => {
      // Pin geometry (approximated as cylinder)
      const pinGeometry = new THREE.CylinderGeometry(
        0.03,
        0.06,
        this.PIN_HEIGHT,
        8
      );
      const pinMaterial = new THREE.MeshPhongMaterial({
        color: 0xfffff0,
        shininess: 50,
      });
      const pin = new THREE.Mesh(pinGeometry, pinMaterial);
      pin.position.set(pos.x, this.PIN_HEIGHT / 2, pos.z);
      pin.castShadow = true;
      pin.receiveShadow = true;
      this.scene.add(pin);
      this.pins.push(pin);

      // Pin physics body
      const pinShape = new CANNON.Cylinder(0.03, 0.06, this.PIN_HEIGHT, 8);
      const pinBody = new CANNON.Body({
        mass: 1.64, // kg (3.6 pounds)
        material: this.pinMaterial,
      });
      pinBody.addShape(pinShape);
      pinBody.position.copy(pin.position);
      this.world.addBody(pinBody);
      this.pinBodies.push(pinBody);
    });
  }

  getPinPositions() {
    const spacing = 0.25; // Slightly tighter spacing for shorter lane
    const baseZ = this.LANE_LENGTH - 2; // 2m from end for better fit

    return [
      // Back row (4 pins)
      { x: -1.5 * spacing, z: baseZ + 3 * spacing * Math.sin(Math.PI / 3) },
      { x: -0.5 * spacing, z: baseZ + 3 * spacing * Math.sin(Math.PI / 3) },
      { x: 0.5 * spacing, z: baseZ + 3 * spacing * Math.sin(Math.PI / 3) },
      { x: 1.5 * spacing, z: baseZ + 3 * spacing * Math.sin(Math.PI / 3) },

      // Third row (3 pins)
      { x: -spacing, z: baseZ + 2 * spacing * Math.sin(Math.PI / 3) },
      { x: 0, z: baseZ + 2 * spacing * Math.sin(Math.PI / 3) },
      { x: spacing, z: baseZ + 2 * spacing * Math.sin(Math.PI / 3) },

      // Second row (2 pins)
      { x: -spacing / 2, z: baseZ + spacing * Math.sin(Math.PI / 3) },
      { x: spacing / 2, z: baseZ + spacing * Math.sin(Math.PI / 3) },

      // Front row (1 pin - headpin)
      { x: 0, z: baseZ },
    ];
  }

  setupLighting() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    this.scene.add(ambientLight);

    // Main directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.near = 0.1;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -10;
    directionalLight.shadow.camera.right = 10;
    directionalLight.shadow.camera.top = 10;
    directionalLight.shadow.camera.bottom = -10;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    this.scene.add(directionalLight);

    // Spot lights for lane
    const spotLight1 = new THREE.SpotLight(
      0xffffff,
      0.5,
      30,
      Math.PI / 6,
      0.1,
      1
    );
    spotLight1.position.set(-2, 8, 10);
    spotLight1.target.position.set(0, 0, 14);
    this.scene.add(spotLight1);
    this.scene.add(spotLight1.target);

    const spotLight2 = new THREE.SpotLight(
      0xffffff,
      0.5,
      30,
      Math.PI / 6,
      0.1,
      1
    );
    spotLight2.position.set(2, 8, 10);
    spotLight2.target.position.set(0, 0, 14);
    this.scene.add(spotLight2);
    this.scene.add(spotLight2.target);
  }

  setupControls() {
    // Mouse movement for aiming - more responsive
    document.addEventListener("mousemove", (event) => {
      if (this.gameState.ballSettled && !this.gameState.ballThrown) {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.aimAngle = this.mouse.x * 0.4; // Slightly more range for better aiming
      }
    });

    // Spacebar for power control
    document.addEventListener("keydown", (event) => {
      if (
        event.code === "Space" &&
        this.gameState.ballSettled &&
        !this.gameState.ballThrown
      ) {
        event.preventDefault();
        this.startPowerCharge();
      }
    });

    document.addEventListener("keyup", (event) => {
      if (event.code === "Space" && this.powerCharging) {
        event.preventDefault();
        this.throwBall();
      }
    });

    // Button controls
    const throwButton = document.getElementById("throwButton");
    throwButton.addEventListener("mousedown", () => {
      if (this.gameState.ballSettled && !this.gameState.ballThrown) {
        this.startPowerCharge();
      }
    });

    throwButton.addEventListener("mouseup", () => {
      if (this.powerCharging) {
        this.throwBall();
      }
    });

    document.getElementById("resetGameButton").addEventListener("click", () => {
      this.resetGame();
    });
  }

  setupUI() {
    this.updateScoreBoard();
    this.updateGameInfo();
  }

  startPowerCharge() {
    this.powerCharging = true;
    this.power = 1;

    const chargePower = () => {
      if (this.powerCharging) {
        this.power = Math.min(this.power + 0.025, 1); // Faster, more responsive
        this.updatePowerMeter();
        requestAnimationFrame(chargePower);
      }
    };
    chargePower();
  }

  throwBall() {
    if (!this.powerCharging || this.gameState.ballThrown) return;

    this.powerCharging = false;
    this.gameState.ballThrown = true;
    this.gameState.ballSettled = false;

    // Calculate throw parameters - adjusted for low friction
    const minForce = 5;
    const maxForce = 70;
    const throwForce = minForce + this.power * (maxForce - minForce);
    const angleVariation = (Math.random() - 0.5) * 0.01; // Less variation
    // angleVariation
    const finalAngle = this.aimAngle;

    // Reset ball position and wake it up
    this.ballBody.wakeUp(); // Wake up the ball from sleep state
    this.ballBody.position.set(0, this.BALL_RADIUS, 0);
    this.ballBody.velocity.set(0, 0, 0);
    this.ballBody.angularVelocity.set(0, 0, 0);

    // Apply force - better for low friction physics
    const forceVector = new CANNON.Vec3(
      Math.sin(finalAngle) * throwForce * 0.4,
      0,
      throwForce
    );
    this.ballBody.applyImpulse(forceVector);

    // Add realistic bowling ball spin
    this.ballBody.angularVelocity.set(
      -finalAngle * throwForce * 0.2, // Side spin: negative angle = right spin, positive = left spin
      0, // No y-axis spin
      -throwForce * 0.15 // Forward roll (negative Z = forward rotation)
    );

    // Reset power meter
    this.power = 0;
    this.updatePowerMeter();

    // Check for ball settlement after a delay
    setTimeout(() => {
      this.checkBallSettlement();
    }, 1500);
  }

  checkBallSettlement() {
    let settlementCount = 0; // Count consecutive slow measurements

    const checkSettlement = () => {
      const ballPos = this.ballBody.position;
      const velocity = this.ballBody.velocity.length();
      const angularVelocity = this.ballBody.angularVelocity.length();

      // Check if ball is in gutter
      if (Math.abs(ballPos.x) > this.LANE_WIDTH / 2) {
        this.handleGutterBall();
        return;
      }

      // Check if ball reached the end of the lane
      if (ballPos.z > this.LANE_LENGTH + 2) {
        this.handleBallReturn();
        return;
      }

      if (velocity < 0.05 && angularVelocity < 0.05) {
        settlementCount++;
        // Require 3 consecutive slow measurements to confirm settlement
        if (settlementCount >= 3) {
          this.onBallSettled();
          return;
        }
      } else {
        settlementCount = 0; // Reset if ball speeds up
      }

      if (velocity < 0.5) {
        // Check more frequently when ball is slow
        setTimeout(checkSettlement, 150);
      } else {
        setTimeout(checkSettlement, 300);
      }
    };
    checkSettlement();
  }
  onBallSettled() {
    this.gameState.ballSettled = true;
    this.gameState.ballThrown = false;

    // Completely stop the ball to prevent micro-movements
    this.ballBody.velocity.set(0, 0, 0);
    this.ballBody.angularVelocity.set(0, 0, 0);
    this.ballBody.sleep(); // Put ball body to sleep to stop physics calculations

    // Count fallen pins
    const pinsDown = this.countFallenPins();
    this.gameState.pinsDown = pinsDown;

    // Update score
    this.updateScore(pinsDown);

    // Check game state
    this.checkGameState();

    this.updateUI();
  }

  handleGutterBall() {
    this.gameState.ballSettled = true;
    this.gameState.ballThrown = false;

    // Stop the ball and put it to sleep
    this.ballBody.velocity.set(0, 0, 0);
    this.ballBody.angularVelocity.set(0, 0, 0);
    this.ballBody.sleep();

    // Show gutter ball message
    this.showMessage("Gutter Ball!", "gutter");

    // No pins knocked down in gutter
    this.gameState.pinsDown = 0;
    this.updateScore(0);
    this.checkGameState();
    this.updateUI();
  }

  handleBallReturn() {
    this.gameState.ballSettled = true;
    this.gameState.ballThrown = false;

    // Ball reached the end - automatic return
    this.ballBody.velocity.set(0, 0, 0);
    this.ballBody.angularVelocity.set(0, 0, 0);
    this.ballBody.sleep();

    // Count fallen pins and remove them
    const pinsDown = this.countFallenPins();
    this.gameState.pinsDown = pinsDown;

    // Remove fallen pins (simulate pin sweep)
    this.removeFallenPins();

    this.updateScore(pinsDown);
    this.checkGameState();
    this.updateUI();
  }

  removeFallenPins() {
    // Hide and disable fallen pins
    this.pinBodies.forEach((pinBody, index) => {
      const rotation = pinBody.quaternion;
      const upVector = new CANNON.Vec3(0, 1, 0);
      rotation.vmult(upVector, upVector);

      if (upVector.y < 0.7 || pinBody.position.y < 0.1) {
        // Hide the fallen pin
        this.pins[index].visible = false;
        // Move pin out of physics world
        pinBody.position.set(100, -10, 100); // Move far away
        pinBody.velocity.set(0, 0, 0);
        pinBody.angularVelocity.set(0, 0, 0);
      }
    });
  }

  countFallenPins() {
    let fallenCount = 0;
    this.pinBodies.forEach((pinBody) => {
      // Check if pin is significantly tilted or displaced
      const rotation = pinBody.quaternion;
      const upVector = new CANNON.Vec3(0, 1, 0);
      rotation.vmult(upVector, upVector);

      if (upVector.y < 0.7 || pinBody.position.y < 0.1) {
        fallenCount++;
      }
    });
    return fallenCount;
  }

  updateScore(pinsDown) {
    const frame = this.gameState.currentFrame - 1;
    const ball = this.gameState.currentBall;

    if (!this.gameState.scores[frame]) {
      this.gameState.scores[frame] = [];
    }

    this.gameState.scores[frame][ball - 1] =
      pinsDown - (this.gameState.scores[frame][0] || 0);

    // Calculate total score
    this.calculateTotalScore();
  }

  calculateTotalScore() {
    let total = 0;

    for (let frame = 0; frame < 10; frame++) {
      const scores = this.gameState.scores[frame];
      if (!scores || scores.length === 0) break;

      if (frame < 9) {
        // Frames 1-9
        if (scores[0] === 10) {
          // Strike
          total += 10;
          const nextFrame = this.gameState.scores[frame + 1];
          if (nextFrame && nextFrame.length > 0) {
            total += nextFrame[0];
            if (nextFrame[0] === 10 && frame < 8) {
              // Double strike
              const nextNextFrame = this.gameState.scores[frame + 2];
              if (nextNextFrame && nextNextFrame.length > 0) {
                total += nextNextFrame[0];
              }
            } else if (nextFrame.length > 1) {
              total += nextFrame[1];
            }
          }
        } else if (scores.length === 2 && scores[0] + scores[1] === 10) {
          // Spare
          total += 10;
          const nextFrame = this.gameState.scores[frame + 1];
          if (nextFrame && nextFrame.length > 0) {
            total += nextFrame[0];
          }
        } else {
          total += scores.reduce((sum, score) => sum + score, 0);
        }
      } else {
        // 10th frame
        total += scores.reduce((sum, score) => sum + score, 0);
      }
    }

    this.gameState.totalScore = total;
  }

  checkGameState() {
    const pinsDown = this.gameState.pinsDown;
    const currentBall = this.gameState.currentBall;

    if (pinsDown === 10 || currentBall === 2) {
      // Frame complete
      if (pinsDown === 10 && currentBall === 1) {
        this.showMessage("STRIKE!", "strike");
      } else if (pinsDown === 10 && currentBall === 2) {
        this.showMessage("SPARE!", "spare");
      }

      this.nextFrame();
    } else {
      // Next ball in same frame - remove fallen pins but keep standing ones
      this.removeFallenPins();
      this.gameState.currentBall = 2;
    }
  }

  nextFrame() {
    if (this.gameState.currentFrame === 10) {
      // Handle 10th frame special rules
      const scores = this.gameState.scores[9];
      if (
        scores &&
        (scores[0] === 10 ||
          (scores.length === 2 && scores[0] + scores[1] === 10))
      ) {
        if (scores.length < 3) {
          this.gameState.currentBall = scores.length + 1;
          this.resetPins();
          this.resetBallPosition();
          return;
        }
      }
      this.gameState.gameOver = true;
      this.showMessage("Game Over!", "");
    } else {
      this.gameState.currentFrame++;
      this.gameState.currentBall = 1;
      this.resetPins();
      this.resetBallPosition();
    }
  }

  resetPins() {
    this.pinBodies.forEach((pinBody, index) => {
      const pos = this.getPinPositions()[index];
      // Restore pin visibility
      this.pins[index].visible = true;
      // Reset pin physics
      pinBody.position.set(pos.x, this.PIN_HEIGHT / 2, pos.z);
      pinBody.quaternion.set(0, 0, 0, 1);
      pinBody.velocity.set(0, 0, 0);
      pinBody.angularVelocity.set(0, 0, 0);
      // Wake up the pin in case it was sleeping
      pinBody.wakeUp();
    });
    this.gameState.pinsDown = 0;
  }

  resetBallPosition() {
    this.ballBody.wakeUp(); // Wake up the ball
    this.ballBody.position.set(0, this.BALL_RADIUS, 0);
    this.ballBody.velocity.set(0, 0, 0);
    this.ballBody.angularVelocity.set(0, 0, 0);
  }

  resetGame() {
    this.gameState = {
      currentFrame: 1,
      currentBall: 1,
      scores: new Array(10).fill([]),
      totalScore: 0,
      pinsDown: 0,
      gameOver: false,
      ballThrown: false,
      ballSettled: true,
    };

    this.resetPins();
    this.resetBallPosition();
    this.updateUI();
    this.hideMessage();
  }

  showMessage(text, type) {
    const gameStatus = document.getElementById("gameStatus");
    const statusMessage = gameStatus.querySelector(".status-message");
    statusMessage.textContent = text;
    statusMessage.className = `status-message ${type}`;
    gameStatus.style.display = "block";

    // Show longer for strikes and spares
    const duration = type === "strike" || type === "spare" ? 3000 : 2000;
    setTimeout(() => {
      this.hideMessage();
    }, duration);
  }

  hideMessage() {
    document.getElementById("gameStatus").style.display = "none";
  }

  updatePowerMeter() {
    const powerBar = document.getElementById("powerBar");
    powerBar.style.width = `${this.power * 100}%`;
  }

  updateScoreBoard() {
    const framesContainer = document.getElementById("frames");
    framesContainer.innerHTML = "";

    for (let i = 0; i < 10; i++) {
      const frameDiv = document.createElement("div");
      frameDiv.className = "frame";

      const frameNumber = document.createElement("div");
      frameNumber.className = "frame-number";
      frameNumber.textContent = i + 1;
      frameDiv.appendChild(frameNumber);

      const frameScore = document.createElement("div");
      frameScore.className = "frame-score";

      const scores = this.gameState.scores[i];
      if (scores && scores.length > 0) {
        if (i < 9) {
          // Frames 1-9
          if (scores[0] === 10) {
            frameScore.textContent = "X";
          } else if (scores.length === 2) {
            if (scores[0] + scores[1] === 10) {
              frameScore.textContent = `${scores[0]}/`;
            } else {
              frameScore.textContent = `${scores[0]}${scores[1]}`;
            }
          } else {
            frameScore.textContent = `${scores[0]}`;
          }
        } else {
          // 10th frame
          let text = "";
          scores.forEach((score, index) => {
            if (score === 10) {
              text += "X";
            } else if (index > 0 && scores[index - 1] + score === 10) {
              text += "/";
            } else {
              text += score;
            }
          });
          frameScore.textContent = text;
        }
      }

      frameDiv.appendChild(frameScore);
      framesContainer.appendChild(frameDiv);
    }

    document.getElementById(
      "totalScore"
    ).textContent = `Total Score: ${this.gameState.totalScore}`;
  }

  updateGameInfo() {
    document.getElementById("currentFrame").textContent =
      this.gameState.currentFrame;
    document.getElementById("currentBall").textContent =
      this.gameState.currentBall;
    document.getElementById("pinsDown").textContent = this.gameState.pinsDown;
  }

  updateUI() {
    this.updateScoreBoard();
    this.updateGameInfo();
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    // Step physics
    this.world.step(1 / 60);

    // Update ball visual position
    if (this.ball && this.ballBody) {
      this.ball.position.copy(this.ballBody.position);
      this.ball.quaternion.copy(this.ballBody.quaternion);
    }

    // Update pins visual positions
    this.pins.forEach((pin, index) => {
      if (this.pinBodies[index]) {
        pin.position.copy(this.pinBodies[index].position);
        pin.quaternion.copy(this.pinBodies[index].quaternion);
      }
    });

    // Camera follow ball
    if (
      this.ballBody &&
      this.gameState.ballThrown &&
      !this.gameState.ballSettled
    ) {
      // Smooth camera follow with better positioning for shorter lane
      const targetZ = Math.max(-3, Math.min(this.ballBody.position.z - 2, 8));
      const targetY = 2.5 + Math.min(this.ballBody.position.z * 0.08, 0.8);
      this.camera.position.z += (targetZ - this.camera.position.z) * 0.2;
      this.camera.position.y += (targetY - this.camera.position.y) * 0.15;
      this.camera.lookAt(
        this.ballBody.position.x,
        0,
        this.ballBody.position.z + 2
      );
    } else {
      // Return camera to starting position
      this.camera.position.z += (-2.5 - this.camera.position.z) * 0.1;
      this.camera.position.y += (2.5 - this.camera.position.y) * 0.1;
      this.camera.lookAt(0, 0, 6);
    }

    // Update aim indicator
    if (this.gameState.ballSettled && !this.gameState.ballThrown) {
      this.ball.position.x = Math.sin(this.aimAngle) * 0.4;
    }

    this.renderer.render(this.scene, this.camera);
  }
}

// Start the game when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new BowlingGame();
});
