// ====================================================================
// TYPEDEFS FOR JSDOC

/**
 * @typedef {Object} Body
 * @property {number} radius - Radius of the body
 * @property {number} stretchY - Stretches the body along the y-axis
 */

/**
 * @typedef {Object} Arm
 * @property {number} rotX - Rotation of arm around shoulder joint along the x-axis in radians
 * @property {number} rotY - Rotation of arm around shoulder joint along the y-axis in radians
 * @property {number} rotZ - Rotation of arm around shoulder joint along the z-axis in radians
 */

/**
 * @typedef {Object} Arms
 * @property {number} length - Length of both arms
 * @property {Arm} leftArm - Left arm properties
 * @property {Arm} rightArm - Right arm properties
 */

/**
 * @typedef {Object} Legs
 * @property {number} length - Length of both legs
 */

/**
 * @typedef {Object} Head
 * @property {number} scaleX - Scale of the head along the x-axis
 * @property {number} scaleY - Scale of the head along the y-axis
 * @property {number} scaleZ - Scale of the head along the z-axis
 * @property {number} rotX - Rotation of head around neck along the x-axis in radians
 * @property {number} rotY - Rotation of head around neck along the y-axis in radians
 * @property {number} rotZ - Rotation of head around neck along the z-axis in radians
 */

/**
 * @typedef {Object} ClownParams
 * @property {Arms} arms - Options for the arms of the clown
 * @property {Legs} legs - Options for the legs of the clown
 * @property {Body} body - Options for the body of the clown
 * @property {Head} head - Options for the head of the clown
 */

// ====================================================================
// CLOWN CLASS CODE

/**
 * Class used to create a 3D clown.
 * @property {Object3D} _clown - Scene graph of the entire clown generated by the Clown class
 * @property {ClownParams} _options - Current options for the clown that define how it looks
 * @extends THREE.Object3D
 */
class Clown extends THREE.Object3D {
  /** 
   * Constructor for the clown.
   * @param {ClownParams} [options={}] - Options that define how the clown should look
   */
  constructor(options = {}) {
    super();

    // Draw the initial clown
    this.redraw(options);
  }

  /**
   * Draws a new clown based on the given options.
   * @example
   * // Sets the y-axis rotation of the left arm to 1
   * redraw({arms: {leftArm: {rotY: 1}}})
   * @example
   * // Sets the length of the legs to 20, radius of body to 2, and stretchY of body to 1
   * redraw({legs: {length: 20}, body: {radius: 5, stretchY: 1}});
   * @param {ClownParams} [options={}] - Options that define how the clown should look
   */
  redraw(options = {}) {
    // Update the internal options of the clown
    this._setOptions(options);

    // Remove the old clown if there is one
    if (this._clown) {
      this.remove(this._clown);
    }

    // Create the new clown with internal options
    this._clown = this._createClown(this._options);

    // Add the clown to self
    this.add(this._clown);
  }

  /**
   * Updates the internal options for the clown with new, previous, or default values
   * @param {ClownParams} options - Options that define how the clown should look
   */
  _setOptions(options) {
    // If no _options property exists, add it
    if (!this._options) {
      // Create options with default values
      this._options = {
        arms: {
          length: 10,
          leftArm: {
            rotX: 0,
            rotY: 0,
            rotZ: Math.PI/6,
          },
          rightArm: {
            rotX: 0,
            rotY: 0,
            rotZ: -Math.PI/6,
          },
        },
        legs: {
          length: 10,
        },
        body: {
          radius: 6,
          stretchY: 1.25,
        },
        head: {
          scaleX: 1,
          scaleY: 1,
          scaleZ: 1,
          rotX: 0,
          rotY: 0,
          rotZ: 0,
        }
      };
    }

    // Copy arm options into the clown's internal arm options
    if (options.arms) {
      const {arms} = options;

      // Copy arm data
      this._options.arms = {
        ...this._options.arms,
        ...arms,
        // Copy left arm
        leftArm: {
          ...this._options.arms.leftArm,
          ...arms.leftArm
        },
        // Copy right arm
        rightArm: {
          ...this._options.arms.rightArm,
          ...arms.rightArm         
        }
      };
    }
    
    // Copy leg options into the clown's internal leg options
    if (options.legs) {
      const {legs} = options;
      
      // Copy leg data
      this._options.legs = {
        ...this._options.legs,
        ...legs
      };
    }
    
    // Copy body options into the clown's internal body options
    if (options.body) {
      const {body} = options;
      
      // Copy body data
      this._options.body = {
        ...this._options.body,
        ...body
      };
    }
    
    // Copy body options into the clown's internal body options
    if (options.head) {
      const {head} = options;
      
      // Copy head data
      this._options.head = {
        ...this._options.head,
        ...head
      }
    }
  }

