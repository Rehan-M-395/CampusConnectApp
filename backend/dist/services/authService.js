"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginWithErpCredentials = exports.default = void 0;
var authService_1 = require("./auth/authService");
Object.defineProperty(exports, "default", { enumerable: true, get: function () { return __importDefault(authService_1).default; } });
Object.defineProperty(exports, "loginWithErpCredentials", { enumerable: true, get: function () { return authService_1.loginWithErpCredentials; } });
