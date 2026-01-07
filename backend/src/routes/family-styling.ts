import type { App } from '../index.js';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { eq, and } from 'drizzle-orm';
import * as schema from '../db/schema.js';
import { z } from 'zod';

/**
 * Valid color values for family member styling
 */
const VALID_COLORS = [
  '#4F46E5',
  '#22C55E',
  '#F97316',
  '#EF4444',
  '#06B6D4',
  '#A855F7',
  '#F59E0B',
  '#EC4899',
  '#84CC16',
  '#64748B',
] as const;

/**
 * Validation schemas
 */
const updateMemberStyleSchema = z.object({
  color: z.enum(VALID_COLORS).optional(),
  avatar_url: z.string().url('Invalid URL').optional(),
});

type UpdateMemberStyleRequest = z.infer<typeof updateMemberStyleSchema>;

/**
 * Registers family styling routes
 */
export function registerFamilyStylingRoutes(app: App) {
  const requireAuth = app.requireAuth();

  /**
   * Get all family members for the current user's family
   * GET /api/families/members
   *
   * Response: { members: [{ id, name, role, color?, avatar_url? }] }
   */
  app.fastify.get(
    '/api/families/members',
    {
      schema: {
        description: 'Get all family members for current user',
        tags: ['families'],
        response: {
          200: {
            type: 'object',
            properties: {
              members: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    name: { type: 'string' },
                    role: { type: 'string' },
                    color: { type: 'string', nullable: true },
                    avatar_url: { type: 'string', nullable: true },
                  },
                },
              },
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
        // Get user's family
        const userFamily = await app.db
          .select()
          .from(schema.families)
          .where(eq(schema.families.createdBy, session.user.id))
          .limit(1);

        if (userFamily.length === 0) {
          return reply.code(404).send({
            error: 'Family not found',
          });
        }

        const family = userFamily[0];

        // Get all family members
        const members = await app.db
          .select({
            id: schema.familyMembers.id,
            name: schema.familyMembers.name,
            role: schema.familyMembers.role,
            color: schema.familyMembers.color,
            avatar_url: schema.familyMembers.avatarUrl,
          })
          .from(schema.familyMembers)
          .where(eq(schema.familyMembers.familyId, family.id));

        return {
          members,
        };
      } catch (error) {
        app.logger.error('Error fetching family members');
        return reply.code(400).send({
          error: 'Failed to fetch family members',
        });
      }
    }
  );

  /**
   * Update a family member's styling (color and/or avatar)
   * PATCH /api/families/members/:memberId
   *
   * Request body: { color?: string, avatar_url?: string }
   * Response: { id, name, role, color, avatar_url }
   */
  app.fastify.patch(
    '/api/families/members/:memberId',
    {
      schema: {
        description: 'Update family member styling',
        tags: ['families'],
        params: {
          type: 'object',
          required: ['memberId'],
          properties: {
            memberId: { type: 'string' },
          },
        },
        body: {
          type: 'object',
          properties: {
            color: {
              type: 'string',
              description: 'Hex color code for the member',
            },
            avatar_url: {
              type: 'string',
              description: 'URL to avatar image',
            },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              role: { type: 'string' },
              color: { type: 'string' },
              avatar_url: { type: 'string', nullable: true },
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
          404: {
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
        const { memberId } = request.params as { memberId: string };

        // Validate request body
        const validatedData = updateMemberStyleSchema.parse(request.body);

        // Get user's family
        const userFamily = await app.db
          .select()
          .from(schema.families)
          .where(eq(schema.families.createdBy, session.user.id))
          .limit(1);

        if (userFamily.length === 0) {
          return reply.code(404).send({
            error: 'Family not found',
          });
        }

        const family = userFamily[0];

        // Verify member belongs to user's family
        const member = await app.db
          .select()
          .from(schema.familyMembers)
          .where(
            and(
              eq(schema.familyMembers.id, memberId),
              eq(schema.familyMembers.familyId, family.id)
            )
          )
          .limit(1);

        if (member.length === 0) {
          return reply.code(404).send({
            error: 'Family member not found',
          });
        }

        // Build update object
        const updateData: Record<string, string | null> = {};
        if (validatedData.color !== undefined) {
          updateData.color = validatedData.color;
        }
        if (validatedData.avatar_url !== undefined) {
          updateData.avatarUrl = validatedData.avatar_url;
        }

        // Update family member
        const updated = await app.db
          .update(schema.familyMembers)
          .set(updateData)
          .where(eq(schema.familyMembers.id, memberId))
          .returning({
            id: schema.familyMembers.id,
            name: schema.familyMembers.name,
            role: schema.familyMembers.role,
            color: schema.familyMembers.color,
            avatar_url: schema.familyMembers.avatarUrl,
          });

        const updatedMember = updated[0];

        return {
          id: updatedMember.id,
          name: updatedMember.name,
          role: updatedMember.role,
          color: updatedMember.color,
          avatar_url: updatedMember.avatar_url,
        };
      } catch (error) {
        if (error instanceof z.ZodError) {
          const firstIssue = error.issues[0];
          const errorMessage = firstIssue?.message || 'Validation error';
          return reply.code(400).send({
            error: errorMessage,
          });
        }

        app.logger.error('Error updating family member');
        return reply.code(400).send({
          error: 'Failed to update family member',
        });
      }
    }
  );

  /**
   * Mark family styling setup as complete
   * POST /api/families/complete-style
   *
   * Response: { success: boolean }
   */
  app.fastify.post(
    '/api/families/complete-style',
    {
      schema: {
        description: 'Mark family styling setup as complete',
        tags: ['families'],
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
            },
          },
          401: {
            type: 'object',
            properties: {
              error: { type: 'string' },
            },
          },
          400: {
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
        // Update or create user profile
        const existingProfile = await app.db
          .select()
          .from(schema.userProfile)
          .where(eq(schema.userProfile.id, session.user.id));

        if (existingProfile.length > 0) {
          await app.db
            .update(schema.userProfile)
            .set({ familyStyleComplete: true })
            .where(eq(schema.userProfile.id, session.user.id));
        } else {
          await app.db.insert(schema.userProfile).values({
            id: session.user.id,
            familySetupComplete: false,
            familyStyleComplete: true,
          });
        }

        return {
          success: true,
          message: 'Family styling setup marked as complete',
        };
      } catch (error) {
        app.logger.error('Error completing family styling');
        return reply.code(400).send({
          error: 'Failed to complete family styling setup',
        });
      }
    }
  );

  /**
   * Upload avatar for a family member
   * POST /api/upload/avatar
   *
   * Accepts: multipart/form-data with file field named 'file'
   * Response: { avatar_url: string }
   */
  app.fastify.post(
    '/api/upload/avatar',
    {
      schema: {
        description: 'Upload avatar image for family member',
        tags: ['upload'],
        consumes: ['multipart/form-data'],
        response: {
          200: {
            type: 'object',
            properties: {
              avatar_url: { type: 'string' },
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
          413: {
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
        // Get the file with size limit (5MB)
        const data = await request.file({ limits: { fileSize: 5 * 1024 * 1024 } });

        if (!data) {
          return reply.code(400).send({ error: 'No file provided' });
        }

        let buffer: Buffer;
        try {
          buffer = await data.toBuffer();
        } catch (err) {
          return reply.code(413).send({ error: 'File too large. Maximum size: 5MB' });
        }

        // Extract member ID from filename or use placeholder
        // Format: memberId should be included in the request, but for now we'll use a timestamp
        const timestamp = Date.now();
        const key = `avatars/${session.user.id}/${timestamp}.jpg`;

        // Upload to storage
        const uploadedKey = await app.storage.upload(key, buffer);

        // Generate signed URL for immediate access
        const { url } = await app.storage.getSignedUrl(uploadedKey);

        return {
          avatar_url: url,
        };
      } catch (error) {
        app.logger.error('Error uploading avatar');
        return reply.code(400).send({
          error: 'Failed to upload avatar',
        });
      }
    }
  );
}
