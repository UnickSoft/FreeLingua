declare var require: any
import * as React from "react"
import LoginForm from './common/login_form';
import TemplateTable from './office/template_table';
import TemplateEditForm from './office/template_edit_form';
import SharedLinksTable from './office/shared_links_table';
import ShareLinkDialog from './office/shared_link_dialog';
import TaskSolving from './classroom/task_solving'
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link,
    Redirect
} from "react-router-dom";
import { BaseApp, applyTranslation } from './base_app';
import MainMenu from './common/main_menu';
import { Translate, getTranslations } from 'react-i18nify';

var ReactDOM = require('react-dom');
var axios = require('axios');

applyTranslation(["office.json", "common.json", "classroom.json"]);

export class Office extends BaseApp {
    state: {
        isLoggined: any
        editTemplate: any
        shareLinkTemplateId: any
        shareLinkTitle: any
        testLink: any
        checkLink: any;
        testTemplate: any;
        translationLoaded: any
    };

    constructor(props) {
        super(props);

        this.state = {
            isLoggined: false,
            editTemplate: null,
            shareLinkTemplateId: null,
            shareLinkTitle: null,
            testLink: null,
            checkLink: null,
            testTemplate: null,
            ...this.state
        };

        this.checkUser();
    }

    checkUser = () => {
        let self = this;
        axios.get("/is_user_entered", {}).then(
            function (response) {
                self.setState({
                    isLoggined: response.data.success
                });
            })
            .catch(function (error) {
                // handle error
                console.log(error);
            });
    }

    onLoggin = () => {
        this.checkUser();
    }

    editTemplate = (templateId) => {
        this.setState({ editTemplate: templateId});
    }

    shareByLink = (templateId, templateTitle) => {
        this.setState({ shareLinkTemplateId: templateId, shareLinkTitle: templateTitle });
    }

    hideShareLinkDialog = () => {
        this.setState({ shareLinkTemplateId: null, shareLinkTitle: null });
    }

    testLinkCallback = (link) => {
        this.setState({ testLink: link });
    }

    checkLinkCallback = (link) => {
        this.setState({ checkLink: link });
    }

    testTemplate = (templateId) => {
        this.setState({ testTemplate: templateId });
    }

    render() {
        if (this.state.isLoggined) {
            let res = (
                <Router>
                    <nav id="officeNav">
                        <Link to="/office/new_task"><Translate value='navigation.new_task' /></Link>
                        <Link to="/office"><Translate value='navigation.task_list' /></Link>
                        <Link to="/office/links"><Translate value='navigation.shared_links' /></Link>
                    </nav>
                    <Switch>
                        <Route path="/office/task/:taskId" render={(props) => (
                            <TemplateEditForm taskId={props.match.params.taskId} />
                            )}>
                        </Route>
                        <Route path="/office/new_task">
                            <TemplateEditForm />
                        </Route>
                        <Route path="/office/links">
                            {this.state.testLink || this.state.checkLink ?
                                (this.state.testLink ? 
                                    <Redirect push from="/office" to={"/office/link/" + this.state.testLink} />
                                    : <Redirect push from="/office" to={"/office/check_link/" + this.state.checkLink} />)
                                : <SharedLinksTable testLinkCallback={this.testLinkCallback} checkLinkCallback={this.checkLinkCallback}/>}
                        </Route>
                        <Route path="/office/link/:linkId" render={(props) => (
                            <TaskSolving linkId={props.match.params.linkId} dryRun={true}/>
                        )} />
                        <Route path="/office/check_link/:linkId" render={(props) => (
                            <TaskSolving linkId={props.match.params.linkId} readonly={true}/>
                        )} />
                        <Route path="/office/test_template/:templateId" render={(props) => (
                            <TaskSolving templateId={props.match.params.templateId} dryRun={true} />
                        )} />
                        <Route path="/office">
                            {this.state.editTemplate || this.state.testTemplate ?
                                (this.state.editTemplate ?
                                      <Redirect push from="/office" to={"/office/task/" + this.state.editTemplate} />
                                    : <Redirect push from="/office" to={"/office/test_template/" + this.state.testTemplate} />) : ""}
                            <TemplateTable
                                editTemplateCallback={this.editTemplate}
                                shareByLinkCallback={this.shareByLink}
                                testTemplateCallback={this.testTemplate} />
                            {
                                this.state.shareLinkTemplateId ?
                                    <ShareLinkDialog templateId={this.state.shareLinkTemplateId}
                                        templateTitle={this.state.shareLinkTitle}
                                        hideCallback={this.hideShareLinkDialog} /> :
                                    ""
                            }
                        </Route>
                    </Switch>
                </Router>
            );
            if (this.state.editTemplate) {
                this.setState({editTemplate: null});
            }
            if (this.state.testLink) {
                this.setState({ testLink: null });
            }
            if (this.state.checkLink) {
                this.setState({ checkLink: null });                
            }
            if (this.state.testTemplate) {
                this.setState({ testTemplate: null });
            }
            return res;
        } else {
            return (
                <div>
                    <h1><Translate value="login.login_form_header" /></h1>
                    <LoginForm onSuccess={this.onLoggin} />
                    <p><Translate value="office.betta_text_1" /></p>
                    <p><Translate value="office.betta_text_2" /></p>
                </div>
            );
        }
    }
}      

ReactDOM.render(<Office />, document.getElementById('root'));
ReactDOM.render(<MainMenu />, document.getElementById('menu'));