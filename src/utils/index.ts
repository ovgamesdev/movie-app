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

const mpaa: { [key: string]: string } = {
	g: 'G',
	pg: 'PG',
	pg13: 'PG-13',
	r: 'R',
	nc17: 'NC-17'
}
const mpaaDescriptions: { [key: string]: string } = {
	g: 'нет возрастных ограничений',
	pg: 'рекомендуется присутствие родителей',
	pg13: 'детям до 13 лет просмотр не желателен',
	r: 'для детей до 17 лет просмотр запрещен',
	nc17: 'лицам до 18 лет просмотр запрещен'
}

export const ratingMPAA = (rating: string): { value: string; description: string } => ({ value: mpaa[rating], description: mpaaDescriptions[rating] })

export const formatDuration = (minutes: number): string => {
	const days = Math.floor(minutes / (60 * 24))
	const hours = Math.floor((minutes % (60 * 24)) / 60)
	const remainingMinutes = minutes % 60

	let result = ''
	if (days > 0) {
		result += `${days}д `
	}
	result += `${hours.toString().padStart(2, '0')}:`
	result += `${remainingMinutes.toString().padStart(2, '0')}`

	return result.trim()
}

export const declineSeasons = (count: number): string => {
	const lastDigit = count % 10
	const lastTwoDigits = count % 100

	if (lastDigit === 1 && lastTwoDigits !== 11) {
		return `${count} сезон`
	} else if (lastDigit >= 2 && lastDigit <= 4 && !(lastTwoDigits >= 12 && lastTwoDigits <= 14)) {
		return `${count} сезона`
	} else {
		return `${count} сезонов`
	}
}
