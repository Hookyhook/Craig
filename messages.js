const db = require("./db.js");
exports.messageRecived = async () =>{
    updateMessageCount(message);
}
// updates Message Coubt
const updateMessageCount = async(message) =>{
    //check if user in db
    author = message.author;
    console.log(author);
}