import { Line, Path, Point, Side, StationEquation } from './types.ts';

/**
 * Builds an HTML Path2D object from a Path.
 *
 * @param path - The path to build the Path2D from.
 * @returns The Path2D object.
 */
export function build2DPath(path: Path): Path2D {
	const path2D = new Path2D();
	path2D.moveTo(path[0].start.x, path[0].start.y);
	for (let i = 0; i < path.length; i++) {
		path2D.lineTo(path[i].end.x, path[i].end.y);
	}
	return path2D;
}

/**
 * Offsets a path to the left or right.
 *
 * @param path - The path to offset.
 * @param side - The side to offset to.
 * @param width - The amount to offset by.
 * @returns The offset path as a Path2D object.
 */
export function offsetPath(path: Path, side: Side, width: number): Path2D {
	// Tons of funky math here!
	const angles: number[] = [];
	const path2D = new Path2D();
	for (let i = 0; i < path.length - 1; i++) {
		const dirIn = lineDirection(path[i]);
		const dirOut = lineDirection(path[i + 1]);
		angles.push((dirIn + dirOut) / 2);
	}
	path2D.moveTo(
		path[0].start.x +
			Math.cos(lineDirection(path[0]) - Math.PI / 2) *
				(side === 'left' ? -width : width),
		path[0].start.y +
			Math.sin(lineDirection(path[0]) - Math.PI / 2) *
				(side === 'left' ? -width : width),
	);
	for (let i = 0; i < path.length; i++) {
		if (i == path.length - 1) {
			path2D.lineTo(
				path[i].end.x +
					Math.cos(lineDirection(path[i]) - Math.PI / 2) *
						(side === 'left' ? -width : width),
				path[i].end.y +
					Math.sin(lineDirection(path[i]) - Math.PI / 2) *
						(side === 'left' ? -width : width),
			);
		} else {
			path2D.lineTo(
				path[i].end.x +
					Math.cos(angles[i] - Math.PI / 2) *
						(side === 'left' ? -width : width),
				path[i].end.y +
					Math.sin(angles[i] - Math.PI / 2) *
						(side === 'left' ? -width : width),
			);
		}
	}
	return path2D;
}

/**
 * Calculates the distance between two points.
 * @param p1 - The first point.
 * @param p2 - The second point.
 * @returns The distance between the two points.
 */
export function distance(p1: Point, p2: Point): number {
	return Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
}

/**
 * Calculates the direction of a line.
 *
 * @param line - The line to calculate the direction of.
 * @returns The direction of the line in radians.
 */
function lineDirection(line: Line): number {
	return Math.atan2(line.end.y - line.start.y, line.end.x - line.start.x);
}

/**
 * Converts a list of points to a list of lines.
 * @param points - The list of points to convert.
 * @returns The list of lines.
 */
export function pointsToLines(points: Point[]): Line[] {
	const lines: Line[] = [];
	for (let i = 0; i < points.length - 1; i++) {
		lines.push({ start: points[i], end: points[i + 1] });
	}
	return lines;
}

/**
 * Converts a station equation to its XY coordinate equivalent.
 *
 * @param stationEquation - The station equation to convert.
 * @param path - The path the station equation is on.
 * @returns The XY coordinate equivalent of the station equation.
 */
export function stationEquationToXY(
	stationEquation: StationEquation,
	path: Path,
): Point {
	const lineLengths = path.map((line) => distance(line.start, line.end));
	let station = stationEquation.station;
	for (let i = 0; i < lineLengths.length; i++) {
		if (station < lineLengths[i]) {
			const normal = lineDirection(path[i]) + Math.PI / 2;
			return {
				x: path[i].start.x + Math.cos(normal) * stationEquation.offset,
				y: path[i].start.y + Math.sin(normal) * stationEquation.offset,
			};
		} else {
			station -= lineLengths[i];
		}
	}
	throw new Error('Invalid station equation');
}

/**
 * Calculates the shortest distance from a point to a path.
 */
export function distanceToPath(point: Point, path: Path): number {
	// AI generated code... seems like overkill but it works
	let minDistance = Infinity;
	for (let i = 0; i < path.length; i++) {
		const start = path[i].start;
		const end = path[i].end;
		const x = point.x;
		const y = point.y;
		const x1 = start.x;
		const y1 = start.y;
		const x2 = end.x;
		const y2 = end.y;
		const A = x - x1;
		const B = y - y1;
		const C = x2 - x1;
		const D = y2 - y1;
		const dot = A * C + B * D;
		const len_sq = C * C + D * D;
		const param = dot / len_sq;
		let xx, yy;
		if (param < 0 || (x1 == x2 && y1 == y2)) {
			xx = x1;
			yy = y1;
		} else if (param > 1) {
			xx = x2;
			yy = y2;
		} else {
			xx = x1 + param * C;
			yy = y1 + param * D;
		}
		const dx = x - xx;
		const dy = y - yy;
		const distance = Math.sqrt(dx * dx + dy * dy);
		if (distance < minDistance) {
			minDistance = distance;
		}
	}
	return minDistance;
}

/**
 * Calculates the length of a path.
 */
export function pathLength(path: Path): number {
	return path
		.map((line) => distance(line.start, line.end))
		.reduce((acc, val) => acc + val, 0); // Sum
}
