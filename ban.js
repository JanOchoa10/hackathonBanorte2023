// Importamos librería THREE
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js";
import { FBXLoader } from "https://cdn.jsdelivr.net/npm/three@0.118.1/examples/jsm/loaders/FBXLoader.js";

import { OrbitControls } from "./OrbitControls.js";

function getParameterByName(name) {
  name = name.replace(/[\[\]]/g, "\\$&");
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
    results = regex.exec(window.location.href);
  if (!results) return null;
  if (!results[2]) return "";
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}

var mapaConsultado = getParameterByName("mapaConsultado");
var cuenta = getParameterByName("cuenta");
cuenta = cuenta === "true"; // Convertir a tipo booleano

// Creamos la escena
const banScene = new THREE.Scene();
banScene.background = new THREE.Color("#a0a19c"); //El color del background

// Creamos la cámara
const fov = 75;
const aspect = 1920 / 1080;
const near = 1.0;
const far = 1000.0;

// Creamos una constante de cámara para llamar la función PerspectiveCamera
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
camera.position.set(25, 10, 25);
const cameraDistance = 85; // Ajusta esta distancia según sea necesario

const clock = new THREE.Clock(); //Agregamos una constante clock para la variable deltaTime

const terrainTextureLoader = new THREE.TextureLoader();
const terrainTexture = terrainTextureLoader.load("./mosaico.jpg");
const terrainPlane = new THREE.Mesh(
  new THREE.PlaneGeometry(400, 400, 10, 10),
  new THREE.MeshStandardMaterial({
    map: terrainTexture, //la textura del concreto
    side: THREE.DoubleSide,
    //color: 0x2f2f2f, //cambio de color del plano si es que se requiere, por ahora no.
  })
);

terrainPlane.castShadow = false;
terrainPlane.receiveShadow = true;
terrainPlane.rotation.x = -Math.PI / 2;
banScene.add(terrainPlane);

// Creamos el renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);

//Si hay que utilizar lo de orbits a comentar la camara. de abajo
// controls.enableDamping = true;
//controls.target.set(0, 1, 0);

// Creamos una luz focal
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.4);
directionalLight.position.set(-100, 100, 100);
directionalLight.target.position.set(0, 0, 0);
directionalLight.castShadow = true;
directionalLight.shadow.bias = -0.001;
directionalLight.shadow.mapSize.width = 4096;
directionalLight.shadow.mapSize.height = 4096;
directionalLight.shadow.camera.near = 0.1;
directionalLight.shadow.camera.far = 700.0;
directionalLight.shadow.camera.near = 0.5;
directionalLight.shadow.camera.far = 700.0;
directionalLight.shadow.camera.left = 300;
directionalLight.shadow.camera.right = -300;
directionalLight.shadow.camera.top = 300;
directionalLight.shadow.camera.bottom = -300;
banScene.add(directionalLight);

// Creamos una luz ambiental
const ambientLight = new THREE.AmbientLight(0xfdfefe, 1.0); // Color de la luz e Intensidad
banScene.add(ambientLight);

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener("resize", onWindowResize);

let animationMixer = []; //declaramos el animationMixer para los modelos animados
let animationMixer2 = [];
//Hacemos carga del modelo
let fbx;
let modelBB = null;
//var jugadorBB;

let idleAction, jogAction;
let currentAction = null;
let isMoving = false;

function loadAnimatedModelAndPlay() {
  const loader = new FBXLoader();
  loader.setPath("./model/");
  loader.load("HappyIdle.fbx", (loadedfbx) => {
    fbx = loadedfbx;
    fbx.scale.setScalar(0.3);
    fbx.traverse((c) => {
      c.castShadow = true;
    });
    fbx.position.copy(new THREE.Vector3(100, 0, 150));

    // Rotar el personaje 90 grados alrededor del eje Y
    fbx.rotateY(-Math.PI / 2);

    modelBB = new THREE.Box3().setFromObject(fbx);

    // Crear la caja de colisión para el modelo animado

    const animLoader = new FBXLoader();
    animLoader.setPath("./model/");
    animLoader.load("JogForward.fbx", (animIdle) => {
      animLoader.load("HappyIdle.fbx", (animJog) => {
        const mixer = new THREE.AnimationMixer(fbx);
        animationMixer.push(mixer);

        idleAction = mixer.clipAction(animIdle.animations[0]);
        jogAction = mixer.clipAction(animJog.animations[0]);

        // Detener la animación "jog" si está reproduciéndose
        jogAction.stop();

        // Activar la animación "idle"
        idleAction.reset(); // Reiniciar la animación "idle" al inicio
        idleAction.play();

        animate();
      });
    });

    banScene.add(fbx);
  });
}

loadAnimatedModelAndPlay();

//Carga de modelos
//loadModelATM();
loadChairs();
loadChairs2();
loadChairs3();
loadChairs4();

//Modelo del listón
loadModelListon();
loadModelListon1();
loadModelListon3();
loadModelListon4();
loadModelListon5();
loadModelListon6();
loadModelListon7();
loadModelListon8();
loadModelListon9();
loadModelListon10();

//Cajero automatico
loadModelATM();
loadModelATM2();

