import { MapProps } from './Map.tsx';
import {
	distance,
	distanceToPath,
	offsetPath,
	pathLength,
	stationEquationToXY,
} from './geometry.ts';
import { temperatureToHsla } from './utils.ts';

/**
 * Draws the center line.
 */
export function drawCenterLine(ctx: CanvasRenderingContext2D, path2D: Path2D) {
	ctx.strokeStyle = '#666';
	ctx.stroke(path2D);
}

/**
 * Draws perpendicular offsets from the center line (the edges, or walls).
 */
export function drawOffsets(
	ctx: CanvasRenderingContext2D,
	props: MapProps,
	width: number,
) {
	ctx.strokeStyle = '#999';
	ctx.stroke(offsetPath(props.path, 'left', width));
	ctx.stroke(offsetPath(props.path, 'right', width));
}

/**
 * Draws markers for the sensors.
 */
export function drawSensorMarkers(
	props: MapProps,
	ctx: CanvasRenderingContext2D,
) {
	const textPadding = 7;
	props.sensors.forEach((sensor) => {
		const temperature =
			props.observations.find((it) => it.sensor.name === sensor.name)
				?.temperature ?? 0;
		ctx.fillStyle = temperatureToHsla(temperature, 100, 1);
		const sensorLoc = stationEquationToXY(sensor.location, props.path);

		// Dot
		ctx.beginPath();
		ctx.arc(sensorLoc.x, sensorLoc.y, 5, 0, 2 * Math.PI);
		ctx.fill();

		// Text
		ctx.fillText(
			`${temperature}° - ${sensor.name}`,
			sensorLoc.x + textPadding,
			sensorLoc.y - textPadding,
		);
	});
}

/**
 * Draws labels at full stations.
 */
export function drawStationLabels(
	props: MapProps,
	ctx: CanvasRenderingContext2D,
) {
	for (let i = 0; i < pathLength(props.path) / 100; i++) {
		// Every 100 feet
		const { x, y } = stationEquationToXY(
			{ station: i * 100, offset: 0 },
			props.path,
		);

		// Text
		ctx.fillStyle = 'white';
		ctx.fillText(`${i}+00`, x - 30, y + 3);

		// Dot
		ctx.beginPath();
		ctx.arc(x, y, 2, 0, 2 * Math.PI);
		ctx.fill();
	}
}

/**
 * Draws a temperature map on the canvas.
 */
export function drawTemperatureMap(
	size: number,
	props: MapProps,
	ctx: CanvasRenderingContext2D,
	width: number,
) {
	const granularity = 1; // Increase for performance
	for (let i = 0; i < size / granularity; i++) {
		for (let j = 0; j < size / granularity; j++) {
			const x = i * granularity - width;
			const y = j * granularity - width;
			if (distanceToPath({ x, y }, props.path) > width) {
				// Skip points that are too far from the path
				continue;
			}

			// Weighted mean, weighted by the inverse of the distance to the sensors.
			let temperature = 0;
			let weights = 0;
			props.observations.forEach((observation) => {
				const weight =
					1 /
					distance(
						{ x, y },
						stationEquationToXY(observation.sensor.location, props.path),
					);
				temperature += observation.temperature * weight;
				weights += weight;
			});
			temperature /= weights;

			// Draw the cell
			ctx.fillStyle = temperatureToHsla(temperature);
			ctx.fillRect(x, y, granularity, granularity);
		}
	}
}
