let generationStart = null;
let solveStart = null;

const timings = {
  generation: 0,
  solving: 0
};

const algorithmDetails = {
  "DFS": {
    speed: "Fast",
    timeComplexity: "O(N)",
    spaceComplexity: "O(N)",
    remarks: "Simple, depth-first carving, stack-based."
  },
  "Eller's": {
    speed: "Very Fast",
    timeComplexity: "O(N)",
    spaceComplexity: "O(width)",
    remarks: "Efficient for row-by-row generation."
  },
  "Prim's": {
    speed: "Moderate",
    timeComplexity: "O(N log N)",
    spaceComplexity: "O(N)",
    remarks: "Randomized version is slower than DFS."
  },
  "Kruskal's": {
    speed: "Slower",
    timeComplexity: "O(E log E)",
    spaceComplexity: "O(N)",
    remarks: "Good for sparse mazes, uses Union-Find."
  },
  "Recursive Division": {
    speed: "Very Fast",
    timeComplexity: "O(N log N)",
    spaceComplexity: "O(log N)",
    remarks: "Creates clear, structured mazes."
  }
};

//change- updateInfo solve clear
const solverDetails = {
  "DFS": {
    speed: "Fast",
    timeComplexity: "O(V+E)",
    spaceComplexity: "O(V)",
    remarks: "Depth-first pathfinding"
  },
  "BFS": {
    speed: "Moderate",
    timeComplexity: "O(V+E)",
    spaceComplexity: "O(V)",
    remarks: "Finds shortest path"
  },
  "A*": {
    speed: "Varies",
    timeComplexity: "O((V+E)log V)",
    spaceComplexity: "O(V)",
    remarks: "Heuristic-cost-based optimal path"
  },
  "Wall Follower": {
    speed: "Slow",
    timeComplexity: "O(V)",
    spaceComplexity: "O(V)/O(1)",
    remarks: "Follows maze wall; not guaranteed shortest"
  },
  "Dijkstra": {
    speed: "Moderate",
    timeComplexity: "O((V+E)log V)",
    spaceComplexity: "O(V)",
    remarks: "Shortest path with uniform weights"
  },
  "Greedy BFS": {
    speed: "Fast",
    timeComplexity: "O((V+E)log V)",
    spaceComplexity: "O(V)",
    remarks: "Heuristic-driven; not always optimal"
  },
  "Dead-End Filling": {
    speed: "Slow",
    timeComplexity: "O(V+E)",
    spaceComplexity: "O(V)",
    remarks: "Unique but can be inefficient on large mazes."
  }
};

// timing controls
// change- all algo, pathutils remove
export function startTimer(type = 'generation') {
  if (type === 'generation') generationStart = performance.now();
  else solveStart = performance.now();
}

export function stopTimer(type = 'generation') {
  const now = performance.now();
  if (type === 'generation') {
    timings.generation = ((now - generationStart) / 1000).toFixed(2); //mstos
  } else {
    timings.solving = ((now - solveStart) / 1000).toFixed(2);
  }
}

//from each algo
export function updateInfo(context) {
  const infoDiv = document.getElementById("maze-info");
  if (!infoDiv) return;

  let content = '';

  if (context.mode === 'generation') {
    const details = algorithmDetails[context.algorithm] || {};
    content = `
      <strong>Maze Size:</strong> ${context.cols} × ${context.rows}<br>
      <strong>Generator:</strong> ${context.algorithm}<br>
      ${context.complete ? `
        <strong>Gen. Time:</strong> ${timings.generation}s<br>
        <strong>Speed:</strong> ${details.speed || 'N/A'}<br>
        <strong>Time Complexity:</strong> ${details.timeComplexity || 'N/A'}<br>
        <strong>Space Complexity:</strong> ${details.spaceComplexity || 'N/A'}<br>
        <strong>Remarks:</strong> ${details.remarks || 'N/A'}
      ` : '<strong>Status:</strong> Generating...'}
    `;
  } else if (context.mode === 'solving') {
    const details = solverDetails[context.algorithm] || {};

    content = `
      <strong>Maze Size:</strong> ${context.cols} × ${context.rows}<br>
      <strong>Solver:</strong> ${context.algorithm}<br>
      <strong>Solve Time:</strong> ${timings.solving}s<br>
      <strong>Speed:</strong> ${details.speed || 'N/A'}<br>
      <strong>Time Complexity:</strong> ${details.timeComplexity || 'N/A'}<br>
      <strong>Space Complexity:</strong> ${details.spaceComplexity || 'N/A'}<br>
      <strong>Result:</strong> ${context.pathFound ? 'Path Found' : 'No Path'}<br>
      <strong>Method:</strong> ${details.remarks || 'N/A'}
    `;
  }

  infoDiv.innerHTML = content;
}
