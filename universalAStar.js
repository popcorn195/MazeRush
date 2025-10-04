import { sleep, updateCellClass, getNeighbors, reconstructPath } from './pathUtils.js';
import { startTimer, stopTimer, updateInfo } from './mazeInfo.js';

function heuristic(a, b) {
  return Math.abs(a.i - b.i) + Math.abs(a.j - b.j);
}

export async function universalAStar(start, end, context, abortController, getSpeed, isPausedRef) {
  if (abortController.abort) {
    console.log("Solver aborted!");
    return;
  }
  startTimer('solving');
  const { grid } = context;
  const openSet = [start];
  const gScore = new Map();
  const fScore = new Map();

  grid.forEach(cell => {
    gScore.set(cell, Infinity);
    fScore.set(cell, Infinity);
    cell.parent = null;
  });

  gScore.set(start, 0);
  fScore.set(start, heuristic(start, end));

  while (openSet.length > 0) {
    if (abortController.abort) return;

    openSet.sort((a, b) => fScore.get(a) - fScore.get(b));
    const current = openSet.shift();
    current.visited = true;
    updateCellClass(current, false,context);
    
    while (isPausedRef.value) {
      await sleep(100);
    }
    await sleep(getSpeed());

    if (current === end) {
      const path = reconstructPath(end);
      for (const cell of path) {
        if (abortController.abort) return;
        while (isPausedRef.value) {
          await sleep(100);
        }
        updateCellClass(cell, true,context);
        await sleep(getSpeed());
      }

      stopTimer('solving');
      updateInfo({
        mode: 'solving',
        cols: context.cols,
        rows: context.rows,
        algorithm: "A*",
        pathFound: true
      });

      return;
    }

    const neighbors = getNeighbors(current, context.grid, context);
    for (const neighbor of neighbors) {
      const tentativeGScore = gScore.get(current) + 1;
      if (tentativeGScore < gScore.get(neighbor)) {
        neighbor.parent = current;
        gScore.set(neighbor, tentativeGScore);
        fScore.set(neighbor, tentativeGScore + heuristic(neighbor, end));
        if (!openSet.includes(neighbor)) {
          openSet.push(neighbor);
        }
      }
    }
  }

  stopTimer('solving');
  updateInfo({
    mode: 'solving',
    cols: context.cols,
    rows: context.rows,
    algorithm: "A*",
    pathFound: false
  });
  console.log("No path found!");
}