//Carga de modulo
loadModelModule();

//carga la ventanilla
loadModelVentanilla();
loadModelVentanilla2();
loadModelVentanilla3();
loadModelVentanilla4();
loadModelVentanilla5();

//Carga de escritorio
loadModelDesk();

//Arrows
if (mapaConsultado && cuenta) {
  loadModelArrow();
} else if (mapaConsultado && !cuenta) {
  loadModelArrow2();
}

// checModuloCollision();

let isShiftPressed = false;
//let isMoving = false; //Variable para determinar si se está moviendo y así empezar con la animación.
const smoothness = 0.1; // Ajusta este valor para controlar la suavidad de la rotación

const KEY_LEFT = 65;
const KEY_RIGHT = 68;
const KEY_UP = 87;
const KEY_DOWN = 83;

const normalMovementSpeed = 15;
const shiftMovementSpeed = normalMovementSpeed * 2;

document.addEventListener("keydown", handleKeyDown);
document.addEventListener("keydown", handleKeyUp);

function handleKeyDown(event) {
  const keyCode = event.keyCode;

  if (keyCode === KEY_LEFT) {
    const targetPosition = fbx.position
      .clone()
      .add(new THREE.Vector3(-getMovementSpeed(), 0, 0));
    movePlayerSmoothly(targetPosition);
    rotateSmoothly(-Math.PI / 2);

    //modelBB.position.copy(targetPosition);
  } else if (keyCode === KEY_RIGHT) {
    const targetPosition = fbx.position
      .clone()
      .add(new THREE.Vector3(getMovementSpeed(), 0, 0));
    movePlayerSmoothly(targetPosition);
    rotateSmoothly(Math.PI / 2);

    //modelBB.position.copy(targetPosition);
  } else if (keyCode === KEY_UP) {
    const targetPosition = fbx.position
      .clone()
      .add(new THREE.Vector3(0, 0, -getMovementSpeed()));
    movePlayerSmoothly(targetPosition);
    rotateSmoothly(Math.PI);

    //modelBB.position.copy(targetPosition);
  } else if (keyCode === KEY_DOWN) {
    const targetPosition = fbx.position
      .clone()
      .add(new THREE.Vector3(0, 0, getMovementSpeed()));
    movePlayerSmoothly(targetPosition);
    rotateSmoothly(0);

    //modelBB.position.copy(targetPosition);
  }

  isMoving = true;
}

function handleKeyUp(event) {
  const keyCode = event.keyCode;

  if (
    keyCode === KEY_LEFT ||
    keyCode === KEY_RIGHT ||
    keyCode === KEY_UP ||
    keyCode === KEY_DOWN
  ) {
    isMoving = false;
  }
}

function getMovementSpeed() {
  const movementSpeed = isShiftPressed
    ? shiftMovementSpeed
    : normalMovementSpeed;
  return movementSpeed;
}

// Función para mover suavemente al jugador
function movePlayerSmoothly(targetPosition) {
  if (fbx.position === undefined) {
    // Manejar el caso cuando la posición no está definida
    return;
  }

  // Calcula la distancia entre la posición actual y la posición objetivo
  const distance = fbx.position.distanceTo(targetPosition);

  // Define la velocidad de movimiento en función de la distancia
  const movementSpeed = Math.min(distance, smoothness);

  // Interpola suavemente la posición actual hacia la posición objetivo
  fbx.position.lerp(targetPosition, movementSpeed);
  modelBB.setFromObject(fbx);
}

function rotateSmoothly(targetRotationY) {
  if (fbx.rotation === undefined) {
    // Manejar el caso cuando la rotación no está definida
    return;
  }

  const rotationSpeed = 0.1; // Ajusta la velocidad de rotación según sea necesario

  let currentRotation = fbx.rotation.y;
  let deltaRotation = targetRotationY - currentRotation;

  // Verificar si es necesario realizar una rotación completa
  if (Math.abs(deltaRotation) > Math.PI) {
    if (deltaRotation > 0) {
      deltaRotation -= 2 * Math.PI;
    } else {
      deltaRotation += 2 * Math.PI;
    }
  }

  let newRotation = currentRotation + rotationSpeed * deltaRotation;

  // Asegurarse de que la rotación esté dentro del rango de 0 a 2π (360 grados)
  if (newRotation < 0) {
    newRotation += 2 * Math.PI;
  } else if (newRotation >= 2 * Math.PI) {
    newRotation -= 2 * Math.PI;
  }

  fbx.rotation.y = newRotation;
}

