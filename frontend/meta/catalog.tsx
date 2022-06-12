declare var require: any
import * as React from "react"
import {
    BrowserRouter,
    Switch,
    Route,
    Link
} from "react-router-dom";
import { translate, Translate } from 'react-i18nify';
import { RequestUrl } from "../common/utils"

var axios    = require('axios');

export class Catalog extends React.Component<any, any> {
    state: {
        childrenCategory: any,
        childrenTasks: any,
        catalogInfo: any
    };

    constructor(props) {
        super(props);

        this.state = {
            childrenCategory: [],
            childrenTasks: [],
            catalogInfo: {title: "", desc: "", id: 0}
        };

        this.updateCurrentCatalogInfo();
        this.updateCategories();
        this.updateTasks();
    }

    componentDidUpdate(prevProps) {
        // Typical usage (don't forget to compare props):
        if (this.props.categoryId !== prevProps.categoryId) {
            this.updateCurrentCatalogInfo();
            this.updateCategories();
            this.updateTasks();
        }
    }

    updateCategories = () => {
        let self = this;
        axios.get( RequestUrl("/get_children_public_categories"), { params: { id: this.props.categoryId } })
            .then(function (response) {
                self.setState({
                    childrenCategory: response.data.categories.sort((a, b) => a.sort > b.sort ? 1 : -1)
                });
            })
            .catch(function (error) {
                // handle error
                console.log(error);
            });
    }

    updateTasks = () => {
        let self = this;
        axios.get(RequestUrl("/get_public_category_templates"), { params: { id: this.props.categoryId } })
            .then(function (response) {
                self.setState({
                    childrenTasks: response.data.templates.sort((a, b) => a.sort > b.sort ? 1 : -1)
                });
            })
            .catch(function (error) {
                // handle error
                console.log(error);
            });
    }

    updateCurrentCatalogInfo = () => {
        let self = this;
        axios.get(RequestUrl("/get_public_category_info"), { params: { id: this.props.categoryId } })
            .then(function (response) {
                if (self.props.navigateCallback) {
                    self.props.navigateCallback(response.data.info);
                }
                self.setState({
                    catalogInfo: response.data.info
                });
            })
            .catch(function (error) {
                // handle error
                console.log(error);
            });
    }

    htmlCategory() {
        return this.state.childrenCategory.map((cat, index, array) => {

            if (index % 2 == 1) {
                return null;
            }

            let pastCategory = function (c) {
                return (<div className="col-md-6 p-card-body categoryPanel">
                    <Link to={"/catalog/" + c.id} className="noDecorLink">
                        <h2><i className="pi pi-book"></i> {c.title}</h2>
                        <p>{c.desc}</p>
                    </Link>
                </div>);
            }

            return (<div className="row">
                {pastCategory(array[index])}
                {index + 1 < array.length ? pastCategory(array[index + 1]) : null}
                       </div>);
                });
    }

    htmlTasks() {
        return (<div className="row">
                  <div className="col">
                        <ul className="taskList">
                            {this.state.childrenTasks.map((task) => {
                                return (<li><a href={"/classroom/catalog/" + this.props.categoryId + "/task/" + task.id}>
                                         <i className="pi pi-question-circle"></i> {task.title}</a>
                                        </li>);})}
                        </ul>
                    </div>
                </div>
                    );
    }
                 
    render() {
        return (
            <div>
                { this.props.rootCategoryId != this.state.catalogInfo.id ?
                    <div className="row">
                        <div className="col">
                            <p><Link to={"/catalog/" + this.state.catalogInfo.parent}>
                                {this.state.catalogInfo.parent != this.props.rootCategoryId ?
                                    this.state.catalogInfo.parentTitle : <Translate value={this.props.rootTitle} />}</Link></p>
                        </div>
                    </div> : null}

                <div className="row">
                    <div className="col">
                        <h1>{this.props.rootCategoryId != this.state.catalogInfo.id ?
                            this.state.catalogInfo.title : <Translate value={this.props.rootTitle} />}</h1>
                        <p>{this.props.rootCategoryId != this.state.catalogInfo.id ?
                            this.state.catalogInfo.desc : <Translate value={this.props.rootDesc} /> }</p>
                    </div>
                </div>

                {this.htmlCategory()}
                {this.htmlTasks()}

                { this.props.rootCategoryId != this.state.catalogInfo.id ?
                    <div className="row catalogFooter">
                        <div className="col">
                            <p><Link to={"/catalog/" + this.state.catalogInfo.parent}>← {translate("button_common.back_to_catalog")}&nbsp;
                                {this.state.catalogInfo.parent != this.props.rootCategoryId ?
                                    this.state.catalogInfo.parentTitle : <Translate value={this.props.rootTitle} />}
                            </Link></p>
                        </div>
                    </div> : null}
            </div>);
    }
}

export class CatalogWrapper extends React.Component<any, any> {
    render() {
        return (<BrowserRouter>
            <Switch>
                <Route path="/catalog/:categoryId" render={(props) => (
                    <Catalog categoryId={props.match.params.categoryId} rootCategoryId={this.props.rootCategoryId}
                        rootTitle={this.props.rootTitle} rootDesc={this.props.rootDesc} navigateCallback={this.props.navigateCallback}/>
                )} />
                <Route path="*" render={(props) => (
                    <Catalog categoryId={this.props.categoryId} rootCategoryId={this.props.rootCategoryId}
                        rootTitle={this.props.rootTitle} rootDesc={this.props.rootDesc} />
                )} />
            </Switch>
        </BrowserRouter>)
    };
}

export default CatalogWrapper;