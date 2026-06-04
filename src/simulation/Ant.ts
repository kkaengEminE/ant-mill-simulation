import { Vector2D } from './Vector2D';
import { PheromoneGrid } from './Pheromone';

export class Ant {
  public position: Vector2D;
  public velocity: Vector2D;
  public acceleration: Vector2D;

  private maxSpeed: number = 2.2;
  private maxForce: number = 0.15;
  private wanderAngle: number = 0;

  private sensorAngle: number = 45 * (Math.PI / 180);
  private sensorDist: number = 25;

  public angularHistory: number = 0;
  public colorIntensity: number = 0;

  constructor(x: number, y: number) {
    this.position = new Vector2D(x, y);
    const angle = Math.random() * Math.PI * 2;
    this.velocity = new Vector2D(Math.cos(angle), Math.sin(angle)).mult(this.maxSpeed);
    this.acceleration = new Vector2D(0, 0);
    this.wanderAngle = Math.random() * Math.PI * 2;
  }

  update(grid: PheromoneGrid) {
    const steer = this.senseAndSteer(grid);
    this.acceleration.add(steer);

    const lastHeading = this.velocity.heading();
    this.velocity.add(this.acceleration).limit(this.maxSpeed);
    this.position.add(this.velocity);
    this.acceleration.set(0, 0);

    const currentHeading = this.velocity.heading();
    let diff = currentHeading - lastHeading;
    if (diff > Math.PI) diff -= Math.PI * 2;
    if (diff < -Math.PI) diff += Math.PI * 2;

    this.angularHistory = this.angularHistory * 0.98 + diff;
    if (Math.abs(this.angularHistory) > 0.4) {
      this.colorIntensity = Math.min(this.colorIntensity + 0.005, 1.0);
    } else {
      this.colorIntensity = Math.max(this.colorIntensity - 0.002, 0.0);
    }

    this.handleBoundaries(grid);
    grid.addTrail(this.position.x, this.position.y, 0.3);
  }

  private senseAndSteer(grid: PheromoneGrid): Vector2D {
    const heading = this.velocity.heading();

    const centerSens = this.getSensorPos(heading, 0);
    const leftSens = this.getSensorPos(heading, -this.sensorAngle);
    const rightSens = this.getSensorPos(heading, this.sensorAngle);

    const cVal = this.readPheromone(grid, centerSens);
    const lVal = this.readPheromone(grid, leftSens);
    const rVal = this.readPheromone(grid, rightSens);

    const steerForce = new Vector2D(0, 0);

    if (cVal > lVal && cVal > rVal) {
      // center strongest — keep going straight
    } else if (lVal > rVal) {
      steerForce.add(this.seekPattern(-this.sensorAngle));
    } else if (rVal > lVal) {
      steerForce.add(this.seekPattern(this.sensorAngle));
    } else {
      this.wanderAngle += (Math.random() - 0.5) * 0.5;
      const wanderTarget = this.velocity.copy().normalize().mult(this.sensorDist);
      wanderTarget.x += Math.cos(this.wanderAngle) * 8;
      wanderTarget.y += Math.sin(this.wanderAngle) * 8;
      steerForce.add(wanderTarget.normalize().mult(this.maxForce));
    }

    return steerForce.limit(this.maxForce);
  }

  private getSensorPos(heading: number, angleOffset: number): Vector2D {
    return new Vector2D(
      this.position.x + Math.cos(heading + angleOffset) * this.sensorDist,
      this.position.y + Math.sin(heading + angleOffset) * this.sensorDist
    );
  }

  private readPheromone(grid: PheromoneGrid, pos: Vector2D): number {
    const idx = grid.getIndex(pos.x, pos.y);
    if (idx === -1 || grid.obstacleMap[idx] === 1) return -1;
    return grid.trailMap[idx] + (grid.sugarMap[idx] * 3.0);
  }

  private seekPattern(angleOffset: number): Vector2D {
    const desiredHeading = this.velocity.heading() + angleOffset;
    const desired = new Vector2D(Math.cos(desiredHeading), Math.sin(desiredHeading)).mult(this.maxSpeed);
    return desired.sub(this.velocity);
  }

  private handleBoundaries(grid: PheromoneGrid) {
    const buffer = 15;
    if (this.position.x < buffer) { this.position.x = buffer; this.velocity.x *= -1; }
    if (this.position.x > grid.width - buffer) { this.position.x = grid.width - buffer; this.velocity.x *= -1; }
    if (this.position.y < buffer) { this.position.y = buffer; this.velocity.y *= -1; }
    if (this.position.y > grid.height - buffer) { this.position.y = grid.height - buffer; this.velocity.y *= -1; }

    const nextX = this.position.x + this.velocity.x * 3;
    const nextY = this.position.y + this.velocity.y * 3;
    if (grid.isObstacle(nextX, nextY)) {
      this.velocity.mult(-1);
      this.wanderAngle = Math.random() * Math.PI * 2;
    }
  }

  public scatter() {
    const angle = Math.random() * Math.PI * 2;
    this.velocity.set(Math.cos(angle), Math.sin(angle)).mult(this.maxSpeed * 1.5);
    this.angularHistory = 0;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(this.position.x, this.position.y);
    ctx.rotate(this.velocity.heading());

    const r = Math.floor(58 + (166 - 58) * this.colorIntensity);
    const g = Math.floor(48 + (58 - 48) * this.colorIntensity);
    const b = Math.floor(42 + (58 - 42) * this.colorIntensity);
    ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;

    ctx.beginPath();
    ctx.arc(-4, 0, 2, 0, Math.PI * 2);
    ctx.arc(0, 0, 1.5, 0, Math.PI * 2);
    ctx.arc(4, 0, 1.8, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = `rgb(${r}, ${g}, ${b})`;
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(4, -1); ctx.lineTo(7, -2.5);
    ctx.moveTo(4, 1); ctx.lineTo(7, 2.5);
    ctx.stroke();

    ctx.restore();
  }
}
