declare var require: any
import * as React from "react"
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dialog } from 'primereact/dialog';
import { Password } from 'primereact/password';

var ReactDOM = require('react-dom');
var axios    = require('axios');

export class LoginForm extends React.Component<any, any> {
    state: {
        isLoggined: any;
        login: any,
        password: any,
        useDialog: false
    };

    onSuccessFunc = null;
    onCloseFunc   = null;

    constructor(props) {
        super(props);
        this.state = {
            isLoggined: false,
            login: "",
            password: "",
            useDialog: ("onSuccess" in props) && (props.useDialog)
        };
        if ("onSuccess" in props) {
            this.onSuccessFunc = props.onSuccess;
        }
        if ("onClose" in props) {
            this.onCloseFunc = props.onClose;
        }

        let self = this;
        axios.get("/is_user_entered", {}).then(
            function (response) {
                self.setLoggined(response.data.success);
                console.log(response.data);
            })
            .catch(function (error) {
                // handle error
                console.log(error);
            });
    }

    onLogin = (e) => {
        let self = this;
        axios.post("/user_enter", {
            login: this.state.login,
            password: this.state.password
        }).then(function (response) {
            self.setLoggined(response.data.success);
            console.log(response.data);
        })
        .catch(function (error) {
            // handle error
            console.log(error);
        });
    }

    onLogout = (e) => {
        let self = this;
        axios.get("/user_exit", {})
            .then(function (response) {
                self.setLoggined(false);
                console.log(response.data);
            })
            .catch(function (error) {
                // handle error
                console.log(error);
            });
    }

    setLoggined(value) {
        this.setState({
            isLoggined: value
        });

        if (value && this.onSuccessFunc != null) {
            this.onSuccessFunc();
            if (this.onCloseFunc != null) {
                this.onCloseFunc();
            }
        }
    }

    handleChangeLogin = (e) => {
        this.setState({ login: e.target.value });
    }

    handleChangePassword = (e) => {
        this.setState({ password: e.target.value });
    }

    renderFooter() {
        return (
            <div>
                <Button label="Login" icon="pi pi-check" onClick={this.onLogin} autoFocus />
            </div>
        );
    }

    render() {
        if (this.state.isLoggined && !this.state.useDialog) {
            return (<div className="row"><Button className="button" onClick={this.onLogout} label="Logout" /></div>);
        }
        if (!this.state.useDialog) {
            return (
                <div className="p-fluid">
                    <div className="p-field">
                        <InputText name="login" type="text" id="login" placeholder="Login"
                            value={this.state.login}
                            onChange={this.handleChangeLogin} />
                    </div>
                    <div className="p-field">
                        <Password name="password" type="text" id="password" placeholder="Password"
                            value={this.state.password}
                            onChange={this.handleChangePassword} feedback={false} toggleMask />
                    </div>
                    <div className="p-field">
                        <Button id="form-submit" className="button" onClick={this.onLogin} label="Enter" />
                    </div>
                </div>
            );
        } else {
            return (<Dialog header="Enter login and password" visible={true} style={{ width: '50vw' }}
                footer={this.renderFooter()}
                onHide={this.onCloseFunc}>
                <div className="p-fluid">
                    <div className="p-field">
                            <InputText name="login" type="text" id="login" placeholder="Login"
                                value={this.state.login}
                                onChange={this.handleChangeLogin} />
                    </div>
                    <div className="p-field">
                            <Password name="password" id="password" placeholder="Password"
                                value={this.state.password}
                                onChange={this.handleChangePassword} feedback={false} toggleMask />
                    </div>
                </div>
            </Dialog>);
        }
    }
}

export default LoginForm;