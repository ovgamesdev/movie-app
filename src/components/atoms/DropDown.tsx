import { Button, ButtonType } from '@components/atoms'
import { useTheme } from '@hooks'
import { CheckIcon, ExpandMoreIcon } from '@icons'
import React, { useRef, useState } from 'react'
import { Dimensions, FlatList, TVFocusGuideView, Text, View } from 'react-native'
import Modal from 'react-native-modal'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

interface IItem<T> {
	value: T
	label: string
}

type Position = { top?: number; right?: number; bottom?: number; left?: number }

interface Props<T> {
	type?: 'toLeftTop' | 'toLeftBottom' | 'toRightTop' | 'toRightBottom' | 'fullWidthToBottom'
	items: IItem<T>[]
	value: T
	onChange: (value: T) => void
}

export const DropDown = <T extends string | number | null>({ type = 'toLeftBottom', items, value, onChange }: Props<T>) => {
	const [isVisible, setIsVisible] = useState(false)
	const insets = useSafeAreaInsets()
	const { colors } = useTheme()

	const buttonRef = useRef<ButtonType>(null)
	const modalRef = useRef<View>(null)
	const optionsRef = useRef<(ButtonType | null)[]>([])
	const [position, setPosition] = useState<Position>({})

	const ITEM_HEIGHT = 38

	const onClose = () => {
		setIsVisible(false)
	}

	const onOpen = () => {
		onLayout()
		setIsVisible(is => !is)
	}

	const onSelect = (value: T) => {
		onClose()
		onChange(value)
	}

	const screen = Dimensions.get('window')

	const onLayout = () => {
		buttonRef.current?.buttonRef?.measure((x, y, width, height, pageX, pageY) => {
			// console.log('measure', { x, y, width, height, pageX, pageY })
			const padding = 5

			if ([x, y, width, height, pageX, pageY].find((it: number | undefined) => it === undefined)) return

			// TODO check is quit of screen
			switch (type) {
				case 'toLeftTop':
					setPosition({ bottom: screen.height - pageY - insets.bottom + padding, right: screen.width - (pageX + width) - insets.right })
					break
				case 'toLeftBottom':
					setPosition({ top: height + pageY - insets.top + padding, right: screen.width - (pageX + width) - insets.right })
					break
				case 'toRightTop':
					setPosition({ bottom: screen.height - pageY - insets.bottom + padding, left: pageX - insets.left })
					break
				case 'toRightBottom':
					setPosition({ top: height + pageY - insets.top + padding, left: pageX - insets.left })
					break
				case 'fullWidthToBottom':
					setPosition({ top: height + pageY - insets.top + padding, right: screen.width - padding, left: padding })
					break
			}
		})
	}

	const onModalLayout = () => {
		modalRef.current?.measure((_x, _y, _width, height) => {
			if (!position.top) return

			const margin = 10
			const padding = 30

			if (position.top && position.top + height + padding > screen.height) {
				if (height > screen.height) {
					setPosition({ ...position, bottom: margin, top: margin })
				} else {
					setPosition({ ...position, bottom: margin, top: screen.height - height - padding })
				}
			}
		})
	}

	const checkedIndex = items.findIndex(it => it.value === value)
	const checkedItem = items[checkedIndex]

	const _onShow = () => {
		optionsRef.current[checkedIndex]?.requestTVFocus()
		onModalLayout()
	}

	return (
		<TVFocusGuideView trapFocusDown trapFocusLeft trapFocusRight trapFocusUp>
			<Button ref={buttonRef} onLayout={onLayout} onPress={onOpen} flex={0} flexDirection='row'>
				<Text style={{ color: colors.text100 }} numberOfLines={1}>
					{checkedItem.label}
				</Text>
				<ExpandMoreIcon width={20} height={20} fill={colors.text100} style={{ marginLeft: 10, transform: isVisible ? [{ rotateX: '180deg' }] : [] }} />
			</Button>

			{/* FIXME: shadow not animated { shadowColor: colors.text100, elevation: 7, shadowRadius: 4.65, shadowOffset: { height: 3, width: 0 }, shadowOpacity: 0.29 } */}
			<Modal isVisible={isVisible} onShow={_onShow} onBackdropPress={onClose} onBackButtonPress={onClose} backdropOpacity={0.25} animationIn='fadeIn' animationOut='fadeOut' hideModalContentWhileAnimating useNativeDriver style={{ margin: 0 }}>
				<View ref={modalRef} style={{ position: 'absolute', backgroundColor: colors.bg200, borderRadius: 6, overflow: 'hidden', minWidth: type === 'fullWidthToBottom' ? screen.width - 10 : 200, maxWidth: '100%', maxHeight: ITEM_HEIGHT * 6, ...position }}>
					<FlatList
						data={items}
						renderItem={({ item, index }) => {
							const isChecked = value === item.value

							return (
								<Button key={index} ref={ref => (optionsRef.current[index] = ref)} onPress={() => onSelect(item.value)} flexDirection='row' justifyContent='space-between'>
									<Text style={{ color: isChecked ? colors.text100 : colors.text200 }} numberOfLines={1}>
										{item.label}
									</Text>
									{isChecked && <CheckIcon width={20} height={20} fill={colors.text100} style={{ marginLeft: 5 }} />}
								</Button>
							)
						}}
						getItemLayout={(_, index) => ({ length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index })}
					/>
				</View>
			</Modal>
		</TVFocusGuideView>
	)
}
