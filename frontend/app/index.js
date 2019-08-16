let img;
let button;
let sounds; // sounds

let myFont; //The font we'll use throughout the app

let gameOver = false; //If it's true the game will render the main menu
let gameBeginning = false; //Should be true only before the user starts the game for the first time

let counter = 0;

//===Buttons
let playButton;
let soundButton;


//Declare game objects here like player, enemies etc
let player;
let enemy;

let explode = null;

let enemyWeapons = [];
let weapons = [];

let collectibles = [];
let explosions = [];


let width;
let height;

let score = 0;
let highScore = 0;
let totalLives = 10;

//===images
//let imgLife;
let imgBackground;
let imgPlayer;
let imgExplosion;
let imgCollectible = [];
let imgShield;
let imgEnemy = [];
let imgFloor;
let imgFish = [];
let imgWeapon;
let imgWeapon2;

let weaponImgs = [];
let ufoImgs = [];

let currentUfoIndex = 0;
let currentRocketIndex = 0;

let allUfos = [];

//===Size stuff
let objSize; //base size modifier of all objects, calculated based on screen size

//game size in tiles, using bigger numbers will decrease individual object sizes but allow more objects to fit the screen
//Keep in mind that if you change this, you might need to change text sizes as well
let gameSize = 22;
let gameWidth;

//Coordinates of left and right sides of the game view
let leftX, rightX;

let isMobile = false;
let touching = false; //Whether the user is currently touching/clicking

let playerY;
let gravity = 0.1;

let gameSpeed = 6;
let ufoDirection = 1;

let ufoYPositions = [50, 100, 150];
let yPosIndex = 0;

let rocketSelection = 0;
let rocketCreated =  false;

let currentRocket = null;
let gameStarted = false;

let ufoMode = 0;
let rocketSpeeds = [12, 15, 18];
let colors = ["black", "blue", "orange"];

//Variable : to track if user has not launched any rocket toward the UFO  
let tenUfoPassed = 0;

//Variable : total UFO and rockets configuration
let totalUfoTypes = 3;

function preload() {

    // setup sounds
    soundFormats('mp3', 'ogg');
    sounds = {
        backgroundMusic: loadSound(Koji.config.sounds.backgroundMusic)
    };

    //===Load font from google fonts link provided in game settings
    var link = document.createElement('link');
    link.href = Koji.config.strings.fontFamily;
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    myFont = getFontFamily(Koji.config.strings.fontFamily);
    let newStr = myFont.replace("+", " ");
    myFont = newStr;
    //===

}

function setup() {

    width = window.innerWidth;
    height = window.innerHeight;

    let sizeModifier = 0.85;
    if (height > width) {
        sizeModifier = 1;
    }


    //Canva :  make a full screen canvas
    createCanvas(width, height);

    //Magically determine basic object size depending on size of the screen
   objSize = floor(min(floor(width / gameSize), floor(height / gameSize)) * sizeModifier);

   isMobile = detectMobile();

    //===Get high score data from local storage
    if (localStorage.getItem("highscore")) {
        highScore = localStorage.getItem("highscore");
    }

    loadImages();
    initialize();

   //Image : img = loadImage(Koji.config.images.enemy); // Load the image
    imgBackground = loadImage(Koji.config.images.background);
}


function loadImages(){
    //Images : Load images for Weapons/rockets
    weaponImgs.push(loadImage(Koji.config.images.weapon));
    weaponImgs.push(loadImage(Koji.config.images.weapon2));
    weaponImgs.push(loadImage(Koji.config.images.weapon3));
    
    //Images : Load images for UFOs
    ufoImgs.push(loadImage(Koji.config.images.fish1));
    ufoImgs.push(loadImage(Koji.config.images.fish2));    
    ufoImgs.push(loadImage(Koji.config.images.fish3));    

    //Images : Load image for explosion
    imgExplosion = loadImage(Koji.config.images.explode);
}

function initialize(){
    //Initialize the play button for the first time 
    playButton = new PlayButton();
    explode = new Collision();
}

