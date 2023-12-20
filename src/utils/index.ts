// MOVIE

import { IFilmBaseInfo, IMovieBaseInfo, ITvSeriesBaseInfo } from '@store/kinopoisk'

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

// PERSON

export const declineAge = (years: number | undefined): string => {
	if (years == undefined) return ''

	const lastDigit = years % 10
	const lastTwoDigits = years % 100

	if (lastDigit === 1 && lastTwoDigits !== 11) {
		return `${years} год`
	} else if (lastDigit >= 2 && lastDigit <= 4 && !(lastTwoDigits >= 12 && lastTwoDigits <= 14)) {
		return `${years} года`
	} else {
		return `${years} лет`
	}
}

export const getSpouseStatus = (status: string, gender: string): string => {
	// 'ANNULMENT' | 'DIVORCE' | 'OK | 'SPOUSE_DEATH'

	return status === 'DIVORCE' ? 'развод' : status === 'ANNULMENT' ? 'аннулирован' : status === 'SPOUSE_DEATH' && gender === 'FEMALE' ? 'умерла' : status === 'SPOUSE_DEATH' && gender === 'MALE' ? 'умер' : ''
}

export const declineChildren = (count: number): string => {
	if (count === 0) return 'нет детей'

	const cases = [2, 0, 1, 1, 1, 2]
	const titles = ['ребенок', 'ребенка', 'детей']
	const numericWords: { [key: number]: string } = { 1: 'один', 2: 'двое', 3: 'трое', 4: 'четверо', 5: 'пятеро', 6: 'шестеро', 7: 'семеро' }

	if (count === 1) {
		return `${numericWords[count]} ${titles[0]}`
	} else if (count in numericWords) {
		return `${numericWords[count]} ${titles[2]}`
	}

	return `${count} ${titles[count % 100 > 4 && count % 100 < 20 ? 2 : cases[Math.min(count % 10, 5)]]}`
}

// TODO https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-3.html#narrowing-on-comparisons-to-booleans
export const isSeries = (type: 'Film' | 'TvSeries' | 'MiniSeries'): boolean => {
	return type === 'TvSeries' || type === 'MiniSeries'
}

export const pickIsSeries = <T extends Partial<IMovieBaseInfo>>(type: T, series: keyof ITvSeriesBaseInfo, notSeries: keyof IFilmBaseInfo): any => {
	return type[series] ?? type[notSeries]
}

// OTHER

export const mapValue = (value: number, fromMin: number, fromMax: number, toMin: number, toMax: number): number => {
	const fromRange = fromMax - fromMin
	const toRange = toMax - toMin

	const scaledValue = (value - fromMin) / fromRange
	const mappedValue = scaledValue * toRange + toMin

	return mappedValue
}

export const normalizeUrlWithNull = (url: string | null | undefined, other: { isNull: string; append?: string }): string => {
	if (!url) {
		return other.isNull + (other.append ? other.append : '')
	} else if (url.startsWith('//')) {
		return `http:${url}` + (other.append ? other.append : '')
	}

	return url + (other.append ? other.append : '')
}

export const normalizeUrl = (url: string): string => {
	if (url.startsWith('//')) {
		return `http:${url}`
	}

	return url
}

export const delay = async (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export const getNoun = (number: number, one: string, two: string, five: string) => {
	let n = Math.abs(number)
	n %= 100
	if (n >= 5 && n <= 20) {
		return five
	}
	n %= 10
	if (n === 1) {
		return one
	}
	if (n >= 2 && n <= 4) {
		return two
	}
	return five
}
