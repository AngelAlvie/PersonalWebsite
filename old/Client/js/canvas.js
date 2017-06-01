/* get context for canvas from the document */

var canvas = document.getElementById('interactiveCanvas'), graphics = canvas.getContext('2d');

/* define mappings for various webs */
/* each mapping has two components to it: a source [0],
/ and a destination [1] when switching from one mapping,
/ the program should do a difference operation on the
/  current map with the map it is switching to */

var ruleConstants = new Object();
ruleConstants.MIND = [[24,17],[24,31],[17,16],[17,18],[16,22],[16,23],[22,23],[30,22],
               [23,17],[23,24],[31,30],[30,23],[31,23],[31,32],[31,39],[32,39],
               [32,26],[18,26],[18,25],[25,26],[25,31],[17,25],[32,25],[25,24]];
ruleConstants.HAND = [];
ruleConstants.NONE = [];
ruleConstants.HEART = [[24,16],[24,18],[24,31],[16,15],[16,9],[18,11],[18,19],[9,15],
                [9,17],[11,19],[11,17],[17,24],[17,16],[17,18],[31,30],[31,32],
                [31,38],[38,30],[38,32],[30,22],[30,23],[32,25],[32,26],[23,31],
                [23,24],[23,16],[22,15],[22,23],[15,23],[25,31],[25,24],[25,18],
                [26,25],[26,19],[19,25]];
ruleConstants.FOOT = [];
ruleConstants.RAND = [];
for (var i = 0; i < 100; i++) {
  ruleConstants.RAND.push([Math.floor(Math.random()*49),Math.floor(Math.random()*49)]);
}
ruleConstants.ALL = [];

/* define all the object constructors */

/* node constructor */
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
  this.update = function() {
  };
  this.display = function(graphics) {
    if (this.isConnected) {
      graphics.beginPath();
      graphics.arc(this.x, this.y, this.size, 0, 2*Math.PI);
      graphics.fill();
    }
  };
}

function connection(fromNode, toNode, duration, direction) {
  this.fromNode = fromNode;
  this.toNode = toNode;
  this.duration = duration;
  this.t = 0;
  this.inAnimation = true;

  this.dx = toNode.x - fromNode.x;
  this.dy = toNode.y - fromNode.y;

  this.x = fromNode.x;
  this.y = fromNode.y;

  this.direction = direction;

  this.getToNode = function() {
    return this.toNode;
  };

  this.getFromNode = function() {
    return this.fromNode;
  };
  this.recalculatePosition = function() {
    this.dx = toNode.x - fromNode.x;
    this.dy = toNode.y - fromNode.y;

    this.x = fromNode.x;
    this.y = fromNode.y;
  };
  this.update = function() {
    if (this.inAnimation) {
      if (this.t <= this.duration && this.t >= 0) {
        this.t += this.direction;
      } else {
        /* runs once as soon as the animation is completed */
        this.inAnimation = false;
        if (this.t >= this.duration) {
          this.toNode.setConnect(true);
        }
      }
    }
  };

  this.setDirection = function(direction) {
    this.direction = direction;
    this.inAnimation = true;
    if (this.t >= this.duration) {
      this.t = this.duration-1;
    } else if (this.t <= 0) {
      this.t = 1;
    }
  };

  this.display = function(graphics) {
    graphics.beginPath();
    graphics.strokeStyle="#444444";
    graphics.moveTo(this.x,this.y);
    graphics.lineTo(this.x+this.dx*this.t/this.duration,this.y+this.dy*this.t/this.duration);
    graphics.stroke();
  }
}

