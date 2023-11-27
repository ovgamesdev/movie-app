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
	duration?: number
	isShortFilm?: boolean
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
	__typename: 'TvSeries' | 'Film'
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
	originalName: string // | null
	poster: Poster | null
	__typename: 'Person'
}

export interface IMovieItem {
	movie: IGraphqlMovie
	__typename: 'MovieListItem'
}
export interface IPopularMovieListItem {
	movie: IGraphqlMovie
	positionDiff: number
	__typename: 'PopularMovieListItem'
}
export interface ITopMovieListItem {
	movie: IGraphqlMovie
	position: number
	positionDiff: number
	rate: number
	votes: number
	__typename: 'TopMovieListItem'
}
export interface IBoxOfficeMovieListItem {
	movie: IGraphqlMovie
	boxOffice: { amount: number }
	__typename: 'BoxOfficeMovieListItem'
}

export type IListBySlugResultsDocs = IBoxOfficeMovieListItem | ITopMovieListItem | IPopularMovieListItem | IMovieItem
export type IListBySlugResults = { docs: IListBySlugResultsDocs[]; total: number; limit: number; page: number; pages: number; name: string; availableFilters: { items: { id: string; enabled: boolean; name: { russian: string } }[] }; description: string; cover: { avatarsUrl: string } }
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
	person: Pick<Person, 'name' | 'originalName'>
	__typename: string
}

