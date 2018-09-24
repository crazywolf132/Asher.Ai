const brain = require(process.cwd() + `/core/functions/latestBrain`);

const Asher = new brain();
Asher.loadNeurons();
Asher.loadAxons();