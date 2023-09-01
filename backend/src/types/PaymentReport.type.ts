import { ObjectId } from 'bson'

type PaymentReport = {
    _id: ObjectId,
    jobName: string,
    paymentStatus: string,
    paymentId: string,
    paymmentMetaData: string,
    paymentSourceAccount: string,
    paymentBranchId: string,
    paymentAmount: number
}

export default PaymentReport