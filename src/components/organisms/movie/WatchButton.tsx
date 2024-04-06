import { ActivityIndicator, Button } from '@components/atoms'
import { useActions, useTypedSelector } from '@hooks'
import { navigation } from '@navigation'
import { getKinoboxPlayers } from '@store'
import { MovieType } from '@store/kinopoisk'
import { WatchHistory } from '@store/settings'
import { FC, useCallback, useEffect, useState } from 'react'

type Status = 'loading' | 'error' | 'watch' | 'continue' | 'end' | 'off-notify' | 'on-notify'

interface Props {
	data: { title: string; poster: string | null; year: number | null; id: number | `tt${number}`; type: MovieType }
}

export const WatchButton: FC<Props> = ({ data }) => {
	const { mergeItem, removeItemByPath, isBatteryOptimizationEnabled } = useActions()
	const watchHistory = useTypedSelector(state => state.settings.settings.watchHistory[`${data.id}`]) as WatchHistory | undefined

	const [providers, setProviders] = useState<unknown[] | null | 'loading' | 'error'>('loading')

	const status: Status = providers === 'loading' ? 'loading' : providers === 'error' ? 'error' : providers ? (watchHistory ? (watchHistory.status === 'end' ? 'end' : 'continue') : 'watch') : watchHistory?.notify ? 'on-notify' : 'off-notify'

	const fetch = useCallback(() => {
		getKinoboxPlayers(data).then(it => setProviders(it.data ? (it.data.length > 0 ? it.data : null) : 'error'))
	}, [])

	useEffect(fetch, [])

	return (
		<Button
			text={status === 'loading' ? undefined : status === 'error' ? 'Ошибка загрузки' : status === 'watch' ? 'Смотреть' : status === 'continue' ? 'Продолжить просмотр' : status === 'end' ? 'Просмотрено' : status === 'off-notify' ? 'Сообщить когда выйдет' : 'Не сообщать когда выйдет'}
			style={{ minWidth: watchHistory ? (watchHistory.status === 'end' ? 110.36 : 170.66) : 84, minHeight: 39.33 }}
			disabled={status === 'loading'}
			paddingVertical={status === 'loading' ? 6.8 : undefined}
			onPress={async () => {
				const item: WatchHistory = watchHistory
					? { ...watchHistory, ...data }
					: {
							...data,
							provider: null,
							startTimestamp: Date.now(),
							timestamp: Date.now(),
							status: 'pause'
					  }

				switch (status) {
					case 'loading':
						break
					case 'error':
						setProviders('loading')
						fetch()
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
