# Security Specification: TextVerified SMS Automation

## 1. Data Invariants
- A user can only access, create, update, or delete their own data under `/users/{userId}/*`.
- Only authenticated users with verified emails (`request.auth.token.email_verified == true`) can write data.
- The `userId` in `VerificationRecord` and `ActivityLog` must strictly match `request.auth.uid`.
- Verification records once terminal (`Completed`, `TimedOut`, `Cancelled`) cannot have their core status or numbers tampered with.
- All path variable IDs must satisfy `isValidId(id)`.
- System deny-all by default.

## 2. The "Dirty Dozen" Payloads (Adversarial Tests)
1. **Unauthenticated Read**: Attempting to read `/users/user_abc` without an auth token. (Expect: DENY)
2. **Cross-Tenant Profile Read**: User `alice_123` attempting to read `/users/bob_456`. (Expect: DENY)
3. **Cross-Tenant Verification Write**: User `alice_123` creating a verification under `/users/bob_456/verifications/v1`. (Expect: DENY)
4. **Unverified Email Write**: User with `email_verified == false` attempting to create a profile or verification. (Expect: DENY)
5. **Ghost Field Injection (Shadow Update)**: Attempting to insert `{ isSuperAdmin: true }` into a verification record. (Expect: DENY)
6. **Path Traversal / Malformed Document ID**: Creating a record with document ID `../../etc/passwd` or oversized junk > 128 chars. (Expect: DENY)
7. **UID Spoofing**: User `alice_123` inserting `userId: "bob_456"` in incoming payload under `/users/alice_123/verifications/v2`. (Expect: DENY)
8. **Invalid Enum Status**: Updating verification status to `"Hacked"` instead of `['Pending', 'Completed', 'TimedOut', 'Cancelled']`. (Expect: DENY)
9. **Oversized String Payload**: Attempting to inject a 50KB payload into `smsCode` or `targetService`. (Expect: DENY)
10. **Arbitrary Collection Root Write**: Writing directly to `/unprotected_collection/item1`. (Expect: DENY)
11. **Client Timestamp Manipulation**: Injecting arbitrary future timestamps into server-governed audit logs. (Expect: DENY)
12. **Modifying Immortal Fields**: Attempting to mutate `id`, `userId`, or `phoneNumber` on an existing verification record. (Expect: DENY)

## 3. Test Runner Specification
All 12 adversarial payloads return `PERMISSION_DENIED` under the generated rules.
