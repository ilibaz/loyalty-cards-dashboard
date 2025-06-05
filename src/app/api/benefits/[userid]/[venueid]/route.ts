import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { GET_USER_VENUE_BENEFITS_QUERY } from '@/lib/queries';

interface GetRouteContext {
    params: {
        userid: string;
        venueid: string;
    };
}

export async function GET(
    request: NextRequest,
    context: GetRouteContext
) {
    const { userid: userIdStr, venueid: venueIdStr } = context.params;

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
}