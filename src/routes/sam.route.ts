/* eslint-disable import/prefer-default-export */
import * as express from "express"
import * as samController from "../controllers/sam.controller"

export const router = express.Router()

router.get("/all", samController.getAll)
router.get("/permissions/bceid/:guid", samController.getPermissions)
