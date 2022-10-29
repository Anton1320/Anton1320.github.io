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
var Body = /** @class */ (function (_super) {
    __extends(Body, _super);
    function Body(x, y, mass, color) {
        var _this = _super.call(this, x, y) || this;
        _this.mass = 1;
        _this.radius = 1;
        _this.color = "white";
        _this.mass = mass;
        _this.radius = mass / 4;
        _this.color = color;
        return _this;
    }
    Body.prototype.draw = function () {
        drawCircle(this.pos.x, this.pos.y, this.radius, this.color);
    };
    Body.prototype.colide = function (r) {
        return len(sub(this.pos, r.pos)) <= this.radius + r.radius;
    };
    return Body;
}(GameObject));
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
    ctx.arc(x, y, r, 0, Math.PI * 2, false);
    ctx.fillStyle = fillStyle;
    ctx.fill();
    ctx.closePath();
}
var planets = [
    new Body(canvas.width * 2 / 3, canvas.height / 3, 100, "red"),
    new Body(canvas.width / 3, canvas.height * 2 / 3, 100, "red")
];
var asteroid = new Asteroid(new Body(0, 0, 30, "green"));
asteroid.speed = { x: 1, y: 0 };
var asteroidIsSet = false;
var asteroidIsFired = false;
function reset() {
    asteroidIsSet = false;
    asteroidIsFired = false;
}
document.addEventListener("mousemove", mousemoveHandler, false);
document.addEventListener("mousedown", mousedownHandler, false);
document.addEventListener("mouseup", mouseupHandler, false);
function mousemoveHandler(e) {
    var mousePos = { x: e.offsetX, y: e.offsetY };
    if (!asteroidIsFired) {
        if (!asteroidIsSet) {
            asteroid.body.pos = mousePos;
        }
        else {
            asteroid.speed = mul(sub(asteroid.body.pos, mousePos), 0.05);
        }
    }
}
function mousedownHandler(e) {
    if (e.button == 0 && !asteroidIsFired) {
        asteroidIsSet = true;
    }
    if (e.button == 2) {
        reset();
    }
}
function mouseupHandler(e) {
    if (e.button == 0 && !asteroidIsFired) {
        asteroidIsSet = false;
        asteroidIsFired = true;
    }
}
setInterval(function () {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (asteroidIsFired)
        asteroid.move(planets);
    for (var _i = 0, planets_2 = planets; _i < planets_2.length; _i++) {
        var planet = planets_2[_i];
        planet.draw();
        if (planet.colide(asteroid.body)) {
            reset();
        }
    }
    asteroid.body.draw();
}, 10);
//# sourceMappingURL=game.js.map