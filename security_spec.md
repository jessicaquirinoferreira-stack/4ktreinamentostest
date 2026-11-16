# Security Specification — 4k Treinamentos

## Data Invariants
1. **Admin Authority**: Only verified admins (`jessicaq2204@gmail.com` verified, `admin@x.com` verified, or document in `/admins/{uid}`) may create, update, or delete courses, modules, exam questions, settings, or arbitrarily release orders.
2. **Role Immutability**: Students creating `/users/{userId}` must strictly set `role: 'student'` and `uid == request.auth.uid`. They can never self-assign `role: 'admin'`.
3. **PII Isolation**: `/users/{userId}`, `/orders/{orderId}`, `/enrollments/{enrollmentId}`, and `/corporateQuotes/{quoteId}` are strictly restricted on read to the owner (`userId == request.auth.uid`) or an admin.
4. **Course & Module Integrity**: Published courses are publicly readable; draft courses are restricted to admins.
5. **Order State Locking**: Students can only create `pending` orders for themselves (`userId == request.auth.uid`) referencing an existing published course, and may only attach `checkoutUrl` while `pending`. Only admins or verified payment confirmation flows can transition an order to `paid` or `released`.
6. **Certificate Integrity**: Certificates can be publicly verified by `validationCode`, contain no sensitive PII (no email/CPF/phone), and can only be created by an admin or by the owning student when their enrollment exists with `examPassed == true`.
7. **Path & Size Guards**: Every document ID matches `^[a-zA-Z0-9_\-]+$` (max 128 chars), every string has explicit `.size() <= maxLength`, and timestamps match `request.time`.

## Dirty Dozen Payloads (Must Return PERMISSION_DENIED)
1. Shadow field injection on `/users/{uid}` (`isAdmin: true`).
2. Self-elevation on `/users/{uid}` (`role: 'admin'`).
3. Cross-user read on `/users/{otherUid}`.
4. Unverified email spoof attempting admin write.
5. Creating an order with `status: 'released'` directly as student.
6. Creating an order for another `userId`.
7. Updating an order from `pending` to `paid` as non-admin student.
8. Injecting oversized 2KB string into `courseId` or `orderId`.
9. Listing all `/orders` as a regular student without `userId == request.auth.uid`.
10. Modifying `/settings/integrations` (`infinitePayHandle`) as non-admin.
11. Reading `/corporateQuotes` as non-admin.
12. Revoking or modifying an existing `/certificates/{id}` as a student.
