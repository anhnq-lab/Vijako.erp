/**
 * Role-Based Access Control (RBAC) System
 * Defines roles and permissions for the application.
 */

// Define available roles in the system (must match 'role' column in database)
export const ROLES = {
    ADMIN: 'Admin', // Full access
    DIRECTOR: 'Director', // View all, approve high level
    PROJECT_MANAGER: 'Project Manager', // Manage assigned projects
    QS: 'QS', // Quantity Surveyor - Manage contracts, payments
    SITE_MANAGER: 'Site Manager', // Manage daily logs, site requests
    ACCOUNTANT: 'Accountant', // View finance, payments
    ENGINEER: 'Engineer', // View tasks, submit logs
    OFFICER: 'Officer', // Basic access
};

// Define specific permissions
// This allows finer granularity than just checking roles directly
export const PERMISSIONS = {
    // Project Permissions
    VIEW_PROJECTS: [ROLES.ADMIN, ROLES.DIRECTOR, ROLES.PROJECT_MANAGER, ROLES.QS, ROLES.SITE_MANAGER, ROLES.ACCOUNTANT, ROLES.ENGINEER],
    CREATE_PROJECT: [ROLES.ADMIN, ROLES.DIRECTOR],
    EDIT_PROJECT: [ROLES.ADMIN, ROLES.DIRECTOR, ROLES.PROJECT_MANAGER],
    DELETE_PROJECT: [ROLES.ADMIN],

    // Contract & Finance Permissions
    VIEW_CONTRACTS: [ROLES.ADMIN, ROLES.DIRECTOR, ROLES.PROJECT_MANAGER, ROLES.QS, ROLES.ACCOUNTANT],
    CREATE_CONTRACT: [ROLES.ADMIN, ROLES.QS],
    EDIT_CONTRACT: [ROLES.ADMIN, ROLES.QS],
    APPROVE_PAYMENT: [ROLES.ADMIN, ROLES.DIRECTOR, ROLES.PROJECT_MANAGER],
    VIEW_FINANCE_DASHBOARD: [ROLES.ADMIN, ROLES.DIRECTOR, ROLES.ACCOUNTANT],

    // Supply Chain Permissions
    VIEW_SUPPLY_CHAIN: [ROLES.ADMIN, ROLES.DIRECTOR, ROLES.PROJECT_MANAGER, ROLES.ENGINEER, ROLES.SITE_MANAGER],
    CREATE_PURCHASE_REQUEST: [ROLES.PROJECT_MANAGER, ROLES.SITE_MANAGER, ROLES.ENGINEER],
    APPROVE_PURCHASE_REQUEST: [ROLES.ADMIN, ROLES.DIRECTOR, ROLES.PROJECT_MANAGER],
    MANAGE_INVENTORY: [ROLES.ADMIN, ROLES.SITE_MANAGER],

    // Site Operations (Diary)
    VIEW_SITE_DIARY: [ROLES.ADMIN, ROLES.DIRECTOR, ROLES.PROJECT_MANAGER, ROLES.SITE_MANAGER, ROLES.ENGINEER],
    CREATE_SITE_DIARY: [ROLES.SITE_MANAGER, ROLES.ENGINEER],
    APPROVE_SITE_DIARY: [ROLES.PROJECT_MANAGER, ROLES.ADMIN],

    // System
    MANAGE_USERS: [ROLES.ADMIN, ROLES.DIRECTOR],
};

/**
 * Check if a user role has a specific permission
 * @param userRole The role of the current user
 * @param allowedRoles Array of roles allowed for this action
 * @returns boolean
 */
export const hasPermission = (userRole: string | undefined, allowedRoles: string[]): boolean => {
    if (!userRole) return false;
    // Admin always has permission
    if (userRole === ROLES.ADMIN) return true;
    return allowedRoles.includes(userRole);
};
