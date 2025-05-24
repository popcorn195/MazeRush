import { sleep, updateCellClass, getNeighbors, reconstructPath } from './pathUtils.js';
import { startTimer, stopTimer, updateInfo } from './mazeInfo.js';

function heuristic(a, b) {
  return Math.abs(a.i - b.i) + Math.abs(a.j - b.j);
}

//changes- controls param, param use
export async function universalGreedyBFS(start, end, algorithm, abortController, getSpeed, isPausedRef) {
  if (abortController.abort) {
    console.log("Solver aborted!");
    return;
  }

  startTimer('solving');
  const openSet = [start];
  const openSetSet = new Set([`${start.i},${start.j}`]);
  const visited = new Set();

  algorithm.grid.forEach(cell => cell.parent = null);

  while (openSet.length > 0) {
    if (abortController.abort) {
      console.log("Solver aborted during run!");
      return;
    }

    while (isPausedRef.value) {
      await sleep(100);
    }

    openSet.sort((a, b) => heuristic(a, end) - heuristic(b, end));
    const current = openSet.shift();
    const currentKey = `${current.i},${current.j}`;
    openSetSet.delete(currentKey);

    if (visited.has(currentKey)) continue;
    visited.add(currentKey);

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
        algorithm: "Greedy BFS",
        pathFound: true
      });
      return;
    }

    const neighbors = getNeighbors(current, algorithm.grid, algorithm);
    for (const neighbor of neighbors) {
      const neighborKey = `${neighbor.i},${neighbor.j}`;
      if (!visited.has(neighborKey) && !openSetSet.has(neighborKey)) {
        neighbor.parent = current;
        openSet.push(neighbor);
        openSetSet.add(neighborKey);
      }
    }
  }

  stopTimer('solving');
  updateInfo({
    mode: 'solving',
    cols: algorithm.cols,
    rows: algorithm.rows,
    algorithm: "Greedy BFS",
    pathFound: false
  });
  console.log("No path found!");
}
