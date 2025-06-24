import { ActivityIndicator, Button, Input } from '@components/atoms'
import { useActions, useTypedSelector } from '@hooks'
import { CheckIcon, ExpandMoreIcon, RefreshIcon } from '@icons'
import { RootStackParamList } from '@navigation'
import notifee from '@notifee/react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { KinoboxPlayersData, getKinoboxPlayers, getKodikPlayers, store } from '@store'
import { WatchHistory, WatchHistoryProvider } from '@store/settings'
import { isSeries, watchHistoryProviderToString } from '@utils'
import React, { FC, memo, useCallback, useEffect, useRef, useState } from 'react'
import { AppState, NativeSyntheticEvent, ScrollView, StatusBar, TVFocusGuideView, Text, TextInputChangeEventData, ToastAndroid, View } from 'react-native'
import Config from 'react-native-config'
import { KeyboardAvoidingView } from 'react-native-keyboard-controller'
import { useSafeAreaFrame, useSafeAreaInsets } from 'react-native-safe-area-context'
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

	const getData = (): WatchHistory | null => {
		return (isKPorIMDB ? store.getState().settings.settings.watchHistory[`${route.params.data.id as number}`] ?? null : null) ?? ('provider' in route.params.data ? (route.params.data as WatchHistory) : null)
	}

	const data: WatchHistory | null = getData()
	const selectedTranslation = useRef<number | null>(data?.translation?.id ?? null)

	const isWatchFullscreen = useRef(false)
	const webViewRef = useRef<WebView>(null)

	const rect = useSafeAreaFrame()
	const insets = useSafeAreaInsets()
	const { theme, breakpoint, styles } = useStyles()
	const { mergeItem } = useActions()
	const [providers, setProviders] = useState<KinoboxPlayersData[] | null>(null)
	const [provider, setProvider] = useState<WatchHistoryProvider | null>(data?.provider ?? null)
	const [error, setError] = useState<{ error: string; message: string } | null>(null)
	const [isLoading, setIsLoading] = useState(true)
	const showDevOptions = useTypedSelector(state => state.settings.settings.showDevOptions)

	const [isTestSite, setIsTestSite] = useState(false)

	const isFullWatch = rect.width / rect.height > 1.4

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
		const data = getData()
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
		const data = getData()
		if (data === null) return

		if (isTestSite) return

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
				if (data.findIndex(it => it.source === 'KODIK') === -1) {
					setProviders(data)
					setProvider(provider ?? data[0]?.source)
					setError(null)
				} else {
					const watchHistory = store.getState().settings.settings.watchHistory[`${route.params.data.id as number}`] as WatchHistory | undefined

					console.log('111: watchHistory', watchHistory)

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

						console.log('111: getKodikPlayers', { kodik_data, error, message })
						setProvider(provider ?? data[0]?.source)
						setError(null)
					})
				}
			} else {
				setIsLoading(false)
				setError({ error: 'Ошибка', message: 'Видео файл не обнаружен.' })
			}
		})
	}, [isTestSite, provider])

	const openMovie = useCallback(() => {
		if (data === null) {
			navigation.replace('Movie', { data: route.params.data })
			return
		}
	}, [navigation])

	useEffect(loadPlayers, [])

	// console.log('providers:', providers)

	const handleProviderChange = (it: KinoboxPlayersData, translation?: number | null) => {
		setIsLoading(true)
		setError(null)

		if (translation) {
			selectedTranslation.current = translation
		}

		if (provider === it.source) {
			setProviders(null)
			loadPlayers()
			// webViewRef.current?.reload()
		} else {
			setProvider(it.source)
		}
	}

	const InputHistory = memo(({ field, title }: { field: 'fileIndex' | 'releasedEpisodes' | 'lastTime' | 'duration'; title: string }) => {
		console.log('update InputHistory')

		if (data === null) return
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		const value = useTypedSelector(state => state.settings.settings.watchHistory[`${data.id}`]?.[field])
		const onChange = (e: NativeSyntheticEvent<TextInputChangeEventData>) => {
			if (!isNaN(Number(e.nativeEvent.text))) mergeItem({ watchHistory: { [`${data.id}`]: { [field]: Number(e.nativeEvent.text) } } })
		}

		if (!isSeries(data.type)) return null

		return (
			<View style={{ paddingVertical: 10, gap: 5 }}>
				<Text style={{ color: theme.colors.text100, fontSize: 14 }}>{title}</Text>
				<Input value={value === undefined ? '' : String(value)} placeholder={value === undefined ? 'Нет данных' : ''} onChange={onChange} keyboardType='numeric' />
			</View>
		)
	})

	const WatchHistory = () => {
		if (data === null) return
		const value = useTypedSelector(state => state.settings.settings.watchHistory[`${data.id}`]) as WatchHistory | undefined

		if (!value) return null

		return (
			<View style={{ paddingVertical: 10, gap: 5 }}>
				<View style={{ flexDirection: 'row' }}>
					<Text style={{ color: theme.colors.text100, fontSize: 14 }}>progress: </Text>
					<Text style={{ color: theme.colors.text100, fontSize: 14 }}>
						{value.lastTime}/{value.duration} ({value.lastTime !== undefined && value.duration !== undefined ? Math.round((value.lastTime / value.duration) * 100) : NaN}%)
					</Text>
				</View>
				<View style={{ flexDirection: 'row' }}>
					<Text style={{ color: theme.colors.text100, fontSize: 14 }}>status: </Text>
					<Text style={{ color: theme.colors.text100, fontSize: 14 }}>{value.status}</Text>
				</View>
				<View style={{ flexDirection: 'row' }}>
					<Text style={{ color: theme.colors.text100, fontSize: 14 }}></Text>
					<Text style={{ color: theme.colors.text100, fontSize: 14 }}>
						{value.provider} | s{value.season}:e{value.episode}
						{value.translation ? ` | [${value.translation.id}](${value.translation.title})` : 'null'}
					</Text>
				</View>
				<View style={{ flexDirection: 'row' }}>
					<Text style={{ color: theme.colors.text100, fontSize: 14 }}>timestamp: </Text>
					<Text style={{ color: theme.colors.text100, fontSize: 14 }}>{new Date(value.timestamp).toLocaleString()}</Text>
				</View>
			</View>
		)
	}

	const getCurrentProvider = (): KinoboxPlayersData | null => {
		// const data = getData()
		const it = providers && providers.length > 0 && provider !== null ? providers.find(it => it.source.startsWith(provider)) ?? providers[0] : null

		if (it) {
			const currentTranslation = it.translations.find(it => it.id === selectedTranslation.current)

			console.log('111:currentTranslation', currentTranslation)

			return {
				...it,
				iframeUrl: currentTranslation?.iframeUrl ?? it.iframeUrl
			}
		}

		return null
	}

	const currentProvider = getCurrentProvider()
	const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1"></head><body><iframe class="kinobox__iframe" seamless allowfullscreen="" frameborder="0" allow="autoplay fullscreen" src="${currentProvider !== null && typeof currentProvider.iframeUrl === 'string' ? (currentProvider.source === 'ALLOHA' ? 'https://theatre.allarknow.online/?' + currentProvider.iframeUrl.split('/?')[1] : currentProvider.iframeUrl) : ''}"></iframe><style>.kinobox__iframe { display: block; width: 100%; height: 100%; box-sizing: border-box; } body { margin: 0; padding: 0; width: 100%; height: 100vh; font-size: 16px; color: white; overflow: hidden; color-scheme: dark; background: black; }</style></body></html>`

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
						window.ReactNativeWebView.postMessage(JSON.stringify({ event: 'new', time: -1, duration: -1 }));
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
						window.ReactNativeWebView.postMessage(JSON.stringify({ event: 'new', time: -1, duration: -1 }));
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
						window.ReactNativeWebView.postMessage(JSON.stringify({ event: 'new', time: -1, duration: -1 }));
					}

					if (eventTitle === 'kodik_player_duration_update') {
						window.ReactNativeWebView.postMessage(JSON.stringify({ event: 'time', time: -1, duration: Math.round(eventData.value) }));
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
						setTimeout(() => window.ReactNativeWebView.postMessage(JSON.stringify({ event: 'new', time: -1, duration: -1 })), 250);
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
						window.ReactNativeWebView.postMessage(JSON.stringify({ event: 'new', time: -1, duration: -1 }));
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

	console.log('update Watch:', { data, params: route.params, provider })

	return (
		<TVFocusGuideView style={{ flex: 1, marginTop: insets.top }} trapFocusDown trapFocusLeft trapFocusRight trapFocusUp>
			<View style={[{ width: '100%' }, isFullWatch ? { flex: 1 } : isTestSite ? { aspectRatio: 1.565217391304348 } : { aspectRatio: 16 / 9 }]}>
				{data !== null && currentProvider?.iframeUrl && !error ? (
					<WebView
						source={isTestSite ? { uri: 'https://tapeop.dev/' } : currentProvider.source !== 'ALLOHA' && !currentProvider.source.startsWith('KODIK') ? { uri: currentProvider.iframeUrl, headers: { referer: 'https://example.com' } } : { html }}
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
												if (typeof playerData.translation?.id === 'number') {
													selectedTranslation.current = playerData.translation.id
												}
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
						webviewDebuggingEnabled
						// onLoadStart={() => isTestSite && setIsLoading(true)}
						onLoadEnd={() => {
							setIsLoading(false)

							if (isKPorIMDB) {
								webViewRef.current?.injectJavaScript(
									`${
										isTestSite
											? `init({'${String(data.id).startsWith('tt') ? 'imdb' : 'kinopoisk'}': '${data.id}',"title": '${data.title}'})

									const style = document.createElement('style');
									document.head.append(style);
									style.textContent = '#container{min-height:100px!important;padding:0!important}#footer,#header{display:none!important}#player{overflow:unset!important;border-radius:0!important}'
									`
											: ''
									}`
								)
							}
						}}
						onError={() => {
							setIsLoading(false)
							setError({ error: 'Ошибка', message: 'Не удалось открыть веб-страницу' })
						}}
					/>
				) : (
					<View style={{ flex: 1, backgroundColor: '#000' }}>
						<Button onPress={data === null ? openMovie : loadPlayers} hasTVPreferredFocus flex={1} style={{ flex: 1 }} transparent alignItems='center' justifyContent='center' paddingVertical={5} paddingHorizontal={20}>
							<Text style={{ fontSize: 14, color: theme.colors.primary300, paddingBottom: 10 }}>{error ? error.message : data === null ? 'Не найдено в истории просмотров' : 'Возникла неопознанная ошибка'}</Text>
							<Text style={{ fontSize: 14, color: theme.colors.primary300 }}>{data === null ? 'Нажмите, чтобы открыть' : 'Нажмите, чтобы обновить'}</Text>
						</Button>
					</View>
				)}

				{isLoading && data !== null && <Loading />}
			</View>

			{/* TODO: ? 25 */}
			{!isFullWatch && (
				<KeyboardAvoidingView behavior='padding' keyboardVerticalOffset={25} style={{ flex: 1 }} contentContainerStyle={{ flex: 1 }}>
					<ScrollView style={{ flex: 1 }} contentContainerStyle={{ gap: 6, padding: 10, paddingBottom: 10 + insets.bottom }}>
						<Text style={{ fontSize: 14, color: theme.colors.text100 }}>Выбор провайдера:</Text>
						<View style={{ gap: 6 }}>
							<View style={{ flexDirection: 'row', gap: 6 }}>
								<Button flexDirection='row' disabled={!isKPorIMDB} flex={1} onPress={() => (setIsLoading(true), setIsTestSite(isTestSite => !isTestSite))}>
									{isTestSite && <CheckIcon width={20} height={20} fill={theme.colors.text100} style={{ marginRight: 10 }} />}
									<Text style={{ fontSize: 14, color: theme.colors.text100 }}>https://tapeop.dev/</Text>
								</Button>
								{isTestSite && (
									<Button onPress={() => webViewRef.current?.reload()}>
										<RefreshIcon width={18} height={18} fill={theme.colors.text100} />
									</Button>
								)}
							</View>
							{!isTestSite && <SelectProvider data={data} currentProvider={currentProvider} providers={providers} onProviderChange={handleProviderChange} />}
						</View>
						{showDevOptions && (
							<View>
								<WatchHistory />
								<InputHistory field='fileIndex' title='fileIndex' />
								<InputHistory field='releasedEpisodes' title='releasedEpisodes' />
								<InputHistory field='lastTime' title='lastTime' />
								<InputHistory field='duration' title='duration' />
							</View>
						)}
					</ScrollView>
				</KeyboardAvoidingView>
			)}
		</TVFocusGuideView>
	)
}

