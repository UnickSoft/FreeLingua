declare var require: any
import * as React from "react"
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';

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
    
    render() {
        return (<div className="card">
            <DataTable value={this.state.users}>
                <Column field="login" header="Login"></Column>
                <Column field="name" header="Name"></Column>
                <Column field="email" header="Email"></Column>
                <Column field="isAdmin" header="IsAdmin" body={this.valueIsAdmin}></Column>
                <Column field="isActivated" header="Activated" body={this.valueIsActivated}></Column>
            </DataTable>
        </div>);
    }
}

export default UsersTable;