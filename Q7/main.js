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
      scores: Array.from({ length: 10 }, () => []), // Create separate arrays for each frame
      totalScore: 0,
      pinsDown: 0,
      pinsDownThisFrame: 0, // Track pins from start of current frame
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
    // Authentic bowling alley atmosphere - dim, warm lighting
    this.scene.background = new THREE.Color(0x2f2f2f); // Dark gray
    this.scene.fog = new THREE.Fog(0x2f2f2f, 15, 40); // Atmospheric fog

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

    // Add collision event listener for debugging
    this.world.addEventListener("beginContact", (event) => {
      const { bodyA, bodyB } = event;

      // Check if ball hit a pin
      if (this.ballBody && this.pinBodies && this.pinBodies.length > 0) {
        if (
          (bodyA === this.ballBody && this.pinBodies.includes(bodyB)) ||
          (bodyB === this.ballBody && this.pinBodies.includes(bodyA))
        ) {
          console.log("Ball hit a pin! Ball position:", this.ballBody.position);
        }
      }
    });
  }

  createLane() {
    // Main bowling lane - authentic maple wood
    const laneGeometry = new THREE.BoxGeometry(
      this.LANE_WIDTH,
      0.1,
      this.LANE_LENGTH
    );

    // Realistic polished maple bowling lane material
    const laneMaterial = new THREE.MeshPhongMaterial({
      color: 0xd2b48c, // Light wood color
      specular: 0x444444,
      shininess: 100, // Highly polished surface
      transparent: false,
    });

    this.lane = new THREE.Mesh(laneGeometry, laneMaterial);
    this.lane.position.set(0, -0.05, this.LANE_LENGTH / 2);
    this.lane.receiveShadow = true;
    this.lane.castShadow = false;
    this.scene.add(this.lane);

    // Add wood grain effect with subtle texture
    this.addWoodGrainEffect();

    // Pin collection area - darker hardwood
    const pinAreaGeometry = new THREE.BoxGeometry(this.LANE_WIDTH, 0.1, 2);
    const pinAreaMaterial = new THREE.MeshPhongMaterial({
      color: 0x8b4513, // Saddle brown
      specular: 0x333333,
      shininess: 60,
    });
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

    // Create gutters (trenches, not walls!)
    this.createGutters();

    // Create pin collection area at end of lane
    this.createPinCollectionArea();

    // Create invisible safety boundaries to prevent ball from falling off map
    this.createSafetyBoundaries();

    // Create pin deck markers
    this.createPinDeckMarkers();

    // Create lane markings
    this.createLaneMarkings();

    // Add bowling alley atmosphere
    this.createBowlingAlleyAtmosphere();
  }

  addWoodGrainEffect() {
    // Create subtle wood grain lines along the lane
    const grainLines = 8;
    for (let i = 0; i < grainLines; i++) {
      const grainGeometry = new THREE.BoxGeometry(
        0.005,
        0.001,
        this.LANE_LENGTH
      );
      const grainMaterial = new THREE.MeshBasicMaterial({
        color: 0xa0522d, // Darker wood tone
        transparent: true,
        opacity: 0.3,
      });
      const grainLine = new THREE.Mesh(grainGeometry, grainMaterial);
      const xPos = (i - grainLines / 2) * (this.LANE_WIDTH / grainLines);
      grainLine.position.set(xPos, 0.001, this.LANE_LENGTH / 2);
      this.scene.add(grainLine);
    }
  }

  createGutters() {
    // Create realistic bowling alley gutters
    const gutterWidth = 0.24; // Standard gutter width
    const gutterDepth = 0.15;
    const gutterLength = this.LANE_LENGTH;

    // Professional bowling gutter material - fiberglass/composite
    const gutterGeometry = new THREE.BoxGeometry(
      gutterWidth,
      gutterDepth,
      gutterLength
    );
    const gutterMaterial = new THREE.MeshPhongMaterial({
      color: 0x1a1a1a, // Dark charcoal
      specular: 0x444444,
      shininess: 40,
      transparent: false,
    });

    // Left gutter trench (visual only - no collision)
    const leftGutter = new THREE.Mesh(gutterGeometry, gutterMaterial);
    leftGutter.position.set(
      -(this.LANE_WIDTH / 2 + gutterWidth / 2),
      -gutterDepth / 2, // Below ground level
      gutterLength / 2
    );
    leftGutter.receiveShadow = true;
    this.scene.add(leftGutter);

    // Right gutter trench (visual only - no collision)
    const rightGutter = new THREE.Mesh(gutterGeometry, gutterMaterial);
    rightGutter.position.set(
      this.LANE_WIDTH / 2 + gutterWidth / 2,
      -gutterDepth / 2, // Below ground level
      gutterLength / 2
    );
    rightGutter.receiveShadow = true;
    this.scene.add(rightGutter);

    // Create gutter floors for balls to settle on
    const gutterFloorGeometry = new THREE.BoxGeometry(
      gutterWidth,
      0.05,
      gutterLength
    );
    const gutterFloorMaterial = new THREE.MeshLambertMaterial({
      color: 0x111111,
    });

    // Left gutter floor physics
    const leftGutterFloor = new THREE.Mesh(
      gutterFloorGeometry,
      gutterFloorMaterial
    );
    leftGutterFloor.position.set(
      -(this.LANE_WIDTH / 2 + gutterWidth / 2),
      -gutterDepth + 0.025,
      gutterLength / 2
    );
    this.scene.add(leftGutterFloor);

    const leftGutterFloorBody = new CANNON.Body({ mass: 0 });
    leftGutterFloorBody.addShape(
      new CANNON.Box(new CANNON.Vec3(gutterWidth / 2, 0.025, gutterLength / 2))
    );
    leftGutterFloorBody.position.copy(leftGutterFloor.position);
    leftGutterFloorBody.material = this.laneMaterial;
    this.world.addBody(leftGutterFloorBody);

    // Right gutter floor physics
    const rightGutterFloor = new THREE.Mesh(
      gutterFloorGeometry,
      gutterFloorMaterial
    );
    rightGutterFloor.position.set(
      this.LANE_WIDTH / 2 + gutterWidth / 2,
      -gutterDepth + 0.025,
      gutterLength / 2
    );
    this.scene.add(rightGutterFloor);

    const rightGutterFloorBody = new CANNON.Body({ mass: 0 });
    rightGutterFloorBody.addShape(
      new CANNON.Box(new CANNON.Vec3(gutterWidth / 2, 0.025, gutterLength / 2))
    );
    rightGutterFloorBody.position.copy(rightGutterFloor.position);
    rightGutterFloorBody.material = this.laneMaterial;
    this.world.addBody(rightGutterFloorBody);

    // Add decorative gutter caps (chrome/metal strips)
    this.createGutterCaps(gutterWidth, gutterLength);
  }

  createGutterCaps(gutterWidth, gutterLength) {
    // Chrome/metal caps on gutter edges
    const capGeometry = new THREE.BoxGeometry(0.02, 0.03, gutterLength);
    const capMaterial = new THREE.MeshPhongMaterial({
      color: 0xc0c0c0, // Chrome/silver
      specular: 0xffffff,
      shininess: 200, // High shininess for metallic look
    });

    // Left gutter caps
    const leftOuterCap = new THREE.Mesh(capGeometry, capMaterial);
    leftOuterCap.position.set(
      -(this.LANE_WIDTH / 2 + gutterWidth),
      0.01,
      gutterLength / 2
    );
    this.scene.add(leftOuterCap);

    const leftInnerCap = new THREE.Mesh(capGeometry, capMaterial);
    leftInnerCap.position.set(-this.LANE_WIDTH / 2, 0.01, gutterLength / 2);
    this.scene.add(leftInnerCap);

    // Right gutter caps
    const rightOuterCap = new THREE.Mesh(capGeometry, capMaterial);
    rightOuterCap.position.set(
      this.LANE_WIDTH / 2 + gutterWidth,
      0.01,
      gutterLength / 2
    );
    this.scene.add(rightOuterCap);

    const rightInnerCap = new THREE.Mesh(capGeometry, capMaterial);
    rightInnerCap.position.set(this.LANE_WIDTH / 2, 0.01, gutterLength / 2);
    this.scene.add(rightInnerCap);
  }

  createPinCollectionArea() {
    // Create the area behind pins where balls and pins collect (NOT a gutter!)
    const collectionWidth = this.LANE_WIDTH + 0.8; // Wider than lane + gutters
    const collectionDepth = 2; // 2 meters deep
    const collectionHeight = 0.5;

    // Collection area floor
    const collectionGeometry = new THREE.BoxGeometry(
      collectionWidth,
      0.1,
      collectionDepth
    );
    const collectionMaterial = new THREE.MeshLambertMaterial({
      color: 0x2a2a2a,
      transparent: true,
      opacity: 0.9,
    });

    const collectionArea = new THREE.Mesh(
      collectionGeometry,
      collectionMaterial
    );
    collectionArea.position.set(
      0,
      -0.05,
      this.LANE_LENGTH + collectionDepth / 2
    );
    collectionArea.receiveShadow = true;
    this.scene.add(collectionArea);

    // Collection area physics floor
    const collectionBody = new CANNON.Body({ mass: 0 });
    collectionBody.addShape(
      new CANNON.Box(
        new CANNON.Vec3(collectionWidth / 2, 0.05, collectionDepth / 2)
      )
    );
    collectionBody.position.copy(collectionArea.position);
    collectionBody.material = this.laneMaterial;
    this.world.addBody(collectionBody);

    // Collection area back wall to stop balls
    const backWallGeometry = new THREE.BoxGeometry(
      collectionWidth,
      collectionHeight,
      0.1
    );
    const backWall = new THREE.Mesh(backWallGeometry, collectionMaterial);
    backWall.position.set(
      0,
      collectionHeight / 2,
      this.LANE_LENGTH + collectionDepth - 0.05
    );
    this.scene.add(backWall);

    const backWallBody = new CANNON.Body({ mass: 0 });
    backWallBody.addShape(
      new CANNON.Box(
        new CANNON.Vec3(collectionWidth / 2, collectionHeight / 2, 0.05)
      )
    );
    backWallBody.position.copy(backWall.position);
    backWallBody.material = this.laneMaterial;
    this.world.addBody(backWallBody);
  }

  createSafetyBoundaries() {
    // Create invisible walls far from the lane to catch balls that fall off
    // These are safety nets, not gameplay elements

    const boundaryHeight = 1.0;
    const boundaryThickness = 0.1;

    // Far left boundary (beyond left gutter)
    const leftBoundaryBody = new CANNON.Body({ mass: 0 });
    leftBoundaryBody.addShape(
      new CANNON.Box(
        new CANNON.Vec3(
          boundaryThickness / 2,
          boundaryHeight / 2,
          this.LANE_LENGTH * 1.5
        )
      )
    );
    leftBoundaryBody.position.set(-3, boundaryHeight / 2, this.LANE_LENGTH / 2);
    leftBoundaryBody.material = this.laneMaterial;
    this.world.addBody(leftBoundaryBody);

    // Far right boundary (beyond right gutter)
    const rightBoundaryBody = new CANNON.Body({ mass: 0 });
    rightBoundaryBody.addShape(
      new CANNON.Box(
        new CANNON.Vec3(
          boundaryThickness / 2,
          boundaryHeight / 2,
          this.LANE_LENGTH * 1.5
        )
      )
    );
    rightBoundaryBody.position.set(3, boundaryHeight / 2, this.LANE_LENGTH / 2);
    rightBoundaryBody.material = this.laneMaterial;
    this.world.addBody(rightBoundaryBody);

    // Back boundary (way behind pin collection area)
    const backBoundaryBody = new CANNON.Body({ mass: 0 });
    backBoundaryBody.addShape(
      new CANNON.Box(
        new CANNON.Vec3(4, boundaryHeight / 2, boundaryThickness / 2)
      )
    );
    backBoundaryBody.position.set(0, boundaryHeight / 2, this.LANE_LENGTH + 4);
    backBoundaryBody.material = this.laneMaterial;
    this.world.addBody(backBoundaryBody);

    // Front boundary (behind throwing line)
    const frontBoundaryBody = new CANNON.Body({ mass: 0 });
    frontBoundaryBody.addShape(
      new CANNON.Box(
        new CANNON.Vec3(4, boundaryHeight / 2, boundaryThickness / 2)
      )
    );
    frontBoundaryBody.position.set(0, boundaryHeight / 2, -3);
    frontBoundaryBody.material = this.laneMaterial;
    this.world.addBody(frontBoundaryBody);

    // Ground plane to catch anything that falls
    const groundBody = new CANNON.Body({ mass: 0 });
    groundBody.addShape(new CANNON.Box(new CANNON.Vec3(10, 0.1, 20)));
    groundBody.position.set(0, -2, this.LANE_LENGTH / 2);
    groundBody.material = this.laneMaterial;
    this.world.addBody(groundBody);
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
    // Professional foul line - white with black border
    const foulLineGeometry = new THREE.BoxGeometry(
      this.LANE_WIDTH,
      0.015,
      0.08
    );
    const foulLineMaterial = new THREE.MeshPhongMaterial({
      color: 0xffffff, // Pure white
      specular: 0x222222,
      shininess: 80,
    });
    const foulLine = new THREE.Mesh(foulLineGeometry, foulLineMaterial);
    foulLine.position.set(0, 0.008, 0);
    this.scene.add(foulLine);

    // Targeting arrows - dark triangles embedded in lane
    for (let i = 0; i < 7; i++) {
      const arrowGeometry = new THREE.ConeGeometry(0.025, 0.08, 3);
      const arrowMaterial = new THREE.MeshPhongMaterial({
        color: 0x2f4f4f, // Dark slate gray
        specular: 0x111111,
        shininess: 40,
      });
      const arrow = new THREE.Mesh(arrowGeometry, arrowMaterial);
      arrow.rotation.x = Math.PI / 2;
      arrow.position.set((i - 3) * 0.15, 0.001, 4.5);
      this.scene.add(arrow);
    }

    // Range finder dots at various distances
    this.createRangeFinderDots();

    // Lane approach area
    this.createApproachArea();
  }

  createRangeFinderDots() {
    // Small dots at 7, 10, 12 foot marks for targeting
    const dotPositions = [2.1, 3.0, 3.7]; // Approximate positions
    const dotGeometry = new THREE.CylinderGeometry(0.015, 0.015, 0.005, 8);
    const dotMaterial = new THREE.MeshPhongMaterial({ color: 0x2f4f4f });

    dotPositions.forEach((zPos) => {
      for (let x = -0.3; x <= 0.3; x += 0.15) {
        const dot = new THREE.Mesh(dotGeometry, dotMaterial);
        dot.position.set(x, 0.003, zPos);
        this.scene.add(dot);
      }
    });
  }

  createApproachArea() {
    // Approach area behind foul line - different material
    const approachGeometry = new THREE.BoxGeometry(
      this.LANE_WIDTH + 0.4,
      0.08,
      4
    );
    const approachMaterial = new THREE.MeshPhongMaterial({
      color: 0xf5deb3, // Wheat color - lighter wood
      specular: 0x333333,
      shininess: 60,
    });
    const approach = new THREE.Mesh(approachGeometry, approachMaterial);
    approach.position.set(0, -0.04, -2.5);
    approach.receiveShadow = true;
    this.scene.add(approach);
  }

  createBowlingAlleyAtmosphere() {
    // Add side walls with typical bowling alley paneling
    this.createSideWalls();

    // Add ceiling elements
    this.createCeiling();

    // Add decorative elements
    this.createDecorativeElements();
  }

  createSideWalls() {
    const wallHeight = 3;
    const wallThickness = 0.1;

    // Left wall
    const leftWallGeometry = new THREE.BoxGeometry(
      wallThickness,
      wallHeight,
      this.LANE_LENGTH + 6
    );
    const wallMaterial = new THREE.MeshPhongMaterial({
      color: 0x8b7355, // Tan/beige typical of bowling alleys
      specular: 0x222222,
      shininess: 20,
    });

    const leftWall = new THREE.Mesh(leftWallGeometry, wallMaterial);
    leftWall.position.set(-2.5, wallHeight / 2, this.LANE_LENGTH / 2 - 1);
    leftWall.receiveShadow = true;
    this.scene.add(leftWall);

    // Right wall
    const rightWall = new THREE.Mesh(leftWallGeometry, wallMaterial);
    rightWall.position.set(2.5, wallHeight / 2, this.LANE_LENGTH / 2 - 1);
    rightWall.receiveShadow = true;
    this.scene.add(rightWall);
  }

  createCeiling() {
    // Dropped ceiling with tiles
    const ceilingGeometry = new THREE.BoxGeometry(
      6,
      0.05,
      this.LANE_LENGTH + 4
    );
    const ceilingMaterial = new THREE.MeshLambertMaterial({
      color: 0xf5f5dc, // Beige ceiling tiles
      transparent: true,
      opacity: 0.9,
    });

    const ceiling = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
    ceiling.position.set(0, 3.5, this.LANE_LENGTH / 2);
    ceiling.receiveShadow = false;
    this.scene.add(ceiling);

    // Ceiling tile grid lines
    this.createCeilingGrid();
  }

  createCeilingGrid() {
    // Create grid pattern on ceiling
    const linesMaterial = new THREE.MeshBasicMaterial({ color: 0xd3d3d3 });

    // Horizontal lines
    for (let i = 0; i < 8; i++) {
      const lineGeometry = new THREE.BoxGeometry(6, 0.01, 0.02);
      const line = new THREE.Mesh(lineGeometry, linesMaterial);
      line.position.set(0, 3.51, i * 2);
      this.scene.add(line);
    }

    // Vertical lines
    for (let i = 0; i < 4; i++) {
      const lineGeometry = new THREE.BoxGeometry(
        0.02,
        0.01,
        this.LANE_LENGTH + 4
      );
      const line = new THREE.Mesh(lineGeometry, linesMaterial);
      line.position.set(-3 + i * 2, 3.51, this.LANE_LENGTH / 2);
      this.scene.add(line);
    }
  }

  createDecorativeElements() {
    // Add some decorative bowling alley elements

    // Ball return mechanism (cosmetic)
    this.createBallReturn();

    // Lane number sign
    this.createLaneNumberSign();

    // Seating area
    this.createSeatingArea();
  }

  createBallReturn() {
    // Simple ball return track along the right side
    const returnGeometry = new THREE.BoxGeometry(
      0.15,
      0.08,
      this.LANE_LENGTH * 0.8
    );
    const returnMaterial = new THREE.MeshPhongMaterial({
      color: 0x2f2f2f, // Dark gray metal
      specular: 0x666666,
      shininess: 80,
    });

    const ballReturn = new THREE.Mesh(returnGeometry, returnMaterial);
    ballReturn.position.set(
      this.LANE_WIDTH / 2 + 0.4,
      0.04,
      this.LANE_LENGTH * 0.3
    );
    this.scene.add(ballReturn);
  }

  createLaneNumberSign() {
    // Lane number display
    const signGeometry = new THREE.BoxGeometry(0.3, 0.2, 0.05);
    const signMaterial = new THREE.MeshPhongMaterial({
      color: 0x000080, // Navy blue
      specular: 0x444444,
      shininess: 60,
    });

    const sign = new THREE.Mesh(signGeometry, signMaterial);
    sign.position.set(-1.2, 1.5, this.LANE_LENGTH - 0.5);
    this.scene.add(sign);

    // Lane number "7" (since we're in Q7 folder)
    const numberGeometry = new THREE.BoxGeometry(0.25, 0.15, 0.02);
    const numberMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const number = new THREE.Mesh(numberGeometry, numberMaterial);
    number.position.set(-1.2, 1.5, this.LANE_LENGTH - 0.47);
    this.scene.add(number);
  }

  createSeatingArea() {
    // Simple bench behind the approach
    const benchGeometry = new THREE.BoxGeometry(2, 0.3, 0.4);
    const benchMaterial = new THREE.MeshPhongMaterial({
      color: 0x8b4513, // Saddle brown
      specular: 0x333333,
      shininess: 40,
    });

    const bench = new THREE.Mesh(benchGeometry, benchMaterial);
    bench.position.set(0, 0.15, -5);
    bench.receiveShadow = true;
    bench.castShadow = true;
    this.scene.add(bench);
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
    const baseZ = this.LANE_LENGTH - 0.5; // Place pins at the very end of the lane

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

      // Check if ball has fallen off the map (y < -1 indicates it fell through)
      if (ballPos.y < -1.0) {
        console.log("Ball fell off map at position:", ballPos);
        this.handleBallFellOff();
        return;
      }

      // Check if ball went too far beyond boundaries (safety check)
      if (
        Math.abs(ballPos.x) > 5 ||
        ballPos.z < -5 ||
        ballPos.z > this.LANE_LENGTH + 5
      ) {
        console.log("Ball went out of bounds at position:", ballPos);
        this.handleBallOutOfBounds();
        return;
      }

      // Check how many pins have been knocked down during this frame
      const currentPinsDown = this.countFallenPins();
      const pinsKnockedThisFrame =
        currentPinsDown > this.gameState.pinsDownThisFrame;

      // Only count as gutter ball if:
      // 1. Ball is in SIDE gutters AND still on the lane (not at end)
      // 2. AND no pins were knocked down during this FRAME (not just this throw)
      if (
        Math.abs(ballPos.x) > this.LANE_WIDTH / 2 &&
        ballPos.z < this.LANE_LENGTH - 1 &&
        !pinsKnockedThisFrame
      ) {
        this.handleGutterBall();
        return;
      }

      // Check if ball reached the pin collection area (normal end of play)
      if (ballPos.z > this.LANE_LENGTH + 0.5) {
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

    const ballPos = this.ballBody.position;
    const pinsDown = this.countFallenPins();

    // Only score pins if:
    // 1. Ball reached near the pin area (z > LANE_LENGTH - 2), OR
    // 2. Ball is in gutter after hitting pins (handled separately)
    // This prevents scoring when ball stops early on the lane
    if (ballPos.z >= this.LANE_LENGTH - 2) {
      // Ball reached the pin area - legitimate scoring
      this.updateScore(pinsDown);
    } else {
      // Ball stopped early without reaching pins - no score
      this.updateScore(0);
      this.showMessage("Ball stopped before pins!", "info");
    }

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

    // Count fallen pins - DON'T update gameState.pinsDown yet!
    const pinsDown = this.countFallenPins();

    // Update score FIRST (it needs the old gameState.pinsDown for Ball 2 calculation)
    this.updateScore(pinsDown);

    this.checkGameState();
    this.updateUI();
  }

  handleBallFellOff() {
    console.log("Ball fell off the map!");
    this.gameState.ballSettled = true;
    this.gameState.ballThrown = false;

    // Stop the ball physics
    this.ballBody.velocity.set(0, 0, 0);
    this.ballBody.angularVelocity.set(0, 0, 0);
    this.ballBody.sleep();

    // Count pins that were knocked down before ball fell
    const pinsDown = this.countFallenPins();

    // Show message and score the pins that were knocked
    if (pinsDown > 0) {
      this.showMessage(`Ball fell off! But ${pinsDown} pins counted!`, "pins");
      this.updateScore(pinsDown);
    } else {
      this.showMessage("Ball fell off the map!", "miss");
      this.updateScore(0);
    }

    // Reset ball position for safety
    this.resetBallPosition();

    this.checkGameState();
    this.updateUI();
  }

  handleBallOutOfBounds() {
    console.log("Ball went out of bounds!");
    this.gameState.ballSettled = true;
    this.gameState.ballThrown = false;

    // Stop the ball physics
    this.ballBody.velocity.set(0, 0, 0);
    this.ballBody.angularVelocity.set(0, 0, 0);
    this.ballBody.sleep();

    // Count pins knocked before going out of bounds
    const pinsDown = this.countFallenPins();

    if (pinsDown > 0) {
      this.showMessage(`Out of bounds! But ${pinsDown} pins counted!`, "pins");
      this.updateScore(pinsDown);
    } else {
      this.showMessage("Ball went out of bounds!", "miss");
      this.updateScore(0);
    }

    // Reset ball position
    this.resetBallPosition();

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
      // Check if pin is significantly tilted, displaced, OR moved away by removeFallenPins
      const rotation = pinBody.quaternion;
      const upVector = new CANNON.Vec3(0, 1, 0);
      rotation.vmult(upVector, upVector);

      // Count pin as fallen if:
      // 1. It's tilted/displaced on the lane, OR
      // 2. It was moved far away by removeFallenPins (position x > 50 means it was removed)
      if (
        upVector.y < 0.7 ||
        pinBody.position.y < 0.1 ||
        pinBody.position.x > 50
      ) {
        fallenCount++;
      }
    });
    return fallenCount;
  }

  updateScore(pinsDown) {
    const frame = this.gameState.currentFrame - 1;
    const ball = this.gameState.currentBall;

    console.log(
      `updateScore DEBUG: Frame ${this.gameState.currentFrame}, Ball ${ball}, pinsDown=${pinsDown}, gameState.pinsDown=${this.gameState.pinsDown}`
    );

    if (!this.gameState.scores[frame]) {
      this.gameState.scores[frame] = [];
    }

    if (ball === 1) {
      // First ball - record pins knocked this ball only
      const pinsThisBall = pinsDown;
      this.gameState.scores[frame][0] = pinsThisBall;
      this.gameState.pinsDown = pinsDown; // Total pins down after this ball

      console.log(`Ball 1: ${pinsThisBall} pins knocked down`);

      // Show visual feedback for first ball
      if (pinsThisBall === 10) {
        this.showMessage("STRIKE!", "strike");
      } else if (pinsThisBall > 0) {
        this.showMessage(`${pinsThisBall} Pins Down!`, "pins");
      }
    } else {
      // Second ball - record pins knocked this ball only
      const pinsThisBall = pinsDown - this.gameState.pinsDown;
      console.log(
        `Ball 2 DEBUG: pinsDown=${pinsDown}, gameState.pinsDown=${this.gameState.pinsDown}, pinsThisBall=${pinsThisBall}`
      );

      // Ensure we don't get negative values due to timing issues
      const actualPinsThisBall = Math.max(0, pinsThisBall);
      this.gameState.scores[frame][1] = actualPinsThisBall;
      this.gameState.pinsDown = pinsDown; // Update total

      console.log(`Ball 2: ${actualPinsThisBall} pins knocked down this ball`);

      // Show visual feedback for second ball
      const totalPinsThisFrame =
        this.gameState.scores[frame][0] + actualPinsThisBall;
      if (totalPinsThisFrame === 10) {
        this.showMessage("SPARE!", "spare");
      } else if (actualPinsThisBall > 0) {
        this.showMessage(`+${actualPinsThisBall} More Pins!`, "pins");
      } else {
        this.showMessage("No Additional Pins", "miss");
      }
    }

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
      // Frame complete - visual feedback handled in updateScore method

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
      this.gameState.pinsDownThisFrame = 0; // Reset frame pin tracking
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
    this.gameState.pinsDownThisFrame = 0; // Reset frame tracking when pins reset
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
      scores: Array.from({ length: 10 }, () => []), // Create separate arrays for each frame
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

      // Highlight current frame
      if (i === this.gameState.currentFrame - 1) {
        frameDiv.classList.add("current-frame");
      }

      const frameNumber = document.createElement("div");
      frameNumber.className = "frame-number";
      frameNumber.textContent = i + 1;
      frameDiv.appendChild(frameNumber);

      const frameScore = document.createElement("div");
      frameScore.className = "frame-score";

      const scores = this.gameState.scores[i];
      if (scores && scores.length > 0) {
        if (i < 9) {
          // Frames 1-9: Proper bowling notation
          if (scores[0] === 10) {
            // Strike
            frameScore.textContent = "X";
          } else if (scores.length === 2) {
            if (scores[0] + scores[1] === 10) {
              // Spare: show first ball score + "/"
              frameScore.textContent = `${scores[0]}/`;
            } else {
              // Regular scoring: show both ball scores with proper spacing
              const secondBall = scores[1] === 0 ? "-" : scores[1];
              frameScore.textContent = `${scores[0]} ${secondBall}`;
            }
          } else {
            // Only first ball played
            frameScore.textContent = scores[0] === 0 ? "-" : `${scores[0]}`;
          }
        } else {
          // 10th frame: Special rules
          let text = "";
          scores.forEach((score, index) => {
            if (score === 10) {
              text += "X ";
            } else if (index > 0 && scores[index - 1] + score === 10) {
              text += "/ ";
            } else {
              text += `${score} `;
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
