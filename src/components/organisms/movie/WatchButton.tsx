import { ActivityIndicator, Button } from '@components/atoms'
import { useActions, useTypedSelector } from '@hooks'
import { navigation } from '@navigation'
import { IFilmBaseInfo, ITvSeriesBaseInfo } from '@store/kinopoisk'
import { WatchHistory } from '@store/settings'
import { useEffect, useState } from 'react'
import Config from 'react-native-config'

// TODO movie to api
const getProviders = async ({ id }: { id: number }): Promise<unknown[] | null> => {
	try {
		const response = await fetch(`https://kinobox.tv/api/players/main?kinopoisk=${id}&token=${Config.KINOBOX_TOKEN}`)
		if (!response.ok) return null
		const json = await response.json()
		if (!Array.isArray(json) || json.length === 0) return null
		return json
	} catch (e) {
		console.error('getProviders error:', e)
		return null
	}
}

export const WatchButton = ({ data }: { data: IFilmBaseInfo | ITvSeriesBaseInfo }) => {
	const { mergeItem, removeItemByPath, isBatteryOptimizationEnabled } = useActions()
	const watchHistory = useTypedSelector(state => state.settings.settings.watchHistory)

	const [status, setStatus] = useState<'loading' | 'watch' | 'continue' | 'off-notify' | 'on-notify'>('loading')

	useEffect(() => {
		const item = watchHistory[`${data.id}`] as WatchHistory | undefined

		const init = async () => setStatus((await getProviders(data)) ? (item ? 'continue' : 'watch') : item?.notify ? 'on-notify' : 'off-notify')

		init()
	}, [])

	return (
		<Button
			text={status === 'loading' ? undefined : status === 'watch' ? 'Смотреть' : status === 'continue' ? 'Продолжить просмотр' : status === 'off-notify' ? 'Сообщить когда выйдет' : 'Не сообщать когда выйдет'}
			style={{ minWidth: 54 }}
			onPress={async () => {
				const item: WatchHistory = {
					id: data.id,
					type: data.__typename,
					title: data.title.russian ?? data.title.localized ?? data.title.original ?? data.title.english ?? '',
					// eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
					year: data.productionYear ?? (('releaseYears' in data && data.releaseYears[0]?.start) || null),
					poster: data.poster?.avatarsUrl ?? null,
					provider: null,
					timestamp: Date.now(),
					status: 'pause'
				}

				switch (status) {
					case 'loading':
						break
					case 'watch':
					case 'continue':
						navigation.navigate('Watch', { data: item })
						break
					case 'off-notify':
						setStatus('on-notify')
						mergeItem({ watchHistory: { [`${item.id}`]: { ...item, notify: true } } })
						isBatteryOptimizationEnabled()
						break
					case 'on-notify':
						setStatus('off-notify')
						removeItemByPath(['watchHistory', `${item.id}`])
						break
				}
			}}>
			{status === 'loading' ? <ActivityIndicator /> : undefined}
		</Button>
	)
}
