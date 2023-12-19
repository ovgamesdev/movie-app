import { RootStackParamList, navigationRef } from '@navigation'
import notifee, { EventType, Notification, NotificationPressAction } from '@notifee/react-native'
import { StackActions } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { useEffect } from 'react'
import { TabNavigator } from './TabNavigator'
import { Movie, MovieListSlug, MovieTrailer, Person, Watch } from './screens'

const Stack = createNativeStackNavigator<RootStackParamList>()

export const StackNavigator = () => {
	useEffect(() => {
		notifee.getInitialNotification().then(initialNotification => {
			if (initialNotification) {
				openScreenFromNotify(initialNotification)
			}
		})

		const listener = notifee.onForegroundEvent(({ type, detail }) => {
			if (type === EventType.PRESS || type === EventType.ACTION_PRESS) {
				openScreenFromNotify(detail)
			}
		})

		const openScreenFromNotify = ({ notification, pressAction }: { notification?: Notification; pressAction?: NotificationPressAction }) => {
			if (notification && pressAction) {
				switch (pressAction.id) {
					case 'movie':
						navigationRef.dispatch(StackActions.push('Movie', { data: notification.data }))
						break
					case 'watch':
						navigationRef.dispatch(StackActions.push('Watch', { data: notification.data }))
						break
				}
			}
		}

		return listener
	}, [])

	return (
		<Stack.Navigator screenOptions={{ headerShown: false, freezeOnBlur: true }}>
			<Stack.Screen name='Home' component={TabNavigator} options={{ orientation: 'portrait_up', statusBarHidden: false, statusBarColor: 'rgba(0,0,0,0.6)', statusBarTranslucent: true }} />
			<Stack.Screen name='Movie' component={Movie} options={{ orientation: 'portrait_up', statusBarHidden: false, statusBarColor: 'rgba(0,0,0,0.6)', statusBarTranslucent: true }} />
			<Stack.Screen name='MovieTrailer' component={MovieTrailer} options={{ orientation: 'landscape', statusBarHidden: true }} />
			<Stack.Screen name='Person' component={Person} options={{ orientation: 'portrait_up', statusBarHidden: false, statusBarColor: 'rgba(0,0,0,0.6)', statusBarTranslucent: true }} />
			<Stack.Screen name='Watch' component={Watch} options={{ orientation: 'landscape', statusBarHidden: true }} />
			<Stack.Screen name='MovieListSlug' component={MovieListSlug} options={{ orientation: 'portrait_up', statusBarHidden: false, statusBarColor: 'rgba(0,0,0,0.6)', statusBarTranslucent: true }} />
		</Stack.Navigator>
	)
}
