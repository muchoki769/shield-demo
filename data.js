const ROLE = {
  ADMIN: "admin",
  MANAGER: "manager",
  EMPLOYEE: "employee",
};

module.exports = {
  ROLE: ROLE,
  users: [
    { id: 9, name: "Nairobi", role: ROLE.ADMIN },
    { id: 3, name: "Brian K", role: ROLE.MANAGER },
  ],
  projects: [
    { id: 1, name: "Nairobi's surveillance project", userId: 1 },
    { id: 2, name: "Brian's data collection project", userId: 2 },
  ],
};
