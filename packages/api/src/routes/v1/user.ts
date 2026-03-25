import { authSchema } from "@CFD-V2/validators";
import { publicProcedure, router } from "@/src/trpc.js";

export const userRouter = router({
  signup: publicProcedure
    .input(authSchema.input)
    .output(authSchema.output)
    .mutation(({ input }) => {}),
  login: publicProcedure
    .input(authSchema.input)
    .output(authSchema.output)
    .mutation(({ input }) => {}),
});
