import { Button } from '@components/atoms'
import { useNavigation, useTheme } from '@hooks'
import { HomeTabParamList } from '@navigation'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import React, { useState } from 'react'
import { ActivityIndicator, Image, ScrollView, TVFocusGuideView, Text, TextInput, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { IGraphqlSuggestMovie, IGraphqlSuggestMovieList, IGraphqlSuggestPerson } from 'src/store/kinopoisk/types'
import { useGetSuggestSearchQuery } from '../../store/kinopoisk/kinopoisk.api'

type Props = NativeStackScreenProps<HomeTabParamList, 'Search'>

const Movie = ({ item, onPress }: { item: IGraphqlSuggestMovie; onPress: () => void }) => {
	const { colors } = useTheme()

	return (
		<Button onPress={onPress} transparent alignItems='center' flexDirection='row'>
			<Image source={{ uri: `https://st.kp.yandex.net/images/film_iphone/iphone360_${item.id}.jpg` }} style={{ width: 50, height: 50 }} />
			<View style={{ paddingHorizontal: 10, flex: 1 }}>
				<Text numberOfLines={2} style={{ color: colors.text100 }}>
					{item.title.russian ?? item.title.original}
				</Text>
				<Text style={{ color: colors.text200 }}>
					{item.rating.kinopoisk ? <Text>{item.rating.kinopoisk.value?.toFixed(1)}</Text> : null}
					{[item.__typename === 'TvSeries' ? ' сериал' : null, item.releaseYears && item.releaseYears?.length !== 0 ? (item.releaseYears?.[0]?.start === item.releaseYears?.[0]?.end ? (item.releaseYears?.[0]?.start === null ? '' : item.releaseYears?.[0]?.start) : item.releaseYears?.[0]?.start != null || item.releaseYears?.[0]?.end != null ? (item.releaseYears?.[0]?.start ?? '...') + ' - ' + (item.releaseYears?.[0]?.end ?? '...') : '') : item.productionYear].join(', ')}
				</Text>
			</View>
		</Button>
	)
}

const Person = ({ item, onPress }: { item: IGraphqlSuggestPerson; onPress: () => void }) => {
	const { colors } = useTheme()

	return (
		<Button onPress={onPress} transparent alignItems='center' flexDirection='row'>
			<Image source={{ uri: `https://st.kp.yandex.net/images/sm_actor/${item.id}.jpg` }} style={{ width: 50, height: 50 }} />
			<View style={{ paddingHorizontal: 10, flex: 1 }}>
				<Text numberOfLines={2} style={{ color: colors.text100 }}>
					{item.name ?? item.originalName}
				</Text>
				<Text style={{ color: colors.text200 }}>{[item.name ? item.originalName : null, item.birthDate ? new Date(item.birthDate).getFullYear() : null].join(', ')}</Text>
			</View>
		</Button>
	)
}

const MovieList = ({ item, onPress }: { item: IGraphqlSuggestMovieList; onPress: () => void }) => {
	const { colors } = useTheme()

	return (
		<Button onPress={onPress} transparent alignItems='center' flexDirection='row'>
			<Image source={{ uri: `https:${item.cover.avatarsUrl}/32x32` }} style={{ width: 50, height: 50 }} />
			<View style={{ paddingHorizontal: 10, flex: 1 }}>
				<Text numberOfLines={2} style={{ color: colors.text100 }}>
					{item.name}
				</Text>
				<Text style={{ color: colors.text200 }}>{item.movies.total} фильмов</Text>
			</View>
		</Button>
	)
}

export const Search = ({ route }: Props) => {
	const defaultFilters = route.params?.data ?? {}
	const insets = useSafeAreaInsets()
	const { colors } = useTheme()
	const navigation = useNavigation()

	const [keyword, setKeyword] = useState('')
	const { isFetching, data } = useGetSuggestSearchQuery({ keyword })

	return (
		<TVFocusGuideView style={{ flex: 1, marginTop: 0, marginBottom: 0 }} trapFocusLeft trapFocusRight trapFocusUp trapFocusDown>
			<ScrollView contentContainerStyle={{ padding: 10, paddingBottom: 10 + insets.bottom }}>
				<View style={{ paddingTop: insets.top, paddingBottom: 5 }}>
					<TextInput value={keyword} onChangeText={setKeyword} />

					{isFetching && <ActivityIndicator />}

					{data?.topResult?.global ? (
						<View>
							<Text style={{ color: colors.text200 }}>Возможно, вы искали</Text>

							{data.topResult.global.__typename === 'Person' ? <Person onPress={() => {}} item={data.topResult.global} /> : <Movie onPress={() => data.topResult && navigation.push('Movie', { data: { id: data.topResult.global.id } })} item={data.topResult.global} />}
						</View>
					) : null}

					{data?.movies && data.movies.length > 0 ? (
						<View>
							<Text style={{ color: colors.text200 }}>Фильмы и сериалы</Text>

							{data.movies.map(({ movie }) => (
								<Movie onPress={() => navigation.push('Movie', { data: { id: movie.id } })} item={movie} />
							))}
						</View>
					) : null}

					{data?.movieLists && data.movieLists.length > 0 ? (
						<View>
							<Text style={{ color: colors.text200 }}>Списки и подборки</Text>

							{data.movieLists.map(({ movieList }) => (
								<MovieList onPress={() => navigation.push('MovieListSlug', { data: { slug: movieList.url.split('/')[movieList.url.split('/').length - (movieList.url.endsWith('/') ? 2 : 1)] } })} item={movieList} />
							))}
						</View>
					) : null}

					{data?.persons && data.persons.length > 0 ? (
						<View>
							<Text style={{ color: colors.text200 }}>Персоны</Text>

							{data.persons.map(({ person }) => (
								<Person onPress={() => {}} item={person} />
							))}
						</View>
					) : null}
				</View>
			</ScrollView>
		</TVFocusGuideView>
	)
}
