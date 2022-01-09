declare var require: any
import * as React from "react"
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Translate, translate } from 'react-i18nify';

var ReactDOM = require('react-dom');
var axios    = require('axios');

export class TemplateTable extends React.Component<any, any> {
    state: {
        templates: any
    };

    editTemplateCallback = null;
    shareByLinkCallback = null;
    testTemplateCallback = null;

    constructor(props) {
        super(props);
        this.editTemplateCallback = props.editTemplateCallback;
        this.shareByLinkCallback = props.shareByLinkCallback;
        this.testTemplateCallback = props.testTemplateCallback;

        this.state = {
            templates: []
        };

        this.updateTemplates();
    }

    updateTemplates = () => {
        let self = this;
        axios.get("/office/get_templates", {})
            .then(function (response) {
                self.setState({ templates: response.data.templates});
        })
        .catch(function (error) {
            // handle error
            console.log(error);
        });
    }

    editTemplate = (id) => {
        this.editTemplateCallback(id);
    }

    shareByLink = (id, title) => {
        this.shareByLinkCallback(id, title);
    }

    deleteTemplate = (id) => {
        let self = this;
        axios.post("/office/delete_template", { templateId: id })
            .then(function (response) {
                self.updateTemplates();
            })
            .catch(function (error) {
                // handle error
                console.log(error);
            });
    }

    editBoby = (value) => {
        let self = this;
        return <Button onClick={(e) => self.editTemplate(value.id)}>{translate("task_table.edit")}</Button>
    }

    deleteTemplateBoby = (value) => {
        let self = this;
        return <Button onClick={(e) => self.deleteTemplate(value.id)} className="p-button-danger">{translate("task_table.delete")}</Button>
    }

    toJSONLocal = (date) => {
        var local = new Date(date);
        local.setMinutes(date.getMinutes() - date.getTimezoneOffset());
        return local.toJSON().slice(0, 10);
    }

    lastDateBody = (value) => {
        return this.toJSONLocal(new Date(value.lastDate));
    }

    linkBoby = (value) => {
        let self = this;
        return <Button onClick={(e) => self.shareByLink(value.id, value.title)}>{translate("task_table.share")}</Button>
    }

    testBoby = (value) => {
        let self = this;
        return <Button onClick={(e) => self.testTemplateCallback(value.id)}>{translate("task_table.test")}</Button>
    }
    
    render() {
        return (<div className="card">
            <DataTable value={this.state.templates} scrollable style={{minWidth:'400px'}}>
                <Column field="title" header={translate("task_table.title")}></Column>
                <Column header={translate("task_table.last_update")} body={this.lastDateBody} className="d-none d-md-table-cell"></Column>
                <Column field="version" header={translate("task_table.version")} className="d-none d-md-table-cell"></Column>
                <Column header={translate("task_table.edit")} body={this.editBoby}></Column>
                <Column header={translate("task_table.test")} body={this.testBoby}></Column>
                <Column header={translate("task_table.share_by_link")} body={this.linkBoby}></Column>
                <Column header={translate("task_table.delete")}  body={this.deleteTemplateBoby}></Column>
            </DataTable>
        </div>);
    }
}

export default TemplateTable;