import { pathToFileURL } from 'node:url';
import { connectDB, disconnectDB } from './connection.js';
import { runMigrations } from './migrate.js';
import { Template } from '../models/Template.js';

// Thumbnails live in client/public/templates and are served by the client at /templates/<slug>.png
const img = (slug) => `/templates/${slug}.png`;

export const templates = [
  {
    name: 'Analytics Dashboard Pro',
    description:
      'A data-dense analytics dashboard with KPI cards, time-series charts, cohort tables and exportable reports. Built for product and growth teams that live in their metrics.',
    thumbnail_url: img('analytics-dashboard-pro'),
    category: 'Dashboard',
  },
  {
    name: 'SaaS Landing Page Kit',
    description:
      'A conversion-focused marketing site with hero, feature grid, pricing table, testimonials and FAQ sections. Ships with dark mode and fully responsive layouts.',
    thumbnail_url: img('saas-landing-page-kit'),
    category: 'Landing Page',
  },
  {
    name: 'Admin Console Starter',
    description:
      'A role-aware admin panel with user management, audit logs, feature flags and a collapsible sidebar. Ideal as the back-office for any multi-tenant product.',
    thumbnail_url: img('admin-console-starter'),
    category: 'Admin',
  },
  {
    name: 'Billing & Subscription Portal',
    description:
      'Self-serve billing screens covering plan upgrades, invoices, payment methods and usage-based metering. Designed to plug into Stripe-style APIs.',
    thumbnail_url: img('billing-subscription-portal'),
    category: 'Billing',
  },
  {
    name: 'CRM Sales Pipeline',
    description:
      'A drag-and-drop Kanban pipeline with deal cards, contact timelines, activity logging and forecast summaries. Keeps small sales teams organised from lead to close.',
    thumbnail_url: img('crm-sales-pipeline'),
    category: 'CRM',
  },
  {
    name: 'Help Center & Knowledge Base',
    description:
      'A searchable support portal with article categories, ticket submission and a lightweight community Q&A section. Reduces support load while keeping customers informed.',
    thumbnail_url: img('help-center-knowledge-base'),
    category: 'Support',
  },
  {
    name: 'Onboarding Flow Wizard',
    description:
      'A multi-step onboarding experience with progress tracking, team invites, integrations setup and a guided product tour. Boosts activation in the first session.',
    thumbnail_url: img('onboarding-flow-wizard'),
    category: 'Dashboard',
  },
  {
    name: 'Project Management Board',
    description:
      'Boards, sprints, task detail drawers and workload views for cross-functional teams. Includes keyboard shortcuts and real-time presence indicators.',
    thumbnail_url: img('project-management-board'),
    category: 'Productivity',
  },
];

/** Upserts by unique template name, so re-running never duplicates documents or drops favorites. */
export async function seedTemplates() {
  await Template.bulkWrite(
    templates.map((t, index) => ({
      updateOne: {
        filter: { name: t.name },
        update: {
          $set: {
            description: t.description,
            thumbnailUrl: t.thumbnail_url,
            category: t.category,
            position: index,
          },
        },
        upsert: true,
      },
    }))
  );
}

async function main() {
  await connectDB();
  await runMigrations();
  await seedTemplates();
  const total = await Template.countDocuments();
  console.log(`Seed complete. ${total} templates in the database.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main()
    .catch((err) => {
      console.error('Seeding failed:', err.message);
      process.exitCode = 1;
    })
    .finally(() => disconnectDB());
}
