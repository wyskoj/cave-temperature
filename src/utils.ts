/**
 * Converts a temperature (probably Fahrenheit) to an HSLA color.
 *
 * @param temperature - The temperature to convert.
 * @param lightness - Optional lightness value, defaults to 50.
 * @param alpha - Optional alpha value, defaults to 0.5.
 * @returns The HSLA color string.
 */
export function temperatureToHsla(
	temperature: number,
	lightness?: number,
	alpha?: number,
): string {
	const temps = [0, 50]; // 0 to 50 temperature degrees
	const hues = [250, 0]; // 250 to 0 hue degrees

	for (let i = 0; i < temps.length; i++) {
		if (temperature < temps[i]) {
			// Interpolate
			const hue =
				hues[i - 1] +
				((hues[i] - hues[i - 1]) * (temperature - temps[i - 1])) /
					(temps[i] - temps[i - 1]);
			return `hsla(${hue}, 100%, ${lightness ?? 50}%, ${alpha ?? 0.5})`;
		}
	}

	// Out of range, default
	return `hsla(${hues[hues.length - 1]}, 100%, ${lightness ?? 50}%, ${
		alpha ?? 0.5
	})`;
}
