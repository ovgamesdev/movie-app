import { IFilmBaseInfo, IListSlugFilter, IMovieBaseInfo, ITvSeriesBaseInfo, MovieType, ReleaseYear } from '@store/kinopoisk'
import { NewEpisodesType } from '@store/notices'
import { WatchHistoryProvider } from '@store/settings'

// MOVIE

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

export const isSeries = (type: MovieType): boolean => {
	return type === 'TvSeries' || type === 'MiniSeries' || type === 'TvShow'
}

type IsSeriesType = ITvSeriesBaseInfo | IFilmBaseInfo
export const isSeriesData = (data: IsSeriesType): data is ITvSeriesBaseInfo => {
	return data.__typename === 'TvSeries' || data.__typename === 'MiniSeries' || data.__typename === 'TvShow'
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
	const isKP = typeof url === 'string' ? url.includes('/get-') : true
	const appendText: string = isKP ? (other.append ? other.append : '') : ''

	if (!url) {
		const [height, width] = appendText.replace('/', '').split('x')
		return other.isNull.replace('{height}', height).replace('{width}', width) + appendText
	} else if (url.startsWith('//')) {
		return `https:${url}` + appendText
	} else if (url.startsWith('http://')) {
		return url.replace('http://', 'https://') + appendText
	}

	return url + appendText
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

export const formatDate = (date: string | number | Date) => {
	return new Date(date).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' }).replace(' г.', '')
}

export const getTimeAgo = (timestamp: number): string => {
	const diff = Date.now() - timestamp

	const seconds = Math.floor(diff / 1000)
	const minutes = Math.floor(seconds / 60)
	const hours = Math.floor(minutes / 60)
	const days = Math.floor(hours / 24)

	if (days > 7) {
		return new Date(timestamp).toLocaleDateString()
	} else if (days > 0) {
		return `${days} ${getNoun(days, 'день', 'дня', 'дней')} назад`
	} else if (hours > 0) {
		return `${hours} ${getNoun(hours, 'час', 'часа', 'часов')} назад`
	} else if (minutes > 0) {
		return `${minutes} ${getNoun(minutes, 'минуту', 'минуты', 'минут')} назад`
	} else {
		return `${seconds} ${getNoun(seconds, 'секунду', 'секунды', 'секунд')} назад`
	}
}

export const newSeriesToString = (data: NewEpisodesType): string | null => {
	const seasonTitle = Object.keys(data)
		.map(season => {
			const episode = data[season]
			const episodeTitle = episode.length < 2 ? episode[0] : episode[0] + ' - ' + episode[episode.length - 1]

			return `(эпизод ${episodeTitle}, сезон ${season})`
		})
		.join(', ')

	return seasonTitle.length === 0 ? null : seasonTitle
}

// Search

export const movieListUrlToFilters = (url: string): { isFilter: boolean; slug: string; filters: IListSlugFilter } => {
	const isFilter = url.includes('--') || url.includes('ss_')
	const slug = url.split('/')[url.split('/').length - (url.endsWith('/') ? 2 : 1)]

	const stringFilters = url.includes('movies/?') ? '' : url.split('movies/')[1]

	const arrayStringFilters = stringFilters
		.split('/')
		.filter(filter => filter.length > 0)
		.filter(it => !it.includes('ss_') && !it.includes('b='))
	const arrayFilters = arrayStringFilters.map(filter => filter.split('--'))

	const search =
		url
			.split('?')[1]
			?.split('&')
			.map(search => search.replace('ss_', '').split('=')) ?? []

	const booleanFilterValues = [...search.filter(it => it[0] === 'b')].map(filter => ({ filterId: filter[1], value: true }))
	const singleSelectFilterValues = [...arrayFilters, ...search.filter(it => it[0] !== 'b')].map(filter => ({ filterId: filter[0], value: filter[1] }))

	return {
		isFilter,
		slug: slug.startsWith('?') ? '' : slug,
		filters: { booleanFilterValues, intRangeFilterValues: [], multiSelectFilterValues: [], realRangeFilterValues: [], singleSelectFilterValues }
	}
}

export const releaseYearsToString = (releaseYears: ReleaseYear[] | undefined): string | null => {
	return !releaseYears ? null : releaseYears.length !== 0 ? (releaseYears[0]?.start === releaseYears[0]?.end ? (releaseYears[0].start === null || releaseYears[0].start === 0 ? null : String(releaseYears[0].start)) ?? '' : releaseYears[0].start != null || releaseYears[0].end != null ? (releaseYears[0].start ?? '...') + ' - ' + (releaseYears[0].end ?? '...') : '') : null
}

// Watch

export const watchHistoryProviderToString = (provider: WatchHistoryProvider): string => {
	return provider.startsWith('KODIK:') ? provider.slice(0, provider.indexOf(':')) : provider
}
