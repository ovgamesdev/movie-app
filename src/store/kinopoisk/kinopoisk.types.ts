export interface IListSlugFilter {
	booleanFilterValues: BooleanFilterValues[]
	intRangeFilterValues: []
	singleSelectFilterValues: SingleSelectFilterValues[]
	multiSelectFilterValues: []
	realRangeFilterValues: []
}

type SingleSelectFilterValues = { filterId: string; value: string }
type BooleanFilterValues = { filterId: string; value: boolean }

export type MovieType = 'TvSeries' | 'Film' | 'MiniSeries' | 'Video' | 'TvShow'
export type MovieFilmType = 'Film' | 'Video'
export type MovieSeriesType = 'TvSeries' | 'MiniSeries' | 'TvShow'

export interface IGraphqlMovie {
	id: number
	contentId: string | null
	title: Title
	poster: Poster | null
	countries: Country[]
	genres: Country[] // TODO not Country { name: string }
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
	productionYear?: number | null
	seriesDuration: number | null
	totalDuration: number | null
	top250: number | null
	__typename: MovieType
}

export interface IGraphqlSuggestMovie {
	contentId: string | null
	id: number
	poster: Poster | null
	productionYear?: number | null
	rating: Rating
	releaseYears?: ReleaseYear[]
	title: Title
	type: string // TV_ONLY | NORMAL | VIDEO_ONLY
	viewOption: ViewOption | null
	__typename: MovieType
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
export type IListBySlugResults = { docs: IListBySlugResultsDocs[]; total: number; limit: number; page: number; pages: number; name: string; availableFilters: IAvailableFilters; description: string; cover: { avatarsUrl: string } }
export type ISuggestSearchResults = { cinemas: any[]; movieLists: { movieList: IGraphqlSuggestMovieList | null }[]; movies: { movie: IGraphqlSuggestMovie | null }[]; persons: { person: IGraphqlSuggestPerson | null }[]; topResult: { global: IGraphqlSuggestMovie | IGraphqlSuggestPerson | IGraphqlSuggestMovieList | null } | null }

export interface IAvailableFilters {
	items: (BooleanFilter | SingleSelectFilter)[]
}

export type BooleanFilter = { id: string; enabled: boolean; name: { russian: string }; __typename: 'BooleanFilter' }
export type SingleSelectFilter = { hint: { russian: string }; id: string; name: { russian: string }; values: { items: { name: { russian: string }; selectable: boolean; value: string }[] }; __typename: 'SingleSelectFilter' }

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
	// __typename: string
}

interface Item {
	details: null | string
	person: Pick<Person, 'name' | 'originalName'>
	// __typename: string
}

export interface Person {
	id?: number
	name: string | null
	originalName: string // | null
	// __typename: string
}

export interface Country {
	id: number
	name: string
	// __typename: string
}

interface MainTrailer {
	id: number
	isEmbedded: boolean
	// __typename: string
}

interface Poster {
	avatarsUrl: string | null
	fallbackUrl: string | null
	// __typename: string
}

interface Rating {
	kinopoisk: RatingValue | null
	expectation: RatingValue | null
	// __typename: string
}

export interface ReleaseYear {
	start: number | null
	end: number | null
	// __typename: string
}

interface Title {
	russian: string | null
	original: string | null
	// __typename: string
}

interface ViewOption {}

//
// BaseInfo
//
export interface IMovieBaseInfo {
	actors: {
		items: { person: Pick<Person, 'id' | 'name' | 'originalName'> }[]
		total: number
	}
	// TODO ?
	audience: Audience
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
	isShortFilm?: boolean
	isTicketsAvailable: boolean // TODO ?
	isTvOnly: boolean // TODO ?
	keywords: {
		total: number
	}
	kpProductionYear: number // TODO ?
	mainTrailer: IMainTrailer | null
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
	poster: Poster | null
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
	productionStatus: ProductionStatus
	productionStatusUpdateDate: string | null
	productionYear: number | null
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
	releases: Releases[]
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
		items: { movie: SequelsPrequelsMovie; relationType: string }[]
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
	__typename: MovieType
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
	__typename: MovieSeriesType
}

