//check 
//changes- clear delay
import { Cell } from './cell.js';
import { startTimer, stopTimer, updateInfo } from './mazeInfo.js';
import { isPausedRef, getSpeed } from './pauseControl.js';

export let grid = [];
export let cols, rows;
export const cellSize = 20;
let edges = [];
let currentEdgeIndex = 0;
let parent = [];
let rank = [];
export let complete = false;

let lastStepTime = 0;

export function index(i, j) {
  if (i < 0 || j < 0 || i >= cols || j >= rows) return -1;
  return i + j * cols;
}

export function generateMaze(p, width, height) {
  startTimer();
  let cnv = p.createCanvas(width, height);
  cnv.parent("canvas-container");
  p.frameRate(60);

  cols = p.floor(p.width / cellSize);
  rows = p.floor(p.height / cellSize);

  grid = [];
  edges = [];
  currentEdgeIndex = 0;
  parent = [];
  rank = [];
  complete = false;

  // Initialize grid and union-find structure
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      let cell = new Cell(i, j, cellSize);
      grid.push(cell);
      cell.visited = true;

      let idx = index(i, j);
      parent[idx] = idx;
      rank[idx] = 0;
    }
  }

  // Generate all possible edges (right and down only)
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      if (i < cols - 1) {
        edges.push([grid[index(i, j)], grid[index(i + 1, j)]]);
      }
      if (j < rows - 1) {
        edges.push([grid[index(i, j)], grid[index(i, j + 1)]]);
      }
    }
  }

  shuffle(edges, p);
  lastStepTime = -Infinity; // Force immediate first step
}

export function mazeDraw(p) {
  p.background(255);

  for (let cell of grid) {
    cell.show(p);
  }

  if (isPausedRef.value || complete) return;

  if (p.millis() - lastStepTime >= getSpeed()) {
    lastStepTime = p.millis();

    if (currentEdgeIndex < edges.length) {
      const [cellA, cellB] = edges[currentEdgeIndex];
      let rootA = findSet(index(cellA.i, cellA.j));
      let rootB = findSet(index(cellB.i, cellB.j));

      if (rootA !== rootB) {
        cellA.removeWalls(cellB);
        unionSets(rootA, rootB);

        cellA.highlight(p);
        cellB.highlight(p);
      }

      currentEdgeIndex++;
    } else if (!complete) {
      complete = true;
      stopTimer();
    }

    updateInfo({
      mode: 'generation',
      cols,
      rows,
      algorithm: "Kruskal's (Optimized)",
      complete
    });
  }
}

// Union-Find (Disjoint Set) Helpers
function findSet(idx) {
  if (parent[idx] !== idx) {
    parent[idx] = findSet(parent[idx]); // Path compression
  }
  return parent[idx];
}

function unionSets(a, b) {
  if (rank[a] < rank[b]) {
    parent[a] = b;
  } else if (rank[a] > rank[b]) {
    parent[b] = a;
  } else {
    parent[b] = a;
    rank[a]++;
  }
}

function shuffle(array, p) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(p.random(i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export function isComplete() {
  return complete;
}
