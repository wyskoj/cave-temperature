import { Map } from './Map.tsx';
import { geometry } from './assets/geometry.tsx';
import { pointsToLines } from './geometry.ts';
import './index.css';

export default function App() {
	const sensors = [
		{ name: 'A', location: { station: 57, offset: 0 } },
		{ name: 'B', location: { station: 219, offset: 0 } },
		{ name: 'C', location: { station: 388, offset: 0 } },
		{ name: 'D', location: { station: 645, offset: 0 } },
		{ name: 'E', location: { station: 855, offset: 0 } },
	];
	const observations = [
		{ sensor: sensors[0], temperature: 20 },
		{ sensor: sensors[1], temperature: 15 },
		{ sensor: sensors[2], temperature: 10 },
		{ sensor: sensors[3], temperature: 5 },
		{ sensor: sensors[4], temperature: 0 },
	];
	return (
		<div
			style={{
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
				height: '100vh',
			}}
		>
			<Map
				path={pointsToLines(geometry)}
				sensors={sensors}
				observations={observations}
			/>
		</div>
	);
}
