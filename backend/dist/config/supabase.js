"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.supabase = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const supabaseUrl = process.env.SUPABASE_URL;
const configuredServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const configuredPublishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;
const supabaseKey = (_a = configuredServiceRoleKey !== null && configuredServiceRoleKey !== void 0 ? configuredServiceRoleKey : configuredPublishableKey) !== null && _a !== void 0 ? _a : process.env.SUPABASE_ANON_KEY;
if (!supabaseUrl) {
    throw new Error("SUPABASE_URL is required.");
}
if (!supabaseKey) {
    throw new Error("A Supabase key is required. Set SUPABASE_SERVICE_ROLE_KEY or a fallback publishable/anon key.");
}
if (!configuredServiceRoleKey) {
    console.warn("SUPABASE_SERVICE_ROLE_KEY is not set. Some database operations may be blocked by RLS.");
}
else if (configuredServiceRoleKey.startsWith("sb_publishable_")) {
    console.warn("SUPABASE_SERVICE_ROLE_KEY looks like a publishable key. Use the service role secret from the Supabase project settings for database access.");
}
exports.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false },
});
