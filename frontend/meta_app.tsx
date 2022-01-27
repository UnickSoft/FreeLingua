declare var require: any
import * as React from "react"
import { translate, Translate } from 'react-i18nify';
import MainMenu from './common/main_menu';
import { BaseApp, applyTranslation } from './base_app';
import CatalogWrapper from './meta/catalog';

var ReactDOM = require('react-dom');

applyTranslation(["meta.json", "common.json"]);

export class MetaApp extends BaseApp {

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <CatalogWrapper categoryId="1" rootCategoryId="1" rootTitle={"index.title"}
                rootDesc={"index.desc"} />
        );
    }
}

ReactDOM.render(<MetaApp />, document.getElementById('root'));
ReactDOM.render(<MainMenu />, document.getElementById('menu'));