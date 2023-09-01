import { ObjectId } from 'bson'

type EmployeeDBEntry = {
    _id: ObjectId,
    entityId: string
}

export default EmployeeDBEntry