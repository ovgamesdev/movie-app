import { Button, ButtonType } from '@components/atoms'
import { VoiceComponent } from '@components/molecules'
import { useTheme } from '@hooks'
import { CloseIcon, SearchIcon } from '@icons'
import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
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

export const Input = forwardRef<InputType, Props>(({ transparent, icon, clearable, onClear, voice, onVoice, flex, ...props }, forwardRef) => {
	const { colors } = useTheme()

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
				<TextInput ref={textInputRef} style={{ color: colors.text100, fontSize: 14, height: 40, padding: 10, flex: 1 }} placeholderTextColor={colors.text200} onSubmitEditing={() => buttonRef.current?.requestTVFocus()} onBlur={() => buttonRef.current?.requestTVFocus()} cursorColor={colors.primary200} disableFullscreenUI autoComplete='off' {...props} />
			</Button>

			{isRight ? (
				<>
					{clearable && props.value?.length !== 0 ? (
						<Button onPress={clearable ? onClear : undefined} style={{ height: 46, width: 45 }} justifyContent='center' alignItems='center' borderStyle={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}>
							<CloseIcon width={15} height={15} fill={colors.text100} />
						</Button>
					) : null}

					{/* TODO more error */}
					{/* {"code": "6", "message": "6/No speech input"} */}
					{/* {"code": "3", "message": "3/Audio recording error"} */}
					{voice && props.value?.length === 0 ? <VoiceComponent onPress={Keyboard.dismiss} onSpeechPartialResult={e => e !== null && props.onChangeText?.(e)} onSpeechResult={e => e !== null && onVoice?.(e)} onSpeechError={e => (e?.code === '7' ? ToastAndroid.show('Неразборчиво', ToastAndroid.SHORT) : e?.code === 'NOT_AVAILABLE' ? ToastAndroid.show('Голосовой ввод не поддерживается', ToastAndroid.SHORT) : (ToastAndroid.show('Неизвестная ошибка', ToastAndroid.SHORT), console.warn('VoiceComponent error:', e)))} /> : null}
				</>
			) : null}
		</TVFocusGuideView>
	)
})
