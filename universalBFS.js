import { sleep, updateCellClass, getNeighbors, reconstructPath } from './pathUtils.js';
import { startTimer, stopTimer, updateInfo } from './mazeInfo.js';

export async function universalBFS(start, end, context, abortController, getSpeed, isPausedRef) {
  if (abortController.abort) {
    console.log("Solver aborted!");
    return;
  }

  startTimer('solving');
  const { grid } = context; //grid=context.grid
  grid.forEach(cell => cell.parent = null);
  const queue = [start];
  const visited = new Set();

  while (queue.length > 0) {
    if (abortController.abort) {
      console.log("Solver aborted during run!");
      return;
    }

    while (isPausedRef.value) {
      await sleep(100); 
    }

    const current = queue.shift();
    if (visited.has(current)) continue;
    visited.add(current);
    updateCellClass(current, false, context);

    if (abortController.abort) {
      console.log("Solver aborted before sleep!");
      return;
    }
    await sleep(getSpeed());

    if (current === end) {
      const path = reconstructPath(end);
      for (const cell of path) {
        if (abortController.abort) {
          console.log("Solver aborted while drawing path!");
          return;
        }

        while (isPausedRef.value) {
          await sleep(100); 
        }

        updateCellClass(cell, true, context);
        await sleep(getSpeed());
      }

      stopTimer('solving');
      updateInfo({
        mode: 'solving',
        cols: context.cols,
        rows: context.rows,
        algorithm: "BFS",
        pathFound: true
      });
      return;
    }

    const neighbors = getNeighbors(current, context.grid, context);
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        neighbor.parent = current;
        queue.push(neighbor);
      }
    }
  }

  stopTimer('solving');
  updateInfo({
    mode: 'solving',
    cols: context.cols,
    rows: context.rows,
    algorithm: "BFS",
    pathFound: false
  });

  console.log("No path found!");
}