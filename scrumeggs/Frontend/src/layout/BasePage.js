import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import SideMenu from './sidemenu'

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
  },
  // necessary for content to be below app bar
  toolbar: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.default,
    marginTop: '5rem'
    },
}))


const BasePage = ({ children }) => {
  const classes = useStyles()

  return (
    <>
      <div className={classes.root}>
        <SideMenu />
        <main className={classes.content}>
          {children}
        </main>
      </div>
    </>
  )
}

export default BasePage