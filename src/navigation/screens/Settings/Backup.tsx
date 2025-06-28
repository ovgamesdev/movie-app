import { ActivityIndicator, Button } from '@components/atoms'
import { useActions, useTypedSelector } from '@hooks'
import { DownloadIcon } from '@icons'
import { useRef, useState, type FC } from 'react'
import { PermissionsAndroid, ScrollView, Text, TextInput, ToastAndroid, View } from 'react-native'
import RNFetchBlob from 'react-native-blob-util'
import Modal from 'react-native-modal'
import { btoa } from 'react-native-quick-base64'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
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

	const settings = useTypedSelector(state => state.settings)
	const [files, setFiles] = useState<{ name: string; path: string }[]>([])
	const [openedFile, setOpenedFile] = useState<{ name: string; path: string; logs: string } | null>(null)
	const [isLoading, setIsLoading] = useState(false)

	const [restoreData, setRestoreData] = useState('')

	const [settingsStringBase64, setSettingsStringBase64] = useState<string | null>(null)
	const [settingsStringDecoded, setSettingsStringDecoded] = useState<string | null>(null)

	const { theme } = useStyles()

	const { restoreSettings } = useActions()

	const fileViewRef = useRef<ScrollView>(null)

	const settingsStringWithSpace = JSON.stringify(settings, undefined, 2)
	const settingsString = JSON.stringify(settings)

	const checkPermissions = async () => {
		try {
			// const is_WRITE_EXTERNAL_STORAGE = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE)
			// const is_READ_EXTERNAL_STORAGE = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE)
			// const is_MANAGE_EXTERNAL_STORAGE = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.MANAGE_EXTERNAL_STORAGE)

			// console.log({ is_WRITE_EXTERNAL_STORAGE, is_READ_EXTERNAL_STORAGE, is_MANAGE_EXTERNAL_STORAGE })

			// if (!(is_WRITE_EXTERNAL_STORAGE && is_READ_EXTERNAL_STORAGE && is_MANAGE_EXTERNAL_STORAGE)) {
			await PermissionsAndroid.requestMultiple([PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE, PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE])
			// }

			return false
		} catch (e) {
			console.error(e)
			return false
		}
	}

	const handleDownload = async () => {
		// await checkPermissions()

		const path = `${RNFetchBlob.fs.dirs.DownloadDir}/movieapp_${new Date().toJSON().split('.')[0]}.backup.html`
		const html = `<!DOCTYPE html>
<html>
<title>Download</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<body>
<script defer>
function download(filename, text) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}
window.onload = () => download('movieapp_${new Date().toJSON().split('.')[0]}.backup', '${btoa(settingsString)}');
</script>
</body>
</html> `

		RNFetchBlob.fs
			.writeFile(path, html, 'utf8')
			.then(() => {
				console.log('Saved to', path)
				RNFetchBlob.android.actionViewIntent(path, 'text/plain')
				// if (path.includes('emulated/0/Android/data')) {
				// 	const newPath = path.split('emulated/0')[1]
				// 	Alert.alert('Сохранено', newPath, [
				// 		{
				// 			text: 'Open',
				// 			onPress: () => {
				// 				//
				// 				RNFetchBlob.android.actionViewIntent(path, 'text/plain')
				// 			}
				// 		}
				// 	])
				// }
			})
			.catch(e => console.error('writeFile:', e))

		// console.log('dirs.DownloadDir:', dirs.DownloadDir)
	}

	const handleRestore = async () => {
		if (restoreData.trim().length === 0) {
			ToastAndroid.show(`restoreData === 0.`, ToastAndroid.SHORT)
			return
		}
		try {
			const data = JSON.parse(restoreData)

			if ('watchHistory' in data.settings && 'searchHistory' in data.settings && 'bookmarks' in data.settings) {
				ToastAndroid.show(`Восстановление...`, ToastAndroid.SHORT)
				restoreSettings(data.settings)
			} else {
				ToastAndroid.show(`Неверный формат.`, ToastAndroid.SHORT)
			}
		} catch (e) {
			console.error('[handleRestore]', e)
			ToastAndroid.show(`[ошибка] Неверный формат.`, ToastAndroid.SHORT)
		}
	}

	return (
		<View style={{ flex: 1, marginTop: insets.top }}>
			<View style={{ paddingTop: 10, paddingRight: 10, paddingLeft: 10, flexDirection: 'row', gap: 5 }}>
				{/* <ScrollView horizontal contentContainerStyle={{ gap: 5 }}>
					{files
						.sort((a, b) => {
							const [aDay, aMonth, aYear] = a.name.split('-').map(Number)
							const [bDay, bMonth, bYear] = b.name.split('-').map(Number)

							return new Date(bYear, bMonth - 1, bDay).getTime() - new Date(aYear, aMonth - 1, aDay).getTime()
						})
						.map((item, index) => (
							<Button text={item.name} key={index} onPress={() => selectFile(item)} isActive={openedFile?.name === item.name} textColor={theme.colors.text200} activeTextColor={theme.colors.primary300} activeButtonColor={theme.colors.primary100} activePressedButtonColor={theme.getColorForTheme({ dark: 'primary200', light: 'text200' })} />
						))}
				</ScrollView> */}

				<Button onPress={handleDownload}>
					<DownloadIcon width={18} height={18} fill={theme.colors.text100} />
				</Button>
				<TextInput maxLength={99999999999} multiline style={{ flex: 1, backgroundColor: theme.colors.bg200 }} placeholder='JSON' onChangeText={setRestoreData} />
				<Button onPress={handleRestore} text='Восстановить' />
			</View>

			<View style={{ flex: 1, backgroundColor: '#000', borderRadius: 10, margin: 10 }}>
				{isLoading ? (
					<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
						<ActivityIndicator size='large' />
					</View>
				) : (
					<ScrollView contentContainerStyle={{ padding: 10, justifyContent: 'flex-end' }} ref={fileViewRef} onContentSizeChange={() => fileViewRef.current?.scrollToEnd({ animated: false })}>
						<ScrollView contentContainerStyle={{}} horizontal>
							<Text style={{ fontSize: 12, color: '#fff' }} selectable>
								{settingsStringWithSpace}
							</Text>
						</ScrollView>
					</ScrollView>
				)}
			</View>

			<Modal isVisible={false}>
				<View style={{ flex: 1, backgroundColor: 'red', margin: 20, gap: 5 }}>
					<TextInput style={{ height: 50, backgroundColor: '#000', color: '#fff' }} placeholder='paste text' value={settingsStringBase64 ?? ''} onChange={e => setSettingsStringBase64(e.nativeEvent.text)} />

					<View style={{ flex: 1, backgroundColor: '#000', borderRadius: 10, margin: 10 }}>
						<ScrollView contentContainerStyle={{ padding: 10, justifyContent: 'flex-end' }} ref={fileViewRef} onContentSizeChange={() => fileViewRef.current?.scrollToEnd({ animated: false })}>
							<ScrollView contentContainerStyle={{}} horizontal>
								<Text style={{ fontSize: 12, color: '#fff' }} selectable>
									{settingsStringDecoded}
								</Text>
							</ScrollView>
						</ScrollView>
					</View>
					<View style={{ height: 50 }}>
						<Button
							onPress={() => {
								if (settingsStringBase64) {
									try {
										const decodedString = atob(settingsStringBase64)
										const json = JSON.parse(decodedString)

										setSettingsStringDecoded(JSON.stringify(json, undefined, 2))
									} catch (e) {
										console.error(e)
									}
								}
							}}
							text='apply'
							alignItems='center'
							justifyContent='center'
							style={{ height: 50 }}
						/>
					</View>
				</View>
			</Modal>
		</View>
	)
}
