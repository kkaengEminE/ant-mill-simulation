import { Ant } from './Ant';
import { PheromoneGrid } from './Pheromone';

export class SimulationEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private ants: Ant[] = [];
  private grid!: PheromoneGrid;
  private isRunning: boolean = false;
  private animationFrameId: number | null = null;
  private maxAnts: number = 500;
  private spawnTimer: number = 0;
  private spawnInterval: number = 3;
  private spawnBatch: number = 4;

  public currentTool: string = 'stone';

  constructor(canvasId: string) {
    this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d')!;

    this.resizeCanvas();
    this.grid = new PheromoneGrid(this.canvas.width, this.canvas.height);
    this.setupInteractions();
  }

  private resizeCanvas() {
    const container = this.canvas.parentElement!;
    this.canvas.width = container.clientWidth;
    this.canvas.height = container.clientHeight;
  }

  public initSimulation() {
    this.resizeCanvas();
    this.grid = new PheromoneGrid(this.canvas.width, this.canvas.height);
    this.ants = [];
    this.spawnTimer = 0;

    document.getElementById('stat-count')!.innerText = '0';
  }

  private spawnAnts() {
    if (this.ants.length >= this.maxAnts) return;

    this.spawnTimer++;
    if (this.spawnTimer < this.spawnInterval) return;
    this.spawnTimer = 0;

    const w = this.canvas.width;
    const h = this.canvas.height;
    const margin = 30;
    const count = Math.min(this.spawnBatch, this.maxAnts - this.ants.length);

    for (let i = 0; i < count; i++) {
      const edge = Math.floor(Math.random() * 4);
      let x: number, y: number;
      if (edge === 0) { x = margin + Math.random() * (w - margin * 2); y = margin; }
      else if (edge === 1) { x = margin + Math.random() * (w - margin * 2); y = h - margin; }
      else if (edge === 2) { x = margin; y = margin + Math.random() * (h - margin * 2); }
      else { x = w - margin; y = margin + Math.random() * (h - margin * 2); }

      const ant = new Ant(x, y);
      const centerX = w / 2 + (Math.random() - 0.5) * w * 0.4;
      const centerY = h / 2 + (Math.random() - 0.5) * h * 0.4;
      const dx = centerX - x;
      const dy = centerY - y;
      const angle = Math.atan2(dy, dx) + (Math.random() - 0.5) * 0.8;
      ant.velocity.set(Math.cos(angle) * 2.2, Math.sin(angle) * 2.2);
      this.ants.push(ant);
    }

    document.getElementById('stat-count')!.innerText = this.ants.length.toString();
  }

  public start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.loop();
  }

  public stop() {
    this.isRunning = false;
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
  }

  private loop = () => {
    if (!this.isRunning) return;

    this.update();
    this.render();

    this.animationFrameId = requestAnimationFrame(this.loop);
  };

  private update() {
    this.spawnAnts();
    this.grid.update();

    let criticalAntsCount = 0;
    for (const ant of this.ants) {
      ant.update(this.grid);
      if (ant.colorIntensity > 0.6) {
        criticalAntsCount++;
      }
    }

    const loopRatio = this.ants.length > 0
      ? Math.floor((criticalAntsCount / this.ants.length) * 100)
      : 0;
    document.getElementById('stat-loop')!.innerText = `${loopRatio}%`;
  }

  private render() {
    this.ctx.fillStyle = '#FAF8F5';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.grid.draw(this.ctx);

    for (const ant of this.ants) {
      ant.draw(this.ctx);
    }
  }

  private setupInteractions() {
    let isDrawing = false;

    const handleAction = (e: MouseEvent) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (this.currentTool === 'stone') {
        for (let dx = -10; dx <= 10; dx += 6) {
          for (let dy = -10; dy <= 10; dy += 6) {
            this.grid.setObstacle(x + dx, y + dy, true);
          }
        }
      } else if (this.currentTool === 'remove-stone') {
        for (let dx = -15; dx <= 15; dx += 6) {
          for (let dy = -15; dy <= 15; dy += 6) {
            this.grid.setObstacle(x + dx, y + dy, false);
          }
        }
      } else if (this.currentTool === 'pheromone') {
        this.grid.addSugar(x, y, 6.0);
      } else if (this.currentTool === 'water') {
        this.grid.clearPheromoneAt(x, y, 40);
      } else if (this.currentTool === 'scatter') {
        for (const ant of this.ants) {
          if (Math.sqrt((ant.position.x - x) ** 2 + (ant.position.y - y) ** 2) < 60) {
            ant.scatter();
          }
        }
      }
    };

    this.canvas.addEventListener('mousedown', (e) => {
      isDrawing = true;
      handleAction(e);
    });

    this.canvas.addEventListener('mousemove', (e) => {
      if (isDrawing) handleAction(e);
    });

    window.addEventListener('mouseup', () => {
      isDrawing = false;
    });
  }
}
