import Config from 'react-native-config'
import { WatchHistoryProvider } from './settings'

export interface KinoboxPlayersData {
	source: WatchHistoryProvider
	translations: { id: number | null; name: string; quality: string | null; iframeUrl: string }[]
	iframeUrl: string | null
	title?: string
}

interface kinoboxPlayers {
	data: KinoboxPlayersData[] | null
	error: string
	message: string
}

export const getKinoboxPlayers = async ({ id }: { id: number | `tt${number}` }): Promise<kinoboxPlayers> => {
	try {
		// alloha,kodik,collaps,videocdn,hdvb,voidboost
		const res = await fetch(`https://kinobox.tv/api/players?${String(id).startsWith('tt') ? 'imdb' : 'kinopoisk'}=${id}&sources=alloha,kodik,collaps`)

		if (!res.ok) {
			console.log('getKinoboxPlayers:', res)
			return { data: null, error: res.statusText, message: await res.text() }
		}

		let json = await res.json()

		if (Array.isArray(json)) {
			json = {
				success: true,
				data: json.map((it: KinoboxPlayersData) => ({ ...it, source: it.source.toUpperCase() as WatchHistoryProvider })).filter(it => it.iframeUrl !== null)
			}
		} else if (typeof json.statusCode === 'number') {
			json = {
				success: false,
				data: null,
				error: {
					code: json.statusCode,
					message: json.message
				}
			}
		} else {
			json = {
				success: false,
				data: null,
				error: {
					code: 400,
					message: 'Возникла неопознанная ошибка'
				}
			}
		}

		// console.log('json', json)

		if (json.success === false) {
			return { data: null, error: `code: ${json.error.code.toString()}`, message: json.error.message }
		}

		return { data: json.data, error: res.statusText, message: res.statusText }
	} catch (e) {
		return { data: null, error: (e as Error).name, message: (e as Error).message }
	}
}

export const getKodikPlayers = async ({ id }: { id: number | `tt${number}` }, data?: { season?: number | null; episode?: string | null; translation?: { id: number; title: string } | null; lastTime?: number | null }): Promise<kinoboxPlayers> => {
	try {
		const res = await fetch(`https://kodikapi.com/search?${String(id).startsWith('tt') ? 'imdb' : 'kinopoisk'}_id=${id}&token=${Config.KODIK_TOKEN}&with_episodes=true`)

		if (!res.ok) {
			return { data: null, error: res.statusText, message: await res.text() }
		}

		let json = await res.json()

		// console.log('json:', json)

		const resultsArray = json?.results?.map((cur: { title: string; last_season: any }) => {
			const part_match = /(?<=часть\s)\d+/.exec(cur.title)
			const part_number = part_match ? parseInt(part_match[0]) : 0

			const season_match = /(?<=ТВ-)\d+/.exec(cur.title)
			const season_number = season_match ? parseInt(season_match[0]) : cur.last_season ?? 0

			return { ...cur, part_number, season_number }
		})

		if (resultsArray && Array.isArray(resultsArray)) {
			const filteredData = resultsArray.reduce((acc, cur) => {
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

			const item = resultsArray.find((it: { translation: { id: number | undefined }; seasons: { [x: string]: { episodes: any } } }) => it.translation.id === data?.translation?.id && `${data?.season}` in it.seasons && `${data?.episode}` in it.seasons[`${data?.season}`].episodes)

			json = {
				success: true,
				data: sortedData.reverse().map((it: { seasons: any; translation: any; season_number?: number; id: string; quality: any; link: string; part_number: number }) => {
					const isSaved = item && 'season_number' in it && 'season_number' in item && it.season_number === item.season_number // ? 'part_number' in it && 'part_number' in item && it.part_number === item.part_number : false
					const movie = isSaved ? item : it

					const movieLink = !isSaved ? `${movie.link}?episode=1` : `${movie.link}?${[data?.lastTime ? 'start_from=' + data.lastTime : null, typeof data?.episode === 'string' ? 'episode=' + data.episode : null, typeof data?.season === 'number' ? 'season=' + data.season : null].filter(it => !!it).join('&')}`

					return {
						source: `KODIK:${'season_number' in movie ? movie.season_number : movie.id}${movie.part_number > 0 ? '.' + movie.part_number : ''}`,
						title: 'season_number' in movie ? `Сезон ${movie.season_number}${movie.part_number > 0 ? ', часть ' + movie.part_number : ''}` : undefined,
						translations: [{ id: null, name: movie.translation?.title ?? '', quality: movie.quality ?? null, iframeUrl: movieLink.startsWith('//') ? `https:${movieLink}` : movieLink }],
						iframeUrl: movieLink.startsWith('//') ? `https:${movieLink}` : movieLink
					}
				})
			}
		} else {
			json = {
				success: false,
				data: null,
				error: {
					code: 400,
					message: 'Возникла неопознанная ошибка'
				}
			}
		}

		// console.log('kodik json:', json)

		if ('error' in json && typeof json.error === 'string') {
			return { data: null, error: `code: ${json.error.code.toString()}`, message: json.error.message }
		}

		return { data: json.data, error: res.statusText, message: res.statusText }
	} catch (e) {
		return { data: null, error: (e as Error).name, message: (e as Error).message }
	}
}

export const getReleaseProvider = async (): Promise<null> => {
	return null
}
