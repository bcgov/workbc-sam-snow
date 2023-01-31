/* eslint-disable import/prefer-default-export */
import express from "express"
import helmet from "helmet"
import bodyParser from "body-parser"
import basicAuth from "express-basic-auth"
import morgan from "morgan"

import * as sam from "./routes/sam.route"

const APP_USER: string = process.env.APP_USER!
const APP_PASS: string = process.env.APP_PASS!
const users: { [k: string]: any } = {}
users[APP_USER] = APP_PASS
console.log(users)

export const app = express()

app.use(morgan("[:date] :method :url :status :res[content-length] - :remote-addr - :response-time ms"))
app.set("trust proxy", "loopback, linklocal, uniquelocal")
app.use(basicAuth({ users }))

app.use(express.json({ limit: "6mb" }))
app.use(express.urlencoded({ extended: false }))

app.use(bodyParser.urlencoded({ extended: false }))
app.use(
    helmet.contentSecurityPolicy({
        useDefaults: true,
        directives: {
            "form-action": ["'none'"],
            "style-src": ["'none'"],
            "font-src": ["'none'"]
        }
    })
)

app.use("/sam", sam.router)

const port = process.env.PORT || "8000"
app.listen(port, () => {
    console.log(`server started at :${port}`)
})
