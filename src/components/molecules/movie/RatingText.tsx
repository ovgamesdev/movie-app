import { IMovieBaseInfo } from '@store/kinopoisk'
import { getRatingColor } from '@utils'
import { Text } from 'react-native'
import { Defs as DefsSvg, LinearGradient as LinearGradientSvg, Stop as StopSvg, Svg, Text as TextSvg } from 'react-native-svg'

export const RatingText = ({ rating, top250 }: Pick<IMovieBaseInfo, 'rating' | 'top250'>) => {
	if (rating.expectation && rating.expectation.isActive && rating.expectation.value && rating.expectation.value > 0) return <Text style={{ fontSize: 48, fontWeight: '500', color: getRatingColor(rating.expectation.value / 10) }}>{rating.expectation.value.toFixed(0)}%</Text>
	if (!rating.kinopoisk?.value || !rating.kinopoisk.isActive) return null
	const top = rating.kinopoisk.value.toFixed(1)
	if (top250 === null) return <Text style={{ fontSize: 48, fontWeight: '500', color: getRatingColor(rating.kinopoisk.value) }}>{top}</Text>
	const width = top.length === 3 ? 65 : 93

	return (
		<Svg height={43} width={width}>
			<DefsSvg>
				<LinearGradientSvg id='gradient' x1='0%' y1='0%' x2='25%' y2='125%'>
					<StopSvg offset='16.44%' stopColor='#ffd25e' />
					<StopSvg offset='63.42%' stopColor='#b59646' />
				</LinearGradientSvg>
			</DefsSvg>
			<TextSvg x={width / 2} y={38.5} textAnchor='middle' fill='url(#gradient)' fontSize={48} fontWeight='500'>
				{top}
			</TextSvg>
		</Svg>
	)
}
