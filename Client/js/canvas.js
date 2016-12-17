/* get context for canvas from the document */
var canvas = document.getElementById('interactiveCanvas'), graphics = canvas.getContext('2d');
/* define all the object constructors */
function node(x, y, size, isStarting) {
  this.x = x;
  this.y = y;
  this.size = size;
  this.isStarting = isStarting;
  if (this.isStarting) {
			this.isConnected = true;
	} else {
			this.isConnected = false;
	}
  this.setStartValue = function(b) {
	   this.isConnected = b;
	    this.isStarting = b;
  };
  this.setConnect = function(b) {
    this.isConnected = b;
  };
  this.display = function(graphics) {
    if (this.isConnected) {
      graphics.beginPath();
      graphics.arc(this.x, this.y, this.size, 0, 2*Math.PI);
      graphics.fill();
    }
  };
}

function web(nx,ny, size, scale) {
  this.nx = 7;
  this.ny = 7;
  this.scale = 0.75;
  this.nodeSize = 3;
  this.nodeList = [];
  this.connectionList = [];
  this.marked = [];
  this.gaussian = function() {
    return Math.sqrt(-2*Math.log(Math.random()))*Math.sin(2*Math.PI*Math.random());
  };
  this.gaussianRand = function(sigma, mu) {
    return sigma*gaussian() + mu;
  };
  this.resizeNodes = function() {
    var width = parseInt(canvas.width), height = parseInt(canvas.height);

    if (width > height) {
      var deltax = height/this.nx*this.scale;
      var deltay = height/this.ny*this.scale;
    } else {
      var deltax = width/this.nx*this.scale;
      var deltay = width/this.ny*this.scale;
    }

    var x = width/2 - deltax*this.nx/2, y = height/2 -deltay*this.ny/2;

    for (var j = 0; j < this.ny; j++) {
      for (var i = 0; i < this.nx; i++) {
        this.nodeList[j*nx + i].x = x + i*deltax;
        this.nodeList[j*nx + i].y = y + j*deltay;
      }
    }
  };
  this.display = function(graphics) {
    for (var i = 0; i < this.ny*this.nx; i++) {
      this.nodeList[i].display(graphics);
    }
  };

  for (var j = 0; j < this.ny; j++) {
    for (var i = 0; i < this.nx; i++) {
      this.nodeList.push(new node(undefined,undefined,this.nodeSize,true));
    }
  }
  this.nodeList[Math.round(this.nx*this.ny/2)].setStartValue(true);
  this.resizeNodes();
}
/* define global instance variables */
var render = new web(7,7,3,0.75);
/* define all the necesary functions */
function fitToContainer(canvas){
  canvas.style.width='100%';
  canvas.style.height='100%';
  canvas.width  = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
}
function draw(canvas) {
  render.display(graphics);
}
/* first time initialiation */
fitToContainer(canvas);
render.resizeNodes();
draw(canvas);
/* run each time window resized*/
$( window ).resize(function() {
fitToContainer(canvas);
render.resizeNodes();
draw(canvas);
});
