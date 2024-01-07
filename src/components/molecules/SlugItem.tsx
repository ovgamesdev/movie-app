import { Button, ImageBackground } from '@components/atoms'
import { IGraphqlMovie, MovieType } from '@store/kinopoisk'
import { normalizeUrlWithNull } from '@utils'
import React from 'react'
import { Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

type Props = {
	data: IGraphqlMovie
	index: number
	hasTVPreferredFocus: boolean
	onFocus: ({ index }: { index: number }) => void
	onBlur: ({ index }: { index: number }) => void
	onPress: ({ id }: { id: number; type: MovieType }) => void
}

export const SlugItem = ({ data, index, hasTVPreferredFocus, onFocus, onBlur, onPress }: Props) => {
	const poster = normalizeUrlWithNull(data.poster?.avatarsUrl, { isNull: 'https://via.placeholder.com', append: '/300x450' })
	const { styles } = useStyles(stylesheet)

	return (
		<Button onFocus={() => onFocus({ index })} onBlur={() => onBlur({ index })} onPress={() => onPress({ id: data.id, type: data.__typename })} hasTVPreferredFocus={hasTVPreferredFocus} animation='scale' flex={0} padding={5} transparent style={styles.container}>
			<ImageBackground source={{ uri: poster }} style={styles.image} borderRadius={6}></ImageBackground>

			<View style={styles.detail}>
				<Text style={styles.detailTitle} numberOfLines={2}>
					{data.title.russian ?? data.title.original}
				</Text>
				<Text style={styles.detailDescription} numberOfLines={1}>
					{data.releaseYears && data.releaseYears.length !== 0 ? (data.releaseYears[0]?.start === data.releaseYears[0]?.end ? (data.releaseYears[0].start === 0 ? null : data.releaseYears[0].start) ?? '' : data.releaseYears[0].start != null || data.releaseYears[0].end != null ? (data.releaseYears[0].start ?? '...') + ' - ' + (data.releaseYears[0].end ?? '...') : '') : data.productionYear === 0 ? null : data.productionYear}
				</Text>
			</View>
		</Button>
	)
}

const stylesheet = createStyleSheet(theme => ({
	container: {
		width: 110,
		height: 215.5
	},
	image: {
		height: 140,
		// width: 93.5
		aspectRatio: 667 / 1000
	},
	detail: {
		paddingTop: 5
	},
	detailTitle: {
		color: theme.colors.text100,
		fontSize: 14
	},
	detailDescription: {
		color: theme.colors.text200,
		fontSize: 14
	}
}))
