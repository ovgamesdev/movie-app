import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { ToastAndroid } from 'react-native'
import { IListBySlugResults, IListSlugFilter, ISuggestSearchResults } from './types'

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
		getListBySlug: build.query<IListBySlugResults, { slug: string; filters?: IListSlugFilter; order?: string; page?: number; limit?: number }>({
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

				return { docs: movies.items, total, limit, page, pages, name: data.name ?? '' }
			},
			transformErrorResponse: (response, meta, arg) => {
				console.log('transformErrorResponse', { response, meta, arg })

				ToastAndroid.show('KP: Неизвестная ошибка', ToastAndroid.LONG)
			}
		}),
		getSuggestSearch: build.query<ISuggestSearchResults, { keyword: string }>({
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
