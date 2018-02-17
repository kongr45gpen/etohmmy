#!/usr/bin/env node

console.info = require('console-info');
console.warn = require('console-warn');
console.error = require('console-error');
const fs = require('fs');
const commander = require('commander');
require('pretty-error').start();

commander
    .arguments('<file>').action(file => commander.file = file)
    .parse(process.argv);

if (commander.file === undefined) throw new Error("Invalid arguments. Use the --help option to see usage information for this script.");

const contents = fs.readFileSync(commander.file, 'utf8');
// console.log(contents);

let parser = new DOMParser();
let html = parser.parseFromString(contents, "text/html");
console.log(html);
