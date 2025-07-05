import { navigation } from '@navigation'
import { forwardRef, ReactNode, useCallback, useEffect, useImperativeHandle, useState } from 'react'
import { BackHandler, Dimensions, Pressable, StyleSheet } from 'react-native'
import { Gesture, GestureDetector, NativeGesture } from 'react-native-gesture-handler'
import { useReanimatedKeyboardAnimation } from 'react-native-keyboard-controller'
import Animated, { clamp, runOnJS, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue, withClamp, withSpring, withTiming } from 'react-native-reanimated'
import { useSafeAreaFrame, useSafeAreaInsets } from 'react-native-safe-area-context'

export type ModalType = {
	close: () => void
}

export const ModalContainer = forwardRef<ModalType, { children: ReactNode | ((scrollGesture: NativeGesture) => ReactNode) }>(({ children }, ref) => {
	const screenHeight = Dimensions.get('window').height
	const inset = useSafeAreaInsets()
	const rect = useSafeAreaFrame()

	const { height } = useReanimatedKeyboardAnimation()

	const translateY = useSharedValue(screenHeight)
	const backdropOpacity = useSharedValue(0)
	const scrollBegin = useSharedValue(0)
	const scrollY = useSharedValue(0)
	const [enableScroll, setEnableScroll] = useState(true)

	const closeModal = useCallback(() => {
		translateY.value = withTiming(screenHeight)
		backdropOpacity.value = withTiming(0)

		delayCloseModal()
	}, [])

	const delayCloseModal = () => {
		// requestAnimationFrame(() => {
		// 	navigation.goBack()
		// })
		setTimeout(navigation.goBack, 250)
	}

	const pan = Gesture.Pan()
		.onUpdate(e => {
			translateY.value = clamp(e.translationY, 0, screenHeight)
		})
		.onEnd(e => {
			if (e.translationY > 150 || e.velocityY > 150) {
				translateY.value = withTiming(screenHeight)
				backdropOpacity.value = withTiming(0)

				runOnJS(delayCloseModal)()

				return
			}

			translateY.value = withClamp({ min: 0, max: screenHeight }, withSpring(0, { velocity: e.velocityY, mass: 0.5, damping: 15, overshootClamping: true }))
		})

	useEffect(() => {
		translateY.value = withTiming(0)
		backdropOpacity.value = withTiming(1)

		const onBackPress = () => {
			closeModal()

			return true
		}

		const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress)

		return () => subscription.remove()
	}, [])

	useImperativeHandle(ref, () => ({
		close: closeModal
	}))

	const animatedViewStyles = useAnimatedStyle(() => ({
		transform: [{ translateY: translateY.value }]
	}))

	const animatedBackdropStyles = useAnimatedStyle(() => ({
		opacity: backdropOpacity.value
	}))

	const onScroll = useAnimatedScrollHandler({
		onBeginDrag: event => {
			scrollBegin.value = event.contentOffset.y
		},
		onScroll: event => {
			scrollY.value = event.contentOffset.y
		}
	})

	const panScroll = Gesture.Pan()
		.onUpdate(e => {
			if (e.translationY < 0 && scrollY.value === 0) {
				runOnJS(setEnableScroll)(true)
			} else if (e.translationY > 0 && scrollY.value === 0) {
				runOnJS(setEnableScroll)(false)
			}

			translateY.value = clamp(Math.max(e.translationY - scrollBegin.value, 0), 0, screenHeight)
		})
		.onEnd(e => {
			runOnJS(setEnableScroll)(true)
			if (scrollY.value === 0 && (e.translationY > 150 || e.velocityY > 150)) {
				translateY.value = withTiming(screenHeight)
				backdropOpacity.value = withTiming(0)

				runOnJS(delayCloseModal)()

				return
			}

			translateY.value = withClamp({ min: 0, max: screenHeight }, withSpring(0, { mass: 0.5, damping: 15, overshootClamping: true }))
		})

	const scrollViewGesture = Gesture.Native()

	return (
		<Pressable onPress={closeModal} style={[StyleSheet.absoluteFillObject, { justifyContent: 'flex-end' }]}>
			<Animated.View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(0,0,0,0.7)' }, animatedBackdropStyles]}></Animated.View>

			<GestureDetector gesture={pan}>
				<Animated.View style={{ transform: [{ translateY: height }], paddingBottom: inset.bottom }}>
					<Animated.View style={animatedViewStyles}>
						<Pressable>
							<GestureDetector gesture={Gesture.Simultaneous(scrollViewGesture, panScroll)}>
								<Animated.ScrollView scrollEnabled={enableScroll} bounces={false} scrollEventThrottle={16} onScroll={onScroll} style={{ maxHeight: rect.height - 80 }}>
									{typeof children === 'function' ? children(scrollViewGesture) : children}
								</Animated.ScrollView>
							</GestureDetector>
						</Pressable>
					</Animated.View>
				</Animated.View>
			</GestureDetector>
		</Pressable>
	)
})

// const ModalContainer = forwardRef<ModalType, { children: ReactNode }>(({ children }, ref) => {
// 	const screenHeight = Dimensions.get('window').height

// 	const { height } = useReanimatedKeyboardAnimation()

// 	const translateY = useSharedValue(screenHeight)
// 	const backdropOpacity = useSharedValue(0)

// 	const closeModal = useCallback(() => {
// 		translateY.value = withTiming(screenHeight)
// 		backdropOpacity.value = withTiming(0)

// 		delayCloseModal()
// 	}, [])

// 	const delayCloseModal = () => {
// 		requestAnimationFrame(() => {
// 			navigation.goBack()
// 		})
// 		// setTimeout(navigation.goBack, 250)}
// 	}

// 	const pan = Gesture.Pan()
// 		.onUpdate(e => {
// 			translateY.value = clamp(e.translationY, 0, screenHeight)
// 		})
// 		.onEnd(e => {
// 			if (e.translationY > 150 || e.velocityY > 150) {
// 				translateY.value = withTiming(screenHeight)
// 				backdropOpacity.value = withTiming(0)

// 				runOnJS(delayCloseModal)()

// 				return
// 			}

// 			translateY.value = withClamp({ min: 0, max: screenHeight }, withSpring(0, { velocity: e.velocityY, mass: 0.5, damping: 15, overshootClamping: true }))
// 		})

// 	useEffect(() => {
// 		translateY.value = withTiming(0)
// 		backdropOpacity.value = withTiming(1)

// 		const onBackPress = () => {
// 			closeModal()

// 			return true
// 		}

// 		const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress)

// 		return () => subscription.remove()
// 	}, [])

// 	useImperativeHandle(ref, () => ({
// 		close: closeModal
// 	}))

// 	const animatedViewStyles = useAnimatedStyle(() => ({
// 		transform: [{ translateY: translateY.value }]
// 	}))

// 	const animatedBackdropStyles = useAnimatedStyle(() => ({
// 		opacity: backdropOpacity.value
// 	}))

// 	return (
// 		<Pressable onPress={closeModal} style={{ flex: 1 }}>
// 			<Animated.View style={[{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.7)' }, animatedBackdropStyles]}></Animated.View>
// 			<Animated.View style={[{ flex: 1, justifyContent: 'flex-end' }]}>
// 				<Pressable>
// 					<GestureDetector gesture={pan}>
// 						<Animated.View style={{ transform: [{ translateY: height }] }}>
// 							<Animated.View style={animatedViewStyles}>{children}</Animated.View>
// 						</Animated.View>
// 					</GestureDetector>
// 				</Pressable>
// 			</Animated.View>
// 		</Pressable>
// 	)
// })
