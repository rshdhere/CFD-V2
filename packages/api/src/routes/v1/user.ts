import { db, eq } from "@CFD-V2/drizzle";
import { TRPCError } from "@trpc/server";
import { authSchema } from "@CFD-V2/validators";
import { usersTable } from "@CFD-V2/drizzle/database";
import { publicProcedure, router } from "@/src/trpc.js";
import { createSessionTokens } from "@/src/auth/session-tokens.js";
import { sendVerificationEmail } from "@CFD-V2/services/email/send";
import { ConsumeVerificationResendAttempt } from "@CFD-V2/services/email";

export const userRouter = router({
  signup: publicProcedure
    .input(authSchema.input)
    .output(authSchema.signupOutput)
    .mutation(async ({ input }) => {
      const users = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.email, input.email));

      if (users.length > 0) {
        const existingUser = users[0];

        if (!existingUser) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "failed to load user from the database",
          });
        }

        if (!existingUser.isEmailVerified) {
          ConsumeVerificationResendAttempt(input.email);
          sendVerificationEmail(existingUser.id, input.email).catch(
            console.error,
          );

          return { message: "verification email sent for the old-user" };
        }

        return { message: "Welcome Back, Please try signing-in." };
      }

      const HashedPassword = await Bun.password.hash(input.password);

      const [user] = await db
        .insert(usersTable)
        .values({
          email: input.email,
          password: HashedPassword,
        })
        .returning({ userId: usersTable.id });

      if (!user) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "failed to create user",
        });
      }

      sendVerificationEmail(user.userId, input.email).catch(console.error);
      return { message: "verification email sent for the new-user" };
    }),
  resendVerificationEmail: publicProcedure
    .input(authSchema.resendVerificationInput)
    .output(authSchema.signupOutput)
    .mutation(async ({ input }) => {
      const [user] = await db
        .select({
          userId: usersTable.id,
          isEmailVerified: usersTable.isEmailVerified,
        })
        .from(usersTable)
        .where(eq(usersTable.email, input.email));
      if (!user || user.isEmailVerified) {
        return {
          message: "if the account exists, a verification email was sent",
        };
      }

      ConsumeVerificationResendAttempt(input.email);
      await sendVerificationEmail(user.userId, input.email);
      return { message: "verification email sent" };
    }),
  login: publicProcedure
    .input(authSchema.input)
    .output(authSchema.output)
    .mutation(async ({ input, ctx }) => {
      const [user] = await db
        .select({
          userId: usersTable.id,
          password: usersTable.password,
          isEmailVerified: usersTable.isEmailVerified,
        })
        .from(usersTable)
        .where(eq(usersTable.email, input.email));

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "user not found",
        });
      }

      const isValidPassword = await Bun.password.verify(
        input.password,
        user.password,
      );

      if (!isValidPassword) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "invalid credentials",
        });
      }

      if (!user.isEmailVerified) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "email is not verified",
        });
      }

      const tokens = await createSessionTokens(user.userId, ctx.res);
      return { ...tokens, message: "login successful, welcome back" };
    }),
});
