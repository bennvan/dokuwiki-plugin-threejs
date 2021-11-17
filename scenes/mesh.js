

// DokuWiki Plugin threejs: STL Scene
 
//  @license GPL 2 http://www.gnu.org/licenses/gpl-2.0.html
//  @author  Ben van Magill <ben.vanmagill16@gmail.com>

  import * as THREE from '{{module}}'; //'https://cdn.skypack.dev/three';
  import { OrbitControls } from '{{examples}}jsm/controls/OrbitControls.js';
  import { STLLoader } from '{{examples}}jsm/loaders/STLLoader.js';

  function init() {

    const container = document.getElementById("{{uid}}");
    const loader = new STLLoader();
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

    
    loader.load("{{url}}", function ( geometry ) {
      // mesh
      var material = new THREE.MeshPhongMaterial( {
        color: 0x00398a,
        polygonOffset: true,
        polygonOffsetFactor: 1, // positive value pushes polygon further away
        polygonOffsetUnits: 1
      } );
      var mesh = new THREE.Mesh( geometry, material );
      scene.add( mesh )

      // wireframe
      var geo = new THREE.EdgesGeometry( mesh.geometry ); // or WireframeGeometry
      var mat = new THREE.LineBasicMaterial( { color: 0xffffff } );
      var wireframe = new THREE.LineSegments( geo, mat );
      mesh.add( wireframe );
      zoomCameraToSelection(camera, controls, [mesh], 2);

    } );

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

  init();


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
