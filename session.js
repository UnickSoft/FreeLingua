'use strict';

class Session {
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
            return false;
        }

        return this.dbWrapper.insert(this.Table, [
            { name: "login", value: login },
            { name: "passhash", value: this.cyrb53(login + pass) }, // todo
            { name: "email", value: email },
            { name: "name", value: name },
            { name: "role", value: role },
            { name: "registerDate", value: new Date()},
            { name: "state", value: this.State.unactivate }],
            func);
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
        return this.dbWrapper.select_all(this.Table, null, func);
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