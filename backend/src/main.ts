import express, { Express } from 'express'
import multer from 'multer'
import cors from 'cors'
import fs from 'fs'
import { xml2js } from 'xml-js'
import { Method, Environments } from 'method-node'
import { Parser } from 'json2csv'

import Row from './types/Row.type'
import { collections, run as runMongo } from './mongo.ts'
import logger from './logger.ts'
import processRateLimiter from './ProcessRateLimiter.ts'

runMongo()

const app: Express = express()
app.use(cors())
app.use(express.json())

const method = new Method({ 
  env: Environments.dev
})

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, 'public')
  },
  filename: (_req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname)
  }
})

const upload = multer({ storage: storage }).single('file')

app.post('/upload', (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      return res.status(500).json(err)
    } else if (!req) {
      return res.status(404)
    } else if (!req.file) {
      return res.status(404)
    }
    return res.status(200).send(req.file.filename)
  })
})

app.get('/getCurrent', async(_req, res) => {
  const currJob = await collections.Jobs.findOne({ isCurrent: true })
  if (!currJob) {
    return res.status(404).json({ message: "Current job does not exist." })
  }
  return res.status(200).json({
    filename: currJob.jobName,
    isFinished: currJob.isFinished
  })
})

type DunkinBranchFundsReport = {
  dunkinBranchId: string,
  amount: number
}

app.get('/getDunkinBranchFundsReport', async (_req, res) => {
  const currJob = await collections.Jobs.findOne({ isCurrent: true })
  if (!currJob) {
    return res.status(404).json({ message: "Current job does not exist." })
  }
  const dunkinBranches: DunkinBranchFundsReport[] = []
  const currPayments = await collections.PaymentReports.find({ jobName: currJob.jobName })
  let currDoc = await currPayments.hasNext() ? await currPayments.next() : null
  while (currDoc) {
    const currEntry = dunkinBranches.find(e => e.dunkinBranchId === currDoc!.paymentBranchId)
    if (currEntry) {
      currEntry.amount += currDoc.paymentAmount
    } else {
      dunkinBranches.push({ dunkinBranchId: currDoc.paymentBranchId, amount: currDoc. paymentAmount })
    }
    currDoc = await currPayments.hasNext() ? await currPayments.next() : null
  }
  const csvFields = [{
    label: 'Dunkin Branch Id',
    value: 'paymentBranchId'
  }, {
    label: 'Amount',
    value: 'amount'
  }]
  try {
    const json2csv = new Parser({ fields: csvFields })
    const csv = json2csv.parse(dunkinBranches)
    res.attachment('DunkinBranchFundsPaidOut.csv')
    return res.status(200).send(csv)
  } catch (e) {
    let err: string
    if (e instanceof Error) {
      err = `${e.name} ${e.message}`
    } else {
      err = String(e)
    }
    logger.log(err)
    return res.status(404).send(err)
  }
})

type PaymentStatus = {
  paymentId: string,
  paymentStatus: string,
  paymentSourceAccount: string,
  paymentBranchId: string,
  paymentAmount: string,
  paymentMetaData: string
}

app.get('/getPayments',async (_req, res) => {
  const currJob = await collections.Jobs.findOne({ isCurrent: true })
  if (!currJob) {
    return res.status(404).json({ message: "current job does not exist." })
  }
  const payments: PaymentStatus[] = []
  const currPayments = await collections.PaymentReports.find({ jobName: currJob.jobName })
  let currDoc = await currPayments.hasNext() ? await currPayments.next() : null
  while (currDoc) {
    payments.push({
      paymentId: currDoc.paymentId,
      paymentStatus: currDoc.paymentStatus,
      paymentSourceAccount: currDoc.paymentSourceAccount,
      paymentBranchId: currDoc.paymentBranchId,
      paymentAmount: currDoc.paymentAmount,
      paymentMetaData: currDoc.paymentMetaData
    })
    currDoc = await currPayments.hasNext() ? await currPayments.next() : null
  }
  const csvFields = [{
    label: 'Payment Id',
    value: 'paymentId'
  }, {
    label: 'Status',
    value: 'paymentStatus'
  }, {
    label: 'Source Account',
    value: 'paymentSourceAccount'
  }, {
    label: 'Branch Id',
    value: 'paymentBranchId'
  }, {
    label: 'Amount',
    value: 'paymentAmount'
  }, {
    label: 'Payment Meta Data',
    value: 'paymentMetaData'
  }]
  try {
    const json2csv = new Parser({ fields: csvFields })
    const csv = json2csv.parse(payments)
    res.attachment('PaymentStatuses.csv')
    return res.status(200).send(csv)
  } catch (e) {
    let err: string
    if (e instanceof Error) {
      err = `${e.name} ${e.message}`
    } else {
      err = String(e)
    }
    logger.log(err)
    return res.status(500).send(err)
  }
})

type SourceAccountReport = {
  sourceAccountId: string,
  amount: number
}

app.get('/getSourceAccountFundsPaidReport', async (_req, res) => {
  const currJob = await collections.Jobs.findOne({ isCurrent: true })
  if (!currJob) {
    return res.status(404).json({ message: "Current job does not exist." })
  }
  const sourceAccounts: SourceAccountReport[] = []
  const currPayments = await collections.PaymentReports.find({ jobName: currJob.jobName })
  let currDoc = await currPayments.hasNext() ? await currPayments.next() : null
  while (currDoc) {
    const currEntry = sourceAccounts.find(e => e.sourceAccountId === currDoc!.paymentSourceAccount)
    if (currEntry) {
      currEntry.amount += currDoc.paymentAmount
    } else {
      sourceAccounts.push({sourceAccountId: currDoc.paymentSourceAccount, amount: currDoc.paymentAmount})
    }
    currDoc = await currPayments.hasNext() ? await currPayments.next() : null
  }
  const csvFields = [{
    label: 'Source Account Id',
    value: 'sourceAccountId'
  }, {
    label: 'Amount',
    value: 'amount'
  }]
  try {
    const json2csv = new Parser({ fields: csvFields })
    const csv = json2csv.parse(sourceAccounts)
    res.attachment('SourceAccountFundsPaid.csv')
    return res.status(200).send(csv)
  } catch (e) {
    let err: string
    if (e instanceof Error) {
      err = `${e.name} ${e.message}`
    } else {
      err = String(e)
    }
    logger.log(err)
    return res.status(500).send(err)
  }
})

app.post('/process', async (req, res) => {
  if (fs.existsSync(`./public/${req.body.filename}`)) {
    return res.status(202).send({ message: "Processing file."})
  }
  try {
    const xml = fs.readFileSync(`./public/${req.body.filename}`).toString()
    const js = xml2js(xml, {compact: true})
    const rows: Array<Row> = js['root' as keyof typeof js]['row']
    const prevJob = await collections.Jobs.findOne({ isCurrent: true })
    if (prevJob) {
      await collections.Jobs.updateOne({ jobName: prevJob!.jobName }, { isCurrent: false })
    }
    await collections.Jobs.insertOne({
      isFinished: false,
      isCurrent: true,
      jobName: req.body.filename
    })
    await processRateLimiter(rows, method, req.body.filename)
    fs.unlinkSync(`./public/${req.body.filename}`)
  } catch (e) {
    return res.status(400).send()
  }
  await collections.Jobs.updateOne({ isCurrent: true }, { isFinished: true })
  return res.status(200).send()
})

app.listen(8000, () => {
  logger.log('App running on 8000')
})