const SelectProvider: FC<{ data: WatchHistory | null; currentProvider: KinoboxPlayersData | null; providers: KinoboxPlayersData[] | null; onProviderChange: (it: KinoboxPlayersData, translation?: number | null) => void }> = ({ data, currentProvider, providers, onProviderChange }) => {
	const { theme, breakpoint, styles } = useStyles()

	const [isCollapsTranslation, setIsCollapsTranslation] = useState<null | WatchHistoryProvider>(null)

	const watchHistory = useTypedSelector(state => state.settings.settings.watchHistory[`${data?.id ?? 0}`]) as WatchHistory | undefined

	if (!(currentProvider && providers)) {
		return (
			<>
				<View style={{ height: 39.333, borderRadius: 6, backgroundColor: theme.colors.bg200 }} />
				<View style={{ height: 39.333, borderRadius: 6, backgroundColor: theme.colors.bg200 }} />
				<View style={{ height: 39.333, borderRadius: 6, backgroundColor: theme.colors.bg200 }} />
				<View style={{ height: 39.333, borderRadius: 6, backgroundColor: theme.colors.bg200 }} />
			</>
		)
	}

	return providers.map(it => {
		const isActive = currentProvider.source === it.source
		const detail = [it.translations[0]?.name, it.translations[0]?.quality].filter(it => !!it).join(', ')

		return (
			<Button key={it.source} onPress={() => (isCollapsTranslation === it.source ? setIsCollapsTranslation(null) : onProviderChange(it))}>
				<View style={{ flexDirection: 'row', alignItems: 'center' }}>
					{isActive && <CheckIcon width={20} height={20} fill={theme.colors.text100} style={{ marginRight: 10 }} />}
					<Text style={{ fontSize: 14, color: theme.colors.text100, flex: 1 }}>
						{watchHistoryProviderToString(it.source)}

						{`${it.title ? `: ${it.title} ` : ' '}${detail.length === 0 ? '' : `(${detail})`}`}
					</Text>
					<Button buttonColor='transparent' onPress={() => setIsCollapsTranslation(isCollapsTranslation => (isCollapsTranslation === it.source ? null : it.source))}>
						<ExpandMoreIcon width={18} height={18} fill={theme.colors.text100} rotation={isCollapsTranslation === it.source ? 180 : 0} />
					</Button>
				</View>
				{isCollapsTranslation === it.source && (
					<View>
						{it.translations.map(translation => {
							const isActive = watchHistory?.translation?.id === translation.id
							return (
								<Button buttonColor='transparent' flexDirection='row' alignItems='center' onPress={() => (onProviderChange(it, translation.id), setIsCollapsTranslation(null))}>
									{isActive && <CheckIcon width={20} height={20} fill={theme.colors.text100} style={{ marginRight: 10 }} />}
									<Text style={{ fontSize: 14, color: theme.colors[isActive ? 'text100' : 'text200'], flex: 1 }}>{translation.name ?? `${['—', translation.quality].filter(it => !!it).join(', ')}`}</Text>
								</Button>
							)
						})}
					</View>
				)}
			</Button>
		)
	})
}
