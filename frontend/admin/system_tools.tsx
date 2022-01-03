declare var require: any
import * as React from "react"
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';

var ReactDOM = require('react-dom');
var axios    = require('axios');

export class SystemTools extends React.Component<any, any> {
    state: {
        uselessData: any
        deleteNumber: any
    };

    constructor(props) {
        super(props);

        this.state = {
            uselessData: [],
            deleteNumber: 0
        };
    }

    findUselessData = (e) => {
        let self = this;
        axios.post("/admin/get_cleanup_rows",
            {})
            .then(function (response) {
                if (response.data.success) {
                    self.setState({
                        uselessData: response.data.data
                    });
                }
            })
            .catch(function (error) {
                // handle error
                console.log(error);
            });
    }

    deleteUselessData = (e) => {
        let self = this;
        axios.post("/remove_cleanup_rows",
            {})
            .then(function (response) {
                if (response.data.success) {
                    self.setState({
                        deleteNumber: response.data.deleteNumber
                    });
                }
            })
            .catch(function (error) {
                // handle error
                console.log(error);
            });
    }    

    htmlUselessData = () => {
        return this.state.uselessData.map(function (data) {
            return <div><span>{data.name}</span>:<span>{data.data.length}</span></div>
        });
    }

    render() {
        return (<div className="card">
            <Button onClick={this.findUselessData}>Find all useless data</Button>
            {this.htmlUselessData()}
            <Button onClick={this.deleteUselessData}>Delete useless data</Button>
            <div><span>Deleted rows</span>:<span>{this.state.deleteNumber}</span></div>
        </div>);
    }
}

export default SystemTools;