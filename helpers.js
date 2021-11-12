const generateRandomString = () => { // returns a string of 6 alphanumeric random characters
  return Math.random().toString(36).substring(2,8);
};

function getUserByEmail (email, database) {
  for (let id in database) {
    console.log("users[id].email: ", database[id].email);
    if (database[id].email === email) {
      return id;
    }
  }
  return null;
}

const urlsForUser = function(id, urlDatabase) {
  const output = {};
  for (let urlID in urlDatabase) {
    if (urlDatabase[urlID].userID === id){
      output[urlID] = urlDatabase[urlID].longURL;
    }
  }
  return output;
}

module.exports = { getUserByEmail, generateRandomString, urlsForUser };