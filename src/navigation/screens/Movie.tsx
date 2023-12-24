import { ActivityIndicator, Button, ImageBackground } from '@components/atoms'
import { ProductionStatusText, Rating, Trailer } from '@components/molecules/movie' // /index
import { Encyclopedic, Episodes, SequelsPrequels, SimilarMovie, WatchButton } from '@components/organisms/movie'
import { useActions, useOrientation, useTheme, useTypedSelector } from '@hooks'
import { RootStackParamList } from '@navigation'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { IFilmBaseInfo, ITvSeriesBaseInfo, useGetFilmBaseInfoQuery, useGetTvSeriesBaseInfoQuery } from '@store/kinopoisk'
import { WatchHistory } from '@store/settings'
import { isSeries, normalizeUrlWithNull } from '@utils'
import { useEffect, useState } from 'react'
import { Platform, ScrollView, StyleProp, TVFocusGuideView, Text, View, ViewProps, ViewStyle } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

type Props = NativeStackScreenProps<RootStackParamList, 'Movie'>

// TODO releaseYears to string (releaseYears) => string

export const Movie = ({ navigation, route }: Props) => {
	const insets = useSafeAreaInsets()
	const isShowNetInfo = useTypedSelector(state => state.safeArea.isShowNetInfo)
	const { colors } = useTheme()
	const orientation = useOrientation()

	// const orientation = { portrait: true, landscape: false }
	// const orientation = { portrait: false, landscape: true }

	const { data: dataFilm, isFetching: isFetchingFilm } = useGetFilmBaseInfoQuery({ filmId: route.params.data.id }, { skip: route.params.data.type !== 'Film' && route.params.data.type !== 'Video' })
	const { data: dataTvSeries, isFetching: isFetchingTvSeries } = useGetTvSeriesBaseInfoQuery({ tvSeriesId: route.params.data.id }, { skip: route.params.data.type !== 'TvSeries' && route.params.data.type !== 'MiniSeries' })

	const data: IFilmBaseInfo | ITvSeriesBaseInfo | undefined = dataFilm ?? dataTvSeries
	const isFetching = isFetchingFilm || isFetchingTvSeries

	if (isFetching) {
		return (
			<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
				<ActivityIndicator size='large' />
			</View>
		)
	}

	if (!data) {
		// TODO add Not found
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
					<ImageBackground source={{ uri: poster }} style={{ width: width ?? 300, aspectRatio: 2 / 3 }} borderRadius={borderRadius} />
				</View>
			</View>
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

	// TODO remove this
	const TestContentReleaseNotifyButton = () => {
		const [status, setStatus] = useState<'loading' | 'off-notify' | 'on-notify'>('loading')
		const { mergeItem, removeItemByPath } = useActions()
		const watchHistory = useTypedSelector(state => state.settings.settings.watchHistory)

		useEffect(() => {
			const init = async () => setStatus((watchHistory[`${data.id}:provider`] as WatchHistory | undefined)?.status === 'pause' ? 'on-notify' : 'off-notify')

			init()
		}, [])

		return (
			<Button
				text={status === 'loading' ? undefined : status === 'off-notify' ? 'Сообщить когда выйдет' : 'Не сообщать когда выйдет'}
				onPress={async () => {
					const item: WatchHistory = {
						id: data.id,
						type: data.__typename,
						title: data.title.russian ?? data.title.localized ?? data.title.original ?? data.title.english ?? '',
						poster: data.poster?.avatarsUrl ?? null,
						// eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
						year: data.productionYear ?? (('releaseYears' in data && data.releaseYears[0]?.start) || null),
						timestamp: Date.now(),
						provider: 'provider',
						status: 'pause'
					}

					switch (status) {
						case 'loading':
							break
						case 'off-notify':
							setStatus('on-notify')
							mergeItem({ watchHistory: { [`${item.id}:${item.provider}`]: item } })
							break
						case 'on-notify':
							setStatus('off-notify')
							removeItemByPath(['watchHistory', `${item.id}:${item.provider}`])
							break
					}
				}}

				//
			>
				{status === 'loading' ? <ActivityIndicator /> : undefined}
			</Button>
		)
	}

	return (
		<TVFocusGuideView style={{ flex: 1, marginTop: 0, marginBottom: 0 }} trapFocusLeft trapFocusRight trapFocusUp trapFocusDown>
			<ScrollView contentContainerStyle={{ paddingBottom: 10 + (isShowNetInfo ? 0 : insets.bottom) }}>
				{orientation.portrait && (data.cover ? <Cover /> : data.mainTrailer ? <Trailer mainTrailer={data.mainTrailer} aspectRatio={16 / 9} disabled showPlay={false} /> : <View style={{ paddingTop: 10 + insets.top }} />)}
				<View style={[{}, orientation.landscape && { flexDirection: 'row', padding: 10, paddingBottom: 5, paddingTop: 10 + insets.top, gap: 20 }]}>
					{orientation.landscape && (
						<View style={{ width: 300, gap: 20 }}>
							<PosterImage />
							{data.mainTrailer && (
								<View style={{ gap: 5 }}>
									<Trailer mainTrailer={data.mainTrailer} showTime />
									<Text style={{ color: colors.text100, fontSize: 15 }}>{data.mainTrailer.title}</Text>
									<Text style={{ color: colors.text200, fontSize: 13 }}>{new Date(data.mainTrailer.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' }).replace(' г.', '')}</Text>
								</View>
							)}
						</View>
					)}
					<View style={[{ flex: 1 }, orientation.portrait && { backgroundColor: colors.bg100, marginTop: -10, paddingHorizontal: 10, paddingTop: 10, borderTopLeftRadius: 16, borderTopRightRadius: 16 }]}>
						<View style={{ flexDirection: 'row', gap: 10 }}>
							{orientation.portrait && (!!data.mainTrailer || !!data.cover ? <PosterImage width={120} height={120 + 6 + 6} borderRadius={6} top={-60} style={{ position: 'absolute', borderWidth: 6, borderColor: colors.bg100, backgroundColor: colors.bg100 }} wrapperStyle={{ marginLeft: 0, marginRight: 20 }} /> : <PosterImage width={120} borderRadius={6} wrapperStyle={{ marginLeft: 0, marginRight: 10 }} />)}
							<View style={{ flex: 1 }}>
								<Text style={{ color: colors.text100, fontSize: 28, fontWeight: '700' }} selectable={!Platform.isTV}>
									{data.productionStatus && data.productionStatusUpdateDate && <ProductionStatusText productionStatus={data.productionStatus} productionStatusUpdateDate={data.productionStatusUpdateDate} />}
									{/* TODO releaseYears to utils */}
									{data.title.russian ?? data.title.localized ?? data.title.original ?? data.title.english} <Text>{isSeries(data.__typename) ? `(${data.__typename === 'MiniSeries' ? 'мини–сериал' : 'сериал'}${'releaseYears' in data && data.releaseYears[0]?.start === data.releaseYears[0]?.end ? (data.releaseYears[0]?.start === null || data.releaseYears[0]?.start === 0 ? '' : ' ' + data.releaseYears[0]?.start) : 'releaseYears' in data && (data.releaseYears[0]?.start !== null || data.releaseYears[0]?.end !== null) ? ' ' + (data.releaseYears[0]?.start ?? '...') + ' - ' + (data.releaseYears[0]?.end ?? '...') : ''})` : data.productionYear !== null ? `(${data.productionYear})` : ''}</Text>
								</Text>

								<Text style={{ color: colors.text200, fontSize: 18 }} selectable={!Platform.isTV}>
									{(!!data.title.russian || !!data.title.localized) && data.title.original ? data.title.original + ' ' : ''}
									{data.restriction.age ? data.restriction.age.replace('age', '') + '+' : ''}
								</Text>
							</View>
						</View>
						<View style={{}}>
							<TVFocusGuideView style={{ marginBottom: 5, marginTop: 10, flexDirection: 'row', gap: 10 }} autoFocus>
								<WatchButton data={data} />
								<TestContentReleaseNotifyButton />
							</TVFocusGuideView>

							<Text style={{ color: colors.text100, fontSize: 22, fontWeight: '600', marginTop: 48, marginBottom: 9 }}>О {isSeries(data.__typename) ? 'сериале' : 'фильме'}</Text>

							<View style={{ gap: 5, marginTop: 5, marginBottom: 40 }}>
								<Encyclopedic data={data} />

								{'seasons' in data && data.seasons.total > 0 && <Episodes id={data.id} />}

								<SequelsPrequels sequelsPrequels={data.sequelsPrequels} />
							</View>

							<View style={{ borderColor: colors.bg300, borderBottomWidth: 1, marginBottom: 40, flexDirection: 'row' }}>
								<Button transparent text='Обзор' />
							</View>
							{data.synopsis && <Text style={{ color: colors.text100, fontSize: 16, marginBottom: 40 }}>{data.synopsis}</Text>}

							<Rating __typename={data.__typename} rating={data.rating} top250={data.top250} />

							{orientation.portrait && data.mainTrailer && (
								<>
									<Text style={{ color: colors.text100, fontSize: 22, fontWeight: '600', marginBottom: 16, marginTop: 40 }}>Трейлер</Text>
									<View style={{ gap: 5 }}>
										<Trailer mainTrailer={data.mainTrailer} showTime />
										<Text style={{ color: colors.text100, fontSize: 15 }}>{data.mainTrailer.title}</Text>
										<Text style={{ color: colors.text200, fontSize: 13 }}>{new Date(data.mainTrailer.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' }).replace(' г.', '')}</Text>
									</View>
								</>
							)}

							{/* <Button text='back' onPress={() => navigation.pop()} /> */}

							{data.similarMoviesCount.total > 0 && <SimilarMovie id={data.id} type={data.__typename} />}
						</View>
					</View>
				</View>
			</ScrollView>
		</TVFocusGuideView>
	)
}
