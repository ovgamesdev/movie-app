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

export interface IListSlugFilter {
	booleanFilterValues: BooleanFilterValues[]
	intRangeFilterValues: []
	singleSelectFilterValues: SingleSelectFilterValues[]
	multiSelectFilterValues: []
	realRangeFilterValues: []
}

type SingleSelectFilterValues = { filterId: string; value: string }
type BooleanFilterValues = { filterId: string; value: boolean }

export interface IGraphqlMovie {
	id: number
	contentId: string | null
	title: Title
	poster: Poster | null
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
export interface IGraphqlSuggestMovie {
	contentId: string | null
	id: number
	poster: Poster | null
	productionYear?: number
	rating: Rating
	releaseYears?: ReleaseYear[]
	title: Title
	type: string // TV_ONLY | NORMAL
	viewOption: ViewOption | null
	__typename: 'TvSeries' | 'Film'
}

export interface IGraphqlSuggestPerson {
	birthDate: string | null
	id: number
	name: string | null
	originalName: string | null
	poster: Poster | null
	__typename: 'Person'
}

export type ISuggestSearchResults = { cinemas: any[]; movieLists: { movieList: IGraphqlSuggestMovieList }[]; movies: { movie: IGraphqlSuggestMovie }[]; persons: { person: IGraphqlSuggestPerson }[]; topResult: { global: IGraphqlSuggestMovie | IGraphqlSuggestPerson | IGraphqlSuggestMovieList } | null }

export interface IGraphqlSuggestMovieList {
	cover: Pick<Poster, 'avatarsUrl'>
	coverBackground: null
	description: string | null
	id: number
	movies: { total: number }
	name: string
	url: string
	__typename: 'MovieListMeta'
}

interface Cast {
	items: Item[]
	__typename: string
}

interface Item {
	details: null | string
	person: Person
	__typename: string
}

interface Person {
	name: string | null
	originalName: string | null
	__typename: string
}

interface Country {
	id: number
	name: string
	__typename: string
}

interface MainTrailer {
	id: number
	isEmbedded: boolean
	__typename: string
}

interface Poster {
	avatarsUrl: string | null
	fallbackUrl: string | null
	__typename: string
}

interface Rating {
	kinopoisk: Expectation
	expectation: Expectation
	__typename: string
}

interface Expectation {
	isActive: boolean
	count: number
	value: number | null
	__typename: string
}

interface ReleaseYear {
	start: number
	end: number
	__typename: string
}

interface Title {
	russian: string | null
	original: string | null
	__typename: string
}

interface ViewOption {}
