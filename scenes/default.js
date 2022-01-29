// DokuWiki Plugin threejs: STL Scene

//  @license GPL 2 http://www.gnu.org/licenses/gpl-2.0.html
//  @author  Ben van Magill <ben.vanmagill16@gmail.com>

import * as THREE from 'three';
import { OrbitControls } from '{{examples}}/jsm/controls/OrbitControls.js';
import { STLLoader } from '{{examples}}/jsm/loaders/STLLoader.js';
import { ThreeMFLoader } from '{{examples}}/jsm/loaders/3MFLoader.js';
import { VRMLLoader } from '{{examples}}/jsm/loaders/VRMLLoader.js';

const container = document.getElementById("{{uid}}");
const buttLoadModel = container.getElementsByClassName('threejs-load')[0];
const url = "{{url}}";

function init() {
    if ("{{autoload}}" == true && !(isMobile())) {
        initLoad();
    } else {
        buttLoadModel.addEventListener('click', initLoad);
    }
}

function initLoad() {
    buttLoadModel.disabled = true;
    buttLoadModel.innerHTML = 'Loading...';
    buttLoadModel.parentElement.classList.add('lds-dual-ring');
    initScene();
}

function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

function initScene() {

    const scene = new THREE.Scene();

    // scene.background = new THREE.Color(0x8fbcd4);
    scene.background = new THREE.Color(0xb0b0b0);

    const lights = createLights()
    scene.add(
        lights.ambient,
        lights.hemi,
    );

    // Camera
    const camera = new THREE.PerspectiveCamera(
        35,
        container.clientWidth / container.clientHeight,
        0.1,
        1000
    );
    camera.up.set(0, 0, 1);
    camera.position.set(-20, -20, 15);
    const controls = new OrbitControls(camera, container);
    controls.target.set(0, 1.2, 2);
    controls.update();

    let model_color, user_color;

    model_color = 0x00398a;
    if ("{{color}}" !== "") {
        user_color = true;
        if ("{{color}}" !== "1") model_color = "{{color}}";
    }

    // Generic model colour
    var material = new THREE.MeshPhongMaterial({
        color: model_color,
        polygonOffset: true,
        polygonOffsetFactor: 1, // positive value pushes polygon further away
        polygonOffsetUnits: 1
    });

    const manager = new THREE.LoadingManager(() => {
        buttLoadModel.parentElement.classList.add('fade-out');
        buttLoadModel.parentElement.addEventListener('transitionend', onTransitionEnd);
    });

    let loader;

    if (url.endsWith('.stl')) {
        loader = new STLLoader(manager);
        loader.load(url, function(geometry) {
            var object = new THREE.Mesh(geometry, material);
            object.castShadow = true;
            object.receiveShadow = true;
            scene.add(object)

            // wireframe
            if ("{{wireframe}}" == true) {
                var geo = new THREE.EdgesGeometry(object.geometry); // or WireframeGeometry
                var mat = new THREE.LineBasicMaterial({ color: 0xffffff });
                var wireframe = new THREE.LineSegments(geo, mat);
                object.add(wireframe);
            }

            // Zoom camera to size of model
            zoomCameraToSelection(camera, controls, [object], 1.5);

            // Create light for shadow.
            var bounds = getBoundingSize([object]);
            const shadowlight = createShadowLight(bounds.size.x, bounds.size.y, bounds.size.z, bounds.maxSize);
            scene.add(shadowlight);

            // Create floor
            if ("{{nofloor}}" != true) {
                const floor = createFloor(bounds.maxSize);
                floor.grid.position.set(bounds.center.x, bounds.center.y, 0);
                floor.plane.position.set(bounds.center.x, bounds.center.y, 0);
                scene.add(floor.grid, floor.plane);
            }

            // Add fog
            scene.fog = new THREE.Fog(0xa0a0a0, bounds.maxSize / 100, bounds.maxSize * 50);

        });



    } else {
        if (url.endsWith('.3mf')) {
            loader = new ThreeMFLoader(manager);
        } else {
            loader = new VRMLLoader(manager);
        }

        loader.load(url, function(object) {

            object.traverse(function(child) {
                child.castShadow = true;

                if (child instanceof THREE.Mesh) {
                    // wireframe
                    if ("{{wireframe}}" == true) {
                        var geo = new THREE.EdgesGeometry(child.geometry); // or WireframeGeometry
                        var mat = new THREE.LineBasicMaterial({ color: 0xffffff });
                        var wireframe = new THREE.LineSegments(geo, mat);
                        child.add(wireframe);
                    }
                    if (user_color) {
                        child.material = material
                        child.geometry.computeVertexNormals(true);
                    }
                }

            });

            scene.add(object);

            // Zoom camera to size of model
            zoomCameraToSelection(camera, controls, [object], 1.5);

            // Create light for shadow.
            var bounds = getBoundingSize([object]);
            const shadowlight = createShadowLight(bounds.size.x, bounds.size.y, bounds.size.z, bounds.maxSize);
            scene.add(shadowlight);

            // Create floor
            if ("{{nofloor}}" != true) {
                const floor = createFloor(bounds.maxSize);
                floor.grid.position.set(bounds.center.x, bounds.center.y, 0);
                floor.plane.position.set(bounds.center.x, bounds.center.y, 0);
                scene.add(floor.grid, floor.plane);
            }

            // Add fog
            scene.fog = new THREE.Fog(0xa0a0a0, bounds.maxSize / 100, bounds.maxSize * 50);

        });
    }

    const renderer = createRenderer(container);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    setupOnWindowResize(camera, container, renderer);

    renderer.setAnimationLoop(() => {
        renderer.render(scene, camera);
    });
}

