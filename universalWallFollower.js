import { sleep, updateCellClass } from './pathUtils.js';
import { isPausedRef, animationSpeedRef } from './pauseControl.js';
import { startTimer, stopTimer, updateInfo } from './mazeInfo.js';

export async function universalWallFollower(start, end, context, abortController) {
  if (abortController.abort) {
    console.log("Solver aborted!");
    return;
  }

  startTimer();

  const directions = [
    { dx: 0, dy: -1 }, // Up
    { dx: 1, dy: 0 },  // Right
    { dx: 0, dy: 1 },  // Down
    { dx: -1, dy: 0 }  // Left
  ];

  let dirIndex = 1;
  let current = start;
  const path = [current];

  context.grid.forEach(cell => (cell.visited = false));
  current.visited = true;
  updateCellClass(current, false, context);
  await sleep(animationSpeedRef.value);

  while (current !== end) {
    if (abortController.abort) return;

    while (isPausedRef.value) {
      await sleep(100);
      if (abortController.abort) return;
    }

    let moved = false;

    for (let i = 0; i < 4; i++) {
      const tryDir = (dirIndex + 3 - i) % 4;
      const { dx, dy } = directions[tryDir];
      const ni = current.i + dx;
      const nj = current.j + dy;

      const neighborIndex = context.index(ni, nj);
      if (neighborIndex === -1) continue;

      const neighbor = context.grid[neighborIndex];

      if (!current.walls[tryDir] && !neighbor.visited) {
        current = neighbor;
        current.visited = true;
        path.push(current);
        dirIndex = tryDir;
        moved = true;
        updateCellClass(current, false, context);
        await sleep(animationSpeedRef.value);
        break;
      }
    }

    if (!moved) {
      if (path.length <= 1) break;
      path.pop();
      current = path[path.length - 1];
      updateCellClass(current, false, context);
      await sleep(animationSpeedRef.value);
    }
  }

  if (current === end) {
    for (const cell of path) {
      updateCellClass(cell, true, context);
      await sleep(animationSpeedRef.value);
    }
    stopTimer('solving');
    updateInfo({
        mode: 'solving',
        cols: context.cols,
        rows: context.rows,
        algorithm: "Wall Follower",
        pathFound: true
      });
      return;
  } else {
    stopTimer('solving');
    updateInfo({
        mode: 'solving',
        cols: context.cols,
        rows: context.rows,
        algorithm: "Wall Follower",
        pathFound: false
      });
    console.log("No path found!");
  }
}