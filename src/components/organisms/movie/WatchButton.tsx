import { ActivityIndicator, Button } from '@components/atoms'
import { useActions, useNavigation, useTypedSelector } from '@hooks'
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
	const navigation = useNavigation()
	const { mergeItem, removeItemByPath } = useActions()
	const watchHistory = useTypedSelector(state => state.settings.settings.watchHistory)

	const [status, setStatus] = useState<'loading' | 'watch' | 'off-notify' | 'on-notify'>('loading')

	useEffect(() => {
		// TODO add select provider in settings
		// TODO may-be remove provider
		const init = async () => setStatus((await getProviders(data)) ? 'watch' : (watchHistory[`${data.id}:provider`] as WatchHistory | undefined)?.notify ? 'on-notify' : 'off-notify')

		init()
	}, [])

	return (
		<Button
			text={status === 'loading' ? undefined : status === 'watch' ? 'Смотреть' : status === 'off-notify' ? 'Сообщить когда выйдет' : 'Не сообщать когда выйдет'}
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
						navigation.navigate('Watch', { data: item })
						break
					case 'off-notify':
						setStatus('on-notify')
						mergeItem({ watchHistory: { [`${item.id}:${item.provider}`]: { ...item, notify: true } } })
						break
					case 'on-notify':
						setStatus('off-notify')
						removeItemByPath(['watchHistory', `${item.id}:${item.provider}`])
						break
				}
			}}>
			{status === 'loading' ? <ActivityIndicator /> : undefined}
		</Button>
	)
}
