declare var require: any
import * as React from "react"
import LoginForm from './common/login_form';
import UsersTable from './admin/users_table';
import AddUser from './admin/add_user';
import SystemTools from './admin/system_tools';

import { Button } from 'primereact/button';
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link
} from "react-router-dom";

var ReactDOM = require('react-dom');
var axios    = require('axios');

export class Admin extends React.Component {
    state: {
        isLoggined: any
    };

    constructor(props) {
        super(props);

        this.state = {
            isLoggined: false
        };

        this.checkAdmin();
    }

    checkAdmin = () => {
        let self = this;
        axios.get("/admin/is_admin", {}).then(
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
        this.checkAdmin();
    }

    render() {
        if (this.state.isLoggined) {
            return (
                <Router>
                    <nav>
                        <Link to="/admin/users">[Users]</Link>
                        <Link to="/admin/add_user">[Add user]</Link>
                        <Link to="/admin/system_tools">[System tools]</Link>
                    </nav>
                    <Switch>
                        <Route path="/admin/users">
                            <UsersTable />
                        </Route>
                        <Route path="/admin/add_user">
                            <AddUser />
                        </Route>
                        <Route path="/admin/system_tools">
                            <SystemTools />
                        </Route>                        
                    </Switch>
                </Router>
             );            
        } else {
            return (
                <div>
                    <LoginForm onSuccess={this.onLoggin}/>
                </div>
            );
        }
    }
}      

ReactDOM.render(<Admin />, document.getElementById('root'));