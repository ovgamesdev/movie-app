import { useActions } from '@hooks'
import { RootStackParamList, navigation, navigationRef } from '@navigation'
import notifee, { EventType, Notification, NotificationPressAction } from '@notifee/react-native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { store } from '@store'
import { MovieType } from '@store/kinopoisk'
import { FC, useEffect } from 'react'
import { ColorTypes } from 'src/theme/themes'
import { TabNavigator } from './TabNavigator'
import { ItemMenuModal } from './modals'
import { Episodes, Movie, MovieListSlug, MovieTrailer, Person, Watch } from './screens'

const Stack = createNativeStackNavigator<RootStackParamList>()

interface Props {
	colors: ColorTypes
}

export const StackNavigator: FC<Props> = ({ colors }) => {
	const { openNotificationByInit } = useActions()

	useEffect(() => {
		// TODO fix notifee
		notifee.getInitialNotification().then(initialNotification => {
			if (initialNotification) {
				openScreenFromNotify(initialNotification)
			}
		})

		const listener = notifee.onForegroundEvent(({ type, detail }) => {
			if (type === EventType.PRESS || type === EventType.ACTION_PRESS) {
				openScreenFromNotify(detail)
			} else {
				// TODO Notices. add badge number
				console.log('notifee.onForegroundEvent:', { type, detail }) // NOTE test
			}
		})

		const openScreenFromNotify = async ({ notification, pressAction }: { notification?: Notification; pressAction?: NotificationPressAction }) => {
			console.log('openScreenFromNotify:', { notification, pressAction }) // NOTE test

			if (notification && pressAction && notification.data && notification.id) {
				const data = notification.data as { id: number; type: MovieType }
				switch (pressAction.id) {
					case 'movie':
						if (navigationRef.isReady() && store.getState().settings.isLoaded) {
							navigation.push('Movie', { data })
						} else {
							openNotificationByInit({ method: 'push', data: ['Movie', { data }] })
						}
						break
					case 'watch':
						if (navigationRef.isReady() && store.getState().settings.isLoaded) {
							navigation.navigate('Watch', { data })
						} else {
							openNotificationByInit({ method: 'navigate', data: ['Watch', { data }] })
						}
						break
				}
				await notifee.cancelNotification(notification.id)
			}
		}

		return listener
	}, [])

	return (
		<Stack.Navigator screenOptions={{ headerShown: false, freezeOnBlur: true }}>
			<Stack.Group>
				<Stack.Screen name='Home' component={TabNavigator} options={{ orientation: 'portrait_up', statusBarHidden: false, statusBarStyle: colors.colorScheme, statusBarTranslucent: true, navigationBarColor: colors.bg100 + '99' }} />
				<Stack.Screen name='Movie' component={Movie} options={{ orientation: __DEV__ ? 'all' : 'portrait_up', statusBarHidden: false, statusBarStyle: colors.colorScheme, statusBarTranslucent: true, navigationBarColor: colors.bg100 + '99' }} />
				<Stack.Screen name='MovieTrailer' component={MovieTrailer} options={{ orientation: 'landscape', statusBarHidden: true, navigationBarHidden: true }} />
				<Stack.Screen name='Person' component={Person} options={{ orientation: 'portrait_up', statusBarHidden: false, statusBarStyle: colors.colorScheme, statusBarTranslucent: true, navigationBarColor: colors.bg100 + '99' }} />
				<Stack.Screen name='Watch' component={Watch} options={{ orientation: 'portrait_up', statusBarHidden: false, statusBarStyle: colors.colorScheme, statusBarTranslucent: true, navigationBarColor: colors.bg100 + '99' }} />
				<Stack.Screen name='MovieListSlug' component={MovieListSlug} options={{ orientation: 'portrait_up', statusBarHidden: false, statusBarStyle: colors.colorScheme, statusBarTranslucent: true, navigationBarColor: colors.bg100 + '99' }} />
				<Stack.Screen name='Episodes' component={Episodes} options={{ orientation: 'portrait_up', statusBarHidden: false, statusBarStyle: colors.colorScheme, statusBarTranslucent: true, navigationBarColor: colors.bg100 + '99' }} />
			</Stack.Group>
			<Stack.Group screenOptions={{ presentation: 'containedTransparentModal', animation: 'none' }}>
				<Stack.Screen name='ItemMenuModal' component={ItemMenuModal} />
			</Stack.Group>
		</Stack.Navigator>
	)
}
