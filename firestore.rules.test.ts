/**
 * Security Rule Verification Specification Runner
 * Verifies Dirty Dozen Payloads against 4k Treinamentos Firestore Rules.
 */
export const dirtyDozenAssertions = [
  { name: 'Shadow field injection on /users', path: '/users/u1', op: 'create', expect: 'PERMISSION_DENIED' },
  { name: 'Self-elevation to admin role on /users', path: '/users/u1', op: 'create', expect: 'PERMISSION_DENIED' },
  { name: 'Cross-user read on /users', path: '/users/u2', op: 'get', expect: 'PERMISSION_DENIED' },
  { name: 'Unverified email spoof admin write', path: '/courses/nr35', op: 'create', expect: 'PERMISSION_DENIED' },
  { name: 'Student creates order with released status', path: '/orders/ord1', op: 'create', expect: 'PERMISSION_DENIED' },
  { name: 'Student creates order for another userId', path: '/orders/ord1', op: 'create', expect: 'PERMISSION_DENIED' },
  { name: 'Student updates order status to paid', path: '/orders/ord1', op: 'update', expect: 'PERMISSION_DENIED' },
  { name: 'Oversized ID poisoning > 128 chars', path: '/orders/' + 'a'.repeat(200), op: 'create', expect: 'PERMISSION_DENIED' },
  { name: 'Student lists all orders without owner filter', path: '/orders', op: 'list', expect: 'PERMISSION_DENIED' },
  { name: 'Non-admin modifies integration settings', path: '/settings/integrations', op: 'update', expect: 'PERMISSION_DENIED' },
  { name: 'Non-admin reads corporate quotes', path: '/corporateQuotes/q1', op: 'get', expect: 'PERMISSION_DENIED' },
  { name: 'Student revokes certificate', path: '/certificates/c1', op: 'update', expect: 'PERMISSION_DENIED' }
];
