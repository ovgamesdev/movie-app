import { store } from '@store'
import { IFilmBaseInfo, IPersonBaseInfoResults, ITvSeriesBaseInfo } from '@store/kinopoisk'
import { Bookmarks } from '@store/settings'
import { useEffect } from 'react'
import { useActions } from '.'

export const useUpdateBookmarks = (data: IPersonBaseInfoResults | IFilmBaseInfo | ITvSeriesBaseInfo | undefined) => {
	const { mergeItem } = useActions()

	useEffect(() => {
		if (!data) return

		const bookmarks = store.getState().settings.settings.bookmarks[`${data.__typename}:${data.id}`] as Bookmarks | undefined
		if (!bookmarks) return

		const item =
			data.__typename === 'Person'
				? {
						title: data.name ?? data.originalName,
						poster: data.poster?.avatarsUrl ?? null
				  }
				: {
						title: data.title.russian ?? data.title.localized ?? data.title.original ?? '',
						poster: data.poster?.avatarsUrl ?? null,
						year: data.productionYear ?? ('releaseYears' in data ? data.releaseYears[0]?.start : null)
				  }

		mergeItem({ bookmarks: { [`${data.__typename}:${data.id}`]: item } })
	}, [data])
}
