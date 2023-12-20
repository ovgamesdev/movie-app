import { useTheme } from '@hooks'
import { Text, View } from 'react-native'

export const ProductionStatusText = ({ productionStatus, productionStatusUpdateDate }: { productionStatus: string; productionStatusUpdateDate: string }) => {
	const { colors } = useTheme()

	let statusMessage = ''
	let statusStyle = {}

	switch (productionStatus) {
		case 'FILMING':
			statusMessage = 'Съемочный процесс'
			statusStyle = {
				color: 'rgba(255,101,0,.9)',
				backgroundColor: 'rgba(255,101,0,.1)'
			}
			break
		case 'PRE_PRODUCTION':
			statusMessage = 'Подготовка к съемкам'
			statusStyle = {
				color: 'rgba(255,101,0,.9)',
				backgroundColor: 'rgba(255,101,0,.1)'
			}
			break
		case 'COMPLETED':
			statusMessage = 'Производство завершено'
			statusStyle = {
				color: 'rgba(0,153,51,.9)',
				backgroundColor: '#d9f0e1'
			}
			break
		case 'ANNOUNCED':
			statusMessage = 'Проект объявлен'
			statusStyle = {
				color: 'rgba(255,101,0,.9)',
				backgroundColor: 'rgba(255,101,0,.1)'
			}
			break
		case 'POST_PRODUCTION':
			statusMessage = 'Постпродакшн'
			statusStyle = {
				color: 'rgba(255,101,0,.9)',
				backgroundColor: 'rgba(255,101,0,.1)'
			}
			break
		case 'UNKNOWN':
			statusMessage = 'Неизвестно'
			statusStyle = {
				color: 'rgba(255,255,255,.8)',
				backgroundColor: 'rgba(31,31,31,.24)'
			}
			break
		default:
			break
	}

	return (
		<View style={{ flexDirection: 'row', paddingBottom: 8 }}>
			<Text style={{ ...statusStyle, fontSize: 13, fontWeight: '500', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 3 }}>{statusMessage}</Text>
			<Text style={{ color: colors.text200, fontSize: 13, fontWeight: '500', paddingVertical: 2 }}> – обновлено {new Date(productionStatusUpdateDate).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' }).replace(' г.', '')}</Text>
		</View>
	)
}
