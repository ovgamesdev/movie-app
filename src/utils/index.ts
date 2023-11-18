export const mapValue = (value: number, fromMin: number, fromMax: number, toMin: number, toMax: number): number => {
	const fromRange = fromMax - fromMin
	const toRange = toMax - toMin

	const scaledValue = (value - fromMin) / fromRange
	const mappedValue = scaledValue * toRange + toMin

	return mappedValue
}
