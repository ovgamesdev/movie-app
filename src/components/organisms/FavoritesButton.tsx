import { Button } from '@components/atoms'
import { useActions, useTypedSelector } from '@hooks'
import { AddToFavoriteIcon, RemoveFromFavoriteIcon } from '@icons'
import { IFilmBaseInfo, IPersonBaseInfoResults, ITvSeriesBaseInfo } from '@store/kinopoisk'
import { Bookmarks } from '@store/settings'
import { FC } from 'react'
import { useStyles } from 'react-native-unistyles'

interface Props {
	data: IFilmBaseInfo | ITvSeriesBaseInfo | IPersonBaseInfoResults
}

export const FavoritesButton: FC<Props> = ({ data }) => {
	const { theme } = useStyles()
	const { mergeItem, removeItemByPath } = useActions()
	const bookmarks = useTypedSelector(state => state.settings.settings.bookmarks[`${data.__typename}:${data.id}`]) as Bookmarks | undefined

	return (
		<Button
			onPress={async () => {
				const item: Bookmarks =
					bookmarks ??
					(data.__typename === 'Person'
						? {
								id: data.id,
								type: data.__typename,
								title: data.name ?? data.originalName,
								poster: data.poster?.avatarsUrl ?? null,
								timestamp: Date.now()
						  }
						: {
								id: data.id,
								type: data.__typename,
								title: data.title.russian ?? data.title.localized ?? data.title.original ?? '',
								poster: data.poster?.avatarsUrl ?? null,
								timestamp: Date.now(),
								year: data.productionYear ?? ('releaseYears' in data ? data.releaseYears[0]?.start : null)
						  })

				if (bookmarks) {
					removeItemByPath(['bookmarks', `${item.type}:${item.id}`])
				} else {
					mergeItem({ bookmarks: { [`${item.type}:${item.id}`]: item } })
				}
			}}>
			{bookmarks ? <RemoveFromFavoriteIcon width={20} height={20} fill={theme.colors.text100} /> : <AddToFavoriteIcon width={20} height={20} fill={theme.colors.text100} />}
		</Button>
	)
}
