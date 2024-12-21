"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyAdmin = verifyAdmin;
function verifyAdmin(req, res, next) {
    const user = req.user;
    const { role } = user;
    if (role == "ADMIN") {
        next();
        return;
    }
    else {
        res.status(403).send("Access denied !");
    }
}
