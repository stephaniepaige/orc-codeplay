var selectedElement;
var numberOfElements = 0;
var dragging = false;
var allElements = [];
var name_field;
var scene_field;
var sceneNum = 1;
var people;
var texture;
//go to  http://docs.mlab.com/ sign up and get get your own api Key and make your own db and collection
var apiKey = "yqF51-f1Y60B759diV-wWq9f_Ob9Nbru";
var db = "stevie_chambers";
var coll = "steviestevie";
var camera3D;  //be careful because p5.js might have something named camera
var scene ;  //be careful because our sketch has something named scene
var renderer ;
var cube3D;
animate();

function setup(){
  htmlInterface();
  listOfUsers();
  getScene();
  setUp3D();
  activatePanoControl();
}

function htmlInterface(){
  //moved most of these out into html file instead of creating them in p5js
  name_field = $("#name");
  name_field.val("Stevie");
  scene_field = $("#sceneNum");
  $("#previous").click(previous);
  $("#next").click(next);
  scene_field.val(sceneNum);
}
//
// function setUp3D(){
//   scene = new THREE.Scene();
//   camera3D = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, .1, 1000 );
//   renderer = new THREE.WebGLRenderer();
//   renderer.setSize( window.innerWidth, window.innerHeight );
//   document.getElementById( 'container' ).appendChild( renderer.domElement );
//   camera3D.position.z = 5;

  function setUp3D(){
  scene = new THREE.Scene();
  camera3D = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, .1, 1000 );
  renderer = new THREE.WebGLRenderer( { alpha: true });
  renderer.setSize( window.innerWidth, window.innerHeight );
  document.getElementById( 'container' ).appendChild( renderer.domElement );
  camera3D.position.z = 5;

  //create a sphere to put the panoramic video on
  var geometry = new THREE.SphereGeometry( 100, 100, 100 );
  geometry.scale( - 1, 1, 1 );
  var material = new THREE.MeshBasicMaterial( {
    map: new THREE.TextureLoader().load('homepano.jpg')
  } );
  mesh = new THREE.Mesh( geometry, material );
  scene.add( mesh );

  //create old lady toon
  var geometry = new THREE.PlaneGeometry(8, 8);
  // var material = new THREE.MeshBasicMaterial({color : 0x00ff00});
  var material = new THREE.MeshBasicMaterial({
   map:  new THREE.TextureLoader().load('cartoonlady3.png'), transparent: true
  } );

  var toon = new THREE.Mesh( geometry, material );

  toon.position.x = 3;
  toon.position.y = 0;
  toon.position.z = -5;
  // toon.rotation.y = Math.PI/2;
//  toon.rotation.set(new THREE.Vector3( 0, 0, Math.PI / 2));
    scene.add( toon );

    //create old lady toon2
    var geometry = new THREE.PlaneGeometry(6, 6);
    // var material = new THREE.MeshBasicMaterial({color : 0x00ff00});
    var material = new THREE.MeshBasicMaterial({
     map:  new THREE.TextureLoader().load('cartoonlady2.png'), transparent: true
    } );

    var toon2 = new THREE.Mesh( geometry, material );

    toon2.position.x = 5;
    toon2.position.y = 0;
    toon2.position.z = 2;
    // toon.rotation.y = Math.PI/2;
  //  toon.rotation.set(new THREE.Vector3( 0, 0, Math.PI / 2));
      scene.add( toon2 );

      //create old lady toon3
      var geometry = new THREE.PlaneGeometry(20, 20);
      // var material = new THREE.MeshBasicMaterial({color : 0x00ff00});
      var material = new THREE.MeshBasicMaterial({
       map:  new THREE.TextureLoader().load('cartoonlady1.png'), transparent: true
      } );

      var toon3 = new THREE.Mesh( geometry, material );

      toon3.position.x = -20;
      toon3.position.y = -5;
      toon3.position.z = -12;
      // toon.rotation.y = Math.PI/2;
    //  toon.rotation.set(new THREE.Vector3( 0, 0, Math.PI / 2));
        scene.add( toon3 );
}

function animate(){
  requestAnimationFrame( animate );
  renderer.render(scene, camera3D);
}


function previous(){
  saveCamera();
  sceneNum = max(1,sceneNum -1);
  scene_field.val(sceneNum);
  getScene()
}

function next(){
  saveCamera();
  sceneNum++;
  scene_field.val(sceneNum);
  getScene()
}

function keyPressed(){
  //opportunity for you to change the background?
}


function saveCamera(){
  var myName =  name_field.val() ;
  var thisElementArray = {}; //make an array for sending
  thisElementArray.owner = myName;
  thisElementArray.type = "camera"
  thisElementArray.scene = sceneNum ;
  thisElementArray.camera = camera3D.matrix.toArray();
  thisElementArray.cameraFOV = camera3D.fov; //camera3D.fov;
  var data = JSON.stringify(thisElementArray ) ;

  var query =  "q=" + JSON.stringify({type:"camera", scene:sceneNum}) + "&";
  $.ajax( { url: "https://api.mlab.com/api/1/databases/"+ db +"/collections/"+coll+"/?" +  query + "u=true&apiKey=" + apiKey,
  data: data,
  type: "PUT",
  contentType: "application/json",
  success: function(data){console.log("saved camera" );},
  failure: function(data){  console.log("didn't savecamera" );}
});
}



function getScene(){

  //get all the info for this user and this scene
  var myName = name_field.val() ;
  var query = JSON.stringify({owner:myName, scene:sceneNum});

  $.ajax( { url: "https://api.mlab.com/api/1/databases/"+ db +"/collections/"+coll+"/?q=" + query +"&apiKey=" + apiKey,
  type: "GET",
  success: function (data){  //create the select ui element based on what came back from db
    $.each(data, function(index,obj){
      if(obj.type == "camera"){
        camera3D.matrix.fromArray(obj.camera); // set the camera using saved camera settings
        camera3D.matrix.decompose(camera3D.position,camera3D.quaternion,camera3D.scale);
        camera3D.fov = obj.cameraFOV;
        camera3D.updateProjectionMatrix();
      }else{
        //we will worry about elements next week
        //newElement(obj._id,obj.src,obj.x,obj.y,obj.width,obj.height);
      }
    })
  },
  contentType: "application/json" } );
}

function listOfUsers(){
  $.ajax( { url: "https://api.mlab.com/api/1/databases/"+ db + "/runCommand?apiKey=" + apiKey,
  data: JSON.stringify( {"distinct": coll,"key": "owner"} ),
  type: "POST",
  contentType: "application/json",
  success: function(msg) {
    var allPeople =  msg.values;
    for(var i = 0; i < allPeople.length; i++){
      $("#other_people").append('<option>'+allPeople[i]+'</option>');
    }
    $("#other_people").change(pickedNewPerson);
  } } )
}


function pickedNewPerson() {
  var newName= $("#other_people").val();
  name_field.val(newName);
  sceneNum = 1;
  getScene();
}
