export const mapValue = (value: number, fromMin: number, fromMax: number, toMin: number, toMax: number): number => {
	const fromRange = fromMax - fromMin
	const toRange = toMax - toMin

	const scaledValue = (value - fromMin) / fromRange
	const mappedValue = scaledValue * toRange + toMin

	return mappedValue
}

export const getRatingColor = (rating: number): string => {
	if (rating >= 7) {
		return '#3bb33b'
	} else if (rating >= 5) {
		return '#777'
	} else {
		return '#FF0000'
	}
}
