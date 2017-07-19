/** Terminal.js
* A Linux terminal emulator written in JavaScript
* Supports: Scrolling, AutoTyping, Cursor, and custom input evaluation
* Uses jQuery, might create a version sans jQuery
* terminal should be functional and reactive to input.
* Constructor Parameters:
* AutoTyper: specify an auto typer configuration
* selector: specify the element to be turned into the terminal
* rows: specify number of rows wide terminal will be
* columns: specify the number of columns wide the terminal will be
* Methods: [optional parameters]
* .start([loading strings, callback]) - initialize terminal
* .head(message) - set the head of the message, printed everytime in is called
* .in([message, callback]) - writes to the terminal using the AutoTyper,
    if no message is provided, then it is assumed that the terminal is accepting user IO
* .out(message [, callback ]) - writes to the terminal instantaneously
* .clear([callback]) - clears the terminal
* getInputLog() - returns the input log
* getOutputLog() = returns the output log
*/


function Terminal(properties) {
  //these properties are optional, as such, they can be defined by the user, or it will default to
  obj(properties);
  var head = maybe(str, ">")(properties.head);
  var compiler = maybe(func, function(string, Interactor) {return;})(properties.compiler);
  var delay = maybe(num, 10)(properties.delay);
  // these objects are fixed with respect to the terminal.
  if (!properties.autoTyper) {
    properties.autoTyper = {
      speed: 200,
      momentum: 2,
      accuracy: 0.98
    }
  }
  const autoTyper = new AutoTyper(properties.autoTyper);
  const terminal = new Interactor(str(properties.selector),num(properties.rows),num(properties.columns));
  const cursor = new Cursor(str(properties.selector), 300);

  // Internal state variables
  var inputLog = []; //The log is a permanent record of what is typed, the html can be cleared.
  var outputLog = [];
  // queues that help asynchronously insert code
  var typeQueue = [];
  var outQueue = [];
  var queue = [];  //runs these anonymous functions after the terminal is ready for them
  // state that helps with logic
  var writing = false; //if the terminal or the user is currently typing
  var writable = false; // if the terminal will allow the AutoTyper or user to type
  var readied = false;
  var typable = false; //if the terminal is allowing for the user to type
  //Methods - Notice that the public methods come in pairs

  //initialize terminal
  var start = this.start = function(loadingStrings = undefined, callback = () => {return;}) {
    terminal.format();
    cursor.start();

    if (loadingStrings) {
      loadingStrings.forEach(function(string, index, array) {
        //we can do this because JS supports enclosures.
        out(string, function() {
          //call the callback after all the strings have been loaded
          if ((index + 1 ) === array.length) {
            callback();
          }
        });
      });
    } else {
      callback();
    }
  }
  //delete all relevant terminal data, permanently stop terminal
  var kill = this.kill = function() {
    cursor.kill();
    if (typable) { stop(); }
    terminal.clear();
  }

  this.getInputLog = function() {
    return inputLog;
  }
  this.getOutputLog = function() {
    return outputLog;
  }
  //queue processor
  var process = function() {
    if (queue.length > 0) {
      var busy = queue[0].func(queue[0].callback);
      if (!busy) {
        queue.shift();
        process();
      }
    }
  }
  //IO methods
  var write = function(cb = () => {}) {
    if (outQueue.length > 0) {
      if (!writing && !typable) {
        if(readied) {
          unready();
        }
        //Now we can actually print out to the terminal
        terminal.writeln(outQueue[0]);
        outputLog.push(outQueue[0]);
        outQueue.shift();
        writable = true;
        //we want to process the queue here if we can.
        cb();
      } else {
        return {func: write, callback: cb};
      }
    } else {
      writable = true;
      //we want to process the queue here if we can.
      cb();
    }
  }
  var out = this.out = function(message, callback = () => {}) {
    outQueue.push(message);
    var busy = write(callback); //we know that the write method will return an object if it can't be run.
    if (busy) {
      queue.push(busy);
    } else {
      process();
    }
  }

  var input = function(cb) {
    if (typeQueue.length > 0) {
      if (writable && !writing && !typable) {
        if (!readied) {
          ready();
        }
        writing = true;
        cursor.typing();
        autoTyper.type(typeQueue[0], terminal, function() {
          cursor.idle();
          inputLog.push(typeQueue[0]);
          typeQueue.shift();
          writing = false;
          readied = false; //since we used up the ready from last time.
          cb();
          process();
        });
      } else {
        return {func: input, callback: cb};
      }
    } else {
      cb();
    }
  }
  this.in = function(message = undefined, callback = () => {}) {
    if (message) {
      //Use the autotyper to write the input
      typeQueue.push(message);
      var busy = input(callback);
      if (busy) {
        queue.push(busy);
      } else {
        process();
      }
    } else {
      var busy = listen(callback);
      if (busy) {
        queue.push(busy);
      } else {
        process();
      }
    }
  }
  var listen = function(callback) {           //TODO FINISH FUNCTION TODO TODO TODO
    //make the terminal ready to accept input
      if (writable && !writing && !typable) {
      if (!readied) {
        ready();
      }
      //bind key listeners
      terminal.bind();
      //bind event handlers
      callback();
      } else {
        return {func:listen, callback: callback}
      }

  }
  var stop = function() {

  }

  this.clear = function(callback = function() {}) {
    inputLog = [];
    outputLog = [];
    if (!writing && !typable) {
      terminal.clear();
      process();
    } else {
      queue.push({
        func: function(cb) {
          terminal.clear();
          cb();
        },
        callback: callback
      });;
    }
  }

  // make terminal ready to take input
  var ready = this.ready = function() {
    terminal.write(head);
    if (typable) {
        listen();
    }
    terminal.createBuffer();
    cursor.reset();
    cursor.idle();
    writable = true;
    writing = false;
    readied = true;

  }
  // stop input accepting, and stop terminal from accepting input
  var unready = this.unready = function() {
    if (writable) {
      if (typable){
        stop();
        typable = false;
      }
      terminal.enter();
      terminal.removeBuffer();
      cursor.kill();
      autoTyper.kill(terminal);
    }
    writable = false;
    writing = false;
    readied = false;
  }
  //sets head to new string
  this.head = function(newHead) {
    str(newHead);
    head = newHead;
  }

}


