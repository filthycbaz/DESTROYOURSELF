import { users } from "../data/users";

export async function fetchUsers() {
  // Simulación de una llamada async
  return new Promise((resolve) => {
    setTimeout(() => resolve(users), 300);
  });
}

export async function getUserByEmail(email) {
  const allUsers = await fetchUsers();
  return allUsers.find((u) => u.email === email) || null;
}
