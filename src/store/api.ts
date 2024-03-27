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

export const getKodikPlayers = async ({ id }: { id: number | `tt${number}` }): Promise<kinoboxPlayers> => {
	try {
		const res = await fetch(`https://kodikapi.com/search?${String(id).startsWith('tt') ? 'imdb' : 'kinopoisk'}_id=${id}&token=${Config.KODIK_TOKEN}`)

		if (!res.ok) {
			return { data: null, error: res.statusText, message: await res.text() }
		}

		let json = await res.json()

		const resultsArray = json?.results
		if (resultsArray && Array.isArray(resultsArray)) {
			const filteredData = resultsArray.reduce((acc, cur) => {
				const part_match = cur.title.match(/(?<=часть\s)\d+/)
				const part_number = part_match ? parseInt(part_match[0]) : 0

				const season_match = cur.title.match(/(?<=ТВ-)\d+/)
				const season_number = season_match ? parseInt(season_match[0]) : cur.last_season ?? 0

				const existingItem = acc.find((item: { part_number: number; season_number: number }) => item.season_number === season_number && item.part_number === part_number)

				if (!existingItem) {
					acc.push({ season_number, part_number, ...cur })
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

			json = {
				success: true,
				data: sortedData.reverse().map((it: { translation: any; season_number?: number; id: string; quality: any; link: string; part_number: number }) => ({
					source: `KODIK:${'season_number' in it ? it.season_number : it.id}${it.part_number > 0 ? '.' + it.part_number : ''}`,
					title: 'season_number' in it ? `Сезон ${it.season_number}${it.part_number > 0 ? ', часть ' + it.part_number : ''}` : undefined,
					translations: [{ id: null, name: it.translation?.title ?? '', quality: it.quality ?? null, iframeUrl: it.link.startsWith('//') ? `https:${it.link}` : it.link }],
					iframeUrl: it.link.startsWith('//') ? `https:${it.link}` : it.link
				}))
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
