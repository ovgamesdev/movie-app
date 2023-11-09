import { useTheme } from '@hooks'
import { forwardRef, useState } from 'react'
import { Animated, FlexAlignType, Pressable, PressableProps, PressableStateCallbackType, Text, View } from 'react-native'

interface BorderProps {
	borderTopColor?: string
	borderTopWidth?: number
	borderTopLeftRadius?: number
	borderTopRightRadius?: number

	borderBottomColor?: string
	borderBottomWidth?: number
	borderBottomLeftRadius?: number
	borderBottomRightRadius?: number

	borderRightColor?: string
	borderRightWidth?: number

	borderLeftColor?: string
	borderLeftWidth?: number
}

interface Props extends PressableProps {
	padding?: number
	paddingHorizontal?: number
	paddingVertical?: number

	justifyContent?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly'
	alignItems?: FlexAlignType
	flex?: number
	flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse'

	text?: string
	animation?: 'scale'
	transparent?: boolean

	isActive?: boolean
	textColor?: string
	activeTextColor?: string
	buttonColor?: string
	activeButtonColor?: string
	pressedButtonColor?: string
	activePressedButtonColor?: string
	borderStyle?: BorderProps
}

export const Button = forwardRef<View, Props>(({ children, padding = 7, paddingHorizontal, paddingVertical, justifyContent, alignItems, flex, flexDirection, text, animation, transparent, isActive, textColor, activeTextColor, buttonColor, activeButtonColor, pressedButtonColor, activePressedButtonColor, borderStyle, style, onPressIn, onPressOut, ...props }, forwardRef) => {
	const { colors } = useTheme()
	const [scale] = useState(new Animated.Value(1))

	const _style = (state: PressableStateCallbackType) => (typeof style === 'function' ? style(state) : typeof style === 'object' ? style : {})

	const handleOnPressIn = () => {
		if (animation === 'scale') {
			Animated.timing(scale, { toValue: 0.8, useNativeDriver: true, duration: 250 }).start()
		}
	}
	const handleOnPressOut = () => {
		if (animation === 'scale') {
			Animated.timing(scale, { toValue: 1, useNativeDriver: true, duration: 250 }).start()
		}
	}

	return (
		<Animated.View style={{ transform: [{ scale }], flex, ...borderStyle }}>
			<Pressable
				ref={forwardRef}
				onPressIn={handleOnPressIn}
				onPressOut={handleOnPressOut}
				style={state => [
					{
						backgroundColor: transparent ? 'transparent' : isActive ? (state.pressed ? activePressedButtonColor ?? colors.bg300 : activeButtonColor ?? colors.bg200) : state.pressed ? pressedButtonColor ?? colors.bg300 : buttonColor ?? colors.bg200,
						borderRadius: 6,
						padding,
						paddingHorizontal,
						paddingVertical,
						justifyContent,
						alignItems,
						flexDirection
					},
					{
						borderWidth: 3,
						borderColor: state.focused ? colors.accent100 : 'transparent',
						borderTopLeftRadius: borderStyle?.borderTopLeftRadius,
						borderBottomLeftRadius: borderStyle?.borderBottomLeftRadius,
						borderTopRightRadius: borderStyle?.borderTopRightRadius,
						borderBottomRightRadius: borderStyle?.borderBottomRightRadius
					},
					_style(state)
				]}
				{...props}>
				{typeof children === 'object' ? children : text ? <Text style={{ color: isActive ? activeTextColor ?? colors.text100 : textColor ?? colors.text100 }}>{text}</Text> : null}
			</Pressable>
		</Animated.View>
	)
})
