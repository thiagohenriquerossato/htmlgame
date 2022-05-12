const platform = "./images/platform.png"
const hills = "./images/hills.png"
const background = "./images/background.png"
const platformTall = "./images/platformSmallTall.png"

const playerStayRight = "./images/spriteStandRight.png"
const playerStayLeft = "./images/spriteStandLeft.png"
const playerRunRight = "./images/spriteRunRight.png"
const playerRunLeft = "./images/spriteRunLeft.png"



const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

canvas.width = 1024;
canvas.height = 576;

const gravity = 1.5;


class Player {
  constructor(){
    this.position = {
      x:100,
      y:100
    };
    this.velocity = {
      x: 0,
      y: 1
    };
    this.speed = 10;
    this.width = 66;
    this.height = 150;
    this.image = createImg(playerStayRight)
    this.frames = 0
    this.sprites = {
      stand:{
        right:createImg(playerStayRight),
        cropWidth: 177,
        width: 66,
        left:createImg(playerStayLeft)
      },
      running:{
        right:createImg(playerRunRight),
        cropWidth:341,
        width: 127.875,
        left:createImg(playerRunLeft)
      }
    }
    this.currentSprite = this.sprites.stand.right
    this.currentCrop = this.sprites.stand.cropWidth

  }

  draw(){
    c.drawImage(this.currentSprite,
      this.currentCrop*this.frames,
      0,
      this.currentCrop,
      400,
      this.position.x,
      this.position.y,
      this.width,
      this.height
    )
  }

  update() {
    this.frames++
    if(this.frames > 59 &&
       (this.currentSprite ===
        this.sprites.stand.right ||
        this.currentSprite === 
        this.sprites.stand.left)
      ) 
        this.frames = 0;
    else 
    if (this.frames > 29 &&
        (this.currentSprite ===
        this.sprites.running.right ||
        this.currentSprite ===
        this.sprites.running.left)
      )
        this.frames = 0;
    this.draw();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;


    if(this.position.y + this.height +
      this.velocity.y <= canvas.height)
      this.velocity.y += gravity;
    
  }
}

class Platform {
  constructor({x,y, image}){
    this.position = {
      x,
      y
    };
    this.image = image;
    this.width = image.width;
    this.height = image.height;
  }
  draw(){
    c.drawImage(this.image, this.position.x, this.position.y)
  }
}

class GenericObject {
  constructor({x,y, image}){
    this.position = {
      x,
      y
    };
    this.image = image;
    this.width = image.width;
    this.height = image.height;
  }
  draw(){
    c.drawImage(this.image, this.position.x, this.position.y)
  }
}

const createImg = (imageUrl) => {
	const image = new Image();
	image.src = imageUrl;
	return image;
}

const platformImage = createImg(platform)
const platformTallImage = createImg(platformTall)


let player = new Player();
let platforms = [];
let genericObjects = []
let lastKey
let keys = {
  right: {
    pressed: false
  }, 
  left: {
    pressed: false
  }, 
  up: {
    pressed: false
  }, 
}
let scrollOffSet = 0



const init = () =>{
  scrollOffSet = 0


  player = new Player();
  platforms = [
    new Platform({x:platformImage.width*4+ 300-3 + platformImage.width-platformTallImage.width,y:270, image: platformTallImage}),
    new Platform({x:-1, y:470, image: platformImage}),
    new Platform({x:platformImage.width-3,y:470, image: platformImage}),
    new Platform({x:platformImage.width*2+ 100,y:470, image: platformImage}),
    new Platform({x:platformImage.width*3+ 300,y:470, image: platformImage}),
    new Platform({x:platformImage.width*4+ 300-3,y:470, image: platformImage}),
    new Platform({x:platformImage.width*5+ 700,y:470, image: platformImage}),
  ];

  genericObjects = [
    new GenericObject({
      x:-1,
      y:-1,
      image: createImg(background)
    }),
    new GenericObject({
      x:-1,
      y:-1,
      image: createImg(hills)
    })
  ]

  keys = {
    right: {
      pressed: false
    }, 
    left: {
      pressed: false
    }, 
    up: {
      pressed: false
    }, 
  }
}


