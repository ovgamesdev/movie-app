import React, { FC } from 'react'
import { Pressable, Text, View } from 'react-native'
import { useActions } from '../hooks/useActions'
import { useTypedSelector } from '../hooks/useTypedSelector'
import { DownloadIcon } from '../icons'

export const UpdateApkProgress: FC = () => {
	const { canUpdate, download, remote } = useTypedSelector(store => store.update)
	const { downloadApk, installDownloadedApk, setIsVisibleModal } = useActions()

	if (!remote || !canUpdate) return null

	return (
		<View style={{ marginTop: 10, backgroundColor: '#619a66', padding: 10 }}>
			{download?.error ? (
				<Pressable onPress={downloadApk}>
					<Text style={{ color: '#fff' }}>Повторить обновление</Text>
				</Pressable>
			) : download?.completed ? (
				<Pressable onPress={installDownloadedApk}>
					<Text style={{ color: '#fff' }}>Установить обновление</Text>
				</Pressable>
			) : download?.progress ? (
				<View style={{ alignItems: 'center', flexDirection: 'row' }}>
					<DownloadIcon width={20} height={20} fill='#fff' style={{ marginRight: 10 }} />
					<Text style={{ color: '#fff' }}>Загрузка обновления {Math.round((download.progress.received / download.progress.total) * 100)}%</Text>
				</View>
			) : (
				<Pressable onPress={() => setIsVisibleModal(true)}>
					<Text style={{ color: '#fff' }}>Доступно обновление</Text>
				</Pressable>
			)}
		</View>
	)
}
