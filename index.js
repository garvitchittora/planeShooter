document.addEventListener("DOMContentLoaded", () => {  
  document.getElementsByClassName('pause')[0].addEventListener('click', handleGamePause);
  let i;
  myFunction();
  function myFunction() {
    setInterval(function(){ 
      if(i==0){
        i=1;
        var favicon = document.querySelector('link[rel="shortcut icon"]');
        if (!favicon) {
          favicon = document.createElement('link');
          favicon.setAttribute('rel', 'shortcut icon');
          var head = document.querySelector('head');
          head.appendChild(favicon);
        }
        favicon.setAttribute('type', 'image/png');
        favicon.setAttribute('href','images/logo4.png');
        document.getElementById("logo").src = 'images/logo3.png' ;
        document.getElementById("choose_text").style.color = "red" ;
        document.getElementById("heading").style.color = "red" ;
        
      }
      else{
        i=0;
        document.getElementById("logo").src = 'images/logo2.png' ;
        document.getElementById("choose_text").style.color = "white" ;
        document.getElementById("heading").style.color = "white" ;

        var favicon = document.querySelector('link[rel="shortcut icon"]');
        if (!favicon) {
          favicon = document.createElement('link');
          favicon.setAttribute('rel', 'shortcut icon');
          var head = document.querySelector('head');
          head.appendChild(favicon);
        }
        favicon.setAttribute('type', 'image/png');
        favicon.setAttribute('href','images/logo.png');
      }
     }, 500);
  }
});

let Application = PIXI.Application,loader = PIXI.loader,Sprite = PIXI.Sprite,Rectangle = PIXI.Rectangle;

let app = new Application({ 
    width: 800, 
    height: 600,                       
    antialias: true, 
    transparent: false, 
    resolution: 1
  }
);

app.renderer.view.style.display = 'block';
app.renderer.view.style.margin='50px auto 100px';

document.addEventListener('keydown', handleKeyDown);
document.addEventListener('keyup', handleKeyUp);

document.body.appendChild(app.view);

loader
  .add("space", "images/bg2.jpg")
  .add("images/character.json")
  .add("sound","images/bulletsound2.mp3")
  .on("progress", loadProgressHandler)
  .load(setup);
  
function loadProgressHandler(loader, resource) {
  console.log("loading.. "); 
}

let Defenders, PauseContainer;
let space, shooter, defender, bullet; 
let spaceVelocity = 2, shooterMaxVelocity = 10, defendersVelocity=4 ;
let numberOfDefenders = 5, xDefenderOffset = 800;
let healthMessage, scoreText;
let scorebombIncrease=0,flag_level1=0;
const level1 = PIXI.Texture.from('images/defender1.png');
const level2 = PIXI.Texture.from('images/defender2.png');
//for level change
var rad = document.myForm.easy;
var prev = null;
for (let i = 0; i < rad.length; i++) {
    rad[i].addEventListener('change', function() {
        if (this !== prev) {
            prev = this;
        }
        console.log((this.value-'0'))
        defendersVelocity=this.value-'0';
    });
}

let fireDirection = 1;
let points = [];

let textStyle = new PIXI.TextStyle({
  fontFamily: "Futura",
  fontStyle: "italic",
  fontSize: 20,
  fill: "white",
  stroke: 'black',
  strokeThickness: 2,
  fontVariant: "small-caps",
});

let GameOverTextStyle = new PIXI.TextStyle({
  fontFamily: "Futura",
  fontStyle: "italic",
  fontWeight:"bold",
  fontSize: 50,
  fill: "red",
  fontVariant: "small-caps",
});

