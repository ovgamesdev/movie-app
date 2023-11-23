import { Button } from '@components/atoms'
import { useTheme } from '@hooks'
import { NavigateNextIcon } from '@icons'
import React from 'react'
import { ScrollView, StyleSheet, TVFocusGuideView, Text } from 'react-native'

const LEFT_PAGE = 'LEFT'
const RIGHT_PAGE = 'RIGHT'

const generateRange = (from: number, to: number, step = 1) => {
	let i = from
	const range = []

	while (i <= to) {
		range.push(i)
		i += step
	}

	return range
}

type Props = {
	pageCount: number
	currentPage: number
	pageNeighbours?: number
	onPageChange: (page: number) => void
}

export const Pagination = ({ pageCount, currentPage, pageNeighbours = 2, onPageChange }: Props) => {
	const { colors, getColorForTheme } = useTheme()

	const goToPage = (page: number) => {
		const currentPage = Math.max(0, Math.min(page, pageCount))

		onPageChange(currentPage)
	}

	const handleMoveLeft = () => {
		const pages = fetchPageNumbers()
		const left = pages.findIndex(it => it === LEFT_PAGE)
		goToPage(Number(pages[left + 1]) - 1)

		// this.gotoPage(this.state.currentPage - this.pageNeighbours * 2 - 1);
	}
	const handleMovePrev = () => {
		goToPage(currentPage - 1)
	}

	const handleMoveRight = () => {
		const pages = fetchPageNumbers()
		const right = pages.findIndex(it => it === RIGHT_PAGE)

		goToPage(Number(pages[right - 1]) + 1)

		// this.gotoPage(this.state.currentPage + this.pageNeighbours * 2 + 1);
	}
	const handleMoveNext = () => {
		goToPage(currentPage + 1)
	}

	const fetchPageNumbers = () => {
		const totalNumbers = pageNeighbours * 2 + 3
		const totalBlocks = totalNumbers + 2

		if (pageCount > totalBlocks) {
			let pages = []

			const leftBound = currentPage - pageNeighbours
			const rightBound = currentPage + pageNeighbours
			const beforeLastPage = pageCount - 1

			const startPage = leftBound > 2 ? leftBound : 2
			const endPage = rightBound < beforeLastPage ? rightBound : beforeLastPage

			pages = generateRange(startPage, endPage)

			const pagesCount = pages.length
			const singleSpillOffset = totalNumbers - pagesCount - 1

			const leftSpill = startPage > 2
			const rightSpill = endPage < beforeLastPage

			const leftSpillPage = LEFT_PAGE
			const rightSpillPage = RIGHT_PAGE

			if (leftSpill && !rightSpill) {
				const extraPages = generateRange(startPage - singleSpillOffset, startPage - 1)
				pages = [leftSpillPage, ...extraPages, ...pages]
			} else if (!leftSpill && rightSpill) {
				const extraPages = generateRange(endPage + 1, endPage + singleSpillOffset)
				pages = [...pages, ...extraPages, rightSpillPage]
			} else if (leftSpill && rightSpill) {
				pages = [leftSpillPage, ...pages, rightSpillPage]
			}

			return [1, ...pages, pageCount]
		}

		return generateRange(1, pageCount)
	}

	const isPreviousDisabled = currentPage === 1
	const isNextDisabled = currentPage === pageCount

	if (pageCount === 1) return null

	const pages = fetchPageNumbers()

	const styles = StyleSheet.create({
		button: {
			width: 36,
			height: 36,
			justifyContent: 'center',
			alignItems: 'center',
			borderRadius: 8
		},
		label: {
			fontSize: 13,
			color: colors.text100
		}
	})

	return (
		<ScrollView horizontal contentContainerStyle={{ flexGrow: 1 }} style={{ marginTop: 10 }}>
			<TVFocusGuideView style={{ flexGrow: 1, flexDirection: 'row', justifyContent: 'center' }} autoFocus trapFocusLeft trapFocusRight>
				{!isPreviousDisabled && (
					<Button style={styles.button} padding={0} transparent onPress={handleMovePrev}>
						<NavigateNextIcon width={20} height={20} fill={colors.text100} style={{ transform: [{ rotateY: '180deg' }] }} />
					</Button>
				)}

				{pages.map((page, index) => {
					if (page === LEFT_PAGE) {
						return (
							<Button key={index} style={styles.button} padding={0} transparent onPress={handleMoveLeft}>
								<Text style={styles.label}>...</Text>
							</Button>
						)
					} else if (page === RIGHT_PAGE) {
						return (
							<Button key={index} style={styles.button} padding={0} transparent onPress={handleMoveRight}>
								<Text style={styles.label}>...</Text>
							</Button>
						)
					} else {
						return (
							<Button key={index} style={styles.button} padding={0} transparent={currentPage !== page} onPress={() => onPageChange(Number(page))} isActive={currentPage === page} activeButtonColor={colors.primary100} activePressedButtonColor={getColorForTheme({ dark: 'primary200', light: 'text200' })}>
								<Text style={[styles.label, currentPage === page && { color: colors.primary300 }]}>{page}</Text>
							</Button>
						)
					}
				})}

				{!isNextDisabled && (
					<Button style={styles.button} padding={0} transparent onPress={handleMoveNext}>
						<NavigateNextIcon width={20} height={20} fill={colors.text100} />
					</Button>
				)}
			</TVFocusGuideView>
		</ScrollView>
	)
}
