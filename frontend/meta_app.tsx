declare var require: any
import * as React from "react"
import { translate, Translate } from 'react-i18nify';
import MainMenu from './common/main_menu';
import { BaseApp, applyTranslation } from './base_app';
import CatalogWrapper from './meta/catalog';

var ReactDOM = require('react-dom');

applyTranslation(["meta.json", "common.json"]);

var axios = require('axios');

export class MetaApp extends BaseApp {

    state: {
        rootInfo: any
    };

    constructor(props) {
        super(props);

        this.state = { rootInfo: null };

        this.updateCurrentCatalogInfo();
    }

    updateCurrentCatalogInfo = () => {
        let self = this;
        axios.get("/get_public_category_by_tag", { params: { tag: this.currentLanguage + "_root" } })
            .then(function (response) {
                self.setState({
                    rootInfo: response.data.info
                });
            })
            .catch(function (error) {
                // handle error
                console.log(error);
            });
    }

    render() {
        if (this.state.rootInfo != null)
            return (<CatalogWrapper categoryId={this.state.rootInfo.id} rootCategoryId={this.state.rootInfo.id}
                rootTitle={"index.title"} rootDesc={"index.desc"} />);
        else
            return null;
    }
}

ReactDOM.render(<MetaApp />, document.getElementById('root'));
ReactDOM.render(<MainMenu />, document.getElementById('menu'));