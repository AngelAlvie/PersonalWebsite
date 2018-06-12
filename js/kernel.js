
// NOW TO START WITH THE CODE THAT IS CUSTOM TO MY WEBSITE
// TODO store fakefilesystem using webstorage API, for permanent memory, and use fakefilesystem if exists in storage
var fakefilesystem = {
  "~": {
    "documents": {
      "readme.txt":
        [ "This website is organized into several parts:",
          "* About Me - Provides an simple bio about my early experiences in programming, and my time at MIT.",
          "* Resume - My resume is rendered here in HTML for your viewing convenience. Alternatively, you can download a pdf of it.",
          "* Gallery - I have a gallery of projects that I have worked on recently, including this web based terminal emulator.",
          "* Blog - I currently do not have a blog, but if I did, I would link to it here.",
          "* Contact - Provides a multitide of ways to get in touch with me.",
          "",
          "You can also play around with this terminal if you'd like, type `man` for a list of help options",
          ""
        ]
    }
  }
}

function kernel(terminal) {
  terminal.in(false, function() {
    var input = terminal.getInputLog()[0].trim().split(" ").filter(s => s !== "");
    var output;

    //get flags from input
    var flags = input.filter(s => s.startsWith("-"));
    //get arguments
    var args = input.splice(1).filter(s => !(s.startsWith("-")));
    //IMPLEMENT COMMANDS
    switch(input[0]) {
      case "man":
        output = man(terminal, flags, args);
        break;
      case "cat":
        output = cat(terminal, flags, args);
        break;
      case "ls":
        output = ls(terminal, flags, args);
        break;
      case "cd":
        output = cd(terminal, flags, args);
        break;
      case "echo":
        output = args; //escape quotes
        break;
      case "yes":
        break;
      case "mv":
        break;
      case "cp":
        break;
      case "date":
        break;
      case "cal":
        break;
      case "rm":
        break;
      case "touch":
        break;
      case "mkdir":
        break;
      case "rmdir":
        break;
      case "pwd":
        break;
      case "clear":
        terminal.clear();
        break;
      default:
        output = "Unknown command, type `man` for a list of commands";
    }

    terminal.out(output, function() {
      kernel(terminal);
    });
  });
}

function cat(terminal, flags, args) {
  // look up file
   
}

function man(terminal, flags, args) {
  function format(name, synopsis) {
    terminal.out("<b>NAME</b>");
    terminal.out(name);
    terminal.out("<b>SYNOPSIS</b>");
    terminal.out(synopsis);
    terminal.out("<b>DESCRIPTION</b>");
  }

  args.forEach((arg) => {
    switch (arg) {
      case "man":
        format("man - displays the manual page for each command. ", "man [COMMAND]");
        terminal.out("displays the manual page for each command.");
        terminal.out("type `man` for just a list of commands you can look for");
        break;
      case "cat":
        format("cat - concatenate files and prints to standard output.", "cat [OPTION..] [FILE]")
        terminal.out("concatenate files and prints to standard output");
        terminal.out("");
        terminal.out("-n : number lines");
        break;
      case "ls":
        format("ls - list files in a directory.", "ls [OPTION..] [DIRECTORY]")
        terminal.out("list files in a directory. ");
        terminal.out("");
        terminal.out("with no DIRECTORY, or when DIRECTORY is `-`, will list files in current directory");
        terminal.out("");
        terminal.out("-a : do not ignore entries starting with .");
        terminal.out("-l : use a long listing format");
        break;
      case "cd":
        format("cd - change working directory.", "cd [DIRECTORY]");
        terminal.out("change working directory.");
        break;
      case "echo":
        format("echo - print a line of text", "echo [STRING]");
        terminal.out("print a line of text");
        break;
      case "mv":
        format("mv - move or rename a file from one location to another.", "mv [SOURCE] [DESTINATION]");
        terminal.out("move or rename a file from one location to another.");
        break;
      case "cp":
        format("cp - copy the contents of a file to another file", "cp [SOURCE] [DESTINATION]");
        terminal.out("copy the contents of a file to another file");
        break;
      case "rm":
        format("rm - remove a file from the current directory.", "rm [OPTION..] [FILE]");
        terminal.out("remove a file from the current directory");
        terminal.out("");
        terminal.out("-r : recursively - delete all files in sub directories");
        terminal.out("");
        break;
      case "touch":
        format("touch - create a new file.", "touch [FILENAME]");
        terminal.out("creates a new file.");
        terminal.out("If FILENAME is not specified, file will automatically be named `untitled` ");
        break;
      case "mkdir":
        format("mkdir - make new directoy.", "mkdir [DIRECTORY]");
        terminal.out("creates new directoy.");
        break;
      case "rmdir":
        format("rmdir - remove directoy.", "rmdir [DIRECTORY]");
        terminal.out("removes empty directory.");
        break;
      case "pwd":
        format("pwd - print working directory.", "pwd");
        terminal.out("prints working directory.");
        break;
      case "clear":
        format("clear - clear the terminal", "clear");
        terminal.out("expunge the terminal and terminal logs.");
        break;
      default:
        terminal.out("Unknown command. type `man` for a full list of commands.");
    }
  });
  if (args.length === 0) {
    terminal.out("List of available commands:");
    terminal.out("man");
    terminal.out("cat");
    terminal.out("ls");
    terminal.out("cd");
    terminal.out("echo");
    terminal.out("mv");
    terminal.out("cp");
    terminal.out("rm");
    terminal.out("touch");
    terminal.out("mkdir");
    terminal.out("rmdir");
    terminal.out("pwd");
    terminal.out("clear");
  }
}