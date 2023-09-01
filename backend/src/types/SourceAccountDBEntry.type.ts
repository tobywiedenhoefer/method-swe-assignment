import { ObjectId } from 'bson'

type SourceAccountDBEntry = {
    _id: ObjectId,
    acctId: string
}

export default SourceAccountDBEntry