  /**
   * Creates the entire clown.
   * @param {ClownParams} options - Options that define the clown
   * @return {Object3D} Scene graph of the entire clown
   */
  _createClown(options) {
    const clown = new THREE.Object3D();

    // Create the body and add it to the clown
    const body = this._createBody(options.body, options.arms, options.legs);
    clown.add(body);

    // Create the head
    const head = this._createHead(options.head);

    // Position and rotate the head into place
    {
      // Obtain the rotation of the head on the x, y, and z axis
      const {rotX, rotY, rotZ} = options.head;

      // Rotate the head based on the given rotation parameters
      head.rotation.set(rotX, rotY, rotZ);

      // Obtain the radius and stretchY of the body
      const {radius, stretchY} = options.body;

      // Obtain the length of the legs
      const {length} = options.legs;

      // Find the offset to place the head right above the torso
      const headOffset = length + 2 * radius * stretchY - 1.5;

      // Position the head above the body
      head.position.set(0, headOffset, 0);
    }

    // Add the head to the clown
    clown.add(head);

    // Return the final clown scene graph
    return clown;
  }

  /**
   * Creates the body of the clown.
   * @param {Body} bodyOptions - Options for the body
   * @param {Arms} armOptions - Options for both arms
   * @param {Legs} legOptions - Options for both legs
   * @return {Object3D} Scene graph of the body of the clown
   */
  _createBody(bodyOptions, armOptions, legOptions) {
    const body = new THREE.Object3D();

    // Destructure our body options
    const {radius, stretchY} = bodyOptions;

    // Find the offset for the torso
    const bodyOffset = radius * stretchY;

    // Create the torso
    {
      // Create the geometry, material, and mesh for the torso
      const torsoGeom = new THREE.SphereGeometry(radius, 32, 32);
      const torsoMat = new THREE.MeshBasicMaterial({color: 0x00a9fe});
      const torsoMesh = new THREE.Mesh(torsoGeom, torsoMat);

      // Scale the torso on the y-axis
      torsoMesh.scale.y = stretchY;

      // Position the torso above the legs
      torsoMesh.position.set(0, legOptions.length + bodyOffset - 1, 0);

      // Add the torsoMesh to the body object
      body.add(torsoMesh);
    }

    // Create the left and right arms
    {
      // Find the x and y position for the top-right shoulder
      const xShoulder = Math.cos(Math.PI/4) * radius;
      const yShoulder = Math.sin(Math.PI/4) * radius * stretchY + legOptions.length + bodyOffset;

      // Get the length of both arms
      const {length} = armOptions;

      // Create the left arm and add it to the body
      {
        // Create the left arm
        const leftArm = this._createArm(length);

        // Position the left arm to the left shoulder
        leftArm.position.set(xShoulder, yShoulder, 0);

        // Rotate the left arm as per the x, y, and z rotation parameters
        const {rotX, rotY, rotZ} = armOptions.leftArm;
        leftArm.rotation.set(rotX, rotY, rotZ);

        // Add the left arm to the body
        body.add(leftArm);
      }

      // Create the right arm and add it to the body
      {
        // Create the right arm
        const rightArm = this._createArm(length);

        // Position the right arm to the right shoulder
        rightArm.position.set(-xShoulder, yShoulder, 0);

        // Rotate the right arm as per the x, y, and z rotation parameters
        const {rotX, rotY, rotZ} = armOptions.rightArm;
        rightArm.rotation.set(rotX, rotY, rotZ);

        // Add the right arm to the body
        body.add(rightArm);
      }
    }

    // Create and add both legs
    {
      // Get the length of the legs
      const {length} = legOptions;

      // Create and add the left leg to the body
      {
        const leftLeg = this._createLeg(length); // Create the left leg
        leftLeg.position.set(2, length, 0);     // Position the left leg
        body.add(leftLeg);                      // Add the left leg to the body
      }

      // Create and add the right leg to the body
      {
        const rightLeg = this._createLeg(length);  // Add the right leg
        rightLeg.position.set(-2, length, 0);     // Position the right leg
        body.add(rightLeg);                       // Add the right leg to the body
      }
    }

    // Return the body scene graph
    return body;
  }

