'use strict';

class Users {
    constructor(dbWrapper) {
        this.dbWrapper = dbWrapper;
    }

    Table = "user"

    Role = {
        teacher: 0,
        student: 1
    }

    State = {
        unactivate: 0,
        activated: 1,
        blocked: 2
    }

    Type = {
        user: 0,
        admin: 1
    }

    registerUser(login, pass, email, name, role, func = null) {
        if (!(login.length > 0 && pass.length > 0 && email.length > 0 && name.length > 0 &&
            (role == this.Role.teacher || role == this.Role.student))) {
            func(false);
        }
        let self = this;
        this.userExist(login, function (row) {
            if (row != undefined) {
                func(false);
                return;
            }

            self.dbWrapper.insert(self.Table, [
                { name: "login", value: login },
                { name: "passhash", value: self.cyrb53(login + pass) }, // todo
                { name: "email", value: email },
                { name: "name", value: name },
                { name: "role", value: role },
                { name: "registerDate", value: new Date() },
                { name: "state", value: self.State.unactivate }],
                func);
        });
    }

    makeAdmin(login, func = null) {
        return this.dbWrapper.update(this.Table,
            [{ name: "type", value: this.Type.admin }],
            { name: "login", value: login },
            func);
    }

    activateUser(login, func = null) {
        return this.dbWrapper.update(this.Table,
            [{ name: "state", value: this.State.activated }],
            { name: "login", value: login },
            func);
    }

    getUserList(func) {
        var self = this;
        this.dbWrapper.select_all(this.Table, null, function (success, rows) {
            func(rows.map(row => self.getUserInfo(row)));
        })
    }

    checkValidUser(login, password, func) {
        var self = this;
        this.dbWrapper.select_one(this.Table, [
            { name: "login", value: login },
            { name: "passhash", value: this.cyrb53(login + password) }],
            function (success, row) {
                if (row === undefined) {
                    func(row);
                    return;
                }

                func(self.getUserInfo(row));
            });
    }

    userExist(login, func) {
        var self = this;
        this.dbWrapper.select_one(this.Table, [
            { name: "login", value: login }],
            function (success, row) {
                if (row === undefined) {
                    func(row);
                    return;
                }

                func(self.getUserInfo(row));
            });
    }

    banUser(login, isBan, func = null) {
        return this.dbWrapper.update(this.Table,
            [{ name: "state", value: isBan ? this.State.blocked : this.State.activated }],
            { name: "login", value: login },
            func);
    }

    deleteUser(login, func = null) {
        return this.dbWrapper.delete(this.Table,
            { name: "login", value: login },
            func);
    }

    getUserInfo(userRow) {
        var userInfo = {};
        userInfo.id = userRow.id;
        userInfo.isAdmin   = userRow.type == this.Type.admin;
        userInfo.isStudent = userRow.role == this.Role.teacher;
        userInfo.isTeacher = userRow.role == this.Role.student;
        userInfo.isActivated = userRow.state == this.State.activated;
        userInfo.name  = userRow.name;
        userInfo.email = userRow.email;
        userInfo.login = userRow.login;
        return userInfo;
    }

    cyrb53 (str, seed = 0) {
        let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
        for (let i = 0, ch; i < str.length; i++) {
            ch = str.charCodeAt(i);
            h1 = Math.imul(h1 ^ ch, 2654435761);
            h2 = Math.imul(h2 ^ ch, 1597334677);
        }
        h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
        h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
        return 4294967296 * (2097151 & h2) + (h1 >>> 0);
    };
}


module.exports = Users