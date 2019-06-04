const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;
camera.lookAt(new THREE.Vector3());
camera.position.y = 2;
const renderer = new THREE.WebGLRenderer();

let particles = [];

class Particle {
    constructor() {
        this.lifeTime = Math.floor(Math.random() * 70);

        this.dot = new THREE.Mesh(new THREE.SphereGeometry(0.2, 32, 32), new THREE.MeshBasicMaterial({ color: 0xffcccc }));
        scene.add(this.dot);
        const flatSpeed = 1.5;
        const x = Math.random() * flatSpeed - (flatSpeed / 2);
        const z = Math.random() * flatSpeed - (flatSpeed / 2);
        this.projection = new THREE.Vector3(x / 10, 0.1, z / 10);
    }

    init() {
        this.lifeTime = Math.floor(Math.random() * 70);

        const flatSpeed = 1.5;
        const x = Math.random() * flatSpeed - (flatSpeed / 2);
        const z = Math.random() * flatSpeed - (flatSpeed / 2);
        this.projection = new THREE.Vector3(x / 10, 0.1, z / 10);
        this.dot.position.set(0, 0, 0);
    }

    isAlive() {
        return this.lifeTime > 0;
    }

    render() {
        if (this.lifeTime === 0) return;
        this.dot.position.add(this.projection);
        this.lifeTime--;
    }
}

function addParticle() {
    const p = new Particle();
    particles.push(p);
}

function renderParticles() {
    for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        if (p.isAlive()) {
            p.render();
        } else {
            p.init();
        }
    }
}

function animate() {
    renderParticles();

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

    const center = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 10, 32), new THREE.MeshPhongMaterial({ color: 0x8B4513 }));
    center.position.y = -5;
    scene.add(center);

    const base = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 32), new THREE.MeshBasicMaterial({ color: 0xff3333 }));
    scene.add(base);

    const light = new THREE.PointLight(0xffffff, 3, 100);
    light.position.y = 3;
    light.position.z = 4;
    scene.add(light);

    for (let i = 0; i < 1000; i++) {
        addParticle();
    }

    animate();
}

window.addEventListener("load", loadFlame);