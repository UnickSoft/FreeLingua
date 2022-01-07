declare var require: any
import * as React from "react"
import { useHistory, BrowserRouter  } from "react-router-dom";
import { Translate, getTranslations } from 'react-i18nify';
import MainMenu from './common/main_menu';
import { BaseApp, applyTranslation } from './base_app';

var ReactDOM = require('react-dom');

applyTranslation(["meta.json", "common.json"]);

export class MetaApp extends BaseApp {

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div>
                <div>
                    <h1><Translate value='index.future' /></h1>
                </div>
            </div>
        );
    }
}

ReactDOM.render(<MetaApp />, document.getElementById('root'));
ReactDOM.render(<MainMenu />, document.getElementById('menu'));