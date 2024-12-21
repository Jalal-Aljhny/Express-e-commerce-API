"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const userRoute_1 = __importDefault(require("./routers/userRoute"));
const dotenv_1 = __importDefault(require("dotenv"));
const productRoute_1 = __importDefault(require("./routers/productRoute"));
const productServices_1 = require("./services/productServices");
const cartRoute_1 = __importDefault(require("./routers/cartRoute"));
dotenv_1.default.config();
const cors_1 = __importDefault(require("cors"));
const adminRoute_1 = __importDefault(require("./routers/adminRoute"));
const app = (0, express_1.default)();
const port = 5000;
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    origin: [`${process.env.FRONT_END_ORIGIN}`],
    credentials: true,
}));
mongoose_1.default
    .connect(`${process.env.DB_URL}/ecommerce`)
    .then(() => console.log("Mongoose Connected!"))
    .catch((err) => console.log("Failed mongoose Connected!", err));
(0, productServices_1.seedInitialProducts)();
app.use("/user", userRoute_1.default);
app.use("/products", productRoute_1.default);
app.use("/cart", cartRoute_1.default);
app.use("/admin", adminRoute_1.default);
app.listen(port, () => {
    console.log(`server running at : http://localhost:${port}`);
});
