declare var require: any
import * as React from "react"
import { setTranslations, setLocale, Translate, getTranslations } from 'react-i18nify';


function getCurrentLanguage() {
    return window.location.pathname.startsWith("/en") ? "en" : "ru";
}

export function applyTranslation(translationList) {
    let currentLanguage = getCurrentLanguage();

    var axios = require('axios');

    let getTranslationRoot = function(langId) {
        return '/translations/' + langId + "/";
    }

    translationList.forEach(fileName => {
        axios.get(getTranslationRoot(currentLanguage) + fileName, { params: {} })
            .then(function (response) {
                var trans = getTranslations();
                trans[currentLanguage] = {
                    ...trans[currentLanguage],
                    ...response.data[currentLanguage]
                }
                setTranslations(trans);
                setLocale(currentLanguage);
            })
            .catch(function (error) {
                // handle error
                console.log(error);
            });
    });
}

export class BaseApp extends React.Component {

    currentLanguage = "ru";

    constructor(props) {
        super(props);
        this.currentLanguage = getCurrentLanguage();
    }

    render() {
        return null;
    }
}

export default BaseApp;