function web(nx,ny, size, scale) {
  this.nx = nx;
  this.ny = ny;
  this.scale = scale;
  this.nodeSize = size;
  this.nodeList = [];
  this.connectionList = [];
  this.marked = [];
  this.form;
  this.forms = ["MIND","HAND","HEART","FOOT","RAND","NONE","ALL"];
  this.rules = [];
  this.gaussian = function() {
    return Math.sqrt(-2*Math.log(Math.random()))*Math.sin(2*Math.PI*Math.random());
  };
  this.gaussianRand = function(sigma, mu) {
    return sigma*this.gaussian() + mu;
  };
  this.compareByRule = function (rule, index) {
    return this.connectionList[index].getFromNode() === this.nodeList[rule[0]]
        && this.connectionList[index].getToNode() === this.nodeList[rule[1]];
  };
  this.connect = function(a, b, duration) {
    this.connectionList.push(new connection(a, b, duration, 1));
  };
  this.disconnect = function(index) {
    this.connectionList.splice(index,1);
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

    for (var i = 0; i < this.connectionList.length; i++) {
      this.connectionList[i].recalculatePosition();
    }

  };
  this.display = function(graphics) {
    for (var i = 0; i < this.nodeList.length; i++) {
      this.nodeList[i].display(graphics);
    }
    for (var i = 0; i < this.connectionList.length; i++) {
      this.connectionList[i].display(graphics);
    }
  };
  /* by far the method with the most bugs */
  this.update = function() {
    /* this part of the code, runs the update routines of each respective object */
    for (var i = 0; i < this.nodeList.length; i++) {
      this.nodeList[i].update();
    }
    for (var i = 0; i < this.connectionList.length; i++) {
      this.connectionList[i].update();
    }
    /* this part of the code checks the timers on all the marked nodes and garbage collects them */
    for (var i = 0; i < this.marked.length; i++) {
      var c = this.marked[i];
      if(c.t <= 0) {
        var index = this.connectionList.indexOf(c);
        this.disconnect(index);
        this.marked.splice(i, 1);
      }
    }

    /*this part of the code processes all the rules. it temporarily creates a new rule
    / if the rule has its fromNode connected, then the rule gets processed then deleted,
    / perhaps I should call the rule upon completion and just add the rule to any nodes
    / that connect to it. */
    for (var i = 0; i < this.rules.length; i++) {
      var rule = this.rules[i];
      if (this.nodeList[rule[0]].isConnected) {
        var existsAlready = false;
        for (var j = 0; j < this.connectionList.length; j++) {
          if (this.compareByRule(rule, j)) {
             existsAlready = true;
           }
        }
        if (existsAlready) {
          this.rules.splice(i,1);
        } else {
          this.connect(this.nodeList[rule[0]], this.nodeList[rule[1]], Math.floor(this.gaussianRand(10,100)));
          this.rules.splice(i,1);
        }
      }
    }
  };

  this.checkNodes = function(connection) {
    if (connection.direction <= -1) {
      /* modify if statement so that node isn't deleted if some connections to it are still present*/
      var toNodeAlreadyConnected = false;
      for(var i = 0; i < this.connectionList.length; i++) {
          if (connection.toNode === this.connectionList[i].fromNode || connection.toNode === this.connectionList[i].toNode && this.connectionList[i].direction >= 1) {
            toNodeAlreadyConnected = true;
            console.log("happened");
          }
      }

      if (!connection.toNode.isStarting && !toNodeAlreadyConnected) {
        connection.toNode.setConnect(false);
      }
    }
  }

  this.shapeTransfrom = function(form) {
    var tmpForm = [];
    if (this.form !== form ) {
      switch(form) {
        case "MIND":
          tmpForm = ruleConstants.MIND;
          break;
        case "HAND":
          tmpForm = ruleConstants.HAND;
          break;
        case "HEART":
          tmpForm = ruleConstants.HEART;
          break;
        case "FOOT":
          tmpForm = ruleConstants.FOOT;
          break;
        case "ALL":
          tmpForm = ruleConstants.ALL;
          break;
        case "RAND":
          tmpForm = ruleConstants.RAND;
          break;
        default:
          tmpForm = ruleConstants.NONE;
      }
    }

    this.rules = tmpForm;
    /* Check if any other connections are connected to that node, if not, then mark node for deletion*/

    console.log(this.rules.length);
    for (var i = 0; i < this.connectionList.length; i++) {
      var markConnection = true;
      for (var j = 0; j < this.rules.length; j++) {
        if (this.compareByRule(this.rules[j],i)) {
          markConnection = false;
        }
      }

      if (markConnection) {
        this.marked.push(this.connectionList[i]);
        this.connectionList[i].setDirection(-1);
        this.checkNodes(this.connectionList[i]);
      } else {
        this.marked.splice(i, 1);
      }
    }

    for (var i = this.rules.length - 1; i >= 0; i--) {
      var rule = this.rules[i];
      var existsAlready = false;
      for (var j = 0; j < this.connectionList.length; j++) {
        if (this.compareByRule(rule, j)) {
           existsAlready = true;
        }
      }
      if (existsAlready) {
        this.rules.splice(i,1);
      }
    }
  };
  /* create nodes, add them to the "nodeList" and give them their proper positions */

  for (var j = 0; j < this.ny; j++) {
    for (var i = 0; i < this.nx; i++) {
      this.nodeList.push(new node(undefined,undefined,this.nodeSize,false));
    }
  }
  this.nodeList[Math.floor(this.nx*this.ny/2)].setStartValue(true);
  this.form = this.forms[5];
  this.shapeTransfrom(this.form);
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
  graphics.fillStyle = "#F7DB09";
  graphics.rect(0,0,canvas.width,canvas.height);
  graphics.fill();
  graphics.fillStyle = "#444444";
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
var t = 0;

/* to fix last problem, try to figure out whats going on in the timer routine of some connection, looks like the timer is frozen*/

/* now finally call the timer routine */
var run = function() {
  if (t % 1500 === 0) {
    render.shapeTransfrom(render.forms[0]);
    console.log("set to a brain");
  } else if (t % 1500 === 500) {
    render.shapeTransfrom(render.forms[2]);
    console.log("Set to heart");
  } else if (t % 1500 === 1000) {
    render.shapeTransfrom(render.forms[4]);
    console.log("set to random");

  }
  render.update();
  draw(canvas);
  t++;
};

var runTime = setInterval(run,10);
