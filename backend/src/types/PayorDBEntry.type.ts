import { ObjectId } from 'bson'

type PayorDBEntry = {
    _id: ObjectId,
    entityId: string
}

export default PayorDBEntry