import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { IFilmBaseInfo, IFilmographyFiltersResults, IFilmographyItemsResults, IListBySlugResults, IListSlugFilter, IPersonBaseInfoResults, ISimilarMovieResults, ISuggestSearchResults, ITvSeriesBaseInfo, ITvSeriesEpisodesResults } from '@store/kinopoisk'
import { ToastAndroid } from 'react-native'

export const kinopoiskApi = createApi({
	reducerPath: 'api/kinopoisk',
	refetchOnFocus: true,

	baseQuery: fetchBaseQuery({
		baseUrl: 'https://graphql.kinopoisk.ru/graphql/',
		validateStatus: (response, body) => {
			// TODO add check errors
			// if (!(body.data?.movieListBySlug?.movies?.items?.length > 0) && body.errors?.length > 0) {
			// 	return false
			// }

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

				return { docs: movies.items, total, limit, page, pages, name: data.name ?? '', availableFilters: data.availableFilters ?? [], cover: data.cover, description: data.description }
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
		}),
		getFilmBaseInfo: build.query<IFilmBaseInfo, { filmId: number }>({
			query: ({ filmId }) => ({
				url: '?operationName=FilmBaseInfo',
				method: 'post',
				body: {
					operationName: 'FilmBaseInfo',
					variables: {
						filmId,
						isAuthorized: true,
						regionId: 10298,
						actorsLimit: 10,
						voiceOverActorsLimit: 5,
						relatedMoviesLimit: 14,
						mediaBillingTarget: 'kp-0822',
						checkSilentInvoiceAvailability: true
					},
					query:
						'query FilmBaseInfo($filmId: Long!, $isAuthorized: Boolean!, $regionId: Int!, $mediaBillingTarget: String!, $checkSilentInvoiceAvailability: Boolean, $actorsLimit: Int, $voiceOverActorsLimit: Int, $relatedMoviesLimit: Int) { film(id: $filmId) { id contentId type isTvOnly top250 top10 shortDescription synopsis title { russian english original __typename } productionYear productionStatus productionStatusUpdateDate genres { id name slug __typename } ...FilmIsTicketsAvailable ott { preview { availableMetadata(filter: {isSupportedByClient: null}) { audio subtitles __typename } ... on OttPreview_AbstractVideo { duration timing @include(if: $isAuthorized) { current maximum __typename } __typename } ...OttPreviewFeatures __typename } promoTrailers: trailers(onlyPromo: true, limit: 1) { items { streamUrl __typename } __typename } ... on Ott_AbstractVideo { skippableFragments { startTime endTime type __typename } __typename } __typename } editorAnnotation countries { id name __typename } restriction { age mpaa __typename } mainTrailer { id title preview { avatarsUrl fallbackUrl __typename } duration createdAt isEmbedded streamUrl sourceVideoUrl __typename } releaseOptions { isImax is3d __typename } cover { image { avatarsUrl fallbackUrl __typename } __typename } viewOption { ...ViewOption __typename } actors: members(limit: $actorsLimit, role: [ACTOR, CAMEO, UNCREDITED]) { items { person { id name originalName __typename } __typename } total __typename } voiceOverActors: members(limit: $voiceOverActorsLimit, role: VOICEOVER) { items { person { id name originalName __typename } __typename } total __typename } tagline directors: members(role: DIRECTOR, limit: 4) { items { person { id name originalName __typename } __typename } __typename } writers: members(role: WRITER, limit: 4) { items { person { id name originalName __typename } __typename } __typename } producers: members(role: PRODUCER, limit: 4) { items { person { id name originalName __typename } __typename } __typename } operators: members(role: OPERATOR, limit: 4) { items { person { id name originalName __typename } __typename } __typename } composers: members(role: COMPOSER, limit: 4) { items { person { id name originalName __typename } __typename } __typename } designers: members(role: [PRODUCTION_DESIGNER, DESIGN, ART, COSTUMER, DECORATOR], limit: 13) { items { person { id name originalName __typename } __typename } __typename } filmEditors: members(role: EDITOR, limit: 4) { items { person { id name originalName __typename } __typename } __typename } boxOffice { budget { amount currency { symbol __typename } __typename } rusBox { amount currency { symbol __typename } __typename } usaBox { amount currency { symbol __typename } __typename } worldBox { amount currency { symbol __typename } __typename } marketing { amount currency { symbol __typename } __typename } __typename } ...MoviePoster rating { expectation { value count isActive __typename } imdb { value count isActive __typename } kinopoisk { value count isActive __typename } russianCritics { value count isActive __typename } worldwideCritics { value percent count isActive positiveCount negativeCount __typename } reviewCount { value count isActive __typename } __typename } duration keywords(limit: 0) { total __typename } awards(limit: 0) { total __typename } premieres(limit: 0) { total __typename } relatedMovies(limit: 0) { total __typename } images(limit: 0) { total __typename } ...MovieImagesStats sites(limit: 0) { total __typename } soundtrack(limit: 0) { total __typename } production(limit: 0) { total __typename } negativeCriticReviews: criticReviews(types: NEGATIVE, limit: 0) { total __typename } positiveCriticReviews: criticReviews(types: POSITIVE, limit: 0) { total __typename } audience(limit: 3) { total items { count country { id name __typename } __typename } __typename } releases { date releasers { id name __typename } type __typename } worldPremiere { incompleteDate { accuracy date __typename } __typename } distribution { rusRelease: releases(types: [CINEMA], rerelease: false, countryId: 2, limit: 1) { ...releasesInfoFragment __typename } digitalRelease: releases(types: [DIGITAL], limit: 1) { ...releasesInfoFragment __typename } reRelease: releases(types: [CINEMA], rerelease: true, countryId: 2, limit: 1) { ...releasesInfoFragment __typename } originals: releases(original: true, types: [DIGITAL], limit: 1) { ...OriginalsFragment __typename } __typename } filmMainAward: awards(isMain: true, limit: 15) { items { nomination { award { title slug year __typename } title __typename } win __typename } total __typename } filmAwardWins: awards(isMain: true, isWin: true, limit: 0) { total __typename } ...FilmUserData @include(if: $isAuthorized) sequelsPrequels: relatedMovies(limit: $relatedMoviesLimit, type: [BEFORE, AFTER], orderBy: PREMIERE_DATE_ASC) { total limit offset items { relationType movie { id title { russian english original __typename } countries { id name __typename } ...MoviePoster genres { id name slug __typename } rating { expectation { value count isActive __typename } kinopoisk { value count isActive __typename } __typename } viewOption { buttonText isAvailableOnline: isWatchable(filter: {anyDevice: false, anyRegion: false}) purchasabilityStatus contentPackageToBuy { billingFeatureName __typename } type posterWithRightholderLogo __typename } userData @include(if: $isAuthorized) { voting { value __typename } __typename } ... on Film { productionYear __typename } ... on Video { productionYear __typename } ... on TvSeries { releaseYears { start end __typename } __typename } ... on TvShow { releaseYears { start end __typename } __typename } ... on MiniSeries { releaseYears { start end __typename } __typename } __typename } __typename } __typename } watchability { items { platform { name logo { avatarsUrl __typename } __typename } url __typename } __typename } ...MovieSeoInfo ...MovieFactsCount ...MovieBloopersCount ...MovieUsersReviewsCount ...MovieMediaPostsCount ...MovieTrailersCount ...MovieCriticReviewsCount ...MovieSimilarMoviesCount ...MovieOriginalMoviesCount __typename } tvSeries(id: $filmId) { id __typename } webPage(platform: DESKTOP) { kpFilmPage(filmId: $filmId) { additionalInfoBlocks { ...BlocksConfigFragment __typename } sidebarBlocks { ...BlocksConfigFragment __typename } footer { ...FooterConfigData __typename } htmlMeta { ...OgImage __typename } __typename } __typename } } fragment FilmIsTicketsAvailable on Film { isTicketsAvailable(regionId: $regionId) __typename } fragment OttPreviewFeatures on OttPreview { features(filter: {layout: OTT_TITLE_CARD, onlyClientSupported: true}) { alias group __typename } __typename } fragment ViewOption on ViewOption { type purchasabilityStatus buttonText originalButtonText descriptionText promotionActionType texts { disclaimer __typename } rightholderLogoUrlForPoster posterWithRightholderLogo isAvailableOnline: isWatchable(filter: {anyDevice: false, anyRegion: false}) isWatchable(filter: {anyDevice: true, anyRegion: false}) watchabilityStatus promotionIcons { avatarsUrl fallbackUrl __typename } contentPackageToBuy { billingFeatureName __typename } mainPromotionAbsoluteAmount { amount __typename } mastercardPromotionAbsoluteAmount { amount __typename } optionMonetizationModels priceWithTotalDiscount { amount currency { displayName __typename } __typename } transactionalMinimumPrice { amount __typename } transactionalPrice { amount __typename } availabilityAnnounce { ...AvailabilityAnnounce __typename } subscriptionCompositeOffers(mediaBillingTarget: $mediaBillingTarget, checkSilentInvoiceAvailability: $checkSilentInvoiceAvailability) { ...SubscriptionCompositeOffers __typename } __typename } fragment AvailabilityAnnounce on AvailabilityAnnounce { availabilityDate groupPeriodType type announcePromise __typename } fragment SubscriptionCompositeOffers on SubscriptionCompositeOffers { batchPositionId offers { compositeOffer { ...CompositeOffer __typename } customPayload { overridedText overridedAdditionalText overridedTarget __typename } __typename } __typename } fragment CompositeOffer on PlusCompositeOffer { positionId structureType silentInvoiceAvailable forActiveOffers { ... on PlusOptionOffer { name __typename } ... on PlusTariffOffer { name __typename } __typename } optionOffers { title text additionText name option { name __typename } plans { ...CompositeOffersPlan __typename } __typename } tariffOffer { title text additionText name tariff { name __typename } plans { ...CompositeOffersPlan __typename } commonPrice { amount currency __typename } __typename } __typename } fragment CompositeOffersPlan on OfferPlanUnion { __typename ... on TrialUntilPlan { until __typename } ... on IntroUntilPlan { until __typename } ... on TrialPlan { period __typename } ... on IntroPlan { period __typename } } fragment MoviePoster on Movie { poster { avatarsUrl fallbackUrl __typename } __typename } fragment MovieImagesStats on Movie { concepts: images(types: [CONCEPT], limit: 0) { total __typename } covers: images(types: [COVER], limit: 0) { total __typename } fanarts: images(types: [FAN_ART], limit: 0) { total __typename } posters: images(types: [POSTER], limit: 0) { total __typename } promos: images(types: [PROMO], limit: 0) { total __typename } screenshots: images(types: [SCREENSHOT], limit: 0) { total __typename } shootings: images(types: [SHOOTING], limit: 0) { total __typename } stills: images(types: [STILL], limit: 0) { total __typename } wallpapers: images(types: [WALLPAPER], limit: 0) { total __typename } __typename } fragment releasesInfoFragment on PagingList_Release { items { date { accuracy date __typename } companies { id slugId slug displayName __typename } __typename } __typename } fragment OriginalsFragment on PagingList_Release { items { companies { displayName id originalsMovieList { id url __typename } __typename } __typename } __typename } fragment FilmUserData on Film { userData { folders { id name __typename } voting { value votedAt __typename } expectation { value __typename } note { value makeDate __typename } watchStatuses { notInterested { value __typename } watched { value __typename } __typename } __typename } __typename } fragment MovieSeoInfo on Movie { id title { localized original __typename } shortDescription synopsis genres { id name slug __typename } countries { id name __typename } viewOption { isAvailableOnline: isWatchable(filter: {anyDevice: false, anyRegion: false}) availabilityAnnounce { __typename } __typename } watchabilityCount: watchability(limit: 0) { total __typename } ott { preview { features(filter: {layout: OTT_TITLE_CARD, onlyClientSupported: true}) { alias __typename } __typename } __typename } ... on VideoInterface { duration kpProductionYear: productionYear(override: DISABLED) ottProductionYear: productionYear(override: OTT_WHEN_EXISTS) __typename } ... on Series { releaseYears { start end __typename } seasonsAll: seasons(limit: 0) { total __typename } seasonsOnline: seasons(limit: 0, isOnlyOnline: true) { total __typename } __typename } __typename } fragment MovieFactsCount on Movie { factsCount: trivias(type: FACT, limit: 0) { total __typename } __typename } fragment MovieBloopersCount on Movie { bloopersCount: trivias(type: BLOOPER, limit: 0) { total __typename } __typename } fragment MovieUsersReviewsCount on Movie { usersReviewsCount: userReviews(limit: 0) { total __typename } __typename } fragment MovieMediaPostsCount on Movie { mediaPostsCount: post(limit: 0) { total __typename } __typename } fragment MovieTrailersCount on Movie { trailersCount: trailers(limit: 0) { total __typename } __typename } fragment MovieCriticReviewsCount on Movie { criticReviewsCount: criticReviews(limit: 0) { total __typename } __typename } fragment MovieSimilarMoviesCount on Movie { similarMoviesCount: userRecommendations(limit: 0) { total __typename } __typename } fragment MovieOriginalMoviesCount on Movie { distribution { releases(original: true, types: [DIGITAL], limit: 1) { items { companies { originalsMovieList { movies(supportedItemTypes: [MOVIE_LIST_ITEM], limit: 0) { total __typename } __typename } __typename } __typename } __typename } __typename } __typename } fragment BlocksConfigFragment on BlockConfiguration { type params { useClientRender __typename } __typename } fragment FooterConfigData on FooterConfiguration { socialNetworkLinks { icon { avatarsUrl __typename } url title __typename } appMarketLinks { icon { avatarsUrl __typename } url title __typename } links { title url __typename } __typename } fragment OgImage on HtmlMeta { openGraph { image { avatarsUrl __typename } __typename } __typename } '
				},
				headers: {
					'Service-Id': '25'
				}
			}),
			transformResponse: (response, meta, arg) => {
				console.log('response', response)
				const data = (response as any)?.data

				return data?.film
			},
			transformErrorResponse: (response, meta, arg) => {
				console.log('transformErrorResponse', { response, meta, arg })

				ToastAndroid.show('KP: Неизвестная ошибка', ToastAndroid.LONG)
			}
		}),
		getTvSeriesBaseInfo: build.query<ITvSeriesBaseInfo, { tvSeriesId: number }>({
			query: ({ tvSeriesId }) => ({
				url: '?operationName=TvSeriesBaseInfo',
				method: 'post',
				body: {
					operationName: 'TvSeriesBaseInfo',
					variables: {
						tvSeriesId,
						isAuthorized: true,
						regionId: 10298,
						actorsLimit: 10,
						voiceOverActorsLimit: 5,
						relatedMoviesLimit: 14,
						mediaBillingTarget: 'kp-0822',
						checkSilentInvoiceAvailability: true
					},
					query:
						'query TvSeriesBaseInfo($tvSeriesId: Long!, $isAuthorized: Boolean!, $mediaBillingTarget: String!, $checkSilentInvoiceAvailability: Boolean, $actorsLimit: Int, $voiceOverActorsLimit: Int, $relatedMoviesLimit: Int) { tvSeries(id: $tvSeriesId) { id contentId title { russian original __typename } productionYear productionStatus shortDescription productionStatusUpdateDate top250 top10 synopsis releaseYears { start end __typename } genres { id name slug __typename } countries { id name __typename } seasons { total __typename } restriction { age mpaa __typename } types { name __typename } cover { image { avatarsUrl fallbackUrl __typename } __typename } viewOption { ...ViewOption __typename } ott { preview { availableMetadata(filter: {isSupportedByClient: null}) { audio subtitles __typename } ...OttPreviewFeatures ...OttPreviewAbstractSeries __typename } promoTrailers: trailers(onlyPromo: true, limit: 1) { items { streamUrl __typename } __typename } __typename } editorAnnotation mainTrailer { id title preview { avatarsUrl fallbackUrl __typename } duration createdAt isEmbedded streamUrl sourceVideoUrl __typename } actors: members(limit: $actorsLimit, role: [ACTOR, CAMEO, UNCREDITED]) { items { person { id name originalName __typename } __typename } total __typename } voiceOverActors: members(limit: $voiceOverActorsLimit, role: VOICEOVER) { items { person { id name originalName __typename } __typename } total __typename } tagline directors: members(role: DIRECTOR, limit: 4) { items { person { id name originalName __typename } __typename } __typename } writers: members(role: WRITER, limit: 4) { items { person { id name originalName __typename } __typename } __typename } producers: members(role: PRODUCER, limit: 4) { items { person { id name originalName __typename } __typename } __typename } operators: members(role: OPERATOR, limit: 4) { items { person { id name originalName __typename } __typename } __typename } composers: members(role: COMPOSER, limit: 4) { items { person { id name originalName __typename } __typename } __typename } designers: members(role: [PRODUCTION_DESIGNER, DESIGN, ART, COSTUMER, DECORATOR], limit: 4) { items { person { id name originalName __typename } __typename } __typename } filmEditors: members(role: EDITOR, limit: 4) { items { person { id name originalName __typename } __typename } __typename } boxOffice { budget { amount currency { symbol __typename } __typename } rusBox { amount currency { symbol __typename } __typename } usaBox { amount currency { symbol __typename } __typename } worldBox { amount currency { symbol __typename } __typename } marketing { amount currency { symbol __typename } __typename } __typename } ...MoviePoster rating { expectation { value count isActive __typename } imdb { value count isActive __typename } kinopoisk { value count isActive __typename } russianCritics { value count isActive __typename } worldwideCritics { value count isActive __typename } reviewCount { value count isActive __typename } __typename } totalDuration seriesDuration keywords { total __typename } awards(limit: 0) { total __typename } premieres(limit: 0) { total __typename } relatedMovies(limit: 0) { total __typename } images(limit: 0) { total __typename } ...MovieImagesStats sites(limit: 0) { total __typename } soundtrack(limit: 0) { total __typename } production(limit: 0) { total __typename } episodes(limit: 0) { total __typename } negativeCriticReviews: criticReviews(types: NEGATIVE, limit: 0) { total __typename } positiveCriticReviews: criticReviews(types: POSITIVE, limit: 0) { total __typename } releases { date releasers { id name __typename } type __typename } worldPremiere { incompleteDate { accuracy date __typename } __typename } distribution { rusRelease: releases(types: [CINEMA], rerelease: false, countryId: 2, limit: 1) { ...releasesInfoFragment __typename } digitalRelease: releases(types: [DIGITAL], limit: 1) { ...releasesInfoFragment __typename } reRelease: releases(types: [CINEMA], rerelease: true, countryId: 2, limit: 1) { ...releasesInfoFragment __typename } originals: releases(original: true, types: [DIGITAL], limit: 1) { ...OriginalsFragment __typename } __typename } userReviews { total __typename } filmMainAward: awards(isMain: true, limit: 15) { items { nomination { award { title slug year __typename } title __typename } win __typename } total __typename } filmMainAwardWins: awards(limit: 0, isMain: true, isWin: true) { total __typename } ...TvSeriesUserData @include(if: $isAuthorized) sequelsPrequels: relatedMovies(limit: $relatedMoviesLimit, type: [BEFORE, AFTER], orderBy: PREMIERE_DATE_ASC) { total limit offset items { relationType movie { id title { russian english original __typename } countries { id name __typename } ...MoviePoster genres { id name slug __typename } rating { expectation { value count isActive __typename } kinopoisk { value count isActive __typename } __typename } viewOption { buttonText isAvailableOnline: isWatchable(filter: {anyDevice: false, anyRegion: false}) purchasabilityStatus contentPackageToBuy { billingFeatureName __typename } type posterWithRightholderLogo __typename } userData @include(if: $isAuthorized) { voting { value __typename } __typename } ... on Film { productionYear __typename } ... on Video { productionYear __typename } ... on TvSeries { releaseYears { start end __typename } __typename } ... on TvShow { releaseYears { start end __typename } __typename } ... on MiniSeries { releaseYears { start end __typename } __typename } __typename } __typename } __typename } watchability { items { platform { name logo { avatarsUrl __typename } __typename } url __typename } __typename } ...MovieSeoInfo ...MovieFactsCount ...MovieBloopersCount ...MovieUsersReviewsCount ...MovieMediaPostsCount ...MovieTrailersCount ...MovieCriticReviewsCount ...MovieSimilarMoviesCount ...MovieOriginalMoviesCount __typename } webPage(platform: DESKTOP) { kpTvSeriesPage(tvSeriesId: $tvSeriesId) { additionalInfoBlocks { ...BlocksConfigFragment __typename } sidebarBlocks { ...BlocksConfigFragment __typename } footer { ...FooterConfigData __typename } htmlMeta { ...OgImage __typename } __typename } __typename } } fragment ViewOption on ViewOption { type purchasabilityStatus buttonText originalButtonText descriptionText promotionActionType texts { disclaimer __typename } rightholderLogoUrlForPoster posterWithRightholderLogo isAvailableOnline: isWatchable(filter: {anyDevice: false, anyRegion: false}) isWatchable(filter: {anyDevice: true, anyRegion: false}) watchabilityStatus promotionIcons { avatarsUrl fallbackUrl __typename } contentPackageToBuy { billingFeatureName __typename } mainPromotionAbsoluteAmount { amount __typename } mastercardPromotionAbsoluteAmount { amount __typename } optionMonetizationModels priceWithTotalDiscount { amount currency { displayName __typename } __typename } transactionalMinimumPrice { amount __typename } transactionalPrice { amount __typename } availabilityAnnounce { ...AvailabilityAnnounce __typename } subscriptionCompositeOffers(mediaBillingTarget: $mediaBillingTarget, checkSilentInvoiceAvailability: $checkSilentInvoiceAvailability) { ...SubscriptionCompositeOffers __typename } __typename } fragment AvailabilityAnnounce on AvailabilityAnnounce { availabilityDate groupPeriodType type announcePromise __typename } fragment SubscriptionCompositeOffers on SubscriptionCompositeOffers { batchPositionId offers { compositeOffer { ...CompositeOffer __typename } customPayload { overridedText overridedAdditionalText overridedTarget __typename } __typename } __typename } fragment CompositeOffer on PlusCompositeOffer { positionId structureType silentInvoiceAvailable forActiveOffers { ... on PlusOptionOffer { name __typename } ... on PlusTariffOffer { name __typename } __typename } optionOffers { title text additionText name option { name __typename } plans { ...CompositeOffersPlan __typename } __typename } tariffOffer { title text additionText name tariff { name __typename } plans { ...CompositeOffersPlan __typename } commonPrice { amount currency __typename } __typename } __typename } fragment CompositeOffersPlan on OfferPlanUnion { __typename ... on TrialUntilPlan { until __typename } ... on IntroUntilPlan { until __typename } ... on TrialPlan { period __typename } ... on IntroPlan { period __typename } } fragment OttPreviewFeatures on OttPreview { features(filter: {layout: OTT_TITLE_CARD, onlyClientSupported: true}) { alias group __typename } __typename } fragment OttPreviewAbstractSeries on OttPreview_AbstractSeries { firstEpisode { seasonNumber episodeNumber __typename } nextEpisode(fallbackToFirstEpisode: false) @include(if: $isAuthorized) { title { original russian __typename } seasonNumber episodeNumber duration timing { current maximum __typename } __typename } __typename } fragment MoviePoster on Movie { poster { avatarsUrl fallbackUrl __typename } __typename } fragment MovieImagesStats on Movie { concepts: images(types: [CONCEPT], limit: 0) { total __typename } covers: images(types: [COVER], limit: 0) { total __typename } fanarts: images(types: [FAN_ART], limit: 0) { total __typename } posters: images(types: [POSTER], limit: 0) { total __typename } promos: images(types: [PROMO], limit: 0) { total __typename } screenshots: images(types: [SCREENSHOT], limit: 0) { total __typename } shootings: images(types: [SHOOTING], limit: 0) { total __typename } stills: images(types: [STILL], limit: 0) { total __typename } wallpapers: images(types: [WALLPAPER], limit: 0) { total __typename } __typename } fragment releasesInfoFragment on PagingList_Release { items { date { accuracy date __typename } companies { id slugId slug displayName __typename } __typename } __typename } fragment OriginalsFragment on PagingList_Release { items { companies { displayName id originalsMovieList { id url __typename } __typename } __typename } __typename } fragment TvSeriesUserData on TvSeries { userData { folders { id name __typename } voting { value votedAt __typename } expectation { value __typename } note { value makeDate __typename } watchStatuses { notInterested { value __typename } watched { value __typename } __typename } __typename } __typename } fragment MovieSeoInfo on Movie { id title { localized original __typename } shortDescription synopsis genres { id name slug __typename } countries { id name __typename } viewOption { isAvailableOnline: isWatchable(filter: {anyDevice: false, anyRegion: false}) availabilityAnnounce { __typename } __typename } watchabilityCount: watchability(limit: 0) { total __typename } ott { preview { features(filter: {layout: OTT_TITLE_CARD, onlyClientSupported: true}) { alias __typename } __typename } __typename } ... on VideoInterface { duration kpProductionYear: productionYear(override: DISABLED) ottProductionYear: productionYear(override: OTT_WHEN_EXISTS) __typename } ... on Series { releaseYears { start end __typename } seasonsAll: seasons(limit: 0) { total __typename } seasonsOnline: seasons(limit: 0, isOnlyOnline: true) { total __typename } __typename } __typename } fragment MovieFactsCount on Movie { factsCount: trivias(type: FACT, limit: 0) { total __typename } __typename } fragment MovieBloopersCount on Movie { bloopersCount: trivias(type: BLOOPER, limit: 0) { total __typename } __typename } fragment MovieUsersReviewsCount on Movie { usersReviewsCount: userReviews(limit: 0) { total __typename } __typename } fragment MovieMediaPostsCount on Movie { mediaPostsCount: post(limit: 0) { total __typename } __typename } fragment MovieTrailersCount on Movie { trailersCount: trailers(limit: 0) { total __typename } __typename } fragment MovieCriticReviewsCount on Movie { criticReviewsCount: criticReviews(limit: 0) { total __typename } __typename } fragment MovieSimilarMoviesCount on Movie { similarMoviesCount: userRecommendations(limit: 0) { total __typename } __typename } fragment MovieOriginalMoviesCount on Movie { distribution { releases(original: true, types: [DIGITAL], limit: 1) { items { companies { originalsMovieList { movies(supportedItemTypes: [MOVIE_LIST_ITEM], limit: 0) { total __typename } __typename } __typename } __typename } __typename } __typename } __typename } fragment BlocksConfigFragment on BlockConfiguration { type params { useClientRender __typename } __typename } fragment FooterConfigData on FooterConfiguration { socialNetworkLinks { icon { avatarsUrl __typename } url title __typename } appMarketLinks { icon { avatarsUrl __typename } url title __typename } links { title url __typename } __typename } fragment OgImage on HtmlMeta { openGraph { image { avatarsUrl __typename } __typename } __typename } '
				},
				headers: {
					'Service-Id': '25'
				}
			}),
			transformResponse: (response, meta, arg) => {
				console.log('response', response)
				const data = (response as any)?.data

				return data?.tvSeries
			},
			transformErrorResponse: (response, meta, arg) => {
				console.log('transformErrorResponse', { response, meta, arg })

				ToastAndroid.show('KP: Неизвестная ошибка', ToastAndroid.LONG)
			}
		}),
		getTvSeriesSimilarMovies: build.query<ISimilarMovieResults, { tvSeriesId: number }>({
			query: ({ tvSeriesId }) => ({
				url: '?operationName=TvSeriesSimilarMovies',
				method: 'post',
				body: {
					operationName: 'TvSeriesSimilarMovies',
					variables: {
						tvSeriesId,
						similarMoviesLimit: 10,
						withUserData: false
					},
					query:
						'query TvSeriesSimilarMovies($tvSeriesId: Long!, $similarMoviesLimit: Int = 10, $withUserData: Boolean = false) { tvSeries(id: $tvSeriesId) { id rating { kinopoisk { isActive __typename } __typename } userRecommendations(limit: $similarMoviesLimit) { items { movie { id title { russian english original __typename } countries { id name __typename } poster { avatarsUrl fallbackUrl __typename } genres { id name slug __typename } rating { expectation { value count isActive __typename } kinopoisk { value count isActive __typename } __typename } userData @include(if: $withUserData) { voting { value __typename } __typename } viewOption { buttonText isAvailableOnline: isWatchable(filter: {anyDevice: false, anyRegion: false}) purchasabilityStatus contentPackageToBuy { billingFeatureName __typename } type posterWithRightholderLogo __typename } ... on Film { productionYear __typename } ... on Video { productionYear __typename } ... on TvSeries { releaseYears { start end __typename } __typename } ... on TvShow { releaseYears { start end __typename } __typename } ... on MiniSeries { releaseYears { start end __typename } __typename } __typename } types __typename } total __typename } __typename } } '
				},
				headers: {
					'Service-Id': '25'
				}
			}),
			transformResponse: (response, meta, arg) => {
				console.log('response', response)
				const data = (response as any)?.data

				return data?.tvSeries?.userRecommendations
			},
			transformErrorResponse: (response, meta, arg) => {
				console.log('transformErrorResponse', { response, meta, arg })

				ToastAndroid.show('KP: Неизвестная ошибка', ToastAndroid.LONG)
			}
		}),
		getFilmSimilarMovies: build.query<ISimilarMovieResults, { filmId: number }>({
			query: ({ filmId }) => ({
				url: '?operationName=FilmSimilarMovies',
				method: 'post',
				body: {
					operationName: 'FilmSimilarMovies',
					variables: {
						filmId,
						similarMoviesLimit: 10,
						withUserData: false
					},
					query:
						'query FilmSimilarMovies($filmId: Long!, $similarMoviesLimit: Int = 10, $withUserData: Boolean = false) { film(id: $filmId) { id rating { kinopoisk { isActive __typename } __typename } userRecommendations(limit: $similarMoviesLimit) { items { movie { id title { russian english original __typename } countries { id name __typename } poster { avatarsUrl fallbackUrl __typename } genres { id name slug __typename } rating { expectation { value count isActive __typename } kinopoisk { value count isActive __typename } __typename } userData @include(if: $withUserData) { voting { value __typename } __typename } viewOption { buttonText isAvailableOnline: isWatchable(filter: {anyDevice: false, anyRegion: false}) purchasabilityStatus contentPackageToBuy { billingFeatureName __typename } type posterWithRightholderLogo __typename } ... on Film { productionYear __typename } ... on Video { productionYear __typename } ... on TvSeries { releaseYears { start end __typename } __typename } ... on TvShow { releaseYears { start end __typename } __typename } ... on MiniSeries { releaseYears { start end __typename } __typename } __typename } types __typename } total __typename } __typename } } '
				},
				headers: {
					'Service-Id': '25'
				}
			}),
			transformResponse: (response, meta, arg) => {
				console.log('response', response)
				const data = (response as any)?.data

				return data?.film?.userRecommendations
			},
			transformErrorResponse: (response, meta, arg) => {
				console.log('transformErrorResponse', { response, meta, arg })

				ToastAndroid.show('KP: Неизвестная ошибка', ToastAndroid.LONG)
			}
		}),
		getPersonBaseInfo: build.query<IPersonBaseInfoResults, { personId: number }>({
			query: ({ personId }) => ({
				url: '?operationName=PersonBaseInfo',
				method: 'post',
				body: {
					operationName: 'PersonBaseInfo',
					variables: {
						bestMoviesLimit: 5,
						personFoldersLimit: 10,
						personId,
						regionId: 213,
						withUserData: false
					},
					query:
						'query PersonBaseInfo($personId: Long!, $withUserData: Boolean = false, $personFoldersLimit: Int = 10, $bestMoviesLimit: Int = 5, $regionId: Int = 213) { person(id: $personId) { id ...PersonName ...PersonPoster height gender deathPlace dateOfDeath { ...PersonIncompleteDate __typename } dateOfBirth { ...PersonIncompleteDate __typename } birthPlace personMainAward: awards(isMain: true, limit: 10, orderBy: WIN_FIRST_YEAR_DESC_NOMINATION_ASC) { items { nomination { award { title slug year __typename } title __typename } movie { id title { russian original __typename } __typename } win __typename } total __typename } mainAwardWinNominationsTotal: awards(isMain: true, isWin: true, limit: 0) { total __typename } marriages { children spouse { id name originalName gender published __typename } status __typename } age zodiacSign { slug title { russian __typename } __typename } mainGenres { id name slug __typename } filmographyYears { end start __typename } ...PersonSeoMeta ...PersonUserNote @include(if: $withUserData) popularMovies { ...PersonPopularMovies __typename } ...PersonMediaPostsCount ...PersonFactsCount ...PersonOnlineFilmsCount ...PersonMovieCount __typename } ...PersonUserFolders @include(if: $withUserData) webPage { ...PersonWebPage __typename } } fragment PersonName on Person { name originalName __typename } fragment PersonPoster on Person { poster { avatarsUrl fallbackUrl __typename } images(limit: 0) { total __typename } __typename } fragment PersonIncompleteDate on IncompleteDate { date accuracy __typename } fragment PersonSeoMeta on Person { name originalName dateOfBirth { accuracy date __typename } poster { avatarsUrl fallbackUrl __typename } roles(isCareer: true) { items { role { title { russian __typename } slug __typename } __typename } __typename } bestFilms: bestMovies(limit: $bestMoviesLimit, type: FILM) { ...PersonBestMovies __typename } bestSeries: bestMovies(limit: $bestMoviesLimit, type: SERIES) { ...PersonBestMovies __typename } __typename } fragment PersonBestMovies on PagingList_PersonBestMovie { items { movie { id title { russian __typename } __typename } __typename } __typename } fragment PersonUserNote on Person { userData { note { value makeDate __typename } __typename } __typename } fragment PersonPopularMovies on PagingList_PersonPopularMovie { items { movie { ...PopularMovie __typename } __typename } __typename } fragment PopularMovie on Movie { id title { russian original __typename } poster { ...MovieImage __typename } rating { kinopoisk { ...MovieRatingValue __typename } expectation { ...MovieRatingValue __typename } __typename } isTicketsAvailable(regionId: $regionId) viewOption { buttonText isAvailableOnline: isWatchable(filter: {anyDevice: false, anyRegion: false}) purchasabilityStatus contentPackageToBuy { billingFeatureName __typename } type posterWithRightholderLogo __typename } genres { name __typename } ... on Film { productionYear __typename } ... on TvSeries { releaseYears { ...MovieReleaseYears __typename } __typename } ... on MiniSeries { releaseYears { ...MovieReleaseYears __typename } __typename } ... on TvShow { releaseYears { ...MovieReleaseYears __typename } __typename } ... on Video { productionYear __typename } __typename } fragment MovieImage on Image { avatarsUrl fallbackUrl __typename } fragment MovieRatingValue on RatingValue { isActive value count __typename } fragment MovieReleaseYears on YearsRange { start end __typename } fragment PersonMediaPostsCount on Person { mediaPostsCount: post(limit: 0) { total __typename } __typename } fragment PersonFactsCount on Person { factsCount: trivias(limit: 0) { total __typename } __typename } fragment PersonOnlineFilmsCount on Person { onlineFilmsCount: filmographyRelations(isOnline: true, limit: 0) { total __typename } __typename } fragment PersonMovieCount on Person { movieCount: filmographyRelations(limit: 0) { total __typename } __typename } fragment PersonUserFolders on Query { user { personFolders(limit: $personFoldersLimit) { items { containsPerson(personId: $personId) name public typeId __typename } __typename } __typename } __typename } fragment PersonWebPage on WebPageContext { kpPersonPage(personId: $personId) { htmlMeta { openGraph { image { avatarsUrl __typename } __typename } __typename } __typename } __typename } '
				},
				headers: {
					'Service-Id': '25'
				}
			}),
			transformResponse: (response, meta, arg) => {
				console.log('response', response)
				const data = (response as any)?.data

				return data?.person
			},
			transformErrorResponse: (response, meta, arg) => {
				console.log('transformErrorResponse', { response, meta, arg })

				ToastAndroid.show('KP: Неизвестная ошибка', ToastAndroid.LONG)
			}
		}),
		getTvSeriesEpisodes: build.query<ITvSeriesEpisodesResults, { tvSeriesId: number }>({
			query: ({ tvSeriesId }) => ({
				url: '?operationName=TvSeriesEpisodes',
				method: 'post',
				body: {
					operationName: 'TvSeriesEpisodes',
					variables: {
						episodesLimit: 5,
						tvSeriesId
					},
					query: 'query TvSeriesEpisodes($tvSeriesId: Long!, $episodesLimit: Int = 10) { tvSeries(id: $tvSeriesId) { id episodesCount futureEpisodes: episodes(released: false, limit: $episodesLimit, orderBy: SEASON_NUMBER_EPISODE_NUMBER_ASC) { items { id number releaseDate { accuracy date __typename } season { number __typename } title { russian original __typename } __typename } __typename } releasedEpisodes: episodes(released: true, limit: $episodesLimit, orderBy: SEASON_NUMBER_EPISODE_NUMBER_DESC) { items { id number releaseDate { accuracy date __typename } season { number __typename } title { russian original __typename } __typename } __typename } __typename } } '
				},
				headers: {
					'Service-Id': '25'
				}
			}),
			transformResponse: (response, meta, arg) => {
				console.log('response', response)
				const data = (response as any)?.data

				return data?.tvSeries
			},
			transformErrorResponse: (response, meta, arg) => {
				console.log('transformErrorResponse', { response, meta, arg })

				ToastAndroid.show('KP: Неизвестная ошибка', ToastAndroid.LONG)
			}
		}),
		getFilmographyItems: build.query<IFilmographyItemsResults, { personId: number; orderBy?: string; page?: number; limit?: number; roleSlugs?: string[]; genre?: null | number; year?: null | { start: number; end: number } }>({
			query: ({ personId, orderBy = 'YEAR_DESC', page = 1, limit = 50, roleSlugs = ['ACTOR'], genre = null, year = null }) => ({
				url: '?operationName=FilmographyItems',
				method: 'post',
				body: {
					operationName: 'FilmographyItems',
					variables: {
						genre,
						itemsLimit: limit,
						itemsOffset: limit * (page - 1),
						orderBy,
						participationsLimit: 30,
						personId,
						regionId: 10298,
						roleSlugs,
						withUserData: false,
						year
					},
					query:
						'query FilmographyItems($personId: Long!, $roleSlugs: [String], $genre: Int = null, $year: YearsRangeInput = null, $orderBy: FilmographyItemOrderBy = YEAR_DESC, $itemsLimit: Int = 10, $itemsOffset: Int = 0, $participationsLimit: Int = 10, $withUserData: Boolean = false, $regionId: Int = 213) { person(id: $personId) { id filmographyRelations(roleSlugs: $roleSlugs, limit: $itemsLimit, offset: $itemsOffset, genre: $genre, year: $year, orderBy: $orderBy) { items { movie { id contentId title { russian english original __typename } genres { id name __typename } poster { avatarsUrl fallbackUrl __typename } rating { kinopoisk { isActive count value __typename } expectation { isActive count value __typename } __typename } countries { id name __typename } viewOption { buttonText originalButtonText promotionIcons { avatarsUrl fallbackUrl __typename } isAvailableOnline: isWatchable(filter: {anyDevice: false, anyRegion: false}) purchasabilityStatus type rightholderLogoUrlForPoster __typename } isTicketsAvailable(regionId: $regionId) ... on Film { productionYear isShortFilm top250 __typename } ... on TvSeries { releaseYears { start end __typename } __typename } ... on MiniSeries { releaseYears { start end __typename } __typename } ... on TvShow { releaseYears { start end __typename } __typename } ... on Video { productionYear __typename } ...FilmographyItemUserData @include(if: $withUserData) __typename } participations(limit: $participationsLimit) { items { notice role { title { russian english __typename } slug __typename } ... on CastMovieParticipation { name __typename } ... on StaffMovieParticipation { relatedCast { name person { id name url __typename } __typename } __typename } __typename } __typename } salaries { items { amount currency { symbol __typename } note __typename } __typename } __typename } limit offset total __typename } __typename } } fragment FilmographyItemUserData on Movie { userData { watchStatuses { notInterested { value __typename } watched { value __typename } __typename } folders { id name public __typename } voting { value votedAt __typename } expectation { value __typename } __typename } __typename } '
				},
				headers: {
					'Service-Id': '25'
				}
			}),
			transformResponse: (response, meta, arg) => {
				const data = (response as any)?.data?.person
				const movies = data?.filmographyRelations ?? { items: [], total: 0 }

				const total = movies.total
				const limit = arg.limit ?? 50
				const page = arg.page ?? 1
				const pages = Math.ceil(total / limit)

				return { docs: movies.items, total, limit, page, pages }
			},
			transformErrorResponse: (response, meta, arg) => {
				console.log('transformErrorResponse', { response, meta, arg })

				ToastAndroid.show('KP: Неизвестная ошибка', ToastAndroid.LONG)
			}
		}),
		getFilmographyFilters: build.query<IFilmographyFiltersResults, { personId: number }>({
			query: ({ personId }) => ({
				url: '?operationName=FilmographyFilters',
				method: 'post',
				body: {
					operationName: 'FilmographyFilters',
					variables: {
						genresLimit: 32,
						isCareer: false,
						personId,
						rolesLimit: 15
					},
					query: 'query FilmographyFilters($personId: Long!, $isCareer: Boolean = false, $rolesLimit: Int = 10, $genresLimit: Int = 10) { roles: person(id: $personId) { id roles(isCareer: $isCareer, limit: $rolesLimit) { items { movies { total __typename } role { slug title { russian english __typename } __typename } __typename } __typename } __typename } genres: genres(limit: $genresLimit) { items { id name slug __typename } __typename } years: person(id: $personId) { id filmographyYears { start end __typename } __typename } } '
				},
				headers: {
					'Service-Id': '25'
				}
			}),
			transformResponse: (response, meta, arg) => {
				const data = (response as any)?.data

				return data
			},
			transformErrorResponse: (response, meta, arg) => {
				console.log('transformErrorResponse', { response, meta, arg })

				ToastAndroid.show('KP: Неизвестная ошибка', ToastAndroid.LONG)
			}
		})
	})
})

export const { useGetListBySlugQuery, useGetSuggestSearchQuery, useGetFilmBaseInfoQuery, useGetTvSeriesBaseInfoQuery, useGetFilmSimilarMoviesQuery, useGetTvSeriesSimilarMoviesQuery, useGetPersonBaseInfoQuery, useGetTvSeriesEpisodesQuery, useGetFilmographyItemsQuery, useGetFilmographyFiltersQuery } = kinopoiskApi
