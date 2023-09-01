import Employee from "./Employee.type";
import Payee from "./Payee.type";
import Payor from "./Payor.type";
import TextField from "./TextField.type";

type Row = {
    Employee: Employee,
    Payor: Payor,
    Payee: Payee,
    Amount: TextField
}

export default Row