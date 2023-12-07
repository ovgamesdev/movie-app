import { Button, ButtonType } from '@components/atoms'
import { useTheme } from '@hooks'
import { CheckIcon, ExpandMoreIcon } from '@icons'
import React, { useRef, useState } from 'react'
import { Dimensions, ScrollView, TVFocusGuideView, Text, View } from 'react-native'
import Modal from 'react-native-modal'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

interface IItem<T> {
	value: T
	label: string
}

type Position = { top?: number; right?: number; bottom?: number; left?: number }

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
	const modalRef = useRef<View>(null)
	const optionsRef = useRef<(ButtonType | null)[]>([])
	const [position, setPosition] = useState<Position>({})

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

	const onLayout = () => {
		buttonRef.current?.buttonRef?.measure((x, y, width, height, pageX, pageY) => {
			console.log('measure', { x, y, width, height, pageX, pageY })
			const screen = Dimensions.get('window')
			const padding = 5

			if ([x, y, width, height, pageX, pageY].find(it => it === undefined)) return

			if (type === 'toLeftTop') {
				// TODO check is quit of screen
				setPosition({ bottom: screen.height - pageY - insets.bottom + padding, right: screen.width - (pageX + width) - insets.right })
			} else if (type === 'toLeftBottom') {
				setPosition({ top: height + pageY - insets.top + padding, right: screen.width - (pageX + width) - insets.right })
			} else if (type === 'toRightTop') {
				setPosition({ bottom: screen.height - pageY - insets.bottom + padding, left: pageX - insets.left })
			} else if (type === 'toRightBottom') {
				setPosition({ top: height + pageY - insets.top + padding, left: pageX - insets.left })
			}
		})
	}

	const onModalLayout = () => {
		modalRef.current?.measure((x, y, width, height, pageX, pageY) => {
			const screen = Dimensions.get('window')

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

	if (!checkedItem) {
		return null
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
				<View ref={modalRef} style={{ position: 'absolute', backgroundColor: colors.bg200, borderRadius: 6, overflow: 'hidden', minWidth: 200, maxWidth: '100%', maxHeight: '100%', ...position }}>
					<ScrollView>
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
					</ScrollView>
				</View>
			</Modal>
		</TVFocusGuideView>
	)
}
