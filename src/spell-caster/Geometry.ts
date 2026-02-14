import type { Vector2 } from "../types/spellCasterTypes";

// Geometry object used to handle taking in the users spell and normalizing it so the matching spell can be found
export const Geometry = {
  distance: (p1: Vector2, p2: Vector2) => Math.hypot(p1.x - p2.x, p1.y - p2.y),
  pathLength: (points: Vector2[]) => {
    let d = 0;
    for (let i = 1; i < points.length; i++)
      d += Geometry.distance(points[i - 1], points[i]);
    return d;
  },
  centroid: (points: Vector2[]) => {
    let x = 0,
      y = 0;
    for (const p of points) {
      x += p.x;
      y += p.y;
    }
    return { x: x / points.length, y: y / points.length };
  },
  resample: (points: Vector2[], n: number) => {
    if (points.length === 0) return [];
    const workingPoints = points.map((p) => ({ ...p }));
    const interval = Geometry.pathLength(workingPoints) / (n - 1);
    let D = 0;
    const newPoints: Vector2[] = [workingPoints[0]];
    for (let i = 1; i < workingPoints.length; i++) {
      const d = Geometry.distance(workingPoints[i - 1], workingPoints[i]);
      if (D + d >= interval) {
        const qx =
          workingPoints[i - 1].x +
          ((interval - D) / d) * (workingPoints[i].x - workingPoints[i - 1].x);
        const qy =
          workingPoints[i - 1].y +
          ((interval - D) / d) * (workingPoints[i].y - workingPoints[i - 1].y);
        const q = { x: qx, y: qy };
        newPoints.push(q);
        workingPoints.splice(i, 0, q);
        D = 0;
      } else {
        D += d;
      }
    }
    if (newPoints.length === n - 1)
      newPoints.push(workingPoints[workingPoints.length - 1]);
    return newPoints;
  },
  rotateToZero: (points: Vector2[]) => {
    const c = Geometry.centroid(points);
    const angle = Math.atan2(points[0].y - c.y, points[0].x - c.x);
    return Geometry.rotateBy(points, -angle);
  },
  rotateBy: (points: Vector2[], angle: number) => {
    const c = Geometry.centroid(points);
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return points.map((p) => ({
      x: (p.x - c.x) * cos - (p.y - c.y) * sin + c.x,
      y: (p.x - c.x) * sin + (p.y - c.y) * cos + c.y,
    }));
  },
  scaleTo: (points: Vector2[], size: number) => {
    const minX = Math.min(...points.map((p) => p.x));
    const maxX = Math.max(...points.map((p) => p.x));
    const minY = Math.min(...points.map((p) => p.y));
    const maxY = Math.max(...points.map((p) => p.y));
    const scale = size / Math.max(maxX - minX, maxY - minY, 0.01);
    return points.map((p) => ({ x: p.x * scale, y: p.y * scale }));
  },
  translateTo: (points: Vector2[], pt: Vector2) => {
    const c = Geometry.centroid(points);
    return points.map((p) => ({ x: p.x + pt.x - c.x, y: p.y + pt.y - c.y }));
  },
  pathDistance: (pts1: Vector2[], pts2: Vector2[]) => {
    let d = 0;
    const len = Math.min(pts1.length, pts2.length);
    for (let i = 0; i < len; i++) d += Geometry.distance(pts1[i], pts2[i]);
    return d;
  },
};
