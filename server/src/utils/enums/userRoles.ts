/**
 * @description Defines the different roles a user can have within the application.
 * Roles are used to manage access control and authorization across the platform,
 * including multi-restaurant scenarios (platform admins, restaurant owners/staff, and end clients).
 * @type {Object}
 * @property {string} ADMIN - Platform administrator with full elevated privileges.
 * @property {string} OWNER - Owner/manager of a restaurant, can manage its settings, tables and staff.
 * @property {string} STAFF - Employee of a restaurant, can manage reservations on a daily basis.
 * @property {string} USER - Regular end client with standard access (can book reservations).
 */
export enum userRoles {
  ADMIN = "admin",
  OWNER = "owner",
  STAFF = "staff",
  USER = "user",
}
