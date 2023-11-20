import { Button } from '@components/atoms'
import { useTheme } from '@hooks'
import React from 'react'
import { Image, Text, View } from 'react-native'
import { IGraphqlSuggestPerson } from 'src/store/kinopoisk/types'

type Props = {
	item: IGraphqlSuggestPerson
	onPress: (id: number) => void
}

export const Person = ({ item, onPress }: Props) => {
	const { colors } = useTheme()

	return (
		<Button onPress={() => onPress(item.id)} animation='scale' transparent alignItems='center' flexDirection='row'>
			<Image source={{ uri: `https://st.kp.yandex.net/images/sm_actor/${item.id}.jpg` }} resizeMode='contain' style={{ width: 32, height: 48 }} />
			<View style={{ paddingHorizontal: 10, flex: 1 }}>
				<Text numberOfLines={2} style={{ color: colors.text100 }}>
					{item.name ?? item.originalName}
				</Text>
				<Text style={{ color: colors.text200 }}>{[item.name ? item.originalName : null, item.birthDate ? new Date(item.birthDate).getFullYear() : null].filter(it => it).join(', ')}</Text>
			</View>
		</Button>
	)
}