function animate() {
  const deltaTime = clock.getDelta();

  //Verificará la colision
  // checModuloCollision();

  if (animationMixer.length > 0) {
    if (isMoving && currentAction !== jogAction) {
      idleAction.stop();
      jogAction.reset().play();
      currentAction = jogAction;
    } else if (!isMoving && currentAction !== idleAction) {
      jogAction.stop();
      idleAction.reset().play();
      currentAction = idleAction;
    }

    animationMixer[0].update(deltaTime);
  }

  for (let i = 0; i < animationMixer2.length; i++) {
    animationMixer2[i].update(deltaTime);
  }

  if (fbx && camera) {
    const playerPosition = fbx.position.clone();
    const cameraOffset = new THREE.Vector3(0, 45, 105); // Ajusta los valores de desplazamiento según sea necesario
    const cameraPosition = playerPosition.clone().add(cameraOffset);
    const lookAtPosition = playerPosition.clone();

    camera.position.copy(cameraPosition);
    camera.lookAt(lookAtPosition);
  }

  checModuloCollision();

  // // Agrega console.log para verificar las posiciones de las cajas de colisión
  // console.log("modelBB min:", modelBB.min.x, modelBB.min.y, modelBB.min.z);
  // console.log("modelBB max:", modelBB.max.x, modelBB.max.y, modelBB.max.z);

  // console.log("moduleBB min:", moduleBB.min.x, moduleBB.min.y, moduleBB.min.z);
  // console.log("moduleBB max:", moduleBB.max.x, moduleBB.max.y, moduleBB.max.z);

  renderer.render(banScene, camera);
  requestAnimationFrame(animate);
}

//Carga de modelos

//carga de modelos relacionados al banco jejej

var chairsBB;
let fbxChairs;

function loadChairs() {
  const loader = new FBXLoader();
  loader.setPath("./model/");
  loader.load("Chairs.fbx", (loadedfbx6) => {
    fbxChairs = loadedfbx6;
    fbxChairs.scale.setScalar(0.35);
    fbxChairs.rotateY(Math.PI); // Rotar el objeto 180 grados alrededor del eje Y
    fbxChairs.traverse((c) => {
      c.castShadow = true;
    });
    fbxChairs.position.copy(new THREE.Vector3(-70, 0, 20));

    // Crear la caja de colision para el modelo animado
    chairsBB = new THREE.Box3().setFromObject(fbxChairs);

    // const animLoader = new FBXLoader();
    // animLoader.setPath("./model/");
    // animLoader.load("Chairs.fbx", (anim) => {
    //   const mixer = new THREE.AnimationMixer(fbxChairs);
    //   animationMixer.push(mixer);
    //   const idleAction = mixer.clipAction(anim.animations[0]);
    //   idleAction.play();

    //   checkCollisions();
    //   animate();
    // });

    banScene.add(fbxChairs);

    //checkCollisions();
  });
}

var chairsBB2;
let fbxChairs2;

function loadChairs2() {
  const loader = new FBXLoader();
  loader.setPath("./model/");
  loader.load("Chairs.fbx", (loadedfbx6) => {
    fbxChairs2 = loadedfbx6;
    fbxChairs2.scale.setScalar(0.35);
    fbxChairs2.rotateY(Math.PI); // Rotar el objeto 180 grados alrededor del eje Y
    fbxChairs2.traverse((c) => {
      c.castShadow = true;
    });
    fbxChairs2.position.copy(new THREE.Vector3(70, 0, 20));

    // Crear la caja de colision para el modelo animado
    chairsBB2 = new THREE.Box3().setFromObject(fbxChairs2);

    // const animLoader = new FBXLoader();
    // animLoader.setPath("model/scenary/");
    // animLoader.load("Chairs.fbx", (anim) => {
    //   const mixer = new THREE.AnimationMixer(fbxChairs);
    //   animationMixer.push(mixer);
    //   const idleAction = mixer.clipAction(anim.animations[0]);
    //   idleAction.play();

    //   checkCollisions();
    //   animate();
    // });

    banScene.add(fbxChairs2);

    //checkCollisions();
  });
}

var chairsBB3;
let fbxChairs3;

function loadChairs3() {
  const loader = new FBXLoader();
  loader.setPath("./model/");
  loader.load("Chairs.fbx", (loadedfbx6) => {
    fbxChairs3 = loadedfbx6;
    fbxChairs3.scale.setScalar(0.35);
    fbxChairs3.rotateY(Math.PI); // Rotar el objeto 180 grados alrededor del eje Y
    fbxChairs3.traverse((c) => {
      c.castShadow = true;
    });
    fbxChairs3.position.copy(new THREE.Vector3(70, 0, 60));

    // Crear la caja de colision para el modelo animado
    chairsBB3 = new THREE.Box3().setFromObject(fbxChairs3);

    // const animLoader = new FBXLoader();
    // animLoader.setPath("model/scenary/");
    // animLoader.load("Chairs.fbx", (anim) => {
    //   const mixer = new THREE.AnimationMixer(fbxChairs);
    //   animationMixer.push(mixer);
    //   const idleAction = mixer.clipAction(anim.animations[0]);
    //   idleAction.play();

    //   checkCollisions();
    //   animate();
    // });

    banScene.add(fbxChairs3);

    //checkCollisions();
  });
}

var chairsBB4;
let fbxChairs4;

