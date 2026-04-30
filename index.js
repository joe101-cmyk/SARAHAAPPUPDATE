import express from "express";
import bootstrap from "./app.contoller.js";
import { PORT } from "./config/config.service.js";
const app = express();
await bootstrap(app,express)

app.listen(PORT,()=>{
        console.log(`RUNNING SERVER IN PORT NUMBER = ${PORT}`);

})