  /**
   * Creates the leg of the clown.
   * @param {number} length - Length of the leg
   * @return {Object3D} Scene graph of a leg
   */
  _createLeg(length) {
    const leg = new THREE.Object3D();

    // Create the limb portion of the leg and add it to the leg
    {
      // Create the limb geometry, material, and mesh
      const limbGeom = new THREE.CylinderGeometry(0.8, 0.8, length);
      const limbMat = new THREE.MeshBasicMaterial({color: 0xf030d9});
      const limbMesh = new THREE.Mesh(limbGeom, limbMat);

      // Move the limb down to keep origin at leg joint
      limbMesh.position.set(0, -length/2, 0);

      // Add the limb to the leg object
      leg.add(limbMesh);
    }

    // Create the foot and add it to the leg
    {
      // Create the foot geometry, material, and mesh
      const footGeom = new THREE.SphereGeometry(2, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2);
      const footMat = new THREE.MeshBasicMaterial({color: 0x19efb3});
      const footMesh = new THREE.Mesh(footGeom, footMat);

      // Position the foot below the limb
      footMesh.position.set(0, -length, 0);

      // Add the foot to the leg object
      leg.add(footMesh);

      // Create geometry and mesh for bottom of foot
      const footBottomGeom = new THREE.CircleGeometry(2);
      const footBottomMesh = new THREE.Mesh(footBottomGeom, footMat);

      // Also position below the limb and rotate it into place
      footBottomMesh.rotation.set(Math.PI/2, 0, 0);
      footBottomMesh.position.set(0, -length - 0.001, 0); // Minus 0.001 to prevent z fighting

      // Add the bottom of the foot to the leg object
      leg.add(footBottomMesh);
    }

    // Return the leg scene graph
    return leg;
  }

  /**
   * Creates the arm of the clown.
   * @param {number} length - Length of the arm
   * @return {Object3D} Scene graph for the arm
   */
  _createArm(length) {
    const arm = new THREE.Object3D();

    // Create and add the shoulder to the arm
    {
      // Create shoulder geometry, material, and mesh
      const shoulderGeom = new THREE.SphereGeometry(2);
      const shoulderMat = new THREE.MeshBasicMaterial({color: 0xf030d9});
      const shoulderMesh = new THREE.Mesh(shoulderGeom, shoulderMat);

      // Add shoulder to arm
      arm.add(shoulderMesh);
    }

    // Create and add the limb to the arm
    {
      // Create limb geometry, material, and mesh
      const limbGeom = new THREE.CylinderGeometry(0.9, 0.9, length);
      const limbMat = new THREE.MeshBasicMaterial({color: 0x00a9fe});
      const limbMesh = new THREE.Mesh(limbGeom, limbMat);

      // Move the limb down to keep origin at shoulder
      limbMesh.position.set(0, -length/2, 0);

      // Add limb to the arm
      arm.add(limbMesh);
    }

    // Create and add the hand to the arm
    {
      // Create hand geometry, material, and mesh
      const handGeom = new THREE.SphereGeometry(1.5);
      const handMat = new THREE.MeshBasicMaterial({color: 0x19efb3});
      const handMesh = new THREE.Mesh(handGeom, handMat);

      // Position the hand below the limb
      handMesh.position.set(0, 0.75 - length, 0);

      // Add the hand to the arm
      arm.add(handMesh);
    }

    // Return the arm scene graph
    return arm;
  }