function loadChairs4() {
  const loader = new FBXLoader();
  loader.setPath("./model/");
  loader.load("Chairs.fbx", (loadedfbx6) => {
    fbxChairs4 = loadedfbx6;
    fbxChairs4.scale.setScalar(0.35);
    fbxChairs4.rotateY(Math.PI); // Rotar el objeto 180 grados alrededor del eje Y
    fbxChairs4.traverse((c) => {
      c.castShadow = true;
    });
    fbxChairs4.position.copy(new THREE.Vector3(-70, 0, 60));

    // Crear la caja de colision para el modelo animado
    chairsBB4 = new THREE.Box3().setFromObject(fbxChairs4);

    // const animLoader = new FBXLoader();
    // animLoader.setPath("model/scenary/");
    // animLoader.load("Chairs.fbx", (anim) => {
    //   const mixer = new THREE.AnimationMixer(fbxChairs4);
    //   animationMixer.push(mixer);
    //   const idleAction = mixer.clipAction(anim.animations[0]);
    //   idleAction.play();

    //   checkCollisions();
    //   animate();
    // });

    banScene.add(fbxChairs4);

    //checkCollisions();
  });
}

var listonBB;
let fbxListon;

function loadModelListon() {
  const loader = new FBXLoader();
  loader.setPath("./model/");
  loader.load("liston.fbx", (loadedfbx6) => {
    fbxListon = loadedfbx6;
    fbxListon.scale.setScalar(0.15);
    fbxListon.rotateY(Math.PI); // Rotar el objeto 180 grados alrededor del eje Y
    fbxListon.traverse((c) => {
      c.castShadow = true;
    });
    fbxListon.position.copy(new THREE.Vector3(-35, 0, -50));

    // Crear la caja de colision para el modelo animado
    listonBB = new THREE.Box3().setFromObject(fbxListon);

    // const animLoader = new FBXLoader();
    // animLoader.setPath("./model/");
    // animLoader.load("liston.fbx", (anim) => {
    //   const mixer = new THREE.AnimationMixer(fbxListon);
    //   animationMixer.push(mixer);
    //   const idleAction = mixer.clipAction(anim.animations[0]);
    //   idleAction.play();

    //   checkCollisions();
    //   animate();
    // });

    banScene.add(fbxListon);

    //checkCollisions();
  });
}

var listonBB2;
let fbxListon2;

function loadModelListon1() {
  const loader = new FBXLoader();
  loader.setPath("./model/");
  loader.load("liston.fbx", (loadedfbx6) => {
    fbxListon2 = loadedfbx6;
    fbxListon2.scale.setScalar(0.15);
    fbxListon2.rotateY(Math.PI); // Rotar el objeto 180 grados alrededor del eje Y
    fbxListon2.traverse((c) => {
      c.castShadow = true;
    });
    fbxListon2.position.copy(new THREE.Vector3(35, 0, -50));

    // Crear la caja de colision para el modelo animado
    listonBB2 = new THREE.Box3().setFromObject(fbxListon2);

    // const animLoader = new FBXLoader();
    // animLoader.setPath("./model/");
    // animLoader.load("liston.fbx", (anim) => {
    //   const mixer = new THREE.AnimationMixer(fbxListon);
    //   animationMixer.push(mixer);
    //   const idleAction = mixer.clipAction(anim.animations[0]);
    //   idleAction.play();

    //   checkCollisions();
    //   animate();
    // });

    banScene.add(fbxListon2);

    //checkCollisions();
  });
}

var listonBB3;
let fbxListon3;

function loadModelListon3() {
  const loader = new FBXLoader();
  loader.setPath("./model/");
  loader.load("liston.fbx", (loadedfbx6) => {
    fbxListon3 = loadedfbx6;
    fbxListon3.scale.setScalar(0.15);
    fbxListon3.rotateY(Math.PI); // Rotar el objeto 180 grados alrededor del eje Y
    fbxListon3.traverse((c) => {
      c.castShadow = true;
    });
    fbxListon3.position.copy(new THREE.Vector3(-35, 0, -80));

    // Crear la caja de colision para el modelo animado
    listonBB3 = new THREE.Box3().setFromObject(fbxListon3);

    // const animLoader = new FBXLoader();
    // animLoader.setPath("./model/");
    // animLoader.load("liston.fbx", (anim) => {
    //   const mixer = new THREE.AnimationMixer(fbxListon);
    //   animationMixer.push(mixer);
    //   const idleAction = mixer.clipAction(anim.animations[0]);
    //   idleAction.play();

    //   checkCollisions();
    //   animate();
    // });

    banScene.add(fbxListon3);

    //checkCollisions();
  });
}

var listonBB4;
let fbxListon4;

function loadModelListon4() {
  const loader = new FBXLoader();
  loader.setPath("./model/");
  loader.load("liston.fbx", (loadedfbx6) => {
    fbxListon4 = loadedfbx6;
    fbxListon4.scale.setScalar(0.15);
    fbxListon4.rotateY(Math.PI); // Rotar el objeto 180 grados alrededor del eje Y
    fbxListon4.traverse((c) => {
      c.castShadow = true;
    });
    fbxListon4.position.copy(new THREE.Vector3(35, 0, -80));

    // Crear la caja de colision para el modelo animado
    listonBB3 = new THREE.Box3().setFromObject(fbxListon4);

    // const animLoader = new FBXLoader();
    // animLoader.setPath("./model/");
    // animLoader.load("liston.fbx", (anim) => {
    //   const mixer = new THREE.AnimationMixer(fbxListon);
    //   animationMixer.push(mixer);
    //   const idleAction = mixer.clipAction(anim.animations[0]);
    //   idleAction.play();

    //   checkCollisions();
    //   animate();
    // });

    banScene.add(fbxListon4);

    //checkCollisions();
  });
}

