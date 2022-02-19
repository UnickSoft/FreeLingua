declare var require: any
import * as React from "react"
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import GlobalDisapcher from "../common/global_event_dispatcher"

var ReactDOM = require('react-dom');
var axios    = require('axios');

export class UsersTable extends React.Component<any, any> {
    state: {
        users: any
    };

    constructor(props) {
        super(props);
        this.state = {
            users: []
        };

        this.updateUsers();
    }

    updateUsers = () => {
        let self = this;
        axios.get("/admin/get_users", {})
            .then(function (response) {
                self.setState({ users: response.data.users});
        })
        .catch(function (error) {
            // handle error
            console.log(error);
        });
    }

    valueIsAdmin (value) {
        return value.isAdmin ? "true" : "false";
    }

    valueIsActivated(value) {
        return value.isActivated ? "true" : "false";
    }

    deleteUser = (login) => {
        let self = this;
        axios.post("/admin/delete_user", { login: login })
            .then(function (response) {
                self.updateUsers();
            })
            .catch(function (error) {
                // handle error
                console.log(error);
            });
    }

    deleteBody = (value) => {
        let self = this;
        return <Button onClick={(e) => self.deleteUser(value.login)}>Delete</Button>
    }

    banUser = (login) => {
        let self = this;
        axios.post("/admin/ban_user", { login: login })
            .then(function (response) {
                self.updateUsers();
            })
            .catch(function (error) {
                // handle error
                console.log(error);
            });
    }

    activateUser = (login) => {
        let self = this;
        axios.post("/admin/activate_user", { login: login })
            .then(function (response) {
                self.updateUsers();
            })
            .catch(function (error) {
                // handle error
                console.log(error);
            });
    }

    enterAs = (login) => {
        let self = this;
        axios.post("/admin/enter_as", { login: login })
            .then(function (response) {
                self.updateUsers();
                GlobalDisapcher().dispatchEvent('change_user');
            })
            .catch(function (error) {
                // handle error
                console.log(error);
            });
    }

    activateBody = (value) => {
        let self = this;
        return value.isActivated ? <Button onClick={(e) => self.banUser(value.login)} className="p-button-warning">Ban</Button>
            : <Button onClick={(e) => self.activateUser(value.login)} className="p-button-success">Activate</Button>;
    }

    enterAsBody = (value) => {
        let self = this;
        return <Button onClick={(e) => self.enterAs(value.login)} className="p-button-warning">Enter as</Button>;
    }
    
    render() {
        return (<div className="card">
            <DataTable value={this.state.users}>
                <Column field="login" header="Login"></Column>
                <Column field="name" header="Name"></Column>
                <Column field="email" header="Email"></Column>
                <Column field="isAdmin" header="IsAdmin" body={this.valueIsAdmin}></Column>
                <Column header="Activated" body={this.activateBody}></Column>
                <Column header="Delete" body={this.deleteBody} ></Column>
                <Column header="Enter as" body={this.enterAsBody} ></Column>
            </DataTable>
        </div>);
    }
}

export default UsersTable;