import { Button } from '@components/atoms'
import { useTheme, useTypedSelector } from '@hooks'
import { HomeTabParamList } from '@navigation'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { View } from 'react-native'
import { TabBarIcon } from './TabBarIcon'
import { Bookmarks, Home, Search, Settings } from './screens'

const Tab = createBottomTabNavigator<HomeTabParamList>()

export const TabNavigator = () => {
	const { colors } = useTheme()
	const isShowNetInfo = useTypedSelector(state => state.safeArea.isShowNetInfo)

	return (
		<Tab.Navigator
			screenOptions={({ route }) => ({
				headerShown: false,
				// tabBarStyle: isLandscape ? { display: 'none' } : {},
				tabBarShowLabel: false,
				tabBarHideOnKeyboard: true,

				// tabBarBackground: () => <View style={{ backgroundColor: 'red', position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}></View>,
				tabBarButton: ({ children, onPress, to }) => (
					<Button onPress={onPress} padding={10} flex={1} transparent style={{ height: '100%' }}>
						{children}
					</Button>
				),
				tabBarIcon: ({ focused }) => (
					<View style={{ backgroundColor: focused ? colors.primary100 : colors.bg200, width: 32, height: 32, borderRadius: 6, justifyContent: 'center', alignItems: 'center' }}>
						<TabBarIcon route={route} width={24} height={24} fill={focused ? colors.primary300 : colors.text200} />
					</View>
				)
			})}
			safeAreaInsets={isShowNetInfo ? { bottom: 0, left: 0, right: 0, top: 0 } : undefined}>
			<Tab.Screen name='Content' component={Home} />
			<Tab.Screen name='Search' component={Search} />
			<Tab.Screen name='Bookmarks' component={Bookmarks} />
			<Tab.Screen name='Settings' component={Settings} />
		</Tab.Navigator>
	)
}
