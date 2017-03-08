const userIsAdmin = roleId =>
  roleId === '2';

const isUserData = (loggedInUserId, suppliedId) =>
  loggedInUserId === String(suppliedId);

const userHasPermission = (userData, dataRequestId) =>
  userIsAdmin(userData.role) || isUserData(userData.userId, dataRequestId);


export {
  userIsAdmin,
  isUserData,
  userHasPermission
};
