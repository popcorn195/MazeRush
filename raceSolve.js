import * as prim from './prim.js';
import * as recdiv from './recdiv.js';
import * as dfs from './dfs.js';
import * as eller from './eller.js';
import * as kruskal from './kruskal.js';

import { universalBFS } from './universalBFS.js';
import { universalAStar } from './universalAStar.js';
import { universalWallFollower } from './universalWallFollower.js';
import { universalDFS } from './universalDFS.js';
import { universalDeadEndFilling } from './universalDeadEndFilling.js';
import { universalDijkstra } from './universalDijkstra.js';
import { universalGreedyBFS } from './universalGreedyBFS.js';
import { startTimer, stopTimer } from './mazeInfo.js';
import {getSpeed, isPausedRef } from './pauseControl.js';
let racing = false;
let baseMaze = null;

//check-timer (???)
document.getElementById('startRace').addEventListener('click', async () => {
  if (racing) return;
  racing = true;
  document.getElementById('startRace').disabled = true;

  try {
    baseMaze = await generateBaseMaze();

    console.log("Base Maze generated:", baseMaze);
    console.log("Sample baseMaze grid cell:", baseMaze.grid[0]);

    await Promise.all([
      drawMazeOnCanvas(baseMaze, 'solver-canvas-1'),
      drawMazeOnCanvas(baseMaze, 'solver-canvas-2')
    ]);

    const [time1, time2] = await Promise.all([
      runSolver(1),
      runSolver(2)
    ]);

    showRaceResult(time1, time2, 'Solving');
  }catch (error) {
    handleRaceError(error);
  }

  document.getElementById('startRace').disabled = false;
  racing = false;
});

async function generateBaseMaze() {
  const algo = document.getElementById('solvingMazeAlgo').value;

  return new Promise((resolve) => {
    const tempContainer = document.createElement('div');
    //tempContainer.id = 'temp-maze-gen-container'; //rem, clone
    tempContainer.id = 'solver-canvas-1'; 
    tempContainer.style.position = 'fixed';
    tempContainer.style.left = '0';
    tempContainer.style.top = '0';
    tempContainer.style.width = '400px';
    tempContainer.style.height = '400px';
    //tempContainer.style.display = 'none'; //shows gen
    document.body.appendChild(tempContainer);

    new p5((p) => {
      let mazeAlgo;

      p.setup = () => {
        p.createCanvas(400, 400).parent(tempContainer);
        mazeAlgo = getMazeAlgorithm(algo);
        mazeAlgo.generateMaze(p, 400, 400, tempContainer.id);
      };

      p.draw = () => {
        mazeAlgo.mazeDraw(p);

        if (mazeAlgo.isComplete?.()) {
          const mazeData = {
            grid: cloneGrid(mazeAlgo.grid),
            cellSize: mazeAlgo.cellSize,
            width: 400,
            height: 400,
            cols: p.floor(400 / mazeAlgo.cellSize),
            rows: p.floor(400 / mazeAlgo.cellSize)
          };

          p.remove();
          tempContainer.remove();

          console.log("Base Maze Generated:", mazeData);
          resolve(mazeData);
        }
      };
    }, tempContainer);
  });
}

function cloneGrid(original) {
  const cloned = original.map(cell => ({
    i: cell.i,
    j: cell.j,
    cellSize: cell.cellSize,
    walls: [...cell.walls],
    visited: false,
    parent: null,
    inPath: false,
    distance: Infinity
  }));

  console.log("cloneGrid called. Cloned grid sample:", cloned[0]);
  return cloned;
}

function drawMazeOnCanvas(mazeData, containerId) {
  return new Promise((resolve) => {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    new p5((p) => {
      p.setup = () => {
        p.createCanvas(mazeData.width, mazeData.height).parent(containerId);
        p.noLoop();
      };

      p.draw = () => {
        p.background(255);
        for (let cell of mazeData.grid) {
          const x = cell.i * mazeData.cellSize;
          const y = cell.j * mazeData.cellSize;
          const size = mazeData.cellSize;

          p.stroke(0);
          p.strokeWeight(2);
          if (cell.walls[0]) p.line(x, y, x + size, y);
          if (cell.walls[1]) p.line(x + size, y, x + size, y + size);
          if (cell.walls[2]) p.line(x, y + size, x + size, y + size);
          if (cell.walls[3]) p.line(x, y, x, y + size);
        }
        resolve();
      };
    }, container);
  });
}