function animate() {
  requestAnimationFrame(animate);
  c.fillStyle = 'white'
  c.fillRect(0, 0, canvas.width, canvas.height);
  genericObjects.forEach(generic =>{ generic.draw()})
  platforms.forEach((platform) => platform.draw())
  player.update();
 

  if( keys.right.pressed && player.position.x < 400){
    player.velocity.x = player.speed;
  } else if(
    (keys.left.pressed && player.position.x > 100) ||
    (keys.left.pressed && scrollOffSet === 0 && player.position.x > 0)
  ){
    player.velocity.x = -player.speed;
  } else {
    player.velocity.x = 0;
    if(keys.right.pressed) {
      scrollOffSet += player.speed;
      platforms.forEach((platform) => platform.position.x -= player.speed)
      genericObjects.forEach(generic => generic.position.x-=player.speed *0.66 )
    }else if(keys.left.pressed && scrollOffSet > 0){
      scrollOffSet -= player.speed;
      platforms.forEach((platform) => platform.position.x += player.speed)
      genericObjects.forEach(generic => generic.position.x+=player.speed *0.66 )
    }
  }

  //detecção de colisão plataforma.
  platforms.forEach((platform) => {
    if(player.position.y + player.height
      <= platform.position.y &&
        player.position.y + player.height +
        player.velocity.y >=platform.position.y &&
        player.position.x + player.width >= platform.position.x &&
        player.position.x <=platform.position.x + platform.width
      ){
      player.velocity.y = 0;
    }
  });
  //sprite switching
  if(
    keys.right.pressed &&
    lastKey === 'right'
    && player.currentSprite !==
    player.sprites.running.right){
    player.frames = 1
    player.currentSprite = player.sprites.running.right
    player.currentCrop = player.sprites.running.cropWidth
    player.width = player.sprites.running.width
  } else if(
    keys.left.pressed &&
    lastKey === 'left'
    && player.currentSprite !==
    player.sprites.running.left){
    player.frames = 1
    player.currentSprite = player.sprites.running.left
    player.currentCrop = player.sprites.running.cropWidth
    player.width = player.sprites.running.width
  } else if(
    !keys.left.pressed &&
    lastKey === 'left'
    && player.currentSprite !==
    player.sprites.stand.left){
    player.frames = 1
    player.currentSprite = player.sprites.stand.left
    player.currentCrop = player.sprites.stand.cropWidth
    player.width = player.sprites.stand.width
  }else if(
    !keys.right.pressed &&
    lastKey === 'right'
    && player.currentSprite !==
    player.sprites.stand.right){
    player.frames = 1
    player.currentSprite = player.sprites.stand.right
    player.currentCrop = player.sprites.stand.cropWidth
    player.width = player.sprites.stand.width
  }
  //win
  if(scrollOffSet>2000){
    console.log('you win')
  }
  //lose
  if(player.position.y >= canvas.height){
    init()
  }
  
}
init();
animate();

window.addEventListener('keydown', ({keyCode}) => {

  switch (keyCode){
    case 65:
      keys.left.pressed = true;
      lastKey = 'left'
      break;
    case 83:
      break;
    case 68:
      keys.right.pressed = true;
      lastKey = 'right'
      break; 
    case 87:
      player.velocity.y = -20;
      keys.up.pressed = true;
      break;       
  }
});

window.addEventListener('keyup', ({keyCode}) => {


  switch (keyCode){
    case 65:
      keys.left.pressed = false;
      break;
    case 83:
      break;
    case 68:
      keys.right.pressed = false;
      break; 
    case 87:
      keys.up.pressed = false;
      break;       
  }
});