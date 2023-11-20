import { Button } from '@components/atoms'
import { useTheme } from '@hooks'
import React from 'react'
import { Image, Text, View } from 'react-native'
import { IGraphqlSuggestMovie } from 'src/store/kinopoisk/types'

type Props = {
	item: IGraphqlSuggestMovie
	onPress: (id: number) => void
}

export const Movie = ({ item, onPress }: Props) => {
	const { colors } = useTheme()

	return (
		<Button onPress={() => onPress(item.id)} animation='scale' transparent alignItems='center' flexDirection='row'>
			<Image source={{ uri: `https://st.kp.yandex.net/images/film_iphone/iphone360_${item.id}.jpg` }} resizeMode='contain' style={{ width: 32, height: 48 }} />
			<View style={{ paddingHorizontal: 10, flex: 1 }}>
				<Text numberOfLines={2} style={{ color: colors.text100 }}>
					{item.title.russian ?? item.title.original}
				</Text>
				<Text style={{ color: colors.text200 }}>
					{item.rating.kinopoisk?.value && item.rating.kinopoisk.value > 0 ? <Text>{item.rating.kinopoisk.value?.toFixed(1)} </Text> : null}
					{[item.__typename === 'TvSeries' ? 'сериал' : null, item.releaseYears && item.releaseYears?.length !== 0 ? (item.releaseYears?.[0]?.start === item.releaseYears?.[0]?.end ? (item.releaseYears?.[0]?.start === null ? '' : item.releaseYears?.[0]?.start) : item.releaseYears?.[0]?.start != null || item.releaseYears?.[0]?.end != null ? (item.releaseYears?.[0]?.start ?? '...') + ' - ' + (item.releaseYears?.[0]?.end ?? '...') : '') : item.productionYear].filter(it => it).join(', ')}
				</Text>
			</View>
		</Button>
	)
}
