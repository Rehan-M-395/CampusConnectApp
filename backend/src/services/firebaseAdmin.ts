import * as admin from 'firebase-admin';
import { supabase } from './supabase';

// ✅ Validate env
if (
    !process.env.FIREBASE_PROJECT_ID ||
    !process.env.FIREBASE_PRIVATE_KEY ||
    !process.env.FIREBASE_CLIENT_EMAIL
) {
    throw new Error("Missing Firebase environment variables");
}

const serviceAccount = {
    type: "service_account",
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
};

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    });
}

export const messaging = admin.messaging();

export async function sendNotification(erpid: string) {
    try {
        const { data: tokens, error } = await supabase
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
                priority: 'high' as const
            },
        };

        const response = await messaging.sendEachForMulticast(message);

        console.log('Notification sent:', response);

        // 🔥 Remove invalid tokens
        response.responses.forEach(async (resp, idx) => {
            if (!resp.success) {
                const token = registrationTokens[idx];
                const errorCode = resp.error?.code;

                console.log("❌ Firebase error:", errorCode);

                // ✅ Delete ONLY if token is permanently invalid
                if (
                    errorCode === 'messaging/registration-token-not-registered' ||
                    errorCode === 'messaging/invalid-registration-token'
                ) {
                    console.log("🗑️ ting invalid token:", token);

                    // await supabase
                    //     .from('fcm_tokens')
                    //     .delete()
                    //     .eq('token', token);
                } else {
                    console.log("⚠️ Temporary error, NOT deleting token");
                }
            }
        });

        return response;

    } catch (error) {
        console.error('Error sending notification:', error);
    }
}