async function runSolver(solverNumber) {
  const solverAlgo = document.querySelectorAll('.solver-algo')[solverNumber - 1].value;
  const containerId = `solver-canvas-${solverNumber}`;

  return new Promise((resolve) => {
    const mazeClone = cloneGrid(baseMaze.grid);
    let solver;
    let elapsed = null;

    const sketch = (p) => {
      p.setup = async () => {
        p.createCanvas(baseMaze.width, baseMaze.height).parent(containerId);
        p.noLoop();

        const start = mazeClone[0];
        const end = mazeClone[mazeClone.length - 1];

        switch (solverAlgo) {
          case 'bfs': solver = universalBFS; break;
          case 'astar': solver = universalAStar; break;
          case 'dijkstra': solver = universalDijkstra; break;
          case 'greedy': solver = universalGreedyBFS; break;
          case 'wallfollower': solver = universalWallFollower; break;
          case 'dfs': solver = universalDFS; break;
          case 'deadend': solver = universalDeadEndFilling; break;
          default: solver = universalBFS;
        }

        try {
          console.log(`Running solver ${solverNumber} on container ${containerId}`);
          console.log("Sample cloned cell for solver:", mazeClone[0]);

          startTimer();

          const done = await solver(start, end, {
            grid: mazeClone,
            cellSize: baseMaze.cellSize,
            cols: baseMaze.cols,
            rows: baseMaze.rows,
            containerId,
            index: (i, j) => {
              if (i < 0 || j < 0 || i >= baseMaze.cols || j >= baseMaze.rows) return -1;
              return i + j * baseMaze.cols;
            },
            p
          }, { abort: false }, getSpeed, isPausedRef);

          if (done) {
            elapsed = stopTimer();
            console.log(`Solver ${solverNumber} done in ${elapsed.toFixed(2)}s`); //not showing check
            p.redraw();
            resolve(elapsed);
          }
        } catch (err) {
          console.error(`Solver ${solverNumber} error:`, err);
          resolve(Infinity);
        }
      };

      p.draw = () => {
        p.background(255);
        for (let cell of mazeClone) {
          const x = cell.i * baseMaze.cellSize;
          const y = cell.j * baseMaze.cellSize;
          const size = baseMaze.cellSize;

          p.stroke(0);
          p.strokeWeight(2);
          if (cell.walls[0]) p.line(x, y, x + size, y);
          if (cell.walls[1]) p.line(x + size, y, x + size, y + size);
          if (cell.walls[2]) p.line(x, y + size, x + size, y + size);
          if (cell.walls[3]) p.line(x, y, x, y + size);
        }

        if (elapsed !== null) {
          p.noLoop();
        }
      };
    };

    new p5(sketch, containerId);
  });
}

function getMazeAlgorithm(algo) {
  switch (algo) {
    case 'prim': return prim;
    case 'eller': return eller;
    case 'kruskal': return kruskal;
    case 'recdiv': return recdiv;
    default: return dfs;
  }
}

function showRaceResult(time1, time2, type) {
  const resultDiv = document.getElementById('raceResult');
  resultDiv.innerHTML = `
    <h3>${type} Race Results</h3>
    <div class="${time1 < time2 ? 'winner' : 'loser'}">
      Solver 1: ${time1.toFixed(2)}s
    </div>
    <div class="${time2 < time1 ? 'winner' : 'loser'}">
      Solver 2: ${time2.toFixed(2)}s
    </div>
    <h4>Winner: ${time1 < time2 ? 'Solver 1' : 'Solver 2'}</h4>
  `;
}

function handleRaceError(error) {
  console.error("Race Error:", error);
  const resultDiv = document.getElementById('raceResult');
  resultDiv.className = 'race-result loser';
  resultDiv.textContent = 'Error: ' + error.message;
}