/* eslint-disable no-param-reassign */
import * as express from "express"
import moment from "moment"
import * as samService from "../services/sam.service"

export const getPermissions = async (req: express.Request, res: express.Response) => {
    try {
        const user = await samService.getUser(req.params.guid, false)
        // console.log(user)
        const accessEnded = (moment(user.EndDate).utc().diff(moment().utc()) < 0)
        const hasSNOWAccess = user.Properties.some((props: any) => props.SecurityRole.ApplicationCode === "SARA" && (moment(props.EndDate).isValid() ? ((moment(props.EndDate).utc().diff(moment().utc())) < 0) : true))

        user.SNOWAccess = !accessEnded && hasSNOWAccess
        delete user.StartDate
        delete user.EndDate
        delete user.Properties
        delete user.RowVersion
        delete user.GUID
        delete user.TypeDescription
        // const hasSNOWAccess = permissions.some((permission: any) => permission.Application === "SARA")
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
        const filteredUsers = users.filter((item: any) => item.Properties.length > 0)
        // let organizations: any[]= []
        filteredUsers.forEach((u: any) => {
            const accessEnded = (moment(u.EndDate).utc().diff(moment().utc()) < 0)
            const hasSNOWAccess = u.Properties.some((props: any) => props.SecurityRole.ApplicationCode === "SARA" && (moment(props.EndDate).isValid() ? ((moment(props.EndDate).utc().diff(moment().utc())) < 0) : true))
            /*
            const org = u.Organization || ""
            if (!(organizations.indexOf(org) > -1)){
                organizations.push(org)
            }
            */
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
        return res.status(200).send(filteredUsers)
    } catch (error: any) {
        console.log(error)
        return res.status(500).send("Internal Server Error")
    }
}
