import { Button } from '@components/atoms'
import { UpdateApk, User } from '@components/molecules'
import { Switch } from '@components/molecules/settings'
import { useTypedSelector } from '@hooks'
import { SettingsTabParamList, navigation } from '@navigation'
import notifee from '@notifee/react-native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { type FC } from 'react'
import { TVFocusGuideView, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import { Backup } from './Backup'
import { Logs } from './Logs'

const LoaderSettings: FC = () => {
	const isLoading = useTypedSelector(state => state.settings.isLoading)
	const { styles } = useStyles(stylesheet)

	if (!isLoading) {
		return null
	}

	return (
		<View style={styles.loadingContainer}>
			<View style={styles.loading}>
				<Text style={styles.loadingText}>Loading...</Text>
			</View>
		</View>
	)
}

export const Settings: FC = () => {
	const Stack = createNativeStackNavigator<SettingsTabParamList>()
	// const Tab = createMaterialTopTabNavigator<SettingsTabParamList>()

	// const [activeTab, setActiveTab] = useState<keyof BookmarksTabParamList>('History')

	return (
		<View style={{ flex: 1 }}>
			{/* <TabBarTv activeTab={activeTab} setActiveTab={tab => navigation.replace(tab)} /> */}
			<Stack.Navigator screenOptions={{ headerShown: false, freezeOnBlur: true }} initialRouteName={'SettingsHome'}>
				<Stack.Screen name='SettingsHome' component={SettingsScreen} />
				<Stack.Screen name='Logs' component={Logs} />
				<Stack.Screen name='Backup' component={Backup} />
			</Stack.Navigator>
			{/* <Tab.Navigator initialLayout={Dimensions.get('window')} initialRouteName={'Settings'} backBehavior='initialRoute'>
				<Tab.Screen name='Settings' component={SettingsScreen} />
				<Tab.Screen name='Logs' component={Logs} />
			</Tab.Navigator> */}
		</View>
	)
}

export const SettingsScreen: FC = () => {
	const insets = useSafeAreaInsets()
	const { styles } = useStyles(stylesheet)

	return (
		<TVFocusGuideView style={[styles.container, { marginTop: insets.top }]} trapFocusLeft trapFocusRight trapFocusUp>
			<LoaderSettings />

			<View style={styles.updateContainer}>
				<UpdateApk />
			</View>

			<User />

			{/* <Select
				item='theme'
				options={[
					{ value: 'light', title: 'light' },
					{ value: 'dark', title: 'dark' },
					{ value: null, title: 'default' }
				]}
				onChange={value => {
					if (value === null) {
						UnistylesRuntime.setAdaptiveThemes(true)
					} else {
						UnistylesRuntime.setAdaptiveThemes(false)
						UnistylesRuntime.setTheme(value)
					}
				}}
			/> */}
			<Switch item='showDevOptions' />

			<View style={{ gap: 10, paddingTop: 10 }}>
				<Button text='Logs' onPress={() => navigation.navigate('Logs', undefined)} />
				<Button text='Backup' onPress={() => navigation.navigate('Backup', undefined)} />
				<Button text='Открыть настройки уведомлений' onPress={async () => notifee.openNotificationSettings()} />
			</View>
		</TVFocusGuideView>
	)
}

const stylesheet = createStyleSheet(theme => ({
	loadingContainer: {
		position: 'absolute',
		top: 20,
		left: 0,
		right: 0,
		zIndex: 10,
		alignItems: 'center'
	},
	loading: {
		backgroundColor: theme.colors.bg200,
		borderRadius: 50,
		paddingHorizontal: 5
	},
	loadingText: {
		color: theme.colors.text100,
		textAlign: 'center'
	},
	container: {
		flex: 1,
		padding: 10
	},
	updateContainer: {
		paddingBottom: 10
	}
}))
