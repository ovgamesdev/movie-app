import { Button, ButtonType } from '@components/atoms'
import { useTheme } from '@hooks'
import { CheckIcon, ExpandMoreIcon } from '@icons'
import React, { useRef, useState } from 'react'
import { Dimensions, TVFocusGuideView, Text, View } from 'react-native'
import Modal from 'react-native-modal'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

interface IItem<T> {
	value: T
	label: string
}

interface Props<T> {
	type?: 'toLeftTop' | 'toLeftBottom' | 'toRightTop' | 'toRightBottom'
	items: IItem<T>[]
	value: T
	onChange: (value: T) => void
}

export const DropDown = <T extends any>({ type = 'toLeftBottom', items, value, onChange }: Props<T>) => {
	const [isVisible, setIsVisible] = useState(false)
	const insets = useSafeAreaInsets()
	const { colors } = useTheme()

	const buttonRef = useRef<ButtonType>(null)
	const optionsRef = useRef<(ButtonType | null)[]>([])
	const position = useRef<{ top?: number; right?: number; bottom?: number; left?: number }>({})

	const onClose = () => {
		setIsVisible(false)
	}

	const onSelect = (value: T) => {
		onClose()
		onChange(value)
	}

	const onLayout = () => {
		buttonRef.current?.buttonRef?.measure((x, y, width, height, pageX, pageY) => {
			console.log('measure', { x, y, width, height, pageX, pageY })
			const screen = Dimensions.get('window')
			const padding = 5

			// TODO check is quit of screen
			if (type === 'toLeftTop') {
				position.current = { bottom: screen.height - pageY - insets.bottom + padding, right: screen.width - (pageX + width) - insets.right }
			} else if (type === 'toLeftBottom') {
				position.current = { top: height + pageY - insets.top + padding, right: screen.width - (pageX + width) - insets.right }
			} else if (type === 'toRightTop') {
				position.current = { bottom: screen.height - pageY - insets.bottom + padding, left: pageX - insets.left }
			} else if (type === 'toRightBottom') {
				position.current = { top: height + pageY - insets.top + padding, left: pageX - insets.left }
			}
		})
	}

	const checkedIndex = items.findIndex(it => it.value === value)
	const checkedItem = items[checkedIndex]

	const _onShow = () => {
		optionsRef.current[checkedIndex]?.requestTVFocus()
	}

	if (!checkedItem) {
		return null
	}

	return (
		<TVFocusGuideView trapFocusDown trapFocusLeft trapFocusRight trapFocusUp>
			<Button ref={buttonRef} onLayout={onLayout} onPress={() => setIsVisible(is => !is)} flex={0} flexDirection='row'>
				<Text style={{ color: colors.text100 }} numberOfLines={1}>
					{checkedItem.label}
				</Text>
				<ExpandMoreIcon width={20} height={20} fill={colors.text100} style={{ marginLeft: 10, transform: isVisible ? [{ rotateX: '180deg' }] : [] }} />
			</Button>

			<Modal isVisible={isVisible} onShow={_onShow} onBackdropPress={onClose} onBackButtonPress={onClose} backdropOpacity={0.2} animationIn='fadeIn' animationOut='fadeOut' hideModalContentWhileAnimating useNativeDriver style={{ margin: 0 }}>
				<View style={[{ position: 'absolute', backgroundColor: colors.bg200, borderRadius: 6 }, position.current, { minWidth: 200, maxWidth: '100%', maxHeight: '100%' }, { shadowColor: colors.text100, elevation: 7, shadowRadius: 4.65, shadowOffset: { height: 3, width: 0 }, shadowOpacity: 0.29 }]}>
					{items.map((item, i) => {
						const isChecked = value === item.value

						return (
							<Button key={i} ref={ref => (optionsRef.current[i] = ref)} onPress={() => onSelect(item.value)} flexDirection='row' justifyContent='space-between'>
								<Text style={{ color: isChecked ? colors.text100 : colors.text200 }} numberOfLines={1}>
									{item.label}
								</Text>
								{isChecked && <CheckIcon width={20} height={20} fill={isChecked ? colors.text100 : colors.text200} style={{ marginLeft: 5 }} />}
							</Button>
						)
					})}
				</View>
			</Modal>
		</TVFocusGuideView>
	)
}
