## Clown Assignment

Welcome to the documentation website for the **Programming Homework 2: Clown** assignment.

The sidebar to the right contains documentation for the various classes and methods used to create the clown in [this](https://codepen.io/kenny-designs/pen/RwpaPVG) CodePen.

### How Do I Use The Clown?

To begin, take a moment to glance over the [Clown](./Clown.html) class.

There are a few things to note about the Clown class. First, it extends the Three.js class Object3D. That way, when the user creates a new clown it can be immediately placed into the scene like so:

```javascript
// Create a new clown and add it to the scene
const clown = new Clown();
scene.add(clown);
```

The clown can then be manipulated as one would with any other Object3D object. For example, one could translate the entire clown with its position attribute inherited from Object3D.

```javascript
// Set the clown's x position to 3 and its y and z positions to 0
clown.position.set(3, 0, 0);
```

Also worth noting is that the local origin of the clown is right between its feet. As such, rotating the clown will rotate it around this point.

### How Do I Customize The Clown?

By default, the clown has the following settings:

```javascript
const clownParams = {
  arms: {
    length: 10,
    leftArm: {
      rotX: 0,
      rotY: 0,
      rotZ: Math.PI / 6,
    },
    rightArm: {
      rotX: 0,
      rotY: 0,
      rotZ: -Math.PI / 6,
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
  },
};
```

For a deeper explanation into each attribute, please refer to the [ClownParams](./global.html#ClownParams) portion of the documentation.

To change these settings, one can invoke the clown's [redraw()](./Clown.html#redraw) method and supply new parameters via a JavaScript object. For example, say you want to set the length of the clown's legs to be 15. Invoke the redraw() method like so:

```javascript
// Redraw the clown with both legs having a length of 15
clown.redraw({
  legs: {
    length: 15,
  },
});

// Changes won't appear until after rendering
TW.render();
```

You can also set multiple settings for the clown as well. You could also rotate one of the arms and the head as well.

```javascript
clown.redraw({
  legs: {
    // Redraw the clown with both legs having a length of 15
    length: 15,
  },
  arms: {
    leftArm: {
      // Rotate left arm by 45 degrees over the y-axis
      rotY: Math.PI / 4,
    },
  },
  head: {
    // Rotate the head by 45 degrees over the y-axis
    rotY: Math.PI / 4,
  },
});

// Changes won't appear until after rendering
TW.render();
```

Lastly, the constructor of the clown can also take these parameters.

```javascript
// Create a new clown and add it to the scene with legs having a length of 15
const clown = new Clown({
  legs: {
    length: 15,
  },
});

scene.add(clown);
```

### How Does The Clown Work Internally?

Firstly, notice that the code uses the underscore _private_ naming convention. As such, only the Clown's constructor and the redraw() method are 'public.' The rest of the properties and methods of Clown are denoted to be private with an underscore prefix. Those private methods are the backbone of the clown though. As such, we'll explore them now.

To begin, when a new clown is created its [constructor](./Clown.html#Constructor) invokes the [redraw()](./Clown.html#redraw) method and gives it any options ([ClownParams](./global.html#ClownParams)) it was provided. From there, redraw() starts to invoke those previously mentioned 'private' methods.

#### \_setOptions()

The first private method invoked is [\_setOptions()](./Clown.html#_setOptions). Any options that were given to redraw() are given to \_setOptions. \_setOptions then updates the clown's internal [\_options](./Clown.html#_options) attribute with the parameters passed to it. If \_options doesn't exist yet then a new one is created with the default settings that were shown in the first section of this document.

#### \_createClown()

Now that the clown has updated its internal options, the actual meshes that make up the clown are created. Within the [\_createClown()](./Clown.html#_createClown) method, this is done by first creating the body of the clown followed by the head of the clown like so:

```javascript
_createClown(options) {
    const clown = new THREE.Object3D();

    // Create the body and add it to the clown
    const body = this._createBody(options.body, options.arms, options.legs);
    clown.add(body);

    // Create the head
    const head = this._createHead(options.head);

    // ... head is positioned and rotated

    // Add the head to the clown
    clown.add(head);

    // Return the final clown scene graph
    return clown;
}
```

#### \_createBody()

The [\_createBody()](./Clown.html#_createBody) method builds the torso, arms, and legs of the clown that is returned as the body.

```javascript
// The body object that the torso, arms, and legs are attached to then returned
const body = new THREE.Object3D();
```

The torso consists of just a single sphere that is stretched along the y-axis to make it appear more like an ellipsoid.

```javascript
// Create the geometry, material, and mesh for the torso
const torsoGeom = new THREE.SphereGeometry(radius, 32, 32);
const torsoMat = new THREE.MeshBasicMaterial({ color: 0x00a9fe });
const torsoMesh = new THREE.Mesh(torsoGeom, torsoMat);

// Scale the torso on the y-axis
torsoMesh.scale.y = stretchY;

// Position the torso above the legs
torsoMesh.position.set(0, legOptions.length + bodyOffset - 1, 0);

// Add the torsoMesh to the body object
body.add(torsoMesh);
```

Next, both arms are made with the [\_createArm()](./Clown.html#_createArm) method, positioned into place at the shoulders of the torso, and added to the body.

```javascript
// Create the left arm and add it to the body
{
  // Create the left arm
  const leftArm = this._createArm(length);

  // ... Position and rotate the left arm into place

  // Add the left arm to the body
  body.add(leftArm);
}

// Create the right arm and add it to the body
{
  // Create the right arm
  const rightArm = this._createArm(length);

  // ... Position and rotate the right arm into place

  // Add the right arm to the body
  body.add(rightArm);
}
```

Lastly, the both legs are added to the body via the [\_createLeg()](./Clown.html#_createLeg) method.

```javascript
// Create and add the left leg to the body
{
  const leftLeg = this._createLeg(length); // Create the left leg
  // ... Position the left leg
  body.add(leftLeg); // Add the left leg to the body
}

// Create and add the right leg to the body
{
  const rightLeg = this._createLeg(length); // Add the right leg
  // ... Position the right leg
  body.add(rightLeg); // Add the right leg to the body
}
```

Awesome! Now the torso, arms, and legs have all been created and added to the body of the clown. Let's now examine how the arms and legs are made.

#### \_createArm()

A single arm is created with the [\_createArm()](./Clown.html#_createArm) method based on a given length. A single arm of the clown is made up of three meshes. A sphere for the shoulder, a cylinder for the limb portion of the arm, and then another sphere for the hand.

To begin, we have a single arm that all three parts are added to.

```javascript
const arm = new THREE.Object3D();
```

Next, the shoulder is made from a sphere.

```javascript
// Create shoulder geometry, material, and mesh
const shoulderGeom = new THREE.SphereGeometry(2);
const shoulderMat = new THREE.MeshBasicMaterial({ color: 0xf030d9 });
const shoulderMesh = new THREE.Mesh(shoulderGeom, shoulderMat);

// Add shoulder to arm
arm.add(shoulderMesh);
```

Then the limb portion of the arm is added set to the length passed into \_createArm().

```javascript
// Create limb geometry, material, and mesh
const limbGeom = new THREE.CylinderGeometry(0.9, 0.9, length);
const limbMat = new THREE.MeshBasicMaterial({ color: 0x00a9fe });
const limbMesh = new THREE.Mesh(limbGeom, limbMat);

// Move the limb down to keep origin at shoulder
limbMesh.position.set(0, -length / 2, 0);

// Add limb to the arm
arm.add(limbMesh);
```

And finally, we create a slightly smaller sphere for the hand and place it at the end of the limb.

```javascript
// Create hand geometry, material, and mesh
const handGeom = new THREE.SphereGeometry(1.5);
const handMat = new THREE.MeshBasicMaterial({ color: 0x19efb3 });
const handMesh = new THREE.Mesh(handGeom, handMat);

// Position the hand below the limb
handMesh.position.set(0, 0.75 - length, 0);

// Add the hand to the arm
arm.add(handMesh);
```

Then the arm is returned so that the body can determine where to place it and rotate it.

```javascript
// Return the arm scene graph
return arm;
```

#### \_createLeg()

A single leg is created with the [\_createLeg()](./Clown.html#_createLeg) method based on a given length. It consists of a single cylinder for the limb portion of the leg and then a half-sphere for the foot with a circle mesh underneath it so that it looks solid.

As always, we need a single leg to add everything to.

```javascript
const leg = new THREE.Object3D();
```

Next, we create the limb portion of the leg based on the length passed into \_createLeg().

```javascript
// Create the limb geometry, material, and mesh
const limbGeom = new THREE.CylinderGeometry(0.8, 0.8, length);
const limbMat = new THREE.MeshBasicMaterial({ color: 0xf030d9 });
const limbMesh = new THREE.Mesh(limbGeom, limbMat);

// Move the limb down to keep origin at leg joint
limbMesh.position.set(0, -length / 2, 0);

// Add the limb to the leg object
leg.add(limbMesh);
```

With the limb created, we place a half-sphere at the bottom of it to represent a foot. In addition, A circle mesh is placed below the foot to give the illusion that it's whole (when in reality the foot is more of a bowl shape with an open bottom).

```javascript
// Create the foot geometry, material, and mesh
const footGeom = new THREE.SphereGeometry(
  2,
  8,
  6,
  0,
  Math.PI * 2, // This and the following angle turns the footGeom into a half-sphere
  0,
  Math.PI / 2
);
const footMat = new THREE.MeshBasicMaterial({ color: 0x19efb3 });
const footMesh = new THREE.Mesh(footGeom, footMat);

// ... Position the foot below the limb

// Add the foot to the leg object
leg.add(footMesh);

// Create geometry and mesh for bottom of foot
const footBottomGeom = new THREE.CircleGeometry(2);
const footBottomMesh = new THREE.Mesh(footBottomGeom, footMat);

// ... Position foot bottom below the foot and rotate it into place

// Add the bottom of the foot to the leg object
leg.add(footBottomMesh);
```

Lastly, we return the leg and let it get positioned by the \_createBody() method.

```javascript
// Return the leg scene graph
return leg;
```

#### \_createHead()

After the body is created, the [\_createClown()](./Clown.html#_createClown) method, then invokes the [\_createHead()](./Clown.html#_createHead) method to build the actual head of the clown and its hat too.

First, we need something to attach all the parts of our head to. We do the following as per usual:

```javascript
const head = new THREE.Object3D();
```

Next, we build each part of the head. This consists of the dome (the skull portion) of the clown, its eyes, ears, nose, and then mouth. The hat is handled by a separate method.

To begin, we start with the dome (skull) of the clown which is just a sphere.

```javascript
// Create the dome geometry, material, and mesh
const domeGeom = new THREE.SphereGeometry(5, 32, 32);
const domeMat = new THREE.MeshBasicMaterial({ color: 0xb8fee4 });
const domeMesh = new THREE.Mesh(domeGeom, domeMat);

// ... Position the dome so that the orgin is where the neck is

// Add the dome to the head
head.add(domeMesh);
```

Next, both ears are created out of spheres and placed on the left and right side of the dome.

```javascript
// Create geometry for the ears
const earGeom = new THREE.SphereGeometry(1.5, 32, 32);

// Create both the left and right ear mesh
const leftEarMesh = new THREE.Mesh(earGeom, purpleMat);
const rightEarMesh = new THREE.Mesh(earGeom, purpleMat);

// ... Position the ears on both sides of the head

// Add the ears to the head
head.add(leftEarMesh);
head.add(rightEarMesh);
```

Next, both eyes are made out of spheres and placed in front of the dome.

```javascript
// Create eye geometry
const eyeGeom = new THREE.SphereGeometry(0.5, 32, 32);

// Create meshes for both eyes
const leftEyeMesh = new THREE.Mesh(eyeGeom, purpleMat);
const rightEyeMesh = new THREE.Mesh(eyeGeom, purpleMat);

// ... Position eyes in front of the head

// Add eyes to the head
head.add(leftEyeMesh);
head.add(rightEyeMesh);
```

Now the nose is created out of a single sphere and placed in front of the face as well albeit more centered.

```javascript
// Create nose geometry and mesh
const noseGeom = new THREE.SphereGeometry(0.3);
const noseMesh = new THREE.Mesh(noseGeom, purpleMat);

// ... Position nose in front of the head

// Add nose to the head
head.add(noseMesh);
```

Next is the smile which is a bit different in that it is made out of a torus shape that is cut off early from making a full circle.

```javascript
// Create smile geometry, material, and mesh
const smileGeom = new THREE.TorusGeometry(2.5, 0.25, 32, 32, Math.PI / 3);
const smileMat = new THREE.MeshBasicMaterial({ color: 0xff9fe8 });
const smileMesh = new THREE.Mesh(smileGeom, smileMat);

// ... Position smile in front of the head with a slight angle

// Add smile to the head
head.add(smileMesh);
```

And finally, we create the hat with the \_createHat() method, put it on top of the dome, and give it a nifty little tilt.

```javascript
// Create the hat
const hat = this._createHat();

// ... Position the hat on top of the head with a fancy tilt to it

// Add hat to the head
head.add(hat);
```

And that's it! The head is complete and the \_createClown() method is responsible for putting it above the body. Albeit, any scaling done to the head is applied as follows:

```javascript
// Scale the head based on the scale x, y, and z parameters
const { scaleX, scaleY, scaleZ } = headOptions;
head.scale.set(scaleX, scaleY, scaleZ);
```

And finally, the completed head is returned.

```javascript
// Return the scene graph for the head
return head;
```

#### \_createHat()

The [\_createHat()](./Clown.html#_createHat) method builds the hat of the clown out of two pieces. The first is the rim of the hat which is just a very flat cylinder and the other is the top portion of the hat which is also just a cylinder but with a slight taper towards the bottom of it.

We begin with something to attach all the pieces of our hat to.

```javascript
const hat = new THREE.Object3D();
```

Next, we create the rim of the hat with just a very flat cylinder.

```javascript
// Create the geometry and mesh for the rim of the hat
const hatRimGeom = new THREE.CylinderGeometry(8, 8, 0.5, 32, 32);
const hatRimMesh = new THREE.Mesh(hatRimGeom, hatMat);

// Add the rim to the hat
hat.add(hatRimMesh);
```

Then we create the top hat portion of the hat and position it so that it rests on top of the rim.

```javascript
// Create the top of the hat's geometry and mesh
const hatTopGeom = new THREE.CylinderGeometry(5, 4.5, 6, 32, 32);
const hatTopMesh = new THREE.Mesh(hatTopGeom, hatMat);

// ... Position the top of the hat so that the bottom rests on the rim

// Add hat top to the hat
hat.add(hatTopMesh);
```

And that's it! The hat was rather simple to make and gets its final position from the [\_createHead()](./Clown.html#_createHead) method after we return it.

```javascript
// Return the scene graph of the hat
return hat;
```

And we're done! The clown is now made.

### Why Make The Clown A Class?

Although the clown could have been built strictly out of functions, a class that extends the Three.js class Object3D made more sense. The clown is made from a variety of meshes but these meshes all come together to form a single object (the clown). In turn, the clown itself should have the ability to be positioned, rotated, and scaled so that the rest of its head and body follow along with it _without_ having to manually position everything via the various \_create functions that the clown has. In addition, the clown itself can be added to the scene instead of each individual mesh that it is composed of.

```javascript
// Create a new clown
const clown = new Clown();

// Set the clown's x position to 3 and its y and z positions to 0
clown.position.set(3, 0, 0);

// Add the clown to the scene (which in turn adds every mesh that it is composed of)
scene.add(clown);
```
