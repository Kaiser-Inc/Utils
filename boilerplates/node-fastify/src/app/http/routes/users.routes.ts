import type { FastifyInstance } from "fastify";
import { z } from "zod";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import type { ServerDependencies } from "../../core/server.js";
import { DeleteUserController } from "../controllers/users/delete-user.controller.js";
import { GetProfileController } from "../controllers/users/get-profile.controller.js";
import { UpdateProfileController } from "../controllers/users/update-profile.controller.js";
import { authenticate } from "../middlewares/authenticate.js";
import { ErrorSchema, UserSchema } from "../schemas/index.js";

export async function userRoutes(
  fastify: FastifyInstance,
  deps: ServerDependencies,
): Promise<void> {
  const getProfile = new GetProfileController(deps.userRepo);
  const updateProfile = new UpdateProfileController(deps.userRepo);
  const deleteUser = new DeleteUserController(deps.userRepo, deps.refreshTokenRepo);

  const f = fastify.withTypeProvider<ZodTypeProvider>();

  f.get("/users/me", {
    schema: {
      tags: ["Users"],
      summary: "Get current user profile",
      security: [{ bearerAuth: [] }],
      response: {
        200: UserSchema,
        401: ErrorSchema,
        404: ErrorSchema,
      },
    },
    preHandler: [authenticate],
  }, getProfile.handle);

  f.put("/users/me", {
    schema: {
      tags: ["Users"],
      summary: "Update current user profile",
      security: [{ bearerAuth: [] }],
      body: z.object({
        username: z.string().min(3).max(50).optional(),
        email: z.string().email().optional(),
      }),
      response: {
        200: UserSchema,
        401: ErrorSchema,
        404: ErrorSchema,
        409: ErrorSchema,
        422: ErrorSchema,
      },
    },
    preHandler: [authenticate],
  }, updateProfile.handle);

  f.delete("/users/me", {
    schema: {
      tags: ["Users"],
      summary: "Delete current user account",
      security: [{ bearerAuth: [] }],
      response: {
        204: { type: "null", description: "Account deleted successfully" },
        401: ErrorSchema,
        404: ErrorSchema,
      },
    },
    preHandler: [authenticate],
  }, deleteUser.handle);
}
