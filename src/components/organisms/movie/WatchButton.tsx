import { ActivityIndicator, Button } from '@components/atoms'
import { addItemToContentReleaseNotify, isItemInContentReleaseNotify, removeItemToContentReleaseNotify, useNavigation } from '@hooks'
import { IFilmBaseInfo, ITvSeriesBaseInfo } from '@store/kinopoisk'
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

	const [status, setStatus] = useState<'loading' | 'watch' | 'off-notify' | 'on-notify'>('loading')

	useEffect(() => {
		const init = async () => setStatus((await getProviders(data)) ? 'watch' : (await isItemInContentReleaseNotify(data)) ? 'on-notify' : 'off-notify')

		init()
	}, [])

	return (
		<Button
			text={status === 'loading' ? undefined : status === 'watch' ? 'Смотреть' : status === 'off-notify' ? 'Сообщить когда выйдет' : 'Не сообщать когда выйдет'}
			style={{ minWidth: 54 }}
			onPress={async () => {
				const item = {
					id: data.id,
					name: data.title.russian ?? data.title.localized ?? data.title.original ?? data.title.english ?? '',
					poster: data.poster?.avatarsUrl ?? null,
					type: data.__typename,
					productionYear: data.productionYear
				}

				switch (status) {
					case 'loading':
						break
					case 'watch':
						navigation.navigate('Watch', { data })
						break
					case 'off-notify':
						setStatus('on-notify')
						setStatus((await addItemToContentReleaseNotify(item)) ? 'on-notify' : 'off-notify')
						break
					case 'on-notify':
						setStatus('off-notify')
						setStatus((await removeItemToContentReleaseNotify(data)) ? 'off-notify' : 'on-notify')
						break
				}
			}}>
			{status === 'loading' ? <ActivityIndicator /> : undefined}
		</Button>
	)
}
