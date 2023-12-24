import notifee, { AndroidImportance } from '@notifee/react-native'
import { startAppListening, store } from '@store'
import { MovieType } from '@store/kinopoisk'
import { settingsActions, settingsExtraActions, setupSettingsListeners } from '@store/settings'
import { delay, normalizeUrlWithNull } from '@utils'
import { useEffect } from 'react'
import BackgroundFetch, { BackgroundFetchConfig } from 'react-native-background-fetch'
import Config from 'react-native-config'

const config: BackgroundFetchConfig = {
	minimumFetchInterval: 15,
	stopOnTerminate: false,
	enableHeadless: true,
	startOnBoot: true,
	requiredNetworkType: BackgroundFetch.NETWORK_TYPE_ANY
}

// TODO add https://notifee.app/react-native/docs/android/background-restrictions
export const backgroundTask = async (taskId: string) => {
	console.log('[BackgroundFetch] taskId', taskId)

	const unsubscribe = setupSettingsListeners(startAppListening)
	await store.dispatch(settingsExtraActions.getSettings())

	const data = Object.values(store.getState().settings.settings.watchHistory)
		.sort((a, b) => b.timestamp - a.timestamp)
		.filter(it => it.status === 'pause')

	for (const movie of data) {
		try {
			const response = await fetch(`https://kinobox.tv/api/players/main?kinopoisk=${movie.id}&token=${Config.KINOBOX_TOKEN}`)
			if (!response.ok) continue
			const json = await response.json()
			if (!Array.isArray(json) || json.length === 0) continue

			const poster = normalizeUrlWithNull(movie.poster, { isNull: 'https://via.placeholder.com', append: '/300x450' })

			// TODO add date-time
			notifee.displayNotification({
				title: 'Новый контент доступен!',
				body: `Вышел новый ${movie.type === 'Film' ? 'фильм' : movie.type === 'MiniSeries' ? 'мини–сериал' : 'сериал'}: ${movie.title}`,
				data: Object.assign(
					{
						id: movie.id,
						type: movie.type,
						title: movie.title,
						provider: movie.provider
					},
					'poster' in movie && movie.poster ? { poster: movie.poster } : {},
					'year' in movie && movie.year ? { year: movie.year } : {}
				) as {
					id: number
					title: string
					poster?: string
					type: MovieType
					year?: number
				},
				android: {
					channelId: 'content-release-channel',
					largeIcon: poster,
					pressAction: {
						id: 'movie',
						launchActivity: 'default'
					},
					actions: [
						{
							title: 'Смотреть',
							pressAction: {
								id: 'watch',
								launchActivity: 'default'
							}
						}
					],
					timestamp: Date.now(),
					showTimestamp: true
				},
				ios: {
					attachments: [{ url: poster }]
				}
			})

			store.dispatch(settingsActions.mergeItem({ watchHistory: { [`${movie.id}:${movie.provider}`]: { status: 'new' as const } } }))
			await delay(500)
		} catch (e) {
			console.error('BackgroundFetch error:', e)
		}

		await delay(500)
	}

	// Finish.
	unsubscribe()
	BackgroundFetch.finish(taskId)
}

export const useBackgroundFetch = () => {
	const initBackgroundFetch = async () => {
		await BackgroundFetch.configure(config, backgroundTask, (taskId: string) => {
			// Oh No!  Our task took too long to complete and the OS has signalled
			// that this task must be finished immediately.
			console.log('[Fetch] TIMEOUT taskId:', taskId)
			BackgroundFetch.finish(taskId)
		})
	}

	useEffect(() => {
		const init = async () => {
			await notifee.createChannel({
				id: 'content-release-channel',
				name: 'Content Release Notifications',
				description: 'Channel for notifications about new seasons, series, and movies.',
				importance: AndroidImportance.DEFAULT
			})
			await notifee.requestPermission()

			initBackgroundFetch()
		}

		init()
	}, [])
}
