import { store } from '@store'
import { IFilmBaseInfo, ITvSeriesBaseInfo } from '@store/kinopoisk'
import { WatchHistory } from '@store/settings'
import { useEffect } from 'react'
import { useActions } from '.'

export const useUpdateWatchHistory = (data: IFilmBaseInfo | ITvSeriesBaseInfo | undefined) => {
	const { mergeItem } = useActions()

	useEffect(() => {
		if (!data) return

		const watchHistory = store.getState().settings.settings.watchHistory[`${data.id}`] as WatchHistory | undefined
		if (!watchHistory) return

		mergeItem({
			watchHistory: {
				[`${data.id}`]: {
					title: data.title.russian ?? data.title.localized ?? data.title.original ?? data.title.english ?? '',
					// eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
					year: data.productionYear ?? (('releaseYears' in data && data.releaseYears[0]?.start) || null),
					poster: data.poster?.avatarsUrl ?? null
				}
			}
		})
	}, [data])
}
