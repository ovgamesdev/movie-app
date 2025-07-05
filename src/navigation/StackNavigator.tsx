import { useActions, useTypedDispatch } from '@hooks'
import { RootStackParamList, navigation, navigationRef } from '@navigation'
import notifee, { EventType, Notification, NotificationPressAction } from '@notifee/react-native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { getKinoboxPlayers, store } from '@store'
import { MovieType } from '@store/kinopoisk'
import { WatchHistory } from '@store/settings'
import { getTMDBPosterImage, themoviedbApi } from '@store/themoviedb'
import { FC, useEffect } from 'react'
import { Linking, ToastAndroid } from 'react-native'
import { ColorTypes } from 'src/theme/themes'
import { TabNavigator } from './TabNavigator'
import { ChangeFilm, ItemMenuModal } from './modals'
import { Episodes, Movie, MovieListSlug, MovieTrailer, Person, Watch } from './screens'

const Stack = createNativeStackNavigator<RootStackParamList>()

interface Props {
	colors: ColorTypes
}

const checkKinopoiskType = (url: string): { id: number; type: MovieType } | null => {
	const filmRegex = /\/film\/(\d+)/
	const seriesRegex = /\/series\/(\d+)/

	const filmMatch = filmRegex.exec(url)
	const seriesMatch = seriesRegex.exec(url)

	if (filmMatch) {
		return { type: 'Film', id: Number(filmMatch[1]) }
	}

	if (seriesMatch) {
		return { type: 'TvSeries', id: Number(seriesMatch[1]) }
	}

	return null
}

const checkImdbType = (url: string): { id: number | `tt${number}`; type: MovieType } | null => {
	const titleRegex = /\/title\/(tt\d+)/

	const titleMatch = titleRegex.exec(url)

	if (titleMatch) {
		return { type: 'Film', id: titleMatch[1] as `tt${number}` }
	}

	return null
}

const useInitialURL = (open: (data: { id: number | `tt${number}`; type: MovieType }) => void) => {
	const _open = (url: string | null) => {
		if (url === null) return

		if (url.startsWith('app://movieapp/')) {
			url = url.split('app://movieapp/')[1]
		}

		if (/kinopoisk/.exec(url)) {
			const data = checkKinopoiskType(url)
			if (data) open(data)
		}

		if (/imdb/.exec(url)) {
			const data = checkImdbType(url)
			if (data) open(data)
		}
	}

	useEffect(() => {
		const subscription = Linking.addEventListener('url', ({ url }) => {
			_open(url)
		})

		const getUrlAsync = async () => {
			// Get the deep link used to open the app
			const initialUrl = await Linking.getInitialURL()
			_open(initialUrl)
		}

		getUrlAsync()

		return () => subscription.remove()
	}, [])
}