var listonBB5;
let fbxListon5;

function loadModelListon5() {
  const loader = new FBXLoader();
  loader.setPath("./model/");
  loader.load("liston.fbx", (loadedfbx6) => {
    fbxListon5 = loadedfbx6;
    fbxListon5.scale.setScalar(0.15);
    fbxListon5.rotateY(Math.PI); // Rotar el objeto 180 grados alrededor del eje Y
    fbxListon5.traverse((c) => {
      c.castShadow = true;
    });
    fbxListon5.position.copy(new THREE.Vector3(-95, 0, -50));

    // Crear la caja de colision para el modelo animado
    listonBB5 = new THREE.Box3().setFromObject(fbxListon5);

    // const animLoader = new FBXLoader();
    // animLoader.setPath("./model/");
    // animLoader.load("liston.fbx", (anim) => {
    //   const mixer = new THREE.AnimationMixer(fbxListon);
    //   animationMixer.push(mixer);
    //   const idleAction = mixer.clipAction(anim.animations[0]);
    //   idleAction.play();

    //   checkCollisions();
    //   animate();
    // });

    banScene.add(fbxListon5);

    //checkCollisions();
  });
}

var listonBB6;
let fbxListon6;

function loadModelListon6() {
  const loader = new FBXLoader();
  loader.setPath("./model/");
  loader.load("liston.fbx", (loadedfbx6) => {
    fbxListon6 = loadedfbx6;
    fbxListon6.scale.setScalar(0.15);
    fbxListon6.rotateY(Math.PI); // Rotar el objeto 180 grados alrededor del eje Y
    fbxListon6.traverse((c) => {
      c.castShadow = true;
    });
    fbxListon6.position.copy(new THREE.Vector3(-95, 0, -80));

    // Crear la caja de colision para el modelo animado
    listonBB6 = new THREE.Box3().setFromObject(fbxListon6);

    // const animLoader = new FBXLoader();
    // animLoader.setPath("./model/");
    // animLoader.load("liston.fbx", (anim) => {
    //   const mixer = new THREE.AnimationMixer(fbxListon);
    //   animationMixer.push(mixer);
    //   const idleAction = mixer.clipAction(anim.animations[0]);
    //   idleAction.play();

    //   checkCollisions();
    //   animate();
    // });

    banScene.add(fbxListon6);

    //checkCollisions();
  });
}

var listonBB7;
let fbxListon7;

function loadModelListon7() {
  const loader = new FBXLoader();
  loader.setPath("./model/");
  loader.load("liston.fbx", (loadedfbx6) => {
    fbxListon7 = loadedfbx6;
    fbxListon7.scale.setScalar(0.15);
    fbxListon7.rotateY(Math.PI); // Rotar el objeto 180 grados alrededor del eje Y
    fbxListon7.traverse((c) => {
      c.castShadow = true;
    });
    fbxListon7.position.copy(new THREE.Vector3(95, 0, -50));

    // Crear la caja de colision para el modelo animado
    listonBB7 = new THREE.Box3().setFromObject(fbxListon7);

    // const animLoader = new FBXLoader();
    // animLoader.setPath("./model/");
    // animLoader.load("liston.fbx", (anim) => {
    //   const mixer = new THREE.AnimationMixer(fbxListon);
    //   animationMixer.push(mixer);
    //   const idleAction = mixer.clipAction(anim.animations[0]);
    //   idleAction.play();

    //   checkCollisions();
    //   animate();
    // });

    banScene.add(fbxListon7);

    //checkCollisions();
  });
}

var listonBB8;
let fbxListon8;

function loadModelListon8() {
  const loader = new FBXLoader();
  loader.setPath("./model/");
  loader.load("liston.fbx", (loadedfbx6) => {
    fbxListon8 = loadedfbx6;
    fbxListon8.scale.setScalar(0.15);
    fbxListon8.rotateY(Math.PI); // Rotar el objeto 180 grados alrededor del eje Y
    fbxListon8.traverse((c) => {
      c.castShadow = true;
    });
    fbxListon8.position.copy(new THREE.Vector3(95, 0, -80));

    // Crear la caja de colision para el modelo animado
    listonBB8 = new THREE.Box3().setFromObject(fbxListon8);

    // const animLoader = new FBXLoader();
    // animLoader.setPath("./model/");
    // animLoader.load("liston.fbx", (anim) => {
    //   const mixer = new THREE.AnimationMixer(fbxListon);
    //   animationMixer.push(mixer);
    //   const idleAction = mixer.clipAction(anim.animations[0]);
    //   idleAction.play();

    //   checkCollisions();
    //   animate();
    // });

    banScene.add(fbxListon8);

    //checkCollisions();
  });
}

var listonBB9;
let fbxListon9;

