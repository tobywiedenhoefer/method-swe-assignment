import express from 'express'
import multer from 'multer'
import cors from 'cors'

const app = express()
app.use(cors())
app.use(express.json())

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public')
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname)
    }
})

const upload = multer({ storage: storage }).single('file')

app.post('/upload', (req, res) => {
    upload(req, res, (err) => {
        if (err) {
            return res.status(500).json(err)
        }
        return res.status(200).send(req.file.filename)
    })
})

app.post('/process', async (req, res) => {
    console.log(req.body)
    // await fetch(`./public/${req}`)
})

app.listen(8000, () => {
    console.log('App running on 8000')
})