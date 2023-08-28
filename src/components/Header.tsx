import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  MenuItem,
} from '@mui/material'

const Header = () => {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position='static'>
        <Toolbar>
          <MenuItem key='home' onClick={() => {}}>
            <Typography 
              component='a' 
              variant='h5' 
              href='/'
              style={{ textDecoration: 'none', color: 'white' }}
            >
              Dunkin Payments
            </Typography>
          </MenuItem>
          <div style={{ marginLeft: 'auto', display: 'flex', 'justifyContent': 'space-between'}}>
            <Typography 
              component='a'
              variant='h6' 
              href='/payouts'
              style={{ textDecoration: 'none', color: 'white', paddingRight: '5rem'}}
            >
              Payouts
            </Typography>
            <Typography 
              component='a'
              variant='h6' 
              href='/reporting'
              style={{ textDecoration: 'none', color: 'white' }}
            >
              Reporting
            </Typography>
          </div>
        </Toolbar>
      </AppBar>
    </Box>
  )
}

export default Header