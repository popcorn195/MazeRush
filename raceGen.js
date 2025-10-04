import * as prim from './prim.js';
import * as recdiv from './recdiv.js';
import * as dfs from './dfs.js';
import * as eller from './eller.js';
import * as kruskal from './kruskal.js';

let racing = false;
const abortControllers = [];

document.getElementById('startRace').addEventListener('click', async () => {
  if (racing) return;
  racing = true;
  document.getElementById('startRace').disabled = true;

  try {
    const algoSelects = document.querySelectorAll('.gen-algo');
    const [algo1, algo2] = [algoSelects[0].value, algoSelects[1].value];
    const [time1, time2] = await Promise.all([
      runGeneration(algo1, 1),
      runGeneration(algo2, 2)
    ]);
    showRaceResult(time1, time2, 'Generation');
  } catch (error) {
    handleRaceError(error);
  }

  document.getElementById('startRace').disabled = false;
  racing = false;
});

async function runGeneration(algo, instanceNum) {
  const containerId = `canvas-container-${instanceNum}`;
  const container = document.getElementById(containerId);
  container.innerHTML = '';

  return new Promise((resolve) => {
    const p5Instance = new p5((p) => {
      let startTime;
      let currentAlgo;

      p.setup = () => {
        currentAlgo = getMazeAlgorithm(algo);
        currentAlgo.generateMaze(p, 400, 400, containerId);
        startTime = performance.now();
      };

      p.draw = () => {
        currentAlgo.mazeDraw(p);
        if (currentAlgo.isComplete?.()) {
          const endTime = performance.now();
          p.noLoop();
          resolve((endTime - startTime) / 1000);
        }
      };
    }, container);

    abortControllers.push(() => {
      p5Instance.remove();
      container.innerHTML = '';
    });
  });
}

function getMazeAlgorithm(algo) {
  switch(algo) {
    case 'prim': return prim;
    case 'eller': return eller;
    case 'kruskal': return kruskal;
    case 'recdiv': return recdiv;
    default: return dfs;
  }
}

function showRaceResult(time1, time2, type) {
  //Same as before
  const resultDiv = document.getElementById('raceResult');
  resultDiv.innerHTML = `
    <h3>${type} Race Results</h3>
    <div class="${time1 < time2 ? 'winner' : 'loser'}">
      Participant 1: ${time1.toFixed(2)}s
    </div>
    <div class="${time2 < time1 ? 'winner' : 'loser'}">
      Participant 2: ${time2.toFixed(2)}s
    </div>
    <h4>Winner: ${time1 < time2 ? 'Participant 1' : 'Participant 2'}</h4>
  `;
}

function handleRaceError(error) {
  //---
}

window.addEventListener('beforeunload', () => {
  abortControllers.forEach(abort => abort());
});