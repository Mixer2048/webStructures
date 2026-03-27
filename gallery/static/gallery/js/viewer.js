import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

export function loadModel(containerId, modelUrl)
{
    console.log(`Файл по пути: ${modelUrl} загружается в контейнер: ${containerId}`);

    const container = document.getElementById(containerId);
    if (!container)
    {
        //console.error("Контейнер не найден:", containerId);
        return;
    }

    const scene = new THREE.Scene();
    //scene.background = new THREE.Color(0xf0f0f0);
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(45, container.clientWidth/container.clientHeight, 0.1, 1000);
    //camera.position.z = 2;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    container.appendChild(renderer.domElement);
    const controls = new OrbitControls(camera, renderer.domElement);

    controls.enableDamping = true;
    controls.damplingFactor = 0.05;

    controls.minDistance = 0.1;
    controls.maxDistance = 50;

    /*
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshStandardMaterial({ color: 0x007bff });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);
    */

    /*
    const light = new THREE.DirectionalLight(0xffffff, 2);
    light.position.set(5, 10, 7);
    scene.add(light);

    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);
    */

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();

    const roomEnvironment = new RoomEnvironment();
    scene.environment = pmremGenerator.fromScene(roomEnvironment).texture;

    //scene.background = new THREE.Color(0xeeeeee);

    //const loader = new GLTFLoader();

    let loadedModel = null;

    const loaderDiv = document.createElement('div');
    loaderDiv.className = 'loader-overlay';
    loaderDiv.innerHTML =
    `
        <div style="color: #666; font-size: 0.9rem;">Loading...</div>
        <div class="progress-bar">
        <div class="progress-fill"></div>
    `;
    container.appendChild(loaderDiv);

    const progressFill = loaderDiv.querySelector('.progress-fill');

    const loader = new GLTFLoader();

    loader.load
    (
        modelUrl,
        (gltf) =>
        {
            loadedModel = gltf.scene;
            const model = gltf.scene;

            fitCameraToObject(camera, model, 1.5);

            scene.add(model);

            loaderDiv.style.opacity = '0';
            setTimeout(() => {loaderDiv.remove();}, 300);
        },
        (xhr) =>
        {
            if (xhr.total > 0)
            {
                //console.log(`загрузилось: ${xhr.loaded}`);

                const percent = (xhr.loaded / xhr.total) * 100;
                progressFill.style.width = percent + '%';
            }
        },
        //undefined,
        (error) =>
        {
            console.error('Ошибка загрузки:', error);
            //container.innerHTML = 'Error';
            loaderDiv.innerHTML = `<div class="error-msg">❌ Ошибка загрузки<br> <small>Проверьте файл</small></div>`;
        }
    );

    function animate()
    {
        requestAnimationFrame(animate);

        controls.update();

        //if (loadedModel) {loadedModel.rotation.y += 0.005;}

        renderer.render(scene, camera);

        scene.rotation.y += 0.005;
    }

    animate();

    window.addEventListener('resize', () =>
    {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    
    renderer.setSize(container.clientWidth, container.clientHeight);
    });

    //console.log("3D сцена запущена в", containerId);
}

function fitCameraToObject(camera, object, offset = 1.25)
{
    const boundingBox = new THREE.Box3();
    boundingBox.setFromObject(object);

    const center = boundingBox.getCenter(new THREE.Vector3());
    const size = boundingBox.getSize(new THREE.Vector3());

    const maxDim = Math.max(size.x, size.y, size.z);

    object.position.x = -center.x;
    object.position.y = -center.y;
    object.position.z = -center.z;

    const fov = camera.fov * (Math.PI / 180);
    let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
    cameraZ *= offset;

    camera.position.set(0, maxDim * 0.5, cameraZ);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();

    console.log(camera.position);
}