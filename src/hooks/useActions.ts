import { bindActionCreators } from '@reduxjs/toolkit'
import { useMemo } from 'react'
import { useDispatch } from 'react-redux'

import * as authExtraActions from '../store/auth/auth.actions'
import { actions as authActions } from '../store/auth/auth.slice'
import * as settingsExtraActions from '../store/settings/settings.actions'
import { actions as settingsActions } from '../store/settings/settings.slice'
import * as updateExtraActions from '../store/update/update.actions'
import { actions as updateActions } from '../store/update/update.slice'

const rootActions = {
	...authActions,
	...authExtraActions,
	...settingsActions,
	...settingsExtraActions,
	...updateActions,
	...updateExtraActions
}

export const useActions = () => {
	const dispatch = useDispatch()

	return useMemo(() => bindActionCreators(rootActions, dispatch), [dispatch])
}
