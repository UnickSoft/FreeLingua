declare var require: any
import * as React from "react"
import { Button } from 'primereact/button';
import LoginButton from './common/login_button';
import TaskSolving from './classroom/task_solving'
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link,
    withRouter,
    Redirect
} from "react-router-dom";
import { BaseApp, applyTranslation } from './base_app';
import MainMenu from './common/main_menu';
import { Translate, getTranslations } from 'react-i18nify';

applyTranslation(["classroom.json", "common.json"]);

var ReactDOM = require('react-dom');

export class ClassRoom extends BaseApp {

    render() {
        return (
            <Router>
                <Switch>
                    <Route path="/classroom/link/:linkId" render={(props) => (
                        <TaskSolving linkId={props.match.params.linkId} />
                    )}>
                    </Route>
                    <Route path="/classroom">
                        <div><Translate value='messages.no_task' /></div>
                    </Route>
                </Switch>
            </Router>
        );
    }
}      

ReactDOM.render(<ClassRoom />, document.getElementById('root'));
ReactDOM.render(<MainMenu />, document.getElementById('menu'));