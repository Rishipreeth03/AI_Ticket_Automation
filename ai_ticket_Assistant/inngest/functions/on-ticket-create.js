import {inngest} from "../client";
import User from "../../models/user.js";
import Ticket from "../../controllers/models/ticket.js"
import { NonRetriableError } from "inngest";
import { sendMail } from "../../utils/mailer";
import analyzeTicket from "../../utils/ai.js";

export const onTicketCreated=inngest.createFunction(
    {id:"on-ticket-created",retries:2},
    {event : "ticket/created" },
    async({event , step})=>{
        try{
            const {ticketId} = event.data

            //fetch ticket from DB
            const ticket = await step.run("fetch-ticket",async()=>{
                const ticket = await Ticket.findById(ticketId);
                if(!ticketId){
                    throw new NonRetriableError("Ticket not found");
                }
            })

            await step.run("update-ticket-status",async()=>{
                await Ticket.findByIdAndUpdate(ticket._id,{
                    status:"TODO"
                })
            })

            const aiResponse=await analyzeTicket(ticket)

            const reelatedskills=await step.run("ai-processing",async()=>{
                let skills=[]
                if(aiResponse){
                    await Ticket.findByIdAndUpdate(ticket._id,{
                        priority:!["low","medium","high"].
                        includes(aiResponse.priority) ?
                        "mdeium":
                        aiResponse.priority,
                        helpfulNotes:aiResponse.helpfulNotes,
                        status: "IN_PROGRESS",
                        relatedSkills : aiResponse.relatedSkills
                    })
                    skills=aiResponse.relatedSkills
                }
                return skills
            })

            const moderator=await step.run("assign-moderator",
                async()=>{
                    let user=await User.findOne({
                        role:"moderator",
                        skills:{
                            $eleMatch:{
                                $regex:reelatedskills.join("|"),
                                $options:"i",
                            },
                        },
                    });
                    if(!user){
                        user=await User.findOne({
                            role:"admin"
                        })
                    }
                    await Ticket.findByIdAndUpdate(ticket._id,{
                        assignedTo:user?._id || null
                    })
                    return user
                }
            );


            //another pipeline
            await step.run("send-email-notification",async()=>{
                if(moderator){
                    const finalTicket=await Ticket.findById(ticket._id)
                    await sendMail(
                        moderator.email,
                        "Ticket Assigned",
                        `A new ticket is assigned to you
                        ${finalTicket.title}`
                    )
                }
            })

            return {success:true}

        }catch(error){
            console.error("Error running step",error.message)
            {success:false}
        }
    }
);