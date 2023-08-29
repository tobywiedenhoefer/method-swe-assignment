import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  MenuItem,
} from '@mui/material'
import FreeBreakfastOutlinedIcon from '@mui/icons-material/FreeBreakfastOutlined';
import { Outlet, useNavigate } from 'react-router-dom'

const Header = () => {
  const nav = useNavigate()
  const navigate = {
    home: () => nav('/'),
    payouts: () => nav('/payouts'),
    reporting: () => nav('/reporting')
  }
  return (
    <>
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position='static'>
          <Toolbar className='navbar-anchor'>
            <MenuItem onClick={navigate.home}>
              <FreeBreakfastOutlinedIcon />
              <Typography 
                component='a' 
                variant='h5' 
              >
                Dunkin Payments
              </Typography>
            </MenuItem>
            <div className='navbar'>
              <MenuItem onClick={navigate.payouts}>
                <Typography variant='h6'>
                  Payouts
                </Typography>
              </MenuItem>
              <MenuItem onClick={navigate.reporting}>
                <Typography variant='h6'>
                  Reporting
                </Typography>
              </MenuItem>
            </div>
          </Toolbar>
        </AppBar>
      </Box>
      <Outlet />
    </>
  )
}

export default Header