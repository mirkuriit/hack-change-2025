import { jwtVerify, type JWTPayload } from "jose";

export type UserTokenPayload = JWTPayload & {
  id?: string | number;
  login?: string;
};

const secretKey = new TextEncoder().encode(process.env.NEXT_PUBLIC_JWT_SECRET);

export const decodeUserToken = async (token: string) => {
  try {
    const { payload } = await jwtVerify<UserTokenPayload>(token, secretKey, {
      algorithms: ["HS256"],
    });

    const rawId = payload.id ?? payload.sub ?? null;
    const id =
      typeof rawId === "number"
        ? String(rawId)
        : typeof rawId === "string"
        ? rawId
        : null;

    return {
      id,
      login: typeof payload.login === "string" ? payload.login : null,
    };
  } catch (error) {
    console.error("Token decode failed:", error);
    return { id: null, login: null };
  }
};