function loadModelListon9() {
  const loader = new FBXLoader();
  loader.setPath("./model/");
  loader.load("liston.fbx", (loadedfbx6) => {
    fbxListon9 = loadedfbx6;
    fbxListon9.scale.setScalar(0.15);
    fbxListon9.rotateY(Math.PI / 2); // Rotar el objeto 180 grados alrededor del eje Y
    fbxListon9.traverse((c) => {
      c.castShadow = true;
    });
    fbxListon9.position.copy(new THREE.Vector3(50, 0, 120));

    // Crear la caja de colision para el modelo animado
    listonBB9 = new THREE.Box3().setFromObject(fbxListon9);

    // const animLoader = new FBXLoader();
    // animLoader.setPath("./model/");
    // animLoader.load("liston.fbx", (anim) => {
    //   const mixer = new THREE.AnimationMixer(fbxListon);
    //   animationMixer.push(mixer);
    //   const idleAction = mixer.clipAction(anim.animations[0]);
    //   idleAction.play();

    //   checkCollisions();
    //   animate();
    // });

    banScene.add(fbxListon9);

    //checkCollisions();
  });
}

var listonBB10;
let fbxListon10;

function loadModelListon10() {
  const loader = new FBXLoader();
  loader.setPath("./model/");
  loader.load("liston.fbx", (loadedfbx6) => {
    fbxListon10 = loadedfbx6;
    fbxListon10.scale.setScalar(0.15);
    fbxListon10.rotateY(Math.PI / 2); // Rotar el objeto 180 grados alrededor del eje Y
    fbxListon10.traverse((c) => {
      c.castShadow = true;
    });
    fbxListon10.position.copy(new THREE.Vector3(50, 0, 180));

    // Crear la caja de colision para el modelo animado
    listonBB10 = new THREE.Box3().setFromObject(fbxListon10);

    // const animLoader = new FBXLoader();
    // animLoader.setPath("./model/");
    // animLoader.load("liston.fbx", (anim) => {
    //   const mixer = new THREE.AnimationMixer(fbxListon);
    //   animationMixer.push(mixer);
    //   const idleAction = mixer.clipAction(anim.animations[0]);
    //   idleAction.play();

    //   checkCollisions();
    //   animate();
    // });

    banScene.add(fbxListon10);

    //checkCollisions();
  });
}

var atmBB;
let fbxATM;

function loadModelATM() {
  const loader = new FBXLoader();
  loader.setPath("./model/");
  loader.load("ATM.fbx", (loadedfbx6) => {
    fbxATM = loadedfbx6;
    fbxATM.scale.setScalar(0.75);
    fbxATM.rotateY(-Math.PI / 2);
    fbxATM.traverse((c) => {
      c.castShadow = true;
    });
    fbxATM.position.copy(new THREE.Vector3(135, 0, 90));

    // Crear la caja de colision para el modelo animado
    atmBB = new THREE.Box3().setFromObject(fbxATM);

    // const animLoader = new FBXLoader();
    // animLoader.setPath("./model/");
    // animLoader.load("ATM.fbx", (anim) => {
    //   const mixer = new THREE.AnimationMixer(fbxATM);
    //   animationMixer.push(mixer);
    //   const idleAction = mixer.clipAction(anim.animations[0]);
    //   idleAction.play();

    //   checkCollisions();
    //   animate();
    // });

    banScene.add(fbxATM);

    //checkCollisions() parte comentada
  });
}

var atmBB2;
let fbxATM2;

function loadModelATM2() {
  const loader = new FBXLoader();
  loader.setPath("./model/");
  loader.load("ATM.fbx", (loadedfbx6) => {
    fbxATM2 = loadedfbx6;
    fbxATM2.scale.setScalar(0.75);
    fbxATM2.rotateY(Math.PI / 2);
    fbxATM2.traverse((c) => {
      c.castShadow = true;
    });
    fbxATM2.position.copy(new THREE.Vector3(-130, 0, 90));

    // Crear la caja de colision para el modelo animado
    atmBB2 = new THREE.Box3().setFromObject(fbxATM2);

    // const animLoader = new FBXLoader();
    // animLoader.setPath("./model/");
    // animLoader.load("ATM.fbx", (anim) => {
    //   const mixer = new THREE.AnimationMixer(fbxATM);
    //   animationMixer.push(mixer);
    //   const idleAction = mixer.clipAction(anim.animations[0]);
    //   idleAction.play();

    //   checkCollisions();
    //   animate();
    // });

    banScene.add(fbxATM2);

    //checkCollisions() parte comentada
  });
}

let moduleBB = null;
let fbxModule;

function loadModelModule() {
  const loader = new FBXLoader();
  loader.setPath("./model/");
  loader.load("moduloHacka.fbx", (loadedfbx6) => {
    fbxModule = loadedfbx6;
    fbxModule.scale.setScalar(0.7);
    fbxModule.rotateY(Math.PI / 2);
    fbxModule.traverse((c) => {
      c.castShadow = true;
    });
    fbxModule.position.copy(new THREE.Vector3(40, 0, 150));

    // Crear la caja de colision para el modelo animado
    moduleBB = new THREE.Box3().setFromObject(fbxModule);

    // const animLoader = new FBXLoader();
    // animLoader.setPath("./model/");
    // animLoader.load("ATM.fbx", (anim) => {
    //   const mixer = new THREE.AnimationMixer(fbxATM);
    //   animationMixer.push(mixer);
    //   const idleAction = mixer.clipAction(anim.animations[0]);
    //   idleAction.play();

    //   checkCollisions();
    //   animate();
    // });

    banScene.add(fbxModule);

    //checkCollisions() parte comentada
  });
}