export const StackNavigator: FC<Props> = ({ colors }) => {
	const dispatch = useTypedDispatch()
	const { openNotificationByInit, addItemToSearchHistory } = useActions()

	const watchImdb = async (text: string): Promise<{ data: { id: number | `tt${number}` | `ALLOHA:${string}` | `COLLAPS:${string}` | `KODIK:${string}`; type: MovieType }; other: { title: string; poster: string | null; year: number | null } } | null> => {
		const isImdbRegex = /(tt\d{4,9})/

		const id = isImdbRegex.exec(text)?.[0] as `tt${number}` | undefined
		if (!id) return null

		const watchHistory = store.getState().settings.settings.watchHistory[id] as WatchHistory | undefined

		const getTitleByProviders = async ({ id }: { id: `tt${number}` }): Promise<null | Pick<WatchHistory, 'title' | 'type' | 'year' | 'poster' | 'id'>> => {
			try {
				const data = await getKinoboxPlayers({ id: id }).then(it => it.data.find(it => 'data' in it))
				return data?.data ?? null
			} catch {
				return null
			}
		}

		const providersData = await getTitleByProviders({ id })
		if (providersData !== null) {
			const item: WatchHistory = watchHistory
				? { ...watchHistory, ...providersData }
				: {
						...providersData,
						provider: null,
						startTimestamp: Date.now(),
						timestamp: Date.now(),
						status: 'pause'
				  }

			console.log('from provider data:', providersData)
			addItemToSearchHistory(providersData)
			// navigation.push('Movie', { data: { id: item.id, type: item.type }, other: { poster: item.poster, title: item.title, year: item.year } })
			return { data: { id: item.id, type: item.type }, other: { poster: item.poster, title: item.title, year: item.year } }
		}

		const { data } = await dispatch(themoviedbApi.endpoints.getMovieById.initiate({ id }))

		if (data) {
			const mutableItemData: Pick<WatchHistory, 'title' | 'type' | 'year' | 'poster' | 'id'> = data.media_type === 'tv' ? { title: data.name, id: id, type: 'TvSeries', year: Number(data.first_air_date.slice(0, 4)) || null, poster: data.poster_path ? getTMDBPosterImage(data.poster_path) : null } : { title: data.title, id, type: 'Film', year: Number(data.release_date.slice(0, 4)) || null, poster: data.poster_path ? getTMDBPosterImage(data.poster_path) : null }

			const item: WatchHistory = watchHistory
				? { ...watchHistory, ...mutableItemData }
				: {
						...mutableItemData,
						provider: null,
						startTimestamp: Date.now(),
						timestamp: Date.now(),
						status: 'pause'
				  }

			console.log('from themoviedb data:', mutableItemData)
			addItemToSearchHistory(mutableItemData)
			// navigation.push('Movie', { data: { id: item.id, type: item.type }, other: { poster: item.poster, title: item.title, year: item.year } })
			return { data: { id: item.id, type: item.type }, other: { poster: item.poster, title: item.title, year: item.year } }
		} else {
			ToastAndroid.show('IMDB: Не удалось найти фильм', ToastAndroid.SHORT)
			return null
		}
	}

	useInitialURL(async data => {
		console.log('useInitialURL:', data)
		let _data: { data: { id: number | `tt${number}` | `ALLOHA:${string}` | `COLLAPS:${string}` | `KODIK:${string}`; type: MovieType }; other?: { title: string; poster: string | null; year: number | null } } | null

		if (typeof data.id === 'string' && data.id.startsWith('tt')) {
			_data = await watchImdb(`https://www.imdb.com/title/${data.id}/`)
		} else {
			_data = { data }
		}

		if (_data !== null) {
			if (navigationRef.isReady() && store.getState().settings.isLoaded) {
				navigation.push('Movie', _data)
			} else {
				openNotificationByInit({ method: 'push', data: ['Movie', _data] })
			}
		}
	})

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
				<Stack.Screen name='Home' component={TabNavigator} options={{ orientation: 'portrait_up', statusBarHidden: false, statusBarStyle: 'light', statusBarTranslucent: true, navigationBarColor: colors.bg100 + '99' }} />
				<Stack.Screen name='Movie' component={Movie} options={{ orientation: __DEV__ ? 'all' : 'portrait_up', statusBarHidden: false, statusBarStyle: 'light', statusBarTranslucent: true, navigationBarColor: colors.bg100 + '99' }} />
				<Stack.Screen name='MovieTrailer' component={MovieTrailer} options={{ orientation: 'landscape', statusBarHidden: true, navigationBarHidden: true }} />
				<Stack.Screen name='Person' component={Person} options={{ orientation: 'portrait_up', statusBarHidden: false, statusBarStyle: 'light', statusBarTranslucent: true, navigationBarColor: colors.bg100 + '99' }} />
				<Stack.Screen name='Watch' component={Watch} options={{ orientation: 'portrait_up', statusBarHidden: false, statusBarStyle: 'light', statusBarTranslucent: true, navigationBarColor: colors.bg100 + '99' }} />
				<Stack.Screen name='MovieListSlug' component={MovieListSlug} options={{ orientation: 'portrait_up', statusBarHidden: false, statusBarStyle: 'light', statusBarTranslucent: true, navigationBarColor: colors.bg100 + '99' }} />
				<Stack.Screen name='Episodes' component={Episodes} options={{ orientation: 'portrait_up', statusBarHidden: false, statusBarStyle: 'light', statusBarTranslucent: true, navigationBarColor: colors.bg100 + '99' }} />
			</Stack.Group>
			<Stack.Group screenOptions={{ presentation: 'containedTransparentModal', animation: 'none' }}>
				<Stack.Screen name='ItemMenuModal' component={ItemMenuModal} />
				<Stack.Screen name='ChangeFilm' component={ChangeFilm} />
			</Stack.Group>
		</Stack.Navigator>
	)
}
