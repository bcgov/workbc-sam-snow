/* eslint-disable import/prefer-default-export */
import express from "express"
import helmet from "helmet"
import bodyParser from "body-parser"
// import basicAuth from "express-basic-auth"
import jwt from "jsonwebtoken"
import * as sam from "./routes/sam.route"
// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
const morgan = require("morgan")

/*
const APP_USER: string = process.env.APP_USER!
const APP_PASS: string = process.env.APP_PASS!
const users: { [k: string]: any } = {}
users[APP_USER] = APP_PASS
*/
// console.log(users)

export const app = express()

app.use(morgan("[:date] :method :url :status :res[content-length] - :remote-addr - :response-time ms"))
app.set("trust proxy", "loopback, linklocal, uniquelocal")
// app.use(basicAuth({ users }))

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

function isIPAllowed(requestIP: string, allowedIPs: string[]): boolean {
    return allowedIPs.some((entry) => {
        if (entry.includes("*")) {
            const pattern = entry.split(".").slice(0, 3).join(".")
            return requestIP.startsWith(pattern)
        }
        return entry === requestIP
    })
}

const validate = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        const allowedIPs = (process.env.ALLOWED_IPS ?? "").split(",").map((ip) => ip.trim())

        const rawIP = req.headers["x-forwarded-for"]
        const requestIP =
            (Array.isArray(rawIP) ? rawIP[0] : rawIP)?.split(",")[0].trim() ?? req.socket.remoteAddress ?? ""

        if (!isIPAllowed(requestIP, allowedIPs)) {
            return res.status(403).send("Unauthorized IP")
        }
        if (!req.headers.authorization) {
            return res.status(403).send("Unauthorized")
        }
        if (!req.headers.authorization.includes("Bearer")) {
            return res.status(403).send("Unauthorized")
        }

        const tokenTest = process.env.TOKEN || ""
        const token = tokenTest.split(" ")[1]
        const incomingToken = req.headers.authorization?.split(" ")[1]

        if (token !== incomingToken) {
            return res.status(403).send("Unauthorized")
        }

        const verify = jwt.verify(token, process.env.APP_PASS || "", { audience: process.env.APP_USER || "" })
        if (verify) {
            return next()
        }
        return res.status(403).send("Unauthorized")
    } catch (error: any) {
        return res.status(500).send("Internal Server Error")
    }
}

app.use("/sam", validate, sam.router)

const port = process.env.PORT || "8000"
app.listen(port, () => {
    console.log(`server started at :${port}`)
})