function createUfo(cnt){

    //Added conditions to create UFO
    //Added limit to 2 : only 2 UFO will fly at a time for now
    
    if(allUfos.length < totalUfoTypes){
        let rand = Math.floor(Math.random() * totalUfoTypes);
        let x;
        let y;
        let dir;

        x = (rand > 1 ? 1 : rand) * (width - 10);
        dir = rand;        
        y = ufoYPositions[dir];
        
        let newUfo = new Ufo(x , y);
        newUfo.img =  ufoImgs[dir];
        newUfo.direction = dir;
        newUfo.color = colors[dir];
        newUfo.render();
        allUfos.push(newUfo);
        tenUfoPassed++;
    }
    else{
        //If 2 UFOs already flying
        let ufoLength = allUfos.length;
        let latestUfo = [];
        for(let j = 0 ; j < ufoLength; j++){
            if(allUfos[j].removable == true){
                currentUfoIndex--;
            }
            else{
                allUfos[j].update();
                allUfos[j].render();
                latestUfo.push(allUfos[j]);
            }
        }
        allUfos = latestUfo;
    }
}

function createRocket(){
    //Create new rocket and initialize to its base position
    currentRocket = new Rocket(width/ 2, height - 85);
    currentRocket.img =  weaponImgs[currentRocketIndex];
    currentRocket.type = currentRocketIndex;
    currentRocket.color = colors[currentRocketIndex];
    currentRocket.render();
}

function createExplode(x, y, scoreToAdd){
    //Create explosion object when there is a collision and make it visible for some time
    explode = new Collision(x, y);
    explode.img =  imgExplosion;
    explode.render();
    tenUfoPassed = 0;
    score += scoreToAdd;

    setTimeout(function(){
        explode.update();
        explode = null;
    },1000);
}



function keyReleased() {
    //Left and right arrow : to change the rocket type
    if (keyCode == LEFT_ARROW) {
        if(!currentRocket.launched){
            if(currentRocketIndex > 0){
                currentRocketIndex--;
            }

            currentRocket.img = weaponImgs[currentRocketIndex];
        }
    }

    if (keyCode == RIGHT_ARROW) {
        if(!currentRocket.launched){
      
            if(currentRocketIndex < totalUfoTypes - 1){
                currentRocketIndex++;
            }
            currentRocket.img = weaponImgs[currentRocketIndex];
        }
    }
    currentRocket.speed = rocketSpeeds[currentRocketIndex];

    //UP : to launch the rocket
    if (keyCode == UP_ARROW) {
        currentRocket.launched = true;
    }
}

function init() {
    //Reset all the values to initial state
    gameOver = false;

    score = 0;
    totalLives = 10;
    tenUfoPassed = 0;

    gameStarted = true;
    gameBeginning = true;
}

function isCollision(){
    //Usin y position codition with half of height : because it will increase the performance by not checking the rocket with UFO for every y position
    //As we already know that the UFos are flying max at around 175 
    if(currentRocket && currentRocket.pos.y < (height - 2)){
        let ufoCount = allUfos.length;
        for(let i= 0 ; i < ufoCount; i++){
            let min = (width / 2) - 25;
            let max = (width / 2) + 25;

            let minY = allUfos[i].pos.y ;
            let maxY = allUfos[i].pos.y + 35;
            
            //Checking if x position is near by
            if(allUfos[i].pos.x > min && allUfos[i].pos.x < max ){
                
                //Checking if y position is near by
                if(currentRocket.pos.y > minY && currentRocket.pos.y < maxY){
                    let scoreToAdd = 1;
                    //Condition to check if UFO and rocket are of same color to give more score
                    //totalLives = 
                    if(currentRocket.color == allUfos[i].color){
                        scoreToAdd = 5;
                    }
                    currentRocket.removable = true;
                    allUfos[i].removable = true;
                    createExplode(currentRocket.pos.x, currentRocket.pos.y, scoreToAdd);
                    return true;

                }
            }
        }
    }
    return false;
} 

