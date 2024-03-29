const screenSize = {x:800, y:600};
var sc = document.getElementById("myCanvas");
var ctx = sc.getContext("2d");
function randomInteger(min, max)
{
    let rand = min + Math.random() * (max + 1 - min);
    return Math.floor(rand);
}

class gameObject
{
    constructor(pos, color, className)
    {
        this.pos = {x:pos[0], y:pos[1]};
        this.className = className;
        this.color = color;
    }    
}

class textObject extends gameObject
{
    constructor(pos, text, color, className)
    {
        super(pos, color, className);
        this.text = text;
    }
    draw()
    {
        ctx.beginPath();
        ctx.font = '15px arial';
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.fillText(this.text, this.pos.x, this.pos.y);
        ctx.closePath();
    }
}

class Item extends gameObject
{
    constructor(pos, size, color, className)
    {
        super(pos, color, className);
        this.size = {x:size[0], y:size[1]};
    }

    colision(Obj)
    {
        if (((-Obj.size.x < Obj.pos.x - this.pos.x) && (Obj.pos.x - this.pos.x < this.size.x)) &&
            ((-Obj.size.y < Obj.pos.y - this.pos.y) && (Obj.pos.y - this.pos.y < this.size.y)))
            return true;
        return false;
    }

    draw()
    {
        ctx.beginPath();
        ctx.rect(this.pos.x, this.pos.y, this.size.x, this.size.y)
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    }
//there was delete fn
}

class Health extends Item
{
    constructor(pos)
    {
        super(pos, [20, 20], "orange", 'health');
    }

    move()
    {
        this.pos.x = randomInteger(0, screenSize.x - this.size.x);
        this.pos.y = randomInteger(0, screenSize.y - this.size.y);
    }
}

class Movable extends Item
{
    constructor(pos, size, speed, color, className)
    {
        super(pos, size, color, className);
        this.speed = speed;
        this.moveArray = {Up:false, Down:false, Left:false, Right:false};
    }

    move()
    {
        if (this.moveArray.Up && this.pos.y > 0) this.pos.y -= this.speed;
        if (this.moveArray.Down && this.pos.y + this.size.y < screenSize.y) this.pos.y += this.speed;
        if (this.moveArray.Left && this.pos.x > 0) this.pos.x -= this.speed;
        if (this.moveArray.Right && this.pos.x + this.size.x < screenSize.x) this.pos.x += this.speed;
    }
}

class Explosion extends Item {
    constructor (pos, startSize) {
        super(pos, startSize, "tomato", "explosion");
        this.expansionSpeed = 5;
    }

    expand() {
        this.size.x += this.expansionSpeed;
        this.size.y += this.expansionSpeed;
        this.pos.x -= this.expansionSpeed/2;
        this.pos.y -= this.expansionSpeed/2;
    }
}

class Player extends Movable
{
    constructor(pos)
    {
        super(pos, [20, 20], 2, "green", 'player');
        this.direction = {Up:false, Down:false, Left:false, Right:false};
        this.hp = 10;
        this.score = 0;
    }
}

class Enemy extends Movable
{
    constructor(pos)
    {
        super(pos, [20, 20], 1, "blue", 'enemy');
        this.liveTime = 10000;
    }

    move(target)
    {
        this.pos.x += 2*((target.pos.x > this.pos.x)-0.5) * this.speed;
        this.pos.y += 2*((target.pos.y > this.pos.y)-0.5) * this.speed;
    }
}

var player = new Player([100, 100]);

var enemys = [new Enemy([800, 600])];

var healths = [new Health([200, 200])];
for (let i = 0; i < 10; ++i){
    healths.push(new Health([200, 200]))
    healths[i].move();
}

var explosions = [];
var maxExplosionSize = 200;

var scoreText = new textObject([5, 15], '0', "black", 'scoreText');

var hpText = new textObject([770, 15], '10', "red", 'hpText')

function reloadGame()
{
    location.href = '';
}

