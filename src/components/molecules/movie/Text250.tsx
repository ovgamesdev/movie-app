import { KpTop250LIcon, KpTop250RIcon } from '@icons'
import { FC } from 'react'
import { View } from 'react-native'
import { Defs as DefsSvg, LinearGradient as LinearGradientSvg, Stop as StopSvg, Svg, Text as TextSvg } from 'react-native-svg'

interface Props {
	top250: number
}

export const Text250: FC<Props> = ({ top250 }) => {
	const length = top250.toString().length
	const width = length === 1 ? 60 : length === 2 ? 64 : 72

	return (
		<View style={{ flexDirection: 'row', marginLeft: 13, alignItems: 'center' }}>
			<KpTop250LIcon width={18} height={43} viewBox='0 0 10 24' />
			<View style={{ marginHorizontal: 7 }}>
				<Svg height={43} width={width}>
					<DefsSvg>
						<LinearGradientSvg id='gradient' x1='0%' y1='0%' x2='25%' y2='125%'>
							<StopSvg offset='16.44%' stopColor='#ffd25e' />
							<StopSvg offset='63.42%' stopColor='#b59646' />
						</LinearGradientSvg>
					</DefsSvg>
					<TextSvg x={width / 2} y={18} textAnchor='middle' fill='url(#gradient)' fontSize={15} fontWeight='600'>
						ТОП 250
					</TextSvg>
					<TextSvg x={width / 2} y={36} textAnchor='middle' fill='url(#gradient)' fontSize={15} fontWeight='400'>
						{top250 + ' место'}
					</TextSvg>
				</Svg>
			</View>
			<KpTop250RIcon width={18} height={43} viewBox='0 0 10 24' />
		</View>
	)
}
