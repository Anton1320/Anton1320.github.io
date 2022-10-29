let canvas = <HTMLCanvasElement>document.getElementById("myCanvas");

let ctx = canvas.getContext("2d");

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

class Body extends GameObject {
    mass: number = 1;
    radius: number = 1;
    color: typeof ctx.fillStyle = "white";
    constructor(x: number, y: number, mass: number, color: typeof ctx.fillStyle) {
        super(x, y);
        this.mass = mass;
        this.radius = mass;
        this.color = color;
    }
    draw() {
        drawCircle(this.pos.x, this.pos.y, this.radius, this.color);
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

var planets: Body[] = [
    new Body(canvas.width*2/3, canvas.height/3, 100, "red"),
    new Body(canvas.width/3, canvas.height*2/3, 100, "red")
];
var asteroid = new Asteroid(new Body(0, 0, 10, "green"));
asteroid.speed = {x: 1, y: 0};

setInterval(() => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    asteroid.move(planets);
    for (var planet of planets) {
        planet.draw();
    }
    asteroid.body.draw();
}, 10);