import Stripe from "stripe";

const getStripe = () => {
    const apiKey = process.env.STRIPE_SECRET_KEY;
    if (!apiKey) {
        return null;
    }
    return new Stripe(apiKey, {
        apiVersion: "2026-01-28.clover" as any, // Adjusted to match the specific version required by the type system
        typescript: true,
    });
};

export const stripe = getStripe();