// Lets define the various objects that are going to be interacting to make this terminal happen

/** I don't want my terminal object to affect the html directly,
*  instead, I want it to interface through a html interface
*/
function Interactor(Selector, Rows, Cols) {               // TODO: implement cursor shifting, backspacing, and delete
  const selector = Selector;
  const terminal = $(selector);
  const rows = Rows;
  const columns = Cols;
  // Set all the necesary conditions to set the terminal's properties
  this.format = function() {
    clear();
    terminal.css("height", rows + "em");
    terminal.css("width", columns + "em");
    terminal.css("text-align", "left");
    terminal.css("font-family", "Courier");
    terminal.css("overflow-y", "scroll");
    terminal.css("overflow-x", "hidden");
    terminal.css("line-height", "120%");
    terminal.css("word-wrap","break-word");
  };
  //resets the state of the terminal's html. clears entire element, WARNING: WILL DESTROY CURSOR
  var clear = this.clear = function() {
    terminal.html("");
  };
  //creates new buffer
  this.createBuffer = function() {
    $(selector).append('<span class="buffer"></span>');
  }
  //only call remove buffer if it is the last element in the terminal
  this.removeBuffer = function() {
    var text = $(selector + ' .buffer').text();
    $(selector + ' .buffer').remove();
    $(selector).append(text);
  }
  //inserts on current line, does not create new space
  var write = this.write = function(string) {
    terminal.append(string);
  };
  //inserts on current line, but then returns the output
  this.writeln = function(string) {
    write(string);
    enter();
    scroll();
  };
  //creates a carriage return, the equivalent of hitting enter
  var enter = this.enter = function(string) {
    terminal.append("<br>");
  };
  //inserts string before the cursor
  this.type = function(string) {
    scroll();
    $( selector + ' .cursor').before(string);
  }
  var scroll = this.scroll = function() {
      //keep cursor scrolled to the bottom
      terminal.scrollTop(terminal[0].scrollHeight);
  }

  this.left = function() {

  }
  this.right = function() {

  }
  //deletes the character before the cursor, unless at the begining, in which case it does nothing
  this.backspace = function() {

  }
  // deletes the character at the cursor, and shifts character after it into itself, unless it is the last character, in which case it does nothing
  this.delete = function() {
    console.log($( selector + ' .cursor + *').text());
    if($( selector + ' .cursor + *').text()) {
      console.log("stuff after cursor");
    } else {
      console.log("no stuff after cursor");
    }
  }
  //TODO shift the cursor - left or right
  //handle deletion, create local closure where the html is being set to exactly some string,
  // and as the string is updated, the html is too, (to handle backspacing)

  // in order TODO this, You will need to call the JQuery.text() operation on the current typebuffer<span>
  // also implement a way to create a typebuffer and remove it without removing its contents.
}

/** The cursor object will be a simple way to insert text and make the terminal look more realistic
* all the html insertion will be handled by the Interactor,
 hence why it must be feed to the cursor object
*/
function Cursor(Selector, Delay) {
  this.delay = Delay;
  var typing = false;
  var selector = Selector;
  var animationID;
  var currentState = false;
  var prevState = false;

  function cursor() {
    //Set the state of the cursor
    if (typing) {
      solidState = true;
    } else {
      if (prevState) {
        prevState = solidState;
        solidState = false;
      } else {
        prevState = solidState;
        solidState = true;
      }
    }
    //Change the html state of the cursor
    if (solidState) {
      $(selector + ' .cursor').css('background-color','#FFFFFF');
      $(selector + ' .cursor').css('color','#FF8000');
    } else {
        $(selector + ' .cursor').css('background-color','#FF8000');
        $(selector + ' .cursor').css('color','#FFFFFF');
    }
  }
  this.idle = function() {
    typing = false;
  }
  this.typing = function() {
    typing = true;
  }
  //reset the state of the cursor by first deleting it then re-adding it, purely HTML changes
  this.reset = function() {    //once the cursor is removed
    $(selector +' .cursor').remove();
    $(selector +' .buffer').append('<span class="cursor">&nbsp</span><span>h</span>'); //TODO I ONLY GET OUTPUT IF THERE IS A SPAN TAG AFTER THE ELEMENT
  }
  //pause cursor animation
  this.pause = function() {
    clearInterval(animationID);
  }
  //reset timer the cursor
  this.resume = function() {
    animationID = setInterval(cursor, this.delay);
  }
  this.kill = function() {
    // stop cursor indefinitely
    //remove cursor from selector, then clear interval
    clearInterval(animationID);
    $(selector +' .cursor').remove();
  }
  this.start = function() {
    // initialize cursor, adds cursor object to end of the selector
    var element = $(selector);
    solidState = true;
    //start the animation
    animationID = setInterval(cursor, this.delay);
  }
}

