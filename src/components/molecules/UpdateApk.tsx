import { Button } from '@components/atoms'
import { useActions, useTypedSelector } from '@hooks'
import { DownloadIcon } from '@icons'
import { FC } from 'react'
import { TVFocusGuideView, Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

export const UpdateApk: FC = () => {
	const { canUpdate, download, remote } = useTypedSelector(state => state.update)
	const { downloadApk, installDownloadedApk, setIsVisibleModal } = useActions()
	const { styles, theme } = useStyles(stylesheet)

	if (!remote || !canUpdate) return null

	return (
		<TVFocusGuideView style={styles.container} trapFocusLeft trapFocusRight>
			{download?.error ? (
				<Button text='Повторить обновление' onPress={downloadApk} textColor={theme.colors.primary100} />
			) : download?.completed ? (
				<Button text='Установить обновление' onPress={installDownloadedApk} textColor={theme.colors.primary100} />
			) : download?.progress ? (
				<View style={styles.downloadWrapper}>
					<DownloadIcon width={18} height={18} fill={theme.colors.text200} style={styles.downloadIcon} />
					<Text style={styles.downloadText}>Загрузка обновления {Math.round((download.progress.received / download.progress.total) * 100)}%</Text>
				</View>
			) : (
				<Button text='Доступно обновление' onPress={() => setIsVisibleModal(true)} textColor={theme.colors.primary100} />
			)}
		</TVFocusGuideView>
	)
}

const stylesheet = createStyleSheet(theme => ({
	container: {
		marginTop: 10,
		backgroundColor: theme.colors.bg200,
		borderRadius: 6
	},
	downloadWrapper: {
		alignItems: 'center',
		flexDirection: 'row',
		padding: 10
	},
	downloadIcon: {
		marginRight: 10
	},
	downloadText: {
		color: theme.colors.text100
	}
}))
