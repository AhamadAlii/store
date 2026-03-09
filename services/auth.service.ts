import bcrypt from "bcryptjs";
import { userRepository } from "@/db/repositories/user.repository";
import { loginSchema } from "@/validators/auth";
import { AppError } from "@/lib/errors";

const SALT_ROUNDS = 12;

export const authService = {
  async login(phone: string, password: string) {
    const parsed = loginSchema.safeParse({ phone, password });

    if (!parsed.success) {
      throw new AppError(
        parsed.error.issues.map((e) => e.message).join(", "),
        400,
        "VALIDATION_ERROR"
      );
    }

    const user = await userRepository.findByPhone(parsed.data.phone);

    if (!user) {
      throw new AppError(
        "Invalid phone number or password",
        401,
        "INVALID_CREDENTIALS"
      );
    }

    const isPasswordValid = await bcrypt.compare(
      parsed.data.password,
      user.passwordHash
    );

    if (!isPasswordValid) {
      throw new AppError(
        "Invalid phone number or password",
        401,
        "INVALID_CREDENTIALS"
      );
    }

    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },

  async hashPassword(password: string): Promise<string> {
    if (!password || password.length < 6) {
      throw new AppError(
        "Password must be at least 6 characters",
        400,
        "VALIDATION_ERROR"
      );
    }

    return bcrypt.hash(password, SALT_ROUNDS);
  },
};
