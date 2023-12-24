import { Button, ImageBackground } from '@components/atoms'
import { useTheme } from '@hooks'
import { IGraphqlSuggestMovieList } from '@store/kinopoisk'
import { SearchHistoryMovieList } from '@store/settings'
import { normalizeUrlWithNull } from '@utils'
import React from 'react'
import { Text, View } from 'react-native'

type Props = {
	item: IGraphqlSuggestMovieList
	onPress: (item: Omit<SearchHistoryMovieList, 'timestamp'>) => void
}

export const MovieList = ({ item, onPress }: Props) => {
	const { colors } = useTheme()
	const cover = normalizeUrlWithNull(item.cover.avatarsUrl, { isNull: 'https://via.placeholder.com', append: '/32x32' })

	const handleOnPress = () => {
		onPress({
			id: item.id,
			url: item.url,
			type: 'MovieListMeta',
			title: item.name,
			poster: item.cover.avatarsUrl ?? null
		})
	}

	return (
		<Button onPress={handleOnPress} paddingHorizontal={16} animation='scale' transparent alignItems='center' flexDirection='row'>
			<View style={{ width: 32, height: 48, alignItems: 'center' }}>
				<ImageBackground source={{ uri: cover }} resizeMode='contain' style={{ width: 32, height: 32 }} />
			</View>
			<View style={{ paddingHorizontal: 10, flex: 1 }}>
				<Text numberOfLines={2} style={{ color: colors.text100, fontSize: 15 }}>
					{item.name}
				</Text>
				<Text style={{ color: colors.text200, fontSize: 13 }}>{item.movies.total} фильмов</Text>
			</View>
		</Button>
	)
}