interface Person {
	id?: number
	name: string | null
	originalName: string // | null
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

//
// BaseInfo
//

interface IMovieBaseInfo {
	actors: {
		items: { person: Pick<Person, 'id' | 'name' | 'originalName'> }[]
		total: number
	}
	audience: {
		// TODO ?
		items: { count: number; country: { id: number; name: string } }[]
		total: number
	}
	awards: {
		total: number
	}
	bloopersCount: {
		total: number
	}
	boxOffice: {
		budget: MoneyAmount | null
		marketing: MoneyAmount | null
		rusBox: MoneyAmount | null
		usaBox: MoneyAmount | null
		worldBox: MoneyAmount | null
	}
	composers: {
		items: { person: Pick<Person, 'id' | 'name' | 'originalName'> }[]
	}
	concepts: {
		total: number
	}
	contentId: null | string
	countries: Country[]
	cover: null | { image: { avatarsUrl: string; fallbackUrl: string | null } }
	covers: {
		total: number
	}
	criticReviewsCount: {
		total: number
	}
	designers: { items: { person: Pick<Person, 'id' | 'name' | 'originalName'> }[] }
	directors: { items: { person: Pick<Person, 'id' | 'name' | 'originalName'> }[] }
	distribution: {
		digitalRelease: { items: Release[] }
		originals: { items: Release[] }
		reRelease: { items: Release[] }
		releases: { items: Release[] }
		rusRelease: { items: Release[] }
	}
	duration: number // TODO ?
	editorAnnotation: null // TODO
	episodes: {
		// TODO ?
		total: number
	}
	factsCount: {
		total: number
	}
	fanarts: {
		total: number
	}
	filmAwardWins: {
		total: number
	}
	filmEditors: { items: { person: Pick<Person, 'id' | 'name' | 'originalName'> }[] }
	filmMainAward: { items: []; total: number } // TODO
	filmMainAwardWins: {
		// TODO test maybe ?
		total: number
	}
	genres: Genre[]
	id: number
	images: {
		total: number
	}
	isTicketsAvailable: boolean // TODO ?
	isTvOnly: boolean // TODO ?
	keywords: {
		total: number
	}
	kpProductionYear: number // TODO ?
	mainTrailer: {
		createdAt: string
		duration: number
		id: number
		isEmbedded: boolean
		preview: { avatarsUrl: string; fallbackUrl: string | null }
		sourceVideoUrl: string | null
		streamUrl: string
		title: string
	} | null
	mediaPostsCount: {
		total: number
	}
	negativeCriticReviews: {
		total: number
	}
	operators: { items: { person: Pick<Person, 'id' | 'name' | 'originalName'> }[] }
	ott: {
		// TODO
		preview: {
			availableMetadata: {
				audio: string[]
				subtitles: string[]
			}
			duration?: number
			features: { alias: string; group: string }[]
			timing?: null // TODO
			firstEpisode?: { episodeNumber: number; seasonNumber: number }
			nextEpisode?: null
		}
		promoTrailers: { items: { streamUrl: string }[] }
		skippableFragments?: { startTime: number; endTime: number; type: string }[]
	} | null
	ottProductionYear: number // TODO
	positiveCriticReviews: {
		total: number
	}
	poster: { avatarsUrl: string; fallbackUrl: string | null }
	posters: {
		total: number
	}
	premieres: {
		total: number
	}
	producers: { items: { person: Pick<Person, 'id' | 'name' | 'originalName'> }[] }
	production: {
		total: number
	}
	productionStatus: null // TODO
	productionStatusUpdateDate: null // TODO
	productionYear: number // TODO
	promos: {
		total: number
	}
	rating: {
		expectation: RatingValue | null
		imdb: RatingValue | null
		kinopoisk: RatingValue | null
		reviewCount: RatingValue | null
		russianCritics: RatingValue | null
		worldwideCritics: RatingValue | null
	}
	relatedMovies: {
		total: number
	}
	releaseYears: { start: number | null; end: number | null }[] // TODO ?
	releaseOptions: {
		// TODO ?
		is3d: boolean
		isImax: boolean
	}
	releases: { date: string; releasers: { id: number; name: string }[]; type: string }[] // TYPE: BLURAY | DVD | DIGITAL
	restriction: {
		age: string | null
		mpaa: string | null
	}
	screenshots: {
		total: number
	}
	seasons: {
		// TODO ?
		total: number
	}
	seasonsAll: {
		// TODO ?
		total: number
	}
	seasonsOnline: {
		// TODO ?
		total: number
	}
	sequelsPrequels: {
		items: []
		limit: number
		offset: number
		total: number
	}
	seriesDuration: number // TODO ?
	shootings: {
		total: number
	}
	shortDescription: null | string
	similarMoviesCount: {
		total: number
	}
	sites: {
		total: number
	}
	soundtrack: {
		total: number
	}
	stills: {
		total: number
	}
	synopsis: string | null
	tagline: string | null
	title: {
		english: string | null
		localized: string | null
		original: string | null
		russian: string | null
	}
	top10: number | null
	top250: number | null
	totalDuration: number | null // TODO ?
	trailersCount: {
		total: number
	}
	types: { name: string }[] // TODO ?
	type: string // TODO ?
	userData: null // not used
	userReviews: {
		// TODO ?
		total: number
	}
	usersReviewsCount: {
		total: number
	}
	viewOption: ViewOption | null
	voiceOverActors: { items: { person: Pick<Person, 'id' | 'name' | 'originalName'> }[]; total: number }
	wallpapers: {
		total: number
	}
	watchability: { items: { platform: { logo: { avatarsUrl: string }; name: string }; url: string }[] } // TODO
	watchabilityCount: {
		total: number
	}
	worldPremiere: {
		// TODO
		incompleteDate: { accuracy: string; date: string }
	} | null
	writers: { items: { person: Pick<Person, 'id' | 'name' | 'originalName'> }[] }
	__typename: 'Film' | 'TvSeries'
}

export interface IFilmBaseInfo
	extends Pick<
		IMovieBaseInfo,
		| '__typename'
		| 'actors'
		| 'audience'
		| 'awards'
		| 'bloopersCount'
		| 'boxOffice'
		| 'composers'
		| 'concepts'
		| 'contentId'
		| 'countries'
		| 'cover'
		| 'covers'
		| 'criticReviewsCount'
		| 'designers'
		| 'directors'
		| 'distribution'
		| 'duration'
		| 'editorAnnotation'
		| 'factsCount'
		| 'fanarts'
		| 'filmAwardWins'
		| 'filmEditors'
		| 'filmMainAward'
		| 'genres'
		| 'id'
		| 'images'
		| 'isTicketsAvailable'
		| 'isTvOnly'
		| 'keywords'
		| 'kpProductionYear'
		| 'mainTrailer'
		| 'mediaPostsCount'
		| 'negativeCriticReviews'
		| 'operators'
		| 'ott'
		| 'ottProductionYear'
		| 'positiveCriticReviews'
		| 'poster'
		| 'posters'
		| 'premieres'
		| 'producers'
		| 'production'
		| 'productionStatus'
		| 'productionStatusUpdateDate'
		| 'productionYear'
		| 'promos'
		| 'rating'
		| 'relatedMovies'
		| 'releaseOptions'
		| 'releases'
		| 'restriction'
		| 'screenshots'
		| 'sequelsPrequels'
		| 'shootings'
		| 'shortDescription'
		| 'similarMoviesCount'
		| 'sites'
		| 'soundtrack'
		| 'stills'
		| 'synopsis'
		| 'tagline'
		| 'title'
		| 'top10'
		| 'top250'
		| 'trailersCount'
		| 'type'
		| 'userData'
		| 'usersReviewsCount'
		| 'viewOption'
		| 'voiceOverActors'
		| 'wallpapers'
		| 'watchability'
		| 'watchabilityCount'
		| 'worldPremiere'
		| 'writers'
	> {
	__typename: 'Film'
}
export interface ITvSeriesBaseInfo
	extends Pick<
		IMovieBaseInfo,
		| '__typename'
		| 'actors'
		// | 'audience'
		| 'awards'
		| 'bloopersCount'
		| 'boxOffice'
		| 'composers'
		| 'concepts'
		| 'contentId'
		| 'countries'
		| 'cover'
		| 'covers'
		| 'criticReviewsCount'
		| 'designers'
		| 'directors'
		| 'distribution'
		// | 'duration'
		| 'editorAnnotation'
		| 'episodes'
		| 'factsCount'
		| 'fanarts'
		| 'filmAwardWins'
		| 'filmEditors'
		| 'filmMainAward'
		| 'filmMainAwardWins'
		| 'genres'
		| 'id'
		| 'images'
		// | 'isTicketsAvailable'
		// | 'isTvOnly'
		| 'keywords'
		// | 'kpProductionYear'
		| 'mainTrailer'
		| 'mediaPostsCount'
		| 'negativeCriticReviews'
		| 'operators'
		| 'ott'
		// | 'ottProductionYear'
		| 'positiveCriticReviews'
		| 'poster'
		| 'posters'
		| 'premieres'
		| 'producers'
		| 'production'
		| 'productionStatus'
		| 'productionStatusUpdateDate'
		| 'productionYear'
		| 'promos'
		| 'rating'
		| 'relatedMovies'
		| 'releaseYears'
		// | 'releaseOptions'
		| 'releases'
		| 'restriction'
		| 'screenshots'
		| 'seasons'
		| 'seasonsAll'
		| 'seasonsOnline'
		| 'sequelsPrequels'
		| 'seriesDuration'
		| 'shootings'
		| 'shortDescription'
		| 'similarMoviesCount'
		| 'sites'
		| 'soundtrack'
		| 'stills'
		| 'synopsis'
		| 'tagline'
		| 'title'
		| 'top10'
		| 'top250'
		| 'totalDuration'
		| 'trailersCount'
		// | 'type'
		| 'types'
		| 'userData'
		| 'userReviews'
		| 'usersReviewsCount'
		| 'viewOption'
		| 'voiceOverActors'
		| 'wallpapers'
		| 'watchability'
		| 'watchabilityCount'
		| 'worldPremiere'
		| 'writers'
	> {
	__typename: 'TvSeries'
}

interface MoneyAmount {
	amount: number
	currency: { symbol: string }
}

interface Country {
	id: number
	name: string
}

interface Genre {
	id: number
	name: string
	slug: string
}

interface Release {
	companies: { displayName: string; id: number; slug: string; slugId: number }[]
	date: { accuracy: string; date: string }
}

interface RatingValue {
	count: number
	isActive: boolean
	value: number | null
}
