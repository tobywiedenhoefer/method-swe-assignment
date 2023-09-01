import { Method } from "method-node"
import ProcessRow, { Payment } from "./ProcessRow.ts"
import Row from "./types/Row.type.ts"
import { collections } from "./mongo.ts"
import { Document } from "bson"
import { OptionalId } from "mongodb"

const oneSecond = 1000
const paymentsMadePerSecond = 10 // each pmt process has at most 6 api calls, ie at most 600 calls per min

type ToPaymentReportType = {
    jobName: string,
    paymentStatus: string,
    paymentId: string,
    paymentMetaData: string,
    paymentBranchId: string,
    paymentAmount: number
}

const delay = (ms: number) => {
    return new Promise(_ => setTimeout(_, ms))
}

const processRateLimiter = async (rows: Row[], method: Method, jobName: string) => {
    while (rows.length > 0) {
        let batch: Promise<Payment>[] = []
        let startTime = Date.now()
        let _i: number
        for (_i=0; _i<paymentsMadePerSecond; _i++) {
            let row = rows.pop()
            let pr = new ProcessRow(method, row!)
            batch.push(pr.process())
        }
        await Promise.all(batch)
        let toPaymentReport: OptionalId<Document>[] | ToPaymentReportType[] = []
        batch.forEach(async (res) => {
            const r = await res
            if (r.id) {
                toPaymentReport.push({
                    jobName: jobName,
                    paymentStatus: r.status!,
                    paymentId: r.id,
                    paymentSourceAccount: r.sourceAccount,
                    paymentMetaData: JSON.stringify(r.metadata ? r.metadata : {}),
                    paymentBranchId: r.branchId,
                    paymentAmount: r.amount
                })
            }
        })
        let endTime = Date.now()
        let requestTime = endTime - startTime
        let delayedTime = oneSecond - requestTime
        if (delayedTime > 0) {
            await delay(delayedTime)
        }
        if (toPaymentReport) {
            await collections.PaymentReports.insertMany(toPaymentReport)
        }
    }
}

export default processRateLimiter