
/*
    Base entity class, can be used as a base for other drawable objects, used for drawing and checking basic collisions

    IMPORTANT: Make sure to assign it an img variable after instantiating

    Common way to use it:

    let myObject;
    ...
    myObject = new Entity(x, y);
    myObject.img = myImage;

    ...

    draw(){
        ...
        myObject.render();
    }

  
*/

class Entity{
    constructor(x, y) {
        this.pos = createVector(x, y);
        this.rotation = 0;
        this.img; //Assign this after instantiating
        this.sizeMod = 4; //Size multiplier on top of objSize
        this.removable = false;
        this.scale = createVector(1, 1);
    }

    update(){
//        this.removable = true;
    }

    render() {
        let size = objSize * (this.sizeMod );

        push();
        translate(this.pos.x, this.pos.y);
        rotate(this.rotation);
        scale(this.scale.x, this.scale.y);
        image(this.img, -size / 2, -size / 2, size, size);
        pop();
    }
}

class Ufo extends Entity{
     constructor(x, y) {
        super(x, y);
        this.sizeMod = 3; //Size multiplier on top of objSize
        this.direction = 1;
        this.color;
    }

    update(){
        if(this.direction == 0){
            this.pos.x += (gameSpeed + 1);
        }
        else{
            this.pos.x -= gameSpeed;
        }

        if(this.pos.x < 0 || this.pos.x > width){
            this.removable = true;
        }
    }
}

class Rocket extends Entity{
     constructor(x, y) {
        super(x, y);
        this.sizeMod = 2.5; //Size multiplier on top of objSize
        this.launched = false;
        this.speed = 8;
        this.type = 0;
        this.color;
        //this.scale = createVector(1, 1);
    }

    update(){
        this.pos.y -= this.speed;

        if(this.pos.y <= 10){
            totalLives--;
            if(totalLives < 1){
                if(score > highScore){
                    highScore = score;
                    localStorage.setItem("highscore", score);
                }

                gameStarted = false;
                
            }
            this.removable = true;
        }
    }
}

class Collision extends Entity{
    constructor(x, y) {
        super(x, y);
        this.sizeMod = 8; //Size multiplier on top of objSize
    }

    update(){
        this.removable = true;
    }

}


