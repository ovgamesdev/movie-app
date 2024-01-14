import { RatingText, Text250 } from '@components/molecules/movie'
import { IMovieBaseInfo } from '@store/kinopoisk'
import { isSeries } from '@utils'
import { Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

export const Rating = ({ rating, top250, __typename }: Pick<IMovieBaseInfo, '__typename' | 'rating' | 'top250'>) => {
	const { styles } = useStyles(stylesheet)

	return (
		<View focusable accessible>
			<Text style={styles.sectionTitleAbout}>Рейтинг {isSeries(__typename) ? 'сериала' : 'фильма'}</Text>
			<View style={styles.row}>
				<RatingText rating={rating} top250={top250} />
				{top250 !== null && <Text250 top250={top250} />}
			</View>

			{rating.kinopoisk?.value === null && rating.kinopoisk.isActive ? (
				<View>
					<Text style={styles.minusText}>–</Text>
					{rating.imdb?.value != null && rating.imdb.isActive && (
						<Text style={styles.detailText}>
							<Text style={styles.bold}>IMDb: {rating.imdb.value.toFixed(2)}</Text> {rating.imdb.count.toLocaleString()} оценок
						</Text>
					)}
					<Text style={styles.detailText}>Недостаточно оценок, рейтинг формируется</Text>
				</View>
			) : rating.kinopoisk?.value != null && rating.kinopoisk.isActive && rating.kinopoisk.value > 0 ? (
				<View style={styles.row}>
					<Text style={styles.title}>{rating.kinopoisk.count.toLocaleString()} оценок</Text>
					{rating.imdb?.value != null && rating.imdb.isActive && (
						<Text style={styles.detailText}>
							<Text style={styles.bold}>IMDb: {rating.imdb.value.toFixed(2)}</Text> {rating.imdb.count.toLocaleString()} оценок
						</Text>
					)}
				</View>
			) : rating.expectation?.isActive && rating.expectation.count > 0 ? (
				<View>
					<Text style={styles.minusText}>–</Text>
					<Text style={styles.title}>Рейтинг ожидания</Text>
					<Text style={styles.detailText}>{rating.expectation.count.toLocaleString()} ждут премьеры</Text>
				</View>
			) : null}
		</View>
	)
}

const stylesheet = createStyleSheet(theme => ({
	sectionTitleAbout: {
		color: theme.colors.text100,
		fontSize: 22,
		fontWeight: '600',
		marginBottom: 9
	},
	row: {
		flexDirection: 'row'
	},
	bold: {
		fontWeight: '500'
	},
	title: {
		fontSize: 13,
		marginRight: 12,
		color: theme.colors.text200
	},
	detailText: {
		fontSize: 13,
		flex: 1,
		color: theme.colors.text200
	},
	minusText: {
		fontSize: 48,
		fontWeight: '500',
		color: theme.colors.text200
	}
}))
