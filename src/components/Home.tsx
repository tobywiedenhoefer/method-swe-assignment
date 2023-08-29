import { useNavigate } from 'react-router-dom'
import { Button } from '@mui/material'
import { UploadFileSharp, AssessmentSharp } from '@mui/icons-material'

const Home = () => {
    const nav = useNavigate()
    const navigate = {
        payouts: () => nav('/payouts'),
        reporting: () => nav('/reporting')
    }
    return (
       <div className='button-container'>
            <Button size='large' component='label' variant='contained' startIcon={<UploadFileSharp />} onClick={navigate.payouts}>
                Upload Biweekly Payouts
            </Button>
            <Button size='large' color='primary' variant='outlined' startIcon={<AssessmentSharp />} onClick={navigate.reporting}>
                Access Reporting
            </Button>
       </div> 
    )
}

export default Home