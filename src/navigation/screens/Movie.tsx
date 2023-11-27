import { ActivityIndicator, Button } from '@components/atoms'
import { useOrientation, useTheme, useTypedSelector } from '@hooks'
import { Kp3dIcon, KpImaxIcon, PlayIcon } from '@icons'
import { RootStackParamList } from '@navigation'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { declineSeasons, formatDuration, ratingMPAA } from '@utils'
import { Image, ImageBackground, ScrollView, StyleProp, TVFocusGuideView, Text, View, ViewProps, ViewStyle } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Colors } from 'react-native/Libraries/NewAppScreen'
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
	const isFetching = isFetchingFilm ?? isFetchingTvSeries

	if (isFetching || !data) {
		return (
			<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
				<ActivityIndicator size='large' />
			</View>
		)
	}

	console.log('data:', data)

	const PosterImage = ({ width, height, borderRadius, top, style, wrapperStyle }: { width?: number; height?: number; borderRadius?: number; top?: number; style?: StyleProp<ViewStyle>; wrapperStyle?: StyleProp<ViewStyle> }) => {
		const poster = `https:${data.poster.avatarsUrl}/300x450`

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

		const poster = `https:${data.mainTrailer.preview.avatarsUrl}/600x380`

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

		const poster = `https:${data.cover.image.avatarsUrl}/1344x756`

		return (
			<View {...props}>
				<ImageBackground source={{ uri: poster }} style={{ width: '100%', aspectRatio: 16 / 9, justifyContent: 'center', alignItems: 'center', gap: 10 }} />
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
							{orientation.portrait && (!!data.mainTrailer || !!data.cover ? <PosterImage width={120} height={80 + 6 + 6 ?? 96} borderRadius={8} top={-100} style={{ position: 'absolute', borderWidth: 6, borderColor: colors.bg100, backgroundColor: colors.bg100 }} wrapperStyle={{ marginLeft: 0, marginRight: 20 }} /> : <PosterImage width={120} borderRadius={8} wrapperStyle={{ marginLeft: 0, marginRight: 10 }} />)}
							<View style={{ flex: 1 }}>
								<Text style={{ color: colors.text100, fontSize: 28, fontWeight: '700' }}>
									{data.title.russian ?? data.title.localized ?? data.title.original} <Text>{data.__typename === 'Film' ? `(${data.productionYear})` : `(сериал ${data.releaseYears[0]?.start === data.releaseYears[0]?.end ? (data.releaseYears[0]?.start === null ? '' : data.releaseYears[0]?.start) : data.releaseYears[0]?.start !== null || data.releaseYears[0]?.end !== null ? (data.releaseYears[0]?.start ?? '...') + ' - ' + (data.releaseYears[0]?.end ?? '...') : ''})`}</Text>
								</Text>

								<Text style={{ color: colors.text200, fontSize: 18 }}>
									{data.title.original ? data.title.original + ' ' : ''}
									{data.restriction.age ? data.restriction.age.replace('age', '') : ''}+
								</Text>
							</View>
						</View>
						<View style={{}}>
							<TVFocusGuideView style={{ marginBottom: 5, marginTop: 10, flexDirection: 'row', gap: 10 }} autoFocus>
								<Button text='watch' onPress={() => navigation.navigate('Watch', { data })} hasTVPreferredFocus />
								<Button text='trailer' />
							</TVFocusGuideView>

							<View style={{ gap: 5, marginTop: 5 }}>
								{!!data.productionYear && (
									<TVFocusGuideView style={{ flexDirection: 'row' }} autoFocus>
										<Text style={{ flex: 1 }}>Год производства</Text>
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
										<Text style={{ flex: 1 }}>Платформа</Text>
										<Button padding={0} flex={1} transparent focusable={false} textColor={colors.text200} text={data.distribution.originals.items.map(it => it.companies.map(it => it.displayName).join(' ')).join(' ')} />
									</View>
								)}

								{data.countries.length > 0 && (
									<TVFocusGuideView style={{ flexDirection: 'row' }} autoFocus>
										<Text style={{ flex: 1 }}>Страна</Text>
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
										<Text style={{ flex: 1 }}>Жанр</Text>
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
									<Text style={{ flex: 1 }}>Слоган</Text>
									<Button padding={0} flex={1} transparent focusable={false} textColor={colors.text200} text={data.tagline ? `«${data.tagline.replace(/(\s+\(season \d+\))/gi, '').replace(/\.$/g, '')}»` : '—'} />
								</View>

								{data.actors.items.length > 0 && (
									<TVFocusGuideView style={{ flexDirection: 'row' }} autoFocus>
										<Text style={{ flex: 1 }}>В главных ролях</Text>
										<ScrollView horizontal style={{ flex: 1 }}>
											{data.actors.items.map(({ person }) => (
												<Button padding={0} key={person.id} text={person.name ?? person.originalName} transparent />
											))}
										</ScrollView>
									</TVFocusGuideView>
								)}

								{data.voiceOverActors.total > 0 && (
									<TVFocusGuideView style={{ flexDirection: 'row' }} autoFocus>
										<Text style={{ flex: 1 }}>Роли дублировали</Text>
										<ScrollView horizontal style={{ flex: 1 }}>
											{data.voiceOverActors.items.map(({ person }) => (
												<Button padding={0} key={person.id} text={person.name ?? person.originalName} transparent />
											))}
										</ScrollView>
									</TVFocusGuideView>
								)}

								{data.directors.items.length > 0 && (
									<TVFocusGuideView style={{ flexDirection: 'row' }} autoFocus>
										<Text style={{ flex: 1 }}>Режиссер</Text>
										<ScrollView horizontal style={{ flex: 1 }}>
											{data.directors.items.map(({ person }) => (
												<Button padding={0} key={person.id} text={person.name ?? person.originalName} transparent />
											))}
										</ScrollView>
									</TVFocusGuideView>
								)}

								{data.writers.items.length > 0 && (
									<TVFocusGuideView style={{ flexDirection: 'row' }} autoFocus>
										<Text style={{ flex: 1 }}>Сценарий</Text>
										<ScrollView horizontal style={{ flex: 1 }}>
											{data.writers.items.map(({ person }) => (
												<Button padding={0} key={person.id} text={person.name ?? person.originalName} transparent />
											))}
										</ScrollView>
									</TVFocusGuideView>
								)}

								{data.producers.items.length > 0 && (
									<TVFocusGuideView style={{ flexDirection: 'row' }} autoFocus>
										<Text style={{ flex: 1 }}>Продюсер</Text>
										<ScrollView horizontal style={{ flex: 1 }}>
											{data.producers.items.map(({ person }) => (
												<Button padding={0} key={person.id} text={person.name ?? person.originalName} transparent />
											))}
										</ScrollView>
									</TVFocusGuideView>
								)}

								{data.operators.items.length > 0 && (
									<TVFocusGuideView style={{ flexDirection: 'row' }} autoFocus>
										<Text style={{ flex: 1 }}>Оператор</Text>
										<ScrollView horizontal style={{ flex: 1 }}>
											{data.operators.items.map(({ person }) => (
												<Button padding={0} key={person.id} text={person.name ?? person.originalName} transparent />
											))}
										</ScrollView>
									</TVFocusGuideView>
								)}

								{data.composers.items.length > 0 && (
									<TVFocusGuideView style={{ flexDirection: 'row' }} autoFocus>
										<Text style={{ flex: 1 }}>Композитор</Text>
										<ScrollView horizontal style={{ flex: 1 }}>
											{data.composers.items.map(({ person }) => (
												<Button padding={0} key={person.id} text={person.name ?? person.originalName} transparent />
											))}
										</ScrollView>
									</TVFocusGuideView>
								)}

								{data.designers.items.length > 0 && (
									<TVFocusGuideView style={{ flexDirection: 'row' }} autoFocus>
										<Text style={{ flex: 1 }}>Художник</Text>
										<ScrollView horizontal style={{ flex: 1 }}>
											{data.designers.items.map(({ person }) => (
												<Button padding={0} key={person.id} text={person.name ?? person.originalName} transparent />
											))}
										</ScrollView>
									</TVFocusGuideView>
								)}
								{data.filmEditors.items.length > 0 && (
									<TVFocusGuideView style={{ flexDirection: 'row' }} autoFocus>
										<Text style={{ flex: 1 }}>Монтаж</Text>
										<ScrollView horizontal style={{ flex: 1 }}>
											{data.filmEditors.items.map(({ person }) => (
												<Button padding={0} key={person.id} text={person.name ?? person.originalName} transparent />
											))}
										</ScrollView>
									</TVFocusGuideView>
								)}

								{data.boxOffice.budget && (
									<TVFocusGuideView style={{ flexDirection: 'row' }} autoFocus>
										<Text style={{ flex: 1 }}>Бюджет</Text>
										<Button padding={0} flex={1} transparent focusable={false} textColor={colors.text200} text={data.boxOffice.budget.currency.symbol + data.boxOffice.budget.amount.toLocaleString()} />
									</TVFocusGuideView>
								)}

								{data.boxOffice.usaBox && (
									<TVFocusGuideView style={{ flexDirection: 'row' }} autoFocus>
										<Text style={{ flex: 1 }}>Сборы в США</Text>
										<Button padding={0} flex={1} transparent focusable={false} textColor={colors.text200} text={data.boxOffice.usaBox.currency.symbol + data.boxOffice.usaBox.amount.toLocaleString()} />
									</TVFocusGuideView>
								)}

								{data.boxOffice.worldBox && (
									<TVFocusGuideView style={{ flexDirection: 'row' }} autoFocus>
										<Text style={{ flex: 1 }}>Сборы в мире</Text>
										<Button padding={0} flex={1} transparent focusable={false} textColor={colors.text200} text={(data.boxOffice.usaBox ? `+ ${data.boxOffice.usaBox.currency.symbol}${(data.boxOffice.worldBox.amount - data.boxOffice.usaBox.amount).toLocaleString()} = ` : '') + data.boxOffice.worldBox.currency.symbol + data.boxOffice.worldBox.amount.toLocaleString()} />
									</TVFocusGuideView>
								)}

								{/* TODO fix border */}
								{data.__typename === 'Film' && data.audience.total > 0 && (
									<TVFocusGuideView style={{ flexDirection: 'row' }} autoFocus>
										<Text style={{ flex: 1 }}>Зрители</Text>
										<ScrollView horizontal style={{ flex: 1 }}>
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
									</TVFocusGuideView>
								)}

								{data.boxOffice.rusBox && (
									<TVFocusGuideView style={{ flexDirection: 'row' }} autoFocus>
										<Text style={{ flex: 1 }}>Сборы в России</Text>
										<Button padding={0} flex={1} transparent focusable={false} textColor={colors.text200} text={data.boxOffice.rusBox.currency.symbol + data.boxOffice.rusBox.amount.toLocaleString()} />
									</TVFocusGuideView>
								)}

								{data.distribution.rusRelease.items.length > 0 && (
									<TVFocusGuideView style={{ flexDirection: 'row' }} autoFocus>
										<Text style={{ flex: 1 }}>Премьера в России</Text>
										<View style={{ flex: 1, flexDirection: 'row' }}>
											<Button padding={0} transparent focusable={false} textColor={colors.text200} text={data.distribution.rusRelease.items.map(it => new Date(it.date.date).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' }).replace(' г.', '')).join(' ') + data.distribution.rusRelease.items.map(it => it.companies.map(campania => `, «${campania.displayName}»`).join('')).join(' ')} />
											{'releaseOptions' in data && data.releaseOptions.isImax && <KpImaxIcon width={40} height={16} style={{ marginLeft: 4, transform: [{ translateY: 3 }] }} viewBox='0 0 40 16' />}
											{'releaseOptions' in data && data.releaseOptions.is3d && <Kp3dIcon width={26} height={16} style={{ marginLeft: 4, transform: [{ translateY: 3 }] }} viewBox='0 0 26 16' />}
										</View>
									</TVFocusGuideView>
								)}

								{data.worldPremiere && (
									<TVFocusGuideView style={{ flexDirection: 'row' }} autoFocus>
										<Text style={{ flex: 1 }}>Премьера в мире</Text>
										<Button padding={0} flex={1} transparent focusable={false} textColor={colors.text200} text={new Date(data.worldPremiere.incompleteDate.date).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' }).replace(' г.', '')} />
									</TVFocusGuideView>
								)}

								{data.distribution.digitalRelease.items.length > 0 && (
									<TVFocusGuideView style={{ flexDirection: 'row' }} autoFocus>
										<Text style={{ flex: 1 }}>Цифровой релиз</Text>
										<Button padding={0} flex={1} transparent focusable={false} textColor={colors.text200} text={data.distribution.digitalRelease.items.map(it => new Date(it.date.date).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' }).replace(' г.', '') + ' ').join(' ') + data.distribution.digitalRelease.items.map(it => it.companies.map(it => `, «${it.displayName}»`)).join(' ')} />
									</TVFocusGuideView>
								)}

								{data.distribution.reRelease.items.length > 0 && (
									<TVFocusGuideView style={{ flexDirection: 'row' }} autoFocus>
										<Text style={{ flex: 1 }}>Ре-релиз (РФ)</Text>
										<Button padding={0} flex={1} transparent focusable={false} textColor={colors.text200} text={data.distribution.reRelease.items.map(it => new Date(it.date.date).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' }).replace(' г.', '') + ' ').join(' ') + data.distribution.reRelease.items.map(it => it.companies.map(it => `, «${it.displayName}»`)).join(' ')} />
									</TVFocusGuideView>
								)}

								{data.releases.find(it => it.type === 'DVD') && (
									<TVFocusGuideView style={{ flexDirection: 'row' }} autoFocus>
										<Text style={{ flex: 1 }}>Релиз на DVD</Text>
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
									</TVFocusGuideView>
								)}

								{data.releases.find(it => it.type === 'BLURAY') && (
									<TVFocusGuideView style={{ flexDirection: 'row' }} autoFocus>
										<Text style={{ flex: 1 }}>Релиз на Blu-ray</Text>
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
									</TVFocusGuideView>
								)}

								{/* TODO fix border */}
								{data.restriction.age && (
									<TVFocusGuideView style={{ flexDirection: 'row' }} autoFocus>
										<Text style={{ flex: 1 }}>Возраст</Text>
										<Text style={{ flex: 1 }}>{data.restriction.age.replace('age', '')}+</Text>
									</TVFocusGuideView>
								)}

								{/* TODO fix border */}
								{data.restriction.mpaa && (
									<TVFocusGuideView style={{ flexDirection: 'row' }} autoFocus>
										<Text style={{ flex: 1 }}>Рейтинг MPAA</Text>
										<View style={{ flex: 1, flexDirection: 'row' }}>
											<View style={{ borderColor: colors.text100, borderWidth: 1, paddingHorizontal: 4, paddingVertical: 3 }}>
												<Text style={{ fontWeight: '600', fontSize: 13, lineHeight: 13 }}>{ratingMPAA(data.restriction.mpaa).value}</Text>
											</View>
										</View>
									</TVFocusGuideView>
								)}

								{(data.__typename === 'TvSeries' ? !!data.seriesDuration : !!data.duration) && (
									<TVFocusGuideView style={{ flexDirection: 'row' }} autoFocus>
										<Text style={{ flex: 1 }}>Время</Text>
										<Button padding={0} flex={1} transparent focusable={false} textColor={colors.text200} text={`${data.__typename === 'TvSeries' ? data.seriesDuration : data.duration} мин${(data.__typename === 'TvSeries' ? data.seriesDuration : data.duration) > 60 ? '. / ' + formatDuration(data.__typename === 'TvSeries' ? data.seriesDuration : data.duration) : ''}` + (data.__typename === 'TvSeries' ? `${data.totalDuration && data.seriesDuration ? `. серия(${data.totalDuration} мин. всего)` : data.totalDuration && data.seriesDuration == null ? '. всего' : ''}` : '')} />
									</TVFocusGuideView>
								)}

								{data.synopsis && <Text style={{ color: Colors.text100, fontSize: 16, marginTop: 40 }}>{data.synopsis}</Text>}

								{/* <Button text='back' onPress={() => navigation.pop()} /> */}
							</View>
						</View>
					</View>
				</View>
			</ScrollView>
		</TVFocusGuideView>
	)
}