function spawnEnemy()
{
    let a = randomInteger(1, 4);
    var pos = new Array(2);
    switch (a) {
        case 1:
            pos[0] = -20
            pos[1] = randomInteger(0, screenSize.y)
            break;
        case 2:
            pos[1] = screenSize.y+1
            pos[0] = randomInteger(0, screenSize.x)
            break;
        case 3:
            pos[1] = -20
            pos[0] = randomInteger(0, screenSize.x)
            break;
        case 4:
            pos[0] = screenSize.x+1
            pos[1] = randomInteger(0, screenSize.y)
            break;
    }
    enemys.push(new Enemy(pos));
}

document.onkeydown = function(event)
{
    if (event.code == 'ArrowUp')
    {
        player.moveArray.Up = true;
        player.direction = {Up:true, Down:false, Left:false, Right:false};
    }
    if (event.code == 'ArrowDown')
    {
        player.moveArray.Down = true;
        player.direction = {Up:false, Down:true, Left:false, Right:false};
    }
    if (event.code == 'ArrowLeft')
    {
        player.moveArray.Left = true;
        player.direction = {Up:false, Down:false, Left:true, Right:false};
    }
    if (event.code == 'ArrowRight')
    {
        player.moveArray.Right = true;
        player.direction = {Up:false, Down:false, Left:false, Right:true};
    }
}

document.onkeyup = function(event)
{
    if (event.code == 'ArrowUp') player.moveArray.Up = false;
    if (event.code == 'ArrowDown') player.moveArray.Down = false;
    if (event.code == 'ArrowLeft') player.moveArray.Left = false;
    if (event.code == 'ArrowRight') player.moveArray.Right = false;
}

var running = true;
window.onload = function()
{
    var timer = 0;

    var t = setInterval(function()
    {
        timer++;
        for (let enemy of enemys)
        {
            enemy.liveTime -= 1;
        }
        if (timer >= 2000/(1+0.2*player.score))
        {
            spawnEnemy();
            timer = 0;
        }
        ctx.clearRect(0, 0, screenSize.x, screenSize.y);
        if (!running)
        {
            //alert(`Game over\nScore:${player.score}`);
            clearInterval(t);
        }
        for (let health of healths)
        {
            if (health.colision(player))
            {
                explosions.push(new Explosion([health.pos.x, health.pos.y], [health.size.x, health.size.y]))
                health.move()
                player.score+=5;
                player.hp++;
                scoreText.text = player.score;
                
                hpText.text = player.hp;
                
                spawnEnemy();
            }
            health.draw();
        }
        for (let i = 0; i < enemys.length; ++i)
        {
            enemys[i].move(player);
            enemys[i].draw();
            if (enemys[i].colision(player))
            {
                player.hp -= 5;
                let q = enemys[i];
                enemys[i] = enemys[enemys.length-1];
                enemys[enemys.length-1] = q;
                enemys.pop();
                hpText.text = player.hp;
            }
            else if (enemys[i].liveTime <= 0)
            {
                let q = enemys[i];
                enemys[i] = enemys[enemys.length-1];
                enemys[enemys.length-1] = q;
                enemys.pop();
            }
        }
        for (let expl of explosions) {
            for (let i = 0; i < enemys.length; ++i) {
                if (enemys[i].colision(expl)) {
                    enemys[i] = enemys[enemys.length-1];
                    enemys.pop();
                    player.score += 1;
                    player.hp += 1;
                    scoreText.text = player.score;
                }
            }
            expl.expand();
        }

        if (player.hp <= 0) running = false;

        for (let i = 0; i < explosions.length; ++i) {
            if (explosions[i].size.x >= maxExplosionSize) {
                explosions[i] = explosions[explosions.length-1];
                explosions.pop();
            }
            else {
                explosions[i].draw();
            }
        }

        player.move();
        player.draw();
        hpText.draw();
        scoreText.draw();
    }, 0);
};