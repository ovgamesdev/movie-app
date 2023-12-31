import { Button, ImageBackground } from '@components/atoms'
import { useTheme } from '@hooks'
import { IGraphqlSuggestPerson } from '@store/kinopoisk'
import { SearchHistoryPerson } from '@store/settings'
import { normalizeUrlWithNull } from '@utils'
import React from 'react'
import { Text, View } from 'react-native'

type Props = {
	item: IGraphqlSuggestPerson
	onPress: (item: Omit<SearchHistoryPerson, 'timestamp'>) => void
}

export const Person = ({ item, onPress }: Props) => {
	const { colors } = useTheme()
	const poster = normalizeUrlWithNull(item.poster?.avatarsUrl, { isNull: 'https://via.placeholder.com', append: '/40x60' })

	const handleOnPress = () => {
		onPress({
			id: item.id,
			type: 'Person',
			title: item.name ?? item.originalName,
			poster: item.poster?.avatarsUrl ?? null
		})
	}

	return (
		<Button onPress={handleOnPress} paddingHorizontal={16} animation='scale' transparent alignItems='center' flexDirection='row'>
			<ImageBackground source={{ uri: poster }} resizeMode='contain' style={{ width: 32, height: 48 }} />
			<View style={{ paddingHorizontal: 10, flex: 1 }}>
				<Text numberOfLines={2} style={{ color: colors.text100, fontSize: 15 }}>
					{item.name ?? item.originalName}
				</Text>
				<Text style={{ color: colors.text200, fontSize: 13 }}>{[item.name ? item.originalName : null, item.birthDate ? new Date(item.birthDate).getFullYear() : null].filter(it => it).join(', ')}</Text>
			</View>
		</Button>
	)
}
