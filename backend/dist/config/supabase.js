"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", { value: true });
exports.supabase = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const supabaseUrl = (_a = process.env.SUPABASE_URL) !== null && _a !== void 0 ? _a : "https://lhsmbkgtxkfohxdndhhf.supabase.co";
const configuredServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const configuredPublishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;
const supabaseKey = (_c = (_b = configuredServiceRoleKey !== null && configuredServiceRoleKey !== void 0 ? configuredServiceRoleKey : configuredPublishableKey) !== null && _b !== void 0 ? _b : process.env.SUPABASE_ANON_KEY) !== null && _c !== void 0 ? _c : "sb_publishable_Sian5C7vTwjiRNEr8JBl9w_9Gy_GiBf";
if (!configuredServiceRoleKey) {
    console.warn("SUPABASE_SERVICE_ROLE_KEY is not set. Queries may be blocked by RLS.");
}
else if (configuredServiceRoleKey.startsWith("sb_publishable_")) {
    console.warn("SUPABASE_SERVICE_ROLE_KEY looks like a publishable key. Use the service role secret from the Supabase project settings for database access.");
}
exports.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false },
});
