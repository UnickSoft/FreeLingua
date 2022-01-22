declare var require: any
import * as React from "react"
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Translate, translate } from 'react-i18nify';
import CategoriesSelection from './categories_selection';

var ReactDOM = require('react-dom');
var axios    = require('axios');

export class TemplateTable extends React.Component<any, any> {
    state: {
        templates: any
        template_id: any
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
            templates: [],
            template_id: null
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

    publicOnSite = (id) => {
        this.setState({ template_id: id});
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

    publicBoby = (value) => {
        let self = this;
        return <Button onClick={(e) => self.publicOnSite(value.id)} className={value.shared ? "p-button-success" : ""}>
            {value.shared ? translate("task_table.is_public") : translate("task_table.make_public")}
        </Button>
    }

    successCloseDialog = () => {
        this.updateTemplates();
        this.closeDialog();
    }

    closeDialog = () => {
        this.setState({ template_id : null});
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
                <Column header={translate("task_table.public_on_site")} body={this.publicBoby}></Column>
                <Column header={translate("task_table.delete")}  body={this.deleteTemplateBoby}></Column>
            </DataTable>
            {this.state.template_id != null ? <CategoriesSelection id={this.state.template_id}
                onSuccess={this.successCloseDialog}
                onClose={this.closeDialog}
            /> : null}
        </div>);
    }
}

export default TemplateTable;