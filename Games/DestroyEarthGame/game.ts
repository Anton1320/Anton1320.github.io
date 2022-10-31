let canvas = <HTMLCanvasElement>document.getElementById("myCanvas");

let ctx = canvas.getContext("2d");

let drawOrigin = {x: 0, y: 0};
let drawScale = 1;

function restrict(l: number, n: number, r: number): number {
    if (n <= l) return l;
    if (n >= r) return r;
    return n;
}

function rnd(max: number): number;
function rnd(min: number, max: number): number;
function rnd(minOrMax?: number, max?: number): number {
    if (max !== null) return Math.floor(Math.random() * (max - minOrMax) + minOrMax);
    return Math.floor(Math.random() * minOrMax);
  }

type vector = {x: number, y: number};

function sum(l: vector, r: vector): vector {
    return {x: l.x+r.x, y: l.y+r.y};
}
function mul(l: vector, r: number): vector {
    return {x: l.x*r, y: l.y*r};
}
function sub(l: vector, r: vector): vector {
    return {x: l.x-r.x, y: l.y-r.y};
}
function lensq(l: vector): number {
    return l.x*l.x + l.y*l.y;
}
function len(l: vector): number {
    return Math.sqrt(lensq(l));
}
function div(l: vector, r: number): vector {
    return mul(l, 1/r);
}

abstract class GameObject {
    pos: vector = {x: 0, y: 0}
    constructor(x: number, y: number) {
        this.pos.x = x;
        this.pos.y = y;
    }
    abstract draw(): void;
}

class Circle extends GameObject {
    radius: number = 1;
    color: typeof ctx.fillStyle = "white";
    constructor (x: number, y: number, radius: number, color: typeof ctx.fillStyle) {
        super(x, y);
        this.radius = radius
        this.color = color
    }
    draw() {
        drawCircle((this.pos.x-drawOrigin.x)*drawScale, (this.pos.y-drawOrigin.y)*drawScale, this.radius*drawScale, this.color);
    }
}

class Body extends Circle {
    mass: number = 1;
    isTarget = false;
    constructor(x: number, y: number, mass: number, color: typeof ctx.fillStyle, isTarget = false) {
        super(x, y, Math.sqrt(mass)*3, color);
        this.mass = mass;
        this.isTarget = isTarget;
    }
    colide(r: Body) {
        return len(sub(this.pos, r.pos)) <= this.radius + r.radius;
    }
}

class Asteroid {
    body: Body;
    speed: vector;

    constructor(body: Body) {
        this.body = body;
        this.speed = {x: 0, y: 0};
    }
    move(planets: Body[]) {
        let acceleration: vector = {x: 0, y: 0};
        for (var planet of planets) {
            let n = sub(planet.pos, this.body.pos);
            let a = mul(div(n, len(n)), this.body.mass*planet.mass/lensq(n));
            acceleration = sum(acceleration, a);
        }
        this.speed = sum(this.speed, acceleration);
        this.body.pos = sum(this.body.pos, this.speed);
    }
}

function drawCircle(x: number, y: number, r: number, fillStyle: typeof ctx.fillStyle) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2, false);
    ctx.fillStyle = fillStyle;
    ctx.fill();
    ctx.closePath();
}

function drawLine(start: vector, end: vector, color: typeof ctx.fillStyle) {
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke(); 
    ctx.strokeStyle = color;
    ctx.fill();
    ctx.closePath();
}

function randomFillStyle(): typeof ctx.fillStyle {
    let r = rnd(0, 256);
    let g = rnd(0, 256);
    let b = rnd(0, 256);
    return "rgb(" + r.toString() + "," + g.toString() + "," + b.toString() + ")";
}

var planets: Body[] = [
    new Body(canvas.width*2/3, canvas.height/3, 100, "red"),
    new Body(canvas.width/3, canvas.height*2/3, 100, "red")
];
var asteroid = new Asteroid(new Body(0, 0, 15, "green"));
asteroid.speed = {x: 1, y: 0};

var asteroidIsSet = false;
var globalAsteroidSetPos = {x: 0, y: 0};

var asteroidIsFired = false;

var frameCounter = 0;

var pathPoints: Circle[] = []
var pathPointsColor: typeof ctx.fillStyle = randomFillStyle();

let scoreText = document.getElementById("score");
var score = 0;

var attemtCounter = -1;
var attemptatstart = -1;

function nextLevel() {
    reset();
    deletePathPoints();
    attemptatstart = attemtCounter;
    
    let planetsNum = rnd(3, 6);
    planets = []
    for (let i = 0; i < planetsNum; ++i) {
        planets.push(new Body(rnd(canvas.width/8, canvas.width*7/8), rnd(canvas.height/8, canvas.height*7/8), rnd(50, 200), "red"));
        console.log(planets[i])
    }
    planets.push(new Body(rnd(canvas.width/8, canvas.width*7/8), rnd(canvas.height/8, canvas.height/8), rnd(50, 200), "blue", true))
}