let ventanillaBB = null;
let fbxVentanilla;

function loadModelVentanilla() {
  const loader = new FBXLoader();
  loader.setPath("./model/");
  loader.load("vetanilla.fbx", (loadedfbx6) => {
    fbxVentanilla = loadedfbx6;
    fbxVentanilla.scale.setScalar(2.6);
    //
    fbxVentanilla.traverse((c) => {
      c.castShadow = true;
    });
    fbxVentanilla.position.copy(new THREE.Vector3(0, 0, -180));

    // Crear la caja de colision para el modelo animado
    ventanillaBB = new THREE.Box3().setFromObject(fbxVentanilla);

    // const animLoader = new FBXLoader();
    // animLoader.setPath("./model/");
    // animLoader.load("ATM.fbx", (anim) => {
    //   const mixer = new THREE.AnimationMixer(fbxATM);
    //   animationMixer.push(mixer);
    //   const idleAction = mixer.clipAction(anim.animations[0]);
    //   idleAction.play();

    //   checkCollisions();
    //   animate();
    // });

    banScene.add(fbxVentanilla);

    //checkCollisions() parte comentada
  });
}

let ventanillaBB2 = null;
let fbxVentanilla2;

function loadModelVentanilla2() {
  const loader = new FBXLoader();
  loader.setPath("./model/");
  loader.load("vetanilla.fbx", (loadedfbx6) => {
    fbxVentanilla2 = loadedfbx6;
    fbxVentanilla2.scale.setScalar(2.6);
    fbxVentanilla2.rotateY(-Math.PI / 2);
    fbxVentanilla2.traverse((c) => {
      c.castShadow = true;
    });
    fbxVentanilla2.position.copy(new THREE.Vector3(-180, 0, -180));

    // Crear la caja de colision para el modelo animado
    ventanillaBB2 = new THREE.Box3().setFromObject(fbxVentanilla2);

    // const animLoader = new FBXLoader();
    // animLoader.setPath("./model/");
    // animLoader.load("ATM.fbx", (anim) => {
    //   const mixer = new THREE.AnimationMixer(fbxATM);
    //   animationMixer.push(mixer);
    //   const idleAction = mixer.clipAction(anim.animations[0]);
    //   idleAction.play();

    //   checkCollisions();
    //   animate();
    // });

    banScene.add(fbxVentanilla2);

    //checkCollisions() parte comentada
  });
}

let ventanillaBB3 = null;
let fbxVentanilla3;

function loadModelVentanilla3() {
  const loader = new FBXLoader();
  loader.setPath("./model/");
  loader.load("vetanilla.fbx", (loadedfbx6) => {
    fbxVentanilla3 = loadedfbx6;
    fbxVentanilla3.scale.setScalar(2.6);
    fbxVentanilla3.rotateY(Math.PI / 2);
    fbxVentanilla3.traverse((c) => {
      c.castShadow = true;
    });
    fbxVentanilla3.position.copy(new THREE.Vector3(180, 0, -180));

    // Crear la caja de colision para el modelo animado
    ventanillaBB3 = new THREE.Box3().setFromObject(fbxVentanilla3);

    // const animLoader = new FBXLoader();
    // animLoader.setPath("./model/");
    // animLoader.load("ATM.fbx", (anim) => {
    //   const mixer = new THREE.AnimationMixer(fbxATM);
    //   animationMixer.push(mixer);
    //   const idleAction = mixer.clipAction(anim.animations[0]);
    //   idleAction.play();

    //   checkCollisions();
    //   animate();
    // });

    banScene.add(fbxVentanilla3);

    //checkCollisions() parte comentada
  });
}

let ventanillaBB4 = null;
let fbxVentanilla4;

function loadModelVentanilla4() {
  const loader = new FBXLoader();
  loader.setPath("./model/");
  loader.load("vetanilla.fbx", (loadedfbx6) => {
    fbxVentanilla4 = loadedfbx6;
    fbxVentanilla4.scale.setScalar(2.6);
    fbxVentanilla4.rotateY(Math.PI / 2);
    fbxVentanilla4.traverse((c) => {
      c.castShadow = true;
    });
    fbxVentanilla4.position.copy(new THREE.Vector3(180, 0, 80));

    // Crear la caja de colision para el modelo animado
    ventanillaBB4 = new THREE.Box3().setFromObject(fbxVentanilla4);

    // const animLoader = new FBXLoader();
    // animLoader.setPath("./model/");
    // animLoader.load("ATM.fbx", (anim) => {
    //   const mixer = new THREE.AnimationMixer(fbxATM);
    //   animationMixer.push(mixer);
    //   const idleAction = mixer.clipAction(anim.animations[0]);
    //   idleAction.play();

    //   checkCollisions();
    //   animate();
    // });

    banScene.add(fbxVentanilla4);

    //checkCollisions() parte comentada
  });
}

let ventanillaBB5 = null;
let fbxVentanilla5;

