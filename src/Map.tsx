import {
	drawCenterLine,
	drawOffsets,
	drawSensorMarkers,
	drawStationLabels,
	drawTemperatureMap,
} from './drawing.ts';
import { build2DPath } from './geometry.ts';
import { Observation, Path, Sensor } from './types.ts';
import { useEffect, useMemo, useRef, useState } from 'react';

export type MapProps = {
	path: Path;
	sensors: Sensor[];
	observations: Observation[];
};

/**
 * Renders the outline of the mine, draws the sensors, and the temperature map.
 */
export function Map(props: MapProps) {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);

	// We draw to an offscreen canvas to improve performance
	// (draw once, then transform... instead of drawing on every frame)
	const [offscreen] = useState<HTMLCanvasElement>(
		document.createElement('canvas'),
	);

	// Canvas transform params
	const [translate, setTranslate] = useState<{ x: number; y: number }>({
		x: 250,
		y: 10,
	});
	const [scale, setScale] = useState<number>(1);
	const size = useMemo(() => 900, []);
	const [dragging, setDragging] = useState<boolean>(false);
	const width = useMemo(() => 4, []); // ~8' across (4' on each side) as measured in the field

	useEffect(() => {
		offscreen.width = 1000;
		offscreen.height = 1000;
		const ctx = offscreen.getContext('2d')!;
		// noinspection JSSuspiciousNameCombination
		ctx.translate(width, width);
		drawTemperatureMap(size, props, ctx, width);
	}, [offscreen, props, props.observations, size, width]);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		// Set up the canvas
		canvas.width = size;
		canvas.height = size;

		// Establish the context, and apply the scale and translation
		const ctx = canvas.getContext('2d')!;
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.translate(translate.x, translate.y);
		ctx.scale(scale, scale);

		// Draw everything
		const path2D = build2DPath(props.path);
		drawCenterLine(ctx, path2D);
		ctx.drawImage(offscreen, -width, -width);
		drawOffsets(ctx, props, width);
		drawSensorMarkers(props, ctx);
		drawStationLabels(props, ctx);
	}, [offscreen, props, scale, size, translate.x, translate.y, width]);

	return (
		<canvas
			ref={canvasRef}
			style={{
				height: `${size}px`,
				width: `${size}px`,
				border: '1px solid black',
				backgroundColor: '#333',
			}}
			onMouseDown={() => {
				setDragging(true);
			}}
			onMouseUp={() => {
				setDragging(false);
			}}
			onMouseMove={(e) => {
				if (dragging) {
					setTranslate({
						x: translate.x + e.movementX,
						y: translate.y + e.movementY,
					});
				}
			}}
			onWheel={(event) => {
				// Code below ensures zooming is based around the cursor position
				// Calculate the new scale factor
				const factor = Math.pow(1.1, -event.deltaY / 100);

				// Get the current mouse position
				const mouseX =
					event.clientX - canvasRef.current!.offsetLeft - translate.x;
				const mouseY =
					event.clientY - canvasRef.current!.offsetTop - translate.y;

				// Update the scale & origin
				const newScale = scale * factor;

				// Don't allow super zooming
				if (newScale < 0.25 || newScale > 4) return;

				setScale(newScale);

				setTranslate({
					x: translate.x - mouseX * (factor - 1),
					y: translate.y - mouseY * (factor - 1),
				});
			}}
		/>
	);
}