  /**
   * Creates the head of the clown including the hat.
   * @param {Head} headOptions  - Options for the head
   * @return {Object3D} Scene graph for the head of the clown
   */
  _createHead(headOptions) {
    const head = new THREE.Object3D();

    // Create and add the dome portion of the head to the head
    {
      // Create the dome geometry, material, and mesh
      const domeGeom = new THREE.SphereGeometry(5, 32, 32);
      const domeMat = new THREE.MeshBasicMaterial({color: 0xb8fee4});
      const domeMesh = new THREE.Mesh(domeGeom, domeMat);

      // Reposition the dome so that the orgin is where the neck is
      domeMesh.position.set(0, 5, 0);

      // Add the dome to the head
      head.add(domeMesh);
    }

    // Material used for the ears, eyes, and nose
    const purpleMat = new THREE.MeshBasicMaterial({color: 0x45266a});

    // Create and add both ears to the head
    {
      // Create geometry for the ears
      const earGeom = new THREE.SphereGeometry(1.5, 32, 32);

      // Create both the left and right ear mesh
      const leftEarMesh = new THREE.Mesh(earGeom, purpleMat);
      const rightEarMesh = new THREE.Mesh(earGeom, purpleMat);

      // Position the ears on both sides of the head
      leftEarMesh.position.set(-5, 5, 0);
      rightEarMesh.position.set(5, 5, 0);

      // Add the ears to the head
      head.add(leftEarMesh);
      head.add(rightEarMesh);
    }

    // Create and add both eyes to the head
    {
      // Create eye geometry
      const eyeGeom = new THREE.SphereGeometry(0.5, 32, 32);

      // Create meshes for both eyes
      const leftEyeMesh = new THREE.Mesh(eyeGeom, purpleMat);
      const rightEyeMesh = new THREE.Mesh(eyeGeom, purpleMat);

      // Position eyes in front of the head
      leftEyeMesh.position.set(-1.5, 5, 4.75);
      rightEyeMesh.position.set(1.5, 5, 4.75);

      // Add eyes to the head
      head.add(leftEyeMesh);
      head.add(rightEyeMesh);
    }

    // Create and add the nose to the head
    {
      // Create nose geometry and mesh
      const noseGeom = new THREE.SphereGeometry(0.3);
      const noseMesh = new THREE.Mesh(noseGeom, purpleMat);

      // Position nose in front of the head
      noseMesh.position.set(0, 4.25, 4.85);

      // Add nose to the head
      head.add(noseMesh);
    }

    // Create and add the smile to the head
    {
      // Create smile geometry, material, and mesh
      const smileGeom = new THREE.TorusGeometry(2.5, 0.25, 32, 32, Math.PI/3);
      const smileMat = new THREE.MeshBasicMaterial({color: 0xff9fe8});
      const smileMesh = new THREE.Mesh(smileGeom, smileMat);

      // Position smile in front of the head with a slight angle
      smileMesh.rotation.set(0, 0, -Math.PI/1.65);
      smileMesh.position.set(0, 5.25, 4.25);

      // Add smile to the head
      head.add(smileMesh);
    }

    // Create and add the hat to the head
    {
      // Create the hat
      const hat = this._createHat();

      // Position the hat on top of the head with a fancy tilt to it
      hat.rotation.set(-Math.PI/12, 0, -Math.PI/12);
      hat.position.set(0.5, 7.5, -0.5);

      // Add hat to the head
      head.add(hat);
    }

    // Scale the head based on the scale x, y, and z parameters
    const {scaleX, scaleY, scaleZ} = headOptions;
    head.scale.set(scaleX, scaleY, scaleZ);

    // Return the scene graph for the head
    return head;
  }

