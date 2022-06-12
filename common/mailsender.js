'use strict';

var MailSender = {
    sendActivationLetter : function(link, email, func) {
        const nodemailer = require("nodemailer");

        var config = require("../config");

        // create reusable transporter object using the default SMTP transport
        let transporter = nodemailer.createTransport({
            host: config.sendMailSerger,
            port: config.sendMailPort,
            secure: config.sendSecure, // true for 465, false for other ports
            auth: {
                user: config.sendMailLogin,    // generated ethereal user
                pass: config.sendMailPassword, // generated ethereal password
            },
        });

        (async () => {
            // send mail with defined transport object
            let info = await transporter.sendMail({
                from: 'Free Lingua <' + config.sendMailLogin + '>', // sender address
                to: email, // list of receivers
                subject: "Активация аккаунта на Free lingua", // Subject line
                text: this.getActivationText(link)
            });
            func(info.accepted.length > 0);
        })();
    },

    sendResetPasswordLetter: function (link, email, func) {
        const nodemailer = require("nodemailer");

        var config = require("../config");

        // create reusable transporter object using the default SMTP transport
        let transporter = nodemailer.createTransport({
            host: config.sendMailSerger,
            port: config.sendMailPort,
            secure: config.sendSecure, // true for 465, false for other ports
            auth: {
                user: config.sendMailLogin,    // generated ethereal user
                pass: config.sendMailPassword, // generated ethereal password
            },
        });

        (async () => {
            // send mail with defined transport object
            let info = await transporter.sendMail({
                from: 'Free Lingua <' + config.sendMailLogin + '>', // sender address
                to: email, // list of receivers
                subject: "Сбросить пароль на Free lingua", // Subject line
                text: this.getResetPasswordText(link)
            });
            func(info.accepted.length > 0);
        })();
    },    

    getActivationText: function (link) {
        return "Для активации аккаунта перейдите по ссылке: " + 
            link;
    },

    getResetPasswordText: function (link) {
        return "Для сброса пароля перейдите по ссылке: " +
            link;
    }
}


module.exports = MailSender