declare var require: any
import * as React from "react"
import { Button } from 'primereact/button';
import LoginButton from './common/login_button';
import { TaskSolving, TaskSolvingPublicWrapper } from './classroom/task_solving'
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link,
    Redirect
} from "react-router-dom";
import { BaseApp, applyTranslation } from './base_app';
import MainMenu from './common/main_menu';
import { translate, Translate, getTranslations } from 'react-i18nify';
import { Helmet } from "react-helmet";

applyTranslation(["classroom.json", "common.json"]);

var ReactDOM = require('react-dom');

export class ClassRoom extends BaseApp {

    state: {
        translationLoaded: any
        taskInfo: any
    };

    constructor(props) {
        super(props);

        this.state = {
            taskInfo: {},
            ...this.state
        };
    }

    htmlHeader = () => {
        if (!this.state.taskInfo.title) {
            return null;
        }

        let title = this.state.taskInfo.title;
        let catalogTitle = this.state.taskInfo.catalogTitle ? this.state.taskInfo.catalogTitle : "";

        return (
            <Helmet>
                <title>{title}</title>
                <meta name="description" content={catalogTitle + ": " + title} />
                <meta name="keywords" content={catalogTitle + "," + title + "," + translate("classroom.default_keywords")} />
            </Helmet>);
    }

    taskCallback = (taskInfo) => {
        if (taskInfo) {
            this.setState({
                taskInfo: {
                    ...this.state.taskInfo,
                    ...taskInfo
                }
            });
        }
    }

    render() {
        if (!this.state.translationLoaded) {
            return <p></p>;
        }

        return (
            <Router>
                <Switch>
                    <Route path="/classroom/catalog/:catalogId/task/:taskId" render={(props) => (
                        <TaskSolvingPublicWrapper taskId={props.match.params.taskId}
                            categoryId={props.match.params.catalogId} taskCallback={this.taskCallback} />
                    )} />
                    <Route path="/classroom/link/:linkId" render={(props) => (
                        <TaskSolving linkId={props.match.params.linkId} taskCallback={this.taskCallback}/>
                    )} />
                    <Route path="/classroom">
                        <div><Translate value='messages.no_task' /></div>
                    </Route>
                </Switch>
                {this.htmlHeader()}
            </Router>
        );
    }
}      

ReactDOM.render(<ClassRoom />, document.getElementById('root'));
ReactDOM.render(<MainMenu />, document.getElementById('menu'));