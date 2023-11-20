import { EntityState, createEntityAdapter } from '@reduxjs/toolkit'
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { ToastAndroid } from 'react-native'
import { IGraphqlMovie, IGraphqlSuggestMovie, IGraphqlSuggestMovieList, IGraphqlSuggestPerson, IListSlugFilter } from './types'

// interface ICacheBaseQueryArgs {
// 	url: string
// 	extraOptions?: {
// 		cacheKey?: string
// 		keepUnusedDataFor?: number
// 	}
// }

// const fetchAndSave = async (args: ICacheBaseQueryArgs, api: BaseQueryApi) => {
// 	try {
// 		const { data } = await fetchBaseQuery({
// 			baseUrl: 'https://api.kinopoisk.dev/',
// 			prepareHeaders: (headers, { getState }) => {
// 				const token = (getState() as RootState).settings.settings.kinopoiskToken

// 				if (token.length > 0) {
// 					headers.set('X-API-KEY', token)
// 				}

// 				return headers
// 			},
// 			validateStatus: (response, body) => response.status === 200
// 		})({ url: args.url }, api, {})

// 		await AsyncStorage.setItem(args.url, JSON.stringify({ data, startedTimeStamp: Date.now() }))

// 		return { data }
// 	} catch (error) {
// 		console.error('Error in fetchAndSave:', error)
// 		return { error: { status: 0, data: undefined } }
// 	}
// }

// const cacheBaseQuery: BaseQueryFn<ICacheBaseQueryArgs, unknown, FetchBaseQueryError> = async (args, api, extraOptions) => {
// 	console.log('cacheBaseQuery', args, api, extraOptions)
// 	console.log('getState', api.getState())

// 	if (args.extraOptions && 'cacheKey' in args.extraOptions) {
// 		const cachedData = await AsyncStorage.getItem(args.url)

// 		if (cachedData !== null) {
// 			try {
// 				const { data, startedTimeStamp } = JSON.parse(cachedData) as { data: ISuccessResponse<ISlug>; startedTimeStamp: number }

// 				if (Date.now() - startedTimeStamp <= (args.extraOptions.keepUnusedDataFor || 60) * 1000) {
// 					return { data }
// 				}
// 			} catch (error) {
// 				console.error('Error parsing cached data:', error)
// 				return { error: { status: 0, data: undefined } }
// 			}
// 		}
// 	}

// 	return fetchAndSave(args, api)
// }

// export const kinopoiskApi = createApi({
// 	reducerPath: 'api/kinopoisk',
// 	refetchOnFocus: true,

