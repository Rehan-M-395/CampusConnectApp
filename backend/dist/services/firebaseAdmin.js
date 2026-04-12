"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.messaging = void 0;
exports.sendNotification = sendNotification;
const admin = __importStar(require("firebase-admin"));
const supabase_1 = require("./supabase");
// ✅ Validate env
if (!process.env.FIREBASE_PROJECT_ID ||
    !process.env.FIREBASE_PRIVATE_KEY ||
    !process.env.FIREBASE_CLIENT_EMAIL) {
    throw new Error("Missing Firebase environment variables");
}
const serviceAccount = {
    type: "service_account",
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key: (_a = process.env.FIREBASE_PRIVATE_KEY) === null || _a === void 0 ? void 0 : _a.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
};
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
}
exports.messaging = admin.messaging();
function sendNotification(erpid) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { data: tokens, error } = yield supabase_1.supabase
                .from('fcm_tokens')
                .select('token')
                .eq('erpid', erpid);
            if (error) {
                console.error('Error fetching tokens:', error);
                return;
            }
            if (!tokens || tokens.length === 0) {
                console.log(`No tokens found for erpid: ${erpid}`);
                return;
            }
            const registrationTokens = tokens.map(t => t.token);
            const message = {
                notification: {
                    title: 'Attendance Marked',
                    body: 'Your login has been recorded',
                },
                data: {
                    type: 'attendance',
                    erpid: erpid,
                },
                tokens: registrationTokens,
                android: {
                    priority: 'high'
                },
            };
            const response = yield exports.messaging.sendEachForMulticast(message);
            console.log('Notification sent:', response);
            // 🔥 Remove invalid tokens
            response.responses.forEach((resp, idx) => __awaiter(this, void 0, void 0, function* () {
                if (!resp.success) {
                    const token = registrationTokens[idx];
                    yield supabase_1.supabase
                        .from('fcm_tokens')
                        .delete()
                        .eq('token', token);
                }
            }));
            return response;
        }
        catch (error) {
            console.error('Error sending notification:', error);
        }
    });
}
