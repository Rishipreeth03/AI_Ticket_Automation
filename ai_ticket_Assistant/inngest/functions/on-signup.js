import {inngest} from "../client.js";
import User from "../../models/user.js"
import { NonRetriableError } from "inngest";
import { sendMail } from "../../utils/mailer.js";



export const onUserSignup=inngest.createFunction(
    {id:"on-user-signup",retries:2},
    {event : "user/signup" },
    async({event,step})=>{
        try{
            //pipeline -1 
            const {email} =event.data
            const user=await step.run("get-user-email",async()=>{
                const userObject=await User.findOne({email})
                if(!userObject){
                    throw new NonRetriableError("User no longer exists in our database")
                }
                return userObject
            })

            //pipeline-2
            await step.run("send-welcome-email",async()=>{
                const subject=`Welcome to the app`
                const message=`Hi,
                \n\n
                Thanks for Signing up! We're glad to have you onboard!
                `

                await sendMail(user.email,subject,message)
            })

            return {success:true}
        }catch(err){
            console.log("Error running step",err.message)
            return {success:false}
        }
    }
);