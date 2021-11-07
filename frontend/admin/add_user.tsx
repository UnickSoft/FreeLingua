declare var require: any
import * as React from "react"
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { SelectButton } from 'primereact/selectbutton';

var ReactDOM = require('react-dom');
var axios    = require('axios');

export class AddUser extends React.Component<any, any> {
    state: {
        login: any,
        password: any,
        email: any,
        name: any,
        role: any
    };

    Role = ["student", "teacher"];

    constructor(props) {
        super(props);
        this.state = {
            login: "",
            password: "",
            email: "",
            name: "",
            role: "student"
        };
    }

    addUser = (e) => {
        let self = this;
        axios.post("/admin/add_user",
            { login: this.state.login, password: this.state.password, name: this.state.name, role: this.state.role, email: this.state.email })
            .then(function (response) {
                if (response.data.success) {
                    self.setState({
                        login: "",
                        password: "",
                        email: "",
                        name: "",
                        role: "student"});
                }
            })
            .catch(function (error) {
                // handle error
                console.log(error);
            });
    }
    
    render() {
        return (<div className="card">
            <div className="p-fluid">
                <span className="p-float-label">
                    <InputText id="login" value={this.state.login} onChange={(e) => this.setState({ login: e.target.value })} />
                    <label htmlFor="login">Login</label>
                </span>
            </div>
            <div className="p-fluid">
                <span className="p-float-label">
                    <InputText id="password" value={this.state.password} onChange={(e) => this.setState({ password: e.target.value })} />
                    <label htmlFor="password">Password</label>
                </span>
            </div>
            <div className="p-fluid">
                <span className="p-float-label">
                    <InputText id="email" value={this.state.email} onChange={(e) => this.setState({ email: e.target.value })} />
                    <label htmlFor="email">Email</label>
                </span>
            </div>
            <div className="p-fluid">
                <span className="p-float-label">
                    <InputText id="name" value={this.state.name} onChange={(e) => this.setState({ name: e.target.value })} />
                    <label htmlFor="name">Name</label>
                </span>
            </div>
            <div className="p-fluid">
                <SelectButton value={this.state.role} options={this.Role} onChange={(e) => this.setState({ role: e.value })} />
            </div>

            <Button onClick={this.addUser}>AddUser</Button>
        </div>);
    }
}

export default AddUser;
