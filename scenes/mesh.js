

// DokuWiki Plugin threejs: STL Scene
 
//  @license GPL 2 http://www.gnu.org/licenses/gpl-2.0.html
//  @author  Ben van Magill <ben.vanmagill16@gmail.com>

  import * as THREE from '{{module}}'; //'https://cdn.skypack.dev/three';
  import { OrbitControls } from '{{examples}}jsm/controls/OrbitControls.js';
  import { STLLoader } from '{{examples}}jsm/loaders/STLLoader.js';
  import { ThreeMFLoader } from '{{examples}}jsm/loaders/3MFLoader.js';

  const container = document.getElementById("{{uid}}");
  const buttLoadModel = container.getElementsByClassName('threejs-load')[0];
  const url = "{{url}}";

  function init() {
    if ("{{autoload}}" == true) {
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
  
  function initScene() {

    let loader;
    
    const scene = new THREE.Scene();

    // scene.background = new THREE.Color(0x8fbcd4);
    scene.background = new THREE.Color( 0xb0b0b0 );
    scene.fog = new THREE.Fog( 0xa0a0a0, 200, 1000 );

    const directionalLight = new THREE.DirectionalLight( 0xffffff, 0.6 );
    directionalLight.position.set( 0.75, 0.75, 1.0 ).normalize();
    scene.add( directionalLight );

    const ambientLight = new THREE.AmbientLight( 0xcccccc, 0.2 );
    scene.add( ambientLight );

    const grid = new THREE.GridHelper( 4000, 200, 0xffffff, 0x555555 );
    grid.rotateOnAxis( new THREE.Vector3( 1, 0, 0 ), 90 * ( Math.PI / 180 ) );
    scene.add( grid );


    // Camera
    const camera = new THREE.PerspectiveCamera(
      35,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.up.set( 0, 0, 1 );
    camera.position.set(-20, -20, 15);
    const controls = new OrbitControls(camera, container);
    controls.target.set( 0, 1.2, 2 );
    controls.update();

    const lights = createLights();

    scene.add(
      lights.ambient,
      lights.main,
    );

    // Generic model colour
    var material = new THREE.MeshPhongMaterial( {
      color: 0x00398a,
      polygonOffset: true,
      polygonOffsetFactor: 1, // positive value pushes polygon further away
      polygonOffsetUnits: 1
    } );

    if (url.endsWith('.stl')) {
      const loader = new STLLoader();
      loader.load(url, function ( geometry ) {
        var mesh = new THREE.Mesh( geometry, material );
        scene.add( mesh )

        // wireframe
        // var geo = new THREE.EdgesGeometry( mesh.geometry ); // or WireframeGeometry
        // var mat = new THREE.LineBasicMaterial( { color: 0xffffff } );
        // var wireframe = new THREE.LineSegments( geo, mat );
        // mesh.add( wireframe );

        zoomCameraToSelection(camera, controls, [mesh], 1.5);

      } );

    } else if (url.endsWith('.3mf')) {
        const manager = new THREE.LoadingManager();
        const loader = new ThreeMFLoader( manager );
        loader.load(url, function ( object ) {

          object.traverse( function ( child ) {

            if (child instanceof THREE.Mesh) {
                if (!child.material) {
                  child.material = material
                  child.geometry.computeVertexNormals(true);
                }
            }

          } );

          scene.add( object );

          zoomCameraToSelection(camera, controls, [object], 1.5);

        } );
  }

    buttLoadModel.parentElement.remove();

    const renderer = createRenderer(container);
    renderer.shadowMap.enabled = true;
    setupOnWindowResize(camera, container, renderer);

    renderer.setAnimationLoop(() => {
      renderer.render(scene, camera);
    });
  }

  function createLights() {
    const ambient = new THREE.HemisphereLight(0xddeeff, 0x0f0e0d, 5);

    const main = new THREE.DirectionalLight(0xffffff, 5);
    main.position.set(10, 10, 10);

    return {
      ambient,
      main
    };
  }

  function createRenderer(container) {
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);

    renderer.setPixelRatio(window.devicePixelRatio);

    renderer.gammaFactor = 2.2;
    renderer.gammaOutput = true;

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

init();