// 	baseQuery: cacheBaseQuery,
// 	endpoints: build => ({
// 		getListBySlug: build.query<IResponse<ISlug>, { slug: string; page?: number; limit?: number; cache?: boolean }>({
// 			query: ({ slug, page = 1, limit = 50, cache = false }) => ({
// 				url: `v1.4/movie?page=${page}&limit=${limit}&selectFields=id&selectFields=name&selectFields=enName&selectFields=alternativeName&selectFields=isSeries&selectFields=year&selectFields=releaseYears&selectFields=poster&lists=${slug}`,
// 				extraOptions: cache ? { cacheKey: 'slug', keepUnusedDataFor: 43200 } : {}
// 			}),
// 			transformErrorResponse: (response: { status: number; data: IErrorResponse }, meta, arg) => {
// 				switch (response.data.error) {
// 					case 'Unauthorized':
// 						ToastAndroid.show('KP: Токен указан некорректно!', ToastAndroid.LONG)
// 						return { ...response.data, message: 'KP: Токен указан некорректно!' }
// 					case 'Forbidden':
// 						ToastAndroid.show('KP: Превышен дневной лимит!', ToastAndroid.LONG)
// 						return { ...response.data, message: 'KP: Превышен дневной лимит!' }
// 					default:
// 						ToastAndroid.show('KP: Неизвестная ошибка', ToastAndroid.LONG)
// 						return response.data
// 				}
// 			}
// 		}),
// 		getListBySlugGraphql: build.query<any, { slug: string; page?: number; limit?: number }>({
// 			query: ({ slug, page = 1, limit = 50 }) => ({
// 				url: '',
// 				body: {
// 					operationName: 'MovieDesktopListPage',
// 					variables: {
// 						slug,
// 						platform: 'DESKTOP',
// 						regionId: 10298,
// 						withUserData: false,
// 						supportedFilterTypes: ['BOOLEAN', 'SINGLE_SELECT'],
// 						filters: {
// 							booleanFilterValues: [],
// 							intRangeFilterValues: [],
// 							singleSelectFilterValues: [],
// 							multiSelectFilterValues: [],
// 							realRangeFilterValues: []
// 						},
// 						singleSelectFiltersLimit: 250,
// 						singleSelectFiltersOffset: 0,
// 						moviesLimit: limit,
// 						moviesOffset: limit * page,
// 						moviesOrder: 'POSITION_ASC',
// 						supportedItemTypes: ['COMING_SOON_MOVIE_LIST_ITEM', 'MOVIE_LIST_ITEM', 'TOP_MOVIE_LIST_ITEM', 'POPULAR_MOVIE_LIST_ITEM', 'MOST_PROFITABLE_MOVIE_LIST_ITEM', 'MOST_EXPENSIVE_MOVIE_LIST_ITEM', 'BOX_OFFICE_MOVIE_LIST_ITEM', 'OFFLINE_AUDIENCE_MOVIE_LIST_ITEM', 'RECOMMENDATION_MOVIE_LIST_ITEM']
// 					},
// 					query:
// 						'query MovieDesktopListPage($slug: String!, $platform: WebClientPlatform!, $withUserData: Boolean!, $regionId: Int!, $supportedFilterTypes: [FilterType]!, $filters: FilterValuesInput, $singleSelectFiltersLimit: Int!, $singleSelectFiltersOffset: Int!, $moviesLimit: Int, $moviesOffset: Int, $moviesOrder: MovieListItemOrderBy, $supportedItemTypes: [MovieListItemType]) { movieListBySlug(slug: $slug, supportedFilterTypes: $supportedFilterTypes, filters: $filters) { id name description cover { avatarsUrl __typename } ...MovieListCompositeName ...MovieListAvailableFilters ...MovieList ...DescriptionLink __typename } webPage(platform: $platform) { kpMovieListPage(movieListSlug: $slug) { htmlMeta { ...OgImage __typename } footer { ...FooterConfigData __typename } featuring { ...MovieListFeaturingData __typename } __typename } __typename } } fragment MovieListCompositeName on MovieListMeta { compositeName { parts { ... on FilterReferencedMovieListNamePart { filterValue { ... on SingleSelectFilterValue { filterId __typename } __typename } name __typename } ... on StaticMovieListNamePart { name __typename } __typename } __typename } __typename } fragment MovieListAvailableFilters on MovieListMeta { availableFilters { items { ... on BooleanFilter { ...ToggleFilter __typename } ... on SingleSelectFilter { ...SingleSelectFilters __typename } __typename } __typename } __typename } fragment ToggleFilter on BooleanFilter { id enabled name { russian __typename } __typename } fragment SingleSelectFilters on SingleSelectFilter { id name { russian __typename } hint { russian __typename } values(offset: $singleSelectFiltersOffset, limit: $singleSelectFiltersLimit) { items { name { russian __typename } selectable value __typename } __typename } __typename } fragment MovieList on MovieListMeta { movies(limit: $moviesLimit, offset: $moviesOffset, orderBy: $moviesOrder, supportedItemTypes: $supportedItemTypes) { total items { movie { id contentId title { russian original __typename } poster { avatarsUrl fallbackUrl __typename } countries { id name __typename } genres { id name __typename } cast: members(role: [ACTOR], limit: 3) { items { details person { name originalName __typename } __typename } __typename } directors: members(role: [DIRECTOR], limit: 1) { items { details person { name originalName __typename } __typename } __typename } url rating { kinopoisk { isActive count value __typename } expectation { isActive count value __typename } __typename } mainTrailer { id isEmbedded __typename } viewOption { buttonText originalButtonText promotionIcons { avatarsUrl fallbackUrl __typename } isAvailableOnline: isWatchable(filter: {anyDevice: false, anyRegion: false}) purchasabilityStatus type rightholderLogoUrlForPoster availabilityAnnounce { availabilityDate type groupPeriodType announcePromise __typename } __typename } isTicketsAvailable(regionId: $regionId) ... on Film { productionYear duration isShortFilm top250 __typename } ... on TvSeries { releaseYears { start end __typename } seriesDuration totalDuration top250 __typename } ... on MiniSeries { releaseYears { start end __typename } seriesDuration totalDuration top250 __typename } ... on TvShow { releaseYears { start end __typename } seriesDuration totalDuration top250 __typename } ... on Video { productionYear duration isShortFilm __typename } ...MovieListUserData @include(if: $withUserData) __typename } ... on TopMovieListItem { position positionDiff rate votes __typename } ... on MostProfitableMovieListItem { boxOffice { amount __typename } budget { amount __typename } ratio __typename } ... on MostExpensiveMovieListItem { budget { amount __typename } __typename } ... on OfflineAudienceMovieListItem { viewers __typename } ... on PopularMovieListItem { positionDiff __typename } ... on BoxOfficeMovieListItem { boxOffice { amount __typename } __typename } ... on RecommendationMovieListItem { __typename } ... on ComingSoonMovieListItem { releaseDate { date accuracy __typename } __typename } __typename } __typename } __typename } fragment MovieListUserData on Movie { userData { folders { id name public __typename } watchStatuses { notInterested { value __typename } watched { value __typename } __typename } voting { value votedAt __typename } __typename } __typename } fragment DescriptionLink on MovieListMeta { descriptionLink { title url __typename } __typename } fragment OgImage on HtmlMeta { openGraph { image { avatarsUrl __typename } __typename } __typename } fragment FooterConfigData on FooterConfiguration { socialNetworkLinks { icon { avatarsUrl __typename } url title __typename } appMarketLinks { icon { avatarsUrl __typename } url title __typename } links { title url __typename } __typename } fragment MovieListFeaturingData on MovieListFeaturing { items { title url __typename } __typename } '
// 				}
// 			})
// 		})
// 	})
// })

