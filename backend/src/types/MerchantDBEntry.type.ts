import { ObjectId } from 'bson'

type MerchantDBEntry = {
    _id: ObjectId,
    mchId: string
}

export default MerchantDBEntry