import { Button, ImageBackground } from '@components/atoms'
import { useActions, useTheme, useTypedSelector } from '@hooks'
import { navigation } from '@navigation'
import { SearchHistoryMovie, SearchHistoryMovieList, SearchHistoryPerson, SearchHistory as SearchHistoryType } from '@store/settings'
import { movieListUrlToFilters, normalizeUrlWithNull } from '@utils'
import React from 'react'
import { ScrollView, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

type Props = {
	item: SearchHistoryType
	onPress: (item: SearchHistoryType) => void
}

const SearchHistoryItem: React.FC<Props> = ({ item, onPress }) => {
	const { colors } = useTheme()
	const poster = normalizeUrlWithNull(item.poster, { isNull: 'https://via.placeholder.com', append: '/300x450' })

	const handleOnPress = () => {
		onPress(item)
	}

	return (
		<Button onPress={handleOnPress} paddingHorizontal={16} animation='scale' transparent alignItems='center' flexDirection='row'>
			{item.type === 'MovieListMeta' ? (
				<View style={{ width: 32, height: 48, alignItems: 'center' }}>
					<ImageBackground source={{ uri: poster }} resizeMode='contain' style={{ width: 32, height: 32 }} />
				</View>
			) : (
				<ImageBackground source={{ uri: poster }} resizeMode='contain' style={{ width: 32, height: 48 }} />
			)}
			<View style={{ paddingHorizontal: 10, flex: 1 }}>
				<Text numberOfLines={2} style={{ color: colors.text100, fontSize: 15 }}>
					{item.title}
				</Text>
				<Text style={{ color: colors.text200, fontSize: 13 }}>{item.type === 'TvSeries' || item.type === 'MiniSeries' ? 'сериал' : null}</Text>
			</View>
		</Button>
	)
}

export const SearchHistory = () => {
	const insets = useSafeAreaInsets()
	const { colors } = useTheme()

	const searchHistory = useTypedSelector(state => state.settings.settings.searchHistory)
	const { setItem } = useActions()

	const data = Object.values(searchHistory).sort((a, b) => b.timestamp - a.timestamp)
	// .filter(it => (activeFilter === 'all' ? it : it.status === activeFilter))

	// mergeItem({ searchHistory: { [`${props.type}:${props.id}`]: { ...props, timestamp: Date.now() } } })
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
				<Text style={{ color: colors.text200, fontSize: 15, paddingHorizontal: 30, textAlign: 'center' }}>Смотри то, что нравится</Text>
			</View>
		)
	}

	const onPress = (data: SearchHistoryType) => {
		switch (data.type) {
			case 'TvSeries':
			case 'Film':
			case 'MiniSeries':
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
			<Text style={{ color: colors.text200, fontSize: 13, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 6 }}>История поиска</Text>
			{data.map(item => (
				<SearchHistoryItem key={item.type + ':' + item.id} item={item} onPress={onPress} />
			))}
		</ScrollView>
	)
}