const kinopoiskItemsAdapter = createEntityAdapter({
	selectId: (item: { movie: IGraphqlMovie; positionDiff: number }) => item.movie.id
})

const kinopoiskItemsSelector = kinopoiskItemsAdapter.getSelectors()

export const kinopoiskApi = createApi({
	reducerPath: 'api/kinopoisk',
	refetchOnFocus: true,

	baseQuery: fetchBaseQuery({
		baseUrl: 'https://graphql.kinopoisk.ru/graphql/',
		validateStatus: (response, body) => {
			if (!(body.data?.movieListBySlug?.movies?.items?.length > 0) && body.errors?.length > 0) {
				return false
			}

			return response.status === 200
		}
	}),
	endpoints: build => ({
		getListBySlug: build.query<{ docs: EntityState<{ movie: IGraphqlMovie; positionDiff: number }>; total: number; limit: number; page: number; pages: number; name: string }, { slug: string; filters?: IListSlugFilter; order?: string; page?: number; limit?: number }>({
			query: ({
				slug,
				filters = {
					booleanFilterValues: [],
					intRangeFilterValues: [],
					singleSelectFilterValues: [],
					multiSelectFilterValues: [],
					realRangeFilterValues: []
				},
				order: moviesOrder = 'POSITION_ASC',
				page = 1,
				limit = 25
			}) => ({
				url: '?operationName=MovieDesktopListPage',
				method: 'post',
				body: {
					operationName: 'MovieDesktopListPage',
					variables: {
						slug,
						platform: 'DESKTOP',
						regionId: 10298,
						withUserData: false,
						supportedFilterTypes: ['BOOLEAN', 'SINGLE_SELECT'],
						filters,
						singleSelectFiltersLimit: 250,
						singleSelectFiltersOffset: 0,
						moviesLimit: limit,
						moviesOffset: limit * (page - 1),
						moviesOrder,
						supportedItemTypes: ['COMING_SOON_MOVIE_LIST_ITEM', 'MOVIE_LIST_ITEM', 'TOP_MOVIE_LIST_ITEM', 'POPULAR_MOVIE_LIST_ITEM', 'MOST_PROFITABLE_MOVIE_LIST_ITEM', 'MOST_EXPENSIVE_MOVIE_LIST_ITEM', 'BOX_OFFICE_MOVIE_LIST_ITEM', 'OFFLINE_AUDIENCE_MOVIE_LIST_ITEM', 'RECOMMENDATION_MOVIE_LIST_ITEM']
					},
					query:
						'query MovieDesktopListPage($slug: String!, $platform: WebClientPlatform!, $withUserData: Boolean!, $regionId: Int!, $supportedFilterTypes: [FilterType]!, $filters: FilterValuesInput, $singleSelectFiltersLimit: Int!, $singleSelectFiltersOffset: Int!, $moviesLimit: Int, $moviesOffset: Int, $moviesOrder: MovieListItemOrderBy, $supportedItemTypes: [MovieListItemType]) { movieListBySlug(slug: $slug, supportedFilterTypes: $supportedFilterTypes, filters: $filters) { id name description cover { avatarsUrl __typename } ...MovieListCompositeName ...MovieListAvailableFilters ...MovieList ...DescriptionLink __typename } webPage(platform: $platform) { kpMovieListPage(movieListSlug: $slug) { htmlMeta { ...OgImage __typename } footer { ...FooterConfigData __typename } featuring { ...MovieListFeaturingData __typename } __typename } __typename } } fragment MovieListCompositeName on MovieListMeta { compositeName { parts { ... on FilterReferencedMovieListNamePart { filterValue { ... on SingleSelectFilterValue { filterId __typename } __typename } name __typename } ... on StaticMovieListNamePart { name __typename } __typename } __typename } __typename } fragment MovieListAvailableFilters on MovieListMeta { availableFilters { items { ... on BooleanFilter { ...ToggleFilter __typename } ... on SingleSelectFilter { ...SingleSelectFilters __typename } __typename } __typename } __typename } fragment ToggleFilter on BooleanFilter { id enabled name { russian __typename } __typename } fragment SingleSelectFilters on SingleSelectFilter { id name { russian __typename } hint { russian __typename } values(offset: $singleSelectFiltersOffset, limit: $singleSelectFiltersLimit) { items { name { russian __typename } selectable value __typename } __typename } __typename } fragment MovieList on MovieListMeta { movies(limit: $moviesLimit, offset: $moviesOffset, orderBy: $moviesOrder, supportedItemTypes: $supportedItemTypes) { total items { movie { id contentId title { russian original __typename } poster { avatarsUrl fallbackUrl __typename } countries { id name __typename } genres { id name __typename } cast: members(role: [ACTOR], limit: 3) { items { details person { name originalName __typename } __typename } __typename } directors: members(role: [DIRECTOR], limit: 1) { items { details person { name originalName __typename } __typename } __typename } url rating { kinopoisk { isActive count value __typename } expectation { isActive count value __typename } __typename } mainTrailer { id isEmbedded __typename } viewOption { buttonText originalButtonText promotionIcons { avatarsUrl fallbackUrl __typename } isAvailableOnline: isWatchable(filter: {anyDevice: false, anyRegion: false}) purchasabilityStatus type rightholderLogoUrlForPoster availabilityAnnounce { availabilityDate type groupPeriodType announcePromise __typename } __typename } isTicketsAvailable(regionId: $regionId) ... on Film { productionYear duration isShortFilm top250 __typename } ... on TvSeries { releaseYears { start end __typename } seriesDuration totalDuration top250 __typename } ... on MiniSeries { releaseYears { start end __typename } seriesDuration totalDuration top250 __typename } ... on TvShow { releaseYears { start end __typename } seriesDuration totalDuration top250 __typename } ... on Video { productionYear duration isShortFilm __typename } ...MovieListUserData @include(if: $withUserData) __typename } ... on TopMovieListItem { position positionDiff rate votes __typename } ... on MostProfitableMovieListItem { boxOffice { amount __typename } budget { amount __typename } ratio __typename } ... on MostExpensiveMovieListItem { budget { amount __typename } __typename } ... on OfflineAudienceMovieListItem { viewers __typename } ... on PopularMovieListItem { positionDiff __typename } ... on BoxOfficeMovieListItem { boxOffice { amount __typename } __typename } ... on RecommendationMovieListItem { __typename } ... on ComingSoonMovieListItem { releaseDate { date accuracy __typename } __typename } __typename } __typename } __typename } fragment MovieListUserData on Movie { userData { folders { id name public __typename } watchStatuses { notInterested { value __typename } watched { value __typename } __typename } voting { value votedAt __typename } __typename } __typename } fragment DescriptionLink on MovieListMeta { descriptionLink { title url __typename } __typename } fragment OgImage on HtmlMeta { openGraph { image { avatarsUrl __typename } __typename } __typename } fragment FooterConfigData on FooterConfiguration { socialNetworkLinks { icon { avatarsUrl __typename } url title __typename } appMarketLinks { icon { avatarsUrl __typename } url title __typename } links { title url __typename } __typename } fragment MovieListFeaturingData on MovieListFeaturing { items { title url __typename } __typename } '
				},
				headers: {
					'Service-Id': '25'
				}
			}),
			transformResponse: (response, meta, arg) => {
				const data = (response as any)?.data?.movieListBySlug
				const movies = data?.movies ?? { items: [], total: 0 }

				const total = movies.total
				const limit = arg.limit ?? 25
				const page = arg.page ?? 1
				const pages = Math.ceil(total / limit)

				return { docs: kinopoiskItemsAdapter.addMany(kinopoiskItemsAdapter.getInitialState(), movies.items), total, limit, page, pages, name: data.name ?? '' }
			},
			transformErrorResponse: (response, meta, arg) => {
				console.log('transformErrorResponse', { response, meta, arg })

				ToastAndroid.show('KP: Неизвестная ошибка', ToastAndroid.LONG)
			},
			forceRefetch: ({ currentArg, previousArg }) => {
				return currentArg?.page !== previousArg?.page || currentArg?.limit !== previousArg?.limit || JSON.stringify(currentArg?.filters) !== JSON.stringify(previousArg?.filters)
			},
			serializeQueryArgs: ({ endpointName, queryArgs }) => {
				return `${endpointName}-${queryArgs.slug}-${queryArgs?.limit}-${JSON.stringify(queryArgs?.filters)}`
			},
			merge: (currentState, incomingState) => {
				kinopoiskItemsAdapter.addMany(currentState.docs, kinopoiskItemsSelector.selectAll(incomingState.docs))
			}
		}),
		getSuggestSearch: build.query<{ cinemas: any[]; movieLists: { movieList: IGraphqlSuggestMovieList }[]; movies: { movie: IGraphqlSuggestMovie }[]; persons: { person: IGraphqlSuggestPerson }[]; topResult: { global: IGraphqlSuggestMovie | IGraphqlSuggestPerson | IGraphqlSuggestMovieList } | null }, { keyword: string }>({
			query: ({ keyword }) => ({
				url: '?operationName=SuggestSearch',
				method: 'post',
				body: {
					operationName: 'SuggestSearch',
					variables: {
						keyword,
						yandexCityId: 10298,
						limit: 3
					},
					query:
						'query SuggestSearch($keyword: String!, $yandexCityId: Int, $limit: Int) { suggest(keyword: $keyword) { top(yandexCityId: $yandexCityId, limit: $limit) { topResult { global { ...SuggestMovieItem ...SuggestPersonItem ...SuggestCinemaItem ...SuggestMovieListItem __typename } __typename } movies { movie { ...SuggestMovieItem __typename } __typename } persons { person { ...SuggestPersonItem __typename } __typename } cinemas { cinema { ...SuggestCinemaItem __typename } __typename } movieLists { movieList { ...SuggestMovieListItem __typename } __typename } __typename } __typename } } fragment SuggestMovieItem on Movie { id contentId title { russian original __typename } rating { kinopoisk { isActive value __typename } __typename } poster { avatarsUrl fallbackUrl __typename } viewOption { buttonText isAvailableOnline: isWatchable(filter: {anyDevice: false, anyRegion: false}) purchasabilityStatus contentPackageToBuy { billingFeatureName __typename } type availabilityAnnounce { groupPeriodType announcePromise availabilityDate type __typename } __typename } ... on Film { type productionYear __typename } ... on TvSeries { releaseYears { end start __typename } __typename } ... on TvShow { releaseYears { end start __typename } __typename } ... on MiniSeries { releaseYears { end start __typename } __typename } __typename } fragment SuggestPersonItem on Person { id name originalName birthDate poster { avatarsUrl fallbackUrl __typename } __typename } fragment SuggestCinemaItem on Cinema { id ctitle: title city { id name geoId __typename } __typename } fragment SuggestMovieListItem on MovieListMeta { id cover { avatarsUrl __typename } coverBackground { avatarsUrl __typename } name url description movies(limit: 0) { total __typename } __typename } '
				},
				headers: {
					'Service-Id': '25'
				}
			}),
			transformResponse: (response, meta, arg) => {
				console.log('response', response)
				const top = (response as any)?.data?.suggest?.top

				return top
			},
			transformErrorResponse: (response, meta, arg) => {
				console.log('transformErrorResponse', { response, meta, arg })

				ToastAndroid.show('KP: Неизвестная ошибка', ToastAndroid.LONG)
			}
		})
	})
})

export const { useGetListBySlugQuery, useGetSuggestSearchQuery } = kinopoiskApi

export { kinopoiskItemsAdapter, kinopoiskItemsSelector }
