const { ROLE, projects } = require("../data");

function canViewProject(user, project) {
  return user.role === ROLE.ADMIN || project.userId === user.id;
}

// function scopeProjects(user, project) {
// if (user.role === ROLE.ADMIN) return projects;
// return projects.filter((project) => project.userId === user.id);
// }

module.exports = {
  canViewProject,
  // scopedProjects,
};
