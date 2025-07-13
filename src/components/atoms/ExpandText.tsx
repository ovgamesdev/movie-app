import { FC, useMemo, useState } from 'react'
import { Dimensions, StyleProp, StyleSheet, Text, TextLayoutLine, TextProps, TextStyle, View, ViewStyle } from 'react-native'
import Svg, { Defs, LinearGradient, Mask, Rect, Stop, Text as TextSvg, Use } from 'react-native-svg'
import { useStyles } from 'react-native-unistyles'
import { Button } from '.'

const pxValues = [0, 35.4, 54.8, 74.2, 93.7, 113.1, 132.5, 152.0, 171.4, 190.8, 210.3, 229.7, 249.1, 268.6, 288.0, 307.5, 326.9, 346.3]
const x1Values = [0, 0, 0, 26, 40, 50, 57, 63, 66, 70, 72.5, 75, 76.5, 78, 79.5, 81, 82.5, 84]
const x0Values = [0, 0, 40, 56, 64, 69, 73, 77, 79, 81, 82.5, 84, 84.5, 86, 86.5, 88, 88.5, 89]

const findX = (px: number, pxValues: number[], xValues: number[]): number => {
	if (px <= pxValues[0]) return xValues[0]
	if (px >= pxValues[pxValues.length - 1]) return xValues[xValues.length - 1]

	for (let i = 1; i < pxValues.length; i++) {
		if (px < pxValues[i]) {
			const px1 = pxValues[i - 1]
			const px2 = pxValues[i]
			const x1 = xValues[i - 1]
			const x2 = xValues[i]
			const deltaPx = px2 - px1 || 1
			const percentage = ((px - px1) / deltaPx) * 100
			return x1 + (percentage * (x2 - x1)) / 100
		}
	}
	return xValues[xValues.length - 1]
}

export const ExpandText: FC<TextProps & { containerStyle?: StyleProp<ViewStyle>; textMoreStyle?: StyleProp<TextStyle> }> = ({ children, numberOfLines = 1, containerStyle, style: textStyle, textMoreStyle, ...props }) => {
	const [isExpand, setIsExpand] = useState(false)
	const [expandLines, setExpandLines] = useState<TextLayoutLine[] | null>(null)

	const { theme } = useStyles()
	const dimensionsWindow = useMemo(() => Dimensions.get('window'), [])

	const mergedContainerStyle = useMemo(() => {
		const baseStyle: ViewStyle = {
			borderWidth: 3,
			margin: -3
		}
		if (containerStyle) {
			const flat = StyleSheet.flatten(containerStyle) as ViewStyle
			for (const key of Object.keys(flat)) {
				const value = flat[key as keyof ViewStyle]
				if (typeof value === 'number') {
					if (key.startsWith('border')) baseStyle[key as 'borderWidth'] = value + 3
					if (key.startsWith('margin')) baseStyle[key as 'margin'] = value - 3
				}
			}
		}
		return baseStyle
	}, [containerStyle])

	const isLoadedLines = !!(expandLines && expandLines.length > 0)
	const fontSize: number = textStyle && typeof textStyle === 'object' && 'fontSize' in textStyle ? textStyle.fontSize ?? 14 : 14
	const fontSizeMore: number = textMoreStyle && typeof textMoreStyle === 'object' && 'fontSize' in textMoreStyle ? textMoreStyle.fontSize ?? fontSize : fontSize

	// console.log('data:', expandLines)

	const totalLines = expandLines?.length ?? 0
	const showExpand = totalLines > numberOfLines

	return (
		<Button padding={0} buttonColor='transparent' style={mergedContainerStyle} disabled={!showExpand} onPress={() => setIsExpand(isExpand => !isExpand)}>
			<Text {...props} style={[textStyle, isLoadedLines && { color: 'transparent', position: 'absolute' }]} onTextLayout={e => !expandLines && setExpandLines(e.nativeEvent.lines)} numberOfLines={isExpand ? undefined : numberOfLines}>
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

			{isLoadedLines
				? expandLines.slice(0, isExpand ? expandLines.length : numberOfLines).map((line, index) => {
						const width = Math.max(40, line.width)
						const isLastLine = index + 1 === numberOfLines && showExpand && !isExpand

						return (
							<View key={index} style={{ width, height: line.height }}>
								<Svg width='100%' height='100%' viewBox={`0 0 ${width} ${line.height}`}>
									<Defs>
										{isLastLine && (
											<>
												<LinearGradient id='Gradient' gradientUnits='userSpaceOnUse' x1='0' y1='0' x2={width} y2='0'>
													<Stop offset={`${findX(width, pxValues, x1Values)}%`} stopColor='white' stopOpacity='1' />
													<Stop offset={`${findX(width, pxValues, x0Values)}%`} stopColor='white' stopOpacity='0' />
												</LinearGradient>
												<Mask id='Mask' x='0' y='0' width={width} height={line.height}>
													<Rect width={width} height={line.height} fill='url(#Gradient)' />
												</Mask>
											</>
										)}
										<TextSvg alignmentBaseline='text-top' id='Text' x='0' y='0' fontSize={fontSize * dimensionsWindow.fontScale}>
											{line.text}
										</TextSvg>
										{isLastLine && (
											<TextSvg alignmentBaseline='text-top' id='TextMore' x={width - (fontSizeMore === 14 ? 40 : fontSizeMore === 16 ? 45 : 40)} y='0' fontSize={fontSizeMore * dimensionsWindow.fontScale}>
												{' …ещё'}
											</TextSvg>
										)}
									</Defs>

									<Use href='#Text' fill={`${textStyle && typeof textStyle === 'object' && 'color' in textStyle ? String(textStyle.color) : 'white'}`} mask={isLastLine ? 'url(#Mask)' : undefined} />
									{isLastLine && <Use href='#TextMore' fill={`${textMoreStyle && typeof textMoreStyle === 'object' && 'color' in textMoreStyle ? String(textMoreStyle.color) : theme.colors.text100}`} />}
								</Svg>
							</View>
						)
				  })
				: null}
		</Button>
	)
}
