import type { App } from '../index.js';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { eq, and } from 'drizzle-orm';
import * as schema from '../db/schema.js';
import { z } from 'zod';

/**
 * Validation schemas
 */
const createFamilyRequestSchema = z.object({
  familyName: z.string().min(1, 'Family name is required'),
  members: z
    .array(
      z.object({
        name: z.string().min(1, 'Member name is required'),
        role: z.enum(['parent', 'partner', 'child']).refine(
          (val) => ['parent', 'partner', 'child'].includes(val),
          'Role must be parent, partner, or child'
        ),
      })
    )
    .min(1, 'At least one family member is required'),
});

type CreateFamilyRequest = z.infer<typeof createFamilyRequestSchema>;

/**
 * Registers family management routes
 */
export function registerFamilyRoutes(app: App) {
  const requireAuth = app.requireAuth();

  /**
   * Create a new family with members
   * POST /api/families
   *
   * Request body: { familyName: string, members: Array<{ name: string, role: string }> }
   * Response: { familyId: string, success: boolean }
   */
  app.fastify.post(
    '/api/families',
    {
      schema: {
        description: 'Create a new family with members',
        tags: ['families'],
        body: {
          type: 'object',
          required: ['familyName', 'members'],
          properties: {
            familyName: {
              type: 'string',
              description: 'Name of the family',
            },
            members: {
              type: 'array',
              minItems: 1,
              items: {
                type: 'object',
                required: ['name', 'role'],
                properties: {
                  name: {
                    type: 'string',
                    description: 'Family member name',
                  },
                  role: {
                    type: 'string',
                    enum: ['parent', 'partner', 'child'],
                    description: 'Role in the family',
                  },
                },
              },
            },
          },
        },
        response: {
          201: {
            type: 'object',
            properties: {
              familyId: { type: 'string' },
              success: { type: 'boolean' },
              message: { type: 'string' },
            },
          },
          400: {
            type: 'object',
            properties: {
              error: { type: 'string' },
            },
          },
          401: {
            type: 'object',
            properties: {
              error: { type: 'string' },
            },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const session = await requireAuth(request, reply);
      if (!session) return;

      try {
        // Validate request body
        const validatedData = createFamilyRequestSchema.parse(request.body);

        // Create family in a transaction
        const family = await app.db
          .insert(schema.families)
          .values({
            name: validatedData.familyName,
            createdBy: session.user.id,
          })
          .returning();

        const createdFamily = family[0];

        // Create family members
        await app.db.insert(schema.familyMembers).values(
          validatedData.members.map((member) => ({
            familyId: createdFamily.id,
            name: member.name,
            role: member.role as 'parent' | 'partner' | 'child',
            userId: null, // Initially not linked to a user
          }))
        );

        // Update user profile to mark family setup as complete
        const existingProfile = await app.db
          .select()
          .from(schema.userProfile)
          .where(eq(schema.userProfile.id, session.user.id));

        if (existingProfile.length > 0) {
          await app.db
            .update(schema.userProfile)
            .set({ familySetupComplete: true })
            .where(eq(schema.userProfile.id, session.user.id));
        } else {
          await app.db.insert(schema.userProfile).values({
            id: session.user.id,
            familySetupComplete: true,
          });
        }

        return reply.code(201).send({
          familyId: createdFamily.id,
          success: true,
          message: 'Family created successfully',
        });
      } catch (error) {
        if (error instanceof z.ZodError) {
          const firstIssue = error.issues[0];
          const errorMessage = firstIssue?.message || 'Validation error';
          return reply.code(400).send({
            error: errorMessage,
          });
        }

        app.logger.error('Error creating family');
        return reply.code(400).send({
          error: 'Failed to create family',
        });
      }
    }
  );

  /**
   * Get current user's profile with family setup status
   * GET /api/profile
   *
   * Response: { id, email, name, image, emailVerified, familySetupComplete, createdAt, updatedAt }
   */
  app.fastify.get(
    '/api/profile',
    {
      schema: {
        description: 'Get current user profile with family setup status',
        tags: ['profile'],
        response: {
          200: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              email: { type: 'string' },
              name: { type: 'string' },
              image: { type: 'string', nullable: true },
              emailVerified: { type: 'boolean' },
              familySetupComplete: { type: 'boolean' },
              createdAt: { type: 'string' },
              updatedAt: { type: 'string' },
            },
          },
          401: {
            type: 'object',
            properties: {
              error: { type: 'string' },
            },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const session = await requireAuth(request, reply);
      if (!session) return;

      try {
        // Get user profile to check family setup status
        const profile = await app.db
          .select()
          .from(schema.userProfile)
          .where(eq(schema.userProfile.id, session.user.id));

        const familySetupComplete = profile.length > 0 ? profile[0].familySetupComplete : false;

        return {
          id: session.user.id,
          email: session.user.email,
          name: session.user.name,
          image: session.user.image,
          emailVerified: session.user.emailVerified,
          familySetupComplete,
          createdAt: session.user.createdAt,
          updatedAt: session.user.updatedAt,
        };
      } catch (error) {
        app.logger.error('Error fetching user profile');
        return reply.code(400).send({
          error: 'Failed to fetch profile',
        });
      }
    }
  );
}
