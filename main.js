import * as prim from './prim.js';
import * as recdiv from './recdiv.js';
import * as dfs from './dfs.js';
import * as eller from './eller.js';
import * as kruskal from './kruskal.js';
import { universalBFS } from './universalBFS.js';
import { universalDijkstra } from './universalDijkstra.js';
import { universalAStar } from './universalAStar.js';
import { universalGreedyBFS } from './universalGreedyBFS.js';
import { universalWallFollower } from './universalWallFollower.js';
import { universalDFS } from './universalDFS.js';
import { universalDeadEndFilling } from './universalDeadEndFilling.js';
import { clearSolverState } from './pathUtils.js';
import { handlePause, getSpeed, isPausedRef, animationSpeedRef } from './pauseControl.js';


let p5Instance;
let currentAlgo = null;
let solverAbortController = { abort: false };


const algoSelect = document.getElementById('algoSelect');

document.getElementById("generateBtn").addEventListener("click", () => {
  if (p5Instance) p5Instance.remove();

  const algo = algoSelect.value;
  const width = parseInt(document.getElementById("mazeWidth").value);
  const height = parseInt(document.getElementById("mazeHeight").value);
  const containerId = "canvas-container";

  switch (algo) {
    case 'prim': currentAlgo = prim; break;
    case 'recdiv': currentAlgo = recdiv; break;
    case 'eller': currentAlgo = eller; break;
    case 'kruskal': currentAlgo = kruskal; break;
    case 'dfs': default: currentAlgo = dfs; break;
  }

  p5Instance = new p5((p) => {
    p.setup = () => currentAlgo.generateMaze(p, width, height,containerId);

    //changes- controls. check
    p.draw = () => {
      currentAlgo.mazeDraw(p);
      const isComplete = currentAlgo.isComplete ? currentAlgo.isComplete() : 
        currentAlgo.grid.length > 0 && (!currentAlgo.current) && 
        currentAlgo.grid.every(cell => cell.visited);
      if (isComplete) {
        p.noLoop();
        document.getElementById("solveBtn").disabled = false;
      }
    };
  });

  document.getElementById("solveBtn").disabled = true;
});


document.getElementById("solveBtn").addEventListener("click", async () => {
  solverAbortController.abort = true;
  solverAbortController = { abort: false };

  clearSolverState(currentAlgo.grid);

  const start = currentAlgo.grid[0];
  const end = currentAlgo.grid[currentAlgo.grid.length - 1];
  const solver = document.getElementById("solverSelect").value;

  switch(solver) {
    case 'deadend':
      await universalDeadEndFilling(start, end, currentAlgo.getContext(), solverAbortController,getSpeed, isPausedRef);
      break;
    case 'bfs':
      await universalBFS(start, end, currentAlgo.getContext(), solverAbortController,getSpeed, isPausedRef);
      break;
    case 'dijkstra':
      await universalDijkstra(start, end, currentAlgo.getContext(), solverAbortController,getSpeed, isPausedRef);
      break;
    case 'astar':
      await universalAStar(start, end, currentAlgo.getContext(), solverAbortController,getSpeed, isPausedRef);
      break;
    case 'greedy':
      await universalGreedyBFS(start, end, currentAlgo.getContext(), solverAbortController,getSpeed, isPausedRef);
      break;
    case 'dfs':
      await universalDFS(start, end, currentAlgo.getContext(), solverAbortController,getSpeed, isPausedRef);
      break;
    case 'wallfollower':
      await universalWallFollower(start, end, currentAlgo.getContext(), solverAbortController);
      break;
    default:
      await universalDeadEndFilling(start, end, currentAlgo.getContext(), solverAbortController,getSpeed, isPausedRef);
  }
});


document.getElementById('pauseBtn').addEventListener('click', handlePause);

document.getElementById('speedUpBtn').addEventListener('click', () => {
  animationSpeedRef.value = Math.max(10, animationSpeedRef.value - 20);
});

document.getElementById('speedDownBtn').addEventListener('click', () => {
  animationSpeedRef.value = Math.min(500, animationSpeedRef.value + 20);
});