import notifee, { AndroidImportance, AndroidStyle } from '@notifee/react-native'
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

type KodikItemType = { last_season: number; last_episode: number }
const calculateReleasedEpisodesKodik = ({ seasons, releasedEpisodes, total }: { seasons: KodikItemType[]; releasedEpisodes: number; total: number }): NewEpisodesType => {
	let remainingEpisodes = total - releasedEpisodes
	const res: NewEpisodesType = {}

	for (let i = seasons.length - 1; i >= 0; i--) {
		const { last_season } = seasons[i]
		let { last_episode } = seasons[i]

		const episodes: string[] = []
		while (remainingEpisodes > 0 && last_episode > 0) {
			episodes.unshift(String(last_episode))
			remainingEpisodes--
			last_episode--
		}
		if (episodes.length > 0) {
			res[`${last_season}`] = episodes
		}
	}

	return res
}

type NewEpisodesType = { [key: string]: string[] }
export const fetchNewSeries = async ({ id, type, title, releasedEpisodes, provider }: WatchHistory): Promise<{ total: number; data: NewEpisodesType } | null> => {
	// TODO add for other providers

	try {
		switch (true) {
			// case provider?.startsWith('HDVB'):
			// case provider?.startsWith('VIDEOCDN'):
			// case provider?.startsWith('VOIDBOOST'):
			case provider?.startsWith('KODIK'): {
				const url = `https://kodikapi.com/search?${String(id).startsWith('tt') ? 'imdb' : 'kinopoisk'}_id=${id}&token=${Config.KODIK_TOKEN}`

				const response = await fetch(url)
				const res = await response.json()

				const resultsArray = res?.results
				let total = 0
				let data: NewEpisodesType = {}

				if (resultsArray && Array.isArray(resultsArray)) {
					const seasons = resultsArray
						.reduce((acc, current) => {
							const existing = acc.find((item: KodikItemType) => item.last_season === current.last_season)
							if (!existing || current.last_episode > existing.last_episode) {
								return [...acc.filter((item: KodikItemType) => item.last_season !== current.last_season), current]
							} else {
								return acc
							}
						}, [])
						.sort((a: KodikItemType, b: KodikItemType) => a.last_season - b.last_season)

					total = seasons.reduce((total: number, { last_episode }: KodikItemType) => total + last_episode, 0)

					if (releasedEpisodes && releasedEpisodes < total) {
						data = calculateReleasedEpisodesKodik({ seasons, releasedEpisodes, total })
					}
				}

				console.log(`[fetchNewSeries] ${provider}:${type} "${rusToLatin(title)}": ${total}`, data)

				return { total, data }
			}
			case provider?.startsWith('COLLAPS'): {
				const url = `https://api.bhcesh.me/franchise/details?token=${Config.COLLAPS_TOKEN}&${String(id).startsWith('tt') ? 'imdb_id' : 'kinopoisk_id'}=${String(id).startsWith('tt') ? String(id).replace('tt', '') : id}`

				const response = await fetch(url)
				const res = await response.json()

				const seasons = res?.seasons
				let total = 0
				const data: NewEpisodesType = {}

				if (typeof seasons === 'object' && Array.isArray(seasons)) {
					for (const season of seasons) {
						for (const episode of season.episodes) {
							total = total + 1

							if (releasedEpisodes && releasedEpisodes < total) {
								if (`${season.season}` in data) {
									data[`${season.season}`].push(episode.episode)
								} else {
									data[`${season.season}`] = [episode.episode]
								}
							}
						}
					}
				}

				console.log(`[fetchNewSeries] ${provider}:${type} "${rusToLatin(title)}": ${total}`, data)

				return { total, data }
			}

			default:
			case provider?.startsWith('ALLOHA'): {
				// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition, no-constant-condition
				const url = `${false ? 'https://api.alloha.tv' : 'https://api.apbugall.org'}/?token=${Config.ALLOHA_TOKEN}&${String(id).startsWith('tt') ? 'imdb' : 'kp'}=${id}`

				const response = await fetch(url)
				const res = await response.json()

				const seasons = res?.data?.seasons
				let total = 0
				const data: NewEpisodesType = {}

				if (res?.status === 'error') return null

				if (typeof seasons === 'object') {
					for (const s in seasons) {
						const season = seasons[s]

						for (const e in season.episodes) {
							const episode = season.episodes[e]
							total = total + 1

							if (releasedEpisodes && releasedEpisodes < total) {
								if (`${season.season}` in data) {
									data[`${season.season}`].push(episode.episode)
								} else {
									data[`${season.season}`] = [episode.episode]
								}
							}
						}
					}
				}

				console.log(`[fetchNewSeries] ${provider}:${type} "${rusToLatin(title)}": ${total}`, data)

				return { total, data }
			}
		}
	} catch (e) {
		console.log(`[fetchNewSeries] error ${provider}:${type} "${rusToLatin(title)}":`, e)
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
			style: {
				type: AndroidStyle.BIGTEXT,
				text: `Вышел новый ${movie.type === 'Film' ? 'фильм' : movie.type === 'MiniSeries' ? 'мини–сериал' : 'сериал'}: ${movie.title}`
			},
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
const displayNotificationNewEpisode = (movie: WatchHistory, { newSeries }: { newSeries: { total: number; data: NewEpisodesType } }) => {
	const poster = normalizeUrlWithNull(movie.poster, { isNull: 'https://via.placeholder.com', append: '/300x450' })

	const seasonTitle = Object.keys(newSeries.data)
		.map(season => {
			const episode = newSeries.data[season]
			const episodeTitle = episode.length < 2 ? episode[0] : episode[0] + ' - ' + episode[episode.length - 1]

			return `(эпизод ${episodeTitle}, сезон ${season})`
		})
		.join(', ')

	notifee.displayNotification({
		id: `${movie.type}:${movie.id}`,
		title: 'Новый контент доступен!',
		body: `Новый эпизод «${movie.title}» ${seasonTitle.length === 0 ? '' : seasonTitle + '.'}`,
		data: validateDisplayNotificationData(movie),
		android: {
			channelId: 'content-release-channel',
			style: {
				type: AndroidStyle.BIGTEXT,
				text: `Новый эпизод «${movie.title}» ${seasonTitle.length === 0 ? '' : seasonTitle + '.'}`
			},
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

let isFinishTask = true
export const backgroundTask = async (taskId: string) => {
	if (!isFinishTask) {
		console.log('[BackgroundFetch] continue taskId', taskId)
		await delay(1000 * 60 * 10)
		return
	}

	console.log('[BackgroundFetch] taskId', taskId)

	let unsubscribe: Unsubscribe | null = null
	if (store.getState().settings.settings._settings_time === 0) {
		unsubscribe = setupSettingsListeners(startAppListening)
		await store.dispatch(settingsExtraActions.getSettings())
	}

	isFinishTask = false

	const data = Object.values(store.getState().settings.settings.watchHistory)
		.sort((a, b) => b.timestamp - a.timestamp)
		.filter(it => it.notify)

	let i = 0
	for (const movie of data) {
		try {
			await delay(250)
			const response = await fetch(`https://kinobox.tv/api/players/main?${String(movie.id).startsWith('tt') ? 'imdb' : 'kinopoisk'}=${movie.id}&token=${Config.KINOBOX_TOKEN}`)

			i = i + 1
			console.log(`[BackgroundFetch] (${i}/${data.length}) id:${movie.id} ${rusToLatin(movie.type)} "${rusToLatin(movie.title)}"`)

			if (!response.ok) continue
			const json = await response.json()
			if (!Array.isArray(json) || json.length === 0) continue

			const newWatchHistoryData: Partial<WatchHistory> = { status: 'new', timestamp: Date.now() }

			if (movie.releasedEpisodes) {
				const newSeries = await fetchNewSeries(movie)

				if (newSeries && newSeries.total > movie.releasedEpisodes) {
					displayNotificationNewEpisode(movie, { newSeries })
					newWatchHistoryData.releasedEpisodes = newSeries.total

					store.dispatch(settingsActions.mergeItem({ watchHistory: { [`${movie.id}`]: newWatchHistoryData } }))
				}
			} else {
				displayNotificationNewFilm(movie)

				if (isSeries(movie.type)) {
					const newSeries = await fetchNewSeries(movie)
					newWatchHistoryData.releasedEpisodes = newSeries?.total ?? 1
				} else {
					newWatchHistoryData.notify = false
				}

				store.dispatch(settingsActions.mergeItem({ watchHistory: { [`${movie.id}`]: newWatchHistoryData } }))
			}
		} catch (e) {
			console.error('BackgroundFetch error:', e)
		}
	}

	// Finish.
	isFinishTask = true
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
