export type SystemRole = 'Super Admin' | 'Admin' | 'Finance' | 'Customer Service' | 'Viewer' | 'Merchant Owner';

export interface PermissionSet {
  canViewAnalytics: boolean;
  canApproveMerchant: boolean;
  canTriggerRefunds: boolean;
  canConfigureWebhooks: boolean;
  canExecutePayments: boolean;
  canAccessAuditLogs: boolean;
}

export const PERMISSION_MATRIX: Record<SystemRole, PermissionSet> = {
  'Super Admin': {
    canViewAnalytics: true,
    canApproveMerchant: true,
    canTriggerRefunds: true,
    canConfigureWebhooks: true,
    canExecutePayments: true,
    canAccessAuditLogs: true,
  },
  'Admin': {
    canViewAnalytics: true,
    canApproveMerchant: true,
    canTriggerRefunds: false,
    canConfigureWebhooks: true,
    canExecutePayments: true,
    canAccessAuditLogs: true,
  },
  'Finance': {
    canViewAnalytics: true,
    canApproveMerchant: false,
    canTriggerRefunds: true,
    canConfigureWebhooks: false,
    canExecutePayments: true,
    canAccessAuditLogs: false,
  },
  'Customer Service': {
    canViewAnalytics: false,
    canApproveMerchant: false,
    canTriggerRefunds: false,
    canConfigureWebhooks: false,
    canExecutePayments: false,
    canAccessAuditLogs: false,
  },
  'Viewer': {
    canViewAnalytics: true,
    canApproveMerchant: false,
    canTriggerRefunds: false,
    canConfigureWebhooks: false,
    canExecutePayments: false,
    canAccessAuditLogs: false,
  },
  'Merchant Owner': {
    canViewAnalytics: true,
    canApproveMerchant: false,
    canTriggerRefunds: true,
    canConfigureWebhooks: true,
    canExecutePayments: true,
    canAccessAuditLogs: true,
  }
};
