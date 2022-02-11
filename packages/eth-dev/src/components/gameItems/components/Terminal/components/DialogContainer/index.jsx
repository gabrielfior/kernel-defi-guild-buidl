import React, { useEffect } from 'react'
import $ from 'jquery'
import { connectController } from '../../controller'
import { Button } from '../../..'

const DialogContainer = ({ currentLevel, dialog, globalGameActions, actions, parentProps }) => {
  const scrollToBottom = _elementSelector => {
    let elementSelector = `#terminalDialogContainer .content`
    if (_elementSelector) elementSelector = _elementSelector
    const { scrollHeight } = $(elementSelector)[0]
    $(elementSelector).animate({ scrollTop: scrollHeight }, 'slow')
  }

  useEffect(() => {
    scrollToBottom()
  }, [dialog.currentDialogIndex])

  const { currentDialog, currentDialogIndex, dialogIndexMap, dialogPathsVisibleToUser } = dialog

  // add isVisibleToUser flag to all dialog parts where 'dialogPathId' is not included in dialogPathsVisibleToUser[]
  const filteredDialog = currentDialog.map((dialogStep, index) => {
    const reachedIndex = index <= currentDialogIndex
    const isVisibleToUser =
      dialogPathsVisibleToUser.includes(dialogStep.dialogPathId) && reachedIndex
    return {
      ...dialogStep,
      isVisibleToUser
    }
  })

  return (
    <div
      id='terminalDialogContainer'
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: '100%',
        height: '63%',
        display: 'flex',
        flexDirection: 'column',
        alignContent: 'flex-end',

        marginTop: '50%',
        paddingLeft: '10%',
        paddingRight: '20%'
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
          placeContent: 'flex-end',
          overflow: 'auto',
          // for firefox
          minHeight: 0
        }}
      >
        <div
          className='content'
          style={{
            float: 'left',
            width: '100%',
            overflowY: 'scroll',
            overflowX: 'hidden'
          }}
        >
          {filteredDialog.map((dialogStep, index) => {
            const isLastVisibleDialog = index === currentDialogIndex
            const isFinalDialog = index === dialog.length - 1

            const {
              components: { dialog: dialogComp, choices: choicesComp } = {},
              dialogPathId,
              isVisibleToUser
            } = dialogStep || {}

            return (
              <>
                {dialogComp &&
                  isVisibleToUser &&
                  dialogComp({
                    dialog,
                    isLastVisibleDialog,
                    globalGameActions,
                    ...parentProps
                  })}
              </>
            )
          })}
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          padding: 10,
          paddingTop: 0
        }}
      >
        {filteredDialog.map((dialogStep, index) => {
          const isLastVisibleDialog = index === currentDialogIndex
          const isFinalDialog = index === dialog.length - 1

          const {
            components: { dialog: dialogComp, choices: choicesComp } = {},
            dialogPathId,
            isVisibleToUser
          } = dialogStep || {}

          return (
            <>
              {choicesComp &&
                isVisibleToUser &&
                choicesComp({
                  dialog,
                  isLastVisibleDialog,
                  globalGameActions,
                  ...parentProps
                })}
              {!choicesComp && isLastVisibleDialog && (
                <Button onClick={() => globalGameActions.dialog.continueDialog()}>Continue</Button>
              )}
            </>
          )
        })}
      </div>
    </div>
  )
}

export default connectController(DialogContainer)
