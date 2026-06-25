import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "9d8f376f9202a0a256bd4dcf3c8808940428f6e2b10a2624ea3550e502c3886f";

if (!process.env.JWT_SECRET) {
  console.warn("WARNING: JWT_SECRET environment variable is not defined. Using insecure default fallback secret.");
}

/**
 * Extracts and verifies JWT token from incoming Next.js API request.
 * @param {Request} request 
 * @returns {object|null} Decoded token payload if valid, otherwise null.
 */
export function verifyJWT(request) {
  try {
    const authHeader = request.headers.get("authorization") || request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }

    const token = authHeader.split(" ")[1];
    if (!token) return null;

    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (error) {
    console.error("JWT Verification Error:", error.message);
    return null;
  }
}
