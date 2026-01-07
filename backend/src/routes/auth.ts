import type { App } from '../index.js';
import type { FastifyRequest, FastifyReply } from 'fastify';

/**
 * Registers authentication-related routes
 *
 * Note: Better Auth automatically handles these endpoints at /api/auth/:
 * - POST /api/auth/sign-up/email - User registration
 * - POST /api/auth/sign-in/email - User login
 * - POST /api/auth/sign-out - User logout
 * - GET /api/auth/get-session - Get current session
 *
 * This file demonstrates how to use requireAuth() to protect custom endpoints
 * that need to access the current user's session.
 */
export function registerAuthRoutes(app: App) {
  const requireAuth = app.requireAuth();

  /**
   * Get current user's profile
   * Protected endpoint - requires authentication
   */
  app.fastify.get(
    '/api/users/me',
    {
      schema: {
        description: 'Get current authenticated user profile',
        tags: ['auth'],
        response: {
          200: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              email: { type: 'string' },
              name: { type: 'string', nullable: true },
              image: { type: 'string', nullable: true },
              emailVerified: { type: 'boolean' },
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

      return {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        image: session.user.image,
        emailVerified: session.user.emailVerified,
        createdAt: session.user.createdAt,
        updatedAt: session.user.updatedAt,
      };
    }
  );

  /**
   * Verify if user is authenticated and has a valid session
   * Returns user data if authenticated, or 401 if not
   */
  app.fastify.get(
    '/api/auth/verify',
    {
      schema: {
        description: 'Verify current session validity',
        tags: ['auth'],
        response: {
          200: {
            type: 'object',
            properties: {
              authenticated: { type: 'boolean' },
              user: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  email: { type: 'string' },
                  name: { type: 'string', nullable: true },
                },
              },
            },
          },
          401: {
            type: 'object',
            properties: {
              authenticated: { type: 'boolean' },
            },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const session = await requireAuth(request, reply);
      if (!session) {
        return reply.code(401).send({ authenticated: false });
      }

      return {
        authenticated: true,
        user: {
          id: session.user.id,
          email: session.user.email,
          name: session.user.name,
        },
      };
    }
  );
}
