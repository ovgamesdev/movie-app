import notifee, { AndroidImportance, AndroidStyle } from '@notifee/react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Unsubscribe } from '@reduxjs/toolkit'
import { getKinoboxPlayers, startAppListening, store } from '@store'
import { NewEpisodesType, noticesActions, noticesExtraActions, setupNoticesListeners } from '@store/notices'
import { settingsActions, settingsExtraActions, setupSettingsListeners, WatchHistory, WatchHistoryProvider } from '@store/settings'
import { delay, getNoun, isSeries, normalizeUrlWithNull } from '@utils'
import { useEffect } from 'react'
import BackgroundFetch, { BackgroundFetchConfig, HeadlessEvent } from 'react-native-background-fetch'
import Config from 'react-native-config'

const config: BackgroundFetchConfig = {
	minimumFetchInterval: 60, // 15
	stopOnTerminate: false,
	enableHeadless: true,
	startOnBoot: true,
	requiredNetworkType: BackgroundFetch.NETWORK_TYPE_ANY
}

type KodikItemType = {
	season_number: number
	part_number: number
	last_season: number
	last_episode: number
	translation: { title: string; type: string }
}

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

const isAllowedTranslation = (title: string, notifyTranslation: string | null | undefined): boolean => {
	if (!notifyTranslation) {
		// console.log(`[PASS] Нет notifyTranslation — пропускаем все: "${title}"`)1
		return true
	}

	if (notifyTranslation.startsWith('!')) {
		const banned = notifyTranslation.slice(1)
		const isBanned = title.includes(banned)
		// console.log(`[CHECK] Блокируем по "${banned}": "${title}" → ${!isBanned}`)
		return !isBanned
	}

	const allowed = title.includes(notifyTranslation)
	// console.log(`[CHECK] Разрешаем по "${notifyTranslation}": "${title}" → ${allowed}`)
	return allowed
}

