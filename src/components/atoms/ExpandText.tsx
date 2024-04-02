import { FC, useState } from 'react'
import { Dimensions, StyleProp, Text, TextLayoutLine, TextProps, TextStyle, View, ViewStyle } from 'react-native'
import Svg, { Defs, LinearGradient, Mask, Rect, Stop, Text as TextSvg, Use } from 'react-native-svg'
import { useStyles } from 'react-native-unistyles'
import { Button } from '.'

const pxValues = [0, 35.4, 54.8, 74.2, 93.7, 113.1, 132.5, 152.0, 171.4, 190.8, 210.3, 229.7, 249.1, 268.6, 288.0, 307.5, 326.9, 346.3]
const x1Values = [0, 0, 0, 26, 40, 50, 57, 63, 66, 70, 72.5, 75, 76.5, 78, 79.5, 81, 82.5, 84]
const x0Values = [0, 0, 40, 56, 64, 69, 73, 77, 79, 81, 82.5, 84, 84.5, 86, 86.5, 88, 88.5, 89]

const findX = (px: number, pxValues: number[], xValues: number[]): number => {
	let px1 = pxValues[0]
	let x1 = xValues[0]
	let px2 = pxValues[0]
	let x2 = xValues[0]

	for (let i = 1; i < pxValues.length; i++) {
		if (pxValues[i] <= px) {
			px1 = pxValues[i - 1]
			x1 = xValues[i - 1]
			px2 = pxValues[i]
			x2 = xValues[i]
		} else {
			px2 = pxValues[i]
			x2 = xValues[i]
			break
		}
	}

	const deltaX = x2 - x1
	const deltaPx = px2 - px1
	const percentage = ((px - px1) / deltaPx) * 100
	const newX = x1 + (percentage * deltaX) / 100

	return newX
}

