import { DropDown } from '@components/atoms'
import { Movie } from '@components/molecules/search'
import { useActions } from '@hooks'
import { navigation } from '@navigation'
import { IGraphqlSuggestMovie } from '@store/kinopoisk'
import { SearchHistoryMovie } from '@store/settings'
import { useState, type FC } from 'react'
import { Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

type Props = {
	data: { collaps: IGraphqlSuggestMovie[]; alloha: IGraphqlSuggestMovie[]; kodik: IGraphqlSuggestMovie[] }
}

export const SearchResultsProvider: FC<Props> = ({ data }) => {
	const { styles } = useStyles(stylesheet)
	const { addItemToSearchHistory } = useActions()

	const onMovie = (data: Omit<SearchHistoryMovie, 'timestamp'>) => {
		addItemToSearchHistory(data)
		navigation.push('Movie', { data: { id: data.id, type: data.type }, other: { poster: data.poster, title: data.title, year: data.year } })
	}

	const onModal = (data: Omit<SearchHistoryMovie, 'timestamp'>, { contentId }: IGraphqlSuggestMovie) => {
		addItemToSearchHistory(data)
		navigation.push('Movie', { data: { id: contentId as `ALLOHA:${string}` | `COLLAPS:${string}` | `KODIK:${string}`, type: data.type }, other: { poster: data.poster, title: data.title, year: data.year } })
	}

	const [showAll, setShowAll] = useState<null | 'id' | 'title'>('title')

	const kodik =
		showAll === null
			? data.kodik
			: data.kodik.reduce<IGraphqlSuggestMovie[]>((acc, cur) => {
					const existingItem = acc.find(item => (showAll === 'title' ? item.title.russian === cur.title.russian : item.id === cur.id))

					if (!existingItem) {
						acc.push(cur)
					}

					return acc
			  }, [])
	// .sort((a, b) => Number(String(a.id).replace('tt', '')) - Number(String(b.id).replace('tt', '')))

	return (
		<View>
			{data.collaps.length > 0 ? (
				<View style={[styles.container, styles.line]}>
					<Text style={styles.title}>COLLAPS</Text>

					{data.collaps.map(movie => (
						<Movie key={movie.contentId} onPress={onMovie} onLongPress={onModal} item={movie} />
					))}
				</View>
			) : null}

			{data.alloha.length > 0 ? (
				<View style={[styles.container, styles.line]}>
					<Text style={styles.title}>ALLOHA</Text>

					{data.alloha.map(movie => (
						<Movie key={movie.contentId} onPress={onMovie} onLongPress={onModal} item={movie} />
					))}
				</View>
			) : null}

			{/* TODO style */}
			{kodik.length > 0 ? (
				<View style={[styles.container, styles.line]}>
					<View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
						<Text style={styles.title}>KODIK</Text>
						<DropDown
							value={showAll}
							items={[
								{ value: 'title', label: 'Объединить по названию' },
								{ value: 'id', label: 'Объединить по id' },
								{ value: null, label: 'Показать все' }
							]}
							onChange={setShowAll}
						/>
					</View>

					{kodik.map(movie => (
						<Movie key={movie.contentId} onPress={onMovie} onLongPress={onModal} item={movie} />
					))}
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
	},
	notFound: {
		paddingHorizontal: 16
	}
}))
