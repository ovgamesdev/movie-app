import { ActivityIndicator, Button, Input } from '@components/atoms'
import { useActions, useTypedSelector } from '@hooks'
import { CheckIcon } from '@icons'
import { RootStackParamList } from '@navigation'
import notifee from '@notifee/react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { WatchHistory, WatchHistoryProvider } from '@store/settings'
import { isSeries, watchHistoryProviderToString } from '@utils'
import { FC, useCallback, useEffect, useRef, useState } from 'react'
import { AppState, KeyboardAvoidingView, NativeSyntheticEvent, ScrollView, StatusBar, TVFocusGuideView, Text, TextInputChangeEventData, ToastAndroid, View } from 'react-native'
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
	title?: string
}

interface kinoboxPlayers {
	data: kinoboxPlayersData[] | null
	error: string
	message: string
}

export const Watch: FC<Props> = ({ navigation, route }) => {
	const { data } = route.params

	const isWatchFullscreen = useRef(false)
	const webViewRef = useRef<WebView>(null)

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

		const subscription = AppState.addEventListener('change', nextAppState => {
			console.log('nextAppState:', nextAppState)

			if (nextAppState === 'active') {
				if (isWatchFullscreen.current) {
					navigation.setOptions({ orientation: 'landscape', navigationBarHidden: true, statusBarHidden: true })
					StatusBar.setHidden(true) // need
				} else {
					navigation.setOptions({ orientation: 'portrait_up', navigationBarHidden: false, statusBarHidden: false })
					StatusBar.setHidden(false) // need
				}
			}
		})
		return subscription.remove
	}, [provider])

	const loadPlayers = useCallback(() => {
		setIsLoading(true)
		setError(null)

		const getKinoboxPlayers = async ({ id }: { id: number | `tt${number}` }): Promise<kinoboxPlayers> => {
			try {
				const res = await fetch(`https://kinobox.tv/api/players/main?${String(id).startsWith('tt') ? 'imdb' : 'kinopoisk'}=${id}&token=${Config.KINOBOX_TOKEN}`)
				// X-Settings: {"Collaps":{"enable":true,"token":"{token}","position":0},"Bazon":{"enable":true,"token":"${Config.KINOBOX_BAZON_TOKEN}"},"Alloha":{"enable":true,"token":"{token}"},"Ashdi":{"enable":true,"token":"{token}"},"Cdnmovies":{"enable":true,"token":"{token}"},"Hdvb":{"enable":true,"token":"{token}"},"Iframe":{"enable":true,"token":"{token}"},"Kodik":{"enable":true,"token":"{token}"},"Videocdn":{"enable":true,"token":"{token}"},"Voidboost":{"enable":true,"token":"{token}"}}

				if (!res.ok) {
					ToastAndroid.show(ERROR_MESSAGE, ToastAndroid.SHORT)
					return { data: null, error: res.statusText, message: await res.text() }
				}

				let json = await res.json()

				if (Array.isArray(json)) {
					json = {
						success: true,
						data: (
							await Promise.all(
								json.map(async (it): Promise<kinoboxPlayersData | null> => {
									// NOTE remove 'movie/50862' from results
									const isLoadingCollaps: boolean = it.iframeUrl.endsWith('movie/50862')

									if (isLoadingCollaps) {
										const response = await fetch(`https://api.bhcesh.me/franchise/details?token=${Config.COLLAPS_TOKEN}&${String(id).startsWith('tt') ? 'imdb_id' : 'kinopoisk_id'}=${String(id).startsWith('tt') ? String(id).replace('tt', '') : id}`)
										const json = await response.json()

										if (response.ok && !('status' in json) && 'id' in json) {
											return { ...it, source: it.source.toUpperCase(), translation: json.voiceActing[0] ?? null, quality: json.quality ?? null, iframeUrl: json.iframe_url }
										} else {
											return null
										}
									}

									return { ...it, source: it.source.toUpperCase() }
								})
							)
						).filter(it => !!it)
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

		const getKodikPlayers = async ({ id }: { id: number | `tt${number}` }): Promise<kinoboxPlayers> => {
			try {
				const res = await fetch(`https://kodikapi.com/search?${String(id).startsWith('tt') ? 'imdb' : 'kinopoisk'}_id=${id}&token=${Config.KODIK_TOKEN}`)

				if (!res.ok) {
					// ToastAndroid.show(ERROR_MESSAGE, ToastAndroid.SHORT)
					return { data: null, error: res.statusText, message: await res.text() }
				}

				let json = await res.json()

				const resultsArray = json?.results
				if (resultsArray && Array.isArray(resultsArray)) {
					json = {
						success: true,
						data: resultsArray
							.filter((value, index, self) => self.findIndex(it => it.last_season === value.last_season) === index)
							.map(it => ({
								source: `KODIK:${'last_season' in it ? it.last_season : it.id}`,
								title: 'last_season' in it ? `Сезон ${it.last_season}` : undefined,
								translation: null, // it.translation?.title ?? null,
								quality: it.quality ?? null,
								iframeUrl: it.link.startsWith('//') ? `https:${it.link}` : it.link
							}))
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

				console.log('kodik json:', json)

				if ('error' in json && typeof json.error === 'string') {
					// ToastAndroid.show(ERROR_MESSAGE, ToastAndroid.SHORT)
					return { data: null, error: `code: ${json.error.code.toString()}`, message: json.error.message }
				}

				return { data: json.data, error: res.statusText, message: res.statusText }
			} catch (e) {
				// ToastAndroid.show(ERROR_MESSAGE, ToastAndroid.SHORT)
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
				if (data.findIndex(it => it.source === 'KODIK') === -1 || !isSeries(route.params.data.type)) {
					setProviders(data)
					setProvider(provider ?? route.params.data.provider ?? data[0]?.source)
					setError(null)
				} else {
					getKodikPlayers(route.params.data).then(({ data: kodik_data, error, message }) => {
						if (kodik_data && kodik_data.length > 0) {
							setProviders(data.map(it => (it.source === 'KODIK' ? kodik_data.reverse() : it)).flat())
						} else {
							ToastAndroid.show('Ошибка KODIK, пожалуйста, повторите попытку позже.', ToastAndroid.SHORT)
							setProviders(data.filter(it => it.source !== 'KODIK'))
						}
						setProvider(provider ?? route.params.data.provider ?? data[0]?.source)
						setError(null)
					})
				}
			} else {
				setIsLoading(false)
				setError({ error: 'Ошибка', message: 'Видео файл не обнаружен.' })
			}
		})
	}, [provider])

	useEffect(loadPlayers, [])

	const handleProviderChange = (it: kinoboxPlayersData) => {
		setIsLoading(true)
		setError(null)

		if (provider === it.source) {
			webViewRef.current?.reload()
		} else {
			setProvider(it.source)
		}
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

	const WatchHistory = () => {
		const value = useTypedSelector(state => state.settings.settings.watchHistory[`${data.id}`]) as WatchHistory | undefined

		if (!value) return null

		return (
			<View style={{ paddingVertical: 10, gap: 5 }}>
				<View style={{ flexDirection: 'row' }}>
					<Text style={{ color: theme.colors.text100, fontSize: 14 }}>duration:</Text>
					<Text style={{ color: theme.colors.text100, fontSize: 14 }}>{value.duration}</Text>
				</View>
				<View style={{ flexDirection: 'row' }}>
					<Text style={{ color: theme.colors.text100, fontSize: 14 }}>lastTime:</Text>
					<Text style={{ color: theme.colors.text100, fontSize: 14 }}>{value.lastTime}</Text>
				</View>
				<View style={{ flexDirection: 'row' }}>
					<Text style={{ color: theme.colors.text100, fontSize: 14 }}>status:</Text>
					<Text style={{ color: theme.colors.text100, fontSize: 14 }}>{value.status}</Text>
				</View>
				<View style={{ flexDirection: 'row' }}>
					<Text style={{ color: theme.colors.text100, fontSize: 14 }}>timestamp:</Text>
					<Text style={{ color: theme.colors.text100, fontSize: 14 }}>{new Date(value.timestamp).toLocaleString()}</Text>
				</View>
			</View>
		)
	}

	const currentProvider = providers && providers.length > 0 ? providers.find(it => it.source === provider) ?? providers[0] : null
	const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1"></head><body><iframe class="kinobox__iframe" seamless allowfullscreen="" frameborder="0" allow="autoplay fullscreen" src="${currentProvider?.iframeUrl}"></iframe><style>.kinobox__iframe { display: block; width: 100%; height: 100%; box-sizing: border-box; } body { margin: 0; padding: 0; width: 100%; height: 100vh; font-size: 16px; color: white; overflow: hidden; color-scheme: dark; background: black; }</style></body></html>`

	console.log('currentProvider', currentProvider?.source, provider)

	const run = `
		document.querySelector('head meta[name="viewport"]').setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1');
		["fullscreenchange", "webkitfullscreenchange", "mozfullscreenchange", "msfullscreenchange"].forEach(eventType => document.addEventListener(eventType, e => window.ReactNativeWebView.postMessage(JSON.stringify({isFullscreen:document.fullscreenElement!=null,type:e.type})), false) );

		let SENT_TIME = 15000;
		let lastSentTime = 0;
		let timer = null;

		function ReactNativeWebViewPostMessage(data) {
			window.ReactNativeWebView.postMessage(data);

			lastSentTime = Date.now();
			clearTimeout(timer);
		}

		function ReactNativeWebViewPostMessageTimer(data) {
			const elapsedTime = Date.now() - lastSentTime;
			if (elapsedTime > SENT_TIME) {
				ReactNativeWebViewPostMessage(data);
			} else {
				const remainingTime = SENT_TIME - elapsedTime;
				if (timer) {
					clearTimeout(timer);
				}
				timer = setTimeout(() => ReactNativeWebViewPostMessage(data), remainingTime);
			}
		}

		window.addEventListener("message", (event) => {
			const eventTitle = event.data.event ?? event.data.key;
			const eventData = event.data;
			
			switch (true) {
				case ${currentProvider?.source.startsWith('ALLOHA')}:
					if (eventTitle === 'inited') {
						window.ReactNativeWebView.postMessage(JSON.stringify({ event: 'new', time: 0, duration: 100 }));
					}

					if ((eventTitle === 'time' || eventTitle === 'duration') && eventData.duration !== 0) {
						ReactNativeWebViewPostMessageTimer(JSON.stringify({ event: 'time', time: Math.round(eventData.time), duration: Math.round(eventData.duration) }));
					}

					if (eventTitle === 'ended') {
						window.ReactNativeWebView.postMessage(JSON.stringify({ event: 'ended', time: Math.round(eventData.time) }));
					}

					break;

				case ${currentProvider?.source.startsWith('COLLAPS')}:
					if (eventTitle === 'startWatching') {
						window.ReactNativeWebView.postMessage(JSON.stringify({ event: 'new', time: 0, duration: 100 }));
					}

					if (eventTitle === 'viewProgress') {
						window.ReactNativeWebView.postMessage(JSON.stringify({ event: 'time', time: Math.round(eventData.time), duration: Math.round(eventData.duration) }));
					}

					if (eventTitle === 'ended') {
						window.ReactNativeWebView.postMessage(JSON.stringify({ event: 'ended' }));
					}

					break;

				case ${currentProvider?.source.startsWith('KODIK')}:
					if (eventTitle === 'inited') {
						window.ReactNativeWebView.postMessage(JSON.stringify({ event: 'new', time: 0, duration: 100 }));
					}

					if (eventTitle === 'kodik_player_duration_update') {
						window.ReactNativeWebView.postMessage(JSON.stringify({ event: 'time', time: 0, duration: Math.round(eventData.value) }));
					}
					if (eventTitle === 'kodik_player_time_update') {
						ReactNativeWebViewPostMessageTimer(JSON.stringify({ event: 'time', time: Math.round(eventData.value) }));
					}

					if (eventTitle === 'ended') {
						window.ReactNativeWebView.postMessage(JSON.stringify({event: 'ended', time: Math.round(eventData.time) }));
					}

					break;

				case ${currentProvider?.source.startsWith('VIDEOCDN')}:
					if (eventTitle === 'new') {
						setTimeout(() => window.ReactNativeWebView.postMessage(JSON.stringify({ event: 'new', time: 0, duration: 100 })), 250);
					}

					if (eventTitle === 'time' || eventTitle === 'duration') {
						ReactNativeWebViewPostMessageTimer(JSON.stringify({ event: 'time', time: Math.round(eventData.time), duration: Math.round(eventData.duration) }));
					}

					if (eventTitle === 'ended') {
						window.ReactNativeWebView.postMessage(JSON.stringify({ event: 'ended', time: Math.round(eventData.time) }));
					}

					break;

				case ${currentProvider?.source.startsWith('HDVB')}:
					if (eventTitle === 'new') {
						window.ReactNativeWebView.postMessage(JSON.stringify({ event: 'new', time: 0, duration: 100 }));
					}

					if ((eventTitle === 'time' || eventTitle === 'duration') && eventData.duration !== 0) {
						ReactNativeWebViewPostMessageTimer(JSON.stringify({ event: 'time', time: Math.round(eventData.time), duration: Math.round(eventData.duration) }));
					}

					if (eventTitle === 'ended') {
						window.ReactNativeWebView.postMessage(JSON.stringify({ event: 'ended', time: Math.round(eventData.time) }));
					}

					break;

				// TODO 
				case ${currentProvider?.source.startsWith('VOIDBOOST')}:
					break;
			}

		});

		true;
	`

	return (
		<TVFocusGuideView style={{ flex: 1, marginTop: insets.top }} trapFocusDown trapFocusLeft trapFocusRight trapFocusUp>
			<View style={{ width: '100%', aspectRatio: 16 / 9 }}>
				{currentProvider?.iframeUrl && !error ? (
					<WebView
						source={currentProvider.source !== 'ALLOHA' && !currentProvider.source.startsWith('KODIK') ? { uri: currentProvider.iframeUrl, headers: { referer: 'https://example.com' } } : { html }}
						style={{ flex: 1 }}
						ref={webViewRef}
						containerStyle={{ backgroundColor: '#000' }}
						injectedJavaScript={run}
						onMessage={({ nativeEvent }) => {
							try {
								const nativeEventData = JSON.parse(nativeEvent.data)

								if ('event' in nativeEventData) {
									const playerData = nativeEventData as { event: 'new'; time: number; duration: number } | { event: 'ended'; time?: number } | { event: 'time'; time: number; duration: number } | { event: 'time'; time: number } | { event: 'time'; duration: number }

									switch (playerData.event) {
										case 'new': {
											// console.log('playerData:', playerData)

											const item: Partial<WatchHistory> = {
												status: 'watch' as const,
												timestamp: Date.now(),
												lastTime: playerData.time,
												duration: playerData.duration
											}

											mergeItem({ watchHistory: { [`${data.id}`]: item } })

											break
										}
										case 'time': {
											// console.log('playerData:', playerData)

											const item: Partial<WatchHistory> = {
												timestamp: Date.now()
											}

											if ('time' in playerData) {
												item.lastTime = playerData.time
											}
											if ('duration' in playerData) {
												item.duration = playerData.duration
											}

											mergeItem({ watchHistory: { [`${data.id}`]: item } })
											break
										}
										case 'ended': {
											// console.log('playerData:', playerData)

											if (!isSeries(data.type)) {
												mergeItem({ watchHistory: { [`${data.id}`]: { status: 'end' as const, timestamp: Date.now() } } })
												// TODO test notify
												// if (item.notify) newWatchHistoryData.notify = false
											} else {
												mergeItem({ watchHistory: { [`${data.id}`]: { timestamp: Date.now() } } })
											}

											break
										}
									}

									//
								} else if ('isFullscreen' in nativeEventData) {
									const { isFullscreen, type } = nativeEventData as { isFullscreen: boolean; type: string }

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
								}
							} catch (e) {
								console.error('[error] WebView onmessage:', e)
							}

							return true
						}}
						allowsFullscreenVideo
						webviewDebuggingEnabled={__DEV__}
						onLoadStart={() => setIsLoading(true)}
						onLoadEnd={() => setIsLoading(false)}
						onError={() => {
							setIsLoading(false)
							setError({ error: 'Ошибка', message: 'Не удалось открыть веб-страницу' })
						}}
					/>
				) : (
					<View style={{ flex: 1, backgroundColor: '#000' }}>
						<Button onPress={loadPlayers} hasTVPreferredFocus flex={1} style={{ flex: 1 }} transparent alignItems='center' justifyContent='center' paddingVertical={5} paddingHorizontal={20}>
							<Text style={{ fontSize: 14, color: theme.colors.primary300, paddingBottom: 10 }}>{error ? error.message : 'Возникла неопознанная ошибка'}</Text>
							<Text style={{ fontSize: 14, color: theme.colors.primary300 }}>Нажмите, чтобы обновить</Text>
						</Button>
					</View>
				)}

				{isLoading && <Loading />}
			</View>
			<KeyboardAvoidingView behavior='padding' style={{ flex: 1 }}>
				<ScrollView contentContainerStyle={{ gap: 6, padding: 10, paddingBottom: 10 + insets.bottom }}>
					<Text style={{ fontSize: 14, color: theme.colors.text100 }}>Выбор провайдера:</Text>
					<View style={{ gap: 6 }}>
						{currentProvider && providers ? (
							providers.map(it => {
								const isActive = currentProvider.source === it.source

								return (
									<Button key={it.source} flexDirection='row' alignItems='center' onPress={() => handleProviderChange(it)}>
										{isActive && <CheckIcon width={20} height={20} fill={theme.colors.text100} style={{ marginRight: 10 }} />}
										<Text style={{ fontSize: 14, color: theme.colors.text100, flex: 1 }}>
											{watchHistoryProviderToString(it.source)}

											{`${it.title ? `: ${it.title} ` : ' '}(${[it.translation, it.quality].filter(it => !!it).join(', ')})`}
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
							<WatchHistory />
							<InputHistory field='fileIndex' title='fileIndex' />
							<InputHistory field='releasedEpisodes' title='releasedEpisodes' />
						</View>
					)}
				</ScrollView>
			</KeyboardAvoidingView>
		</TVFocusGuideView>
	)
}
