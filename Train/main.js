var sc = document.getElementById("sc");
var ctx = sc.getContext("2d");
const screenSize = [800, 600];
sc.width = screenSize[0];
sc.height = screenSize[1];

ctx.fillStyle = "black";
ctx.font = "bold 20px sans-serif";

var mousePos = {x:0, y:0};

function mouseMoveHandler(e)
{
    e = e || window.event;
    mousePos.x = e.pageX;
    mousePos.y = e.pageY;
}

document.addEventListener('mousemove', mouseMoveHandler)

class Grid
{
    constructor(size, cellSize, pos)
    {
        this.size = {x:size[0]*cellSize[0], y:size[1]*cellSize[1]};
        this.pos = {x:pos[0], y:pos[1]};
        this.cellSize = {x:cellSize[0], y:cellSize[1]};
        this.grid = [{pos:[4, 1],color:"green"}, {pos:[4, 2],color:"green"}, {pos:[4, 3],color:"green"}, {pos:[4, 4],color:"green"},
         {pos:[5, 2],color:"green"}, {pos:[6, 3],color:"green"},
            {pos:[2, 6],color: "red"}, {pos:[3, 5],color:"red"}, {pos:[3, 6],color:"red"}, {pos:[3, 7],color:"red"}, {pos:[4, 5],color:'red'},
             {pos:[4, 7],color:"red"}, {pos:[4, 8],color:"red"}, {pos:[5, 5],color:"red"},
                 {pos:[5, 6],color:"red"}, {pos:[5, 7],color:"red"}, {pos:[6, 6],color:"red"}, {pos:[4, 6],color:"yellow"}];
        this.cellIsOpen = [];
        for (let i = 0; i < this.grid.length; ++i)
        {
            this.cellIsOpen[i] = {pos:this.grid[i].pos, value:false};
        }
    }
    currentCell(ask)// 0 or 1. if 0 then return abnormal coords else return normal
    {
        var
        x = -1,
        y = -1,
        x0 = -1000,
        y0 = -1000,
        mPos = {x:mousePos.x-this.pos.x-8,
                y:mousePos.y-this.pos.y-8};
        for (var i = 0; i < this.size.x; i += this.cellSize.x)
        {
            if (i <= mPos.x && mPos.x <= i+this.cellSize.x)
            {
                x = i/this.cellSize.x+1;
                x0 = i+this.pos.x;
                break;
            }
        }
        for (var i = 0; i < this.size.y; i += this.cellSize.y)
        {
            let j = this.size.y - i,
            j1 = j - this.cellSize.y;
            if (j1 <= mPos.y && mPos.y <= j)
            {
                y0 = i+this.cellSize.y;
                y = y0/this.cellSize.y;
                y0 -= this.pos.y;
                break;
            }
        }
        if (!ask) return [x, y];
        else return [x0, this.size.y - y0];  
    }
    draw()
    {
        ctx.beginPath();
        ctx.lineWidth = 1;
        ctx.strokeStyle = "black";
        ctx.fillStyle = "black";
        ctx.font = "bold 20px sans-serif";
        for (let i = this.pos.x-this.cellSize.x; i < this.pos.x+this.size.x+1; i += this.cellSize.x)
        {
            ctx.moveTo(i, this.pos.y);
            ctx.lineTo(i, this.pos.y+this.size.y+this.cellSize.y);
        }
        
        for (let i = this.pos.y; i < this.pos.y+this.size.y+this.cellSize.y+1; i += this.cellSize.y)
        {
            ctx.moveTo(this.pos.x-this.cellSize.x, i);
            ctx.lineTo(this.pos.x+this.size.x, i);
        }
        ctx.stroke();
        var j = 0;
        for (let i = this.pos.y; i < this.pos.y+this.size.y; i += this.cellSize.y)
        {
            ctx.fillText(this.size.y/this.cellSize.y - j, this.pos.x-this.cellSize.x+5, i+20)
            ++j;
        }
        j = 0;
        for (let i = this.pos.x; i < this.pos.x+this.size.x; i += this.cellSize.x)
        {
            ctx.fillText(j+1, i+5, this.size.y+this.pos.y + 20)
            ++j;
        }
        var xy = this.currentCell(true);
        ctx.fillStyle = "lightgray";
        ctx.fillRect(xy[0]+1, xy[1]+1, this.cellSize.x-2, this.cellSize.y-2);
        for (var i = 0; i < this.grid.length; ++i)
        {
            if (this.cellIsOpen[i].value)
            {
                ctx.fillStyle = this.grid[i].color;
                ctx.fillRect((this.grid[i].pos[0]-1)*this.cellSize.x+this.pos.x+1,
                 this.size.y-this.grid[i].pos[1]*this.cellSize.y+this.pos.y+1,
                  this.cellSize.x-2, this.cellSize.y-2);
            }
        }
    }
    onClick()
    {
        var xy = this.currentCell(false);
        var q = -1;
        for (let i = 0; i < this.grid.length; ++i)
        {
            if (xy[0] == this.cellIsOpen[i].pos[0] && xy[1] == this.cellIsOpen[i].pos[1])
            {
                q = i;
                break;
            }
        }
        if (q != -1) this.cellIsOpen[q].value = true;
    }
}

var running = true;

var grid = new Grid([12, 10], [40, 30], [45, 5]);

ctx.lineWidth = 1;

document.addEventListener('click', function()
{
    grid.onClick();
})

window.onload = function()
{
    var t = setInterval(function()
    {
        if (!running)
        {
            clearInterval(t);
        }
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, screenSize[0], screenSize[1]);
        grid.draw();
        ctx.fillStyle = "black";
        for (let i = 0; i < grid.grid.length; ++i)
        {
            ctx.fillText('(' + grid.grid[i].pos[0] + ', ' + grid.grid[i].pos[1] + ") : " + grid.grid[i].color, grid.pos.x+grid.size.x+20, 20+20*i);
        }

    }, 10)
}