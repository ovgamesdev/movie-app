import { Button } from '@components/atoms'
import { VoiceComponent } from '@components/molecules'
import { useTheme } from '@hooks'
import { CloseIcon, SearchIcon } from '@icons'
import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import { Keyboard, TVFocusGuideView, TextInput, TextInputProps, ToastAndroid, View } from 'react-native'

interface Props extends TextInputProps {
	transparent?: boolean
	icon?: 'search'
	clearable?: boolean
	onClear?: () => void
	voice?: boolean
	onVoice?: (value: string) => void
}

export type InputType = {
	requestTVFocus: () => void
	focus: () => void
}

export const Input = forwardRef<InputType, Props>(({ transparent, icon, clearable, onClear, voice, onVoice, ...props }, forwardRef) => {
	const { colors } = useTheme()

	// const _style = (state: PressableStateCallbackType) => (typeof style === 'function' ? style(state) : typeof style === 'object' ? style : {})

	const buttonRef = useRef<View | null>(null)
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
		<TVFocusGuideView style={{ flexDirection: 'row' }} autoFocus trapFocusLeft trapFocusRight>
			<Button ref={buttonRef} onPress={() => textInputRef.current?.focus()} padding={0} flex={1} flexDirection='row' alignItems='center' borderStyle={isRight ? { borderTopRightRadius: 0, borderBottomRightRadius: 0 } : undefined}>
				{icon === 'search' ? <SearchIcon width={20} height={20} fill={colors.text100} style={{ marginLeft: 10 }} /> : null}
				<TextInput ref={textInputRef} style={{ color: colors.text100, fontSize: 14, height: 40, lineHeight: 14, padding: 10, flex: 1 }} placeholderTextColor={colors.text200} onSubmitEditing={() => buttonRef.current?.requestTVFocus()} cursorColor={colors.primary200} disableFullscreenUI autoComplete='off' {...props} />
			</Button>

			{isRight ? (
				<>
					{clearable && props.value?.length !== 0 ? (
						<Button onPress={clearable ? onClear : undefined} style={{ height: 46, width: 45 }} justifyContent='center' alignItems='center' borderStyle={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}>
							<CloseIcon width={15} height={15} fill={colors.text100} />
						</Button>
					) : null}

					{voice && props.value?.length === 0 ? <VoiceComponent onPress={Keyboard.dismiss} onSpeechPartialResult={e => e !== null && props.onChangeText?.(e)} onSpeechResult={e => e !== null && onVoice?.(e)} onSpeechError={e => (e?.code === '7' ? ToastAndroid.show('Неразборчиво', ToastAndroid.SHORT) : e?.code === 'NOT_AVAILABLE' ? ToastAndroid.show('Голосовой ввод не поддерживается', ToastAndroid.SHORT) : ToastAndroid.show('Неизвестная ошибка', ToastAndroid.SHORT))} /> : null}
				</>
			) : null}
		</TVFocusGuideView>
	)
})