export type ProductionStatus = 'ANNOUNCED' | 'COMPLETED' | 'FILMING' | 'POST_PRODUCTION' | 'PRE_PRODUCTION' | 'UNKNOWN' | null

export interface Releases {
	date: string
	releasers: { id: number; name: string }[]
	type: string // TYPE: BLURAY | DVD | DIGITAL
}

export interface Audience {
	items: { count: number; country: { id: number; name: string } }[]
	total: number
}

export interface IMainTrailer {
	createdAt: string
	duration: number
	id: number
	isEmbedded: boolean
	preview: { avatarsUrl: string; fallbackUrl: string | null } | null
	sourceVideoUrl: string | null
	streamUrl: string
	title: string
}

export interface ISimilarMovieResults {
	items: { movie: ISimilarMovie; types: string[] }[]
	total: number
}

export interface ISimilarMovie extends Pick<IMovieBaseInfo, '__typename' | 'countries' | 'genres' | 'id' | 'poster' | 'productionYear' | 'releaseYears' | 'userData' | 'viewOption'> {
	rating: {
		expectation: RatingValue | null
		kinopoisk: RatingValue | null
	}
	title: {
		english: string | null
		// localized: string | null
		original: string | null
		russian: string | null
	}
}

export interface MoneyAmount {
	amount: number
	currency: { symbol: string }
}

export interface Genre {
	id: number
	name: string
	slug: string
}

export interface Release {
	companies: ({ displayName: string; id: number; slug: string; slugId: number } | { displayName: string; id: number; originalsMovieList: { url: string; id: number } })[]
	date: { accuracy: string; date: string } | null
}

export interface RatingValue {
	count: number
	isActive: boolean
	value: number | null
}

interface SequelsPrequelsMovie extends Pick<IMovieBaseInfo, '__typename' | 'countries' | 'genres' | 'id' | 'poster' | 'releaseYears' | 'productionYear' | 'userData' | 'viewOption'> {
	rating: {
		expectation: RatingValue | null
		kinopoisk: RatingValue | null
	}
	title: {
		english: string | null
		// localized: string | null
		original: string | null
		russian: string | null
	}
}

// PersonBaseInfo

export interface IPersonBaseInfoResults {
	age: number
	bestFilms: { items: { movie: PersonBestMovie }[] }
	bestSeries: { items: { movie: PersonBestMovie }[] }
	birthPlace: string | null
	dateOfBirth: { accuracy: string; date: string } | null
	dateOfDeath: { accuracy: string; date: string } | null
	deathPlace: string | null
	factsCount: {
		total: number
	}
	filmographyYears: { end: number; start: number } | null
	gender: string // 'FEMALE' | 'MALE' // TODO null
	height: number | null
	id: number
	images: {
		total: number
	}
	mainAwardWinNominationsTotal: {
		total: number
	}
	mainGenres: Genre[]
	marriages: {
		children: number
		spouse: {
			gender: string
			id: number
			name: string | null
			originalName: string // TODO null
			published: boolean
		}
		status: string // 'ANNULMENT' | 'DIVORCE' | 'OK | 'SPOUSE_DEATH'
	}[]
	mediaPostsCount: {
		total: number
	}
	movieCount: {
		total: number
	}
	name: string | null
	onlineFilmsCount: {
		total: number
	}
	originalName: string // TODO null
	personMainAward: {
		items: PersonAwardNominee[]
		total: number
	}
	popularMovies: {
		items: { movie: PersonPopularMovie }[]
	}
	poster: Poster | null
	roles: {
		items: { role: { slug: string; title: { russian: string } } }[]
	}
	userData: null // not used
	zodiacSign: {
		slug: string
		title: { russian: string }
	} | null
	__typename: 'Person'
}

interface PersonAwardNominee {
	movie: Pick<IGraphqlMovie, 'id' | 'title'>
	nomination: {
		award: Award
		title: string
	}
	win: boolean
}

interface Award {
	slug: string
	title: string
	year: number
}

interface PersonPopularMovie extends Pick<IGraphqlMovie, '__typename' | 'genres' | 'id' | 'isTicketsAvailable' | 'poster' | 'productionYear' | 'releaseYears' | 'viewOption'> {
	rating: {
		expectation: RatingValue | null
		kinopoisk: RatingValue | null
	}
	title: {
		original: string | null
		russian: string | null
	}
}

