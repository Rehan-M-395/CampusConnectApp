"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginWithErpCredentials = void 0;
const supabase_1 = require("../../config/supabase");
const authUtils_1 = require("../../utils/authUtils");
const index_1 = require("./index");
class AuthService {
    static login(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return (0, index_1.authenticateByRole)(payload);
        });
    }
    static storeFcmToken(erpId, fcmToken) {
        return __awaiter(this, void 0, void 0, function* () {
            const normalizedErpId = (0, authUtils_1.normalizeErpId)(erpId);
            const { error } = yield supabase_1.supabase
                .from("fcm_tokens")
                .upsert({ erpid: normalizedErpId, token: fcmToken }, { onConflict: "token" });
            if (error) {
                throw new Error(error.message);
            }
        });
    }
}
const loginWithErpCredentials = (payload) => __awaiter(void 0, void 0, void 0, function* () { return AuthService.login(payload); });
exports.loginWithErpCredentials = loginWithErpCredentials;
exports.default = AuthService;
