declare var require: any
import * as React from "react"
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { OrderList } from 'primereact/orderlist';

var axios    = require('axios');

export class SortDialog extends React.Component<any, any> {
    state: {
        list: any
        title: any
    };

    onSuccessFunc = null;
    onCloseFunc = null;
    itemTemplate = null;

    constructor(props) {
        super(props);
        this.state = {
            list: props.list,
            title: props.title
        };
        if ("onSuccess" in props) {
            this.onSuccessFunc = props.onSuccess;
        }
        if ("onClose" in props) {
            this.onCloseFunc = props.onClose;
        }
        if ("itemTemplate" in props) {
            this.itemTemplate = props.itemTemplate;
        }
    }

    onSave = () => {
        this.onSuccessFunc(this.state.list);
    }

    renderFooter() {
        return (
            <div>
                <Button label={"Save"} icon="pi pi-check" onClick={this.onSave} autoFocus />
            </div>
        );
    }

    render() {
        let self = this;
        return (<Dialog header={"Category form"} visible={true} style={{ width: '50vw' }}
            footer={this.renderFooter()}
            onHide={this.onCloseFunc}>
            <div className="p-fluid">
                <OrderList value={this.state.list} header={this.state.title} dragdrop listStyle={{ height: 'auto' }} dataKey="id"
                    onChange={(e) => this.setState({ list: e.value })} itemTemplate={this.itemTemplate}></OrderList>
            </div>
        </Dialog>);
    }
}

export default SortDialog;