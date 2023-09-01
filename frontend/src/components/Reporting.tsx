import { useState, useEffect } from 'react'
import { Button } from '@mui/material'
import axios from 'axios'
import { Typography } from '@mui/joy'

const Reporting = () => {
    const [currentJob, setCurrentJob] = useState<string | null>(null) 
    const [currentJobFinished, setCurrentJobFinished] = useState<boolean>(false)

    useEffect(() => {
        const getCurrentJob = async () => {
            const curr = await axios.get('http://localhost:8000/getCurrent')
            console.log(curr)
            if (curr.status != 200) {
                return
            }
            setCurrentJob(curr.data.filename)
            setCurrentJobFinished(curr.data.isFinished)
        }
        getCurrentJob()
    }, [])

    return (
        <div className="button-container">
            <Button 
                size="large" 
                variant="contained" 
                target='_blank'
                href='http://localhost:8000/getSourceAccountFundsPaidReport'
                download
            >
                Funds Paid Out Per Source Account
            </Button>
            <Button 
                size="large" 
                variant="contained"
                target='_blank'
                href='http://localhost:8000/getDunkinBranchFundsReport'
                download
            >
                Funds Paid Out Per Dunkin Branch
            </Button>
            <Button 
                size="large" 
                variant="contained" 
                target='_blank'
                href='http://localhost:8000/getPayments'
                download
            >
                Status of Every Payment
            </Button>
            <div className='uploaded-file-text-container'>
                <Typography>Current Job: </Typography>
                <Typography>
                    {currentJob ?
                        ` ${currentJob} is ${currentJobFinished ? '' : 'not'} finished.` :
                        ` A job has not been submitted.`}
                </Typography>
            </div>
        </div>
    )
}

export default Reporting