import { Movie, MovieList, Person } from '@components/molecules/search'
import { useActions, useTypedSelector } from '@hooks'
import { navigation } from '@navigation'
import { ISuggestSearchResults } from '@store/kinopoisk'
import { SearchHistoryMovie, SearchHistoryMovieList, SearchHistoryPerson, SearchHistory as SearchHistoryType } from '@store/settings'
import { movieListUrlToFilters } from '@utils'
import type { FC } from 'react'
import { Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

type Props = {
	data: ISuggestSearchResults
}

export const SearchResults: FC<Props> = ({ data }) => {
	const { styles } = useStyles(stylesheet)

	const searchHistory = useTypedSelector(state => state.settings.settings.searchHistory)
	const { setItem } = useActions()

	const searchHistoryData = Object.values(searchHistory).sort((a, b) => b.timestamp - a.timestamp)

	// TODO maybe move to action
	const addToHistory = (props: Omit<SearchHistoryMovie, 'timestamp'> | Omit<SearchHistoryPerson, 'timestamp'> | Omit<SearchHistoryMovieList, 'timestamp'>) => {
		const COUNT_SAVE_TO_HISTORY = 15 // TODO to settings?

		const filteredData = searchHistoryData.filter(it => !(it.id === props.id && it.type === props.type))
		const updatedData = [{ ...props, timestamp: Date.now() }, ...filteredData].sort((a, b) => b.timestamp - a.timestamp).slice(0, COUNT_SAVE_TO_HISTORY)

		const newSearchHistory = updatedData.reduce<{ [key: string]: SearchHistoryType }>((acc, item) => {
			acc[`${item.type}:${item.id}`] = item
			return acc
		}, {})

		setItem({ searchHistory: newSearchHistory })
	}

	const onMovieList = (data: Omit<SearchHistoryMovieList, 'timestamp'>) => {
		addToHistory(data)
		const { isFilter, slug, filters } = movieListUrlToFilters(data.url)
		navigation.push('MovieListSlug', { data: isFilter ? { slug: '', filters } : { slug } })
	}

	const onMovie = (data: Omit<SearchHistoryMovie, 'timestamp'>) => {
		addToHistory(data)
		navigation.push('Movie', { data: { id: data.id, type: data.type } })
	}

	const onPerson = (data: Omit<SearchHistoryPerson, 'timestamp'>) => {
		addToHistory(data)
		navigation.push('Person', { data: { id: data.id } })
	}

	return (
		<View>
			{data.topResult?.global ? (
				<View style={[styles.container, styles.line]}>
					<Text style={styles.title}>Возможно, вы искали</Text>

					{data.topResult.global.__typename === 'Person' ? <Person onPress={onPerson} item={data.topResult.global} /> : data.topResult.global.__typename === 'MovieListMeta' ? <MovieList key={data.topResult.global.id} onPress={onMovieList} item={data.topResult.global} /> : <Movie onPress={onMovie} item={data.topResult.global} />}
				</View>
			) : null}

			{data.movies.length > 0 ? (
				<View style={[styles.container, styles.line]}>
					<Text style={styles.title}>Фильмы и сериалы</Text>

					{data.movies.map(({ movie }) => (movie === null ? null : <Movie key={movie.id} onPress={onMovie} item={movie} />))}
				</View>
			) : null}

			{data.movieLists.length > 0 ? (
				<View style={[styles.container, styles.line]}>
					<Text style={styles.title}>Списки и подборки</Text>

					{data.movieLists.map(({ movieList }) => (movieList === null ? null : <MovieList key={movieList.id} onPress={onMovieList} item={movieList} />))}
				</View>
			) : null}

			{data.persons.length > 0 ? (
				<View style={styles.container}>
					<Text style={styles.title}>Персоны</Text>

					{data.persons.map(({ person }) => (person === null ? null : <Person key={person.id} onPress={onPerson} item={person} />))}
				</View>
			) : null}
		</View>
	)
}

const stylesheet = createStyleSheet(theme => ({
	container: {
		paddingBottom: 10
	},
	title: {
		color: theme.colors.text200,
		fontSize: 13,
		paddingHorizontal: 16,
		paddingTop: 16,
		paddingBottom: 6
	},
	line: {
		borderBottomWidth: 1,
		borderBottomColor: theme.colors.bg300
	}
}))
