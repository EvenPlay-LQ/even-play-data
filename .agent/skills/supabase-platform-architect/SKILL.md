---
name: Supabase Platform Architect
description: This skill enables the AI agent to design, implement, and maintain full backend systems using Supabase.
---

# Skill: Supabase Platform Architect

## Description

This skill enables the AI agent to design, implement, and maintain full backend systems using Supabase.

Supabase provides a complete backend platform built on PostgreSQL, including authentication, realtime data synchronization, storage, and serverless edge functions.

This skill activates when working with:

• SaaS applications
• web apps
• AI tools
• dashboards
• realtime apps
• mobile backends

---

# Core Technologies

Database
• PostgreSQL

Platform
• Supabase

Frontend integrations
• Next.js
• React
• TypeScript

Deployment
• Vercel
• Supabase hosting

---

# Backend Architecture Principles

When designing Supabase systems:

1. Use PostgreSQL as the single source of truth.
2. Organize schema using clear domain tables.
3. Use row level security (RLS) for data protection.
4. Separate public and private data access.
5. Use indexes for high performance queries.

---

# Database Design Strategy

For every project:

1. Identify core entities
2. Design relational schema
3. Define primary keys
4. Create foreign key relationships
5. Add indexes

Example structure:

users
profiles
projects
tasks
activity_logs

Use UUIDs as primary keys.

---

# Authentication

Use Supabase Auth for user management.

Supported auth providers:

• email/password
• magic links
• OAuth providers

Always create a profiles table connected to auth.users.

Example:

profiles.id = auth.users.id

Use RLS policies to ensure users only access their own data.

---

# Row Level Security

Always enable RLS for user-generated data.

Example policy pattern:

Allow users to access rows where:

user_id = auth.uid()

Never expose unrestricted data access.

---

# Realtime Systems

Use Supabase realtime when building:

• collaborative apps
• dashboards
• chat systems
• live analytics

Subscribe to table changes instead of polling APIs.

Example triggers:

INSERT
UPDATE
DELETE

---

# Edge Functions

Use Supabase Edge Functions when logic must run securely on the server.

Examples:

• payment processing
• AI API calls
• background tasks
• webhook handling

Edge functions should be:

stateless
secure
small

---

# Storage

Use Supabase storage for:

images
documents
user uploads

Apply bucket policies with RLS.

Example buckets:

avatars
uploads
assets

---

# Query Optimization

Ensure performance by:

• selecting only required columns
• adding indexes to frequently queried fields
• avoiding large joins
• paginating results

Use Supabase RPC functions for complex queries.

---

# Reusable Patterns

Always structure Supabase integration using a client module.

Example:

lib/supabase/client.ts

Export a reusable client instance.

Use server and client clients separately when using Next.js.

---

# Security Rules

Always ensure:

• RLS enabled
• secure environment variables
• restricted admin access
• protected edge functions

Never expose service role keys in frontend code.

---

# Observability

Monitor:

• query performance
• API errors
• auth issues

Log important backend events.

---

# Development Workflow

1. design schema
2. configure RLS
3. implement authentication
4. connect frontend
5. build realtime subscriptions
6. deploy edge functions
7. test security policies

---

# Supabase + Next.js Integration

Preferred stack:

Next.js App Router
Server Components
TypeScript

Use server-side Supabase client when fetching secure data.

Use client components for realtime subscriptions.

---

# Performance Strategy

Use:

• caching
• edge rendering
• partial hydration

Optimize database queries before scaling infrastructure.

---

# Deployment Strategy

Recommended production stack:

Frontend
Next.js deployed on Vercel

Backend
Supabase hosted database

Edge logic
Supabase edge functions

Ensure environment variables are configured properly.

---

# Quality Checklist

Before completing backend tasks verify:

• schema correctness
• RLS policy coverage
• query performance
• authentication flows
• error handling

---

# Loveable Product Rule

Backend systems should feel invisible.

Users should experience:

fast responses
reliable data
secure interactions

If the backend causes friction, redesign the system.
