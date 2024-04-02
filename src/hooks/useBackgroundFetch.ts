import notifee, { AndroidImportance, AndroidStyle } from '@notifee/react-native'
import { Unsubscribe } from '@reduxjs/toolkit'
import { getKinoboxPlayers, startAppListening, store } from '@store'
import { WatchHistory, WatchHistoryProvider, settingsActions, settingsExtraActions, setupSettingsListeners } from '@store/settings'
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

type KodikItemType = { last_season: number; last_episode: number; translation: { title: string; type: string } }
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
export const fetchNewSeries = async ({ id, type, title, releasedEpisodes, provider, notifyTranslation }: WatchHistory): Promise<{ total: number; data: NewEpisodesType; translations: string[]; provider: WatchHistoryProvider } | null> => {
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
				const translations: string[] = []

				if (resultsArray && Array.isArray(resultsArray)) {
					for (const serial of resultsArray) {
						if (serial.translation.type === 'voice') {
							const title: string = serial.translation.title
							if (!translations.includes(title)) {
								translations.push(title)
							}
						}
					}

					const seasons = (!notifyTranslation ? resultsArray : resultsArray.filter((item: KodikItemType) => item.translation.title === notifyTranslation))
						.reduce((acc, cur) => {
							const part_match = cur.title.match(/(?<=часть\s)\d+/)
							const part_number = part_match ? parseInt(part_match[0]) : 0

							const season_match = cur.title.match(/(?<=ТВ-)\d+/)
							const season_number = season_match ? parseInt(season_match[0]) : cur.last_season ?? 0

							const existingItem = acc.find((item: { season_number: number; part_number: number }) => item.season_number === season_number && item.part_number === part_number)

							if (!existingItem) {
								acc.push({ season_number, part_number, ...cur })
							}

							return acc
						}, [])
						.sort((a: { season_number: number; part_number: number }, b: { season_number: number; part_number: number }) => {
							if (a.season_number !== b.season_number) {
								return a.season_number - b.season_number
							} else {
								return a.part_number - b.part_number
							}
						})

					total = seasons.reduce((total: number, { last_episode }: KodikItemType) => total + last_episode, 0)

					if (releasedEpisodes && releasedEpisodes < total) {
						data = calculateReleasedEpisodesKodik({ seasons, releasedEpisodes, total })
					}
				}

				console.log(`[fetchNewSeries] ${provider}:${id} total ${total} new episodes: ${JSON.stringify(data)}`)

				return { total, data, translations, provider: provider! }
			}
			case provider?.startsWith('COLLAPS'): {
				const url = `https://api.bhcesh.me/franchise/details?token=${Config.COLLAPS_TOKEN}&${String(id).startsWith('tt') ? 'imdb_id' : 'kinopoisk_id'}=${String(id).startsWith('tt') ? String(id).replace('tt', '') : id}`

				const response = await fetch(url)
				const res = await response.json()

				const seasons = res?.seasons
				let total = 0
				const data: NewEpisodesType = {}
				const translations: string[] = typeof res?.voiceActing === 'object' && Array.isArray(res.voiceActing) ? res.voiceActing : []

				if (typeof seasons === 'object' && Array.isArray(seasons)) {
					for (const season of seasons) {
						for (const episode of season.episodes) {
							if ((notifyTranslation && !episode.voiceActing.includes(notifyTranslation)) ?? episode.iframe_url === null) {
								continue
							}

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

				console.log(`[fetchNewSeries] ${provider}:${id} total ${total} new episodes: ${JSON.stringify(data)}`)

				return { total, data, translations, provider: provider! }
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
				const translations: string[] = []

				if (res?.status === 'error') return null

				if (typeof seasons === 'object') {
					for (const s in seasons) {
						const season = seasons[s]

						for (const e in season.episodes) {
							const episode = season.episodes[e]
							const episodeTranslations: string[] = typeof episode.translation === 'object' ? Object.values<{ translation: string }>(episode.translation).map(translation => translation.translation) : []

							for (const title of episodeTranslations) {
								if (!translations.includes(title)) {
									translations.push(title)
								}
							}

							if (notifyTranslation && !episodeTranslations.includes(notifyTranslation)) {
								continue
							}

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

				console.log(`[fetchNewSeries] ${provider}:${id} total ${total} new episodes: ${JSON.stringify(data)}`)

				return { total, data, translations, provider: provider ?? 'ALLOHA' }
			}
		}
	} catch (e) {
		console.error(`[fetchNewSeries] ${provider}:${id}:`, e)
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
			i = i + 1
			console.log(`[BackgroundFetch] (${i}/${data.length}) id:${movie.id} ${movie.type} "${rusToLatin(movie.title)}"`)

			if (movie.provider === null || movie.provider.startsWith('provider')) {
				await delay(500)
				console.log(`[BackgroundFetch] search provider id:${movie.id}`)

				const { data } = await getKinoboxPlayers(movie)
				if (data === null || data.length === 0) continue
			}

			const newWatchHistoryData: Partial<WatchHistory> = { status: 'new', timestamp: Date.now() }

			if (movie.releasedEpisodes !== undefined) {
				const newSeries = await fetchNewSeries(movie)

				if (newSeries && newSeries.total > movie.releasedEpisodes) {
					displayNotificationNewEpisode(movie, { newSeries })
					newWatchHistoryData.releasedEpisodes = newSeries.total
					newWatchHistoryData.provider = newSeries.provider

					store.dispatch(settingsActions.mergeItem({ watchHistory: { [`${movie.id}`]: newWatchHistoryData } }))
				}
			} else {
				displayNotificationNewFilm(movie)

				if (isSeries(movie.type)) {
					const newSeries = await fetchNewSeries(movie)
					if (newSeries && newSeries.total > 0) {
						newWatchHistoryData.releasedEpisodes = newSeries.total
						newWatchHistoryData.provider = newSeries.provider
					}
				} else {
					newWatchHistoryData.notify = false
					if (movie.notifyTranslation) newWatchHistoryData.notifyTranslation = null
				}

				store.dispatch(settingsActions.mergeItem({ watchHistory: { [`${movie.id}`]: newWatchHistoryData } }))
			}
		} catch (e) {
			console.error('[BackgroundFetch]:', e)
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
			console.log('[BackgroundFetch] TIMEOUT taskId:', taskId)
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
