import { ObjectId } from 'bson'

type DestinationAccountDBEntry = {
    _id: ObjectId,
    holderId: string,
    plaidId: string,
    mchId: string,
    loanAcctNum: string,
    destAcctId: string
}

export default DestinationAccountDBEntry