/* eslint-disable no-prototype-builtins */
/* eslint-disable no-param-reassign */
import * as express from "express"
import moment from "moment"
import * as samService from "../services/sam.service"

const orgs = JSON.parse(`{
    "NORTH ISLAND EMPLOYMENT FOUNDATIONS SOCIETY": "North Island Employment Foundations Society",
    "Creative Employment Access Society": "Creative Employment Access Society",
    "Central Vancouver Island Job Opportunities Building Society": "Central Vancouver Island Job Opportunities Building Society",
    "MAXIMUS CANADA EMPLOYMENT SERVICES INC.": "MAXIMUS Canada Employment Services Inc.",
    "ETHOS CAREER MANAGEMENT GROUP LTD.": "ETHOS Career Management Group Ltd.",
    "WORKLINK EMPLOYMENT SOCIETY": "WorkLink Employment Society",
    "BEACON COMMUNITY ASSOCIATION": "Beacon Community Association",
    "OPEN DOOR SOCIAL SERVICES SOCIETY  ": "Open Door Social Services Society",
    "OPEN DOOR SOCIAL SERVICES SOCIETY ": "Open Door Social Services Society",
    "OPEN DOOR SOCIAL SERVICES SOCIETY": "Open Door Social Services Society",
    "YOUNG WOMEN'S CHRISTIAN ASSOCIATION": "Young Women's Christian Association",
    "Pacific Community Resources Society": "Pacific Community Resources Society",
    "MOSAIC Multi-lingual Orientation Services Association for Immigrant Communities": "MOSAIC Multi-lingual Orientation Services Association for Immigrant Communities",
    "United Chinese Community Enrichment Services Society": "United Chinese Community Enrichment Services Society",
    "Douglas College": "Douglas College",
    "OPTIONS COMMUNITY SERVICES SOCIETY": "Options Community Services Society",
    "WCG INTERNATIONAL CONSULTANTS LTD.": "WCG International Consultants Ltd.",
    "WCG International Consultants Ltd.": "WCG International Consultants Ltd.",
    "FRASER WORKS CO-OPERATIVE": "Fraser Works Co-operative",
    "HORTON VENTURES INC.": "Horton Ventures Inc.",
    "COMMUNITY FUTURES DEVELOPMENT CORPORATION OF THOMPSON COUNTRY": "Community Futures Development Corporation of Thompson Country",
    "Kootenay Career Development Society": "Kootenay Career Development Society",
    "COMMUNITY FUTURES DEVELOPMENT CORPORATION OF THE NORTH OKANAGAN": "Community Futures Development Corporation of the North Okanagan",
    "HECATE STRAIT EMPLOYMENT DEVELOPMENT SOCIETY": "Hecate Strait Employment Development Society",
    "NORTHWEST TRAINING LTD.": "Northwest Training Ltd.",
    "KOPAR ADMINISTRATION LTD.": "Kopar Administration Ltd.",
    "PROGRESSIVE EMPLOYMENT SERVICES LTD.": "Progressive Employment Services Ltd.",
    "EMPLOYMENT CONNECTIONS NORTH CORP.": "Employment Connections North Corp.",
    "Neil Squire Society": "Neil Squire Society",
    "Kootenay Employment Services Society": "Kootenay Employment Services Society",
    "KES2WCG": "KES2WCG",
    "XCG international": "XCG international"
}`)

export const getPermissions = async (req: express.Request, res: express.Response) => {
    try {
        const user = await samService.getUser(req.params.guid, false)
        if (!orgs.hasOwnProperty(user.Organization)) {
            return res.status(200).send({})
        }
        const accessEnded = moment(user.EndDate).utc().diff(moment().utc()) <= 0 // Users should only be excluded if their end date is today or in the past
        const hasSNOWAccess = user.Properties.some((props: any) => props.SecurityRole.ApplicationCode === "SNOW")
        user.Organization = orgs[user.Organization]
        user.SNOWAccess = !accessEnded && hasSNOWAccess
        delete user.StartDate
        delete user.EndDate
        delete user.Properties
        delete user.RowVersion
        delete user.GUID
        delete user.TypeDescription
        // const hasSNOWAccess = permissions.some((permission: any) => permission.Application === "SNOW")
        // response.data.filter((item: any) => item.Application === "WGS")
        return res.status(200).send(user)
    } catch (error: any) {
        console.log(error)
        return res.status(500).send("Internal Server Error")
    }
}

export const getAll = async (req: express.Request, res: express.Response) => {
    try {
        const users = await samService.getAll(false)
        console.log(`Total users from SAM: ${users.length}`)
        const usersWithPermissions = users.filter((item: any) => item.Properties.length > 0)
        const usersWithAccessNotEnded = usersWithPermissions.filter(
            (item: any) => item.EndDate === null || !(moment(item.EndDate).utc().diff(moment().utc()) < 0)
        )
        const filteredUsers = usersWithAccessNotEnded.filter((item: any) => orgs.hasOwnProperty(item.Organization))
        const sysUsers = { sys_users: {} }
        // let organizations: any[]= []
        filteredUsers.forEach((u: any) => {
            const accessEnded = moment(u.EndDate).utc().diff(moment().utc()) < 0
            const hasSNOWAccess = u.Properties.some(
                (props: any) =>
                    props.SecurityRole.ApplicationCode === "SNOW" &&
                    (moment(props.EndDate).isValid() ? moment(props.EndDate).utc().diff(moment().utc()) < 0 : true)
            )
            /*
            const org = u.Organization || ""
            if (!(organizations.indexOf(org) > -1)){
                organizations.push(org)
            }
            */
            u.Organization = orgs[u.Organization]
            u.SNOWAccess = !accessEnded && hasSNOWAccess
            delete u.StartDate
            delete u.EndDate
            delete u.Properties
            delete u.RowVersion
            delete u.GUID
            delete u.TypeDescription
        })

        // .Properties.filter((prop: any) => prop.SecurityRole.ApplicationCode === "RSB")
        // .filter()
        sysUsers.sys_users = filteredUsers
        return res.status(200).send(sysUsers)
    } catch (error: any) {
        console.log(error)
        return res.status(500).send("Internal Server Error")
    }
}
