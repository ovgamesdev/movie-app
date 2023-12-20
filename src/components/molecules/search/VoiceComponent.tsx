import { Button } from '@components/atoms'
import { useTheme } from '@hooks'
import { VoiceIcon } from '@icons'
import Voice, { SpeechErrorEvent } from '@react-native-voice/voice'
import { mapValue } from '@utils'
import React, { useEffect, useState } from 'react'
import { View } from 'react-native'

interface VoiceComponentProps {
	onSpeechResult?: (value: string | null) => void
	onSpeechPartialResult?: (value: string | null) => void
	onSpeechError?: (event?: SpeechErrorEvent) => void
	onPress?: () => void
}

export const VoiceComponent: React.FC<VoiceComponentProps> = ({ onSpeechResult, onSpeechPartialResult, onSpeechError, onPress }) => {
	const [recognizing, setRecognizing] = useState(false)
	const [isSupported, setIsSupported] = useState(true)
	const [volumeScale, setVolumeScale] = useState(1)
	const { colors } = useTheme()

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
				console.error(`error: <VoiceComponent /> Voice.destroy()`, e)
			}
		} else {
			try {
				await Voice.start('ru-RU') // 'en-US'
			} catch (e) {
				console.error(`error: <VoiceComponent /> Voice.start()`, e)
			}
		}
	}

	return (
		<View style={{ height: 46, width: 45, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg200, borderTopRightRadius: 6, borderBottomRightRadius: 6 }}>
			{recognizing && <View style={{ backgroundColor: colors.primary300, width: 40, height: 40, borderRadius: 99, position: 'absolute', transform: [{ scale: volumeScale }] }} />}
			{!isSupported && <View style={{ backgroundColor: colors.bg300, width: 40, height: 40, borderRadius: 99, position: 'absolute' }} />}

			<Button
				style={{ height: 46, width: 45 }}
				justifyContent='center'
				alignItems='center'
				borderStyle={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
				transparent
				// style={{ backgroundColor: !isSupported ? colors.primary300 + 'A6' : recognizing ? colors.warning : colors.primary300, width: 40, height: 40, borderRadius: 99, position: 'absolute', alignItems: 'center', justifyContent: 'center' }}

				onPress={_onPress}>
				<VoiceIcon width={24} height={24} fill={recognizing ? colors.warning : isSupported ? colors.text100 : colors.text200} />
			</Button>
		</View>
	)
}