  /**
   * Creates the hat of the clown.
   * @return {Object3D} Scene graph for the hat
   */
  _createHat() {
    const hat = new THREE.Object3D();

    // Material for the entire hat
    const hatMat = new THREE.MeshBasicMaterial({color: 0x00a9fe});

    // Create the rim and add it to the hat
    {
      // Create the geometry and mesh for the rim of the hat
      const hatRimGeom = new THREE.CylinderGeometry(8, 8, 0.5, 32, 32);
      const hatRimMesh = new THREE.Mesh(hatRimGeom, hatMat);

      // Add the rim to the hat
      hat.add(hatRimMesh);
    }

    // Create the top portion of the head and add it to the head
    {
      // Create the top of the hat's geometry and mesh
      const hatTopGeom = new THREE.CylinderGeometry(5, 4.5, 6, 32, 32);
      const hatTopMesh = new THREE.Mesh(hatTopGeom, hatMat);

      // Position the top of the hat so that the bottom rests on the rim
      hatTopMesh.position.set(0, 3, 0);

      // Add hat top to the hat
      hat.add(hatTopMesh);
    }

    // Return the scene graph of the hat
    return hat;
  }
}

// ====================================================================
// ORIGIN POINT CODE

/**
 * Creates a yellow sphere at the origin, which is (0, 0, 0), of the scene.
 * @param {Scene} scene - The scene to add the origin point to
 */
function createOriginPoint(scene) {
  // Create the geometry, material, and mesh for the origin point
  const originGeom = new THREE.SphereGeometry(0.5);
  const originMat = new THREE.MeshBasicMaterial( {color: 0xffff00} );
  const originMesh = new THREE.Mesh(originGeom, originMat);

  // Add the origin point to the scene
  scene.add(originMesh); 
}

// ====================================================================
// ADD ORIGIN AND CLOWN TO SCENE

// Parameters used to define the clown
const clownParams = {
  arms: {
    length: 10,
    leftArm: {
      rotX: 0,
      rotY: 0,
      rotZ: Math.PI/6,
    },
    rightArm: {
      rotX: 0,
      rotY: 0,
      rotZ: -Math.PI/6,
    },
  },
  legs: {
    length: 10,
  },
  body: {
    radius: 6,
    stretchY: 1.25,
  },
  head: {
    scaleX: 1,
    scaleY: 1,
    scaleZ: 1,
    rotX: 0,
    rotY: 0,
    rotZ: 0,
  }
};

// Used by dat.gui to translate, rotate, and scale the entire clown
const clownTransform = {
  position: {
    x: 0, y: 0, z: 0
  },
  rotation: {
    x: 0, y: 0, z: 0
  },
  scale: {
    x: 1, y: 1, z: 1 
  }
};

// We always need a scene
const scene = new THREE.Scene();

// Place a sphere at the origin of the scene
createOriginPoint(scene);

// Create a new clown and add it to the scene
const clown = new Clown();
scene.add(clown);

// ====================================================================
// DAT.GUI CODE

/** Helper function used by dat.gui code to redraw and render the clown. */
function redrawClown() {
  clown.redraw(clownParams);
  TW.render();
}

// Create a new GUI object
const gui = new dat.GUI();

// Create a folder dedicated to the arms
const armsFolder = gui.addFolder("Arms");
{
  // Get the arms object
  const {arms} = clownParams;

  // Change the length of both arms
  armsFolder.add(arms, "length", 5, 15).onChange(redrawClown);
}

// Create the folder for the left arm
const leftArmFolder = armsFolder.addFolder("Left Arm");
{
  // Get the left arm object
  const {leftArm} = clownParams.arms;

  // Change the rotation on the x, y, and z axis of the left arm
  leftArmFolder.add(leftArm, "rotX", -Math.PI, Math.PI).onChange(redrawClown);
  leftArmFolder.add(leftArm, "rotY", -Math.PI, Math.PI).onChange(redrawClown);
  leftArmFolder.add(leftArm, "rotZ", -Math.PI, Math.PI).onChange(redrawClown);
}

// Create the folder for the right arm
const rightArmFolder = armsFolder.addFolder("Right Arm");
{
  // Get the right arm object
  const {rightArm} = clownParams.arms;

  // Change the rotation on the x, y, and z axis of the right arm
  rightArmFolder.add(rightArm, "rotX", -Math.PI, Math.PI).onChange(redrawClown);
  rightArmFolder.add(rightArm, "rotY", -Math.PI, Math.PI).onChange(redrawClown);
  rightArmFolder.add(rightArm, "rotZ", -Math.PI, Math.PI).onChange(redrawClown);
}

