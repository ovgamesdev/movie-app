import { Button, ImageBackground } from '@components/atoms'
import { useActions, useTypedSelector } from '@hooks'
import { navigation } from '@navigation'
import { SearchHistoryMovie, SearchHistoryMovieList, SearchHistoryPerson, SearchHistory as SearchHistoryType } from '@store/settings'
import { movieListUrlToFilters, normalizeUrlWithNull } from '@utils'
import React from 'react'
import { ScrollView, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useStyles } from 'react-native-unistyles'

type Props = {
	item: SearchHistoryType
	onPress: (item: SearchHistoryType) => void
}

const SearchHistoryItem: React.FC<Props> = ({ item, onPress }) => {
	const { theme } = useStyles()
	const poster = normalizeUrlWithNull(item.poster, { isNull: 'https://via.placeholder.com', append: item.type === 'MovieListMeta' ? '/64x64' : '/80x120' })

	const handleOnPress = () => {
		onPress(item)
	}

	return (
		<Button onPress={handleOnPress} paddingHorizontal={16} animation='scale' transparent alignItems='stretch' flexDirection='row'>
			<View style={{ width: 32, height: 48, justifyContent: 'center', marginRight: 16 }}>
				<ImageBackground source={{ uri: poster }} resizeMode='contain' style={item.type === 'MovieListMeta' ? { width: 32, height: 32 } : { width: 32, height: 48 }} />
			</View>
			<View style={{ paddingVertical: 4, flex: 1, justifyContent: 'center' }}>
				<Text numberOfLines={2} style={{ color: theme.colors.text100, fontSize: 15 }}>
					{item.title}
				</Text>
				<Text style={{ color: theme.colors.text200, fontSize: 13 }}>{item.type === 'TvSeries' || item.type === 'MiniSeries' || item.type === 'TvShow' ? 'сериал' : null}</Text>
			</View>
		</Button>
	)
}

export const SearchHistory = () => {
	const insets = useSafeAreaInsets()
	const { theme } = useStyles()

	const searchHistory = useTypedSelector(state => state.settings.settings.searchHistory)
	const { setItem } = useActions()

	const data = Object.values(searchHistory).sort((a, b) => b.timestamp - a.timestamp)
	// .filter(it => (activeFilter === 'all' ? it : it.status === activeFilter))

	// TODO maybe move to action
	const addToHistory = (props: Omit<SearchHistoryMovie, 'timestamp'> | Omit<SearchHistoryPerson, 'timestamp'> | Omit<SearchHistoryMovieList, 'timestamp'>) => {
		const COUNT_SAVE_TO_HISTORY = 15 // TODO to settings?

		const filteredData = data.filter(it => !(it.id === props.id && it.type === props.type))
		const updatedData = [{ ...props, timestamp: Date.now() }, ...filteredData].sort((a, b) => b.timestamp - a.timestamp).slice(0, COUNT_SAVE_TO_HISTORY)

		const newSearchHistory = updatedData.reduce<{ [key: string]: SearchHistoryType }>((acc, item) => {
			acc[`${item.type}:${item.id}`] = item
			return acc
		}, {})

		setItem({ searchHistory: newSearchHistory })
	}

	if (data.length === 0) {
		return (
			<View style={{ height: 160, justifyContent: 'center', alignItems: 'center' }}>
				<Text style={{ color: theme.colors.text200, fontSize: 15, paddingHorizontal: 30, textAlign: 'center' }}>Смотри то, что нравится</Text>
			</View>
		)
	}

	const onPress = (data: SearchHistoryType) => {
		switch (data.type) {
			case 'TvSeries':
			case 'Film':
			case 'MiniSeries':
			case 'TvShow':
			case 'Video': {
				addToHistory(data)
				navigation.push('Movie', { data: { id: data.id, type: data.type } })
				break
			}
			case 'Person': {
				addToHistory(data)
				navigation.push('Person', { data: { id: data.id } })
				break
			}
			case 'MovieListMeta': {
				addToHistory(data)
				const { isFilter, slug, filters } = movieListUrlToFilters(data.url)
				navigation.push('MovieListSlug', { data: isFilter ? { slug: '', filters } : { slug } })
				break
			}
		}
	}

	return (
		<ScrollView contentContainerStyle={{ paddingTop: 10, paddingBottom: 15 + insets.bottom }}>
			<Text style={{ color: theme.colors.text200, fontSize: 13, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 6 }}>История поиска</Text>
			{data.map(item => (
				<SearchHistoryItem key={item.type + ':' + item.id} item={item} onPress={onPress} />
			))}
		</ScrollView>
	)
}
