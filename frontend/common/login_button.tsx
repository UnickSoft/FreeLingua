declare var require: any
import * as React from "react"
import { Button } from 'primereact/button';
import LoginForm from './login_form';
import { Translate, translate } from 'react-i18nify';

var ReactDOM = require('react-dom');
var axios    = require('axios');

export class LoginButton extends React.Component<any, any> {
    state: {
        isLoggined: any;
        dialogVisible: any
    };

    constructor(props) {
        super(props);
        this.state = {
            isLoggined: false,
            dialogVisible: false,
        }

        this.checkIsUser();
    }

    checkIsUser = () => {
        let self = this;
        axios.get("/is_user_entered", {}).then(
            function (response) {
                self.setState({
                    isLoggined: response.data.success
                });
            })
            .catch(function (error) {
                // handle error
                console.log(error);
            });
    }

    logout = () => {
        let self = this;
        axios.get("/user_exit", {}).then(
            function (response) {
                self.setState({
                    isLoggined: !response.data.success
                });
            })
            .catch(function (error) {
                // handle error
                console.log(error);
            });
    }

    onLogin = () => {
        this.checkIsUser();
        this.setState({ dialogVisible: false });
    }

    render() {
        if (this.state.isLoggined) {
            return (<Button label={ translate("login.logout_button") } id="login_button" onClick={this.logout} />);
        } else if (!this.state.dialogVisible) {
            return (<span><Button label={translate("login.login_button")} id="login_button" onClick={() => this.setState({ dialogVisible: true })} /></span>);
        } else {
            return (<span><Button label={translate("login.login_button")} id="login_button"
                onClick={() => this.setState({ dialogVisible: true })} />
                <LoginForm onSuccess={this.onLogin} useDialog="true"
                    onClose={() => this.setState({ dialogVisible: false })}
                    visible={this.state.dialogVisible} />
            </span>);

        }
    }
}

export default LoginButton;