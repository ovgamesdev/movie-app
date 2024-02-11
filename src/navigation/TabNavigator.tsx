import { Button } from '@components/atoms'
import { useTypedSelector } from '@hooks'
import { HomeTabParamList } from '@navigation'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Platform, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import { TabBarIcon } from './TabBarIcon'
import { Bookmarks, Home, Search, Settings, TvBookmarks } from './screens'

const Tab = createBottomTabNavigator<HomeTabParamList>()

export const TabNavigator = () => {
	const { styles, theme } = useStyles(stylesheet)

	const isShowNetInfo = useTypedSelector(state => state.safeArea.isShowNetInfo)

	return (
		<Tab.Navigator
			screenOptions={({ route }) => ({
				headerShown: false,
				// tabBarStyle: isLandscape ? { display: 'none' } : {},
				tabBarShowLabel: false,
				// tabBarHideOnKeyboard: true,

				// tabBarBackground: () => <View style={{ backgroundColor: 'red', position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}></View>,
				tabBarButton: ({ children, onPress }) => (
					<Button onPress={onPress} padding={10} flex={1} transparent style={styles.tabBarButton}>
						{children}
					</Button>
				),
				tabBarIcon: ({ focused }) => (
					<View style={styles.tabBarIconContainer(focused)}>
						<TabBarIcon route={route} width={24} height={24} fill={focused ? theme.colors.primary300 : theme.colors.text200} />
					</View>
				)
			})}
			safeAreaInsets={isShowNetInfo ? styles.safeAreaInsets : undefined}>
			<Tab.Screen name='Content' component={Home} />
			<Tab.Screen name='Search' component={Search} />
			<Tab.Screen name='Bookmarks' component={Platform.isTV ? TvBookmarks : Bookmarks} />
			<Tab.Screen name='Settings' component={Settings} />
		</Tab.Navigator>
	)
}

const stylesheet = createStyleSheet(theme => ({
	tabBarButton: {
		height: '100%'
	},
	tabBarIconContainer: (focused: boolean) => ({
		backgroundColor: focused ? theme.colors.primary100 : theme.colors.bg200,
		width: 32,
		height: 32,
		borderRadius: 6,
		justifyContent: 'center',
		alignItems: 'center'
	}),
	safeAreaInsets: {
		bottom: 0,
		left: 0,
		right: 0,
		top: 0
	}
}))
