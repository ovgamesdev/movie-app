import { ActivityIndicator, Button } from '@components/atoms'
import { useOrientation, useTheme, useTypedSelector } from '@hooks'
import { RootStackParamList } from '@navigation'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { declineAge, declineChildren, getRatingColor, getSpouseStatus, normalizeUrlWithNull } from '@utils'
import React from 'react'
import { FlatList, Image, ImageBackground, ScrollView, StyleProp, TVFocusGuideView, Text, View, ViewStyle } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useGetPersonBaseInfoQuery } from '../../store/kinopoisk/kinopoisk.api'

type Props = NativeStackScreenProps<RootStackParamList, 'Person'>

export const Person = ({ navigation, route }: Props) => {
	const insets = useSafeAreaInsets()
	const isShowNetInfo = useTypedSelector(state => state.safeArea.isShowNetInfo)
	const { colors } = useTheme()
	const orientation = useOrientation()

	const { data, isFetching } = useGetPersonBaseInfoQuery({ personId: route.params.data.id })

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

	console.log('person data', data)

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

	return (
		<TVFocusGuideView style={{ flex: 1 }} trapFocusLeft trapFocusRight trapFocusUp trapFocusDown>
			<ScrollView contentContainerStyle={{ paddingBottom: 10 + (isShowNetInfo ? 0 : insets.bottom), paddingTop: 10 + insets.top }}>
				<View style={[{}, orientation.landscape && { flexDirection: 'row', padding: 10, paddingBottom: 5, paddingTop: 10 + insets.top, gap: 20 }]}>
					{orientation.landscape && (
						<View style={{ width: 300, gap: 20 }}>
							<PosterImage />
						</View>
					)}
					<View style={[{ flex: 1 }, orientation.portrait && { backgroundColor: colors.bg100, marginTop: -10, paddingHorizontal: 10, paddingTop: 10, borderTopLeftRadius: 16, borderTopRightRadius: 16 }]}>
						<View style={{ flexDirection: 'row', gap: 20 }}>
							{orientation.portrait && <PosterImage width={120} wrapperStyle={{ marginLeft: 0, marginRight: 10 }} />}
							<View style={{ flex: 1 }}>
								<Text style={{ color: colors.text100, fontSize: 28, fontWeight: '700' }}>{data.name ?? data.originalName}</Text>
								<Text style={{ color: colors.text200, fontSize: 18 }}>{!!data.name && data.originalName ? data.originalName : ''}</Text>
							</View>
						</View>
						<View style={{}}>
							<TVFocusGuideView style={{ marginBottom: 5, marginTop: 10, flexDirection: 'row', gap: 10 }} autoFocus>
								<Button text='favorites' hasTVPreferredFocus />
							</TVFocusGuideView>

							<Text style={{ color: colors.text100, fontSize: 22, fontWeight: '600', marginTop: 48, marginBottom: 9 }}>О персоне</Text>

							<View style={{ gap: 5, marginTop: 5, marginBottom: 40 }}>
								{data.roles.items.length > 0 && (
									<View style={{ flexDirection: 'row' }}>
										<Text style={{ width: 160, color: colors.text200, fontSize: 13 }}>Карьера</Text>
										<Button padding={0} flex={1} transparent focusable={false} textColor={colors.text200} text={data.roles.items.map(({ role }) => role.title.russian).join(', ')} />
									</View>
								)}

								{data.height && (
									<View style={{ flexDirection: 'row' }}>
										<Text style={{ width: 160, color: colors.text200, fontSize: 13 }}>Рост</Text>
										<Button padding={0} flex={1} transparent focusable={false} textColor={colors.text200} text={(data.height / 100).toString() + ' м'} />
									</View>
								)}

								<View style={{ flexDirection: 'row' }}>
									<Text style={{ width: 160, color: colors.text200, fontSize: 13 }}>Дата рождения</Text>
									{/* DAY | MONTH | MONTH_DAY | YEAR */}
									<Button padding={0} flex={1} transparent focusable={false} textColor={colors.text200} text={data.dateOfBirth ? [data.dateOfBirth.accuracy === 'MONTH_DAY' ? new Date(data.dateOfBirth.date.replace('0000', '1900')).toLocaleDateString(undefined, { day: 'numeric', month: 'long' }).replace(' г.', '') : new Date(data.dateOfBirth.date).toLocaleDateString(undefined, { day: 'numeric', month: 'long' }).replace(' г.', '') + ', ' + new Date(data.dateOfBirth.date).toLocaleDateString(undefined, { year: 'numeric' }), data.zodiacSign ? data.zodiacSign.title.russian : null, data.dateOfDeath ? null : declineAge(data.age)].filter(it => !!it).join(' • ') : '—'} />
								</View>

								<View style={{ flexDirection: 'row' }}>
									<Text style={{ width: 160, color: colors.text200, fontSize: 13 }}>Место рождения</Text>
									<Button padding={0} flex={1} transparent focusable={false} textColor={colors.text200} text={data.birthPlace ?? '—'} />
								</View>

								{data.dateOfDeath && (
									<View style={{ flexDirection: 'row' }}>
										<Text style={{ width: 160, color: colors.text200, fontSize: 13 }}>Дата смерти</Text>
										<Button padding={0} flex={1} transparent focusable={false} textColor={colors.text200} text={[new Date(data.dateOfDeath.date).toLocaleDateString(undefined, { day: 'numeric', month: 'long' }).replace(' г.', '') + (data.dateOfBirth ? ', ' + new Date(data.dateOfBirth.date).toLocaleDateString(undefined, { year: 'numeric' }) : ''), declineAge(data.age)].join(' • ')} />
									</View>
								)}

								{data.deathPlace && (
									<View style={{ flexDirection: 'row' }}>
										<Text style={{ width: 160, color: colors.text200, fontSize: 13 }}>Место смерти</Text>
										<Button padding={0} flex={1} transparent focusable={false} textColor={colors.text200} text={data.deathPlace} />
									</View>
								)}

								{data.mainGenres.length > 0 && (
									<View style={{ flexDirection: 'row' }}>
										<Text style={{ width: 160, color: colors.text200, fontSize: 13 }}>Жанры</Text>
										<Button padding={0} flex={1} transparent focusable={false} textColor={colors.text200} text={data.mainGenres.map(it => it.name).join(', ')} />
									</View>
								)}

								{data.marriages.length > 0 && (
									<View style={{ flexDirection: 'row' }}>
										<Text style={{ width: 160, color: colors.text200, fontSize: 13 }}>{data.gender === 'MALE' ? 'Супруга' : 'Супруг'}</Text>
										<View style={{ flex: 1 }}>
											{data.marriages.map((it, i) => {
												const spouseStatus = getSpouseStatus(it.status, it.spouse.gender)

												return (
													<Button key={i} padding={0} transparent flexDirection='row' focusable={it.spouse.published} disabled={!it.spouse.published} onPress={() => navigation.push('Person', { data: { id: it.spouse.id } })}>
														<Text style={{ color: it.spouse.published ? colors.text100 : colors.text200 }}>{(it.spouse.name ?? it.spouse.originalName) + (spouseStatus ? ` (${spouseStatus})` : '')}</Text>
														{it.children === 0 ? null : <Text style={{ marginLeft: 5 }}>{declineChildren(it.children)}</Text>}
													</Button>
												)
											})}
										</View>
									</View>
								)}

								{data.filmographyYears && (
									<View style={{ flexDirection: 'row' }}>
										<Text style={{ width: 160, color: colors.text200, fontSize: 13 }}>Всего фильмов</Text>
										<Button padding={0} flex={1} transparent focusable={false} textColor={colors.text200} text={data.movieCount.total + ', ' + data.filmographyYears.start + ' — ' + data.filmographyYears.end} />
									</View>
								)}

								{data.bestFilms.items.length > 0 && (
									<TVFocusGuideView style={{ flexDirection: 'row' }} autoFocus>
										<Text style={{ width: 160, color: colors.text200, fontSize: 13 }}>Лучшие фильмы</Text>
										<ScrollView horizontal style={{ flex: 1 }}>
											{data.bestFilms.items.map(({ movie }, i, { length }) => (
												<Button padding={0} key={movie.id} transparent text={(movie.title.russian ?? '') + (i !== length - 1 ? ', ' : '')} onPress={() => navigation.push('Movie', { data: { id: movie.id, type: movie.__typename } })} />
											))}
										</ScrollView>
									</TVFocusGuideView>
								)}

								{data.bestSeries.items.length > 0 && (
									<TVFocusGuideView style={{ flexDirection: 'row' }} autoFocus>
										<Text style={{ width: 160, color: colors.text200, fontSize: 13 }}>Лучшие сериалы</Text>
										<ScrollView horizontal style={{ flex: 1 }}>
											{data.bestSeries.items.map(({ movie }, i, { length }) => (
												<Button padding={0} key={movie.id} transparent text={(movie.title.russian ?? '') + (i !== length - 1 ? ', ' : '')} onPress={() => navigation.push('Movie', { data: { id: movie.id, type: movie.__typename } })} />
											))}
										</ScrollView>
									</TVFocusGuideView>
								)}

								{data.popularMovies.items.length > 0 && (
									<View style={{ marginTop: 40 }}>
										<Text style={{ color: colors.text100, fontSize: 22, fontWeight: '600', marginBottom: 9 }}>Популярное сейчас</Text>
										<TVFocusGuideView style={{ flexDirection: 'row' }} autoFocus trapFocusLeft trapFocusRight>
											<FlatList
												keyExtractor={data => `popular_movies_item_${data.movie.id}`}
												data={data.popularMovies.items}
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
																	{movie.title.russian ?? movie.title.original}
																</Text>
																<Text style={{ color: colors.text200, fontSize: 14 }} numberOfLines={1}>
																	{[movie.__typename === 'TvSeries' || movie.__typename === 'MiniSeries' ? movie.releaseYears?.[0]?.start : movie.productionYear, movie.genres[0]?.name].filter(it => !!it).join(', ')}
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
						</View>
					</View>
				</View>
			</ScrollView>
		</TVFocusGuideView>
	)
}
