import { RatingText, Text250 } from '@components/molecules/movie'
import { useTheme } from '@hooks'
import { IMovieBaseInfo } from '@store/kinopoisk'
import { isSeries } from '@utils'
import { Text, View } from 'react-native'

export const Rating = ({ rating, top250, __typename }: Pick<IMovieBaseInfo, '__typename' | 'rating' | 'top250'>) => {
	const { colors } = useTheme()

	return (
		<View focusable accessible>
			<Text style={{ color: colors.text100, fontSize: 22, fontWeight: '600', marginBottom: 9 }}>Рейтинг {isSeries(__typename) ? 'сериала' : 'фильма'}</Text>
			<View style={{ flexDirection: 'row' }}>
				<RatingText rating={rating} top250={top250} />
				{top250 !== null && <Text250 top250={top250} />}
			</View>

			{rating.kinopoisk?.value === null && rating.kinopoisk.isActive && (
				<View>
					<Text style={{ fontSize: 48, fontWeight: '500', color: colors.text200 }}>–</Text>
					{rating.imdb?.value != null && rating.imdb.isActive && (
						<Text style={{ fontSize: 13, flex: 1, color: colors.text200 }}>
							<Text style={{ fontWeight: '500' }}>IMDb: {rating.imdb.value.toFixed(2)}</Text> {rating.imdb.count.toLocaleString()} оценок
						</Text>
					)}
					<Text style={{ fontSize: 13, color: colors.text200 }}>Недостаточно оценок, рейтинг формируется</Text>
				</View>
			)}

			{rating.kinopoisk?.value != null && rating.kinopoisk.isActive && rating.kinopoisk.value > 0 && (
				<View style={{ flexDirection: 'row' }}>
					<Text style={{ fontSize: 13, marginRight: 12, color: colors.text200 }}>{rating.kinopoisk.count.toLocaleString()} оценок</Text>
					{rating.imdb?.value != null && rating.imdb.isActive && (
						<Text style={{ fontSize: 13, flex: 1, color: colors.text200 }}>
							<Text style={{ fontWeight: '500' }}>IMDb: {rating.imdb.value.toFixed(2)}</Text> {rating.imdb.count.toLocaleString()} оценок
						</Text>
					)}
				</View>
			)}

			{rating.expectation?.value != null && rating.expectation.isActive && rating.expectation.value > 0 && (
				<View>
					<Text style={{ fontSize: 13, marginRight: 12, color: colors.text200 }}>Рейтинг ожидания</Text>
					<Text style={{ fontSize: 13, flex: 1, color: colors.text200 }}>{rating.expectation.count.toLocaleString()} ждут премьеры</Text>
				</View>
			)}
		</View>
	)
}
