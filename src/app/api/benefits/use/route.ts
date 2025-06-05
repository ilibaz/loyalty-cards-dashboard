import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { GET_USER_VENUE_BENEFITS_QUERY } from '@/lib/queries';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { userId, benefitId } = body;

        if (userId === undefined || benefitId === undefined) {
            return NextResponse.json({ error: 'Missing userId or benefitId in request body.' }, { status: 400 });
        }

        if (typeof userId !== 'number' || typeof benefitId !== 'number') {
            return NextResponse.json(
                {
                    error: 'userId and benefitId must be numbers.',
                    receivedTypes: { userId: typeof userId, benefitId: typeof benefitId }
                },
                { status: 400 }
            );
        }

        // validate that the benefitId exists and fetch its venue_id
        // to ensure the benefit is valid before attempting to record its use
        // and to get the venue_id for the final query.
        const benefitInfoResult = await db.query(
            'SELECT venue_id FROM benefits WHERE id = $1',
            [benefitId]
        );

        if (benefitInfoResult.rowCount === 0) {
            // If benefitId doesn't exist in the 'benefits' table.
            return NextResponse.json({ error: 'Benefit not found.' }, { status: 404 });
        }
        const venueId = benefitInfoResult.rows[0].venue_id;

        // mark the benefit as used in the 'user_benefits' table, in case of conflict do nothing
        const insertResult = await db.query(
            'INSERT INTO user_benefits (user_id, benefit_id, used_at) VALUES ($1, $2, NOW()) ON CONFLICT (user_id, benefit_id) DO NOTHING',
            [userId, benefitId]
        );

        // check if conflicted or not
        if (insertResult.rowCount && insertResult.rowCount > 0) {
            console.log(`User ${userId} successfully used benefit ${benefitId}`);
        } else {
            console.log(`User ${userId} had already used benefit ${benefitId}, or attempted to use it concurrently.`);
        }

        const updatedBenefitsResult = await db.query(
            GET_USER_VENUE_BENEFITS_QUERY,
            [userId, venueId]
        );

        return NextResponse.json({ benefits: updatedBenefitsResult.rows });

    } catch (error) {
        console.error('Error in POST /api/benefits/use:', error);
        return NextResponse.json({ error: 'An unexpected error occurred on the server.' }, { status: 500 });
    }
}