function draw() {
    // set the background color from the configuration options
    //  background(Koji.config.colors.backgroundColor);
    if (imgBackground) {
        background(imgBackground);
    } else {
        background(Koji.config.colors.backgroundColor);
    }

    counter++;

    //For the first time
    if(!gameBeginning){
         textSize(30);
        fill(Koji.config.colors.textColor);
        textAlign(CENTER);

        // print out our text
        text(Koji.config.strings.content, window.innerWidth / 2, 100);


         // format our text
        textSize(15);
        fill(Koji.config.colors.textColor);
        textAlign(CENTER);

        // print out our text
        text(Koji.config.strings.gameTagLine, window.innerWidth / 2, 125);


        // format our text
        textSize(20);
        fill(Koji.config.colors.textColor);
        textAlign(CENTER);

        // print out our text
        if(highScore){
            text(Koji.config.strings.highScoreLabel + ": " + highScore, width / 2, height  - 30);        
        }

        // format our text
        textSize(16);
        fill(Koji.config.colors.playButtonHoverColor);
        textAlign(CENTER);

        // print out our text
        text(Koji.config.strings.instr1, window.innerWidth / 2, height / 2 - 125);

                // format our text
        textSize(16);
        fill(Koji.config.colors.playButtonHoverColor);
        textAlign(CENTER);

        // print out our text
        text(Koji.config.strings.instr2, window.innerWidth / 2, height / 2 - 88);

                // format our text
        textSize(16);
        fill(Koji.config.colors.playButtonHoverColor);
        textAlign(CENTER);

        // print out our text
        text(Koji.config.strings.instr3, window.innerWidth / 2, height / 2 - 40);
// \n

        textSize(16);
        fill(Koji.config.colors.playButtonHoverColor);
        textAlign(CENTER);

        // print out our text
        text(Koji.config.strings.instr4, window.innerWidth / 2, height / 2 + 10);
        // play our background music
        if (!sounds.backgroundMusic.isPlaying()) {
            sounds.backgroundMusic.play();
        }
        playButton.update();
        playButton.btn.draw();
    }
    else if(!gameStarted){ //If game over

        if (localStorage.getItem("highscore")) {
            highScore = localStorage.getItem("highscore");
        }
        // format our text
        textSize(30);
        fill(Koji.config.colors.textColor);
        textAlign(CENTER);

        // print out our text
        text(Koji.config.strings.content, window.innerWidth / 2, 100);


         // format our text
        textSize(15);
        fill(Koji.config.colors.textColor);
        textAlign(CENTER);

        // print out our text
        text(Koji.config.strings.gameTagLine, window.innerWidth / 2, 125);

        // format our text
        textSize(30);
        fill(Koji.config.colors.playButtonColor);
        textAlign(CENTER);

        // print out our text
        text(Koji.config.strings.gameOverText, window.innerWidth / 2, height / 2 - 100);

        // format our text
        textSize(18);
        fill(Koji.config.colors.playButtonColor);
        textAlign(CENTER);

        // print out our text
        text(Koji.config.strings.yourScoreLabel +": " + score, window.innerWidth / 2, height / 2 - 70);

        // format our text
        textSize(20);
        fill(Koji.config.colors.textColor);
        textAlign(CENTER);

        // print out our text
        text(Koji.config.strings.highScoreLabel +": "  + highScore, width / 2, height  - 30);

        // play our background music
        if (!sounds.backgroundMusic.isPlaying()) {
            //sounds.backgroundMusic.play();
        }
        playButton.update();
        playButton.btn.draw();

    }else{//Game started

        if(tenUfoPassed == 10){
            totalLives--;
            if(totalLives < 1){
                gameStarted = false;
            }
            tenUfoPassed = 0;
        }

        // format our text
        textSize(20);
        fill(Koji.config.colors.textColor);
        textAlign(CENTER);

        // print out our text
        text(Koji.config.strings.scoreLabel +": "  + score, width - 50, height - 15);

        // format our text
        textSize(20);
        fill(Koji.config.colors.textColor);
        textAlign(CENTER);

        // print out our text
        text(Koji.config.strings.livesLabel +": "  + totalLives, 50, height - 15);

                // format our text
        textSize(20);
        fill(Koji.config.colors.textColor);
        textAlign(CENTER);

        // print out our text
       // text("img "  +  JSON.stringify(currentRocket.color), 50, height - 15);


        createUfo(counter);
        if(!currentRocket){
            createRocket();
        }
        else{
            if(currentRocket.removable ==  true){
                currentRocket = null;
            }
            else{
                //Checking if rocket launched
                if(currentRocket.launched){
                    if(!isCollision()){
                        currentRocket.update();
                        currentRocket.render();
                    }             
                }
                else{
                    currentRocket.render();
                }
            }
        }
    }

}
