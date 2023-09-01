import { Method } from 'method-node'

import Row from "./types/Row.type";
import Employee from './types/Employee.type';
import Payor from './types/Payor.type';
import Payee from './types/Payee.type';
import { collections } from "./mongo.ts";
import logger from './logger.ts';


class InvalidInfoEntered extends Error {
    constructor(msg: string) {
        super(msg)
    }
}

type Payment = {
    id: string | null,
    metadata: {} | null,
    status: string | null,
    sourceAccount: string,
    branchId: string
    amount: number
}

class ProcessRow {
    entry: Row
    private Employee: Employee
    private Payor: Payor
    private Payee: Payee
    private method: Method
    private employeeEntityId?: string
    private payorEntityId?: string
    private sourceAccountId?: string
    private destinationAccountId?: string
    private payment: Payment
    constructor(method: Method, row: Row) {
        this.entry = row
        this.Employee = row.Employee
        this.Payor = row.Payor
        this.Payee = row.Payee
        this.method = method
        this.payment = {
            id: null, 
            metadata: null, 
            status: null,
            sourceAccount: `${this.Payor.ABARouting._text} ${this.Payor.AccountNumber._text}`,
            branchId: this.Employee.DunkinBranch._text,
            amount: this.formatted_amount()
        }
    }
    private formatted_dob(): string {
        const dobArray = this.Employee.DOB._text.split("-")
        return `${dobArray[2]}-${dobArray[0]}-${dobArray[1]}`
    }
    private formatted_amount(): number {
        return Number(this.entry.Amount._text.replace(/[^0-9.-]+/g, ""))
    }
    async processIndividualEntity() {
        logger.log('===== processing individual entity =====')
        const res = await collections.Employees.findOne({
            dunkinId: this.Employee.DunkinId._text
        })
        if (res) {
            this.employeeEntityId = res.entityId
            logger.log('found employee entity in mongo db: ', this.employeeEntityId!)
            return
        }
        const individualEntity = await this.method.entities.create({
            type: 'individual',
            individual: {
                first_name: this.Employee.FirstName._text,
                last_name: this.Employee.LastName._text,
                phone: '+15121231111',
                email: 'toby.wiedenh@gmail.com',
                dob: this.formatted_dob()
            }
        })
        if (!individualEntity) {
            throw new InvalidInfoEntered("User entered invalid individual information")
        }
        this.employeeEntityId = individualEntity.id
        logger.log('got new employee id from method: ', this.employeeEntityId!)
        logger.log('adding it to mongo db')
        await collections.Employees.insertOne({
            dunkinId: this.Employee.DunkinId._text,
            entityId: this.employeeEntityId!
        })
    }
    async processCorporateEntity() {
        logger.log('===== processing corporate entity =====')
        const res = await collections.Payors.findOne({
            dunkinId: this.Payor.DunkinId._text
        })
        if (res) {
            this.payorEntityId = res.entityId
            logger.log('found payor id from mongo db: ', this.payorEntityId!)
            return
        }
        const corporateEntity = await this.method.entities.create({
            type: 'c_corporation',
            corporation: {
                name: this.Payor.Name._text,
                dba: this.Payor.DBA._text,
                ein: this.Payor.EIN._text,
                owners: [],
            },
            address: {
                line1: this.Payor.Address.Line1._text,
                line2: null,
                city: this.Payor.Address.City._text,
                state: this.Payor.Address.State._text,
                zip: this.Payor.Address.Zip._text
            }
        })
        if (!corporateEntity) {
            throw new InvalidInfoEntered("Payor entered invalid corporate information")
        }
        this.payorEntityId = corporateEntity.id
        logger.log('got payor id from method: ', this.payorEntityId!)
        logger.log('adding it to db')
        await collections.Payors.insertOne({
            dunkinId: this.Employee.DunkinId._text,
            entityId: this.payorEntityId!
        })
    }
    async processSourceAccount() {
        if (this.sourceAccountId) {
            return
        }
        logger.log('===== process source account =====')
        const res = await collections.SourceAccounts.findOne({
            dunkinId: this.Payor.DunkinId._text
        })
        if (res) {
            this.sourceAccountId = res.entityId
            logger.log('found source account id from db: ', this.sourceAccountId!)
            return
        }
        const sourceAccount = await this.method.accounts.create({
            holder_id: this.payorEntityId!,
            ach: {
                routing: this.Payor.ABARouting._text,
                number: this.Payor.AccountNumber._text,
                type: 'checking'
            }
        })
        if (!sourceAccount) {
            throw new InvalidInfoEntered("Payor entered invalid source account information")
        }
        this.sourceAccountId = sourceAccount.id
        logger.log('got source account id from method: ', this.sourceAccountId!)
        logger.log('adding it to db')
        await collections.SourceAccounts.insertOne({
            dunkinId: this.Payor.DunkinId._text,
            entityId: this.sourceAccountId!
        })
    }
    async processDestinationAccount() {
        if (this.destinationAccountId) {
            return
        }
        logger.log('===== process destination accounts =====')
        const destAcctRes = await collections.DestinationAccounts.findOne({
            plaidId: this.Payee.PlaidId._text,
            loanAcctNum: this.Payee.LoanAccountNumber._text,
            holderId: this.employeeEntityId!,
        })
        if (destAcctRes) {
            this.destinationAccountId = destAcctRes.destAcctId
            logger.log('found destination account id in db: ', this.destinationAccountId!)
            return
        }
        const mchRes = await collections.Merchants.findOne({
            plaidId: this.Payee.PlaidId._text
        })
        let mchId: string
        if (mchRes) {
            mchId = mchRes.mchId
            logger.log('found merchant id in db: ', mchId)
        } else {
            const getMchId = await this.method.merchants.list({
                "provider_id.plaid": this.Payee.PlaidId._text
            })
            if (getMchId.length === 0) {
                throw new InvalidInfoEntered("Payee entered invalid/unrecognized plaid id")
            }
            mchId = getMchId[0].mch_id
            logger.log('got merchant id from method: ', mchId)
            logger.log('adding it to db')
            await collections.Merchants.insertOne({
                plaidId: this.Payee.PlaidId._text,
                mchId: mchId
            })
        }
        const destinationAccount = await this.method.accounts.create({
            holder_id: this.employeeEntityId!,
            liability: {
                mch_id: mchId,
                account_number: this.Payee.LoanAccountNumber._text
            }
        })
        if (!destinationAccount) {
            throw new InvalidInfoEntered(`Trouble creating destination account: ${destinationAccount}`)
        }
        this.destinationAccountId = destinationAccount.id
        logger.log('got destination account id from method: ', this.destinationAccountId!)
        logger.log('adding it to db')
        await collections.DestinationAccounts.insertOne({
            holderId: this.employeeEntityId!,
            plaidId: this.Payee.PlaidId._text,
            loanAcctNum: this.Payee.LoanAccountNumber._text,
            mchId: mchId,
            destAcctId: this.destinationAccountId!
        })
    }
    async processPayment() {
        logger.log('===== processing payment =====')
        const payment = await this.method.payments.create({
            amount: this.formatted_amount(),
            source: this.sourceAccountId!,
            destination: this.destinationAccountId!,
            description: `Loan Payment by Dunkin Branch ${this.Payor.DunkinId._text}`
        })
        if (payment) {
            this.payment.id = payment.id
            this.payment.metadata = payment.metadata ? payment.metadata : null
            this.payment.status = payment.status
        }
        logger.log('payment submitted')
    }
    async process(): Promise<Payment> {
        try {
            await this.processIndividualEntity()
                        .then(() => this.processCorporateEntity())
                        .then(() => this.processSourceAccount())
                        .then(() => this.processDestinationAccount())
                        .then(() => this.processPayment())
            return this.payment
        } catch(e: unknown) {
            if (e instanceof Error) {
                logger.log(e.name, e.message)
            } else {
                logger.log(e)
            }
        }
        return this.payment
    }
}

export default ProcessRow
export { InvalidInfoEntered, type Payment }