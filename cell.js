export class Cell {
  constructor(i, j, cellSize = 10) {
    this.i = i;
    this.j = j;
    this.cellSize = cellSize;
    this.walls = [true, true, true, true]; // top, right, bottom, left
    this.visited = false;
    this.parent = null;
    this.set = null; // For Eller's algorithm
    this.inPath = false;
    this.parent = null;
    this.distance = Infinity;
  }

  // For visual display
  show(p) {
    const x = this.i * this.cellSize;
    const y = this.j * this.cellSize;

    // Draw walls
    p.stroke(0);
    p.strokeWeight(1);

    if (this.walls[0]) p.line(x, y, x + this.cellSize, y); // top
    if (this.walls[1]) p.line(x + this.cellSize, y, x + this.cellSize, y + this.cellSize); // right
    if (this.walls[2]) p.line(x + this.cellSize, y + this.cellSize, x, y + this.cellSize); // bottom
    if (this.walls[3]) p.line(x, y + this.cellSize, x, y); // left

    // Draw visited cells
    if (this.visited) {
      p.noStroke();
      p.fill(200, 162, 200, 100); // Lilac translucent
      p.rect(x, y, this.cellSize, this.cellSize);
    }
  }

  // For animation highlighting
  highlight(p, color = [180, 132, 200]) {
    const x = this.i * this.cellSize;
    const y = this.j * this.cellSize;
    p.noStroke();
    p.fill(color[0], color[1], color[2]); // Deeper lilac
    p.rect(x, y, this.cellSize, this.cellSize);
  }

  // Check for valid neighbors (for DFS and others)
  checkNeighbors(grid, index) {
    const neighbors = [];
    const i = this.i;
    const j = this.j;

    const top = grid[index(i, j - 1)];
    const right = grid[index(i + 1, j)];
    const bottom = grid[index(i, j + 1)];
    const left = grid[index(i - 1, j)];

    if (top && !top.visited) neighbors.push(top);
    if (right && !right.visited) neighbors.push(right);
    if (bottom && !bottom.visited) neighbors.push(bottom);
    if (left && !left.visited) neighbors.push(left);

    if (neighbors.length > 0) {
      return neighbors[Math.floor(Math.random() * neighbors.length)];
    }
    return undefined;
  }

  // Remove walls between this cell and another
  removeWalls(other) {
    const x = this.i - other.i;
    const y = this.j - other.j;

    if (x === 1) {
      this.walls[3] = false; // Remove left wall of this cell
      other.walls[1] = false; // Remove right wall of other cell
    } else if (x === -1) {
      this.walls[1] = false; // Remove right wall of this cell
      other.walls[3] = false; // Remove left wall of other cell
    }

    if (y === 1) {
      this.walls[0] = false; // Remove top wall of this cell
      other.walls[2] = false; // Remove bottom wall of other cell
    } else if (y === -1) {
      this.walls[2] = false; // Remove bottom wall of this cell
      other.walls[0] = false; // Remove top wall of other cell
    }
  }
}