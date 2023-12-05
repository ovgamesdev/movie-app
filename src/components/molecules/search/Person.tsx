import { Button } from '@components/atoms'
import { useTheme } from '@hooks'
import { normalizeUrlWithNull } from '@utils'
import React from 'react'
import { Image, Text, View } from 'react-native'
import { IGraphqlSuggestPerson } from 'src/store/kinopoisk/kinopoisk.types'

type Props = {
	item: IGraphqlSuggestPerson
	onPress: (id: number) => void
}

export const Person = ({ item, onPress }: Props) => {
	const { colors } = useTheme()
	const poster = normalizeUrlWithNull(item.poster?.avatarsUrl, { isNull: 'https://via.placeholder.com', append: '/40x60' })

	return (
		<Button onPress={() => onPress(item.id)} paddingHorizontal={16} animation='scale' transparent alignItems='center' flexDirection='row'>
			<Image source={{ uri: poster }} resizeMode='contain' style={{ width: 32, height: 48 }} />
			<View style={{ paddingHorizontal: 10, flex: 1 }}>
				<Text numberOfLines={2} style={{ color: colors.text100, fontSize: 15 }}>
					{item.name ?? item.originalName}
				</Text>
				<Text style={{ color: colors.text200, fontSize: 13 }}>{[item.name ? item.originalName : null, item.birthDate ? new Date(item.birthDate).getFullYear() : null].filter(it => it).join(', ')}</Text>
			</View>
		</Button>
	)
}
