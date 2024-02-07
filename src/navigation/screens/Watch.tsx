import { ActivityIndicator, Button, Input } from '@components/atoms'
import { useActions, useTypedSelector } from '@hooks'
import { CheckIcon } from '@icons'
import { RootStackParamList } from '@navigation'
import notifee from '@notifee/react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { WatchHistoryProvider } from '@store/settings'
import { isSeries } from '@utils'
import { FC, useEffect, useRef, useState } from 'react'
import { AppState, NativeSyntheticEvent, ScrollView, StatusBar, TVFocusGuideView, Text, TextInputChangeEventData, ToastAndroid, View } from 'react-native'
import Config from 'react-native-config'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useStyles } from 'react-native-unistyles'
import WebView from 'react-native-webview'

type Props = NativeStackScreenProps<RootStackParamList, 'Watch'>

const Loading: FC = () => {
	return (
		<View style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
			<ActivityIndicator size='large' />
		</View>
	)
}

const ERROR_MESSAGE = 'Произошла непредвиденная ошибка, пожалуйста, попробуйте снова позже.'

export interface kinoboxPlayersData {
	source: WatchHistoryProvider
	translation: string | null
	quality: string | null
	iframeUrl: string | null
}

interface kinoboxPlayers {
	data: kinoboxPlayersData[] | null
	error: string
	message: string
}

