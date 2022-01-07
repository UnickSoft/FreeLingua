declare var require: any
import * as React from "react"
import LoginButton from './login_button';
import { Translate } from 'react-i18nify';

export class MainMenu extends React.Component<any, any> {
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