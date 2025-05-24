export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


//cell.i and cell.j as x/y coordinates on a canvas grid.
export function updateCellClass(cell, isPath = false) {
  const ctx = document.getElementById("defaultCanvas0").getContext("2d");
  ctx.fillStyle = isPath ? "rgba(246, 8, 36, 0.59)" : "rgba(38, 15, 139, 0.62)";
  ctx.fillRect(cell.i * cell.cellSize, cell.j * cell.cellSize, cell.cellSize, cell.cellSize);
}

export function getNeighbors(cell, grid, algorithm) {
  const neighbors = [];
  const directions = [
    { dx: 0, dy: -1, wallIndex: 0 }, // Top
    { dx: 1, dy: 0, wallIndex: 1 },  // Right
    { dx: 0, dy: 1, wallIndex: 2 },  // Bottom
    { dx: -1, dy: 0, wallIndex: 3 }  // Left
  ];

  //neighbor coordinates: ni = i + dx, nj = j + dy
  directions.forEach(({ dx, dy, wallIndex }) => {
    if (!cell.walls[wallIndex]) {
      const ni = cell.i + dx;
      const nj = cell.j + dy;
      const idx = algorithm.index(ni, nj);
      if (idx !== -1) neighbors.push(grid[idx]);
    }
  });
  return neighbors;
}

export function reconstructPath(end) {
  const path = [];
  let current = end;
  while (current) {
    path.push(current);
    current = current.parent;
  }
  return path.reverse(); 
}

//check- timing functions. 
// change- remove from solve algo, no use
/*let solveStartTime = null; 

export function startSolveTimer() {
  solveStartTime = performance.now();
}

export function getSolveTime() {
  return ((performance.now() - solveStartTime) / 1000).toFixed(2);
}*/

export function clearSolverState(grid) {
  const canvas = document.getElementById("defaultCanvas0");
  const ctx = canvas.getContext("2d");

  grid.forEach(cell => {
    cell.visited = false;
    cell.inPath = false;
    cell.parent = null;
    cell.distance = Infinity;
    cell.f = Infinity;
    cell.g = Infinity;
    cell.h = Infinity;
    cell.isFrontier = false;

    ctx.clearRect(cell.i * cell.cellSize, cell.j * cell.cellSize, cell.cellSize, cell.cellSize);
    
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 1;

    const x = cell.i * cell.cellSize;
    const y = cell.j * cell.cellSize;

    if (cell.walls[0]) { // top
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + cell.cellSize, y);
      ctx.stroke();
    }
    if (cell.walls[1]) { // right
      ctx.beginPath();
      ctx.moveTo(x + cell.cellSize, y);
      ctx.lineTo(x + cell.cellSize, y + cell.cellSize);
      ctx.stroke();
    }
    if (cell.walls[2]) { // bottom
      ctx.beginPath();
      ctx.moveTo(x + cell.cellSize, y + cell.cellSize);
      ctx.lineTo(x, y + cell.cellSize);
      ctx.stroke();
    }
    if (cell.walls[3]) { // left
      ctx.beginPath();
      ctx.moveTo(x, y + cell.cellSize);
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  });
}