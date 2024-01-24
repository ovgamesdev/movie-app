import { Button, ImageBackground } from '@components/atoms'
import { IHdShowcaseListItem, MovieType } from '@store/kinopoisk'
import { getRatingColor, normalizeUrlWithNull } from '@utils'
import React from 'react'
import { Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

type Props = {
	data: IHdShowcaseListItem
	index: number
	hasTVPreferredFocus: boolean
	onFocus: ({ index }: { index: number }) => void
	onBlur: ({ index }: { index: number }) => void
	onPress: ({ id }: { id: number; type: MovieType }) => void
}

export const TopItemsAllItem = ({ data, index, hasTVPreferredFocus, onFocus, onBlur, onPress }: Props) => {
	// TODO rating to atoms component
	const rating: null | { value: string; color: string } = data.rating.kinopoisk?.isActive && data.rating.kinopoisk.value && data.rating.kinopoisk.value > 0 ? { value: `${data.rating.kinopoisk.value.toFixed(1)}`, color: getRatingColor(data.rating.kinopoisk.value) } : null
	const poster = normalizeUrlWithNull(data.gallery.posters.verticalWithRightholderLogo?.avatarsUrl ?? data.gallery.posters.vertical?.avatarsUrl, { isNull: 'https://via.placeholder.com', append: '/300x450' })
	const { styles } = useStyles(stylesheet)

	return (
		<Button onFocus={() => onFocus({ index })} onBlur={() => onBlur({ index })} onPress={() => onPress({ id: data.id, type: data.__typename })} hasTVPreferredFocus={hasTVPreferredFocus} animation='scale' flex={0} padding={5} transparent style={styles.container}>
			<ImageBackground source={{ uri: poster }} style={styles.image} borderRadius={6}>
				{rating && (
					<View style={{ position: 'absolute', top: 6, left: 6 }}>
						<Text style={{ fontWeight: '600', fontSize: 13, lineHeight: 20, minWidth: 32, color: '#fff', textAlign: 'center', paddingHorizontal: 5, backgroundColor: rating.color }}>{rating.value}</Text>
					</View>
				)}
			</ImageBackground>

			<View style={styles.detail}>
				<Text style={styles.detailTitle} numberOfLines={2}>
					{data.title.russian}
				</Text>
				<Text style={styles.detailDescription} numberOfLines={1}>
					{/* {data.releaseYears && data.releaseYears.length !== 0 ? (data.releaseYears[0]?.start === data.releaseYears[0]?.end ? (data.releaseYears[0].start === 0 ? null : data.releaseYears[0].start) ?? '' : data.releaseYears[0].start != null || data.releaseYears[0].end != null ? (data.releaseYears[0].start ?? '...') + ' - ' + (data.releaseYears[0].end ?? '...') : '') : data.productionYear === 0 ? null : data.productionYear} */}
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
