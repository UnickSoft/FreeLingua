declare var require: any
import * as React from "react"
import { Button } from 'primereact/button';
import { ToggleButton } from 'primereact/togglebutton';

var ReactDOM = require('react-dom');
var axios    = require('axios');

export class SystemTools extends React.Component<any, any> {
    state: {
        uselessData: any
        deleteNumber: any
        allowCros: any
    };

    constructor(props) {
        super(props);

        this.state = {
            uselessData: [],
            deleteNumber: 0,
            allowCros: false
        };

        this.updateAllowCros();
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

    setAllowCros = (value) => {
        let self = this;
        axios.get("/admin/set_allow_cros",
            { params: { value: value } })
            .then(function (response) {
                if (response.data.success) {
                    self.updateAllowCros();
                }
            })
            .catch(function (error) {
                // handle error
                console.log(error);
            });
    }

    updateAllowCros = () => {
        let self = this;
        axios.get("/admin/is_allow_cros", {})
            .then(function (response) {
                if (response.data.success) {
                    self.setState({ allowCros: response.data.value});
                }
            })
            .catch(function (error) {
                // handle error
                console.log(error);
            });
    }

    render() {
        return (<div className="card">
            <h3>Clean data base</h3>
            <Button onClick={this.findUselessData}>Find all useless data</Button>
            {this.htmlUselessData()}
            <Button onClick={this.deleteUselessData}>Delete useless data</Button>
            <div><span>Deleted rows</span>:<span>{this.state.deleteNumber}</span></div>
            <h3>Allow cross request</h3>
            <ToggleButton checked={this.state.allowCros}
                onChange={(e) => this.setAllowCros(e.value)}
                onLabel="Allow" offLabel="Denied" />
        </div>);
    }
}

export default SystemTools;