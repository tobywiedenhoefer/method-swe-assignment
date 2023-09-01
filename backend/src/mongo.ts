import { Collection, MongoClient, ServerApiVersion } from 'mongodb'


const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
})

type MongoCollections = {
    Employees: Collection,
    Payors: Collection,
    Merchants: Collection,
    SourceAccounts: Collection,
    DestinationAccounts: Collection,
    Jobs: Collection,
    PaymentReports: Collection
}

const DunkinPayouts = client.db("DunkinPayouts")
const collections: MongoCollections = {
    Employees: DunkinPayouts.collection("Employees"),
    Payors: DunkinPayouts.collection("Payors"),
    Merchants: DunkinPayouts.collection("Merchants"),
    SourceAccounts: DunkinPayouts.collection("SourceAccounts"),
    DestinationAccounts: DunkinPayouts.collection("DestinationAccounts"),
    Jobs: DunkinPayouts.collection("Jobs"),
    PaymentReports: DunkinPayouts.collection("PaymentReports"),
}

const run = async () => {
    try {
        await client.connect()
        await DunkinPayouts.command({ ping: 1 })
        console.log("Successfully connected to the DB")
    } catch {
        console.log('Connection was unsuccessful or was interupted from the DB')
    }
}

export { run, DunkinPayouts, collections }