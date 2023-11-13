import { Button } from '@components/atoms'
import { useActions, useTheme, useTypedSelector } from '@hooks'
import { FC, useRef } from 'react'
import { TVFocusGuideView, Text, TextInput, TextInputProps, View } from 'react-native'
import { InputSettingsKey } from 'src/store/settings/types'

interface Props extends TextInputProps {
	item: InputSettingsKey
}

export const Input: FC<Props> = ({ item, ...props }) => {
	const { setItem } = useActions()
	const value = useTypedSelector(state => state.settings.settings[item])
	const { colors } = useTheme()

	const buttonRef = useRef<View | null>(null)
	const textInputRef = useRef<TextInput | null>(null)

	return (
		<>
			<TVFocusGuideView style={{ marginVertical: 5, height: 40, paddingVertical: 5, flexDirection: 'row', alignItems: 'center' }} trapFocusLeft trapFocusRight>
				<Text style={{ color: colors.text100, flex: 1 }}>{item}</Text>
				<Button ref={buttonRef} onPress={() => textInputRef.current?.focus()} padding={0} flex={1}>
					<TextInput
						ref={textInputRef}
						onChange={e => setItem({ [item]: e.nativeEvent.text })}
						value={value}
						placeholder='Settings value'
						// style={{ paddingLeft: 10, height: 40, backgroundColor: colors.bg200, color: colors.text100, borderRadius: 6, borderBottomWidth: 1, borderBottomColor: colors.bg300 }}
						style={{ color: colors.text100, fontSize: 14, height: 40, padding: 10 }}
						placeholderTextColor={colors.text200}
						onSubmitEditing={() => buttonRef.current?.requestTVFocus()}
						cursorColor={colors.primary200}
						disableFullscreenUI
						autoComplete='off'
						{...props}
					/>
				</Button>
			</TVFocusGuideView>
			<View style={{ borderBlockColor: colors.bg300, borderBottomWidth: 1 }} />
		</>
	)
}
