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

var ReactDOM = require('react-dom');

export class ClassRoom extends React.Component {

    render() {
        return (
            <Router>
                <Switch>
                    <Route path="/classroom/link/:linkId" render={(props) => (
                        <TaskSolving linkId={props.match.params.linkId} />
                    )}>
                    </Route>
                    <Route path="/classroom">
                        <div>Ещё рано</div>
                    </Route>
                </Switch>
            </Router>
        );
    }
}      

ReactDOM.render(<ClassRoom />, document.getElementById('root'));
ReactDOM.render(<LoginButton />, document.getElementById('EnterButton'));