// Create the folder for the legs
const legsFolder = gui.addFolder("Legs");
{
  // Get the legs object
  const {legs} = clownParams;

  // Change the length of both legs
  legsFolder.add(legs, "length", 5, 15).onChange(redrawClown);
}

// Create the folder for the body
const bodyFolder = gui.addFolder("Body");
{
  // Get the body object
  const {body} = clownParams;

  // Change the radius of the torso
  bodyFolder.add(body, "radius", 5, 7).onChange(redrawClown);

  // Stretch the torso along the y axis
  bodyFolder.add(body, "stretchY", 1, 1.5).onChange(redrawClown);
}

// Create folder for the head
const headFolder = gui.addFolder("Head");
{
  // Get the head object
  const {head} = clownParams;

  // Change the scale of the head on the x, y, and z axis
  headFolder.add(head, "scaleX", 0.5, 1.5).onChange(redrawClown);
  headFolder.add(head, "scaleY", 0.5, 1.5).onChange(redrawClown);
  headFolder.add(head, "scaleZ", 0.5, 1.5).onChange(redrawClown);

  // Change the rotation of the head around the neck along the x, y, and z axis
  headFolder.add(head, "rotX", -Math.PI/4, Math.PI/6).onChange(redrawClown);
  headFolder.add(head, "rotY", -Math.PI/4, Math.PI/4).onChange(redrawClown);
  headFolder.add(head, "rotZ", -Math.PI/6, Math.PI/6).onChange(redrawClown);
}

// Create a folder for the entire transform of the clown
const transformFolder = gui.addFolder("Transform");

// Create folder for the position of the clown
const positionFolder = transformFolder.addFolder("Position");
{
  // Get the position of the clown
  const {position} = clownTransform;

  // Helper function used to move the clown to a new position
  const repositionClown = () => {
    const {x, y, z} = position;
    clown.position.set(x, y, z);
    redrawClown();
  };

  // Change the position of the clown along the x, y, and z axis
  positionFolder.add(position, "x", -10, 10).onChange(repositionClown);
  positionFolder.add(position, "y", -10, 10).onChange(repositionClown);
  positionFolder.add(position, "z", -10, 10).onChange(repositionClown)
}

// Create folder for the rotation of the clown
const rotationFolder = transformFolder.addFolder("Rotation");
{
  // Get the rotation of the clown
  const {rotation} = clownTransform;

  // Helper function used to rotate the clown
  const rotateClown = () => {
    const {x, y, z} = rotation;
    clown.rotation.set(x, y, z);
    redrawClown();
  };

  // Change the rotation of the clown around its origin on the x, y, and z axis
  rotationFolder.add(rotation, "x", -Math.PI, Math.PI).onChange(rotateClown);
  rotationFolder.add(rotation, "y", -Math.PI, Math.PI).onChange(rotateClown);
  rotationFolder.add(rotation, "z", -Math.PI, Math.PI).onChange(rotateClown) 
}

// Create folder for the scale of the clown
const scaleFolder = transformFolder.addFolder("Scale");
{
  // Get the scale of the clown
  const {scale} = clownTransform;

  // Helper function used to scale the clown
  const scaleClown = () => {
    const {x, y, z} = scale;
    clown.scale.set(x, y, z);
    redrawClown();
  };

  // Scale the clown along the x, y, and z axis
  scaleFolder.add(scale, "x", 0.5, 2).onChange(scaleClown);
  scaleFolder.add(scale, "y", 0.5, 2).onChange(scaleClown);
  scaleFolder.add(scale, "z", 0.5, 2).onChange(scaleClown) 
}

// ================================================================
// INITIALIZE TW

// Get the renderer
const renderer = new THREE.WebGLRenderer();

// Initialize TW
TW.mainInit(renderer, scene);

// Setup the camera with TW
TW.cameraSetup(renderer,
               scene,
               {minx: -10, maxx: 10,
                miny: 14, maxy: 25,
                minz: 0, maxz: 15});
