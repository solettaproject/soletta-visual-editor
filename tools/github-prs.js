var shelljs = require('shelljs');

var commit1 = process.argv[2];
var commit2 = process.argv[3];

if (!(commit1 && commit2)) {
  console.log();
  console.log('Usage: github-prs.js <commit ID 1> <commit ID 2>');
  console.log('Show PRs merged and their related issues between two commits/tags/branches.');
  console.log('Assumes branch names have the form "<branch>-<issue number>"');
  console.log('e.g. to get PRs between two tags: release-notes.js v0.1 v0.1.1');
  console.log();
  process.exit(1);
}

var prPattern = /Merge pull request (#\d+) from .+-(\d+)/;
var prDescriptionPattern = /    (.+)$/;

// separator for grep's output
var sep = /^--/;

var gitCmd = 'git log ' + commit1 + '..' + commit2 + ' | grep -A2 "Merge pull request"';
var result = shelljs.exec(gitCmd, { silent: true });
var lines = result.output.split('\n');

var notes = [];
var note = '';

var line;
var matches;

for (var i = 0; i < lines.length; i++) {
  line = lines[i];

  // start new note
  if (sep.exec(line)) {
    notes.push(note);
    note = '';
  }
  // non whitespace line
  else {
    matches = prPattern.exec(line);

    if (matches) {
      note = matches[1] + ' [fixes #' + matches[2] + '] ';
    }
    else {
      matches = prDescriptionPattern.exec(line);

      if (matches) {
        note += matches[1];
      }
    }
  }
}

if (note !== '') {
  notes.push(note);
}

console.log(notes.join('\n'));
