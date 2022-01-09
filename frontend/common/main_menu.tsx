declare var require: any
import * as React from "react"
import LoginButton from './login_button';
import { Translate } from 'react-i18nify';

var axios = require('axios');
export class MainMenu extends React.Component<any, any> {

    state: {
        isAdmin: any
    };

    constructor(props) {
        super(props);

        this.state = {
            isAdmin: false
        };

        this.checkAdmin();
    }

    checkAdmin = () => {
        let self = this;
        axios.get("/admin/is_admin", {}).then(
            function (response) {
                self.setState({
                    isAdmin: response.data.success
                });
            })
            .catch(function (error) {
                // handle error
                console.log(error);
            });
    }

    render() {
        /*
        <li className="has-submenu">
                <a href="#section2">Предметы</a>
                <ul class="sub-menu">
                    <li><a href="#section2">Английский</a></li>
                    <li><a href="#section3">Шведский</a></li>
                </ul>
            </li >
    <li className="has-submenu">
            <a href="#section2">О проекте</a>
            <ul className="sub-menu">
                <li><a href="#section2">Для учеников</a></li>
                <li><a href="#section3">Для учителей</a></li>
            </ul>
        </li>
       */

        return (<ul className="main-menu">
                <li><a href="/"><Translate value='menu.home_button' /></a></li>
                <li><a href="/office"><Translate value='menu.office_button' /></a></li>
                <li id="EnterButton"><LoginButton /></li>
                {this.state.isAdmin ? <li><a href="/admin">Admin</a></li> : null}
                <li className="has-submenu">
                <a href="#section2"><Translate value='menu.language' /></a>
                    <ul className="sub-menu">
                    <li><a href="/"><Translate value='meta.russian' /></a></li>
                    <li><a href="/en/"><Translate value='meta.english' /></a></li>
                    </ul>
                </li>
            </ul>);
    }
}

export default MainMenu;