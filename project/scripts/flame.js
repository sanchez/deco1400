const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;
camera.lookAt(new THREE.Vector3());
camera.position.y = 2;
const renderer = new THREE.WebGLRenderer();
const clock = new THREE.Clock();
let ticks = 0;

const particleSystem = new THREE.GPUParticleSystem({
    maxParticles: 250000
});
scene.add(particleSystem);

function animate() {
    const delta = clock.getDelta();
    ticks += delta / 3;
    
    if (delta > 0) {
        for (let i = 0; i < delta * 15000; i++) {
            particleSystem.spawnParticle({
                position: new THREE.Vector3(),
                positionRandomness: 0.3,
                velocity: new THREE.Vector3(0, 1, 0),
                velocityRandomness: 0.5,
                color: 0xff88aa,
                colorRandomness: 0.2,
                turbulence: 0.3,
                lifetime: 2,
                size: 5,
                sizeRandomness: 1,
            });
        }
    }

    particleSystem.update(ticks);

    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

function loadFlame() {
    /*if (!WEBGL.isWebGLAvailable()) {
        console.error(WEBGL.getWebGLErrorMessage());
        return;
    }*/

    const flameElement = document.querySelector("#flame");
    if (!flameElement) return;
    const parentElement = flameElement.parentElement;
    if (!parentElement) return;

    renderer.setSize(parentElement.clientWidth, parentElement.clientHeight);
    parentElement.replaceChild(renderer.domElement, flameElement);

    const center = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 2, 32), new THREE.MeshPhongMaterial({ color: 0x8B4513 }));
    center.position.y = -1;
    scene.add(center);

    const base = new THREE.Mesh(new THREE.SphereGeometry(0.2, 32, 32), new THREE.MeshPhongMaterial({ color: 0xff3333 }));
    scene.add(base);

    const light = new THREE.PointLight(0xffffff, 3, 100);
    light.position.y = 3;
    light.position.z = 4;
    scene.add(light);

    animate();
}

window.addEventListener("load", loadFlame);