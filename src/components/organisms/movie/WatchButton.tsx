import { ActivityIndicator, Button } from '@components/atoms'
import { useActions, useTypedSelector } from '@hooks'
import { navigation } from '@navigation'
import { getKinoboxPlayers } from '@store'
import { IFilmBaseInfo, ITvSeriesBaseInfo } from '@store/kinopoisk'
import { WatchHistory } from '@store/settings'
import { FC, useEffect, useState } from 'react'

type Status = 'loading' | 'watch' | 'continue' | 'end' | 'off-notify' | 'on-notify'

interface Props {
	data: IFilmBaseInfo | ITvSeriesBaseInfo
}

export const WatchButton: FC<Props> = ({ data }) => {
	const { mergeItem, removeItemByPath, isBatteryOptimizationEnabled } = useActions()
	const watchHistory = useTypedSelector(state => state.settings.settings.watchHistory[`${data.id}`]) as WatchHistory | undefined

	const [providers, setProviders] = useState<unknown[] | null | 'loading'>('loading')

	const status: Status = providers === 'loading' ? 'loading' : providers ? (watchHistory ? (watchHistory.status === 'end' ? 'end' : 'continue') : 'watch') : watchHistory?.notify ? 'on-notify' : 'off-notify'

	useEffect(() => {
		getKinoboxPlayers(data).then(it => setProviders(it.data && it.data.length > 0 ? it.data : null))
	}, [])

	return (
		<Button
			text={status === 'loading' ? undefined : status === 'watch' ? 'Смотреть' : status === 'continue' ? 'Продолжить просмотр' : status === 'end' ? 'Просмотрено' : status === 'off-notify' ? 'Сообщить когда выйдет' : 'Не сообщать когда выйдет'}
			style={{ minWidth: watchHistory ? (watchHistory.status === 'end' ? 110.36 : 170.66) : 84, minHeight: 39.33 }}
			disabled={status === 'loading'}
			paddingVertical={status === 'loading' ? 6.8 : undefined}
			onPress={async () => {
				const item: WatchHistory = watchHistory
					? {
							...watchHistory,
							id: data.id,
							type: data.__typename,
							title: data.title.russian ?? data.title.localized ?? data.title.original ?? data.title.english ?? '',
							// eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
							year: data.productionYear ?? (('releaseYears' in data && data.releaseYears[0]?.start) || null),
							poster: data.poster?.avatarsUrl ?? null
					  }
					: {
							id: data.id,
							type: data.__typename,
							title: data.title.russian ?? data.title.localized ?? data.title.original ?? data.title.english ?? '',
							// eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
							year: data.productionYear ?? (('releaseYears' in data && data.releaseYears[0]?.start) || null),
							poster: data.poster?.avatarsUrl ?? null,
							provider: null,
							startTimestamp: Date.now(),
							timestamp: Date.now(),
							status: 'pause'
					  }

				switch (status) {
					case 'loading':
						break
					case 'watch':
					case 'continue':
					case 'end':
						navigation.navigate('Watch', { data: item })
						break
					case 'off-notify':
						mergeItem({ watchHistory: { [`${item.id}`]: { ...item, notify: true } } })
						isBatteryOptimizationEnabled()
						break
					case 'on-notify':
						removeItemByPath(['watchHistory', `${item.id}`])
						break
				}
			}}>
			{status === 'loading' ? <ActivityIndicator /> : undefined}
		</Button>
	)
}
