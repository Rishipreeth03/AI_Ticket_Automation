import express from "express"
import { login ,logout, signup,getUsers,updateUser} from "../controllers/user.js"


import {authenticate} from "../middlewares/auth.js"
const router =express.Router()


router.post("/update-user",authenticate,updateUser);
router.get("/users",authenticate,getUsers);

router.post("/sign-up",signup)
router.post("/login",login)
router.post("/logout",logout)

export default router