import { sleep, updateCellClass, getNeighbors, reconstructPath } from './pathUtils.js';
import { startTimer, stopTimer, updateInfo } from './mazeInfo.js';

export async function universalDeadEndFilling(start, end, context, abortController, getSpeed, isPausedRef) {
  if (abortController.abort) {
    console.log("Solver aborted!");
    return;
  }

  startTimer('solving');

  context.grid.forEach(cell => {
    cell.visited = false;
    cell.parent = null;
  });

  let found_deadend = true;

  while (found_deadend) {
    if (abortController.abort) return;

    while (isPausedRef.value) {
      await sleep(100);
    }
    await sleep(getSpeed());

    found_deadend = false;

    for (const cell of context.grid) {
      if (cell === start || cell === end || cell.visited) continue;

      const neighbors = getNeighbors(cell, context.grid, context).filter(n => !n.visited);
      if (neighbors.length <= 1) {
        cell.visited = true;
        updateCellClass(cell, false, context);

        while (isPausedRef.value) {
          await sleep(100);
        }
        await sleep(getSpeed());

        found_deadend = true;
      }
    }
  }

  //this is for tracing the path after eliminating dead ends
  let current = start;
  const queue = [start];
  const visited = new Set();

  while (queue.length > 0) {
    if (abortController.abort) return;

    while (isPausedRef.value) {
      await sleep(100);
    }

    current = queue.shift();
    if (visited.has(current)) continue;
    visited.add(current);

    if (current === end) {
      const path = reconstructPath(end);
      for (const cell of path) {
        if (abortController.abort) return;

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
        algorithm: "Dead-End Filling",
        pathFound: true
      });
      return;
    }

    const neighbors = getNeighbors(current, context.grid, context).filter(n => !n.visited);
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
    algorithm: "Dead-End Filling",
    pathFound: false
  });

  console.log("No path found");
}