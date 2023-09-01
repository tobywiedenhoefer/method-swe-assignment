import Address from "./Address.type"
import TextField from "./TextField.type"

type Payor = {
    DunkinId: TextField,
    ABARouting: TextField,
    AccountNumber: TextField,
    Name: TextField,
    DBA: TextField,
    EIN: TextField,
    Address: Address
}

export default Payor