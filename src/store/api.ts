import { isSeries } from '@utils'
import Config from 'react-native-config'
import { WatchHistory, WatchHistoryProvider } from './settings'

export interface KinoboxPlayersData {
	source: WatchHistoryProvider
	translations: { id: number | null; name: string | null; quality: string | null; iframeUrl: string }[]
	iframeUrl: string
	title?: string
	data?: Pick<WatchHistory, 'title' | 'type' | 'year' | 'poster' | 'id'>
}

export interface ErrorPlayerData {
	source: WatchHistoryProvider
	error: 'NOT_FOUND' | 'ERROR' | 'PROVIDER_ERROR'
	data?: Pick<WatchHistory, 'title' | 'type' | 'year' | 'poster' | 'id'>
}

interface kinoboxPlayers {
	data: (KinoboxPlayersData | ErrorPlayerData)[]
	error: null | 'ERROR'
}

export interface KodikQuery {
	season?: number | null
	episode?: string | null
	translation?: { id: number; title: string } | null
	lastTime?: number | null
}

export const getKinoboxPlayers = async ({ id }: { id: number | `tt${number}` }, query?: { kodik?: KodikQuery }, pass?: boolean): Promise<kinoboxPlayers> => {
	if (pass) return { data: [], error: null }

	const data: (KinoboxPlayersData | ErrorPlayerData)[] = []

	const requests = [
		(async () => {
			try {
				// console.log('api: COLLAPS start')
				const response = await fetch(`https://api.bhcesh.me/franchise/details?token=${Config.COLLAPS_TOKEN}&${String(id).startsWith('tt') ? 'imdb_id' : 'kinopoisk_id'}=${String(id).startsWith('tt') ? String(id).replace('tt', '') : id}`)
				// console.log('api: COLLAPS end')

				if (response.ok) {
					const json = await response.json()
					if (!('status' in json) && 'id' in json) {
						const detail: KinoboxPlayersData['data'] = {
							title: json.name ?? json.name_eng,
							id,
							poster: json.poster ?? null,
							type: 'seasons' in json ? 'TvSeries' : 'Film',
							year: json.year ?? null
						}

						if ((json.iframe_url ?? null) === null) {
							data.push({ source: 'COLLAPS', error: 'NOT_FOUND', data: detail })
						} else {
							const voiceActing = json.voiceActing

							const translations: KinoboxPlayersData['translations'] = []

							if (typeof voiceActing === 'object') {
								for (const t in voiceActing) {
									const translation = voiceActing[t]

									translations.push({
										id: Number(t),
										iframeUrl: json.iframe_url,
										name: translation,
										quality: json.quality ?? null
									})
								}
							}

							data.push({
								iframeUrl: json.iframe_url,
								source: 'COLLAPS',
								title: json.name ?? json.name_eng,
								translations,
								data: detail
							})
						}
					} else {
						data.push({ source: 'COLLAPS', error: 'PROVIDER_ERROR' })
					}
				} else {
					data.push({ source: 'COLLAPS', error: 'NOT_FOUND' })
				}
			} catch (e) {
				console.error('[getKinoboxPlayers] COLLAPS:', e)
				data.push({ source: 'COLLAPS', error: 'ERROR' })
			}
		})(),

		(async () => {
			try {
				// console.log('api: ALLOHA start')
				// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition, no-constant-condition
				const response = await fetch(`${false ? 'https://api.alloha.tv' : 'https://api.apbugall.org'}/?token=${Config.ALLOHA_TOKEN}&${String(id).startsWith('tt') ? 'imdb' : 'kp'}=${id}`)
				// console.log('api: ALLOHA end')

				if (response.ok) {
					const json = await response.json()
					if (json?.data && json?.status === 'success') {
						const detail: KinoboxPlayersData['data'] = {
							title: json.data.name ?? json.data.original_name,
							id,
							poster: json.data.poster,
							type: 'seasons' in json.data ? 'TvSeries' : 'Film',
							year: json.data.year ?? null
						}

						if ((json.data.iframe ?? null) === null) {
							data.push({ source: 'ALLOHA', error: 'NOT_FOUND', data: detail })
						} else {
							const translation_iframe = json.data.translation_iframe

							const translations: KinoboxPlayersData['translations'] = []

							if (typeof translation_iframe === 'object') {
								for (const t in translation_iframe) {
									const translation = translation_iframe[t]

									translations.push({
										id: Number(t),
										iframeUrl: translation.iframe,
										name: translation.name,
										quality: translation.quality
									})
								}
							}

							data.push({
								iframeUrl: json.data.iframe,
								source: 'ALLOHA',
								title: json.data.name ?? json.data.original_name,
								translations,
								data: detail
							})
						}
					} else {
						data.push({ source: 'ALLOHA', error: 'PROVIDER_ERROR' })
					}
				} else {
					data.push({ source: 'ALLOHA', error: 'NOT_FOUND' })
				}
			} catch (e) {
				console.error('[getKinoboxPlayers] ALLOHA:', e)
				data.push({ source: 'ALLOHA', error: 'ERROR' })
			}
		})(),

		(async () => {
			const res = await getKodikPlayers({ id }, query?.kodik)
			data.push(...res.data)
		})()
	]

	await Promise.all(requests)

	const providerOrder: ('COLLAPS' | 'ALLOHA' | 'KODIK' | 'VIDEOCDN' | 'HDVB' | 'VOIDBOOST')[] = ['COLLAPS', 'ALLOHA', 'KODIK', 'VIDEOCDN', 'HDVB', 'VOIDBOOST']

	data.sort((a, b) => {
		const baseProviderA = a.source.split(':')[0]
		const baseProviderB = b.source.split(':')[0]

		const indexA = providerOrder.indexOf(baseProviderA as (typeof providerOrder)[number])
		const indexB = providerOrder.indexOf(baseProviderB as (typeof providerOrder)[number])

		if (indexA !== indexB) {
			return indexA - indexB
		}

		if (baseProviderA === 'KODIK') {
			const numA = a.source.includes(':') ? parseFloat(a.source.split(':')[1]) : -1
			const numB = b.source.includes(':') ? parseFloat(b.source.split(':')[1]) : -1
			return numA - numB
		}

		return 0
	})

	// console.log('api: end')

	const error: 'ERROR' | null = data.filter(it => 'error' in it && it.error === 'ERROR').length === data.length ? 'ERROR' : null

	return { data, error }
}

