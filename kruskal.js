import { Cell } from './cell.js';
import { startTimer, stopTimer, updateInfo } from './mazeInfo.js';

export let grid = [];
export let cols, rows;
export const cellSize = 20;

let edges = [];
let sets = [];
let currentEdgeIndex = 0;
export let complete = false;

export function index(i, j) {
  if (i < 0 || j < 0 || i >= cols || j >= rows) return -1;
  return i + j * cols;
}

export function generateMaze(p, width, height) {
  startTimer();
  let cnv = p.createCanvas( width, height);
  cnv.parent("canvas-container");
  p.frameRate(60);

  cols = p.floor(p.width / cellSize);
  rows = p.floor(p.height / cellSize);

  grid = [];
  edges = [];
  sets = [];
  currentEdgeIndex = 0;
  complete = false;

  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      let cell = new Cell(i, j, cellSize);
      grid.push(cell);
      cell.visited = true; 
      
      sets.push([cell]);
    }
  }

  // Generate all possible edges
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      let cell = grid[index(i, j)];
      
      // Add edges to the right and bottom
      if (i < cols - 1) {
        edges.push([cell, grid[index(i + 1, j)]]);
      }
      if (j < rows - 1) {
        edges.push([cell, grid[index(i, j + 1)]]);
      }
    }
  }

  // Shuffle edges randomly
  shuffle(edges, p);
}


//check code from here- 
import { isPausedRef, getSpeed } from './pauseControl.js';

let lastStepTime = 0;

export function mazeDraw(p) {
  p.background(255);

  for (let cell of grid) {
    cell.show(p);
  }

  if (isPausedRef.value) return;  

  if (p.millis() - lastStepTime >= getSpeed()) {
    lastStepTime = p.millis();

    if (currentEdgeIndex < edges.length) {
      const [cellA, cellB] = edges[currentEdgeIndex];

      let setA = findSet(cellA);
      let setB = findSet(cellB);

      if (setA !== setB) {
        cellA.removeWalls(cellB);

        cellA.highlight(p);
        cellB.highlight(p);

        unionSets(setA, setB);
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
      algorithm: "Kruskal's",
      complete
    });
  }
}


//which set contains a cell
function findSet(cell) {
  return sets.find(set => set.includes(cell));
}

//merge two sets
function unionSets(setA, setB) {
  const newSet = [...setA, ...setB];
  sets = sets.filter(set => set !== setA && set !== setB);
  sets.push(newSet);
}

// shuffle an array
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