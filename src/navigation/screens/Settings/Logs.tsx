import { ActivityIndicator, Button } from '@components/atoms'
import { DeleteIcon, DownloadIcon, RefreshIcon, ShareIcon } from '@icons'
import { errorCodes, isErrorWithCode, saveDocuments, types } from '@react-native-documents/picker'
import { useFocusEffect } from '@react-navigation/native'
import { useCallback, useRef, useState, type FC } from 'react'
import { Alert, ScrollView, Text, ToastAndroid, View } from 'react-native'
import RNFetchBlob from 'react-native-blob-util'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Share, { ShareOptions } from 'react-native-share'
import { useStyles } from 'react-native-unistyles'

export const Logs: FC = () => {
	const insets = useSafeAreaInsets()
	const { theme } = useStyles()

	const [files, setFiles] = useState<{ name: string; path: string }[]>([])
	const [openedFile, setOpenedFile] = useState<{ name: string; path: string; logs: string } | null>(null)
	const [isLoading, setIsLoading] = useState(false)

	const fileViewRef = useRef<ScrollView>(null)

	useFocusEffect(
		useCallback(() => {
			RNFetchBlob.fs
				.ls(RNFetchBlob.fs.dirs.DocumentDir + '/logs')
				.then(files => {
					const logFiles = files.filter(file => file.startsWith('logs_'))

					setFiles(logFiles.map(file => ({ name: file.replace('.txt', '').replace('logs_', ''), path: RNFetchBlob.fs.dirs.DocumentDir + '/logs/' + file })))
				})
				.catch(e => {
					console.error('Ошибка получения списка логов', e)
					setFiles([])
				})
		}, [])
	)

	const refreshFiles = () => {
		setIsLoading(true)
		RNFetchBlob.fs
			.ls(RNFetchBlob.fs.dirs.DocumentDir + '/logs')
			.then(files => {
				const logFiles = files.filter(file => file.startsWith('logs_'))

				setFiles(logFiles.map(file => ({ name: file.replace('.txt', '').replace('logs_', ''), path: RNFetchBlob.fs.dirs.DocumentDir + '/logs/' + file })))

				// selectFile(openedFile)
			})
			.catch(e => {
				console.error('Ошибка получения списка логов', e)
				setFiles([])
			})
			.finally(() => setIsLoading(false))
	}

	const selectFile = (file: { name: string; path: string } | null) => {
		if (file) {
			RNFetchBlob.fs
				.readFile(file.path, 'utf8')
				.then(logs => setOpenedFile({ ...file, logs }))
				.catch(e => {
					console.error('Ошибка прочтения файла', e)
					setOpenedFile(null)
				})
		} else {
			setOpenedFile(null)
		}
	}

	const removeFile = (file: { name: string; path: string; logs: string }) => {
		RNFetchBlob.fs
			.unlink(file.path)
			.then(() => {
				setOpenedFile(null)
				setFiles(files => files.filter(f => f.name !== file.name))
			})
			.catch(e => console.error('Ошибка удаления файла', e))
	}

	const downloadFile = async ({ path }: { name: string; path: string; logs: string }) => {
		const fileName = path.slice(path.lastIndexOf('/') + 1)

		try {
			const [{ uri: targetUri, error, name }] = await saveDocuments({
				sourceUris: [`file://${path}`],
				copy: false,
				mimeType: types.plainText,
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
	}

	const sendFile = async ({ path }: { name: string; path: string; logs: string }) => {
		console.log('path:', path)

		try {
			const options: ShareOptions = {
				url: `file://${path}`,
				type: types.plainText
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
	}

	return (
		<View style={{ flex: 1, marginTop: insets.top }}>
			<View style={{ paddingTop: 10, paddingRight: 10, paddingLeft: 10, flexDirection: 'row', gap: 5 }}>
				<ScrollView horizontal contentContainerStyle={{ gap: 5 }}>
					{files
						.sort((a, b) => {
							const [aDay, aMonth, aYear] = a.name.split('-').map(Number)
							const [bDay, bMonth, bYear] = b.name.split('-').map(Number)

							return new Date(bYear, bMonth - 1, bDay).getTime() - new Date(aYear, aMonth - 1, aDay).getTime()
						})
						.map((item, index) => (
							<Button text={item.name} key={index} onPress={() => selectFile(item)} isActive={openedFile?.name === item.name} textColor={theme.colors.text200} activeTextColor={theme.colors.primary300} activeButtonColor={theme.colors.primary100} activePressedButtonColor={theme.getColorForTheme({ dark: 'primary200', light: 'text200' })} />
						))}
				</ScrollView>

				{openedFile && (
					<Button onPress={() => removeFile(openedFile)}>
						<DeleteIcon width={18} height={18} fill={theme.colors.text100} />
					</Button>
				)}
				{openedFile && (
					<Button onPress={async () => downloadFile(openedFile)}>
						<DownloadIcon width={18} height={18} fill={theme.colors.text100} />
					</Button>
				)}
				{openedFile && (
					<Button onPress={async () => sendFile(openedFile)}>
						<ShareIcon width={18} height={18} fill={theme.colors.text100} />
					</Button>
				)}
				<Button onPress={refreshFiles}>
					<RefreshIcon width={18} height={18} fill={theme.colors.text100} />
				</Button>
			</View>

			<View style={{ flex: 1, backgroundColor: '#000', borderRadius: 10, margin: 10 }}>
				{isLoading ? (
					<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
						<ActivityIndicator size='large' />
					</View>
				) : (
					<ScrollView contentContainerStyle={{ padding: 10, justifyContent: 'flex-end' }} ref={fileViewRef} onContentSizeChange={() => fileViewRef.current?.scrollToEnd({ animated: false })}>
						<ScrollView contentContainerStyle={{}} horizontal>
							{openedFile ? (
								<Text style={{ fontSize: 12, color: '#fff' }} selectable>
									{openedFile.logs}
								</Text>
							) : (
								<Text style={{ fontSize: 12, color: '#fff' }}>SELECT LOG FILE...</Text>
							)}
						</ScrollView>
					</ScrollView>
				)}
			</View>
		</View>
	)
}
