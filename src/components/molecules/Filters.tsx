import { Button } from '@components/atoms'
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'
import { Animated, ScrollView, TVFocusGuideView, Text } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useStyles } from 'react-native-unistyles'

interface Props<T extends string> {
	scrollY: Animated.Value
	activeFilter: T
	setActiveFilter: (value: T) => void
	filters: Record<T, string>
}

export const Filters = <T extends string>({ scrollY, activeFilter, setActiveFilter, filters }: Props<T>) => {
	const insets = useSafeAreaInsets()
	const bottomTabBarHeight = useBottomTabBarHeight()
	const { theme } = useStyles()

	const barHeight = bottomTabBarHeight - insets.bottom + 2

	const diffClamp = Animated.diffClamp(scrollY, 0, barHeight)
	const translateY = diffClamp.interpolate({ inputRange: [0, barHeight], outputRange: [0, -barHeight] })

	const objectFilters = Object.values(filters) as string[]
	const objectFilterKeys = Object.keys(filters) as T[]

	return (
		<Animated.View style={{ transform: [{ translateY }], zIndex: 1, height: barHeight, position: 'absolute', top: 0, left: 0, right: 0 }}>
			<TVFocusGuideView autoFocus trapFocusLeft trapFocusRight style={{ flexDirection: 'row', borderBottomColor: theme.colors.bg300, borderBottomWidth: 1, paddingVertical: 7, backgroundColor: theme.colors.bg100 }}>
				<ScrollView horizontal contentContainerStyle={{ paddingHorizontal: 12, gap: 12 }}>
					{objectFilters.map((tab, index) => {
						const key = objectFilterKeys[index]
						const isActive = key === activeFilter

						return (
							<Button key={index} onPress={() => !isActive && setActiveFilter(key)} isActive={isActive} padding={4} paddingHorizontal={10} alignItems='center' justifyContent='center' buttonColor={theme.colors.bg200} activeButtonColor={theme.colors.primary100} activePressedButtonColor={theme.getColorForTheme({ dark: 'primary200', light: 'text200' })} style={{ minWidth: 48 }}>
								<Text style={{ color: isActive ? theme.colors.primary300 : theme.colors.text200, fontSize: 14, textAlign: 'center' }}>{tab}</Text>
							</Button>
						)
					})}
				</ScrollView>
			</TVFocusGuideView>
		</Animated.View>
	)
}
