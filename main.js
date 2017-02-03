var srcFolder = process.argv[2];
var globPatt = './' + srcFolder + '/**/*_*.xml';

var fs = require("fs");
var glob = require("glob");
var naturalSort = require("javascript-natural-sort");
var checkTibetan = require("./checkTibetan.js");

var checkResults = glob.sync(globPatt)
  .sort(naturalSort)
  .map(checkTibetanSpell);

function checkTibetanSpell(route) {
  var text = fs.readFileSync(route, "utf8");
  var pbs = makePbs(text);

  var results = pbs.map(function(pb) {
    var wrongSpells = checkTibetan.checkSyllables(pb.text);
    if (wrongSpells.length > 0) {
      return {pbId: pb.pbId, wrongSpells: wrongSpells};
    }
  })
  .filter(function(obj) {
    return obj !== undefined;
  });

  return {file: route, pbs: results};
}

function makePbs(text) {
  var delim = "~!@#";
  var pbTexts = text.replace(/(<pb.+?>)/g, delim + "$1")
    .split(delim);

  pbTexts.splice(0, 2, pbTexts[0] + "\n" + pbTexts[1]);

  return pbTexts.map(function(pbText) {
      var pbId = /<pb id="(.+?)"\/>/.exec(pbText)[1];
      return {pbId: pbId, text: text};
    });
}

fs.writeFileSync("./wrongSpells.txt", JSON.Stringify(checkResults, null, '  '), 'utf8');