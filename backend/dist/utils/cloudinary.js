"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadImage = void 0;
const cloudinarySetup_1 = __importDefault(require("../config/cloudinarySetup"));
const uploadImage = (buffer, folder) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinarySetup_1.default.uploader.upload_stream({
            folder,
            resource_type: "image",
        }, (error, result) => {
            console.log("=== Cloudinary Callback ===");
            console.log("Error:", error);
            console.log("Result:", result);
            if (error) {
                return reject(error);
            }
            resolve(result);
        });
        stream.on("error", (err) => {
            console.log("Stream error:", err);
        });
        stream.end(buffer);
    });
};
exports.uploadImage = uploadImage;
