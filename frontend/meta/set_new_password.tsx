declare var require: any
import * as React from "react"
import { translate, Translate } from 'react-i18nify';
import ReCAPTCHA from "react-google-recaptcha";
import { IsLocalhost } from "../common/utils";
import { Button } from 'primereact/button';
import { Password } from 'primereact/password';

var axios = require('axios');

export class SetNewPassword extends React.Component<any, any> {
    state: {
        newPassword1: any,
        newPassword2: any,
        sent: any,
        tried: any,
        captureSuccess: any,
        setSuccess: any,
        error: any
    };

    passwordMinLength = 8;

    constructor(props) {
        super(props);

        this.state = {
            newPassword1: "",
            newPassword2: "",
            sent: false,
            tried: false,
            captureSuccess: IsLocalhost(),
            setSuccess: false,
            error: null
        };
    }

    isPassword1Valid = () => {
        return this.state.newPassword1.length >= this.passwordMinLength;
    }

    isPassword1Touched = () => {
        return this.state.newPassword1.length != 0 || this.state.tried;
    }

    isPassword2Valid = () => {
        return this.state.newPassword2.length >= this.passwordMinLength;
    }

    isPassword2Touched = () => {
        return this.state.newPassword2.length != 0 || this.state.tried;
    }

    isPass1TouchAndInvalide = () => {
        return !this.isPassword1Valid() && this.isPassword1Touched();
    }

    isPass2TouchAndInvalide = () => {
        return !this.isPassword2Valid() && this.isPassword2Touched();
    }

    isPasswordsEquals = () => {
        return this.state.newPassword2 == this.state.newPassword1;
    }    

    isEnableButton = () => {
        return !this.state.sent && this.state.captureSuccess;
    }

    onCaptureChange = (value) => {
        this.setState({ captureSuccess: value });
    }

    setNewPassword = () => {
        this.setState({ tried: true });
        if (this.isPasswordsEquals() && this.isPassword1Valid()) {
            this.setState({ sent: true });
            let self = this;
            axios.post("/save_new_password", {
                password: this.state.newPassword1,
                link: this.props.linkId
            }).then(function (response) {
                if (response.data.success) {
                    self.setState({ setSuccess: true });
                } else {
                    self.setState({ tried: false, sent: false, error: response.data.error });
                }
            }).catch(function (error) {
                    // handle error
                    console.log(error);
                    self.setState({ tried: false, sent: false });
                });
        }
    }

    render() {
        return (
            <div className="formMaxWidth">
                    <div>
                    <h2><Translate value="new_password.header" /></h2>

                    {!this.state.setSuccess ?
                        <div className="p-fluid">
                            <div className="p-field">
                                <Translate value="new_password.password1" />
                                <Password name="password1" id="password1" placeholder={translate("login.password")}
                                    value={this.state.newPassword1}
                                    onChange={(e) => this.setState({ newPassword1: e.target.value })}
                                    feedback={false} aria-describedby="password-help" toggleMask
                                    className={!this.isPass1TouchAndInvalide() ? "block" : "p-invalid block"} />
                            </div>
                            <div className="p-field">
                                <Translate value="new_password.password2" />
                                <Password name="password2" id="password2" placeholder={translate("login.password")}
                                    value={this.state.newPassword2}
                                    onChange={(e) => this.setState({ newPassword2: e.target.value })}
                                    feedback={false} aria-describedby="password-help" toggleMask
                                    className={this.isPasswordsEquals() ? "block" : "p-invalid block"}
                                />
                            </div>
                            <div className="p-field">
                                <small id="password-help"
                                    className={!this.isPass1TouchAndInvalide() ? "block" : "p-error block"}>
                                    <Translate value="registration.password_req" length={this.passwordMinLength} />
                                </small>
                                {!this.isPasswordsEquals() ? <small id="password-help"
                                    className={"p-error block"}>
                                    &nbsp; <Translate value="new_password.passwords_not_equal" />
                                </small> : null}
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
                                    <span className="p-error block">
                                        {translate("server_errors." + this.state.error)}
                                    </span>
                                </div> : null}

                            <div className="p-field">
                                <Button id="form-submit" className="button" onClick={this.setNewPassword} label={translate("new_password.set_new_password")}
                                    disabled={!this.isEnableButton()} />
                            </div>
                        </div>
                        :
                        <div>
                            <div className="p-fluid">
                                <div className="p-field">
                                    <Translate value="new_password.success" />
                                </div>
                            </div>
                        </div>
                    }
                    </div>
            </div>);
    }
}

export default SetNewPassword;