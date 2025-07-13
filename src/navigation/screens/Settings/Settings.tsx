import { Button } from '@components/atoms'
import { UpdateApk, User } from '@components/molecules'
import { Switch } from '@components/molecules/settings'
import { displayNotificationNewEpisode, displayNotificationNewFilm, useTypedSelector } from '@hooks'
import { SettingsTabParamList, navigation } from '@navigation'
import notifee from '@notifee/react-native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { store } from '@store'
import { type FC } from 'react'
import { TVFocusGuideView, Text, ToastAndroid, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import { Backup, Logs } from './index'

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

	const showDevOptions = useTypedSelector(state => state.settings.settings.showDevOptions)

	// const [activeTab, setActiveTab] = useState<keyof BookmarksTabParamList>('History')

	return (
		<View style={{ flex: 1 }}>
			{/* <TabBarTv activeTab={activeTab} setActiveTab={tab => navigation.replace(tab)} /> */}
			<Stack.Navigator screenOptions={{ headerShown: false, freezeOnBlur: true }} initialRouteName={'SettingsHome'}>
				<Stack.Screen name='SettingsHome' component={SettingsScreen} />
				{showDevOptions && <Stack.Screen name='Logs' component={Logs} />}
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

	const showDevOptions = useTypedSelector(state => state.settings.settings.showDevOptions)

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
				{showDevOptions && <Button text='Logs' onPress={() => navigation.navigate('Logs', undefined)} />}
				<Button text='Backup' onPress={() => navigation.navigate('Backup', undefined)} />
				<Button text='Открыть настройки уведомлений' onPress={async () => notifee.openNotificationSettings()} />

				{showDevOptions && (
					<View style={{ gap: 10, paddingTop: 10 }}>
						<Text style={styles.text}>TEST</Text>
						<View style={{ gap: 10, flexDirection: 'row' }}>
							<Button
								text='NEW FILM'
								onPress={async () => {
									const movies = Object.values(store.getState().settings.settings.watchHistory)
										.sort((a, b) => b.timestamp - a.timestamp)
										.filter(it => it.type === 'Film' && !it.provider && it.notify)

									if (movies.length) {
										const movie = movies[Math.floor(Math.random() * movies.length)]
										displayNotificationNewFilm(movie)
									} else {
										ToastAndroid.show('Не удалось найти', ToastAndroid.SHORT)
									}
								}}
							/>
							<Button
								text='NEW SERIES'
								onPress={async () => {
									const movies = Object.values(store.getState().settings.settings.watchHistory)
										.sort((a, b) => b.timestamp - a.timestamp)
										.filter(it => it.type === 'TvSeries' && !it.provider && it.notify)

									if (movies.length) {
										const movie = movies[Math.floor(Math.random() * movies.length)]
										const startWith = [1, 2, 12][Math.floor(Math.random() * [1, 2, 12].length)]
										const episodesCount = startWith === 12 ? 1 : [1, 2, 4, 6, 12][Math.floor(Math.random() * [1, 2, 4, 6, 12].length)]
										const episodes = Array.from({ length: episodesCount }, (_, i) => String(startWith + i))

										displayNotificationNewFilm(movie, { total: episodes.length, data: { '1': episodes }, provider: movie.provider ?? 'KODIK', translations: [movie.notifyTranslation ?? 'translation', 'test', 'hello world'] })
									} else {
										ToastAndroid.show('Не удалось найти', ToastAndroid.SHORT)
									}
								}}
							/>
							<Button
								text='NEW EPISODE'
								onPress={async () => {
									const movies = Object.values(store.getState().settings.settings.watchHistory)
										.sort((a, b) => b.timestamp - a.timestamp)
										.filter(it => it.type === 'TvSeries' && it.provider && it.notify)

									if (movies.length) {
										const movie = movies[Math.floor(Math.random() * movies.length)]
										const startWith = [1, 2, 12][Math.floor(Math.random() * [1, 2, 12].length)]
										const episodesCount = startWith === 12 ? 1 : [1, 2, 4, 6, 12][Math.floor(Math.random() * [1, 2, 4, 6, 12].length)]
										const episodes = Array.from({ length: episodesCount }, (_, i) => String(startWith + i))

										displayNotificationNewEpisode(movie, { total: episodes.length, data: { '1': episodes }, provider: movie.provider ?? 'KODIK', translations: [movie.notifyTranslation ?? 'translation', 'test', 'hello world'] })
									} else {
										ToastAndroid.show('Не удалось найти', ToastAndroid.SHORT)
									}
								}}
							/>
						</View>
					</View>
				)}
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
	},
	text: {
		color: theme.colors.text200,
		fontSize: 14
	}
}))
