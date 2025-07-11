import { Button, ImageBackground } from '@components/atoms'
import { IGraphqlSuggestMovieList } from '@store/kinopoisk'
import { SearchHistoryMovieList } from '@store/settings'
import { normalizeUrlWithNull } from '@utils'
import { FC } from 'react'
import { Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

type Props = {
	item: IGraphqlSuggestMovieList
	onPress: (item: Omit<SearchHistoryMovieList, 'timestamp'>) => void
}

export const MovieList: FC<Props> = ({ item, onPress }) => {
	const { styles } = useStyles(stylesheet)

	const cover = normalizeUrlWithNull(item.cover.avatarsUrl, { isNull: 'https://dummyimage.com/{width}x{height}/eee/aaa', append: '/64x64' })

	const handleOnPress = () => {
		onPress({
			id: item.id,
			url: item.url,
			type: 'MovieListMeta',
			title: item.name,
			poster: item.cover.avatarsUrl ?? null
		})
	}

	return (
		<Button onPress={handleOnPress} paddingHorizontal={16} animation='scale' transparent alignItems='stretch' flexDirection='row'>
			<View style={styles.imageContainer}>
				<ImageBackground source={{ uri: cover }} resizeMode='contain' style={styles.image} />
			</View>
			<View style={styles.container}>
				<Text numberOfLines={2} style={styles.title}>
					{item.name}
				</Text>
				<Text style={styles.details}>{item.movies.total} фильмов</Text>
			</View>
		</Button>
	)
}

const stylesheet = createStyleSheet(theme => ({
	imageContainer: {
		width: 32,
		height: 48,
		justifyContent: 'center',
		marginRight: 16
	},
	image: {
		width: 32,
		height: 32
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
	details: {
		color: theme.colors.text200,
		fontSize: 13
	}
}))
