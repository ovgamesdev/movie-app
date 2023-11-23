import { Button } from '@components/atoms'
import { useActions, useTheme, useTypedSelector } from '@hooks'
import { FC } from 'react'
import { TVFocusGuideView, Text, View } from 'react-native'
import { ISettings, SelectSettingsKey } from 'src/store/settings/settings.types'

interface SelectProps<K extends SelectSettingsKey> {
	item: K
	options: { value: ISettings[K]; title: string }[]
}

export const Select: FC<SelectProps<SelectSettingsKey>> = ({ item, options }) => {
	const { setItem } = useActions()
	const value = useTypedSelector(state => state.settings.settings[item])
	const { colors, getColorForTheme } = useTheme()

	return (
		<>
			<View style={{ marginVertical: 5, height: 40, paddingVertical: 5, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
				<Text style={{ color: colors.text100 }}>theme: {value}</Text>
				<TVFocusGuideView style={{ flexDirection: 'row', borderRadius: 6 }} autoFocus trapFocusLeft trapFocusRight>
					{options.map((option, i) => {
						const isEnd = options.length - 1 === i
						const isStart = 0 === i
						const isActive = value === option.value

						return (
							<Button
								key={i}
								text={option.title}
								onPress={() => value !== option.value && setItem({ [item]: option.value })}
								justifyContent='center'
								padding={0}
								paddingHorizontal={10}
								isActive={isActive}
								textColor={colors.text100}
								activeTextColor={colors.primary300}
								buttonColor={colors.bg200}
								activeButtonColor={colors.primary100}
								activePressedButtonColor={getColorForTheme({ dark: 'primary200', light: 'text200' })}
								borderStyle={{
									borderTopLeftRadius: isStart ? 36.5 : 0,
									borderBottomLeftRadius: isStart ? 36.5 : 0,
									borderTopRightRadius: isEnd ? 36.5 : 0,
									borderBottomRightRadius: isEnd ? 36.5 : 0,
									borderColor: getColorForTheme({ dark: 'bg300', light: 'primary100' }),
									borderTopWidth: 1,
									borderBottomWidth: 1,
									borderRightWidth: 1,
									borderLeftWidth: isStart ? 1 : 0
								}}
								style={{ height: 24 + 4 }}
							/>
						)
					})}
				</TVFocusGuideView>
			</View>
			<View style={{ borderBlockColor: colors.bg300, borderBottomWidth: 1 }} />
		</>
	)
}
