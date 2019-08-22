module.exports = class UserServer {
    constructor() {
        this.listUser = [];
    }

    addUser(IDSocKET, username, avatar){
        this.listUser.push({
            id      : IDSocKET,
            username: username,
            avatar  : avatar
        });
    }

    removeUser(IDSocKET){
        this.listUser = this.listUser.filter(element => element.id !== IDSocKET);
    }

    getListUser(){
        return this.listUser;
    }
    getUserByUsername(username){
        return this.listUser.find(element => element.username === username);
    }
}