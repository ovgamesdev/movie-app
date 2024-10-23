import { ActivityIndicator, Button } from '@components/atoms'
import { DeleteIcon, RefreshIcon } from '@icons'
import { useFocusEffect } from '@react-navigation/native'
import { useCallback, useRef, useState, type FC } from 'react'
import { ScrollView, Text, View } from 'react-native'
import RNFetchBlob from 'react-native-blob-util'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useStyles } from 'react-native-unistyles'

export const Logs: FC = () => {
	const insets = useSafeAreaInsets()

	const [files, setFiles] = useState<{ name: string; path: string }[]>([])
	const [openedFile, setOpenedFile] = useState<{ name: string; path: string; logs: string } | null>(null)
	const [isLoading, setIsLoading] = useState(false)

	const { theme } = useStyles()

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

				selectFile(openedFile)
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

	return (
		<View style={{ flex: 1, marginTop: insets.top }}>
			<View style={{ paddingTop: 10, paddingRight: 5, flexDirection: 'row', gap: 5 }}>
				<ScrollView horizontal contentContainerStyle={{ gap: 5, paddingLeft: 5 }}>
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
