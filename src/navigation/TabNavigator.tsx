import { useTheme } from '@hooks'
import { HomeIcon, SettingsIcon } from '@icons'
import { HomeTabParamList } from '@navigation'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { View } from 'react-native'
import { Home, Settings } from './screens'

const Tab = createBottomTabNavigator<HomeTabParamList>()

export const TabNavigator = () => {
	const { colors } = useTheme()

	return (
		<Tab.Navigator
			screenOptions={({ route }) => ({
				headerShown: false,
				// tabBarStyle: isLandscape ? { display: 'none' } : {},
				tabBarShowLabel: false,
				tabBarHideOnKeyboard: true,

				tabBarIcon: ({ focused }) => <View style={{ backgroundColor: focused ? colors.primary100 : colors.bg200, width: 32, height: 32, borderRadius: 6, justifyContent: 'center', alignItems: 'center' }}>{route.name === 'Content' ? <HomeIcon width={20} height={20} fill={focused ? colors.primary300 : colors.text200} /> : <SettingsIcon width={24} height={24} fill={focused ? colors.primary300 : colors.text200} />}</View>
			})}
			// safeAreaInsets={{ bottom: 0, left: 0, right: 0, top: 0 }}
		>
			<Tab.Screen name='Content' component={Home} />
			<Tab.Screen name='Settings' component={Settings} />
		</Tab.Navigator>
	)
}
