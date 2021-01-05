
"use strict";

//*** GLOBLAS ***//
const W = window.innerWidth,
    H = window.innerHeight;
const canvas = document.getElementById("canvas");

const ctx = canvas.getContext("2d");
const background =
    "linear-gradient(to right, rgb(15, 12, 41), rgb(48, 43, 99), rgb(36, 36, 62)) ";
const noOfCurve = 100;
const maxRadius = 5;
const speed = 1;
const gravity = 1;
const friction = 1;

let curveArr;
let miniCurveArr;
let mouse = {
    x: undefined,
    y: undefined,
};
//*** /GLOBLAS ***//

//== SETUP =======================================================//
//mouse event listner
canvas.addEventListener("mousemove", function (e) {
    mouse.x = e.x;
    mouse.y = e.y;
});

// Responsiveness
canvas.addEventListener("resize", function () {
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;

    start();
});
//== /SETUP ======================================================//

//== OBJECTS =====================================================//
// Curve Class
var Curve = function (x, y, r, dx, dy) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.dx = dx;
    this.dy = dy;
};
Curve.prototype.draw = function () {
    ctx.beginPath();
    ctx.moveTo(W, H);
    ctx.quadraticCurveTo(this.x, this.y, this.dx, this.dy);
    ctx.stroke();
    // ctx.fill();
    ctx.shadowBlur = 20;
    ctx.shadowColor = "white";

    ctx.lineWidth = "1";
    ctx.strokeStyle = "#fff";
    ctx.fillStyle = "#ccc";
};
Curve.prototype.update = function () {
    //boundary
    if (this.x - this.r < 0 || this.x + this.r > W) {
        this.dx = -this.dx;
    }
    if (this.y - this.r < 0) {
        this.dy = -this.dy;
    }

    // gravity + boundary
    if (this.y + this.r + this.dy > H) {
        this.dy = -this.dy * friction;
    } else {
        this.dy += gravity;
    }

    // motion
    this.x += this.dx;
    this.y += this.dy;

    //interactivity
    if (
        mouse.x - this.x < 50 &&
        mouse.x - this.x > -50 &&
        mouse.y - this.y < 50 &&
        mouse.y - this.y > -50
    ) {
        this.r++;
        ctx.lineWidth = "0.5";


        if (this.r > 3) {
            this.r = 3;
        }
    } else if (this.r > 2) {
        this.r--;
    }

    ////
    this.draw();
};
//== OBJECTS =====================================================//

//== METHODS =====================================================//
//-----------------------------------------------------------------
function getDistance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}
//-----------------------------------------------------------------

//-----------------------------------------------------------------
function start() {
    canvas.width = W;
    canvas.height = H;

    curveArr = [];
    miniCurveArr = [];
    canvas.style.background = background;
    ctx.lineWidth = "1";
    ctx.strokeStyle = "#FF1EAD";
    ctx.fillStyle = "#000";

    for (var v = 0; v < noOfCurve; v++) {
        var r = Math.random() * maxRadius;
        var x = Math.random() * (W - r * 2) + r;
        var y = Math.random() * (H / 2 - r * 2) + r;
        var dx = (Math.random() - 0.5) * speed;
        var dy = (Math.random() - 0.5) * speed;

        // to prevent spawn overlap
        if (v !== 0) {
            for (var w = 0; w < curveArr.length; w++) {
                if (
                    getDistance(x, y, curveArr[w].x, curveArr[w].y) - r * 2 <
                    0
                ) {
                    var x = Math.random() * (W - r * 2) + r;
                    var y = Math.random() * (H - r * 2) + r;
                    w = -1;
                }
            }
        }

        var c = new Curve(x, y, r, dx, dy);
        curveArr.push(c);
    }

    ////
    update();
}
//-----------------------------------------------------------------

//-----------------------------------------------------------------
function update() {
    requestAnimationFrame(update);
    ctx.clearRect(0, 0, W, H);
    /////
    for (var v = 0; v < curveArr.length; v++) {
        curveArr[v].update();
    }
}
//-----------------------------------------------------------------
//== /METHODS =====================================================//

//***** MAIN */
start();
//***** /MAIN */