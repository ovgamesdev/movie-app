import notifee, { AndroidImportance } from '@notifee/react-native'
import { Unsubscribe } from '@reduxjs/toolkit'
import { startAppListening, store } from '@store'
import { WatchHistory, settingsActions, settingsExtraActions, setupSettingsListeners } from '@store/settings'
import { delay, isSeries, normalizeUrlWithNull, rusToLatin, validateDisplayNotificationData } from '@utils'
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

export const fetchNewSeries = async ({ id, type, title }: WatchHistory): Promise<number | null> => {
	// ALLOHA
	// TODO add for other providers

	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition, no-constant-condition
	const url = `${false ? 'https://api.alloha.tv' : 'https://api.apbugall.org'}/?token=${Config.ALLOHA_TOKEN}&kp=${id}`

	try {
		const response = await fetch(url)
		const res = await response.json()

		const seasons = res?.data?.seasons
		let total = 0

		if (res?.status === 'error') return null

		if (typeof seasons === 'object') {
			for (const s in seasons) {
				const season = seasons[s]

				for (const e in season.episodes) {
					total++
				}
			}
		}

		console.log(`[fetchNewSeries] ${type} "${rusToLatin(title)}": ${total}`)

		return total
	} catch (e) {
		console.log(`[fetchNewSeries] error ${type} "${rusToLatin(title)}":`, e)
		return null
	}
}

const displayNotificationNewFilm = (movie: WatchHistory) => {
	const poster = normalizeUrlWithNull(movie.poster, { isNull: 'https://via.placeholder.com', append: '/300x450' })

	notifee.displayNotification({
		id: `${movie.type}:${movie.id}`,
		title: 'Новый контент доступен!',
		body: `Вышел новый ${movie.type === 'Film' ? 'фильм' : movie.type === 'MiniSeries' ? 'мини–сериал' : 'сериал'}: ${movie.title}`,
		data: validateDisplayNotificationData(movie),
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
}
const displayNotificationNewEpisode = (movie: WatchHistory, { newSeries }: { newSeries: number }) => {
	const poster = normalizeUrlWithNull(movie.poster, { isNull: 'https://via.placeholder.com', append: '/300x450' })

	notifee.displayNotification({
		id: `${movie.type}:${movie.id}`,
		title: 'Новый контент доступен!',
		body: `Новый эпизод «${movie.title}»`, // (эпизод 0, сезон 0).
		data: validateDisplayNotificationData(movie),
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
}

export const backgroundTask = async (taskId: string) => {
	console.log('[BackgroundFetch] taskId', taskId)

	let unsubscribe: Unsubscribe | null = null
	if (store.getState().settings.settings._settings_time === 0) {
		unsubscribe = setupSettingsListeners(startAppListening)
		await store.dispatch(settingsExtraActions.getSettings())
	}

	const data = Object.values(store.getState().settings.settings.watchHistory)
		.sort((a, b) => b.timestamp - a.timestamp)
		.filter(it => it.notify)

	let i = 0
	for (const movie of data) {
		try {
			const response = await fetch(`https://kinobox.tv/api/players/main?kinopoisk=${movie.id}&token=${Config.KINOBOX_TOKEN}`)

			i = i + 1
			console.log(`[BackgroundFetch] (${i}/${data.length}) id:${movie.id} ${rusToLatin(movie.type)} "${rusToLatin(movie.title)}"`)

			if (!response.ok) continue
			const json = await response.json()
			if (!Array.isArray(json) || json.length === 0) continue

			const newWatchHistoryData: Partial<WatchHistory> = {
				status: 'new',
				timestamp: Date.now()
			}

			if (movie.releasedEpisodes) {
				const newSeries = await fetchNewSeries(movie)

				if (newSeries && newSeries > movie.releasedEpisodes) {
					displayNotificationNewEpisode(movie, { newSeries })
					newWatchHistoryData.releasedEpisodes = newSeries

					store.dispatch(settingsActions.mergeItem({ watchHistory: { [`${movie.id}`]: newWatchHistoryData } }))
				}
			} else {
				displayNotificationNewFilm(movie)

				if (isSeries(movie.type)) {
					const newSeries = await fetchNewSeries(movie)
					newWatchHistoryData.releasedEpisodes = newSeries ?? 1
				} else {
					newWatchHistoryData.notify = false
				}

				store.dispatch(settingsActions.mergeItem({ watchHistory: { [`${movie.id}`]: newWatchHistoryData } }))
			}
		} catch (e) {
			console.error('BackgroundFetch error:', e)
		}

		await delay(250)
	}

	// Finish.
	unsubscribe?.()
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
