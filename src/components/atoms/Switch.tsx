import { FC, useCallback } from 'react'
import { Pressable } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, { clamp, interpolateColor, runOnJS, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated'
import { useStyles } from 'react-native-unistyles'

type Props = {
	onValueChange: (value: boolean) => void
	trackColor?: { false?: string; true?: string }
	thumbColor?: { false?: string; true?: string }
	value: boolean
}

const animConfig = {
	mass: 1,
	damping: 15,
	stiffness: 120,
	overshootClamping: false,
	restSpeedThreshold: 0.001,
	restDisplacementThreshold: 0.001
}

// TODO remove pan
export const Switch: FC<Props> = ({ onValueChange, trackColor, thumbColor, value }) => {
	const switchTranslate = useSharedValue(value ? 21 : 0)
	const { theme } = useStyles()

	const memoizedOnSwitchPressCallback = useCallback(() => {
		onValueChange(!value)
	}, [onValueChange, value])

	switchTranslate.value = withSpring(value ? 21 : 0, animConfig)

	const pan = Gesture.Pan()
		.onChange(e => (switchTranslate.value = clamp(switchTranslate.value + e.changeX, 0, 21)))
		.onFinalize(() => {
			const is = switchTranslate.value > 10.5
			switchTranslate.value = withSpring(is ? 21 : 0, animConfig)

			if (is !== value) {
				runOnJS(onValueChange)(is)
			}
		})

	const trackStyle = useAnimatedStyle(
		() => ({
			backgroundColor: interpolateColor(switchTranslate.value, [0, 21], [trackColor?.false ?? theme.colors.bg200, trackColor?.true ?? theme.colors.bg300])
		}),
		[switchTranslate, theme.colors]
	)
	const thumbStyle = useAnimatedStyle(
		() => ({
			backgroundColor: interpolateColor(switchTranslate.value, [0, 21], [thumbColor?.false ?? theme.colors.text200, thumbColor?.true ?? theme.colors.primary100])
		}),
		[switchTranslate, theme.colors]
	)

	return (
		<Pressable onPress={memoizedOnSwitchPressCallback} style={({ focused }) => ({ borderRadius: 36.5, borderWidth: 3, borderColor: focused ? theme.colors.primary100 : 'transparent' })}>
			<Animated.View style={[{ width: 50, padding: 2, borderRadius: 36.5 }, trackStyle]}>
				<GestureDetector gesture={pan}>
					<Animated.View style={[{ width: 24, height: 24, borderRadius: 24, elevation: 4, transform: [{ translateX: switchTranslate }] }, thumbStyle]} />
				</GestureDetector>
			</Animated.View>
		</Pressable>
	)
}
