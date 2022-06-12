declare var require: any
import * as React from "react"
import { translate, Translate } from 'react-i18nify';
import { InputText } from 'primereact/inputtext';
import ReCAPTCHA from "react-google-recaptcha";
import { IsLocalhost } from "../common/utils";
import { Button } from 'primereact/button';
import validator from 'validator';

var axios = require('axios');

export class ResetPassword extends React.Component<any, any> {
    state: {
        resetEmail: any,
        sent: any,
        tried: any,
        captureSuccess: any,
        resetSuccess: any
    };

    constructor(props) {
        super(props);

        this.state = {
            resetEmail: "",
            sent: false,
            tried: false,
            captureSuccess: IsLocalhost(),
            resetSuccess: false
        };
    }

    isEmailValid = () => {
        return validator.isEmail(this.state.resetEmail);
    }

    isEmailTouched = () => {
        return this.state.tried;
    }

    isEnableButton = () => {
        return !this.state.sent && this.state.captureSuccess;
    }

    onCaptureChange = (value) => {
        this.setState({ captureSuccess: value });
    }

    resetPassword = () => {
        this.setState({ tried: true });
        if (this.isEmailValid() && this.isEmailValid()) {
            this.setState({ sent: true });
            let self = this;
            axios.post("/reset_password", {
                email: this.state.resetEmail
            }).then(function (response) {
                if (response.data.success) {
                    self.setState({ resetSuccess: true });
                } else {
                    self.setState({ tried: false });
                }
            }).catch(function (error) {
                    // handle error
                    console.log(error);
                    self.setState({ tried: false });
                });
        }
    }

    render() {
        return (
            <div className="formMaxWidth">
                    <div>
                    <h2><Translate value="reset_password.header" /></h2>

                    {!this.state.resetSuccess ?
                        <div className="p-fluid">
                            <div className="p-field">
                                <Translate value="reset_password.enter_email" />
                                <InputText name="name" type="text" id="name" placeholder={translate("registration.email")}
                                    value={this.state.resetEmail} aria-describedby="name-help"
                                    onChange={(e) => this.setState({ resetEmail: e.target.value })}
                                    className={!this.isEmailTouched() || this.isEmailValid() ? "block" : "p-invalid block"}
                                />
                            </div>
                            {!IsLocalhost() ?
                                <div className="p-field">
                                    <ReCAPTCHA
                                        sitekey="6LfZSCcgAAAAALlZVInolY6prRj8rdaSt2-V_oMW"
                                        onChange={this.onCaptureChange}
                                    />
                                </div> : null}

                            <div className="p-field">
                                <Button id="form-submit" className="button" onClick={this.resetPassword} label={translate("reset_password.reset")}
                                    disabled={!this.isEnableButton()} />
                            </div>
                        </div>
                        :
                        <div>
                            <div className="p-fluid">
                                <div className="p-field">
                                    <Translate value="reset_password.success" />
                                </div>
                            </div>
                        </div>
                    }
                    </div>
            </div>);
    }
}

export default ResetPassword;