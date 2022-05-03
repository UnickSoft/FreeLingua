declare var require: any
import * as React from "react"
import { setTranslations, setLocale, Translate, getTranslations } from 'react-i18nify';
import { Skeleton } from 'primereact/skeleton';

function getCurrentLanguage() {
    return window.location.pathname.startsWith("/en") ? "en" : "ru";
}

let updateComponents = [];
let translationLoaded = false;

export function applyTranslation(translationList) {
    let currentLanguage = getCurrentLanguage();

    var axios = require('axios');

    let getTranslationRoot = function(langId) {
        return '/translations/' + langId + "/";
    }

    let updateCounter = translationList.length;
    translationList.forEach(fileName => {
        axios.get(getTranslationRoot(currentLanguage) + fileName, { params: {} })
            .then(function (response) {
                var trans = getTranslations();
                trans[currentLanguage] = {
                    ...trans[currentLanguage],
                    ...response.data[currentLanguage]
                }
                setTranslations(trans);
                updateCounter--;
                if (updateCounter == 0) {
                    setLocale(currentLanguage);
                    updateComponents.forEach(component => component.onTranslationLoaded());
                    translationLoaded = true;
                }
            })
            .catch(function (error) {
                // handle error
                console.log(error);
            });
    });
}

export class BaseApp extends React.Component {

    state: {
        translationLoaded: any
    };

    currentLanguage = "ru";

    constructor(props) {
        super(props);
        this.currentLanguage = getCurrentLanguage();
        this.state = { translationLoaded: false };
        if (translationLoaded) {
            this.onTranslationLoaded()
        }
        updateComponents.push(this);
        this.removeHelmet();
    }

    onTranslationLoaded() {
        this.setState({ translationLoaded: true });
    }

    removeHelmet() {
        const elem = document.querySelector('meta[name=fragment]');
        if (elem) {
            elem.remove();
        }
    }

    render() {
        return (<Skeleton width="100%" height="150px"></Skeleton>);
    }
}

export default BaseApp;