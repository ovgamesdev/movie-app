import { Button, Input, InputType } from '@components/atoms'
import { useNavigation, useTheme } from '@hooks'
import { HomeTabParamList } from '@navigation'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import React, { useEffect, useRef, useState } from 'react'
import { ActivityIndicator, Image, ScrollView, TVFocusGuideView, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useGetSuggestSearchQuery } from '../../store/kinopoisk/kinopoisk.api'
import { IGraphqlSuggestMovie, IGraphqlSuggestMovieList, IGraphqlSuggestPerson } from '../../store/kinopoisk/types'

type Props = NativeStackScreenProps<HomeTabParamList, 'Search'>

const Movie = ({ item, onPress }: { item: IGraphqlSuggestMovie; onPress: () => void }) => {
	const { colors } = useTheme()

	return (
		<Button onPress={onPress} transparent alignItems='center' flexDirection='row'>
			<Image source={{ uri: `https://st.kp.yandex.net/images/film_iphone/iphone360_${item.id}.jpg` }} resizeMode='contain' style={{ width: 32, height: 48 }} />
			<View style={{ paddingHorizontal: 10, flex: 1 }}>
				<Text numberOfLines={2} style={{ color: colors.text100 }}>
					{item.title.russian ?? item.title.original}
				</Text>
				<Text style={{ color: colors.text200 }}>
					{item.rating.kinopoisk ? <Text>{item.rating.kinopoisk.value?.toFixed(1)} </Text> : null}
					{[item.__typename === 'TvSeries' ? ' сериал' : null, item.releaseYears && item.releaseYears?.length !== 0 ? (item.releaseYears?.[0]?.start === item.releaseYears?.[0]?.end ? (item.releaseYears?.[0]?.start === null ? '' : item.releaseYears?.[0]?.start) : item.releaseYears?.[0]?.start != null || item.releaseYears?.[0]?.end != null ? (item.releaseYears?.[0]?.start ?? '...') + ' - ' + (item.releaseYears?.[0]?.end ?? '...') : '') : item.productionYear].filter(it => it).join(', ')}
				</Text>
			</View>
		</Button>
	)
}

const Person = ({ item, onPress }: { item: IGraphqlSuggestPerson; onPress: () => void }) => {
	const { colors } = useTheme()

	return (
		<Button onPress={onPress} transparent alignItems='center' flexDirection='row'>
			<Image source={{ uri: `https://st.kp.yandex.net/images/sm_actor/${item.id}.jpg` }} resizeMode='contain' style={{ width: 32, height: 48 }} />
			<View style={{ paddingHorizontal: 10, flex: 1 }}>
				<Text numberOfLines={2} style={{ color: colors.text100 }}>
					{item.name ?? item.originalName}
				</Text>
				<Text style={{ color: colors.text200 }}>{[item.name ? item.originalName : null, item.birthDate ? new Date(item.birthDate).getFullYear() : null].filter(it => it).join(', ')}</Text>
			</View>
		</Button>
	)
}

const MovieList = ({ item, onPress }: { item: IGraphqlSuggestMovieList; onPress: () => void }) => {
	const { colors } = useTheme()

	return (
		<Button onPress={onPress} transparent alignItems='center' flexDirection='row'>
			<Image source={{ uri: `https:${item.cover.avatarsUrl}/32x32` }} resizeMode='contain' style={{ width: 32, height: 48 }} />
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

	const ref = useRef<InputType>(null)

	useEffect(() => navigation.addListener('focus', () => setTimeout(() => ref.current?.focus(), 0)), [navigation, ref])

	return (
		<TVFocusGuideView style={{ flex: 1, padding: 10, paddingBottom: 10 + insets.bottom, paddingTop: 10 + insets.top }} trapFocusLeft trapFocusRight trapFocusUp>
			<Input ref={ref} value={keyword} onChangeText={setKeyword} placeholder='Фильмы, сериалы, персоны' autoFocus returnKeyType='search' inputMode='search' icon='search' clearable onClear={() => setKeyword('')} voice />

			<ScrollView contentContainerStyle={{ paddingTop: 10 }}>
				<View style={{ paddingBottom: 5 }}>
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
								<Movie key={movie.id} onPress={() => navigation.push('Movie', { data: { id: movie.id } })} item={movie} />
							))}
						</View>
					) : null}

					{data?.movieLists && data.movieLists.length > 0 ? (
						<View>
							<Text style={{ color: colors.text200 }}>Списки и подборки</Text>

							{data.movieLists.map(({ movieList }) => (
								<MovieList key={movieList.id} onPress={() => navigation.push('MovieListSlug', { data: { slug: movieList.url.split('/')[movieList.url.split('/').length - (movieList.url.endsWith('/') ? 2 : 1)] } })} item={movieList} />
							))}
						</View>
					) : null}

					{data?.persons && data.persons.length > 0 ? (
						<View>
							<Text style={{ color: colors.text200 }}>Персоны</Text>

							{data.persons.map(({ person }) => (
								<Person key={person.id} onPress={() => {}} item={person} />
							))}
						</View>
					) : null}
				</View>
			</ScrollView>
		</TVFocusGuideView>
	)
}
