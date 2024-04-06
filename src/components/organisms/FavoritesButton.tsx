import { Button } from '@components/atoms'
import { useActions, useTypedSelector } from '@hooks'
import { AddToFavoriteIcon, RemoveFromFavoriteIcon } from '@icons'
import { MovieType } from '@store/kinopoisk'
import { Bookmarks } from '@store/settings'
import { FC } from 'react'
import { useStyles } from 'react-native-unistyles'

interface Props {
	data: { title: string; poster: string | null; year: number | null; id: number | `tt${number}` | `ALLOHA:${string}` | `COLLAPS:${string}` | `KODIK:${string}`; type: MovieType } | { title: string; poster: string | null; id: number; type: 'Person' }
}

export const FavoritesButton: FC<Props> = ({ data }) => {
	const { theme } = useStyles()
	const { mergeItem, removeItemByPath } = useActions()
	const bookmarks = useTypedSelector(state => state.settings.settings.bookmarks[`${data.type}:${data.id}`]) as Bookmarks | undefined

	return (
		<Button
			onPress={async () => {
				const item: Bookmarks = bookmarks ?? { ...data, timestamp: Date.now() }

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
