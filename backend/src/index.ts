import { createApplication } from "@specific-dev/framework";
import * as appSchema from './db/schema.js';
import * as authSchema from './db/auth-schema.js';
import { registerAuthRoutes } from './routes/auth.js';
import { registerFamilyRoutes } from './routes/families.js';
import { registerFamilyStylingRoutes } from './routes/family-styling.js';

// Combine both schemas
const schema = { ...appSchema, ...authSchema };

// Create application with schema for full database type support
export const app = await createApplication(schema);

// Export App type for use in route files
export type App = typeof app;

// Enable authentication with Better Auth
app.withAuth();

// Enable storage for file uploads
app.withStorage();

// Register routes - add your route modules here
// IMPORTANT: Always use registration functions to avoid circular dependency issues
registerAuthRoutes(app);
registerFamilyRoutes(app);
registerFamilyStylingRoutes(app);

await app.run();
app.logger.info('Application running');