export const getKodikPlayers = async ({ id }: { id: number | `tt${number}` | `KODIK:${string}` }, _data?: KodikQuery): Promise<kinoboxPlayers> => {
	const data: (KinoboxPlayersData | ErrorPlayerData)[] = []

	try {
		const response = await fetch(`https://kodikapi.com/search?${String(id).startsWith('KODIK:') ? 'id' : String(id).startsWith('tt') ? 'imdb_id' : 'kinopoisk_id'}=${String(id).replace('KODIK:', '')}&token=${Config.KODIK_TOKEN}&with_episodes=true&limit=100`)

		if (response.ok) {
			const json = await response.json()
			if ('results' in json && Array.isArray(json.results) && json.results.length > 0) {
				const resultsArray = json.results.map((cur: { other_title: string; title_orig: string; title: string; last_season: any }) => {
					const title = [cur.title, cur.title_orig, cur.other_title].filter(it => !!it).join(' / ')
					const part_match = /(\d+(?=\s+часть))|((?<=часть\s+)\d+)/gi.exec(title)
					const part_number = part_match ? parseInt(part_match[0]) : 0

					// TODO test (kinopoisk_id=691223) && other
					// const season_match = /(?<=ТВ-)\d+/gi.exec(title)
					// const season_number = season_match ? parseInt(season_match[0]) : cur.last_season ?? 0
					const season_number = cur.last_season ?? 0
					return { ...cur, part_number, season_number }
				})

				const filteredData = resultsArray.reduce((acc: any, cur: any) => {
					const existingItem = acc.find((item: { part_number: number; season_number: number }) => item.season_number === cur.season_number && item.part_number === cur.part_number)

					if (!existingItem) {
						acc.push(cur)
					}

					return acc
				}, [])

				const sortedData = filteredData.sort((a: { season_number: number; part_number: number }, b: { season_number: number; part_number: number }) => {
					if (a.season_number !== b.season_number) {
						return a.season_number - b.season_number
					} else {
						return a.part_number - b.part_number
					}
				})

				const items: any = resultsArray.filter((it: { translation: { id: number | undefined }; seasons?: { [x: string]: { episodes: any } } }) => it.translation.id === _data?.translation?.id && (it.seasons === undefined ? true : `${_data?.season}` in it.seasons && `${_data?.episode}` in it.seasons[`${_data?.season}`].episodes))

				const resSortedData: any[] = sortedData.map((it: { seasons: any; translation: any; season_number?: number; id: string; quality: any; link: string; part_number: number }) => {
					const savedItem = items.find((item: any) => 'season_number' in it && 'season_number' in item && it.season_number === item.season_number && 'part_number' in it && 'part_number' in item && it.part_number === item.part_number) // ? 'part_number' in it && 'part_number' in item && it.part_number === item.part_number : false
					const movie = savedItem ? savedItem : it

					const movieLink = !savedItem ? `${movie.link}${isSeries(movie.type) ? '?episode=1' : ''}` : `${movie.link}?${[_data?.lastTime ? 'start_from=' + _data.lastTime : null, typeof _data?.episode === 'string' ? 'episode=' + _data.episode : null, typeof _data?.season === 'number' ? 'season=' + _data.season : null].filter(it => !!it).join('&')}`

					const translations = resultsArray
						.filter((item: { part_number: number; season_number: number }) => item.season_number === movie.season_number && item.part_number === movie.part_number)
						.map((it: any) => {
							const savedItem = items.find(
								(item: any) =>
									//
									'translation' in it &&
									'translation' in item &&
									'id' in it.translation &&
									'id' in item.translation &&
									it.translation.id === item.translation.id &&
									//
									'season_number' in it &&
									'season_number' in item &&
									it.season_number === item.season_number &&
									//
									'part_number' in it &&
									'part_number' in item &&
									it.part_number === item.part_number
							) // ? 'part_number' in it && 'part_number' in item && it.part_number === item.part_number : false
							const movie = savedItem ? savedItem : it

							const movieLink = !savedItem ? `${movie.link}${isSeries(movie.type) ? '?episode=1' : ''}` : `${movie.link}?${[_data?.lastTime ? 'start_from=' + _data.lastTime : null, typeof _data?.episode === 'string' ? 'episode=' + _data.episode : null, typeof _data?.season === 'number' ? 'season=' + _data.season : null].filter(it => !!it).join('&')}`

							return {
								id: it.translation?.id ?? null,
								name: `${it.translation?.title}`,

								// ?? it.year ?? it.translation?.title ?? ''

								quality: it.quality ?? null,
								iframeUrl: movieLink.startsWith('//') ? `https:${movieLink}` : movieLink
							}
						})

					const iframeUrl = translations.find((it: any) => it.id === _data?.translation?.id)?.iframeUrl ?? (movieLink.startsWith('//') ? `https:${movieLink}` : movieLink)

					const detail: KinoboxPlayersData['data'] = {
						title: movie.title ?? movie.title_orig,
						id: movie.id,
						poster: typeof movie.kinopoisk_id === 'string' ? `https://st.kp.yandex.net/images/film_big/${movie.kinopoisk_id}.jpg` : null,
						type: 'last_season' in movie ? 'TvSeries' : 'Film',
						year: movie.year ?? null
					}

					return {
						source: `KODIK:${'season_number' in movie ? movie.season_number : movie.id}${movie.part_number > 0 ? '.' + movie.part_number : ''}`,
						title: 'season_number' in movie ? `${movie.season_number === 0 ? (movie.seasons?.[movie.season_number].title ? `${movie.title} [${movie.seasons?.[movie.season_number].title}]` : movie.title) : movie.title}` : undefined,
						// title: 'season_number' in movie ? `${movie.season_number === 0 ? movie.seasons?.[movie.season_number].title ?? movie.title : 'Сезон ' + movie.season_number}${movie.part_number > 0 ? ', часть ' + movie.part_number : ''}` : undefined,
						translations: translations, // [{ id: null, name: movie.year ?? movie.translation?.title ?? '', quality: movie.quality ?? null, iframeUrl: movieLink.startsWith('//') ? `https:${movieLink}` : movieLink }],
						iframeUrl, //: translations.find(it => it.id === data?.translation?.id)?.iframeUrl ?? movieLink.startsWith('//') ? `https:${movieLink}` : movieLink
						data: detail
					}
				})

				if (resSortedData.length === 0) {
					data.push({ source: 'KODIK', error: 'NOT_FOUND' })
				} else {
					data.push(...resSortedData)
				}
				// console.log('kodik json:', json)

				// if ('error' in json && typeof json.error === 'string') {
				// 	// return { data: null, error: `code: ${json.error.code.toString()}`, message: json.error.message }
				// 	return { data: [{ source: 'KODIK', error: 'ERROR' }], error: 'ERROR' }
				// }
			} else {
				data.push({ source: 'KODIK', error: 'PROVIDER_ERROR' })
			}
		} else {
			data.push({ source: 'KODIK', error: 'NOT_FOUND' })
		}
	} catch (e) {
		console.error('[getKinoboxPlayers] KODIK:', e)
		data.push({ source: 'KODIK', error: 'ERROR' })
	}

	const error: 'ERROR' | null = data.filter(it => 'error' in it && it.error === 'ERROR').length === data.length ? 'ERROR' : null

	return { data, error }
}

export const getReleaseProvider = async (): Promise<null> => {
	return null
}
