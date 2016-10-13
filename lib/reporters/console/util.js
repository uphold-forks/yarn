'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.clearLine = clearLine;
exports.toStartOfLine = toStartOfLine;
exports.writeOnNthLine = writeOnNthLine;
exports.clearNthLine = clearNthLine;


const readline = require('readline');

const CLEAR_WHOLE_LINE = 0;
const CLEAR_RIGHT_OF_CURSOR = 1;

function clearLine(stdout) {
  readline.clearLine(stdout, CLEAR_WHOLE_LINE);
  readline.cursorTo(stdout, 0);
}

function toStartOfLine(stdout) {
  readline.cursorTo(stdout, 0);
}

function writeOnNthLine(stdout, n, msg) {
  if (n == 0) {
    readline.cursorTo(stdout, 0);
    stdout.write(msg);
    readline.clearLine(stdout, CLEAR_RIGHT_OF_CURSOR);
    return;
  }
  readline.cursorTo(stdout, 0);
  readline.moveCursor(stdout, 0, -n);
  stdout.write(msg);
  readline.clearLine(stdout, CLEAR_RIGHT_OF_CURSOR);
  readline.cursorTo(stdout, 0);
  readline.moveCursor(stdout, 0, n);
}

function clearNthLine(stdout, n) {
  if (n == 0) {
    clearLine(stdout);
    return;
  }
  readline.cursorTo(stdout, 0);
  readline.moveCursor(stdout, 0, -n);
  readline.clearLine(stdout, CLEAR_WHOLE_LINE);
  readline.moveCursor(stdout, 0, n);
}