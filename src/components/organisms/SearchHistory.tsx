import { Button, ImageBackground } from '@components/atoms'
import { useActions, useNavigation, useTheme, useTypedSelector } from '@hooks'
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
			<ImageBackground source={{ uri: poster }} resizeMode='contain' style={{ width: 32, height: 48 }} />
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
	const navigation = useNavigation()
	const insets = useSafeAreaInsets()
	const { colors } = useTheme()

	const searchHistory = useTypedSelector(state => state.settings.settings.searchHistory)
	const { mergeItem } = useActions()

	// TODO add limit and remove

	const addToHistory = (props: Omit<SearchHistoryMovie, 'timestamp'> | Omit<SearchHistoryPerson, 'timestamp'> | Omit<SearchHistoryMovieList, 'timestamp'>) => {
		mergeItem({ searchHistory: { [`${props.type}:${props.id}`]: { ...props, timestamp: Date.now() } } })
	}

	const data = Object.values(searchHistory).sort((a, b) => b.timestamp - a.timestamp)
	// .filter(it => (activeFilter === 'all' ? it : it.status === activeFilter))

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
