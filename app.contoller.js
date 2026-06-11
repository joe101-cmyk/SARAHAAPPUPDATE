
import connect_DB from "./src/DB/connection.js";
import { connectRedis } from "./src/DB/redis.connection.js";
import { authRouter, userRouter } from "./src/modules/index.js";
import { sendemail } from "./utils/email/email.ultils.js";
import {  globelmiddlewarehandelar, NotFoundException } from "./utils/response/Error.response.js";
import { successResponse } from "./utils/response/sucess.response.js";

const bootstrap = async (app, express) => {
    await connect_DB();
    await connectRedis();   
    app.use(express.json());

    app.use("/auth", authRouter);
    app.use("/user", userRouter);

    app.get("/", (req, res) => {
        return successResponse({ res, statusCode: 200, message: "Hello Success" });
    });

app.all("/dummy", (req, res, next) => {
    return next(
        NotFoundException({ message: "Not Found Handler!!!" })
    );
});


    app.use((req, res, next) => {
    return next(
        NotFoundException({ message: `Route ${req.originalUrl} Not Found` })
    );
});
    app.use(globelmiddlewarehandelar);

};

export default bootstrap;