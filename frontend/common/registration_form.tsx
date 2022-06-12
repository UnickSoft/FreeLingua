declare var require: any
import * as React from "react"
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dialog } from 'primereact/dialog';
import { Password } from 'primereact/password';
import { Translate, translate } from 'react-i18nify';
import validator from 'validator';
import ReCAPTCHA from "react-google-recaptcha";
import { IsLocalhost } from "./utils";

var ReactDOM = require('react-dom');
var axios    = require('axios');

export class RegistrationForm extends React.Component<any, any> {
    state: {
        name: any,
        login: any,
        password: any,
        email: any,
        tried: any,
        sent: any,
        success: any,
        captureSuccess: any,
        error: null
    };

    passwordMinLength = 8;
    loginMinLength = 5;

    constructor(props) {
        super(props);
        this.state = {
            name: "",
            login: "",
            password: "",
            email: "",
            tried: false,
            sent: false,
            success: false,
            error: null,
            captureSuccess: IsLocalhost()
        };
    }

    isPasswordValid = () => {
        return this.state.password.length >= this.passwordMinLength
    }

    isPasswordTouched = () => {
        return this.state.password.length != 0 || this.state.tried
    }

    isLoginValid = () => {
        return this.state.login.length >= this.loginMinLength &&
            validator.isLowercase(this.state.login) && validator.isAlpha(this.state.login)
    }

    isLoginTouched = () => {
        return this.state.login.length != 0 || this.state.tried
    }

    isNameValid = () => {
        return this.state.name.length > 0;
    }

    isNameTouched = () => {
        return this.state.name.length != 0 || this.state.tried
    }

    isEmailValid = () => {
        return validator.isEmail(this.state.email);
    }

    isEmailTouched = () => {
        return this.state.tried;
    }

    isEnableButton = () => {
        return !this.state.sent && this.state.captureSuccess;
    }

    onCaptureChange = (value) => {
        this.setState({ captureSuccess: value});
    }

    register = () => {
        this.setState({ tried: true });
        if (this.isEmailValid() && this.isNameValid() && this.isLoginValid() && this.isPasswordValid()) {
            this.setState({ sent: true, error: null });
            let self = this;
            axios.post("/register_user", {
                login: this.state.login,
                password: this.state.password,
                email: this.state.email,
                name: this.state.name
            }).then(function (response) {
                if (response.data.success) {
                    self.setState({ success: true});
                } else {
                    self.setState({ tried: false, sent: false, error: response.data.error });
                }
            })
            .catch(function (error) {
                // handle error
                console.log(error);
                self.setState({ tried: false, sent: false, error: "unknown" });
            });
        }
    }

    render() {
        return (
            <div className="formMaxWidth">
                <h2><Translate value="registration.header" /></h2>
                {!this.state.success ?
                <div className="p-fluid"> 
                    <div className="p-field">
                            <InputText name="name" type="text" id="name" placeholder={translate("registration.name")}
                            value={this.state.name} aria-describedby="name-help"
                            onChange={(e) => this.setState({ name: e.target.value })}
                            className={!this.isNameTouched() || this.isNameValid() ? "block" : "p-invalid block"}
                        />
                        {this.isNameTouched() && !this.isNameValid() ?
                            <small id="name-help" className="p-error block">
                                    <Translate value="registration.name_empty" />
                            </small> :
                            null}
                    </div>
                    <div className="p-field">
                        <InputText name="login" type="text" id="login" placeholder={translate("login.login")}
                            value={this.state.login}
                            onChange={(e) => this.setState({ login: e.target.value })}
                            aria-describedby="login-help"
                            className={!this.isLoginTouched() || this.isLoginValid() ? "block" : "p-invalid block"}
                        />
                        <small id="login-help"
                            className={!this.isLoginTouched() || this.isLoginValid() ? "block" : "p-error block"}>
                                <Translate value="registration.login_req" length={this.loginMinLength} />
                        </small>
                    </div>
                    <div className="p-field">
                        <Password name="password" id="password" placeholder={translate("login.password")}
                            value={this.state.password}
                            onChange={(e) => this.setState({ password: e.target.value })}
                            feedback={false} aria-describedby="password-help" toggleMask
                            className={!this.isPasswordTouched() || this.isPasswordValid() ? "block" : "p-invalid block"}/>

                        <small id="password-help"
                            className={!this.isPasswordTouched() || this.isPasswordValid() ? "block" : "p-error block"}>
                                <Translate value="registration.password_req" length={this.passwordMinLength} />
                        </small>
                    </div>
                    <div className="p-field">
                            <InputText name="email" type="text" id="email" placeholder={translate("registration.email")}
                            value={this.state.email}
                            onChange={(e) => this.setState({ email: e.target.value })}
                            aria-describedby="email-help"
                            className={!this.isEmailTouched() || this.isEmailValid() ? "block" : "p-invalid block"}
                        />
                        {this.isEmailTouched() && !this.isEmailValid() ?
                            <small id="email-help" className="p-error block">
                                    <Translate value="registration.email_incorrect" />
                            </small> :
                            null}
                        </div>

                    {!IsLocalhost() ?
                        <div className="p-field">
                            <ReCAPTCHA
                                sitekey="6LfZSCcgAAAAALlZVInolY6prRj8rdaSt2-V_oMW"
                                onChange={this.onCaptureChange}
                            />
                        </div> : null}

                    {this.state.error != null ?
                        <div className="p-field">
                            <small id="email-help" className="p-error block">
                                {translate("server_errors." + this.state.error)}
                            </small>
                        </div> : null}

                     <div className="p-field">
                            <Button id="form-submit" className="button" onClick={this.register} label={translate("registration.registration")}
                                disabled={!this.isEnableButton()} />
                    </div>
                </div>
                        :
                <div className="p-fluid">
                    <div className="p-field">
                        <span><Translate value="registration.registration_success" /></span>
                    </div>
                </div>
                        }
                </div>);
    }
}

export default RegistrationForm;