function loadModelVentanilla5() {
  const loader = new FBXLoader();
  loader.setPath("./model/");
  loader.load("vetanilla.fbx", (loadedfbx6) => {
    fbxVentanilla5 = loadedfbx6;
    fbxVentanilla5.scale.setScalar(2.6);
    fbxVentanilla5.rotateY(-Math.PI / 2);
    fbxVentanilla5.traverse((c) => {
      c.castShadow = true;
    });
    fbxVentanilla5.position.copy(new THREE.Vector3(-180, 0, 80));

    // Crear la caja de colision para el modelo animado
    ventanillaBB5 = new THREE.Box3().setFromObject(fbxVentanilla5);

    // const animLoader = new FBXLoader();
    // animLoader.setPath("./model/");
    // animLoader.load("ATM.fbx", (anim) => {
    //   const mixer = new THREE.AnimationMixer(fbxATM);
    //   animationMixer.push(mixer);
    //   const idleAction = mixer.clipAction(anim.animations[0]);
    //   idleAction.play();

    //   checkCollisions();
    //   animate();
    // });

    banScene.add(fbxVentanilla5);

    //checkCollisions() parte comentada
  });
}

let arrowBB1 = null;
let fbxArrow;

function loadModelArrow() {
  const loader = new FBXLoader();
  loader.setPath("./model/");
  loader.load("arrow.fbx", (loadedfbx6) => {
    fbxArrow = loadedfbx6;
    fbxArrow.scale.setScalar(7.6);
    fbxArrow.traverse((c) => {
      c.castShadow = true;
    });
    fbxArrow.position.copy(new THREE.Vector3(-40, 40, 30));

    // Crear la caja de colision para el modelo animado
    arrowBB1 = new THREE.Box3().setFromObject(fbxArrow);

    const animLoader = new FBXLoader();
    animLoader.setPath("./model/");
    animLoader.load("arrow.fbx", (anim) => {
      const mixer = new THREE.AnimationMixer(fbxArrow);
      animationMixer2.push(mixer);
      const idleAction = mixer.clipAction(anim.animations[0]);
      idleAction.play();

      checkCollisions();
      animate();
    });

    if (mapaConsultado && cuenta) {
      banScene.add(fbxArrow);
    }
    //checkCollisions() parte comentada
  });
}

let arrowBB2 = null;
let fbxArrow2;

function loadModelArrow2() {
  const loader = new FBXLoader();
  loader.setPath("./model/");
  loader.load("arrow.fbx", (loadedfbx7) => {
    fbxArrow2 = loadedfbx7;
    fbxArrow2.scale.setScalar(7.6);
    fbxArrow2.traverse((c) => {
      c.castShadow = true;
    });
    fbxArrow2.position.copy(new THREE.Vector3(-80, 30, 140));

    // Crear la caja de colision para el modelo animado
    arrowBB2 = new THREE.Box3().setFromObject(fbxArrow2);

    const animLoader = new FBXLoader();
    animLoader.setPath("./model/");
    animLoader.load("arrow.fbx", (anim) => {
      const mixer = new THREE.AnimationMixer(fbxArrow2);
      animationMixer2.push(mixer);
      const idleAction = mixer.clipAction(anim.animations[0]);
      idleAction.play();

      checkCollisions();
      animate();
    });
    if (mapaConsultado && !cuenta) {
      banScene.add(fbxArrow2);
    }
    //checkCollisions() parte comentada
  });
}

let deskBB = null;
let fbxDesk;

function loadModelDesk() {
  const loader = new FBXLoader();
  loader.setPath("./model/");
  loader.load("desk.fbx", (loadedfbx7) => {
    fbxDesk = loadedfbx7;
    fbxDesk.scale.setScalar(13.6);
    fbxDesk.rotateY(Math.PI / 2);
    fbxDesk.traverse((c) => {
      c.castShadow = true;
    });
    fbxDesk.position.copy(new THREE.Vector3(-80, 0, 140));

    // Crear la caja de colision para el modelo animado
    deskBB = new THREE.Box3().setFromObject(fbxDesk);

    const animLoader = new FBXLoader();
    animLoader.setPath("./model/");
    animLoader.load("desk.fbx", (anim) => {
      const mixer = new THREE.AnimationMixer(fbxDesk);
      animationMixer2.push(mixer);
      const idleAction = mixer.clipAction(anim.animations[0]);
      idleAction.play();

      checkCollisions();
      animate();
    });
    banScene.add(fbxDesk);

    //checkCollisions() parte comentada
  });
}

//Check Model Collisions
function checModuloCollision() {
  if (moduleBB && modelBB) {
    // Verifica si ambos tienen valores asignados
    if (moduleBB.intersectsBox(modelBB) && (mapaConsultado == null || mapaConsultado == undefined)) {
      // console.log("Colisión con el módulo");

      // Obtener la URL actual
      var currentUrl = window.location.href;

      // Obtener la parte de la URL después del último signo de interrogación
      var urlParams = currentUrl.split("?");
      var lastParam = urlParams[urlParams.length - 1];

      // Construir la nueva URL con 'opciones.html' y la parte después del último signo de interrogación
      var newUrl = "opciones.html?" + lastParam;

      // Redireccionar a la nueva URL
      window.location.href = newUrl;
    }
  }
}

animate();
