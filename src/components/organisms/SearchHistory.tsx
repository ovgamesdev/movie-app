import { Button, ImageBackground } from '@components/atoms'
import { useActions, useTypedSelector } from '@hooks'
import { CloseIcon } from '@icons'
import { navigation } from '@navigation'
import { SearchHistoryMovie, SearchHistoryMovieList, SearchHistoryPerson, SearchHistory as SearchHistoryType } from '@store/settings'
import { movieListUrlToFilters, normalizeUrlWithNull } from '@utils'
import type { FC } from 'react'
import { ScrollView, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useStyles } from 'react-native-unistyles'

type Props = {
	item: SearchHistoryType
	onPress: (item: SearchHistoryType) => void
	onRemove: (item: SearchHistoryType) => void
}

const SearchHistoryItem: FC<Props> = ({ item, onPress, onRemove }) => {
	const { theme } = useStyles()
	const poster = normalizeUrlWithNull(item.poster, { isNull: 'https://dummyimage.com/{width}x{height}/eee/aaa', append: item.type === 'MovieListMeta' ? '/64x64' : '/80x120' })

	const handleOnPress = () => {
		onPress(item)
	}

	const handleOnRemove = () => {
		onRemove(item)
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
				<Text style={{ color: theme.colors.text200, fontSize: 13 }}>{[item.type === 'TvSeries' || item.type === 'MiniSeries' || item.type === 'TvShow' ? 'сериал' : null, 'year' in item ? item.year : null].filter(it => !!it).join(', ')}</Text>
			</View>
			<View style={{ justifyContent: 'center' }}>
				<Button onPress={handleOnRemove} style={{ height: 30, width: 30 }} transparent justifyContent='center' alignItems='center'>
					<CloseIcon width={15} height={15} fill={theme.colors.text100} />
				</Button>
			</View>
		</Button>
	)
}

export const SearchHistory = () => {
	const insets = useSafeAreaInsets()
	const { theme } = useStyles()

	const searchHistory = useTypedSelector(state => state.settings.settings.searchHistory)
	const { removeItemByPath, addItemToSearchHistory } = useActions()

	const data = Object.values(searchHistory).sort((a, b) => b.timestamp - a.timestamp)

	const removeFromHistory = (item: SearchHistoryMovie | SearchHistoryPerson | SearchHistoryMovieList) => {
		removeItemByPath(['searchHistory', `${item.type}:${item.id}`])
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
				requestAnimationFrame(() => addItemToSearchHistory(data))
				navigation.push('Movie', { data: { id: data.id, type: data.type } })
				break
			}
			case 'Person': {
				requestAnimationFrame(() => addItemToSearchHistory(data))
				navigation.push('Person', { data: { id: data.id } })
				break
			}
			case 'MovieListMeta': {
				requestAnimationFrame(() => addItemToSearchHistory(data))
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
				<SearchHistoryItem key={item.type + ':' + item.id} item={item} onPress={onPress} onRemove={removeFromHistory} />
			))}
		</ScrollView>
	)
}
