import { ActivityIndicator, Button } from '@components/atoms'
import { UpdateApk, User } from '@components/molecules'
import { Switch } from '@components/molecules/settings'
import { useTypedSelector } from '@hooks'
import { DeleteIcon, RefreshIcon } from '@icons'
import { useFocusEffect } from '@react-navigation/native'
import { useCallback, useRef, useState, type FC } from 'react'
import { ScrollView, TVFocusGuideView, Text, View } from 'react-native'
import RNFetchBlob from 'react-native-blob-util'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

const LoaderSettings: FC = () => {
	const isLoading = useTypedSelector(state => state.settings.isLoading)
	const { styles } = useStyles(stylesheet)

	if (!isLoading) {
		return null
	}

	return (
		<View style={styles.loadingContainer}>
			<View style={styles.loading}>
				<Text style={styles.loadingText}>Loading...</Text>
			</View>
		</View>
	)
}

// TODO to screens
const LogPage: FC = () => {
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
		<View style={{ flex: 1 }}>
			<View style={{ paddingVertical: 10, flexDirection: 'row', gap: 5 }}>
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
				<Button onPress={refreshFiles}>
					<RefreshIcon width={18} height={18} fill={theme.colors.text100} />
				</Button>
			</View>

			<View style={{ flex: 1, backgroundColor: '#000', borderRadius: 10 }}>
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

export const Settings = () => {
	const insets = useSafeAreaInsets()
	const { styles } = useStyles(stylesheet)

	return (
		<TVFocusGuideView style={[styles.container, { marginTop: insets.top }]} trapFocusLeft trapFocusRight trapFocusUp>
			<LoaderSettings />

			<View style={styles.updateContainer}>
				<UpdateApk />
			</View>

			<User />

			{/* <Select
				item='theme'
				options={[
					{ value: 'light', title: 'light' },
					{ value: 'dark', title: 'dark' },
					{ value: null, title: 'default' }
				]}
				onChange={value => {
					if (value === null) {
						UnistylesRuntime.setAdaptiveThemes(true)
					} else {
						UnistylesRuntime.setAdaptiveThemes(false)
						UnistylesRuntime.setTheme(value)
					}
				}}
			/> */}
			<Switch item='showDevOptions' />

			<LogPage />
		</TVFocusGuideView>
	)
}

const stylesheet = createStyleSheet(theme => ({
	loadingContainer: {
		position: 'absolute',
		top: 20,
		left: 0,
		right: 0,
		zIndex: 10,
		alignItems: 'center'
	},
	loading: {
		backgroundColor: theme.colors.bg200,
		borderRadius: 50,
		paddingHorizontal: 5
	},
	loadingText: {
		color: theme.colors.text100,
		textAlign: 'center'
	},
	container: {
		flex: 1,
		padding: 10
	},
	updateContainer: {
		paddingBottom: 10
	}
}))
