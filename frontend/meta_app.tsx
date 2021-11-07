declare var require: any
import * as React from "react"
import { useHistory, BrowserRouter  } from "react-router-dom";
import { setTranslations, setLocale, Translate, getTranslations } from 'react-i18nify';
import LoginForm from './common/login_form';
import LoginButton from './common/login_button';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';

/*
setTranslations({
    en: {
        "main": {
            "task1": "The task 1"
        }
    }
});

setLocale('de');

var axios = require('axios');
axios.get("/translation/de", { params: { } })
    .then(function (response) {
        var trans = getTranslations();
        trans["de"] = response.data;
        setTranslations(trans);
        //setLocale('de');
        console.log(response.data);
    })
    .catch(function (error) {
        // handle error
        console.log(error);
    });
*/

var ReactDOM = require('react-dom');

export class MetaApp extends React.Component {

    handleClickEn() {
        setLocale('en');
    }
    handleClickDe() {
        setLocale('de');
    }
    render() {
        return (
            <div>
                <div>
                    <h1>Скоро тут будет город сад</h1>
                </div>
            </div>
        );
    }
}

ReactDOM.render(<MetaApp />, document.getElementById('root'));
//ReactDOM.render(<LoginForm />, document.getElementById('login_form_place'));
ReactDOM.render(<LoginButton />, document.getElementById('EnterButton'));