export const ExpandText: FC<TextProps & { containerStyle?: StyleProp<ViewStyle>; textMoreStyle?: StyleProp<TextStyle> }> = ({ children, numberOfLines, containerStyle, style: textStyle, textMoreStyle, ...props }) => {
	const [isExpand, setIsExpand] = useState(false)
	const [expandLines, setExpandLines] = useState<TextLayoutLine[] | null>(null)

	const { theme } = useStyles()

	const style: StyleProp<ViewStyle> = {
		borderWidth: 3,
		margin: -3
	}

	if (containerStyle) {
		const keys = ['borderWidth', 'borderEndWidth', 'borderTopWidth', 'borderLeftWidth', 'borderRightWidth', 'borderStartWidth', 'borderBottomWidth', 'margin', 'marginBottom', 'marginEnd', 'marginHorizontal', 'marginLeft', 'marginRight', 'marginStart', 'marginTop', 'marginVertical']

		for (const key of keys) {
			const append = (key.startsWith('border') ? style.borderWidth : style.margin) as number

			if (key in containerStyle) {
				const value = (containerStyle as ViewStyle)[key as keyof ViewStyle]
				if (typeof value === 'number') {
					style[key as keyof ViewStyle] = (value + append) as never
				}
			}
		}
	}

	const isLoadedLines = !!(expandLines && expandLines.length > 0)

	const fontSize: number = textStyle && typeof textStyle === 'object' && 'fontSize' in textStyle ? textStyle.fontSize ?? 14 : 14
	const fontSizeMore: number = textMoreStyle && typeof textMoreStyle === 'object' && 'fontSize' in textMoreStyle ? textMoreStyle.fontSize ?? fontSize : fontSize

	const dimensionsWindow = Dimensions.get('window')

	// console.log('data:', expandLines)

	const lineHeight = expandLines?.[(numberOfLines ?? 1) - 1]?.height

	return (
		<Button padding={0} buttonColor='transparent' style={style} disabled={!(!!numberOfLines && !!expandLines && expandLines.length > numberOfLines)} onPress={() => setIsExpand(isExpand => !isExpand)}>
			<Text {...props} style={[textStyle, isLoadedLines && { color: 'transparent', position: 'absolute' }]} onTextLayout={e => setExpandLines(e.nativeEvent.lines)} numberOfLines={isExpand ? undefined : numberOfLines}>
				{children}
				{/* 00{'\n'}
				20 00{'\n'}
				30 00 00{'\n'}
				40 00 00 00{'\n'}
				50 00 00 00 00{'\n'}
				60 00 00 00 00 00{'\n'}
				70 00 00 00 00 00 00{'\n'}
				80 00 00 00 00 00 00 00{'\n'}
				90 00 00 00 00 00 00 00 00{'\n'}
				10 00 00 00 00 00 00 00 00 00{'\n'}
				11 00 00 00 00 00 00 00 00 00 00{'\n'}
				12 00 00 00 00 00 00 00 00 00 00 00{'\n'}
				13 00 00 00 00 00 00 00 00 00 00 00 00{'\n'}
				14 00 00 00 00 00 00 00 00 00 00 00 00 00{'\n'}
				15 00 00 00 00 00 00 00 00 00 00 00 00 00 00{'\n'}
				16 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00{'\n'}
				17 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00{'\n'}
				18 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00{'\n'} */}
			</Text>

			<View style={isLoadedLines ? undefined : { position: 'absolute' }}>
				{isLoadedLines && lineHeight
					? (isExpand ? expandLines : expandLines.slice(0, numberOfLines)).map((expandLine, index) => {
							const expandLineWidth = expandLine.width < 40 ? 40 : expandLine.width

							return !isExpand && expandLines.length > numberOfLines! && index === numberOfLines! - 1 ? (
								// <Text key={index} style={[textStyle, { lineHeight: lineHeight }]}>
								// 	{expandLine.text.substring(0, expandLine.text.length - 7)}
								// 	<Text style={[textStyle, { lineHeight: lineHeight, color: theme.colors.text100 }, textMoreStyle]}>{' …ещё'}</Text>
								// </Text>

								// <View key={index + '_shadow'} style={{ width: 65, height: lineHeight, top: expandLine.y, left: expandLineWidth, position: 'absolute', transform: [{ translateX: -65 }] }}>
								// 	<Svg height='100%' width='100%'>
								// 		<Defs>
								// 			<LinearGradient id='grad' x1='0%' y1='0%' x2='100%' y2='0%'>
								// 				<Stop offset='0%' stopColor={FROM_COLOR} stopOpacity={0} />
								// 				<Stop offset='50%' stopColor={FROM_COLOR} />
								// 			</LinearGradient>
								// 		</Defs>
								// 		<Rect width='100%' height='100%' fill='url(#grad)' />
								// 	</Svg>
								// </View>

								<View key={index} style={{ width: expandLineWidth, height: lineHeight }}>
									<Svg width='100%' height='100%' viewBox={`0 0 ${expandLineWidth} ${lineHeight}`}>
										<Defs>
											<LinearGradient id='Gradient' gradientUnits='userSpaceOnUse' x1='0' y1='0' x2={expandLineWidth} y2='0'>
												<Stop offset={`${findX(expandLineWidth, pxValues, x1Values)}%`} stopColor='white' stopOpacity='1' />
												<Stop offset={`${findX(expandLineWidth, pxValues, x0Values)}%`} stopColor='white' stopOpacity='0' />
											</LinearGradient>
											<Mask id='Mask' maskUnits='userSpaceOnUse' x='0' y='0' width={expandLineWidth} height={lineHeight}>
												<Rect x='0' y='0' width={expandLineWidth} height={lineHeight} fill='url(#Gradient)' />
											</Mask>
											<TextSvg
												//
												alignmentBaseline='text-top'
												id='Text'
												x='0'
												y='0'
												fontSize={fontSize * dimensionsWindow.fontScale}>
												{expandLine.text}
											</TextSvg>
											<TextSvg
												//
												alignmentBaseline='text-top'
												id='TextMore'
												x={expandLineWidth - (fontSizeMore === 14 ? 40 : fontSizeMore === 16 ? 45 : 40)}
												y='0'
												fontSize={fontSizeMore * dimensionsWindow.fontScale}>
												{' …ещё'}
											</TextSvg>
										</Defs>
										<Use href='#Text' x='0' y='0' height={lineHeight} fill={`${textStyle && typeof textStyle === 'object' && 'color' in textStyle ? String(textStyle.color) : 'white'}`} mask='url(#Mask)' />
										<Use href='#TextMore' x='0' y='0' height={lineHeight} fill={`${textMoreStyle && typeof textMoreStyle === 'object' && 'color' in textMoreStyle ? String(textMoreStyle.color) : theme.colors.text100}`} />
									</Svg>
								</View>
							) : (
								// <Text key={index} style={[textStyle, { lineHeight: lineHeight }]}>
								// 	{expandLine.text}
								// </Text>

								<View key={index} style={{ width: expandLine.width, height: lineHeight }}>
									<Svg width='100%' height='100%' viewBox={`0 0 ${expandLine.width} ${lineHeight}`}>
										<TextSvg
											//
											alignmentBaseline='text-top'
											id='Text'
											x='0'
											y='0'
											fontSize={fontSize * dimensionsWindow.fontScale}
											fill={`${textStyle && typeof textStyle === 'object' && 'color' in textStyle ? String(textStyle.color) : 'white'}`}>
											{expandLine.text}
										</TextSvg>
									</Svg>
								</View>
							)
					  })
					: null}
			</View>
		</Button>
	)
}
