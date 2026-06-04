export class PheromoneGrid {
  public width: number;
  public height: number;
  public cellSize: number = 8;
  public cols: number;
  public rows: number;

  public trailMap: Float32Array;
  public sugarMap: Float32Array;
  public obstacleMap: Uint8Array;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.cols = Math.ceil(width / this.cellSize);
    this.rows = Math.ceil(height / this.cellSize);

    const size = this.cols * this.rows;
    this.trailMap = new Float32Array(size);
    this.sugarMap = new Float32Array(size);
    this.obstacleMap = new Uint8Array(size);
  }

  getIndex(x: number, y: number): number {
    const c = Math.floor(x / this.cellSize);
    const r = Math.floor(y / this.cellSize);
    if (c < 0 || c >= this.cols || r < 0 || r >= this.rows) return -1;
    return r * this.cols + c;
  }

  addTrail(x: number, y: number, amount: number) {
    const idx = this.getIndex(x, y);
    if (idx !== -1 && this.obstacleMap[idx] === 0) {
      this.trailMap[idx] = Math.min(this.trailMap[idx] + amount, 5.0);
    }
  }

  addSugar(x: number, y: number, amount: number) {
    const idx = this.getIndex(x, y);
    if (idx !== -1 && this.obstacleMap[idx] === 0) {
      this.sugarMap[idx] = Math.min(this.sugarMap[idx] + amount, 10.0);
    }
  }

  setObstacle(x: number, y: number, isWall: boolean) {
    const idx = this.getIndex(x, y);
    if (idx !== -1) {
      this.obstacleMap[idx] = isWall ? 1 : 0;
      if (isWall) {
        this.trailMap[idx] = 0;
        this.sugarMap[idx] = 0;
      }
    }
  }

  isObstacle(x: number, y: number): boolean {
    const idx = this.getIndex(x, y);
    if (idx === -1) return true;
    return this.obstacleMap[idx] === 1;
  }

  clearPheromoneAt(x: number, y: number, radius: number) {
    const startC = Math.max(0, Math.floor((x - radius) / this.cellSize));
    const endC = Math.min(this.cols - 1, Math.floor((x + radius) / this.cellSize));
    const startR = Math.max(0, Math.floor((y - radius) / this.cellSize));
    const endR = Math.min(this.rows - 1, Math.floor((y + radius) / this.cellSize));

    for (let r = startR; r <= endR; r++) {
      for (let c = startC; c <= endC; c++) {
        const idx = r * this.cols + c;
        this.trailMap[idx] = 0;
        this.sugarMap[idx] = 0;
      }
    }
  }

  update() {
    const size = this.cols * this.rows;
    for (let i = 0; i < size; i++) {
      this.trailMap[i] *= 0.993;
      this.sugarMap[i] *= 0.995;
      if (this.trailMap[i] < 0.01) this.trailMap[i] = 0;
      if (this.sugarMap[i] < 0.01) this.sugarMap[i] = 0;
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const idx = r * this.cols + c;
        const x = c * this.cellSize;
        const y = r * this.cellSize;

        if (this.obstacleMap[idx] === 1) {
          ctx.fillStyle = '#6E6053';
          ctx.fillRect(x, y, this.cellSize, this.cellSize);
        } else {
          if (this.trailMap[idx] > 0.05) {
            ctx.fillStyle = `rgba(166, 58, 58, ${Math.min(this.trailMap[idx] * 0.15, 0.4)})`;
            ctx.fillRect(x, y, this.cellSize, this.cellSize);
          }
          if (this.sugarMap[idx] > 0.05) {
            ctx.fillStyle = `rgba(60, 120, 60, ${Math.min(this.sugarMap[idx] * 0.2, 0.5)})`;
            ctx.fillRect(x, y, this.cellSize, this.cellSize);
          }
        }
      }
    }
  }
}
