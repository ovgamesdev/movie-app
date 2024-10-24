import { Button, ButtonType } from '@components/atoms'
import { CloseIcon, SearchIcon } from '@icons'
import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import { TVFocusGuideView, TextInput, TextInputProps } from 'react-native'
import { useStyles } from 'react-native-unistyles'

export interface InputProps extends TextInputProps {
	transparent?: boolean
	icon?: 'search'
	clearable?: boolean
	onClear?: () => void

	// styles
	flex?: number
}

export type InputType = {
	requestTVFocus: () => void
	focus: () => void
}

export const Input = forwardRef<InputType, InputProps>(({ transparent, icon, clearable, onClear, flex, placeholder, ...props }, forwardRef) => {
	const { theme } = useStyles()

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

	const isClearable = !!clearable && props.value?.length !== 0

	return (
		<TVFocusGuideView style={{ flexDirection: 'row', flex }} autoFocus>
			<Button ref={buttonRef} onPress={() => textInputRef.current?.focus()} padding={0} flex={1} flexDirection='row' alignItems='center' borderStyle={isClearable ? { borderTopRightRadius: 0, borderBottomRightRadius: 0 } : undefined}>
				{icon === 'search' ? <SearchIcon width={20} height={20} fill={theme.colors.text100} style={{ marginLeft: 10 }} /> : null}
				{/* FIXME: If there is no onBlur={() => buttonRef.current?.requestTVFocus()}, then when unfocusing from TextInput and trying to focus on it next time, it does not focus on button */}
				<TextInput ref={textInputRef} style={{ color: theme.colors.text100, fontSize: 14, height: 40, padding: 10, flex: 1 }} placeholder={placeholder} placeholderTextColor={theme.colors.text200} onSubmitEditing={() => buttonRef.current?.requestTVFocus()} onBlur={() => buttonRef.current?.requestTVFocus()} cursorColor={theme.colors.primary200} disableFullscreenUI autoComplete='off' {...props} />
			</Button>

			{isClearable ? (
				<Button onPress={onClear} style={{ height: 46, width: 45 }} justifyContent='center' alignItems='center' borderStyle={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}>
					<CloseIcon width={15} height={15} fill={theme.colors.text100} />
				</Button>
			) : null}
		</TVFocusGuideView>
	)
})
