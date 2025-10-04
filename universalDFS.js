import { sleep, updateCellClass, getNeighbors, reconstructPath } from './pathUtils.js';
import { startTimer, stopTimer, updateInfo } from './mazeInfo.js';

export async function universalDFS(start, end, context, abortController, getSpeed, isPausedRef) {
  if (abortController.abort) {
    console.log("Solver aborted!");
    return;
  }

  startTimer('solving');
  const stack = [start];
  const visited = new Set();
  context.grid.forEach(cell => cell.parent = null);

  while (stack.length > 0) {
    if (abortController.abort) {
      console.log("Solver aborted during run!");
      return;
    }

    while (isPausedRef.value) {
      await sleep(100);
    }

    const current = stack.pop();

    if (visited.has(current)) continue;
    visited.add(current);

    current.visited = true;
    updateCellClass(current, false, context);
    await sleep(getSpeed());

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
        algorithm: "DFS",
        pathFound: true
      });
      return;
    }

    const neighbors = getNeighbors(current, context.grid, context);
    neighbors.forEach(neighbor => {
      if (!visited.has(neighbor)) {
        neighbor.parent = current;
        stack.push(neighbor);
      }
    });
  }

  stopTimer('solving');
  updateInfo({
    mode: 'solving',
    cols: context.cols,
    rows: context.rows,
    algorithm: "DFS",
    pathFound: false
  });
  console.log("No path found!");
}