// I am using contracts to restrict the type of the input
const createContract = function(type) {
  if (typeof type === "string") {
    return function(x) {
      if (typeof x === type) {
        return x;  //return original object
      } else {
        throw new TypeError("Expected " + type + ", but recieved " + typeof x);
      }
    }
  } else {
    throw new TypeError("createContract expects a string");
  }
}

const bool = createContract('boolean');
const num = createContract('number');
const obj = createContract('object');
const str = createContract('string');
const func = createContract('function');
const undef = createContract('undefined');

// I know this isn't how maybe works, but it works for my purposes
const maybe = function(contract, other) {
  return function(item) {
    if (item) {
      return contract(item);
    } else {
      return other;
    }
  }
}

function AutoTyper(properties) {                          // TODO introduce Typing errors TODO TODO
  //recieved from the properties of the console
  obj(properties);
  var speed = num(properties.speed);
  var accuracy = num(properties.accuracy);
  var momentum = num(properties.momentum);
  var buffer;
  var AnimationID;

  //basically rolls n continuous dice from 0 to 1. takes the sum to produce a normal distribution
  var norm = function(n) {
    var num = 0;
    for (i = 0; i < n; i++) {
      num += Math.random();
    }
    num /= n;
    return num;
  };

  var generateTime = function() {
    var time = (60000 / speed);
    time = (norm(2)*time*2); //can reduce this number to increase variance
    return time;
  }
  this.kill = function(Interactor) {
    clearInterval(AnimationID);
    Interactor.removeBuffer();
    Interactor.enter();
  }

  this.type = function(string, Interactor, cb) {
    var buffer = string;
    var recursiveExecutuion = function() {
      if(buffer.length > 0) {
        AnimationID = setTimeout(() => {
          Interactor.type(buffer[0]);
          Interactor.delete();
          buffer = buffer.slice(1);
          recursiveExecutuion();
        }, generateTime());
      } else {
        Interactor.removeBuffer();
        Interactor.enter();
        cb();
      }
    }
    recursiveExecutuion();
  };
}

function load(terminal, cb) {
  terminal.clear();
  terminal.out('Loading', function() {
    setTimeout(function() {
      terminal.clear();
      terminal.out('Loading.', function() {
        setTimeout(function() {
          terminal.clear();
          terminal.out('Loading..', function() {
            setTimeout(function() {
              terminal.clear();
              terminal.out('Loading...', function() {
                setTimeout(cb, 200);
              });
            }, 200);
          });
        }, 200);
      });
    }, 200);
  });
}


$(document).ready(() => {
  var terminal = new Terminal({
    head: "<span class='head'>alvareza@biohazard-cafe:~$ </span>",
    columns: 40,
    rows: 30,
    selector:"#term"
  });
  $('#term').removeClass("center");
  $('#term').removeClass("aligned");
  $('#term').removeClass("compact");
  $('#term').css('font-size', '1.5em');

  terminal.start(false, () => {console.log("ready")});
  load(terminal, function() {
    terminal.clear();
    terminal.out("Welcome to Angel's Personal website", function() {
      setTimeout(function() {
        terminal.out("");
        terminal.out("Angel :: (Code a) => Caffeine -> a");
        terminal.in("cat readme.txt");
        terminal.out("");
        terminal.out("This website is organized into several parts:");
        terminal.out("* About Me - Provides an simple bio about my early experiences in programming, and my time at MIT.");
        terminal.out("* Resume - My resume is rendered here in HTML for your viewing convenience. Alternatively, you can download a pdf of it.");
        terminal.out("* Gallery - I have a gallery of projects that I have worked on recently, including this web based terminal emulator.");
        terminal.out("* Blog - I currently do not have a blog, but if I did, I would link to it here.");
        terminal.out("* Contact - Provides a multitide of ways to get in touch with me.");
        terminal.out("");
        terminal.out("You can also play around with this terminal if you'd like, type `man` for a list of help options");
        terminal.out("");
        terminal.head("<span class='head'>guest@biohazard-cafe:~$ </span>")
        terminal.in(false, function(input) {});
      }, 200);
    });
  });
});