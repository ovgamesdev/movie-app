import { bindActionCreators } from '@reduxjs/toolkit'
import { useMemo } from 'react'
import { useDispatch } from 'react-redux'

import * as authExtraActions from '../store/auth/auth.actions'
import { actions as authActions } from '../store/auth/auth.slice'
import * as settingsExtraActions from '../store/settings/settings.actions'
import { actions as settingsActions } from '../store/settings/settings.slice'

const rootActions = {
	...authActions,
	...authExtraActions,
	...settingsActions,
	...settingsExtraActions
}

export const useActions = () => {
	const dispatch = useDispatch()

	return useMemo(() => bindActionCreators(rootActions, dispatch), [dispatch])
}
