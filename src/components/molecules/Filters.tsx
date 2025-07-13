import { Button, FocusableFlatList, FocusableListType } from '@components/atoms'
import { useTypedSelector } from '@hooks'
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'
import { ForwardedRef, forwardRef, useImperativeHandle, useRef } from 'react'
import { Animated, TVFocusGuideView, Text } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useStyles } from 'react-native-unistyles'

interface Props<T extends string> {
	scrollY: Animated.Value
	activeFilter: T
	setActiveFilter: (value: T) => void
	scrollToTop: (value: T) => void
	filters: Record<T, string>
}

export type FiltersType = {
	show: () => void
	hide: () => void
}

export const Filters = forwardRef(function Filters<T extends string>({ scrollY, activeFilter, setActiveFilter, scrollToTop, filters }: Props<T>, forwardRef: ForwardedRef<FiltersType>) {
	const insets = useSafeAreaInsets()
	const bottomTabBarHeight = useBottomTabBarHeight()
	const isShowNetInfo = useTypedSelector(state => state.safeArea.isShowNetInfo)
	const showDevOptions = useTypedSelector(state => state.settings.settings.showDevOptions)
	const { theme } = useStyles()

	const ref = useRef<FocusableListType>(null)

	const barHeight = bottomTabBarHeight + 2 - (isShowNetInfo ? 0 : insets.bottom)

	const diffClamp = Animated.diffClamp(scrollY, 0, barHeight)
	const translateY = diffClamp.interpolate({ inputRange: [0, barHeight], outputRange: [0, -barHeight] })

	useImperativeHandle(forwardRef, () => ({
		// TODO fix
		show: () => scrollY.setValue(-999),
		hide: () => scrollY.setValue(999)
	}))

	const objectFilters = Object.entries<string>(filters).filter(it => (showDevOptions ? true : it[0].startsWith('_') ? false : true))

	return (
		<Animated.View style={{ transform: [{ translateY }], zIndex: 1, height: barHeight, position: 'absolute', top: 0, left: 0, right: 0 }}>
			<TVFocusGuideView autoFocus trapFocusLeft trapFocusRight style={{ flexDirection: 'row', borderBottomColor: theme.colors.bg300, borderBottomWidth: 1, paddingVertical: 7, backgroundColor: theme.colors.bg100 }}>
				<FocusableFlatList
					ref={ref}
					data={objectFilters}
					horizontal
					contentContainerStyle={{ paddingHorizontal: 12, gap: 12 }}
					renderItem={({ item, index }) => {
						const key = item[0] as T
						const isActive = key === activeFilter

						const onPress = () => {
							ref.current?.scrollToIndex({ index, animated: true, viewPosition: 0.5 })

							if (!isActive) {
								setActiveFilter(key)
							} else {
								scrollToTop(key)
							}
						}

						return (
							<Button key={index} onPress={onPress} isActive={isActive} padding={4} paddingHorizontal={10} alignItems='center' justifyContent='center' buttonColor={theme.colors.bg200} activeButtonColor={theme.colors.primary100} activePressedButtonColor={theme.getColorForTheme({ dark: 'primary200', light: 'text200' })} style={{ minWidth: 48 }}>
								<Text style={{ color: isActive ? theme.colors.primary300 : theme.colors.text200, fontSize: 14, textAlign: 'center' }}>{item[1]}</Text>
							</Button>
						)
					}}
					// getItemLayout={(_, index) => ({ length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index })}
				/>
			</TVFocusGuideView>
		</Animated.View>
	)
})
// <T extends string>
