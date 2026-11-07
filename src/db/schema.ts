import { sql } from "drizzle-orm";
import {
  bigint,
  boolean,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const staffProfiles = pgTable(
  "staff_profiles",
  {
    id: uuid("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    role: text("role").$type<"sindico" | "zelador">().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [uniqueIndex("staff_profiles_email_lower_idx").on(table.email)]
);

export const residents = pgTable(
  "residents",
  {
    id: bigint("id", { mode: "number" })
      .generatedAlwaysAsIdentity()
      .primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    unit: text("unit").notNull(),
    phone: text("phone").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [uniqueIndex("residents_email_lower_idx").on(table.email)]
);

export const registeredEmails = pgTable("registered_emails", {
  emailNormalized: text("email_normalized").primaryKey(),
});

export const occurrenceCategories = pgTable(
  "occurrence_categories",
  {
    id: bigint("id", { mode: "number" })
      .generatedAlwaysAsIdentity()
      .primaryKey(),
    name: text("name").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("occurrence_categories_name_lower_idx").on(table.name),
  ]
);

export const occurrences = pgTable(
  "occurrences",
  {
    id: bigint("id", { mode: "number" })
      .generatedAlwaysAsIdentity()
      .primaryKey(),
    code: text("code")
      .notNull()
      .default(
        sql`'OC-' || lpad(nextval('public.occurrence_code_seq')::text, 4, '0')`
      ),
    title: text("title").notNull(),
    description: text("description").notNull(),
    categoryId: bigint("category_id", { mode: "number" }).notNull(),
    locationKind: text("location_kind").$type<"common" | "custom">().notNull(),
    locationValue: text("location_value").notNull(),
    authorStaffId: uuid("author_staff_id"),
    authorResidentId: bigint("author_resident_id", { mode: "number" }),
    status: text("status")
      .$type<"pending" | "in_review" | "resolved" | "cancelled">()
      .notNull()
      .default("pending"),
    openedAt: timestamp("opened_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    closedAt: timestamp("closed_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("occurrences_code_idx").on(table.code),
    index("occurrences_category_id_idx").on(table.categoryId),
    index("occurrences_author_staff_id_idx").on(table.authorStaffId),
    index("occurrences_author_resident_id_idx").on(table.authorResidentId),
    index("occurrences_status_idx").on(table.status),
  ]
);

export const occurrencePhotos = pgTable(
  "occurrence_photos",
  {
    id: bigint("id", { mode: "number" })
      .generatedAlwaysAsIdentity()
      .primaryKey(),
    occurrenceId: bigint("occurrence_id", { mode: "number" }).notNull(),
    storagePath: text("storage_path").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("occurrence_photos_occurrence_id_idx").on(table.occurrenceId),
  ]
);

export const occurrenceComments = pgTable(
  "occurrence_comments",
  {
    id: bigint("id", { mode: "number" })
      .generatedAlwaysAsIdentity()
      .primaryKey(),
    occurrenceId: bigint("occurrence_id", { mode: "number" }).notNull(),
    body: text("body").notNull(),
    authorStaffId: uuid("author_staff_id"),
    authorResidentId: bigint("author_resident_id", { mode: "number" }),
    isEdited: boolean("is_edited").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("occurrence_comments_occurrence_id_idx").on(table.occurrenceId),
  ]
);

export type StaffProfile = typeof staffProfiles.$inferSelect;
export type Resident = typeof residents.$inferSelect;
export type OccurrenceCategory = typeof occurrenceCategories.$inferSelect;
export type Occurrence = typeof occurrences.$inferSelect;
export type OccurrencePhoto = typeof occurrencePhotos.$inferSelect;
export type OccurrenceComment = typeof occurrenceComments.$inferSelect;
