declare var require: any
import * as React from "react"
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { Translate, translate } from 'react-i18nify';

var ReactDOM = require('react-dom');
var axios    = require('axios');

export class SharedLinksTable extends React.Component<any, any> {
    state: {
        links: any
    };

    testLinkCallback = null;
    checkLinkCallback = null;

    constructor(props) {
        super(props);

        this.testLinkCallback  = props.testLinkCallback;
        this.checkLinkCallback = props.checkLinkCallback;

        this.state = {
            links: []
        };

        this.updateLinks();
    }

    updateLinks = () => {
        let self = this;
        axios.get("/office/get_shared_links", {})
            .then(function (response) {
                self.setState({ links: response.data.links});
        })
        .catch(function (error) {
            // handle error
            console.log(error);
        });
    }

    deleteLink = (id) => {
        let self = this;
        axios.post("/office/delete_link", { linkId: id })
            .then(function (response) {
                self.updateLinks();
            })
            .catch(function (error) {
                // handle error
                console.log(error);
            });
    }

    formatDate = (date) => {
        return date.getDate() + "." + (date.getMonth() + 1) + "." + date.getFullYear();
    }

    createDateBody = (value) => {
        return this.formatDate(new Date(value.createDate));
    }

    deleteDateBody = (value) => {
        return this.formatDate(new Date(value.deleteDate));
    }

    linkBody = (value) => {
        let link = window.location.origin.toString() + "/classroom/link/" + value.link;
        return (
            <div><span className="d-none d-md-block">{link}</span>
                <CopyToClipboard text={link}>
                    <Button icon="pi pi-copy" className="p-button-sm p-ml-1" />
                </CopyToClipboard></div>);
    }

    checkBody = (value) => {
        let self = this;
        return <Button onClick={(e) => self.checkLinkCallback(value.link)}>{translate("share_table.check_button")}</Button>
    }

    testBody = (value) => {
        let self = this;
        return <Button onClick={(e) => self.testLinkCallback(value.link)}>{translate("share_table.test_button")}</Button>
    }

    deleteBody = (value) => {
        let self = this;
        return <Button onClick={(e) => self.deleteLink(value.id)} className="p-button-danger">{translate("share_table.delete_button")}</Button>
    }
    
    render() {
        return (<div className="card">
            <DataTable value={this.state.links} scrollable style={{ minWidth: '400px' }}>
                <Column field="title" header={translate("task_table.title")} style={{ width: '20%' }}></Column>
                <Column header={translate("share_table.create_date")} body={this.createDateBody} className="d-none d-lg-table-cell"></Column>
                <Column header={translate("share_table.delete_date")} body={this.deleteDateBody} className="d-none d-md-table-cell"></Column>
                <Column header={translate("share_table.link")} body={this.linkBody} className="d-none d-md-table-cell" style={{ width: '40%' }}></Column>
                <Column header={translate("share_table.link")} body={this.linkBody} className="d-table-cell d-md-none"></Column>
                <Column header={translate("share_table.test")} body={this.testBody} ></Column>
                <Column header={translate("share_table.check")} body={this.checkBody} ></Column>
                <Column header={translate("task_table.delete")} body={this.deleteBody} ></Column>
            </DataTable>
        </div>);
    }
}

export default SharedLinksTable;