interface PersonBestMovie extends Pick<IGraphqlMovie, '__typename' | 'id'> {
	title: {
		russian: string | null
	}
}

// EPISODES

export interface ITvSeriesEpisodesResults {
	episodesCount: number
	futureEpisodes: {
		items: Episode[]
	}
	id: number
	releasedEpisodes: {
		items: Episode[]
	}
}

interface Episode {
	id: number
	number: number
	releaseDate: { accuracy: string; date: string }
	season: {
		number: number
	}
	title: {
		original: string | null
		russian: string | null
	}
}

// PERSON FilmographyItems

export type IFilmographyItemsResults = { docs: OIFilmographyItem[]; total: number; limit: number; page: number; pages: number }

export interface OIFilmographyItem {
	movie: IFilmographyItemSeries | IFilmographyItemFilm
	participations: {
		items: {
			name: string | null
			notice: string | null
			relatedCast?: { name: string; person: { id: number; name: string; url: string } }
			role: { slug: string; title: { english: string | null; russian: string } }
		}[]
	} // TODO
	salaries: { items: [] } // TODO
	__typename: 'FilmographyItem'
}

interface IFilmographyItemSeries extends Pick<IMovieBaseInfo, 'contentId' | 'countries' | 'genres' | 'id' | 'isShortFilm' | 'isTicketsAvailable' | 'poster' | 'releaseYears' | 'top250' | 'userData' | 'viewOption'> {
	rating: Rating
	title: {
		english: string | null
		original: string | null
		russian: string | null
	}
	__typename: MovieSeriesType
}

interface IFilmographyItemFilm extends Pick<IMovieBaseInfo, 'contentId' | 'countries' | 'genres' | 'id' | 'isShortFilm' | 'isTicketsAvailable' | 'poster' | 'productionYear' | 'top250' | 'userData' | 'viewOption'> {
	rating: Rating
	title: {
		english: string | null
		original: string | null
		russian: string | null
	}
	__typename: MovieFilmType
}

// FilmographyFilters

export interface IFilmographyFiltersResults {
	genres: {
		items: { id: number; name: string; slug: string; __typename: 'Genre' }[]
		__typename: 'PagingList_Genre'
	}
	roles: {
		id: number
		roles: { items: { movies: { total: number }; role: { slug: string; title: { english: string | null; russian: string } } }[] }
		__typename: 'Person'
	}
	years: {
		filmographyYears: {
			end: number
			start: number
			__typename: 'YearsRange'
		}
		id: number
		__typename: 'Person'
	}
}

// OriginalMovies

export interface IOriginalMoviesResults {
	items: { companies: ReleaseCompany[] }[]
}

interface IOriginalMovieListItem extends Pick<IMovieBaseInfo, '__typename' | 'genres' | 'id' | 'releaseYears' | 'productionYear' | 'userData' | 'viewOption'> {
	title: {
		original: string | null
		russian: string | null
	}
	rating: {
		expectation: RatingValue | null
		kinopoisk: RatingValue | null
	}
	poster: null | {
		avatarsUrl: string | null
	}
}

export interface IOriginalMovieItem {
	movie: IOriginalMovieListItem
	__typename: 'MovieListItem'
}

interface ReleaseCompany {
	displayName: string
	id: number
	originalsMovieList: {
		id: number
		movies: {
			items: IOriginalMovieItem[]
			total: number
		}
		url: string
	}
}

// HdShowcase

export interface IHdShowcaseResults {
	items: { content: { items: MovieSelectionItem[] }; id: string; title: string }[]
}

export interface IHdShowcaseListItem extends Pick<IMovieBaseInfo, '__typename' | 'contentId' | 'genres' | 'id' | 'top10' | 'top250' | 'viewOption'> {
	title: {
		russian: string | null
	}
	rating: {
		kinopoisk: RatingValue | null
	}
	gallery: {
		posters: {
			vertical: {
				avatarsUrl: string | null
			} | null
			verticalWithRightholderLogo: {
				avatarsUrl: string | null
			} | null
		}
	}
}

export interface MovieSelectionItem {
	movie: IHdShowcaseListItem
	__typename: 'MovieSelectionItem'
}