export const fetchNewSeries = async ({ id, type, title, releasedEpisodes, provider, notifyTranslation }: WatchHistory): Promise<{ total: number; data: NewEpisodesType; translations: string[]; provider: WatchHistoryProvider } | null> => {
	// TODO add for other providers
	// console.log('[fetchNewSeries]', { id, releasedEpisodes, provider, notifyTranslation })

	try {
		switch (true) {
			// case provider?.startsWith('HDVB'):
			// case provider?.startsWith('VIDEOCDN'):
			// TODO
			// https://videocdn.tv/api/tv-series?api_token=xxx&ordering=id&direction=desc
			// https://videocdn.tv/api/short?api_token=xxx&kinopoisk_id=[kp_id]
			// case provider?.startsWith('VOIDBOOST'):
			case provider?.startsWith('KODIK'): {
				const url = `https://kodikapi.com/search?${String(id).startsWith('tt') ? 'imdb' : 'kinopoisk'}_id=${id}&token=${Config.KODIK_TOKEN}&limit=100`

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

					const seasons = (!notifyTranslation ? resultsArray : resultsArray.filter((item: KodikItemType) => isAllowedTranslation(item.translation.title, notifyTranslation)))
						.reduce<KodikItemType[]>((acc, cur) => {
							const title = [cur.title, cur.title_orig, cur.other_title].filter(it => !!it).join(' / ')
							const part_match = /(\d+(?=\s+часть))|((?<=часть\s+)\d+)/gi.exec(title)
							const part_number = part_match ? parseInt(part_match[0]) : 0

							const season_match = /(?<=ТВ-)\d+/gi.exec(title)
							const season_number = season_match ? parseInt(season_match[0]) : cur.last_season ?? 0

							const existingItem = acc.find(item => item.season_number === season_number && item.part_number === part_number)

							if (!existingItem || cur.last_episode > existingItem.last_episode) {
								return [...acc.filter(item => `${item.season_number}.${item.part_number}` !== `${season_number}.${part_number}`), { season_number, part_number, ...cur }]
							}

							return acc
						}, [])
						.sort((a, b) => {
							if (a.season_number !== b.season_number) {
								return a.season_number - b.season_number
							} else {
								return a.part_number - b.part_number
							}
						})

					total = seasons.reduce((total: number, { last_episode }: KodikItemType) => total + last_episode, 0)

					if (typeof releasedEpisodes === 'number' && releasedEpisodes < total) {
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
							if ((notifyTranslation && !(episode.voiceActing as string[]).find(title => isAllowedTranslation(title, notifyTranslation))) ?? episode.iframe_url === null) {
								continue
							}

							total = total + 1

							if (typeof releasedEpisodes === 'number' && releasedEpisodes < total) {
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

							if (notifyTranslation && !episodeTranslations.find(title => isAllowedTranslation(title, notifyTranslation))) {
								continue
							}

							total = total + 1

							if (typeof releasedEpisodes === 'number' && releasedEpisodes < total) {
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

const formatNewEpisodes = (data: NewEpisodesType): string[] => {
	return Object.keys(data).map(season => {
		const episodes = data[season]
		const count = episodes.length
		let episodeTitle: string

		if (count === 1) {
			episodeTitle = `вышла ${episodes[0]} серия`
		} else {
			// Для корректного отображения диапазона, если номера идут подряд
			const first = parseInt(episodes[0], 10)
			const last = parseInt(episodes[episodes.length - 1], 10)
			if (last - first === count - 1) {
				episodeTitle = `вышли ${episodes[0]}-${episodes[episodes.length - 1]} серии`
			} else {
				episodeTitle = `вышли серии: ${episodes.join(', ')}`
			}
		}
		return `${season} сезон: ${episodeTitle}`
	})
}

export const displayNotificationNewFilm = (movie: WatchHistory, options?: { total: number; data: NewEpisodesType; translations: string[]; provider: WatchHistoryProvider } | null) => {
	const poster = normalizeUrlWithNull(movie.poster, { isNull: 'https://dummyimage.com/{width}x{height}/eee/aaa', append: '/300x450' })

	const contentType = isSeries(movie.type) ? (movie.type === 'MiniSeries' ? 'мини–сериал' : 'сериал') : 'фильм'
	// const countInfo = options && options.total > 0 ? ` (вышло ${options.total} ${getNoun(options.total, 'серия', 'серии', 'серий')})` : ''
	const bodyText = `Вышел новый ${contentType}`

	const filmLines = [`${bodyText}: «${movie.title}»`]

	if (options) {
		filmLines.push(...formatNewEpisodes(options.data))

		const newTranslationAvailable = movie.notifyTranslation && options.translations.includes(movie.notifyTranslation)
		if (newTranslationAvailable) {
			filmLines.push(`Доступна озвучка от ${movie.notifyTranslation}!`)
		} else {
			options.translations.forEach(translation => filmLines.push(`Доступна озвучка от ${translation}!`))
		}
	}

	store.dispatch(
		noticesActions.displayNotification({
			id: `${movie.type}:${movie.id}`,
			title: `${bodyText}: «${movie.title}»`,
			body: 'Нажмите, чтобы посмотреть детали или начать просмотр.',
			data: { type: movie.type, id: movie.id, title: movie.title, newSeries: options?.data ?? {} },
			android: {
				channelId: 'content-release-channel',
				style: {
					type: AndroidStyle.INBOX,
					lines: filmLines
					// summary: `${bodyText}: «${movie.title}»`
				},
				largeIcon: poster,
				pressAction: { id: 'movie', launchActivity: 'default' },
				actions: [
					{
						title: 'Смотреть',
						pressAction: { id: 'watch', launchActivity: 'default' }
					}
				],
				timestamp: Date.now(),
				showTimestamp: true
			}
		})
	)
}

export const displayNotificationNewEpisode = (movie: WatchHistory, options: { total: number; data: NewEpisodesType; translations: string[]; provider: WatchHistoryProvider }) => {
	const poster = normalizeUrlWithNull(movie.poster, { isNull: 'https://dummyimage.com/{width}x{height}/eee/aaa', append: '/300x450' })

	const episodeLines = formatNewEpisodes(options.data)

	const newTranslationAvailable = movie.notifyTranslation && options.translations.includes(movie.notifyTranslation)
	if (newTranslationAvailable) {
		episodeLines.push(`Доступна озвучка от ${movie.notifyTranslation}!`)
	} else {
		options.translations.forEach(translation => episodeLines.push(`Доступна озвучка от ${translation}!`))
	}

	const bodyText = `Вышли новые серии «${movie.title}»`

	store.dispatch(
		noticesActions.displayNotification({
			id: `${movie.type}:${movie.id}`,
			title: `Новые серии «${movie.title}»`,
			body: bodyText,
			data: { type: movie.type, id: movie.id, title: movie.title, newSeries: options.data },
			android: {
				channelId: 'content-release-channel',
				style: {
					type: AndroidStyle.INBOX,
					lines: episodeLines,
					summary: `Всего ${options.total} ${getNoun(options.total, 'серия', 'серии', 'серий')}`
				},
				largeIcon: poster,
				pressAction: { id: 'movie', launchActivity: 'default' },
				actions: [
					{
						title: 'Смотреть',
						pressAction: { id: 'watch', launchActivity: 'default' }
					}
				],
				timestamp: Date.now(),
				showTimestamp: true
			}
		})
	)
}

const BG_FETCH_STORAGE_KEY = '@BackgroundFetch_processing_queue'
const taskTimeoutState: { [key: string]: boolean } = {}

export const backgroundTask = async (event: string | HeadlessEvent) => {
	const taskId = typeof event === 'string' ? event : event.taskId
	const isTimeout = typeof event === 'string' ? false : event.timeout

	if (isTimeout) {
		console.log('[BackgroundFetch] Headless TIMEOUT:', taskId)
		taskTimeoutState[taskId] = true
		BackgroundFetch.finish(taskId)
		return
	}

	console.log(`[BackgroundFetch] start: ${taskId}`)

	taskTimeoutState[taskId] = false
	const subscriptions: Unsubscribe[] = []

	try {
		if (store.getState().settings.settings._settings_time === 0) {
			subscriptions.push(setupSettingsListeners(startAppListening))
			subscriptions.push(setupNoticesListeners(startAppListening))
			await store.dispatch(settingsExtraActions.getSettings())
			await store.dispatch(noticesExtraActions.getNotices())
		}

		let processingQueue: WatchHistory[] = []
		const savedQueueJson = await AsyncStorage.getItem(BG_FETCH_STORAGE_KEY)

		if (savedQueueJson) {
			processingQueue = JSON.parse(savedQueueJson)
			console.log(`[BackgroundFetch] Resuming with ${processingQueue.length} items from previous session.`)
		} else {
			processingQueue = Object.values(store.getState().settings.settings.watchHistory)
				.sort((a, b) => b.timestamp - a.timestamp)
				.filter(it => it.notify)
			console.log(`[BackgroundFetch] Starting new session with ${processingQueue.length} items.`)
		}

		if (processingQueue.length === 0) {
			console.log('[BackgroundFetch] Queue is empty. Finishing task.')
			await AsyncStorage.removeItem(BG_FETCH_STORAGE_KEY)
			subscriptions.forEach(unsubscribe => unsubscribe())
			BackgroundFetch.finish(taskId)
			return
		}

		await AsyncStorage.setItem(BG_FETCH_STORAGE_KEY, JSON.stringify(processingQueue))

		while (processingQueue.length > 0) {
			if (taskTimeoutState[taskId]) {
				console.log('[BackgroundFetch] Timeout detected inside loop. Stopping processing.')
				break
			}

			const movie = processingQueue.shift()!

			try {
				console.log(`[BackgroundFetch] Processing (${movie.id}). Remaining: ${processingQueue.length}`)

				let movieProvider = movie.provider
				if (movie.provider === null || movie.provider.startsWith('provider')) {
					await delay(500)
					console.log(`[BackgroundFetch] search provider id:${movie.id}`)

					const data = await getKinoboxPlayers(movie).then(it => it.data.filter(it => 'iframeUrl' in it))
					if (data.length === 0) {
						await AsyncStorage.setItem(BG_FETCH_STORAGE_KEY, JSON.stringify(processingQueue))
						continue
					}
					movieProvider = data[0].source
				}

				const newWatchHistoryData: Partial<WatchHistory> = {}

				if (movie.releasedEpisodes !== undefined) {
					const newSeries = await fetchNewSeries({ ...movie, provider: movieProvider })

					if (newSeries && newSeries.total !== movie.releasedEpisodes) {
						if (newSeries.total > movie.releasedEpisodes) {
							displayNotificationNewEpisode(movie, newSeries)
							newWatchHistoryData.status = 'new'
							newWatchHistoryData.timestamp = Date.now()
						}
						newWatchHistoryData.releasedEpisodes = newSeries.total
						newWatchHistoryData.provider = newSeries.provider

						store.dispatch(settingsActions.mergeItem({ watchHistory: { [`${movie.id}`]: newWatchHistoryData } }))
					}
				} else {
					let seriesInfo: { total: number; data: NewEpisodesType; translations: string[]; provider: WatchHistoryProvider } | null = null
					newWatchHistoryData.status = 'new'
					newWatchHistoryData.timestamp = Date.now()

					if (isSeries(movie.type)) {
						const newSeries = await fetchNewSeries({ ...movie, provider: movieProvider })
						if (newSeries && newSeries.total > 0) {
							newWatchHistoryData.releasedEpisodes = newSeries.total
							newWatchHistoryData.provider = newSeries.provider
							seriesInfo = newSeries
						}

						displayNotificationNewFilm(movie, seriesInfo)
						store.dispatch(settingsActions.mergeItem({ watchHistory: { [`${movie.id}`]: newWatchHistoryData } }))
					} else {
						newWatchHistoryData.notify = false
						if (movie.notifyTranslation) newWatchHistoryData.notifyTranslation = null

						const moviePlayers = await getKinoboxPlayers(movie, undefined, !movie.notifyTranslation).then(it => it.data.filter(it => 'iframeUrl' in it))

						const data = moviePlayers
							.map(it => it.translations)
							.flat()
							.map(it => it.name)
							.filter(it => it !== null)
							.filter(t => isAllowedTranslation(t, movie.notifyTranslation))

						if (data.length || !movie.notifyTranslation) {
							displayNotificationNewFilm(movie, seriesInfo)
							store.dispatch(settingsActions.mergeItem({ watchHistory: { [`${movie.id}`]: newWatchHistoryData } }))
						}
					}
				}

				await AsyncStorage.setItem(BG_FETCH_STORAGE_KEY, JSON.stringify(processingQueue))
			} catch (e) {
				console.error('[BackgroundFetch] Error processing item:', movie.id, e)
				await AsyncStorage.setItem(BG_FETCH_STORAGE_KEY, JSON.stringify(processingQueue))
			}
		}

		if (processingQueue.length === 0) {
			console.log('[BackgroundFetch] All items processed. Cleaning up.')
			await AsyncStorage.removeItem(BG_FETCH_STORAGE_KEY)
		}
	} catch (e) {
		console.error('[BackgroundFetch] General Error:', e)
	} finally {
		delete taskTimeoutState[taskId]
		subscriptions.forEach(unsubscribe => unsubscribe())
		BackgroundFetch.finish(taskId)
		console.log('[BackgroundFetch] Headless task finished.', taskId)
	}
}

export const useBackgroundFetch = () => {
	const initBackgroundFetch = async () => {
		const status = await BackgroundFetch.configure(config, backgroundTask, async (taskId: string) => backgroundTask({ taskId, timeout: true }))

		switch (status) {
			case BackgroundFetch.STATUS_RESTRICTED as 0:
				console.log(`BackgroundFetch status: Background fetch updates are unavailable and the user cannot enable them again. For example, this status can occur when parental controls are in effect for the current user.`)
				break
			case BackgroundFetch.STATUS_DENIED as 1:
				console.log(`BackgroundFetch status: The user explicitly disabled background behavior for this app or for the whole system.`)
				break
			case BackgroundFetch.STATUS_AVAILABLE as 2:
				console.log(`BackgroundFetch status: Background fetch is available and enabled.`)
				break
		}
	}

	const initNotifee = async () => {
		await notifee.requestPermission()
		await notifee.createChannel({
			id: 'content-release-channel',
			name: 'Content Release Notifications',
			description: 'Channel for notifications about new seasons, series, and movies.',
			importance: AndroidImportance.DEFAULT
		})
	}

	useEffect(() => {
		initBackgroundFetch()
		initNotifee()
	}, [])
}
