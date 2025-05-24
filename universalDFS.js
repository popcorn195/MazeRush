import { sleep, updateCellClass, getNeighbors, reconstructPath } from './pathUtils.js';
import { startTimer, stopTimer, updateInfo } from './mazeInfo.js';


//changes- controls param, param use
export async function universalDFS(start, end, algorithm, abortController, getSpeed, isPausedRef) {
  if (abortController.abort) {
    console.log("Solver aborted!");
    return;
  }

  startTimer('solving');
  const stack = [start];
  const visited = new Set();
  algorithm.grid.forEach(cell => cell.parent = null);

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
    updateCellClass(current);
    await sleep(getSpeed());

    if (current === end) {
      const path = reconstructPath(end);
      for (const cell of path) {
        if (abortController.abort) return;

        while (isPausedRef.value) {
          await sleep(100);
        }

        updateCellClass(cell, true);
        await sleep(getSpeed());
      }

      stopTimer('solving');
      updateInfo({
        mode: 'solving',
        cols: algorithm.cols,
        rows: algorithm.rows,
        algorithm: "DFS",
        pathFound: true
      });
      return;
    }

    const neighbors = getNeighbors(current, algorithm.grid, algorithm);
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
    cols: algorithm.cols,
    rows: algorithm.rows,
    algorithm: "DFS",
    pathFound: false
  });
  console.log("No path found!");
}