function setup() {

  space1 = new Sprite(PIXI.loader.resources.space.texture);
  space1.width = 800;
  space1.height = 600;
  app.stage.addChild(space1);

  space2 = new Sprite(PIXI.loader.resources.space.texture);
  space2.width = 800;
  space2.height = 600;
  space2.position.set(800,0);
  app.stage.addChild(space2);

  renderBullet = () => {
    bullet = new PIXI.Graphics();
    bullet.beginFill(0xFFFF00);
    bullet.drawEllipse(0, 0, 10,3.3);
    bullet.beginFill(0xD98C18);
    bullet.drawEllipse(0, 0, 5, 3.3);
    bullet.beginFill(0xD91818);
    bullet.drawEllipse(6, 0, 5, 3.3);
    bullet.endFill();
    bullet.velocity = 10;
    return bullet;
  }

  renderBomb = () => {
    bullet = new PIXI.Graphics();
    bullet.beginFill(0xFFFF00);
    bullet.drawEllipse(0, 0, 50,30);
    bullet.beginFill(0xff8533);   
    bullet.drawEllipse(5, 0, 30, 30);
    bullet.beginFill(0xff751a);   
    bullet.drawEllipse(15, 0, 20, 29);
    bullet.beginFill(0xff1a1a);
    bullet.drawEllipse(30, 0, 20,25);
    bullet.endFill();
    bullet.velocity = 8;
    return bullet;
  }

  Bullets = new PIXI.Container();
  app.stage.addChild(Bullets);

  let characters = PIXI.loader.resources["images/character.json"].textures;

  Defenders = new PIXI.Container();

  

  for (let i = 0; i < numberOfDefenders; i++) {
    defender = new Sprite(characters["defender"]);

    let xPosition = randomInt(xDefenderOffset, 2000);

    let yPosition = randomInt(0, app.stage.height - defender.height);

    defender.id = `defender0${i}`;
    defender.x = xPosition;
    defender.y = yPosition;

    Defenders.addChild(defender);
  }

  app.stage.addChild(Defenders);

  points = [];

  for (let i = 0; i < 25; i++) {
    if(i >= 20) points.push(new PIXI.Point(i, 0));
    else {
      points.push(new PIXI.Point(i, 0));
    }
  }

  shooter = new PIXI.mesh.Rope(characters["shooter"], points);

  app.stage.addChild(shooter);
  shooter.width = characters["shooter"].width;
  shooter.height = characters["shooter"].height;

  shooter.pivot.y -= shooter.height / 2;
  
  shooter.position.set(10, 200);
  shooter.vx = 4;
  shooter.vy = 4;
  shooter.health = 5;
  shooter.score = 0;

  shooter.hitArea = new PIXI.Ellipse(shooter.pivot.x, shooter.pivot.y, shooter.width, shooter.height);

  PauseContainer = new PIXI.Container();
  const background = new PIXI.Graphics();
  background.beginFill('black', 0.5);
  background.drawRect(0, 0, 800, 600);
  background.endFill();
  PauseContainer.addChild(background);

  CircleButton = new PIXI.Graphics();
  CircleButton.beginFill(0xFFFFFF);
  CircleButton.drawCircle(0, 0, 60);
  CircleButton.endFill();
  CircleButton.x = PauseContainer.width/2;
  CircleButton.y = PauseContainer.height/2;

  CircleButtonTextStyle = new PIXI.TextStyle({
    fontFamily: "Arial",
    fontSize: 25,
    fill: "red",
    textTransform: 'uppercase',
    stroke: '#000000',
    strokeThickness: 1.5,
  });
  
  CircleButtonText = new PIXI.Text("START!", CircleButtonTextStyle);
  CircleButtonText.position.set(-45, -15);
  CircleButton.addChild(CircleButtonText);
  PauseContainer.addChild(CircleButton);
  CircleButton.interactive = true;
  CircleButton.buttonMode = true;
  CircleButton.on('pointerdown', handleCircButtonPressed);
  app.stage.addChild(PauseContainer);

  healthText = new PIXI.Text(`Health: ${shooter.health}`, textStyle);
  app.stage.addChild(healthText);
  healthText.position.set(50, 10);

  scoreText = new PIXI.Text(`Score: ${shooter.score}`, textStyle);
  app.stage.addChild(scoreText);
  scoreText.position.set(150, 10);

  bombText = new PIXI.Text(`Bomb: ${bomb}`, textStyle);
  app.stage.addChild(bombText);
  bombText.position.set(250, 10);

  gameOverText = new PIXI.Text('Oops.. Game Over!', GameOverTextStyle);

  app.ticker.add(() => gameLoop());

  state = GamePaused;
}

gameLoop = () => {
  state();
}