export const Watch: FC<Props> = ({ navigation, route }) => {
	const { data } = route.params

	const isWatchFullscreen = useRef(false)

	const insets = useSafeAreaInsets()
	const { theme } = useStyles()
	const { mergeItem } = useActions()
	const [providers, setProviders] = useState<kinoboxPlayersData[] | null>(null)
	const [provider, setProvider] = useState<WatchHistoryProvider | null>(null)
	const [error, setError] = useState<{ error: string; message: string } | null>(null)
	const [isLoading, setIsLoading] = useState(true)
	const showDevOptions = useTypedSelector(state => state.settings.settings.showDevOptions)

	useEffect(() => {
		if (provider === null) return

		notifee.cancelNotification(`${data.type}:${data.id}`)

		console.log('watchHistory init', { [`${data.id}`]: { ...data, provider, status: 'watch', timestamp: Date.now() } })
		mergeItem({ watchHistory: { [`${data.id}`]: { ...data, provider, status: 'watch' as const, timestamp: Date.now() } } })

		const lastTime = Math.floor(Math.random() * 200) + 1
		const duration = Math.floor(Math.random() * 500) + lastTime

		setTimeout(() => {
			console.log('watchHistory loaded', { [`${data.id}`]: { lastTime, duration } })
			mergeItem({ watchHistory: { [`${data.id}`]: { lastTime, duration } } })
		}, 10 * 1000)

		const saveWatchStatus = () => {
			const newLastTime = Math.floor(Math.random() * (duration - lastTime)) + lastTime

			console.log('watchHistory end', { [`${data.id}`]: { lastTime: newLastTime } })
			mergeItem({ watchHistory: { [`${data.id}`]: { lastTime: newLastTime } } })
		}

		const subscription = AppState.addEventListener('change', nextAppState => {
			console.log('nextAppState:', nextAppState)

			if (nextAppState === 'background') {
				saveWatchStatus()
			} else if (nextAppState === 'active') {
				if (isWatchFullscreen.current) {
					navigation.setOptions({ orientation: 'landscape', navigationBarHidden: true, statusBarHidden: true })
					StatusBar.setHidden(true) // need
				} else {
					navigation.setOptions({ orientation: 'portrait_up', navigationBarHidden: false, statusBarHidden: false })
					StatusBar.setHidden(false) // need
				}
			}
		})
		return () => {
			subscription.remove()
			saveWatchStatus()
		}
	}, [provider])

	useEffect(() => {
		const getKinoboxPlayers = async ({ id }: { id: number }): Promise<kinoboxPlayers> => {
			try {
				const res = await fetch(`https://kinobox.tv/api/players/main?kinopoisk=${id}&token=${Config.KINOBOX_TOKEN}`)
				// X-Settings: {"Collaps":{"enable":true,"token":"{token}","position":0},"Bazon":{"enable":true,"token":"${Config.KINOBOX_BAZON_TOKEN}"},"Alloha":{"enable":true,"token":"{token}"},"Ashdi":{"enable":true,"token":"{token}"},"Cdnmovies":{"enable":true,"token":"{token}"},"Hdvb":{"enable":true,"token":"{token}"},"Iframe":{"enable":true,"token":"{token}"},"Kodik":{"enable":true,"token":"{token}"},"Videocdn":{"enable":true,"token":"{token}"},"Voidboost":{"enable":true,"token":"{token}"}}

				if (!res.ok) {
					ToastAndroid.show(ERROR_MESSAGE, ToastAndroid.SHORT)
					return { data: null, error: res.statusText, message: await res.text() }
				}

				let json = await res.json()

				if (Array.isArray(json)) {
					json = {
						success: true,
						data: json.map(it => ({ ...it, source: it.source.toUpperCase() }))
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

				console.log('json', json)

				if (json.success === false) {
					ToastAndroid.show(ERROR_MESSAGE, ToastAndroid.SHORT)
					return { data: null, error: `code: ${json.error.code.toString()}`, message: json.error.message }
				}

				return { data: json.data, error: res.statusText, message: res.statusText }
			} catch (e) {
				ToastAndroid.show(ERROR_MESSAGE, ToastAndroid.SHORT)
				return { data: null, error: (e as Error).name, message: (e as Error).message }
			}
		}

		getKinoboxPlayers(data).then(({ data, error, message }) => {
			if (error) {
				setIsLoading(false)
				setError({ error, message })
				return
			}

			if (data && data.length > 0) {
				setProviders(data)
				setProvider(route.params.data.provider ?? data[0]?.source)
			} else {
				setIsLoading(false)
				setError({ error: 'Ошибка', message: 'Видео файл не обнаружен.' })
			}
		})
	}, [])

	const handleProviderChange = (it: kinoboxPlayersData) => {
		setIsLoading(true)
		setProvider(it.source)
	}

	const InputHistory = ({ field, title }: { field: 'fileIndex' | 'releasedEpisodes'; title: string }) => {
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		const value = useTypedSelector(state => state.settings.settings.watchHistory[`${data.id}`]?.[field])
		const onChange = (e: NativeSyntheticEvent<TextInputChangeEventData>) => {
			mergeItem({ watchHistory: { [`${data.id}`]: { [field]: Number(e.nativeEvent.text) } } })
		}

		if (!isSeries(data.type)) return null

		return (
			<View style={{ paddingVertical: 10, gap: 5 }}>
				<Text style={{ color: theme.colors.text100, fontSize: 14 }}>{title}</Text>
				<Input value={value?.toString() ?? ''} placeholder={value === undefined ? 'Нет данных' : ''} onChange={onChange} keyboardType='numeric' />
			</View>
		)
	}

	const run = `
		document.querySelector('head meta[name="viewport"]').setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1');
		["fullscreenchange", "webkitfullscreenchange", "mozfullscreenchange", "msfullscreenchange"].forEach(eventType => document.addEventListener(eventType, e => window.ReactNativeWebView.postMessage(JSON.stringify({isFullscreen:document.fullscreenElement!=null,type:e.type})), false) );

		true;
	`

	const currentProvider = providers && providers.length > 0 ? providers.find(it => it.source === provider) ?? providers[0] : null
	const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1"></head><body><iframe class="kinobox__iframe" seamless allowfullscreen="" frameborder="0" allow="autoplay fullscreen" src="${currentProvider?.iframeUrl}"></iframe><style>.kinobox__iframe { display: block; width: 100%; height: 100%; box-sizing: border-box; } body { margin: 0; padding: 0; width: 100%; height: 100vh; font-size: 16px; color: white; overflow: hidden; color-scheme: dark; background: black; }</style></body></html>`

	console.log('currentProvider', currentProvider?.source, provider)

	return (
		<TVFocusGuideView style={{ flex: 1, marginTop: insets.top }} trapFocusDown trapFocusLeft trapFocusRight trapFocusUp>
			<View style={{ width: '100%', aspectRatio: 16 / 9 }}>
				{currentProvider?.iframeUrl && !error ? (
					<WebView
						source={currentProvider.source !== 'ALLOHA' && currentProvider.source !== 'KODIK' ? { uri: currentProvider.iframeUrl, headers: { referer: 'https://example.com' } } : { html }}
						style={{ flex: 1 }}
						containerStyle={{ backgroundColor: '#000' }}
						injectedJavaScript={run}
						onMessage={({ nativeEvent }) => {
							const { isFullscreen, type } = JSON.parse(nativeEvent.data) as { isFullscreen: boolean; type: string }

							if (['fullscreenchange', 'webkitfullscreenchange', 'mozfullscreenchange', 'msfullscreenchange'].includes(type)) {
								isWatchFullscreen.current = isFullscreen

								if (isFullscreen) {
									navigation.setOptions({ orientation: 'landscape', navigationBarHidden: true, statusBarHidden: true })
									StatusBar.setHidden(true) // need
								} else {
									navigation.setOptions({ orientation: 'portrait_up', navigationBarHidden: false, statusBarHidden: false })
									StatusBar.setHidden(false) // need
								}
							}

							return true
						}}
						allowsFullscreenVideo
						webviewDebuggingEnabled={__DEV__}
						onLoadStart={() => setIsLoading(true)}
						onLoadEnd={() => setIsLoading(false)}
					/>
				) : (
					<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
						<Text style={{ fontSize: 14, color: theme.colors.text100, textAlign: 'center' }}>{error ? error.message : 'Возникла неопознанная ошибка'}</Text>
					</View>
				)}

				{isLoading && <Loading />}
			</View>
			<View style={{ flex: 1 }}>
				<ScrollView contentContainerStyle={{ gap: 6, padding: 10 }}>
					<Text style={{ fontSize: 14, color: theme.colors.text100 }}>Выбор провайдера:</Text>
					<View style={{ gap: 6 }}>
						{currentProvider && providers ? (
							providers.map(it => {
								const isActive = currentProvider.source === it.source

								return (
									<Button key={it.source} flexDirection='row' alignItems='center' onPress={() => handleProviderChange(it)}>
										{isActive && <CheckIcon width={20} height={20} fill={theme.colors.text100} style={{ marginRight: 10 }} />}
										<Text style={{ fontSize: 14, color: theme.colors.text100, flex: 1 }}>
											{it.source} ({[it.translation, it.quality].filter(it => !!it).join(', ')})
										</Text>
									</Button>
								)
							})
						) : (
							<>
								<View style={{ height: 39.333, borderRadius: 6, backgroundColor: theme.colors.bg200 }} />
								<View style={{ height: 39.333, borderRadius: 6, backgroundColor: theme.colors.bg200 }} />
								<View style={{ height: 39.333, borderRadius: 6, backgroundColor: theme.colors.bg200 }} />
								<View style={{ height: 39.333, borderRadius: 6, backgroundColor: theme.colors.bg200 }} />
							</>
						)}
					</View>
					{showDevOptions && (
						<View>
							<InputHistory field='fileIndex' title='fileIndex' />
							<InputHistory field='releasedEpisodes' title='releasedEpisodes' />
						</View>
					)}
				</ScrollView>
			</View>
		</TVFocusGuideView>
	)
}
