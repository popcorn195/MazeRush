import { sleep, updateCellClass, getNeighbors, reconstructPath } from './pathUtils.js';
import { startTimer, stopTimer, updateInfo } from './mazeInfo.js';

//changes- controls param, param use
export async function universalDijkstra(start, end, algorithm, abortController, getSpeed, isPausedRef) {
  if (abortController.abort) {
    console.log("Solver aborted!");
    return;
  }

  startTimer('solving');
  const distances = new Map();
  algorithm.grid.forEach(cell => {
    distances.set(cell, Infinity);
    cell.parent = null;
  });
  distances.set(start, 0);

  const priorityQueue = [{ cell: start, distance: 0 }];
  const visited = new Set();

  while (priorityQueue.length > 0) {
    if (abortController.abort) {
      console.log("Solver aborted during run!");
      return;
    }

    while (isPausedRef.value) {
      await sleep(100);
    }

    priorityQueue.sort((a, b) => a.distance - b.distance);
    const { cell: current } = priorityQueue.shift();

    if (visited.has(current)) continue;
    visited.add(current);

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
        algorithm: "Dijkstra",
        pathFound: true
      });
      return;
    }

    const neighbors = getNeighbors(current, algorithm.grid, algorithm);
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        const newDistance = distances.get(current) + 1;

        if (newDistance < distances.get(neighbor)) {
          distances.set(neighbor, newDistance);
          neighbor.parent = current;
          priorityQueue.push({ cell: neighbor, distance: newDistance });
        }
      }
    }
  }

  stopTimer('solving');
  updateInfo({
    mode: 'solving',
    cols: algorithm.cols,
    rows: algorithm.rows,
    algorithm: "Dijkstra",
    pathFound: false
  });
  console.log("No path found!");
}
