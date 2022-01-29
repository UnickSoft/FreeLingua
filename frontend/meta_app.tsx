declare var require: any
import * as React from "react"
import { translate, Translate } from 'react-i18nify';
import MainMenu from './common/main_menu';
import { BaseApp, applyTranslation } from './base_app';
import CatalogWrapper from './meta/catalog';
import { Helmet } from "react-helmet";

var ReactDOM = require('react-dom');

applyTranslation(["meta.json", "common.json"]);

var axios = require('axios');

export class MetaApp extends BaseApp {

    state: {
        rootInfo: any
        catalogTitle: any,
        catalogDesc: any,
        catalogParentTitle: any,
        catalogId: any,
        translationLoaded: any
    };

    constructor(props) {
        super(props);

        this.state = {
            rootInfo: null,
            catalogTitle: null,
            catalogParentTitle: null,
            catalogDesc: null,
            catalogId: 0,
            ...this.state
        };

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

    htmlHeader = () => {
        let isRoot = this.state.rootInfo == null || this.state.catalogId==0 || this.state.rootInfo.id == this.state.catalogId;

        return (
            <Helmet>
                <title>{isRoot ? translate("index.title") : this.state.catalogTitle}</title>
                <meta name="description" content={!isRoot ?
                    this.state.catalogTitle + ": " + this.state.catalogDesc :
                    translate("index.default_description")} />
                <meta name="keywords" content={!isRoot ?
                    this.state.catalogTitle + "," + this.state.catalogParentTitle + "," + translate("index.default_keywords"):
                    translate("index.default_keywords")} />
            </Helmet>);
    }

    navigateCallback = (catalogInfo) => {
        if (catalogInfo) {
            this.setState({
                catalogTitle: catalogInfo.title,
                catalogParentTitle: catalogInfo.parentTitle,
                catalogId: catalogInfo.id,
                catalogDesc: catalogInfo.desc
            });
        }
    }

    render() {

        if (!this.state.translationLoaded) {
            return super.render();
        }

        return (
                <div>
                    {
                        this.state.rootInfo != null ?
                            <CatalogWrapper categoryId={this.state.rootInfo.id} rootCategoryId={this.state.rootInfo.id}
                                rootTitle={"index.title"} rootDesc={"index.desc"} navigateCallback={this.navigateCallback}/> : null
                    }

                    {this.htmlHeader()}                    
                </div>);
    }
}

ReactDOM.render(<MetaApp />, document.getElementById('root'));
ReactDOM.render(<MainMenu />, document.getElementById('menu'));