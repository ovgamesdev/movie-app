import React, { FC } from 'react'
import { Pressable, Text, View } from 'react-native'
import { useActions } from '../hooks/useActions'
import { useTheme } from '../hooks/useTheme'
import { useTypedSelector } from '../hooks/useTypedSelector'
import { DownloadIcon } from '../icons'

export const UpdateApkProgress: FC = () => {
	const { canUpdate, download, remote } = useTypedSelector(store => store.update)
	const { downloadApk, installDownloadedApk, setIsVisibleModal } = useActions()
	const { colors } = useTheme()

	if (!remote || !canUpdate) return null

	return (
		<View style={{ marginTop: 10, backgroundColor: colors.bg200, borderRadius: 6 }}>
			{download?.error ? (
				<Pressable onPress={downloadApk} style={{ padding: 10 }}>
					<Text style={{ color: colors.primary100 }}>Повторить обновление</Text>
				</Pressable>
			) : download?.completed ? (
				<Pressable onPress={installDownloadedApk} style={{ padding: 10 }}>
					<Text style={{ color: colors.primary100 }}>Установить обновление</Text>
				</Pressable>
			) : download?.progress ? (
				<View style={{ alignItems: 'center', flexDirection: 'row', padding: 10 }}>
					<DownloadIcon width={20} height={20} fill={colors.text200} style={{ marginRight: 10 }} />
					<Text style={{ color: colors.text100 }}>Загрузка обновления {Math.round((download.progress.received / download.progress.total) * 100)}%</Text>
				</View>
			) : (
				<Pressable onPress={() => setIsVisibleModal(true)} style={{ padding: 10 }}>
					<Text style={{ color: colors.primary100 }}>Доступно обновление</Text>
				</Pressable>
			)}
		</View>
	)
}
