import type { RatingValue } from '@store/kinopoisk'
import { getRatingColor } from '@utils'
import type { FC } from 'react'
import { Text, View } from 'react-native'

interface Props {
	expectation?: RatingValue | null
	imdb?: RatingValue | null
	kinopoisk?: RatingValue | null
	reviewCount?: RatingValue | null
	russianCritics?: RatingValue | null
	worldwideCritics?: RatingValue | null
}

type Data = {
	value: string
	color: string
}

export const Rating: FC<Props> = rating => {
	const data: null | Data = rating.expectation?.isActive && rating.expectation.value && rating.expectation.value > 0 ? { value: `${rating.expectation.value.toFixed(0)}%`, color: getRatingColor(rating.expectation.value / 10) } : rating.kinopoisk?.isActive && rating.kinopoisk.value && rating.kinopoisk.value > 0 ? { value: `${rating.kinopoisk.value.toFixed(1)}`, color: getRatingColor(rating.kinopoisk.value) } : null

	if (!data) {
		return null
	}

	return (
		<View style={{ position: 'absolute', top: 6, left: 6 }}>
			<Text style={{ fontWeight: '600', fontSize: 13, lineHeight: 20, minWidth: 32, color: '#fff', textAlign: 'center', paddingHorizontal: 5, backgroundColor: data.color }}>{data.value}</Text>
		</View>
	)
}
