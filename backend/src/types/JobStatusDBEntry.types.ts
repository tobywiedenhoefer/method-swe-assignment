import { ObjectId } from "bson"

type JobStatusDBEntry = {
    _id: ObjectId,
    isCurrent: boolean,
    isFinished: boolean,
    jobName: string
}

export default JobStatusDBEntry