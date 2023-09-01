import fs from 'fs'

const logger = new console.Console(fs.createWriteStream('./output.log'))

export default logger