module.exports = class UserServerRoom {
    constructor() {
        this.listUser = [];
    }

    addUser(IDSocKET, username, avatar, roomID){
        this.listUser.push({
            id      : IDSocKET,
            username: username,
            avatar  : avatar,
            room    : roomID
        });
    }

    removeUser(IDSocKET){
        this.listUser = this.listUser.filter(element => element.id !== IDSocKET);
    }

    getListUser(){
        return this.listUser;
    }

    getListUserByRoom(RoomID){
        return this.listUser.filter(element => element.room === RoomID);
    }

    getUserByID(IDSocKET){
        return this.listUser.find(element => element.id === IDSocKET);
    }
}