import { ActivityIndicator, Button } from '@components/atoms'
import { SimilarMovie } from '@components/organisms'
import { useOrientation, useTheme, useTypedSelector } from '@hooks'
import { Kp3dIcon, KpImaxIcon, KpTop250LIcon, KpTop250RIcon, PlayIcon } from '@icons'
import { RootStackParamList } from '@navigation'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { declineSeasons, formatDuration, getRatingColor, normalizeUrlWithNull, ratingMPAA } from '@utils'
import { FlatList, Image, ImageBackground, ScrollView, StyleProp, TVFocusGuideView, Text, View, ViewProps, ViewStyle } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Defs as DefsSvg, LinearGradient as LinearGradientSvg, Stop as StopSvg, Svg, Text as TextSvg } from 'react-native-svg'
import { IFilmBaseInfo, ITvSeriesBaseInfo } from 'src/store/kinopoisk/kinopoisk.types'
import { useGetFilmBaseInfoQuery, useGetTvSeriesBaseInfoQuery } from '../../store/kinopoisk/kinopoisk.api'

type Props = NativeStackScreenProps<RootStackParamList, 'Movie'>

export const Movie = ({ navigation, route }: Props) => {
	const insets = useSafeAreaInsets()
	const isShowNetInfo = useTypedSelector(state => state.safeArea.isShowNetInfo)
	const { colors } = useTheme()
	const orientation = useOrientation()

	// const orientation = { portrait: true, landscape: false }
	// const orientation = { portrait: false, landscape: true }

	const { data: dataFilm, isFetching: isFetchingFilm } = useGetFilmBaseInfoQuery({ filmId: route.params.data.id }, { skip: route.params.data.type !== 'Film' })
	const { data: dataTvSeries, isFetching: isFetchingTvSeries } = useGetTvSeriesBaseInfoQuery({ tvSeriesId: route.params.data.id }, { skip: route.params.data.type !== 'TvSeries' })

	const data: IFilmBaseInfo | ITvSeriesBaseInfo | undefined = dataFilm || dataTvSeries
	const isFetching = isFetchingFilm || isFetchingTvSeries

	if (isFetching) {
		return (
			<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
				<ActivityIndicator size='large' />
			</View>
		)
	}

	if (!data) {
		return (
			<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
				<Text>Not found</Text>
			</View>
		)
	}

	console.log('data:', data)

	const PosterImage = ({ width, height, borderRadius, top, style, wrapperStyle }: { width?: number; height?: number; borderRadius?: number; top?: number; style?: StyleProp<ViewStyle>; wrapperStyle?: StyleProp<ViewStyle> }) => {
		const poster = normalizeUrlWithNull(data.poster?.avatarsUrl, { isNull: 'https://via.placeholder.com', append: '/300x450' })

		return (
			<View style={[wrapperStyle, { width: width ?? 300, height, aspectRatio: height ? undefined : 2 / 3 }]}>
				<View style={[style, { top, borderRadius }]}>
					<Image source={{ uri: poster }} style={{ width: width ?? 300, aspectRatio: 2 / 3 }} borderRadius={borderRadius} />
				</View>
			</View>
		)
	}

	const Trailer = (props: ViewProps) => {
		if (!data.mainTrailer) {
			return null
		}
		const poster = normalizeUrlWithNull(data.mainTrailer.preview.avatarsUrl, { isNull: 'https://via.placeholder.com', append: '/600x380' })

		return (
			<Button padding={0} transparent style={{ margin: -4 }}>
				<View {...props}>
					<ImageBackground source={{ uri: poster }} style={{ width: '100%', aspectRatio: 30 / 19, justifyContent: 'center', alignItems: 'center', gap: 10 }}>
						<View style={{ backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 99, padding: 10 }}>
							<PlayIcon width={40} height={40} fill={colors.primary300} />
						</View>
						{/* <Text style={{ color: colors.primary300 }}>Play Trailer</Text> */}
					</ImageBackground>
				</View>
			</Button>
		)
	}

	const Cover = (props: ViewProps) => {
		if (!data.cover) {
			return null
		}

		const poster = normalizeUrlWithNull(data.cover.image.avatarsUrl, { isNull: 'https://via.placeholder.com', append: '/1344x756' })

		return (
			<View {...props}>
				<ImageBackground source={{ uri: poster }} style={{ width: '100%', aspectRatio: 16 / 9, justifyContent: 'center', alignItems: 'center', gap: 10 }} />
			</View>
		)
	}

	const RatingText = () => {
		if (data.rating.expectation && data.rating.expectation.isActive && data.rating.expectation.value && data.rating.expectation.value > 0) return <Text style={{ fontSize: 48, fontWeight: '500', color: getRatingColor(data.rating.expectation.value / 10) }}>{data.rating.expectation.value.toFixed(0)}%</Text>
		if (!data.rating.kinopoisk || data.rating.kinopoisk.value === null || !data.rating.kinopoisk.isActive) return null
		const top = data.rating.kinopoisk.value.toFixed(1)
		if (data.top250 === null) return <Text style={{ fontSize: 48, fontWeight: '500', color: getRatingColor(data.rating.kinopoisk.value) }}>{top}</Text>
		const width = top.length === 3 ? 65 : 93

		return (
			<Svg height={43} width={width}>
				<DefsSvg>
					<LinearGradientSvg id='gradient' x1='0%' y1='0%' x2='25%' y2='125%'>
						<StopSvg offset='16.44%' stopColor='#ffd25e' />
						<StopSvg offset='63.42%' stopColor='#b59646' />
					</LinearGradientSvg>
				</DefsSvg>
				<TextSvg x={width / 2} y={38.5} textAnchor='middle' fill='url(#gradient)' fontSize={48} fontWeight='500'>
					{top}
				</TextSvg>
			</Svg>
		)
	}

	const Text250 = () => {
		if (data.top250 === null) return null
		const length = data.top250.toString().length
		const width = length === 1 ? 60 : length === 2 ? 64 : 72

		return (
			<View style={{ flexDirection: 'row', marginLeft: 13, alignItems: 'center' }}>
				<KpTop250LIcon width={18} height={43} viewBox='0 0 10 24' />
				<View style={{ marginHorizontal: 7 }}>
					<Svg height={43} width={width}>
						<DefsSvg>
							<LinearGradientSvg id='gradient' x1='0%' y1='0%' x2='25%' y2='125%'>
								<StopSvg offset='16.44%' stopColor='#ffd25e' />
								<StopSvg offset='63.42%' stopColor='#b59646' />
							</LinearGradientSvg>
						</DefsSvg>
						<TextSvg x={width / 2} y={18} textAnchor='middle' fill='url(#gradient)' fontSize={15} fontWeight='600'>
							ТОП 250
						</TextSvg>
						<TextSvg x={width / 2} y={36} textAnchor='middle' fill='url(#gradient)' fontSize={15} fontWeight='400'>
							{data.top250 + ' место'}
						</TextSvg>
					</Svg>
				</View>
				<KpTop250RIcon width={18} height={43} viewBox='0 0 10 24' />
			</View>
		)
	}

	const ProductionStatusText = () => {
		if (!data.productionStatus || !data.productionStatusUpdateDate) return null

		let statusMessage = ''
		let statusStyle = {}

		switch (data.productionStatus) {
			case 'FILMING':
				statusMessage = 'Съемочный процесс'
				statusStyle = {
					color: orientation.portrait ? 'rgba(255,101,0,.9)' : 'rgba(255,255,255,.8)',
					backgroundColor: orientation.portrait ? 'rgba(255,101,0,.1)' : 'rgba(234,95,4,.24)'
				}
				break
			case 'PRE_PRODUCTION':
				statusMessage = 'Подготовка к съемкам'
				statusStyle = {
					color: orientation.portrait ? 'rgba(255,101,0,.9)' : 'rgba(255,255,255,.8)',
					backgroundColor: orientation.portrait ? 'rgba(255,101,0,.1)' : 'rgba(234,95,4,.24)'
				}
				break
			case 'COMPLETED':
				statusMessage = 'Производство завершено'
				statusStyle = {
					color: 'rgba(0,153,51,.9)',
					backgroundColor: '#d9f0e1'
				}
				break
			case 'ANNOUNCED':
				statusMessage = 'Проект объявлен'
				statusStyle = {
					color: orientation.portrait ? 'rgba(255,101,0,.9)' : 'rgba(255,255,255,.8)',
					backgroundColor: orientation.portrait ? 'rgba(255,101,0,.1)' : 'rgba(234,95,4,.24)'
				}
				break
			case 'POST_PRODUCTION':
				statusMessage = 'Постпродакшн'
				statusStyle = {
					color: orientation.portrait ? 'rgba(255,101,0,.9)' : 'rgba(255,255,255,.8)',
					backgroundColor: orientation.portrait ? 'rgba(255,101,0,.1)' : 'rgba(234,95,4,.24)'
				}
				break
			case 'UNKNOWN':
				statusMessage = 'Неизвестно'
				statusStyle = {
					color: orientation.portrait ? 'rgba(31,31,31,.9)' : 'rgba(255,255,255,.8)',
					backgroundColor: orientation.portrait ? 'rgba(31,31,31,.1)' : 'rgba(31,31,31,.24)'
				}
				break
			default:
				break
		}

		return (
			<View style={{ flexDirection: 'row', paddingBottom: 8 }}>
				<Text style={{ ...statusStyle, fontSize: 13, fontWeight: '500', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 3 }}>{statusMessage}</Text>
				<Text style={{ color: colors.text200, fontSize: 13, fontWeight: '500', paddingVertical: 2 }}> – обновлено {new Date(data.productionStatusUpdateDate).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' }).replace(' г.', '')}</Text>
			</View>
		)
	}

	// ott.promoTrailers.items[0].streamUrl
	// //avatars.mds.yandex.net/get-ott/1652588/2a000001840a505882a77df419eb5eb60623/678x380 1x, //avatars.mds.yandex.net/get-ott/1652588/2a000001840a505882a77df419eb5eb60623/1344x756 2x

	return (
		<TVFocusGuideView style={{ flex: 1, marginTop: 0, marginBottom: 0 }} trapFocusLeft trapFocusRight trapFocusUp trapFocusDown>
			<ScrollView contentContainerStyle={{ paddingBottom: 10 + (isShowNetInfo ? 0 : insets.bottom) }}>
				{orientation.portrait && (data.cover ? <Cover /> : data.mainTrailer ? <Trailer style={{ marginBottom: -10 }} /> : <View style={{ paddingTop: 10 + insets.top }} />)}
				<View style={[{}, orientation.landscape && { flexDirection: 'row', padding: 10, paddingBottom: 5, paddingTop: 10 + insets.top, gap: 20 }]}>
					{orientation.landscape && (
						<View style={{ width: 300, gap: 20 }}>
							<PosterImage />
							{data.mainTrailer && (
								<View style={{ gap: 5 }}>
									<Trailer style={{}} />

									<Text style={{ color: colors.text100, fontSize: 15 }}>{data.mainTrailer.title}</Text>
									<Text style={{ color: colors.text200, fontSize: 13 }}>{new Date(data.mainTrailer.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' }).replace(' г.', '')}</Text>
								</View>
							)}
						</View>
					)}
					<View style={[{ flex: 1 }, orientation.portrait && { backgroundColor: colors.bg100, marginTop: -10, paddingHorizontal: 10, paddingTop: 10, borderTopLeftRadius: 16, borderTopRightRadius: 16 }]}>
						<View style={{ flexDirection: 'row', gap: 10 }}>
							{orientation.portrait && (!!data.mainTrailer || !!data.cover ? <PosterImage width={120} height={120 + 6 + 6 ?? 96} borderRadius={8} top={-60} style={{ position: 'absolute', borderWidth: 6, borderColor: colors.bg100, backgroundColor: colors.bg100 }} wrapperStyle={{ marginLeft: 0, marginRight: 20 }} /> : <PosterImage width={120} borderRadius={8} wrapperStyle={{ marginLeft: 0, marginRight: 10 }} />)}
							<View style={{ flex: 1 }}>
								<Text style={{ color: colors.text100, fontSize: 28, fontWeight: '700' }}>
									<ProductionStatusText />
									{data.title.russian ?? data.title.localized ?? data.title.original ?? data.title.english} <Text>{data.__typename === 'Film' ? `(${data.productionYear})` : `(сериал ${data.releaseYears[0]?.start === data.releaseYears[0]?.end ? (data.releaseYears[0]?.start === null ? '' : data.releaseYears[0]?.start) : data.releaseYears[0]?.start !== null || data.releaseYears[0]?.end !== null ? (data.releaseYears[0]?.start ?? '...') + ' - ' + (data.releaseYears[0]?.end ?? '...') : ''})`}</Text>
								</Text>

								<Text style={{ color: colors.text200, fontSize: 18 }}>
									{(!!data.title.russian || !!data.title.localized) && data.title.original ? data.title.original + ' ' : ''}
									{data.restriction.age ? data.restriction.age.replace('age', '') + '+' : ''}
								</Text>
							</View>
						</View>
						<View style={{}}>
							<TVFocusGuideView style={{ marginBottom: 5, marginTop: 10, flexDirection: 'row', gap: 10 }} autoFocus>
								<Button text='watch' onPress={() => navigation.navigate('Watch', { data })} hasTVPreferredFocus />
								<Button text='trailer' />
							</TVFocusGuideView>

							<Text style={{ color: colors.text100, fontSize: 22, fontWeight: '600', marginTop: 48, marginBottom: 9 }}>О {data.__typename === 'TvSeries' ? 'сериале' : 'фильме'}</Text>

							<View style={{ gap: 5, marginTop: 5, marginBottom: 40 }}>
								{!!data.productionYear && (
									<TVFocusGuideView style={{ flexDirection: 'row' }} autoFocus>
										<Text style={{ width: 160, color: colors.text200, fontSize: 13 }}>Год производства</Text>
										<View style={{ flexDirection: 'row', flex: 1 }}>
											{!!data.productionYear && (
												<Button
													onPress={() => {
														const booleanFilterValues = [
															{ filterId: data.__typename === 'TvSeries' ? 'series' : 'films', value: true },
															{ filterId: 'top', value: true }
														]
														const singleSelectFilterValues = [{ filterId: 'year', value: data.productionYear.toString() }]

														navigation.push('MovieListSlug', { data: { slug: '', filters: { booleanFilterValues, intRangeFilterValues: [], multiSelectFilterValues: [], realRangeFilterValues: [], singleSelectFilterValues } } })
													}}
													padding={0}
													text={data.productionYear.toString()}
													transparent
												/>
											)}
											{data.__typename === 'TvSeries' && (!!data.seasonsAll || !!data.seasons) && (
												<Button padding={0} transparent focusable={false}>
													<Text style={{}}>{'(' + declineSeasons((data.seasonsAll ?? data.seasons).total) + ')'}</Text>
												</Button>
											)}
										</View>
									</TVFocusGuideView>
								)}

								{data.distribution.originals.items.length > 0 && (
									<View style={{ flexDirection: 'row' }}>
										<Text style={{ width: 160, color: colors.text200, fontSize: 13 }}>Платформа</Text>
										<Button padding={0} flex={1} transparent focusable={false} textColor={colors.text200} text={data.distribution.originals.items.map(it => it.companies.map(it => it.displayName).join(' ')).join(' ')} />
									</View>
								)}

								{data.countries.length > 0 && (
									<TVFocusGuideView style={{ flexDirection: 'row' }} autoFocus>
										<Text style={{ width: 160, color: colors.text200, fontSize: 13 }}>Страна</Text>
										<ScrollView horizontal style={{ flex: 1 }}>
											{data.countries.map(it => (
												<Button
													onPress={() => {
														const booleanFilterValues = [
															{ filterId: data.__typename === 'TvSeries' ? 'series' : 'films', value: true },
															{ filterId: 'top', value: true }
														]
														const singleSelectFilterValues = [{ filterId: 'country', value: it.id + '' }]

														navigation.push('MovieListSlug', { data: { slug: '', filters: { booleanFilterValues, intRangeFilterValues: [], multiSelectFilterValues: [], realRangeFilterValues: [], singleSelectFilterValues } } })
													}}
													padding={0}
													key={it.id}
													text={it.name}
													transparent
												/>
											))}
										</ScrollView>
									</TVFocusGuideView>
								)}

								{data.genres.length > 0 && (
									<TVFocusGuideView style={{ flexDirection: 'row' }} autoFocus>
										<Text style={{ width: 160, color: colors.text200, fontSize: 13 }}>Жанр</Text>
										<ScrollView horizontal style={{ flex: 1 }}>
											{data.genres.map(it => (
												<Button
													padding={0}
													key={it.id}
													text={it.name}
													transparent
													onPress={() => {
														const booleanFilterValues = [
															{ filterId: data.__typename === 'TvSeries' ? 'series' : 'films', value: true },
															{ filterId: 'top', value: true }
														]
														const singleSelectFilterValues = [{ filterId: 'genre', value: it.slug }]

														navigation.push('MovieListSlug', { data: { slug: '', filters: { booleanFilterValues, intRangeFilterValues: [], multiSelectFilterValues: [], realRangeFilterValues: [], singleSelectFilterValues } } })
													}}
												/>
											))}
										</ScrollView>
									</TVFocusGuideView>
								)}

								<View style={{ flexDirection: 'row' }}>
									<Text style={{ width: 160, color: colors.text200, fontSize: 13 }}>Слоган</Text>
									<Button padding={0} flex={1} transparent focusable={false} textColor={colors.text200} text={data.tagline ? `«${data.tagline.replace(/(\s+\(season \d+\))/gi, '').replace(/\.$/g, '')}»` : '—'} />
								</View>

								{data.actors.items.length > 0 && (
									<TVFocusGuideView style={{ flexDirection: 'row' }} autoFocus>
										<Text style={{ width: 160, color: colors.text200, fontSize: 13 }}>В главных ролях</Text>
										<ScrollView horizontal style={{ flex: 1 }}>
											{data.actors.items.map(({ person }) => (
												<Button padding={0} key={person.id} text={person.name ?? person.originalName} transparent onPress={() => person.id && navigation.push('Person', { data: { id: person.id } })} />
											))}
										</ScrollView>
									</TVFocusGuideView>
								)}

								{data.voiceOverActors.total > 0 && (
									<TVFocusGuideView style={{ flexDirection: 'row' }} autoFocus>
										<Text style={{ width: 160, color: colors.text200, fontSize: 13 }}>Роли дублировали</Text>
										<ScrollView horizontal style={{ flex: 1 }}>
											{data.voiceOverActors.items.map(({ person }) => (
												<Button padding={0} key={person.id} text={person.name ?? person.originalName} transparent onPress={() => person.id && navigation.push('Person', { data: { id: person.id } })} />
											))}
										</ScrollView>
									</TVFocusGuideView>
								)}

								{data.directors.items.length > 0 && (
									<TVFocusGuideView style={{ flexDirection: 'row' }} autoFocus>
										<Text style={{ width: 160, color: colors.text200, fontSize: 13 }}>Режиссер</Text>
										<ScrollView horizontal style={{ flex: 1 }}>
											{data.directors.items.map(({ person }) => (
												<Button padding={0} key={person.id} text={person.name ?? person.originalName} transparent onPress={() => person.id && navigation.push('Person', { data: { id: person.id } })} />
											))}
										</ScrollView>
									</TVFocusGuideView>
								)}

								{data.writers.items.length > 0 && (
									<TVFocusGuideView style={{ flexDirection: 'row' }} autoFocus>
										<Text style={{ width: 160, color: colors.text200, fontSize: 13 }}>Сценарий</Text>
										<ScrollView horizontal style={{ flex: 1 }}>
											{data.writers.items.map(({ person }) => (
												<Button padding={0} key={person.id} text={person.name ?? person.originalName} transparent onPress={() => person.id && navigation.push('Person', { data: { id: person.id } })} />
											))}
										</ScrollView>
									</TVFocusGuideView>
								)}

								{data.producers.items.length > 0 && (
									<TVFocusGuideView style={{ flexDirection: 'row' }} autoFocus>
										<Text style={{ width: 160, color: colors.text200, fontSize: 13 }}>Продюсер</Text>
										<ScrollView horizontal style={{ flex: 1 }}>
											{data.producers.items.map(({ person }) => (
												<Button padding={0} key={person.id} text={person.name ?? person.originalName} transparent onPress={() => person.id && navigation.push('Person', { data: { id: person.id } })} />
											))}
										</ScrollView>
									</TVFocusGuideView>
								)}

								{data.operators.items.length > 0 && (
									<TVFocusGuideView style={{ flexDirection: 'row' }} autoFocus>
										<Text style={{ width: 160, color: colors.text200, fontSize: 13 }}>Оператор</Text>
										<ScrollView horizontal style={{ flex: 1 }}>
											{data.operators.items.map(({ person }) => (
												<Button padding={0} key={person.id} text={person.name ?? person.originalName} transparent onPress={() => person.id && navigation.push('Person', { data: { id: person.id } })} />
											))}
										</ScrollView>
									</TVFocusGuideView>
								)}

								{data.composers.items.length > 0 && (
									<TVFocusGuideView style={{ flexDirection: 'row' }} autoFocus>
										<Text style={{ width: 160, color: colors.text200, fontSize: 13 }}>Композитор</Text>
										<ScrollView horizontal style={{ flex: 1 }}>
											{data.composers.items.map(({ person }) => (
												<Button padding={0} key={person.id} text={person.name ?? person.originalName} transparent onPress={() => person.id && navigation.push('Person', { data: { id: person.id } })} />
											))}
										</ScrollView>
									</TVFocusGuideView>
								)}

								{data.designers.items.length > 0 && (
									<TVFocusGuideView style={{ flexDirection: 'row' }} autoFocus>
										<Text style={{ width: 160, color: colors.text200, fontSize: 13 }}>Художник</Text>
										<ScrollView horizontal style={{ flex: 1 }}>
											{data.designers.items.map(({ person }) => (
												<Button padding={0} key={person.id} text={person.name ?? person.originalName} transparent onPress={() => person.id && navigation.push('Person', { data: { id: person.id } })} />
											))}
										</ScrollView>
									</TVFocusGuideView>
								)}

								{data.filmEditors.items.length > 0 && (
									<TVFocusGuideView style={{ flexDirection: 'row' }} autoFocus>
										<Text style={{ width: 160, color: colors.text200, fontSize: 13 }}>Монтаж</Text>
										<ScrollView horizontal style={{ flex: 1 }}>
											{data.filmEditors.items.map(({ person }) => (
												<Button padding={0} key={person.id} text={person.name ?? person.originalName} transparent onPress={() => person.id && navigation.push('Person', { data: { id: person.id } })} />
											))}
										</ScrollView>
									</TVFocusGuideView>
								)}

								{data.boxOffice.budget && (
									<View style={{ flexDirection: 'row' }}>
										<Text style={{ width: 160, color: colors.text200, fontSize: 13 }}>Бюджет</Text>
										<Button padding={0} flex={1} transparent focusable={false} textColor={colors.text200} text={data.boxOffice.budget.currency.symbol + data.boxOffice.budget.amount.toLocaleString()} />
									</View>
								)}

								{data.boxOffice.usaBox && (
									<View style={{ flexDirection: 'row' }}>
										<Text style={{ width: 160, color: colors.text200, fontSize: 13 }}>Сборы в США</Text>
										<Button padding={0} flex={1} transparent focusable={false} textColor={colors.text200} text={data.boxOffice.usaBox.currency.symbol + data.boxOffice.usaBox.amount.toLocaleString()} />
									</View>
								)}

								{data.boxOffice.worldBox && data.boxOffice.usaBox && data.boxOffice.worldBox.amount !== data.boxOffice.usaBox.amount && (
									<View style={{ flexDirection: 'row' }}>
										<Text style={{ width: 160, color: colors.text200, fontSize: 13 }}>Сборы в мире</Text>
										<Button padding={0} flex={1} transparent focusable={false} textColor={colors.text200} text={`+ ${data.boxOffice.usaBox.currency.symbol}${(data.boxOffice.worldBox.amount - data.boxOffice.usaBox.amount).toLocaleString()} = ${data.boxOffice.worldBox.currency.symbol}${data.boxOffice.worldBox.amount.toLocaleString()}`} />
									</View>
								)}

								{data.__typename === 'Film' && data.audience.total > 0 && (
									<View style={{ flexDirection: 'row' }}>
										<Text style={{ width: 160, color: colors.text200, fontSize: 13 }}>Зрители</Text>
										<ScrollView horizontal style={{ flex: 1, paddingLeft: 5 }}>
											{data.audience.items.map((it, i) => (
												<View key={it.country.id} style={{ flexDirection: 'row' }}>
													<View style={{ marginLeft: i !== 0 ? 5 : undefined, flexDirection: 'row', alignItems: 'center' }}>
														<Image style={{ width: 16, height: 11, marginRight: 5 }} source={{ uri: `https://st.kp.yandex.net/images/flags/flag-${it.country.id}.gif` }} />
														<Text style={{ color: colors.text200, fontSize: 13 }}>{it.count >= 1000000 ? `${(it.count / 1000000).toFixed(1)} млн` : it.count >= 1000 ? `${(it.count / 1000).toFixed(1)} тыс` : it.count.toFixed(1)}</Text>
													</View>
													{data.audience?.total !== i + 1 && <Text style={{ color: colors.text200, fontSize: 13, lineHeight: 18 }}>,</Text>}
												</View>
											))}
										</ScrollView>
									</View>
								)}

								{data.boxOffice.rusBox && (
									<View style={{ flexDirection: 'row' }}>
										<Text style={{ width: 160, color: colors.text200, fontSize: 13 }}>Сборы в России</Text>
										<Button padding={0} flex={1} transparent focusable={false} textColor={colors.text200} text={data.boxOffice.rusBox.currency.symbol + data.boxOffice.rusBox.amount.toLocaleString()} />
									</View>
								)}

								{data.distribution.rusRelease.items.length > 0 && (
									<View style={{ flexDirection: 'row' }}>
										<Text style={{ width: 160, color: colors.text200, fontSize: 13 }}>Премьера в России</Text>
										<View style={{ flex: 1, flexDirection: 'row' }}>
											<Button padding={0} transparent focusable={false} textColor={colors.text200} text={[data.distribution.rusRelease.items.map(it => (it.date ? new Date(it.date.date).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' }).replace(' г.', '') : '')).join(' '), data.distribution.rusRelease.items.map(it => it.companies.map(it => `«${it.displayName}»`).join('')).join(' ')].filter(it => !!it).join(', ')} />
											{'releaseOptions' in data && data.releaseOptions.isImax && <KpImaxIcon width={40} height={16} style={{ marginLeft: 4, transform: [{ translateY: 3 }] }} viewBox='0 0 40 16' />}
											{'releaseOptions' in data && data.releaseOptions.is3d && <Kp3dIcon width={26} height={16} style={{ marginLeft: 4, transform: [{ translateY: 3 }] }} viewBox='0 0 26 16' />}
										</View>
									</View>
								)}

								{data.worldPremiere && (
									<View style={{ flexDirection: 'row' }}>
										<Text style={{ width: 160, color: colors.text200, fontSize: 13 }}>Премьера в мире</Text>
										<Button padding={0} flex={1} transparent focusable={false} textColor={colors.text200} text={new Date(data.worldPremiere.incompleteDate.date).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' }).replace(' г.', '')} />
									</View>
								)}

								{data.distribution.digitalRelease.items.length > 0 && (
									<View style={{ flexDirection: 'row' }}>
										<Text style={{ width: 160, color: colors.text200, fontSize: 13 }}>Цифровой релиз</Text>
										<Button padding={0} flex={1} transparent focusable={false} textColor={colors.text200} text={[data.distribution.digitalRelease.items.map(it => (it.date ? new Date(it.date.date).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' }).replace(' г.', '') : '')).join(' '), data.distribution.digitalRelease.items.map(it => it.companies.map(it => `«${it.displayName}»`).join('')).join(' ')].filter(it => !!it).join(', ')} />
									</View>
								)}

								{data.distribution.reRelease.items.length > 0 && (
									<View style={{ flexDirection: 'row' }}>
										<Text style={{ width: 160, color: colors.text200, fontSize: 13 }}>Ре-релиз (РФ)</Text>
										<Button padding={0} flex={1} transparent focusable={false} textColor={colors.text200} text={[data.distribution.reRelease.items.map(it => (it.date ? new Date(it.date.date).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' }).replace(' г.', '') : '')).join(' '), data.distribution.reRelease.items.map(it => it.companies.map(it => `«${it.displayName}»`).join('')).join(' ')].filter(it => !!it).join(', ')} />
									</View>
								)}

								{data.releases.find(it => it.type === 'DVD') && (
									<View style={{ flexDirection: 'row' }}>
										<Text style={{ width: 160, color: colors.text200, fontSize: 13 }}>Релиз на DVD</Text>
										<Button
											padding={0}
											flex={1}
											transparent
											focusable={false}
											textColor={colors.text200}
											text={
												new Date(data.releases.find(it => it.type === 'DVD')!.date).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' }).replace(' г.', '') +
												data.releases
													.find(it => it.type === 'DVD')!
													.releasers.map(it => `, «${it.name}»`)
													.join(' ')
											}
										/>
									</View>
								)}

								{data.releases.find(it => it.type === 'BLURAY') && (
									<View style={{ flexDirection: 'row' }}>
										<Text style={{ width: 160, color: colors.text200, fontSize: 13 }}>Релиз на Blu-ray</Text>
										<Button
											padding={0}
											flex={1}
											transparent
											focusable={false}
											textColor={colors.text200}
											text={
												new Date(data.releases.find(it => it.type === 'BLURAY')!.date).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' }).replace(' г.', '') +
												data.releases
													.find(it => it.type === 'BLURAY')!
													.releasers.map(it => `, «${it.name}»`)
													.join(' ')
											}
										/>
									</View>
								)}

								{data.restriction.age && (
									<View style={{ flexDirection: 'row' }}>
										<Text style={{ width: 160, color: colors.text200, fontSize: 13 }}>Возраст</Text>
										<View style={{ flex: 1, flexDirection: 'row', paddingLeft: 5 }}>
											<View style={{ borderColor: colors.text100 + 'cc', borderWidth: 1, paddingHorizontal: 4, paddingVertical: 3 }}>
												<Text style={{ fontWeight: '600', fontSize: 13, lineHeight: 13, color: colors.text100 + 'cc' }}>{data.restriction.age.replace('age', '')}+</Text>
											</View>
										</View>
									</View>
								)}

								{data.restriction.mpaa && (
									<View style={{ flexDirection: 'row' }}>
										<Text style={{ width: 160, color: colors.text200, fontSize: 13 }}>Рейтинг MPAA</Text>
										<View style={{ flex: 1, flexDirection: 'row', paddingLeft: 5 }}>
											<View style={{ borderColor: colors.text100 + 'cc', borderWidth: 1, paddingHorizontal: 4, paddingVertical: 3 }}>
												<Text style={{ fontWeight: '600', fontSize: 13, lineHeight: 13, color: colors.text100 + 'cc' }}>{ratingMPAA(data.restriction.mpaa).value}</Text>
											</View>
										</View>
									</View>
								)}

								{(data.__typename === 'TvSeries' ? !!data.seriesDuration : !!data.duration) && (
									<View style={{ flexDirection: 'row' }}>
										<Text style={{ width: 160, color: colors.text200, fontSize: 13 }}>Время</Text>
										<Button padding={0} flex={1} transparent focusable={false} textColor={colors.text200} text={`${data.__typename === 'TvSeries' ? data.seriesDuration : data.duration} мин${(data.__typename === 'TvSeries' ? data.seriesDuration : data.duration) > 60 ? '. / ' + formatDuration(data.__typename === 'TvSeries' ? data.seriesDuration : data.duration) : ''}` + (data.__typename === 'TvSeries' ? `${data.totalDuration && data.seriesDuration ? `. серия(${data.totalDuration} мин. всего)` : data.totalDuration && data.seriesDuration == null ? '. всего' : ''}` : '')} />
									</View>
								)}

								{data.sequelsPrequels.total > 0 && (
									<View style={{ marginTop: 40 }}>
										<Text style={{ color: colors.text100, fontSize: 22, fontWeight: '600', marginBottom: 9 }}>Сиквелы и приквелы</Text>
										<TVFocusGuideView style={{ flexDirection: 'row' }} autoFocus trapFocusLeft trapFocusRight>
											<FlatList
												keyExtractor={data => `sequels_prequels_item_${data.movie.id}`}
												data={data.sequelsPrequels.items}
												horizontal
												showsHorizontalScrollIndicator={!false}
												renderItem={({ item: { movie } }) => {
													const rating: null | { value: string; color: string } = movie.rating.expectation?.isActive && movie.rating.expectation.value && movie.rating.expectation.value > 0 ? { value: `${movie.rating.expectation.value.toFixed(0)}%`, color: getRatingColor(movie.rating.expectation.value / 10) } : movie.rating.kinopoisk?.isActive && movie.rating.kinopoisk.value && movie.rating.kinopoisk.value > 0 ? { value: `${movie.rating.kinopoisk.value.toFixed(1)}`, color: getRatingColor(movie.rating.kinopoisk.value) } : null
													const poster = normalizeUrlWithNull(movie.poster?.avatarsUrl, { isNull: 'https://via.placeholder.com', append: '/300x450' })

													return (
														<Button key={movie.id} animation='scale' flex={0} padding={5} transparent style={{ width: 110, height: 215.5 }} onPress={() => navigation.push('Movie', { data: { id: movie.id, type: movie.__typename } })}>
															<ImageBackground source={{ uri: poster }} style={{ height: 140, /* width: 93.5 */ aspectRatio: 667 / 1000 }} borderRadius={6}>
																{rating && (
																	<View style={{ position: 'absolute', top: 6, left: 6 }}>
																		<Text style={{ fontWeight: '600', fontSize: 13, lineHeight: 20, minWidth: 32, color: '#fff', textAlign: 'center', paddingHorizontal: 5, backgroundColor: rating.color }}>{rating.value}</Text>
																	</View>
																)}
															</ImageBackground>

															<View style={{ paddingTop: 5 }}>
																<Text style={{ color: colors.text100, fontSize: 14 }} numberOfLines={2}>
																	{movie.title.russian ?? movie.title.original ?? movie.title.english}
																</Text>
																<Text style={{ color: colors.text200, fontSize: 14 }} numberOfLines={1}>
																	{movie.__typename === 'TvSeries' ? movie.releaseYears[0]?.start : movie.productionYear}, {movie.genres[0]?.name}
																</Text>
															</View>
														</Button>
													)
												}}
											/>
										</TVFocusGuideView>
									</View>
								)}
							</View>

							<View style={{ borderColor: colors.bg300, borderBottomWidth: 1, marginBottom: 40, flexDirection: 'row' }}>
								<Button transparent text='Обзор' />
							</View>
							{data.synopsis && <Text style={{ color: colors.text100, fontSize: 16, marginBottom: 40 }}>{data.synopsis}</Text>}

							<View focusable accessible>
								<Text style={{ color: colors.text100, fontSize: 22, fontWeight: '600', marginBottom: 9 }}>Рейтинг {data.__typename === 'TvSeries' ? 'сериала' : 'фильма'}</Text>
								<View style={{ flexDirection: 'row' }}>
									<RatingText />
									<Text250 />
								</View>

								{data.rating.kinopoisk?.value === null && data.rating.kinopoisk.isActive && (
									<View>
										<Text style={{ fontSize: 48, fontWeight: '500', color: colors.text200 }}>–</Text>
										{data.rating.imdb?.value != null && data.rating.imdb.isActive && (
											<Text style={{ fontSize: 13, flex: 1, color: colors.text200 }}>
												<Text style={{ fontWeight: '500' }}>IMDb: {data.rating.imdb.value.toFixed(2)}</Text> {data.rating.imdb.count.toLocaleString()} оценок
											</Text>
										)}
										<Text style={{ fontSize: 13, color: colors.text200 }}>Недостаточно оценок, рейтинг формируется</Text>
									</View>
								)}

								{data.rating.kinopoisk?.value != null && data.rating.kinopoisk.isActive && data.rating.kinopoisk.value > 0 && (
									<View style={{ flexDirection: 'row' }}>
										<Text style={{ fontSize: 13, marginRight: 12, color: colors.text200 }}>{data.rating.kinopoisk.count.toLocaleString()} оценок</Text>
										{data.rating.imdb?.value != null && data.rating.imdb.isActive && (
											<Text style={{ fontSize: 13, flex: 1, color: colors.text200 }}>
												<Text style={{ fontWeight: '500' }}>IMDb: {data.rating.imdb.value.toFixed(2)}</Text> {data.rating.imdb.count.toLocaleString()} оценок
											</Text>
										)}
									</View>
								)}

								{data.rating.expectation?.value != null && data.rating.expectation.isActive && data.rating.expectation.value > 0 && (
									<View>
										<Text style={{ fontSize: 13, marginRight: 12, color: colors.text200 }}>Рейтинг ожидания</Text>
										<Text style={{ fontSize: 13, flex: 1, color: colors.text200 }}>{data.rating.expectation.count.toLocaleString()} ждут премьеры</Text>
									</View>
								)}
							</View>

							{/* <Button text='back' onPress={() => navigation.pop()} /> */}

							{data.similarMoviesCount.total > 0 && <SimilarMovie id={data.id} type={data.__typename} />}
						</View>
					</View>
				</View>
			</ScrollView>
		</TVFocusGuideView>
	)
}
