var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");
var drawOrigin = { x: 0, y: 0 };
var drawScale = 1;
function restrict(l, n, r) {
    if (n <= l)
        return l;
    if (n >= r)
        return r;
    return n;
}
function rnd(minOrMax, max) {
    if (max !== null)
        return Math.floor(Math.random() * (max - minOrMax) + minOrMax);
    return Math.floor(Math.random() * minOrMax);
}
function sum(l, r) {
    return { x: l.x + r.x, y: l.y + r.y };
}
function mul(l, r) {
    return { x: l.x * r, y: l.y * r };
}
function sub(l, r) {
    return { x: l.x - r.x, y: l.y - r.y };
}
function lensq(l) {
    return l.x * l.x + l.y * l.y;
}
function len(l) {
    return Math.sqrt(lensq(l));
}
function div(l, r) {
    return mul(l, 1 / r);
}
var GameObject = /** @class */ (function () {
    function GameObject(x, y) {
        this.pos = { x: 0, y: 0 };
        this.pos.x = x;
        this.pos.y = y;
    }
    return GameObject;
}());
var Circle = /** @class */ (function (_super) {
    __extends(Circle, _super);
    function Circle(x, y, radius, color) {
        var _this = _super.call(this, x, y) || this;
        _this.radius = 1;
        _this.color = "white";
        _this.radius = radius;
        _this.color = color;
        return _this;
    }
    Circle.prototype.draw = function () {
        drawCircle(this.pos.x, this.pos.y, this.radius, this.color);
    };
    return Circle;
}(GameObject));
var Body = /** @class */ (function (_super) {
    __extends(Body, _super);
    function Body(x, y, mass, color, isTarget) {
        if (isTarget === void 0) { isTarget = false; }
        var _this = _super.call(this, x, y, Math.sqrt(mass) * 3, color) || this;
        _this.mass = 1;
        _this.isTarget = false;
        _this.mass = mass;
        _this.isTarget = isTarget;
        return _this;
    }
    Body.prototype.colide = function (r) {
        return len(sub(this.pos, r.pos)) <= this.radius + r.radius;
    };
    return Body;
}(Circle));
var Asteroid = /** @class */ (function () {
    function Asteroid(body) {
        this.body = body;
        this.speed = { x: 0, y: 0 };
    }
    Asteroid.prototype.move = function (planets) {
        var acceleration = { x: 0, y: 0 };
        for (var _i = 0, planets_1 = planets; _i < planets_1.length; _i++) {
            var planet = planets_1[_i];
            var n = sub(planet.pos, this.body.pos);
            var a = mul(div(n, len(n)), this.body.mass * planet.mass / lensq(n));
            acceleration = sum(acceleration, a);
        }
        this.speed = sum(this.speed, acceleration);
        this.body.pos = sum(this.body.pos, this.speed);
    };
    return Asteroid;
}());
function drawCircle(x, y, r, fillStyle) {
    ctx.beginPath();
    ctx.arc((x - drawOrigin.x) * drawScale, (y - drawOrigin.y) * drawScale, r * drawScale, 0, Math.PI * 2, false);
    ctx.fillStyle = fillStyle;
    ctx.fill();
    ctx.closePath();
}
function drawLine(start, end, color) {
    ctx.beginPath();
    start = mul(sub(start, drawOrigin), drawScale);
    end = mul(sub(end, drawOrigin), drawScale);
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
    ctx.strokeStyle = color;
    ctx.fill();
    ctx.closePath();
}
function randomFillStyle() {
    var r = rnd(0, 256);
    var g = rnd(0, 256);
    var b = rnd(0, 256);
    return "rgb(" + r.toString() + "," + g.toString() + "," + b.toString() + ")";
}
var planets = [
    new Body(canvas.width * 2 / 3, canvas.height / 3, 100, "red"),
    new Body(canvas.width / 3, canvas.height * 2 / 3, 100, "red")
];
var asteroid = new Asteroid(new Body(0, 0, 15, "green"));
asteroid.speed = { x: 1, y: 0 };
var asteroidIsSet = false;
var globalAsteroidSetPos = { x: 0, y: 0 };
var maxStartSpeed = 4;
var asteroidIsFired = false;
var frameCounter = 0;
var pathPoints = [];
var pathPointsColor = randomFillStyle();
var scoreText = document.getElementById("score");
var score = 0;
var attemtCounter = -1;
var attemptatstart = -1;
function nextLevel() {
    reset();
    deletePathPoints();
    attemptatstart = attemtCounter;
    var planetsNum = rnd(3, 6);
    planets = [];
    for (var i = 0; i < planetsNum; ++i) {
        planets.push(new Body(rnd(canvas.width / 8, canvas.width * 7 / 8), rnd(canvas.height / 8, canvas.height * 7 / 8), rnd(50, 200), "red"));
        console.log(planets[i]);
    }
    planets.push(new Body(rnd(canvas.width / 8, canvas.width * 7 / 8), rnd(canvas.height / 8, canvas.height / 8), rnd(50, 200), "blue", true));
}
function deletePathPoints() {
    pathPoints = [];
}
function reset() {
    attemtCounter++;
    scoreText.textContent = score.toString() + " / " + attemtCounter.toString();
    asteroidIsSet = false;
    asteroidIsFired = false;
    frameCounter = 0;
    drawOrigin = { x: 0, y: 0 };
    drawScale = 0.99;
    pathPointsColor = randomFillStyle();
    asteroid.body.pos = { x: -asteroid.body.radius, y: -asteroid.body.radius };
}
document.addEventListener("mousemove", mousemoveHandler, false);
document.addEventListener("mousedown", mousedownHandler, false);
document.addEventListener("mouseup", mouseupHandler, false);
document.addEventListener("keydown", keydownHandler, false);
var globalMousePos = { x: 0, y: 0 };
var speedVector = { x: 0, y: 0 };
function mousemoveHandler(e) {
    globalMousePos = { x: e.screenX, y: e.screenY };
    var mousePos = { x: e.screenX - canvas.offsetLeft, y: e.screenX - canvas.offsetTop };
    if (!asteroidIsFired) {
        if (!asteroidIsSet) {
            asteroid.body.pos.x = restrict(asteroid.body.radius, mousePos.x, canvas.width - asteroid.body.radius);
            asteroid.body.pos.y = canvas.height - asteroid.body.radius;
            globalAsteroidSetPos = globalMousePos;
        }
        else {
            speedVector = mul(sub(globalAsteroidSetPos, globalMousePos), 0.05);
            speedVector = div(speedVector, len(speedVector) / Math.min(len(speedVector), maxStartSpeed));
            asteroid.speed = speedVector;
        }
    }
}
function mousedownHandler(e) {
    if (e.button == 0 && !asteroidIsFired) {
        asteroidIsSet = true;
    }
}
function mouseupHandler(e) {
    if (e.button == 0 && !asteroidIsFired) {
        asteroidIsSet = false;
        asteroidIsFired = true;
        frameCounter = 0;
    }
}
function keydownHandler(e) {
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
setInterval(function () {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (frameCounter > 1500 && asteroidIsFired)
        reset();
    if (asteroid.body.pos.x > 3 * canvas.width || asteroid.body.pos.x < -3 * canvas.width)
        reset();
    if (asteroid.body.pos.y > 3 * canvas.height || asteroid.body.pos.y < -3 * canvas.height)
        reset();
    if (asteroidIsFired)
        asteroid.move(planets);
    for (var _i = 0, planets_2 = planets; _i < planets_2.length; _i++) {
        var planet = planets_2[_i];
        planet.draw();
        if (planet.colide(asteroid.body) && asteroidIsFired) {
            if (planet.isTarget) {
                score++;
                scoreText.textContent = score.toString();
                nextLevel();
            }
            else
                reset();
        }
    }
    for (var _a = 0, pathPoints_1 = pathPoints; _a < pathPoints_1.length; _a++) {
        var point = pathPoints_1[_a];
        point.draw();
    }
    drawScale = 0.99;
    drawOrigin = { x: 0, y: 0 };
    if (asteroidIsFired) {
        if (asteroid.body.pos.x > canvas.width)
            drawScale = Math.min(canvas.width / asteroid.body.pos.x, drawScale) * 0.99;
        if (asteroid.body.pos.y > canvas.height)
            drawScale = Math.min(drawScale, canvas.height / asteroid.body.pos.y, drawScale) * 0.99;
        if (asteroid.body.pos.x < 0)
            drawScale = Math.min(canvas.width / (canvas.width - asteroid.body.pos.x), drawScale) * 0.99;
        if (asteroid.body.pos.y < 0) {
            drawScale = Math.min(canvas.height / (canvas.height - asteroid.body.pos.y), drawScale) * 0.99;
        }
        if (asteroid.body.pos.x - 2 * asteroid.body.radius < 0)
            drawOrigin.x = asteroid.body.pos.x - 2 * asteroid.body.radius;
        if (asteroid.body.pos.y - 2 * asteroid.body.radius < 0)
            drawOrigin.y = asteroid.body.pos.y - 2 * asteroid.body.radius;
        if (frameCounter % 7 == 0) {
            pathPoints.push(new Circle(asteroid.body.pos.x, asteroid.body.pos.y, 2, pathPointsColor));
        }
    }
    if (asteroidIsSet) {
        drawLine(asteroid.body.pos, sum(asteroid.body.pos, mul(speedVector, 20)), "green");
    }
    frameCounter++;
    if (attemtCounter - attemptatstart > 1) {
        attemtCounter--;
        nextLevel();
    }
    asteroid.body.draw();
}, 10);
//# sourceMappingURL=game.js.map