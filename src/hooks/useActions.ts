import { bindActionCreators } from '@reduxjs/toolkit'
import { useMemo } from 'react'
import { useDispatch } from 'react-redux'

import { authActions, authExtraActions } from '@store/auth'
import { safeAreaActions } from '@store/safeArea'
import { settingsActions, settingsExtraActions } from '@store/settings'
import { updateActions, updateExtraActions } from '@store/update'

const rootActions = {
	...authActions,
	...authExtraActions,
	...settingsActions,
	...settingsExtraActions,
	...updateActions,
	...updateExtraActions,
	...safeAreaActions
}

export const useActions = () => {
	const dispatch = useDispatch()

	return useMemo(() => bindActionCreators(rootActions, dispatch), [dispatch])
}
