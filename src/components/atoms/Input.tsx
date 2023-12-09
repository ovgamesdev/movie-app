import { Button, ButtonType } from '@components/atoms'
import { VoiceComponent } from '@components/molecules'
import { useTheme } from '@hooks'
import { CloseIcon, SearchIcon } from '@icons'
import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { Keyboard, TVFocusGuideView, TextInput, TextInputProps, ToastAndroid } from 'react-native'

interface Props extends TextInputProps {
	transparent?: boolean
	icon?: 'search'
	clearable?: boolean
	onClear?: () => void
	voice?: boolean
	onVoice?: (value: string) => void

	// styles
	flex?: number
}

export type InputType = {
	requestTVFocus: () => void
	focus: () => void
}

export const Input = forwardRef<InputType, Props>(({ transparent, icon, clearable, onClear, voice, onVoice, flex, placeholder, ...props }, forwardRef) => {
	const { colors } = useTheme()
	const [voicePlaceholder, setVoicePlaceholder] = useState<string | null>(null)

	const buttonRef = useRef<ButtonType | null>(null)
	const textInputRef = useRef<TextInput | null>(null)

	useEffect(() => {
		if (props.hasTVPreferredFocus) {
			setTimeout(() => buttonRef.current?.requestTVFocus(), 0)
		}
	}, [props.hasTVPreferredFocus])

	useImperativeHandle(forwardRef, () => ({
		requestTVFocus: () => buttonRef.current?.requestTVFocus(),
		focus: () => textInputRef.current?.focus()
	}))

	const isRight = !!clearable

	return (
		<TVFocusGuideView style={{ flexDirection: 'row', flex }} autoFocus trapFocusLeft trapFocusRight>
			<Button ref={buttonRef} onPress={() => textInputRef.current?.focus()} padding={0} flex={1} flexDirection='row' alignItems='center' borderStyle={isRight ? { borderTopRightRadius: 0, borderBottomRightRadius: 0 } : undefined}>
				{icon === 'search' ? <SearchIcon width={20} height={20} fill={colors.text100} style={{ marginLeft: 10 }} /> : null}
				{/* FIXME: If there is no onBlur={() => buttonRef.current?.requestTVFocus()}, then when unfocusing from TextInput and trying to focus on it next time, it does not focus on button */}
				<TextInput ref={textInputRef} style={{ color: colors.text100, fontSize: 14, height: 40, padding: 10, flex: 1 }} placeholder={voicePlaceholder ?? placeholder} placeholderTextColor={voicePlaceholder ? colors.text100 : colors.text200} onSubmitEditing={() => buttonRef.current?.requestTVFocus()} onBlur={() => buttonRef.current?.requestTVFocus()} cursorColor={colors.primary200} disableFullscreenUI autoComplete='off' {...props} />
			</Button>

			{isRight ? (
				<>
					{props.value?.length !== 0 ? (
						<Button onPress={onClear} style={{ height: 46, width: 45 }} justifyContent='center' alignItems='center' borderStyle={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}>
							<CloseIcon width={15} height={15} fill={colors.text100} />
						</Button>
					) : null}

					{voice && props.value?.length === 0 ? (
						<VoiceComponent
							onPress={Keyboard.dismiss}
							onSpeechPartialResult={e => e !== null && setVoicePlaceholder(e)}
							onSpeechResult={e => (setVoicePlaceholder(null), e !== null && onVoice?.(e))}
							onSpeechError={e => {
								setVoicePlaceholder(null)

								// https://developer.android.com/reference/android/speech/SpeechRecognizer#ERROR_AUDIO
								switch (e?.error?.code) {
									case 'NOT_AVAILABLE':
										ToastAndroid.show('Голосовой ввод не поддерживается', ToastAndroid.SHORT)
										break
									case '6':
										ToastAndroid.show('Не удается обнаружить сигнал микрофона', ToastAndroid.SHORT)
										break
									case '7':
										ToastAndroid.show('Неразборчиво', ToastAndroid.SHORT)
										break
									case '9':
										ToastAndroid.show('Недостаточно разрешений', ToastAndroid.SHORT)
										break
									default:
										ToastAndroid.show('Неизвестная ошибка, попробуйте еще раз', ToastAndroid.SHORT)
										console.warn('VoiceComponent error:', e)
										break
								}
							}}
						/>
					) : null}
				</>
			) : null}
		</TVFocusGuideView>
	)
})
