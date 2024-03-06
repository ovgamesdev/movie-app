import { RootStackParamList, navigation } from '@navigation'
import notifee, { EventType, Notification, NotificationPressAction } from '@notifee/react-native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { MovieType } from '@store/kinopoisk'
import { restrictDisplayNotificationData } from '@utils'
import { FC, useEffect } from 'react'
import { ColorTypes } from 'src/theme/themes'
import { TabNavigator } from './TabNavigator'
import { Episodes, Movie, MovieListSlug, MovieTrailer, Person, Watch } from './screens'

const Stack = createNativeStackNavigator<RootStackParamList>()

interface Props {
	colors: ColorTypes
}

export const StackNavigator: FC<Props> = ({ colors }) => {
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
			if (notification && pressAction && notification.data) {
				const data = notification.data
				switch (pressAction.id) {
					case 'movie':
						navigation.push('Movie', { data: { id: data.id as number, type: data.type as MovieType } })
						break
					case 'watch':
						navigation.navigate('Watch', { data: restrictDisplayNotificationData(data) })
						break
				}
			}
		}

		return listener
	}, [])

	return (
		<Stack.Navigator screenOptions={{ headerShown: false, freezeOnBlur: true }}>
			<Stack.Screen name='Home' component={TabNavigator} options={{ orientation: 'portrait_up', statusBarHidden: false, statusBarColor: 'rgba(0,0,0,0.6)', statusBarTranslucent: true, navigationBarColor: colors.bg100 + '99' }} />
			{/* TODO: to portrait_up */}
			<Stack.Screen name='Movie' component={Movie} options={{ orientation: __DEV__ ? 'all' : 'portrait_up', statusBarHidden: false, statusBarColor: 'rgba(0,0,0,0.6)', statusBarTranslucent: true, navigationBarColor: colors.bg100 + '99' }} />
			<Stack.Screen name='MovieTrailer' component={MovieTrailer} options={{ orientation: 'landscape', statusBarHidden: true, navigationBarHidden: true }} />
			<Stack.Screen name='Person' component={Person} options={{ orientation: 'portrait_up', statusBarHidden: false, statusBarColor: 'rgba(0,0,0,0.6)', statusBarTranslucent: true, navigationBarColor: colors.bg100 + '99' }} />
			<Stack.Screen name='Watch' component={Watch} options={{ orientation: 'portrait_up', statusBarHidden: false, statusBarColor: 'rgba(0,0,0,0.6)', statusBarTranslucent: true, navigationBarColor: colors.bg100 + '99' }} />
			<Stack.Screen name='MovieListSlug' component={MovieListSlug} options={{ orientation: 'portrait_up', statusBarHidden: false, statusBarColor: 'rgba(0,0,0,0.6)', statusBarTranslucent: true, navigationBarColor: colors.bg100 + '99' }} />
			<Stack.Screen name='Episodes' component={Episodes} options={{ orientation: 'portrait_up', statusBarHidden: false, statusBarColor: 'rgba(0,0,0,0.6)', statusBarTranslucent: true, navigationBarColor: colors.bg100 + '99' }} />
		</Stack.Navigator>
	)
}
