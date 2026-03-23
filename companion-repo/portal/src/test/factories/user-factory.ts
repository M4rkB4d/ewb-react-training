// TODO: Implement Exercise 3a — User Test Factory
// See guide A12 for requirements | Run: npm run test:exercises:06
interface User { id: string; username: string; email: string; role: 'admin' | 'teller' | 'customer'; }
export function createUser(overrides: Partial<User> = {}): User {
  return { id: '1', username: 'testuser', email: 'test@ewb.com', role: 'customer', ...overrides };
}
