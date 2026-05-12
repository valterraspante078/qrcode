import { MercadoPagoConfig } from "mercadopago";

const getClient = () => {
    const accessToken = process.env.MP_ACCESS_TOKEN;
    if (!accessToken) {
        return null;
    }
    return new MercadoPagoConfig({ accessToken });
};

export const mpClient = getClient();
