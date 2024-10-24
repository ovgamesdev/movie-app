import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import { Animated, FlexAlignType, GestureResponderEvent, Pressable, PressableProps, PressableStateCallbackType, Text, View } from 'react-native'
import Config from 'react-native-config'
import { useStyles } from 'react-native-unistyles'

interface BorderProps {
	borderColor?: string

	borderTopWidth?: number
	borderTopLeftRadius?: number
	borderTopRightRadius?: number

	borderBottomWidth?: number
	borderBottomLeftRadius?: number
	borderBottomRightRadius?: number

	borderRightWidth?: number
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
	focusable?: boolean

	isActive?: boolean
	textColor?: string
	activeTextColor?: string
	buttonColor?: string
	activeButtonColor?: string
	pressedButtonColor?: string
	activePressedButtonColor?: string
	borderStyle?: BorderProps
}

export type ButtonType = {
	requestTVFocus: () => void
	buttonRef: View | null
}

export const Button = forwardRef<ButtonType, Props>(({ children, padding = 7, paddingHorizontal, paddingVertical, justifyContent, alignItems, flex, flexDirection, text, animation, transparent, focusable, isActive, textColor, activeTextColor, buttonColor, activeButtonColor, pressedButtonColor, activePressedButtonColor, borderStyle, style, onPressIn, onPressOut, ...props }, forwardRef) => {
	const { theme } = useStyles()
	const scale = useRef(new Animated.Value(1)).current

	const _style = (state: PressableStateCallbackType) => (typeof style === 'function' ? style(state) : typeof style === 'object' ? style : {})

	const handleOnPressIn = (event: GestureResponderEvent) => {
		onPressIn?.(event)
		if (animation === 'scale') {
			Animated.timing(scale, { toValue: 0.8, useNativeDriver: true, duration: 250 }).start()
		}
	}
	const handleOnPressOut = (event: GestureResponderEvent) => {
		onPressOut?.(event)
		if (animation === 'scale') {
			Animated.timing(scale, { toValue: 1, useNativeDriver: true, duration: 250 }).start()
		}
	}

	const buttonRef = useRef<View | null>(null)

	useEffect(() => {
		if (props.hasTVPreferredFocus) {
			setTimeout(() => buttonRef.current?.requestTVFocus(), 0)
		}
	}, [props.hasTVPreferredFocus])

	useImperativeHandle(forwardRef, () => ({
		requestTVFocus: () => buttonRef.current?.requestTVFocus(),
		buttonRef: buttonRef.current
	}))

	return (
		<Animated.View style={{ transform: [{ scale }], flex, ...borderStyle }}>
			<Pressable
				ref={buttonRef}
				onPressIn={handleOnPressIn}
				onPressOut={handleOnPressOut}
				focusable={focusable}
				accessible={focusable}
				style={state => [
					{
						backgroundColor: transparent ? 'transparent' : isActive ? (state.pressed ? activePressedButtonColor ?? theme.colors.bg300 : activeButtonColor ?? theme.colors.bg200) : state.pressed ? pressedButtonColor ?? theme.colors.bg300 : buttonColor ?? theme.colors.bg200,
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
						borderColor: state.focused && Config.UI_MODE === 'tv' ? theme.colors.accent100 : 'transparent',
						borderTopLeftRadius: borderStyle?.borderTopLeftRadius,
						borderBottomLeftRadius: borderStyle?.borderBottomLeftRadius,
						borderTopRightRadius: borderStyle?.borderTopRightRadius,
						borderBottomRightRadius: borderStyle?.borderBottomRightRadius
					},
					_style(state)
				]}
				{...props}>
				{typeof children === 'object' ? children : text ? <Text style={{ color: isActive ? activeTextColor ?? theme.colors.text100 : textColor ?? theme.colors.text100 }}>{text}</Text> : null}
			</Pressable>
		</Animated.View>
	)
})
