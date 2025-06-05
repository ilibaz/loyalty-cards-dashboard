import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { GET_USER_VENUE_BENEFITS_QUERY } from '@/lib/queries';

interface ResolvedRouteParams {
    userid: string;
    venueid: string;
}

export async function GET(
    request: NextRequest,
    { params: paramsPromise }: { params: Promise<ResolvedRouteParams> }
) {
    try {
        const actualParams = await paramsPromise;

        const userIdStr = actualParams.userid;
        const venueIdStr = actualParams.venueid;

        const userId = parseInt(userIdStr, 10);
        const venueId = parseInt(venueIdStr, 10);

        console.log('userId:', userId);
        console.log('venueId:', venueId);

        if (isNaN(userId) || isNaN(venueId)) {
            return NextResponse.json(
                { error: 'Invalid user ID or venue ID format. They must be integers.' },
                { status: 400 }
            );
        }

        try {
            const result = await db.query(
                GET_USER_VENUE_BENEFITS_QUERY,
                [userId, venueId]
            );

            console.log(`Benefits query result for userId: ${userId}, venueId: ${venueId}`, result.rows);

            return NextResponse.json({ benefits: result.rows });

        } catch (error) {
            console.error('Database query error:', error);
            return NextResponse.json(
                { error: 'Failed to retrieve benefits from the database.' },
                { status: 500 }
            );
        }
    } catch (error: unknown) {
        // this will catch errors from awaiting paramsPromise or parseInt
        let message = "An unexpected error occurred while processing the request.";
        if (error instanceof Error) {
            message = error.message;
        }
        console.error(`[API ERROR] GET /api/benefits/[userid]/[venueid]: ${message}`, error);
        return NextResponse.json({ error: "Failed to process your request." }, { status: 500 });
    }
}
