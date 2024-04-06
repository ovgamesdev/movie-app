import { Button, ImageBackground } from '@components/atoms'
import { IGraphqlSuggestMovie } from '@store/kinopoisk'
import { SearchHistoryMovie } from '@store/settings'
import { getRatingColor, isSeries, normalizeUrlWithNull, releaseYearsToString } from '@utils'
import { FC } from 'react'
import { Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

type Props = {
	item: IGraphqlSuggestMovie
	onPress: (item: Omit<SearchHistoryMovie, 'timestamp'>) => void
}

export const Movie: FC<Props> = ({ item, onPress }) => {
	const { styles } = useStyles(stylesheet)

	const poster = normalizeUrlWithNull(item.poster?.avatarsUrl, { isNull: 'https://via.placeholder.com', append: '/80x120' })

	const handleOnPress = () => {
		onPress({
			id: item.id,
			type: item.__typename,
			title: item.title.russian ?? item.title.original ?? '',
			poster: item.poster?.avatarsUrl ?? null,
			year: item.productionYear ?? item.releaseYears?.[0].start ?? null
		})
	}

	return (
		<Button onPress={handleOnPress} paddingHorizontal={16} animation='scale' transparent alignItems='stretch' flexDirection='row'>
			<ImageBackground source={{ uri: poster }} resizeMode='contain' style={styles.image} />
			<View style={styles.container}>
				<Text numberOfLines={2} style={styles.title}>
					{item.title.russian ?? item.title.original}
				</Text>
				<View style={styles.details}>
					<Text style={styles.originalTitle} numberOfLines={1}>
						{item.rating.kinopoisk?.value && item.rating.kinopoisk.value > 0 ? <Text style={styles.rating(item.rating.kinopoisk.value)}>{item.rating.kinopoisk.value.toFixed(1)} </Text> : <Text>— </Text>}
						{item.title.russian !== null && item.title.original !== null ? item.title.original : null}
					</Text>
					<Text style={styles.commonText} numberOfLines={1}>
						{/* TODO fix '' !! */}
						{[item.title.russian !== null && item.title.original !== null ? ' ' : null, isSeries(item.__typename) ? 'сериал' : null, item.releaseYears && item.releaseYears.length !== 0 ? releaseYearsToString(item.releaseYears) : item.productionYear]
							.filter(it => it)
							.map(it => (it === ' ' ? '' : it))
							.join(', ')}
					</Text>
				</View>
			</View>
		</Button>
	)
}

const stylesheet = createStyleSheet(theme => ({
	image: {
		width: 32,
		height: 48,
		marginRight: 16
	},
	container: {
		paddingVertical: 4,
		flex: 1,
		justifyContent: 'center'
	},
	title: {
		color: theme.colors.text100,
		fontSize: 15
	},
	rating: (value: number) => ({
		color: getRatingColor(value)
	}),
	details: {
		flexDirection: 'row'
	},
	originalTitle: {
		flexShrink: 1,
		fontSize: 13,
		fontWeight: '400',
		lineHeight: 16,
		color: theme.colors.text200
	},
	commonText: {
		fontSize: 13,
		fontWeight: '400',
		lineHeight: 16,
		color: theme.colors.text200
	}
}))
