//To find whether the user exist or not
const getUserByEmail = function (email,users) {
  for (let userId in users) {
    if (users[userId].email === email)
      return userId;
  }
  return false;
};

module.exports = { getUserByEmail };