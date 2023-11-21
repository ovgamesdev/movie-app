import { Input as MyInput } from '@components/atoms'
import { useActions, useTheme, useTypedSelector } from '@hooks'
import { FC } from 'react'
import { TVFocusGuideView, Text, TextInputProps, View } from 'react-native'
import { InputSettingsKey } from 'src/store/settings/types'

interface Props extends TextInputProps {
	item: InputSettingsKey
}

export const Input: FC<Props> = ({ item, ...props }) => {
	const { setItem } = useActions()
	const value = useTypedSelector(state => state.settings.settings[item])
	const { colors } = useTheme()

	return (
		<>
			<TVFocusGuideView style={{ marginVertical: 5, height: 40, paddingVertical: 5, flexDirection: 'row', alignItems: 'center' }} autoFocus trapFocusLeft trapFocusRight>
				<Text style={{ color: colors.text100, flex: 1 }}>{item}</Text>
				<MyInput onChange={e => setItem({ [item]: e.nativeEvent.text })} value={value} placeholder='Settings value' flex={1} {...props} />
			</TVFocusGuideView>
			<View style={{ borderBlockColor: colors.bg300, borderBottomWidth: 1 }} />
		</>
	)
}
