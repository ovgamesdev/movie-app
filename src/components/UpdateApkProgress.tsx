import React, { FC } from 'react'
import { Pressable, Text, View } from 'react-native'
import { useActions } from '../hooks/useActions'
import { useTypedSelector } from '../hooks/useTypedSelector'

export const UpdateApkProgress: FC = () => {
	const { canUpdate, download, remote, size } = useTypedSelector(store => store.update)
	const { downloadApk, installDownloadedApk } = useActions()

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
					<View style={{ width: 15, height: 15, backgroundColor: '#fff', marginRight: 10 }} />
					<Text style={{ color: '#fff' }}>Загрузка обновления {Math.round((download.progress.received / download.progress.total) * 100)}%</Text>
				</View>
			) : (
				// TODO open modal
				<Pressable onPress={downloadApk}>
					<Text style={{ color: '#fff' }}>Доступно обновление</Text>
				</Pressable>
			)}
		</View>
	)

	// TODO modal
	// return (
	// 	<View>
	// 		<View style={{ flexDirection: 'row', position: 'absolute', top: 5, right: 5, width: 25, height: 25, backgroundColor: 'red', justifyContent: 'center', alignItems: 'center' }}>
	// 			<Text style={{ color: '#fff' }}>X</Text>
	// 		</View>
	// 		<Text style={{ color: '#fff' }}>Доступно обновление</Text>
	// 		<View style={{ flexDirection: 'row', alignItems: 'center' }}>
	// 			<Text style={{ color: '#fff' }}>Что нового в {remote.versionName}</Text>
	// 			<View style={{ width: 10, height: 10, backgroundColor: '#fff', marginLeft: 5 }} />
	// 		</View>
	// 		<View>
	// 			<Text style={{ color: '#fff' }}>{remote.whatsNew}</Text>
	// 			{remote.whatsNewOptions?.map((option, i) => (
	// 				<View key={i}>
	// 					<Text style={{ color: '#fff' }}>{option.title}</Text>
	// 					{option.options.map((option, i) => (
	// 						<Text key={i} style={{ color: '#fff' }}>
	// 							{option.title}
	// 						</Text>
	// 					))}
	// 				</View>
	// 			))}
	// 		</View>
	// 		<Pressable style={{ padding: 10, marginTop: 10, backgroundColor: 'green' }}>
	// 			<Text style={{ color: '#fff' }}>Загрузить • {size} МБ</Text>
	// 		</Pressable>
	// 	</View>
	// )
}
