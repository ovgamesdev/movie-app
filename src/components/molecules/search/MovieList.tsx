import { Button, ImageBackground } from '@components/atoms'
import { useTheme } from '@hooks'
import { IGraphqlSuggestMovieList } from '@store/kinopoisk'
import { normalizeUrlWithNull } from '@utils'
import React from 'react'
import { Text, View } from 'react-native'

type Props = {
	item: IGraphqlSuggestMovieList
	onPress: (slug: string) => void
	onFilter: (filter: string[][]) => void
}

export const MovieList = ({ item, onPress, onFilter }: Props) => {
	const { colors } = useTheme()
	const cover = normalizeUrlWithNull(item.cover.avatarsUrl, { isNull: 'https://via.placeholder.com', append: '/32x32' })

	const isFilter = item.url.includes('--') || item.url.includes('?ss_')
	const slug = item.url.split('/')[item.url.split('/').length - (item.url.endsWith('/') ? 2 : 1)]

	const stringFilters = item.url.split('movies/')[1]
	const arrayStringFilters = stringFilters
		.split('/')
		.filter(filter => filter.length > 0)
		.filter(it => !it.includes('?ss_'))
	const arrayFilters = arrayStringFilters.map(filter => filter.split('--'))

	const search =
		item.url
			.split('?')[1]
			?.split('&')
			.map(search => search.replace('ss_', '').split('=')) ?? []

	return (
		<Button onPress={() => (isFilter ? onFilter([...arrayFilters, ...search]) : onPress(slug))} paddingHorizontal={16} animation='scale' transparent alignItems='center' flexDirection='row'>
			<ImageBackground source={{ uri: cover }} resizeMode='contain' style={{ width: 32, height: 48 }} />
			<View style={{ paddingHorizontal: 10, flex: 1 }}>
				<Text numberOfLines={2} style={{ color: colors.text100, fontSize: 15 }}>
					{item.name}
				</Text>
				<Text style={{ color: colors.text200, fontSize: 13 }}>{item.movies.total} фильмов</Text>
			</View>
		</Button>
	)
}
