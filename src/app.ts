import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Application, Request, Response } from "express";
// import config from "./config";
import config from "./config/index";
import { globalErrorHandler } from "./middlewares/globalErrorHandler";
import { notFound } from "./middlewares/notFound";
import { authRoutes } from "./modules/auth/auth.routes";
import { commentRoutes } from "./modules/comment/comment.route";
import { postRoutes } from "./modules/post/post.route";
import { premiumRoutes } from "./modules/premium/premium.route";
import { subscriptionRoutes } from "./modules/subscription/subscription.route";
import { userRoutes } from "./modules/user/user.route";



const app : Application = express();

app.use(cors({
    origin : config.app_url,
    credentials : true,
}))

const endpointSecret = config.stripe_webhook_secret;


app.use("/api/subscription/webhook", express.raw({ type: 'application/json' }))

app.use(express.json());
app.use(express.urlencoded({ extended : true }));
app.use(cookieParser());


app.get("/",(req : Request, res : Response) => {
    res.send("Hello, World!");
});

// app.post()

app.use("/api/users", userRoutes)
app.use("/api/auth", authRoutes)
app.use("/api/posts", postRoutes)
app.use("/api/comments", commentRoutes)
app.use("/api/subscription", subscriptionRoutes)
app.use("/api/premium", premiumRoutes)


// app.use((req : Request, res : Response) => {
//     res.status(404).json({
//         message : "Route not found",
//         path : req.originalUrl,
//         date : Date()
//     })
// })


app.use(notFound)

// app.use((err : any, req : Request, res : Response, next : NextFunction) => {
//     console.log(err);
//     res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
//         success: false,
//         statusCode: httpStatus.INTERNAL_SERVER_ERROR,
//         message: err.message,
//         error: err.stack
//     })
// })

app.use(globalErrorHandler)

export default app;