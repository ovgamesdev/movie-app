// interface IShortImage {
// 	url: string | null
// 	previewUrl: string | null
// }

// interface IYearRange {
// 	start?: number | null
// 	end?: number | null
// }

// export interface ISlug {
// 	id: number
// 	name?: string | null
// 	enName?: string | null
// 	year: number | null
// 	poster: IShortImage
// 	alternativeName: string | null
// 	isSeries: boolean
// 	releaseYears?: [IYearRange]
// }

// export interface ISuccessResponse<T> {
// 	docs: T[]
// 	total: number
// 	limit: number
// 	page: number
// 	pages: number
// }

// export interface IErrorResponse {
// 	statusCode: number
// 	message: string
// 	error: string
// }

// export type IResponse<T> = ISuccessResponse<T> & IErrorResponse

export interface IGraphqlMovie {
	id: number
	contentId: string | null
	title: Title
	poster: Poster
	countries: Country[]
	genres: Country[]
	cast: Cast
	directors: Cast
	url: string
	rating: Rating
	mainTrailer: MainTrailer
	viewOption: ViewOption | null
	isTicketsAvailable: boolean
	releaseYears?: ReleaseYear[]
	productionYear?: number
	seriesDuration: number | null
	totalDuration: number | null
	top250: number | null
	__typename: string
}

export interface Cast {
	items: Item[]
	__typename: string
}

export interface Item {
	details: null | string
	person: Person
	__typename: string
}

export interface Person {
	name: string | null
	originalName: string | null
	__typename: string
}

export interface Country {
	id: number
	name: string
	__typename: string
}

export interface MainTrailer {
	id: number
	isEmbedded: boolean
	__typename: string
}

export interface Poster {
	avatarsUrl: string | null
	fallbackUrl: string | null
	__typename: string
}

export interface Rating {
	kinopoisk: Expectation
	expectation: Expectation
	__typename: string
}

export interface Expectation {
	isActive: boolean
	count: number
	value: number | null
	__typename: string
}

export interface ReleaseYear {
	start: number
	end: number
	__typename: string
}

export interface Title {
	russian: string | null
	original: string | null
	__typename: string
}

export interface ViewOption {}
