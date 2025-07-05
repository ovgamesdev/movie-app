import { Button } from '@components/atoms'
import { useActions, useTypedSelector } from '@hooks'
import { DownloadIcon, ShareIcon, UpgradeIcon } from '@icons'
import { errorCodes, isErrorWithCode, keepLocalCopy, pick, saveDocuments, types } from '@react-native-documents/picker'
import { useRef, type FC } from 'react'
import { Alert, ScrollView, Text, ToastAndroid, View } from 'react-native'
import RNFetchBlob from 'react-native-blob-util'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Share, { ShareOptions } from 'react-native-share'
import { useStyles } from 'react-native-unistyles'

// function base64ToUint8Array(base64: string) {
// 	try {
// 		const binaryString = RNFetchBlob.base64.decode(base64) // Decode base64
// 		const len = binaryString.length
// 		const bytes = new Uint8Array(len)
// 		for (let i = 0; i < len; i++) {
// 			bytes[i] = binaryString.charCodeAt(i)
// 		}
// 		return bytes //<<==bytes is the blob which is to be used directly in fetch PUT
// 	} catch (err) {
// 		return null
// 	}
// }

export const Backup: FC = () => {
	const insets = useSafeAreaInsets()
	const { theme } = useStyles()

	const settings = useTypedSelector(state => state.settings)
	const { restoreSettings } = useActions()

	const fileViewRef = useRef<ScrollView>(null)

	const removeTempFile = async (path: string) => {
		try {
			await RNFetchBlob.fs.unlink(path)

			console.log('Успешное удаление файла', path)
		} catch (e) {
			console.error('Ошибка удаления файла', path, e)
		}
	}

	const handleDownload = async () => {
		const fileName = `movieapp_${new Date().toJSON().split('.')[0]}.json`
		const path = `${RNFetchBlob.fs.dirs.DownloadDir}/${fileName}`
		const settingsString = JSON.stringify(settings)

		console.log('path:', path)

		RNFetchBlob.fs
			.writeFile(path, settingsString, 'utf8')
			.then(async () => {
				console.log('Saved to', path)

				try {
					const [{ uri: targetUri, error, name }] = await saveDocuments({
						sourceUris: [`file://${path}`],
						copy: false,
						mimeType: types.json,
						fileName
					})

					if (error === null) {
						ToastAndroid.show(`Успешно сохранено как "${name}".`, ToastAndroid.SHORT)
					} else {
						ToastAndroid.show(`Ошибка сохранения "${error}".`, ToastAndroid.SHORT)
					}

					console.log('saveDocuments:', targetUri, error, name)
				} catch (err) {
					if (isErrorWithCode(err)) {
						switch (err.code) {
							case errorCodes.OPERATION_CANCELED:
								console.log('ОПЕРАЦИЯ_ОТМЕНЕНА')
								break
							case errorCodes.IN_PROGRESS:
								console.warn('В_ПРОЦЕССЕ.')
								ToastAndroid.show(`В_ПРОЦЕССЕ`, ToastAndroid.SHORT)
								break
							case errorCodes.UNABLE_TO_OPEN_FILE_TYPE:
								console.warn('НЕВОЗМОЖНО_ОТКРЫТЬ_ТИП_ФАЙЛА.')
								ToastAndroid.show(`НЕВОЗМОЖНО_ОТКРЫТЬ_ТИП_ФАЙЛА`, ToastAndroid.SHORT)
								break
							default:
								console.error('Ошибка сохранения файла:', err)
								Alert.alert('Ошибка', 'Возникла ошибка при сохранении файла.')
						}
					} else {
						console.error('Ошибка сохранения файла:', err)
						Alert.alert('Ошибка', 'Возникла ошибка при сохранении файла.')
					}
				}

				await removeTempFile(path)
			})
			.catch(e => console.error('writeFile:', e))
	}

	const handleImport = async () => {
		try {
			const [result] = await pick({ type: types.json })
			console.log('pick:', result)

			if (!result.hasRequestedType) {
				console.warn('[hasRequestedType] НЕВОЗМОЖНО_ОТКРЫТЬ_ТИП_ФАЙЛА.')
				ToastAndroid.show(`НЕВОЗМОЖНО_ОТКРЫТЬ_ТИП_ФАЙЛА`, ToastAndroid.SHORT)
				await removeTempFile(result.uri)
				return
			}

			const [copyResult] = await keepLocalCopy({
				files: [
					{
						uri: result.uri,
						fileName: result.name ?? 'backup.json'
					}
				],
				destination: 'documentDirectory'
			})
			console.log('keepLocalCopy:', copyResult)

			await removeTempFile(result.uri)

			if (copyResult.status === 'success') {
				// do something with the local copy:
				console.log(copyResult.localUri)

				try {
					const restoreData = await RNFetchBlob.fs.readFile(decodeURIComponent(copyResult.localUri), 'utf8')
					await removeTempFile(copyResult.localUri)

					if (restoreData.trim().length === 0) {
						ToastAndroid.show(`restoreData === 0.`, ToastAndroid.SHORT)
						return
					}
					try {
						const data = JSON.parse(restoreData)

						if ('watchHistory' in data.settings && 'searchHistory' in data.settings && 'bookmarks' in data.settings) {
							ToastAndroid.show(`Восстановление...`, ToastAndroid.SHORT)
							restoreSettings(data.settings)
							console.log('data:', data)
						} else {
							ToastAndroid.show(`Неверный формат.`, ToastAndroid.SHORT)
							console.log('data [Неверный формат]:', data)
						}
					} catch (e) {
						console.error('[readFile parse]', e)
						ToastAndroid.show(`[ошибка] Неверный формат.`, ToastAndroid.SHORT)
					}
				} catch (e) {
					console.error('[readFile] Ошибка выбора файла:', e)
					Alert.alert('Ошибка', 'Возникла ошибка при выборе файла.')
				}
			} else {
				Alert.alert('Ошибка', 'Возникла ошибка при выборе файла.')
			}
		} catch (err) {
			if (isErrorWithCode(err)) {
				switch (err.code) {
					case errorCodes.OPERATION_CANCELED:
						console.log('ОПЕРАЦИЯ_ОТМЕНЕНА')
						break
					case errorCodes.IN_PROGRESS:
						console.warn('В_ПРОЦЕССЕ.')
						ToastAndroid.show(`В_ПРОЦЕССЕ`, ToastAndroid.SHORT)
						break
					case errorCodes.UNABLE_TO_OPEN_FILE_TYPE:
						console.warn('НЕВОЗМОЖНО_ОТКРЫТЬ_ТИП_ФАЙЛА.')
						ToastAndroid.show(`НЕВОЗМОЖНО_ОТКРЫТЬ_ТИП_ФАЙЛА`, ToastAndroid.SHORT)
						break
					default:
						console.error('Ошибка выбора файла:', err)
						Alert.alert('Ошибка', 'Возникла ошибка при выборе файла.')
				}
			} else {
				console.error('Ошибка выбора файла:', err)
				Alert.alert('Ошибка', 'Возникла ошибка при выборе файла.')
			}
		}
	}

	const sendFile = async () => {
		const fileName = `movieapp_${new Date().toJSON().split('.')[0]}.json`
		const path = `${RNFetchBlob.fs.dirs.DownloadDir}/${fileName}`
		const settingsString = JSON.stringify(settings)

		console.log('path:', path)

		RNFetchBlob.fs
			.writeFile(path, settingsString, 'utf8')
			.then(async () => {
				console.log('Saved to', path)

				//

				try {
					const options: ShareOptions = {
						url: `file://${path}`,
						type: types.json
					}

					const shareResponse = await Share.open(options)

					if (shareResponse.success) {
						console.log('[Share.open]', shareResponse.message)
					} else {
						console.error('[Share.open]', shareResponse.message)
					}
				} catch (e) {
					console.error('[Share.open]', e)
				}

				await removeTempFile(path)
			})
			.catch(e => console.error('writeFile:', e))
	}

	return (
		<View style={{ flex: 1, marginTop: insets.top }}>
			<View style={{ paddingHorizontal: 10, paddingTop: 10, gap: 10 }}>
				<Text style={{ color: theme.colors.text100, fontSize: 16 }}>Экспорт</Text>
				<View style={{ flexDirection: 'row', gap: 5 }}>
					<Button onPress={handleDownload} flexDirection='row' alignItems='center' style={{}}>
						<View style={{ paddingRight: 5 }}>
							<DownloadIcon width={30} height={30} fill={theme.colors.text100} />
						</View>
						<Text style={{ color: theme.colors.text200, fontSize: 14 }}>Хранилище</Text>
					</Button>
					<Button onPress={sendFile} flexDirection='row' alignItems='center' style={{}}>
						<View style={{ paddingRight: 5 }}>
							<ShareIcon width={30} height={30} fill={theme.colors.text100} />
						</View>
						<Text style={{ color: theme.colors.text200, fontSize: 14 }}>Поделиться</Text>
					</Button>
				</View>

				<Text style={{ color: theme.colors.text100, fontSize: 16 }}>Импорт</Text>
				<View style={{ flexDirection: 'row', gap: 5 }}>
					<Button onPress={handleImport} flexDirection='row' alignItems='center' style={{}}>
						<View style={{ paddingRight: 5 }}>
							<UpgradeIcon width={30} height={30} fill={theme.colors.text100} />
						</View>
						<Text style={{ color: theme.colors.text200, fontSize: 14 }}>Хранилище</Text>
					</Button>
				</View>
			</View>

			{settings.settings.showDevOptions && (
				<View style={{ flex: 1, backgroundColor: '#000', borderRadius: 10, margin: 10 }}>
					<ScrollView contentContainerStyle={{ padding: 10, justifyContent: 'flex-end' }} ref={fileViewRef} onContentSizeChange={() => fileViewRef.current?.scrollToEnd({ animated: false })}>
						<ScrollView contentContainerStyle={{}} horizontal>
							<Text style={{ fontSize: 12, color: '#fff' }} selectable>
								{JSON.stringify(settings, undefined, 2)}
							</Text>
						</ScrollView>
					</ScrollView>
				</View>
			)}
		</View>
	)
}
