import { ActivityIndicator, Button, Input } from '@components/atoms'
import { useActions, useTypedSelector } from '@hooks'
import { CheckIcon } from '@icons'
import { RootStackParamList } from '@navigation'
import notifee from '@notifee/react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { KinoboxPlayersData, getKinoboxPlayers, getKodikPlayers, store } from '@store'
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

export const Watch: FC<Props> = ({ navigation, route }) => {
	const isKPorIMDB = !isNaN(Number(route.params.data.id)) || String(route.params.data.id).startsWith('tt') // number | `tt${number}` | `ALLOHA:${string}` | `COLLAPS:${string}` | `KODIK:${string}`

	const data: WatchHistory | null = (isKPorIMDB ? store.getState().settings.settings.watchHistory[`${route.params.data.id as number}`] ?? null : null) ?? ('provider' in route.params.data ? (route.params.data as WatchHistory) : null)

	const isWatchFullscreen = useRef(false)
	const webViewRef = useRef<WebView>(null)

	const insets = useSafeAreaInsets()
	const { theme } = useStyles()
	const { mergeItem } = useActions()
	const [providers, setProviders] = useState<KinoboxPlayersData[] | null>(null)
	const [provider, setProvider] = useState<WatchHistoryProvider | null>(data?.provider ?? null)
	const [error, setError] = useState<{ error: string; message: string } | null>(null)
	const [isLoading, setIsLoading] = useState(true)
	const showDevOptions = useTypedSelector(state => state.settings.settings.showDevOptions)

	const toggleScreenOrientation = (isFullscreen: boolean) => {
		if (isFullscreen) {
			navigation.setOptions({ orientation: 'landscape', navigationBarHidden: true, statusBarHidden: true })
			StatusBar.setHidden(true) // need
		} else {
			navigation.setOptions({ orientation: 'portrait_up', navigationBarHidden: false, statusBarHidden: false })
			StatusBar.setHidden(false) // need
		}
	}

	useEffect(() => {
		if (provider === null || data === null) return

		notifee.cancelNotification(`${data.type}:${data.id}`)

		const item: Partial<WatchHistory> = {
			...data,
			provider,
			status: 'watch' as const,
			timestamp: Date.now()
		}

		if (!('startTimestamp' in data)) {
			item.startTimestamp = Date.now()
		}

		if (data.provider !== provider && isSeries(data.type)) {
			item.episode = null
			item.season = null
			item.translation = null
			// TODO: reset history with episode and season
			// item.releasedEpisodes = null
			// item.notifyTranslation = null
			console.log('watch change provider:', item)
		}

		mergeItem({ watchHistory: { [`${data.id}`]: item } })

		const subscription = AppState.addEventListener('change', nextAppState => {
			// console.log(`nextAppState: ${nextAppState}`)

			if (nextAppState === 'active') {
				toggleScreenOrientation(isWatchFullscreen.current)
			}
		})
		return subscription.remove
	}, [provider])

	const loadPlayers = useCallback(() => {
		if (data === null) return

		setIsLoading(true)
		setError(null)

		console.log('watch init:', data)

		if (!isKPorIMDB) {
			switch (true) {
				case String(data.id).startsWith('ALLOHA'): {
					const id = String(data.id).split(':')[1]
					const iframeUrl = `https://theatre.newplayjj.com:9443/?token_movie=${id}&token=${Config.ALLOHA_TOKEN}` // TODO change url

					setProviders([{ iframeUrl, source: 'ALLOHA', translations: [] }])
					setProvider('ALLOHA')
					setError(null)
					break
				}
				case String(data.id).startsWith('COLLAPS'): {
					const id = String(data.id).split(':')[1]
					const iframeUrl = `https://api.linktodo.ws/embed/movie/${id}` // TODO change url

					setProviders([{ iframeUrl, source: 'COLLAPS', translations: [] }])
					setProvider('COLLAPS')
					setError(null)
					break
				}
				case String(data.id).startsWith('KODIK'): {
					const id = String(data.id).split(':')[1]

					getKodikPlayers({ id: `KODIK:${id}` }).then(({ data: kodik_data, error, message }) => {
						if (error) {
							setError({ error, message })
							console.error('getKodikPlayers:', { movie: route.params.data, error, message })
						}
						if (kodik_data && kodik_data.length > 0) {
							setProviders(kodik_data.reverse())
							setProvider(provider ?? kodik_data[0]?.source)
							setError(null)
						} else {
							ToastAndroid.show('Ошибка KODIK, пожалуйста, повторите попытку позже.', ToastAndroid.SHORT)
						}
					})
					break
				}
				case true: {
					setError({ error: 'Ошибка', message: 'Видео файл не обнаружен.' })
				}
			}

			return
		}

		getKinoboxPlayers(data).then(({ data, error, message }) => {
			if (error) {
				setIsLoading(false)
				setError({ error, message })
				console.error('getKinoboxPlayers', { movie: route.params.data, data, error, message })
				return
			}

			if (data && data.length > 0) {
				if (data.findIndex(it => it.source === 'KODIK') === -1 || !isSeries(route.params.data.type)) {
					setProviders(data)
					setProvider(provider ?? data[0]?.source)
					setError(null)
				} else {
					const watchHistory = store.getState().settings.settings.watchHistory[`${route.params.data.id as number}`] as WatchHistory | undefined

					getKodikPlayers(route.params.data as { id: number | `KODIK:${string}` | `tt${number}` }, watchHistory).then(({ data: kodik_data, error, message }) => {
						if (error) {
							console.error('getKodikPlayers:', { movie: route.params.data, error, message })
						}
						if (kodik_data && kodik_data.length > 0) {
							setProviders(data.map(it => (it.source === 'KODIK' ? kodik_data.reverse() : it)).flat())
						} else {
							ToastAndroid.show('Ошибка KODIK, пожалуйста, повторите попытку позже.', ToastAndroid.SHORT)
							setProviders(data.filter(it => it.source !== 'KODIK'))
						}
						setProvider(provider ?? data[0]?.source)
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

	// console.log('providers:', providers)

	const handleProviderChange = (it: KinoboxPlayersData) => {
		setIsLoading(true)
		setError(null)

		if (provider === it.source) {
			webViewRef.current?.reload()
		} else {
			setProvider(it.source)
		}
	}

	const InputHistory = ({ field, title }: { field: 'fileIndex' | 'releasedEpisodes'; title: string }) => {
		if (data === null) return
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
		if (data === null) return
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

	const currentProvider = providers && providers.length > 0 && provider !== null ? providers.find(it => it.source.startsWith(provider)) ?? providers[0] : null
	const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1"></head><body><iframe class="kinobox__iframe" seamless allowfullscreen="" frameborder="0" allow="autoplay fullscreen" src="${currentProvider?.iframeUrl}"></iframe><style>.kinobox__iframe { display: block; width: 100%; height: 100%; box-sizing: border-box; } body { margin: 0; padding: 0; width: 100%; height: 100vh; font-size: 16px; color: white; overflow: hidden; color-scheme: dark; background: black; }</style></body></html>`

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
			
			if (${currentProvider?.source.startsWith('COLLAPS')}) {
				document.body.onclick = (e) => window.ReactNativeWebView.postMessage(JSON.stringify({ event: 'click' }));
			}

			// console.log('message:', eventTitle, eventData)
			
			switch (true) {
				// NOTE current_episode === null
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

					if (eventTitle === 'play') {
						window.ReactNativeWebView.postMessage(JSON.stringify({ event: 'play' }));
					}
					if (eventTitle === 'pause') {
						window.ReactNativeWebView.postMessage(JSON.stringify({ event: 'pause' }));
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

					if (eventTitle === 'changeEpisode') {
						window.ReactNativeWebView.postMessage(JSON.stringify({ event: 'current_episode', episode: eventData.episode, season: eventData.season  }));
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

					if (eventTitle === 'kodik_player_current_episode') {
						window.ReactNativeWebView.postMessage(JSON.stringify({ event: 'current_episode', episode: eventData.value.episode === null ? null : eventData.value.episode+'', season: eventData.value.season, translation: eventData.value.translation }));
					}

					if (eventTitle === 'kodik_player_play') {
						window.ReactNativeWebView.postMessage(JSON.stringify({ event: 'play' }));
					}
					if (eventTitle === 'kodik_player_pause') {
						window.ReactNativeWebView.postMessage(JSON.stringify({ event: 'pause' }));
					}

					break;

				case ${currentProvider?.source.startsWith('VIDEOCDN')}:
						// TODO current_episode play|pause
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
					// TODO current_episode play|pause
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

	if (data === null) return null

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
						onMessage={({ nativeEvent }: { nativeEvent: { data: string } }) => {
							try {
								const nativeEventData = JSON.parse(nativeEvent.data)

								if ('event' in nativeEventData) {
									const playerData = nativeEventData as { event: 'new'; time: number; duration: number } | { event: 'ended'; time?: number } | { event: 'time'; time: number; duration: number } | { event: 'time'; time: number } | { event: 'time'; duration: number } | { event: 'current_episode'; episode: string; season: number; translation?: { id: number; title: string } } | { event: 'click' | 'play' | 'pause' }

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
										case 'current_episode': {
											// console.log('playerData:', playerData)

											const item: Partial<WatchHistory> = {
												timestamp: Date.now(),
												episode: playerData.episode,
												season: playerData.season
											}

											if ('translation' in playerData) {
												item.translation = playerData.translation
											}

											mergeItem({ watchHistory: { [`${data.id}`]: item } })
											break
										}
										case 'click':
										case 'play':
										case 'pause':
											toggleScreenOrientation(isWatchFullscreen.current)
											break
									}

									//
								} else if ('isFullscreen' in nativeEventData) {
									const { isFullscreen, type } = nativeEventData as { isFullscreen: boolean; type: string }

									if (['fullscreenchange', 'webkitfullscreenchange', 'mozfullscreenchange', 'msfullscreenchange'].includes(type)) {
										isWatchFullscreen.current = isFullscreen

										toggleScreenOrientation(isFullscreen)
									}
								}
							} catch (e) {
								console.error('WebView onmessage:', e)
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
								const detail = [it.translations[0]?.name, it.translations[0]?.quality].filter(it => !!it).join(', ')

								return (
									<Button key={it.source} flexDirection='row' alignItems='center' onPress={() => handleProviderChange(it)}>
										{isActive && <CheckIcon width={20} height={20} fill={theme.colors.text100} style={{ marginRight: 10 }} />}
										<Text style={{ fontSize: 14, color: theme.colors.text100, flex: 1 }}>
											{watchHistoryProviderToString(it.source)}

											{`${it.title ? `: ${it.title} ` : ' '}${detail.length === 0 ? '' : `(${detail})`}`}
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
