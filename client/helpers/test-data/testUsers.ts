const password = "Temporary_good_password123"; // replaced with "rr" in the instrumentation file

export const testUsers = [
  {
    email: "admin@example.com",
    username: "admin",
    name: "admin",
    password,
    role: "admin",
    emailVerified: true,
  },
  // {
  //   email: "mod@example.com",
  //   username: "mod",
  //   name: "mod",
  //   password,
  //   role: "mod",
  //   emailVerified: true,
  // },
  {
    email: "user@example.com",
    username: "user",
    name: "user",
    password,
    emailVerified: true,
  },
  {
    email: "new_user@example.com",
    username: "new_user",
    name: "new_user",
    password,
    emailVerified: false,
  },
];
