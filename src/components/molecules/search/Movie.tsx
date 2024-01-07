import { Button, ImageBackground } from '@components/atoms'
import { IGraphqlSuggestMovie } from '@store/kinopoisk'
import { SearchHistoryMovie } from '@store/settings'
import { getRatingColor, isSeries, normalizeUrlWithNull } from '@utils'
import React from 'react'
import { Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

type Props = {
	item: IGraphqlSuggestMovie
	onPress: (item: Omit<SearchHistoryMovie, 'timestamp'>) => void
}

export const Movie = ({ item, onPress }: Props) => {
	const { styles } = useStyles(stylesheet)

	const poster = normalizeUrlWithNull(item.poster?.avatarsUrl, { isNull: 'https://via.placeholder.com', append: '/300x450' })

	const handleOnPress = () => {
		onPress({
			id: item.id,
			type: item.__typename,
			title: item.title.russian ?? item.title.original ?? '',
			poster: item.poster?.avatarsUrl ?? null
		})
	}

	return (
		<Button onPress={handleOnPress} paddingHorizontal={16} animation='scale' transparent alignItems='center' flexDirection='row'>
			<ImageBackground source={{ uri: poster }} resizeMode='contain' style={styles.image} />
			<View style={styles.container}>
				<Text numberOfLines={2} style={styles.title}>
					{item.title.russian ?? item.title.original}
				</Text>
				<Text style={styles.details}>
					{item.rating.kinopoisk.value && item.rating.kinopoisk.value > 0 ? <Text style={styles.rating(item.rating.kinopoisk.value)}>{item.rating.kinopoisk.value.toFixed(1)} </Text> : <Text>— </Text>}
					{[item.title.russian !== null && item.title.original !== null ? item.title.original : null, isSeries(item.__typename) ? 'сериал' : null, item.releaseYears && item.releaseYears.length !== 0 ? (item.releaseYears[0]?.start === item.releaseYears[0]?.end ? (item.releaseYears[0].start === null ? '' : item.releaseYears[0]?.start) : item.releaseYears[0].start != null || item.releaseYears[0].end != null ? (item.releaseYears[0]?.start ?? '...') + ' - ' + (item.releaseYears[0]?.end ?? '...') : '') : item.productionYear].filter(it => it).join(', ')}
				</Text>
			</View>
		</Button>
	)
}

const stylesheet = createStyleSheet(theme => ({
	image: {
		width: 32,
		height: 48
	},
	container: {
		paddingHorizontal: 10,
		flex: 1
	},
	title: {
		color: theme.colors.text100,
		fontSize: 15
	},
	rating: (value: number) => ({
		color: getRatingColor(value)
	}),
	details: {
		color: theme.colors.text200,
		fontSize: 13
	}
}))
