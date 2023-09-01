import { useState, ChangeEvent } from 'react'
import { Button, Typography } from '@mui/material'
import { UploadFileSharp } from '@mui/icons-material'
import axios from 'axios'


type SelectedFile = {
    file: File | null,
    loaded: boolean
}


const Payouts = () => {
    const [selectedFile, setSelectedFile] = useState<SelectedFile>({file: null, loaded: false})

    const handleUpload = async (e: ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) {
            return
        }
        const file = e.target.files[0]
        setSelectedFile({file: file, loaded: true})
    }

    const handleClick = async () => {
        console.log('handled click')
        const data = new FormData()
        data.append('file', selectedFile.file as Blob)
        const res = await axios.post('http://localhost:8000/upload', data)
        if (res.status != 200) {
            return
        }
        await axios.post('http://localhost:8000/process', { filename: res.data })
    }

    return (
        <div className='payout-submission-form'>
            <div className='file-upload'>
                <div className='file-upload-button'>
                    <Button variant='outlined' size='large' component='label' className='upload-button' startIcon={<UploadFileSharp />}>
                        Upload Biweekly Payouts
                        <input type='file' accept='.xml' hidden onChange={handleUpload} />
                    </Button>
                </div>
                <div className="uploaded-file-text-container">
                    <Typography className='left'>Uploaded File:</Typography>
                    <Typography className='right'>
                        {selectedFile.loaded ? selectedFile.file!.name : "None"}
                    </Typography>
                </div>
            </div>
            <div className='submit-button'>
                <Button variant='contained' size='large' className='submit-button' onClick={handleClick} disabled={!selectedFile.loaded}>
                    Submit
                </Button>
            </div>
        </div>
    )
}

export default Payouts