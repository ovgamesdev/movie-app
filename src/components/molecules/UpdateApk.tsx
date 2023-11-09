import { Button } from '@components/atoms'
import { useActions, useTheme, useTypedSelector } from '@hooks'
import { DownloadIcon } from '@icons'
import React, { FC } from 'react'
import { Text, View } from 'react-native'

export const UpdateApk: FC = () => {
	const { canUpdate, download, remote } = useTypedSelector(store => store.update)
	const { downloadApk, installDownloadedApk, setIsVisibleModal } = useActions()
	const { colors } = useTheme()

	if (!remote || !canUpdate) return null

	return (
		<View style={{ marginTop: 10, backgroundColor: colors.bg200, borderRadius: 6 }}>
			{download?.error ? (
				<Button text='Повторить обновление' onPress={downloadApk} textColor={colors.primary100} />
			) : download?.completed ? (
				<Button text='Установить обновление' onPress={installDownloadedApk} textColor={colors.primary100} />
			) : download?.progress ? (
				<View style={{ alignItems: 'center', flexDirection: 'row', padding: 10 }}>
					<DownloadIcon width={18} height={18} fill={colors.text200} style={{ marginRight: 10 }} />
					<Text style={{ color: colors.text100 }}>Загрузка обновления {Math.round((download.progress.received / download.progress.total) * 100)}%</Text>
				</View>
			) : (
				<Button text='Доступно обновление' onPress={() => setIsVisibleModal(true)} textColor={colors.primary100} />
			)}
		</View>
	)
}
