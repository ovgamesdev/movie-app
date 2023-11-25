import { ActivityIndicator, Button } from '@components/atoms'
import { useOrientation, useTheme, useTypedSelector } from '@hooks'
import { PlayIcon } from '@icons'
import { RootStackParamList } from '@navigation'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { Image, ImageBackground, ScrollView, StyleProp, TVFocusGuideView, Text, View, ViewProps, ViewStyle } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
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

	const data = dataFilm ?? dataTvSeries
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

	return (
		<TVFocusGuideView style={{ flex: 1, marginTop: 0, marginBottom: 0 }} trapFocusLeft trapFocusRight trapFocusUp trapFocusDown>
			<ScrollView contentContainerStyle={{ paddingBottom: 10 + (isShowNetInfo ? 0 : insets.bottom) }}>
				{orientation.portrait && <Trailer style={{ marginBottom: -10 }} />}
				<View style={[{}, orientation.landscape && { flexDirection: 'row', padding: 10, paddingBottom: 5, paddingTop: 10 + insets.top, gap: 20 }]}>
					{orientation.landscape && (
						<View style={{ width: 300, gap: 20 }}>
							<PosterImage />
							<View style={{ gap: 5 }}>
								<Trailer style={{}} />

								<Text style={{ color: colors.text100, fontSize: 15 }}>{data.mainTrailer.title}</Text>
								<Text style={{ color: colors.text200, fontSize: 13 }}>{new Date(data.mainTrailer.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' }).replace(' г.', '')}</Text>
							</View>
						</View>
					)}
					<View style={[{ flex: 1 }, orientation.portrait && { backgroundColor: colors.bg100, marginTop: -10, paddingHorizontal: 10, paddingTop: 10, borderTopLeftRadius: 16, borderTopRightRadius: 16 }]}>
						<View style={{ flexDirection: 'row', gap: 10 }}>
							{orientation.portrait && <PosterImage width={120} height={80 + 6 + 6 ?? 96} borderRadius={8} top={-100} style={{ position: 'absolute', borderWidth: 6, borderColor: colors.bg100, backgroundColor: colors.bg100 }} wrapperStyle={{ marginLeft: 20, marginRight: 30 }} />}
							<View style={{ flex: 1 }}>
								<Text style={{ color: colors.text100, fontSize: 28, fontWeight: '700' }}>{data.title.russian ?? data.title.localized ?? data.title.original}</Text>
								{data.title.russian && data.title.original && <Text style={{ color: colors.text200, fontSize: 18 }}>{data.title.original}</Text>}
							</View>
						</View>
						<View style={{}}>
							<TVFocusGuideView style={{ marginBottom: 5, marginTop: 10, flexDirection: 'row', gap: 10 }} autoFocus>
								<Button text='watch' onPress={() => navigation.navigate('Watch', { data })} hasTVPreferredFocus />
								<Button text='watch' onPress={() => navigation.navigate('Watch', { data })} />
							</TVFocusGuideView>

							<View style={{ gap: 5, marginTop: 5 }}>
								<Button text='back' onPress={() => navigation.pop()} />
								<Button text='back' onPress={() => navigation.pop()} />
								<Button text='back' onPress={() => navigation.pop()} />
								<Button text='back' onPress={() => navigation.pop()} />
								<Button text='back' onPress={() => navigation.pop()} />
								<Button text='back' onPress={() => navigation.pop()} />
								<Button text='back' onPress={() => navigation.pop()} />
								<Button text='back' onPress={() => navigation.pop()} />
								<Button text='back' onPress={() => navigation.pop()} />
								<Button text='back' onPress={() => navigation.pop()} />
								<Button text='back' onPress={() => navigation.pop()} />
								<Button text='back' onPress={() => navigation.pop()} />
								<Button text='back' onPress={() => navigation.pop()} />
								<Button text='back' onPress={() => navigation.pop()} />
								<Button text='back' onPress={() => navigation.pop()} />
								<Button text='back' onPress={() => navigation.pop()} />
								<Button text='back' onPress={() => navigation.pop()} />
								<Button text='back' onPress={() => navigation.pop()} />
								<Button text='back' onPress={() => navigation.pop()} />
								<Button text='back' onPress={() => navigation.pop()} />
								<Button text='back' onPress={() => navigation.pop()} />
								<Button text='back' onPress={() => navigation.pop()} />
							</View>
						</View>
					</View>
				</View>
			</ScrollView>
		</TVFocusGuideView>
	)
}
