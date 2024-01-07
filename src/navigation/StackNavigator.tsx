import { RootStackParamList, navigation } from '@navigation'
import notifee, { EventType, Notification, NotificationPressAction } from '@notifee/react-native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { MovieType } from '@store/kinopoisk'
import { WatchHistoryProvider } from '@store/settings'
import { useEffect } from 'react'
import { ColorTypes } from 'src/theme/colors'
import { TabNavigator } from './TabNavigator'
import { Movie, MovieListSlug, MovieTrailer, Person, Watch } from './screens'

const Stack = createNativeStackNavigator<RootStackParamList>()

interface Props {
	colors: ColorTypes
}

export const StackNavigator = ({ colors }: Props) => {
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
						// TODO check data is types
						navigation.navigate('Watch', { data: { id: data.id as number, type: data.type as MovieType, title: data.title as string, poster: 'poster' in data ? (data.poster as string) : null, year: 'year' in data ? (data.year as number) : null, provider: data.provider as WatchHistoryProvider | null } })
						break
				}
			}
		}

		return listener
	}, [])

	return (
		<Stack.Navigator screenOptions={{ headerShown: false, freezeOnBlur: true }}>
			<Stack.Screen name='Home' component={TabNavigator} options={{ orientation: 'portrait_up', statusBarHidden: false, statusBarColor: 'rgba(0,0,0,0.6)', statusBarTranslucent: true, navigationBarColor: colors.bg100 }} />
			<Stack.Screen name='Movie' component={Movie} options={{ orientation: 'all', statusBarHidden: false, statusBarColor: 'rgba(0,0,0,0.6)', statusBarTranslucent: true, navigationBarColor: colors.bg100 }} />
			<Stack.Screen name='MovieTrailer' component={MovieTrailer} options={{ orientation: 'landscape', statusBarHidden: true, navigationBarHidden: true }} />
			<Stack.Screen name='Person' component={Person} options={{ orientation: 'portrait_up', statusBarHidden: false, statusBarColor: 'rgba(0,0,0,0.6)', statusBarTranslucent: true, navigationBarColor: colors.bg100 }} />
			<Stack.Screen name='Watch' component={Watch} options={{ orientation: 'portrait_up', statusBarHidden: false, statusBarColor: 'rgba(0,0,0,0.6)', statusBarTranslucent: true, navigationBarColor: colors.bg100 }} />
			<Stack.Screen name='MovieListSlug' component={MovieListSlug} options={{ orientation: 'portrait_up', statusBarHidden: false, statusBarColor: 'rgba(0,0,0,0.6)', statusBarTranslucent: true, navigationBarColor: colors.bg100 }} />
		</Stack.Navigator>
	)
}
