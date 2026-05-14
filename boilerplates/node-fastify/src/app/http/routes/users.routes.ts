import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import type { ServerDependencies } from "../../core/server.js";
import { DeleteUserService } from "../../services/delete-user.js";
import { GetUserService } from "../../services/get-user.js";
import { UpdateUserService } from "../../services/update-user.js";
import { DeleteUserController } from "../controllers/users/delete-user.js";
import { GetProfileController } from "../controllers/users/get-profile.js";
import { UpdateProfileController } from "../controllers/users/update-profile.js";
import { authenticate } from "../middlewares/authenticate.js";
import { ErrorSchema, UpdateProfileBodySchema, UserSchema } from "../schemas/index.js";

// ─── Route Schemas (defined at module level to keep route handlers lean) ──────

const getProfileSchema = {
  tags: ["Users"],
  summary: "Get current user profile",
  security: [{ bearerAuth: [] }],
  response: { 200: UserSchema, 401: ErrorSchema, 404: ErrorSchema },
};

const updateProfileSchema = {
  tags: ["Users"],
  summary: "Update current user profile",
  security: [{ bearerAuth: [] }],
  body: UpdateProfileBodySchema,
  response: {
    200: UserSchema,
    401: ErrorSchema,
    404: ErrorSchema,
    409: ErrorSchema,
    422: ErrorSchema,
  },
};

const deleteUserSchema = {
  tags: ["Users"],
  summary: "Delete current user account",
  security: [{ bearerAuth: [] }],
  response: {
    204: { type: "null", description: "Account deleted successfully" },
    401: ErrorSchema,
    404: ErrorSchema,
  },
};

// ─── Plugin ───────────────────────────────────────────────────────────────────

export async function userRoutes(
  fastify: FastifyInstance,
  deps: ServerDependencies,
): Promise<void> {
  const getProfile = new GetProfileController(new GetUserService(deps.userRepo));
  const updateProfile = new UpdateProfileController(new UpdateUserService(deps.userRepo));
  const deleteUser = new DeleteUserController(
    new DeleteUserService(deps.userRepo, deps.refreshTokenRepo),
  );

  const f = fastify.withTypeProvider<ZodTypeProvider>();

  f.get("/users/me", { schema: getProfileSchema, preHandler: [authenticate] }, getProfile.handle);
  f.put(
    "/users/me",
    { schema: updateProfileSchema, preHandler: [authenticate] },
    updateProfile.handle,
  );
  f.delete(
    "/users/me",
    { schema: deleteUserSchema, preHandler: [authenticate] },
    deleteUser.handle,
  );
}
