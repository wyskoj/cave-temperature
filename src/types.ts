/**
 * A point in 2D space.
 */
export type Point = {
	x: number;
	y: number;
};

/**
 * A line connects two points.
 */
export type Line = {
	start: Point;
	end: Point;
};

/**
 * A path is a series of connected lines.
 */
export type Path = Line[];

/**
 * The side of a path.
 */
export type Side = 'left' | 'right';

/**
 * A station equation is a pair of a station number and an offset. It defines a point on a path by specifying the
 * distance along the path (station), and the distance perpendicular to the path.
 */
export type StationEquation = {
	station: number;
	offset: number;
};

/**
 * A temperature sensor.
 */
export type Sensor = {
	name: string;
	location: StationEquation;
};

/**
 * A reading from a sensor.
 */
export type Observation = {
	sensor: Sensor;
	temperature: number;
};
