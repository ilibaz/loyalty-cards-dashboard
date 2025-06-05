export type Venue = {
    id: number;
    name: string;
};

export type Benefit = {
    id: number;
    name: string;
    venue_id: number;
};

export type User = {
    id: number;
    name: string;
};

export type UserBenefit = {
    id: number;
    user_id: number;
    benefit_id: number;
    used_at: Date | string;
};