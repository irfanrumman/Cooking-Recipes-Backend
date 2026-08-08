import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middlewares/auth";
import { subscriptionController } from "./subscription.controller";

const router = Router()

router.post(
    "/checkout", 
    auth(Role.USER, Role.AUTHOR, Role.ADMIN),
    subscriptionController.createCheckoutSession
)

//cancel subscription

router.post("/webhook", subscriptionController.handleWebhook )


router.get("/status", 
    auth(Role.USER, Role.AUTHOR, Role.ADMIN),
    subscriptionController.getSubscriptionStatus)

export const subscriptionRoutes = router