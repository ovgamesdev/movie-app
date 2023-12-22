import notifee, { AndroidImportance } from '@notifee/react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
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

interface contentReleaseNotifyMovieFilm {
	id: number
	title: string
	poster: string | null
	type: 'Film'
	year: number | null
}

interface contentReleaseNotifyMovieSeries {
	id: number
	title: string
	poster: string | null
	type: 'TvSeries' | 'MiniSeries'
	year: number | null
}

export type IContentReleaseNotifyMovie = contentReleaseNotifyMovieFilm | contentReleaseNotifyMovieSeries

type Key = Pick<IContentReleaseNotifyMovie, 'id'>

const store = {
	key: 'contentReleaseNotify',
	get: async (key: Key): Promise<IContentReleaseNotifyMovie | null> => {
		try {
			const data = await AsyncStorage.getItem(store.key)
			if (data !== null && data.length > 0) {
				const parsedData = JSON.parse(data)
				return parsedData[store._toInternalKey(key)] ?? null
			}
			return null
		} catch {
			return null
		}
	},
	set: async (key: Key, value: unknown): Promise<boolean> => {
		try {
			const data = await AsyncStorage.getItem(store.key)
			const newData = data !== null && data.length > 0 ? JSON.parse(data) : {}
			newData[store._toInternalKey(key)] = value
			await AsyncStorage.setItem(store.key, JSON.stringify(newData))
			return true
		} catch {
			return false
		}
	},
	all: async (): Promise<IContentReleaseNotifyMovie[]> => {
		try {
			const data = await AsyncStorage.getItem(store.key)
			if (data !== null && data.length > 0) {
				const parsedData = JSON.parse(data)
				return Object.values(parsedData)
			}
			return []
		} catch {
			return []
		}
	},
	remove: async (key: Key): Promise<boolean> => {
		try {
			const data = await AsyncStorage.getItem(store.key)
			if (data !== null && data.length > 0) {
				const parsedData = JSON.parse(data)
				delete parsedData[store._toInternalKey(key)]
				await AsyncStorage.setItem(store.key, JSON.stringify(parsedData))
				return true
			}
			return false
		} catch {
			return false
		}
	},
	_toInternalKey: ({ id }: Key): string => '' + id
}

export const addItemToContentReleaseNotify = async (movie: IContentReleaseNotifyMovie): Promise<boolean> => {
	try {
		return await store.set(movie, movie)
	} catch {
		return false
	}
}

export const removeItemToContentReleaseNotify = async (key: Key): Promise<boolean> => store.remove(key)

export const isItemInContentReleaseNotify = async (key: Key): Promise<boolean> => {
	try {
		const data = await store.get(key)
		return !!data
	} catch {
		return false
	}
}

export const backgroundTask = async (taskId: string) => {
	console.log('[BackgroundFetch] taskId', taskId)

	const contentReleaseNotify = await store.all()

	for (const movie of contentReleaseNotify) {
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
						title: movie.title
					},
					'poster' in movie && movie.poster ? { poster: movie.poster } : {},
					'year' in movie && movie.year ? { year: movie.year } : {}
				) as {
					id: number
					title: string
					poster?: string
					type: 'Film' | 'TvSeries' | 'MiniSeries'
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
					]
				},
				ios: {
					attachments: [{ url: poster }]
				}
			})

			await store.remove(movie)
		} catch (e) {
			console.error('BackgroundFetch error:', e)
		}

		await delay(500)
	}

	// Finish.
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