function play() {
  handleKeyButtons();

  space1.x -= spaceVelocity;
  space2.x -= spaceVelocity;
  if (space1.x == -800) space1.x = 800;
  if (space2.x == -800) space2.x = 800;

  Bullets.children.forEach(Bullet => {
    Bullet.x += Bullet.velocity;

    if(Bullet.x == 800 + Bullet.width) {
      Bullets.removeChild(Bullet);
    }
  });

    Defenders.children.forEach((Allien, index) => {
    Allien.x -= defendersVelocity + index/1.5;
    if(Allien.x<800){
      Allien.y += .5;
    }
    if(shooter.x + shooter.width >= Allien.x && shooter.y + shooter.height >= Allien.y && 
      shooter.x <= Allien.x + Allien.width && shooter.y <= Allien.y + Allien.height) {
      shooter.health -= 1;
      healthText.text = `Health: ${shooter.health}`;
      Allien.visible = false;
      Allien.x = 810;
      Allien.y = randomInt(0, app.stage.height - Allien.height );
    }

    Bullets.children.forEach(Bullet => {
      if (Bullet.x + Bullet.width >= Allien.x && Bullet.y + Bullet.height >= Allien.y && 
        Bullet.x <= Allien.x + Allien.width && Bullet.y <= Allien.y + Allien.height) {
          Bullets.removeChild(Bullet);
          Allien.alpha -= 0.5;
          //for sound
          const test = PIXI.loader.resources.sound;
          test.data.play();
      }
      bombText.text = `Bomb: ${bomb}`; 
    });

    if (Allien.alpha <= 0) {
      shooter.score += 1;
      scorebombIncrease+=1;
      scoreText.text = `Score: ${shooter.score}`;
      Allien.visible = false;
      Allien.x = 810;
      Allien.y = randomInt(0, app.stage.height - Allien.height );
      if(scorebombIncrease>=10&&shooter.score<50){
        scorebombIncrease-=10;
        bomb+=1;
        const level1_sprite = new PIXI.Sprite(level1);
        level1_sprite.width = 120;
        level1_sprite.height = 120;
        level1_sprite.x =  randomInt(xDefenderOffset, 2000);
        level1_sprite.y = randomInt(0, app.stage.height - defender.height);
        Defenders.addChild(level1_sprite);
        Defenders.removeChild(Allien);
      }
      if(scorebombIncrease>=10&&shooter.score>50){
        scorebombIncrease-=10;
        bomb+=1;
        const level2_sprite = new PIXI.Sprite(level2);
        level2_sprite.width = 120;
        level2_sprite.height = 90;
        level2_sprite.x =  randomInt(xDefenderOffset, 2000);
        level2_sprite.y = randomInt(0, app.stage.height - defender.height);
        Defenders.addChild(level2_sprite);
        Defenders.removeChild(Allien);
      }
    }

    if (Allien.x <= -90) {
      Allien.x = 800;
      Allien.y = randomInt(0, app.stage.height - Allien.height );
    }
    
    if (Allien.x >= 800) {
      Allien.visible = true;
      Allien.alpha = 1;
    }
  });

  if (shooter.health <= 0) {
    shooter.health = 0; 
    state = GameOver;
  }

  for (let i = 0; i < 5; i++) {
    if(points[4].x <= 2.4) fireDirection = 1;
    else if (points[4].x >= 3.6) fireDirection = -1;

    if (fireDirection == 1) points[i].x += 0.4;
    else if (fireDirection == -1) points[i].x -= 0.4;
  }
}

function GameOver() {
  app.ticker.remove();
  app.stage.addChild(gameOverText);
  gameOverText.position.set(400 - gameOverText.width/2, 250);
}

function GamePaused() {
  app.ticker.stop();
  PauseContainer.visible = true;
}

function handleGamePause(e) {
  if (e) e.target.blur();
  if(app.ticker.started) {
    if (e) e.target.textContent = 'START';
    app.ticker.stop();
  } else {
    if (e) e.target.textContent = 'PAUSE';
    app.ticker.start();
  }
};
 
function handleCircButtonPressed(e) {
  e.target.scale.set(1.2, 1.2);
  state = play;
  app.ticker.start();
  PauseContainer.visible = false;
}

let currentlyPressedKeys = {};
let bomb =5;
function handleKeyDown(e) {
    currentlyPressedKeys[e.keyCode] = true;

    if (e.keyCode == 32) {
      e.preventDefault();
      Bullets.addChild(renderBullet());
      bullet.x = shooter.x + shooter.width;
      bullet.y = shooter.y + 4*shooter.height/5;
    } else if (e.keyCode == 80) {
      e.preventDefault();
      handleGamePause();
    }else if (e.keyCode == 66) {
      if(bomb>0){
        e.preventDefault();
        Bullets.addChild(renderBomb());
        bullet.x = shooter.x + shooter.width;
        bullet.y = shooter.y + shooter.height/2;
        bomb=bomb-1;
      }
    }
}

function handleKeyUp(event) {
    currentlyPressedKeys[event.keyCode] = false;
}

function handleKeyButtons() {
    if (currentlyPressedKeys[74]) {
        // J
        if(shooter.vx >= 0.2) shooter.vx -= 0.1;
    }
    if (currentlyPressedKeys[76]) {
        // L
        if(shooter.vx <= shooterMaxVelocity) shooter.vx += 0.1;
    }
    if (currentlyPressedKeys[73]) {
        // I
        if(shooter.vy <= shooterMaxVelocity) shooter.vy += 0.1;
    }
    if (currentlyPressedKeys[75]) {
        // K
        if(shooter.vy >= 0.2) shooter.vy -= 0.1;
    }

    if (currentlyPressedKeys[87]) {
        // "W"
        shooter.y -= shooter.vy;
        if(shooter.y <= 0) shooter.y = 0;
    } 

    if (currentlyPressedKeys[83]) {
        // "S"
        shooter.y += shooter.vy;
        if(shooter.y >= 600-shooter.height) shooter.y = 600-shooter.height;
    } 

    if (currentlyPressedKeys[65]) {
        // "A"            
        shooter.x -= shooter.vx;
        if(shooter.x <= 0) shooter.x = 0;
    } 

    if (currentlyPressedKeys[68]) {
        // "D"            
        shooter.x += shooter.vx;
        if(shooter.x >= 800-shooter.width) shooter.x = 800-shooter.width;
    }
}

randomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
