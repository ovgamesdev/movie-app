import { Button } from '@components/atoms'
import { VoiceIcon } from '@icons'
import Voice, { SpeechErrorEvent } from '@react-native-voice/voice'
import { mapValue } from '@utils'
import { FC, useEffect, useState } from 'react'
import { View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

interface VoiceComponentProps {
	onSpeechResult?: (value: string | null) => void
	onSpeechPartialResult?: (value: string | null) => void
	onSpeechError?: (event?: SpeechErrorEvent) => void
	onPress?: () => void
}

export const VoiceComponent: FC<VoiceComponentProps> = ({ onSpeechResult, onSpeechPartialResult, onSpeechError, onPress }) => {
	const [recognizing, setRecognizing] = useState(false)
	const [isSupported, setIsSupported] = useState(true)
	const [volumeScale, setVolumeScale] = useState(1)
	const { styles, theme } = useStyles(stylesheet)

	useEffect(() => {
		Voice.onSpeechStart = () => setRecognizing(true)
		Voice.onSpeechRecognized = () => setRecognizing(false)
		Voice.onSpeechEnd = () => setRecognizing(false)
		Voice.onSpeechError = e => (setRecognizing(false), onSpeechError?.(e))
		Voice.onSpeechResults = e => onSpeechResult?.(e.value?.[0] ?? null)
		Voice.onSpeechPartialResults = e => onSpeechPartialResult?.(e.value?.[0] ?? null)
		Voice.onSpeechVolumeChanged = e => setVolumeScale(e.value != null ? mapValue(e.value, -2, 12, 1, 1.5) : 1)

		const getIsSupported = async () => {
			const isAvailable = await Voice.isAvailable()
			setIsSupported(isAvailable == 1)
		}
		getIsSupported()

		return () => {
			Voice.destroy().then(Voice.removeAllListeners)
		}
	}, [])

	const _onPress = async () => {
		if (!isSupported) {
			return onSpeechError?.({ error: { code: 'NOT_AVAILABLE', message: 'SpeechRecognizer не поддерживается' } })
		}

		onPress?.()

		if (recognizing) {
			try {
				await Voice.destroy()
				setRecognizing(false)
			} catch (e) {
				console.error(`<VoiceComponent /> Voice.destroy()`, e)
			}
		} else {
			try {
				await Voice.start('ru-RU') // 'en-US'
			} catch (e) {
				console.error(`<VoiceComponent /> Voice.start()`, e)
			}
		}
	}

	return (
		<View style={styles.container}>
			{recognizing && <View style={[styles.recognizing, { transform: [{ scale: volumeScale }] }]} />}
			{!isSupported && <View style={styles.notSupported} />}

			<Button
				style={styles.buttonContainer}
				justifyContent='center'
				alignItems='center'
				borderStyle={styles.buttonBorder}
				transparent
				// style={{ backgroundColor: !isSupported ? colors.primary300 + 'A6' : recognizing ? colors.warning : colors.primary300, width: 40, height: 40, borderRadius: 99, position: 'absolute', alignItems: 'center', justifyContent: 'center' }}

				onPress={_onPress}>
				<VoiceIcon width={24} height={24} fill={recognizing ? theme.colors.warning : isSupported ? theme.colors.text100 : theme.colors.text200} />
			</Button>
		</View>
	)
}

const stylesheet = createStyleSheet(theme => ({
	container: {
		height: 46,
		width: 45,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: theme.colors.bg200,
		borderTopRightRadius: 6,
		borderBottomRightRadius: 6
	},
	recognizing: {
		backgroundColor: theme.colors.primary300,
		width: 40,
		height: 40,
		borderRadius: 99,
		position: 'absolute'
	},
	notSupported: {
		backgroundColor: theme.colors.bg300,
		width: 40,
		height: 40,
		borderRadius: 99,
		position: 'absolute'
	},
	buttonContainer: {
		height: 46,
		width: 45
	},
	buttonBorder: {
		borderTopLeftRadius: 0,
		borderBottomLeftRadius: 0
	}
}))