function deletePathPoints() {
    pathPoints = []
}

function reset() {
    attemtCounter++;
    scoreText.textContent = score.toString() + " / " + attemtCounter.toString();
    asteroidIsSet = false;
    asteroidIsFired = false;
    frameCounter = 0;
    drawOrigin = {x: 0, y: 0};
    drawScale = 0.99;

    pathPointsColor = randomFillStyle();

    asteroid.body.pos = {x: -asteroid.body.radius, y: -asteroid.body.radius};
}

document.addEventListener("mousemove", mousemoveHandler, false);
document.addEventListener("mousedown", mousedownHandler, false);
document.addEventListener("mouseup", mouseupHandler, false);
document.addEventListener("keydown", keydownHandler, false);
var globalMousePos = {x: 0, y: 0};
function mousemoveHandler(e: MouseEvent) {
    
    globalMousePos = {x: e.screenX, y: e.screenY};
    var mousePos = {x: e.screenX-canvas.offsetLeft, y: e.screenX-canvas.offsetTop};
    if (!asteroidIsFired) {
        if (!asteroidIsSet) {
            asteroid.body.pos.x = restrict(asteroid.body.radius, mousePos.x, canvas.width-asteroid.body.radius);
            asteroid.body.pos.y = canvas.height-asteroid.body.radius;
            globalAsteroidSetPos = globalMousePos;
        }
        else {
            asteroid.speed = mul(sub(globalAsteroidSetPos, globalMousePos), 0.05);
        }
    }
}
function mousedownHandler(e: MouseEvent) {
    if (e.button == 0 && !asteroidIsFired) {
        asteroidIsSet = true;
    }
}
function mouseupHandler(e: MouseEvent) {
    if (e.button == 0 && !asteroidIsFired) {
        asteroidIsSet = false;
        asteroidIsFired = true;
        frameCounter = 0;
    }
}

function keydownHandler(e: KeyboardEvent) {
    if (e.key == "l") {
        nextLevel();
    }
    if (e.key == "r") {
        reset();
    }
    if (e.key == "d") {
        deletePathPoints();
    }
}

nextLevel();
setInterval(() => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (frameCounter > 1000 && asteroidIsFired) reset();
    if (asteroid.body.pos.x >3*canvas.width || asteroid.body.pos.x < -3*canvas.width) reset();
    if (asteroid.body.pos.y >3*canvas.height || asteroid.body.pos.y < -3*canvas.height) reset();
    if (asteroidIsFired) asteroid.move(planets);
    for (var planet of planets) {
        planet.draw();
        if (planet.colide(asteroid.body) && asteroidIsFired) {
            if (planet.isTarget) {
                score++;
                scoreText.textContent = score.toString();
                nextLevel();
            }
            else reset();
        }
    }

    for (let point of pathPoints) {
        point.draw();
    }

    drawScale = 0.99;
    drawOrigin = {x: 0, y: 0};
    if (asteroidIsFired) {
        if (asteroid.body.pos.x > canvas.width) drawScale = Math.min(canvas.width/asteroid.body.pos.x, drawScale)*0.99;
        if (asteroid.body.pos.y > canvas.height) drawScale = Math.min(drawScale, canvas.height/asteroid.body.pos.y, drawScale)*0.99;
        if (asteroid.body.pos.x < 0) drawScale = Math.min(canvas.width/(canvas.width-asteroid.body.pos.x), drawScale)*0.99;
        if (asteroid.body.pos.y < 0){
            drawScale = Math.min(canvas.height/(canvas.height-asteroid.body.pos.y), drawScale)*0.99;
        }
        if (asteroid.body.pos.x-2*asteroid.body.radius < 0) drawOrigin.x = asteroid.body.pos.x-2*asteroid.body.radius;
        if (asteroid.body.pos.y-2*asteroid.body.radius < 0) drawOrigin.y = asteroid.body.pos.y-2*asteroid.body.radius;

        if (frameCounter % 7 == 0) {
            pathPoints.push(new Circle(asteroid.body.pos.x, asteroid.body.pos.y, 2, pathPointsColor));
        }
    }
    if (asteroidIsSet) {
        drawLine(asteroid.body.pos, sum(asteroid.body.pos, sub(globalAsteroidSetPos, globalMousePos)), "green");
    }
    frameCounter++;
    if (attemtCounter - attemptatstart > 1) {
        attemtCounter--;
        nextLevel();
    }

    asteroid.body.draw();
}, 10);