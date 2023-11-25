import { Button } from '@components/atoms'
import { useTheme } from '@hooks'
import React from 'react'
import { ImageBackground, Text, View } from 'react-native'
import { IGraphqlMovie } from 'src/store/kinopoisk/kinopoisk.types'

type Props = {
	data: IGraphqlMovie
	index: number
	hasTVPreferredFocus: boolean
	onFocus: ({ index }: { index: number }) => void
	onBlur: ({ index }: { index: number }) => void
	onPress: ({ id }: { id: number; type: 'TvSeries' | 'Film' }) => void
}

export const SlugItem = ({ data, index, hasTVPreferredFocus, onFocus, onBlur, onPress }: Props) => {
	const { colors } = useTheme()

	return (
		<Button onFocus={() => onFocus({ index })} onBlur={() => onBlur({ index })} onPress={() => onPress({ id: data.id, type: data.__typename })} hasTVPreferredFocus={hasTVPreferredFocus} animation='scale' flex={0} padding={5} transparent style={{ width: 110, height: 215.5 }}>
			<ImageBackground source={{ uri: `https://st.kp.yandex.net/images/film_iphone/iphone360_${data.id}.jpg` }} style={{ height: 140, /* width: 93.5 */ aspectRatio: 667 / 1000 }} borderRadius={6}></ImageBackground>

			<View style={{ paddingTop: 5 }}>
				<Text style={{ color: colors.text100, fontSize: 14 }} numberOfLines={2}>
					{data.title.russian ?? data.title.original}
				</Text>
				<Text style={{ color: colors.text200, fontSize: 14 }} numberOfLines={1}>
					{data.releaseYears && data.releaseYears?.length !== 0 ? (data.releaseYears?.[0]?.start === data.releaseYears?.[0]?.end ? (data.releaseYears?.[0]?.start === null ? '' : data.releaseYears?.[0]?.start) : data.releaseYears?.[0]?.start != null || data.releaseYears?.[0]?.end != null ? (data.releaseYears?.[0]?.start ?? '...') + ' - ' + (data.releaseYears?.[0]?.end ?? '...') : '') : data.productionYear}
				</Text>
			</View>
		</Button>
	)
}
