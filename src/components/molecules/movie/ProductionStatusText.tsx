import { ProductionStatus } from '@store/kinopoisk'
import { FC } from 'react'
import { Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

interface Props {
	productionStatus: ProductionStatus
	productionStatusUpdateDate: string
}

export const ProductionStatusText: FC<Props> = ({ productionStatus, productionStatusUpdateDate }) => {
	const { styles } = useStyles(stylesheet, { color: productionStatus ?? undefined })

	let statusMessage = ''

	switch (productionStatus) {
		case 'FILMING':
			statusMessage = 'Съемочный процесс'
			break
		case 'PRE_PRODUCTION':
			statusMessage = 'Подготовка к съемкам'
			break
		case 'COMPLETED':
			statusMessage = 'Производство завершено'
			break
		case 'ANNOUNCED':
			statusMessage = 'Проект объявлен'
			break
		case 'POST_PRODUCTION':
			statusMessage = 'Постпродакшн'
			break
		case 'UNKNOWN':
			statusMessage = 'Неизвестно'
			break
		default:
			break
	}

	return (
		<View style={styles.container}>
			<Text style={styles.status}>
				<View style={{}}>
					<Text style={styles.message}>{` ${statusMessage} `}</Text>
				</View>
				{` – обновлено ${new Date(productionStatusUpdateDate).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' }).replace(' г.', '')}`}
			</Text>
		</View>
	)
}

const stylesheet = createStyleSheet(theme => ({
	container: {
		paddingBottom: 8
	},
	message: {
		borderRadius: 3,
		lineHeight: 18,
		fontSize: 13,
		fontWeight: '500',
		transform: [{ translateY: 3.25 }],
		variants: {
			color: {
				FILMING: {
					color: 'rgba(255,101,0,.9)',
					backgroundColor: 'rgba(255,101,0,.1)'
				},
				PRE_PRODUCTION: {
					color: 'rgba(255,101,0,.9)',
					backgroundColor: 'rgba(255,101,0,.1)'
				},
				COMPLETED: {
					color: 'rgba(0,153,51,.9)',
					backgroundColor: '#d9f0e1'
				},
				ANNOUNCED: {
					color: 'rgba(255,101,0,.9)',
					backgroundColor: 'rgba(255,101,0,.1)'
				},
				POST_PRODUCTION: {
					color: 'rgba(255,101,0,.9)',
					backgroundColor: 'rgba(255,101,0,.1)'
				},
				UNKNOWN: {
					color: theme.colors.text100, // 'rgba(255,255,255,.8)'
					backgroundColor: 'rgba(31,31,31,.24)'
				}
			}
		}
	},
	status: {
		color: theme.colors.text200,
		lineHeight: 20,
		fontSize: 13,
		fontWeight: '500'
	}
}))