function getBoundingSize(selection) {
    const box = new THREE.Box3();

    for (const object of selection) box.expandByObject(object);

    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    const maxSize = Math.max(size.x, size.y, size.z);
    return {
        size,
        center,
        maxSize
    }
}

function createFloor(maxSize) {
    var size = maxSize * 2,
        divisions = size / 20
    const grid = new THREE.GridHelper(size, divisions, 0xffffff, 0x555555);
    grid.rotateOnAxis(new THREE.Vector3(1, 0, 0), 90 * (Math.PI / 180));

    const plane = new THREE.Mesh(
        new THREE.PlaneGeometry(size, size),
        new THREE.MeshPhongMaterial({ color: 0x999999, specular: 0x101010 })
    );
    plane.receiveShadow = true;

    return {
        grid,
        plane
    }
}

function createShadowLight(x, y, z, d) {

    // Dirlight
    const dir = new THREE.DirectionalLight(0xffffff, 2.5);
    dir.position.set(x / 2, y / 2, z * 2);

    dir.castShadow = true;

    dir.shadow.camera.left = -d;
    dir.shadow.camera.right = d;
    dir.shadow.camera.top = d;
    dir.shadow.camera.bottom = -d;

    dir.shadow.camera.near = d / 100;
    dir.shadow.camera.far = d * 2;

    dir.shadow.bias = -0.002;

    return dir;
}

function createLights() {
    // hemilight
    const hemi = new THREE.HemisphereLight(0xddeeff, 0x0f0e0d, 2);

    // ambientlight
    const ambient = new THREE.AmbientLight(0xcccccc, 1);

    // Dirlight
    // const dir = new THREE.DirectionalLight( 0xffffff, 0.6 );
    // dir.position.set( 0.75, 0.75, 1.0 ).normalize();

    // const main = new THREE.DirectionalLight(0xffffff, 5);
    // main.position.set(10, 10, 10);

    return {
        ambient,
        hemi,
    };
}

function createRenderer(container) {
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);

    renderer.setPixelRatio(window.devicePixelRatio);

    // renderer.gammaFactor = 2.2;
    renderer.outputEncoding = THREE.sRGBEncoding;

    renderer.physicallyCorrectLights = true;

    container.appendChild(renderer.domElement);

    return renderer;
}

function setupOnWindowResize(camera, container, renderer) {
    window.addEventListener("resize", () => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();

        renderer.setSize(container.clientWidth, container.clientHeight);
    });
}

function zoomCameraToSelection(camera, controls, selection, fitRatio = 1.2) {
    const box = new THREE.Box3();

    for (const object of selection) box.expandByObject(object);

    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    const maxSize = Math.max(size.x, size.y, size.z);
    const fitHeightDistance =
        maxSize / (2 * Math.atan((Math.PI * camera.fov) / 360));
    const fitWidthDistance = fitHeightDistance / camera.aspect;
    const distance = fitRatio * Math.max(fitHeightDistance, fitWidthDistance);

    const direction = controls.target
        .clone()
        .sub(camera.position)
        .normalize()
        .multiplyScalar(distance);

    controls.maxDistance = distance * 10;
    controls.target.copy(center);

    camera.near = distance / 100;
    camera.far = distance * 100;
    camera.updateProjectionMatrix();

    camera.position.copy(controls.target).sub(direction);

    controls.update();
}

function onTransitionEnd(event) {

    event.target.remove();

}

init();