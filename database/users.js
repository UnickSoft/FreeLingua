'use strict';

class Users {
    constructor(dbWrapper, config) {
        this.dbWrapper = dbWrapper;
        this.config = config;
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

    passwordMinLength = 8;
    loginMinLength = 5;

    linkIdLength = 16;
    activateLinkLifeTime      = 24 * 3600 * 1000; // 1 day
    resetPasswordLinkLifeTime = 24 * 3600 * 1000; // 1 day

    registerUser(login, pass, email, name, role, func = null) {
        login = this.#format(login);
        email = this.#format(email);

        if (!(login.length >= this.loginMinLength && pass.length >= this.passwordMinLength && email.length > 0 && name.length > 0 &&
            (role == this.Role.teacher || role == this.Role.student))) {
            func(false);
        }

        let self = this;
        this.userExist(login, function (row) {
            if (row != undefined) {
                func(false);
                return;
            }

            self.emailUsed(email, function (row) {
                if (row) {
                    func(false);
                    return;
                }

                var util = require("../common/util");
                let linkId = util.getRandomId(self.linkIdLength) + "_" + Date.now();
                self.dbWrapper.insert(self.Table, [
                    { name: "login", value: login },
                    { name: "passhash", value: self.#getPasshash(login + pass) }, // todo
                    { name: "email", value: email },
                    { name: "name", value: name },
                    { name: "role", value: role },
                    { name: "registerDate", value: new Date() },
                    { name: "state", value: self.State.unactivate },
                    { name: "activateLink", value: linkId }],
                    function (success) {
                        if (success) {
                            func(success, linkId)
                        } else {
                            func(false)
                        }
                    });
            });
        });
    }

    makeAdmin(login, func = null) {
        login = this.#format(login);

        return this.dbWrapper.update(this.Table,
            [{ name: "type", value: this.Type.admin }],
            { name: "login", value: login },
            func);
    }

    activateUser(login, func = null) {
        login = this.#format(login);

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
        login = this.#format(login);

        var self = this;
        this.dbWrapper.select_one(this.Table, [
            { name: "login", value: login },
            { name: "passhash", value: this.#getPasshash(login + password) }],
            function (success, row) {
                if (row === undefined) {
                    func(row);
                    return;
                }

                func(self.getUserInfo(row));
            });
    }

    userExist(login, func) {
        login = this.#format(login);

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

    emailUsed(email, func) {
        email = this.#format(email);

        var self = this;
        this.dbWrapper.select_one(this.Table, [
            { name: "email", value: email }],
            function (success, row) {
                if (row === undefined) {
                    func(false);
                    return;
                }

                func(true, row.id);
            });
    }

    banUser(login, isBan, func = null) {
        login = this.#format(login);

        return this.dbWrapper.update(this.Table,
            [{ name: "state", value: isBan ? this.State.blocked : this.State.activated }],
            { name: "login", value: login },
            func);
    }

    deleteUser(login, func = null) {
        login = this.#format(login);

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

    activateUserByLink(link, func = null) {
        if (link.length < 0 || link.indexOf("_") == -1) {
            func(false);
            return;
        }

        let splitted = link.split('_');

        let nowDate = Date.now();
        if (nowDate - splitted[1] > this.activateLinkLifeTime) {
            func(false);
            return;
        }

        let self = this;
        this.dbWrapper.select_one(this.Table,
            [{ name: "activateLink", value: link }],
            function (success, row) {
                if (row === undefined) {
                    func(false);
                    return;
                }

                self.dbWrapper.update(self.Table,
                    [{ name: "state", value: self.State.activated },
                     { name: "activateLink", value: ""}],
                    { name: "login", value: row.login },
                    func);
            });
    }

    resetPassword(email, func) {
        email = this.#format(email);

        let self = this;
        this.emailUsed(email, function (hasUser, id) {
            var util = require("../common/util");
            let linkId = util.getRandomId(self.linkIdLength) + "_" + Date.now();

            self.dbWrapper.update(self.Table,
                [{ name: "resetPasswordLink", value: linkId }],
                { name: "id", value: id },
                function (success) {
                    if (!success) {
                        func(false);
                    } else {
                        func(success, linkId);
                    }
                });
        });
    }

    setNewPassword(linkId, password, func) {
        if (password.length < this.passwordMinLength) {
            func(false);
            return;
        }

        if (linkId.length < 0 || linkId.indexOf("_") == -1) {
            func(false);
            return;
        }

        let splitted = linkId.split('_');

        let nowDate = Date.now();
        if (nowDate - splitted[1] > this.resetPasswordLinkLifeTime) {
            func(false);
            return;
        }

        var self = this;
        this.dbWrapper.select_one(this.Table, [
            { name: "resetPasswordLink", value: linkId }],
            function (success, row) {
                if (row === undefined) {
                    func(false);
                    return;
                }
                self.dbWrapper.update(self.Table,
                    [{ name: "passhash", value: self.#getPasshash(row.login + password) },
                     { name: "resetPasswordLink", value: "" } ],
                     { name: "id", value: row.id },
                    function (success) {
                        if (!success) {
                            func(false);
                        } else {
                            func(success);
                        }
                    });
            });
    }

    #getPasshash(login, pass) {
        return this.cyrb53(login + this.config.passhash_secret_key + pass);
    }

    #format(login) {
        return login.toLowerCase();
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

    _admin_only_checkValidUser(login, func) {
        login = this.#format(login);

        var self = this;
        this.dbWrapper.select_one(this.Table, [
            { name: "login", value: login },
            { name: "type", value: this.Type.user }],
            function (success, row) {
                if (row === undefined) {
                    func(row);
                    return;
                }

                func(self.getUserInfo(row));
            });
    }
}


module.exports = Users