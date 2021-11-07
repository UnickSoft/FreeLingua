declare var require: any
import * as React from "react"
import { Button } from 'primereact/button';
import QuestionCreateDecorator from './question_create_decorator';
import questionManager         from './questionManager' 
import { InputText } from 'primereact/inputtext';
import { Dialog } from 'primereact/dialog';
import { SelectButton } from 'primereact/selectbutton';

var ReactDOM = require('react-dom');

export class ShareLinkDialog extends React.Component<any, any> {
    state: {
        templateId: any
        lifeTime: any
        shareLinkTitle: any
        shareLinkId: any
    };

    lifeTimes = [
        { name: '1 month', value: 3600 * 24 * 30 * 1000 },
    ];

    hideCallback = null;

    constructor(props) {
        super(props);

        this.state = {
            templateId: props.templateId,
            lifeTime: this.lifeTimes[0].value,
            shareLinkTitle: props.templateTitle + " for ",
            shareLinkId: null
        };

        this.hideCallback = props.hideCallback;
    }

    saveShareLink = () => {
        let self = this;
        (async () => {
            let linkId = await questionManager.saveShareLink(this.state.templateId, this.state.shareLinkTitle, this.state.lifeTime);
            this.setState({ shareLinkId: linkId });
        })()
    }

    shareLinkDialogButtons = () => {
        return (
            <div>
                <Button label="Close" icon="pi pi-times" onClick={() => this.hideCallback()} className="p-button-text" />
                <Button label="Save and Get Link" icon="pi pi-check" onClick={() => this.saveShareLink()} autoFocus />
            </div>
        );
    }

    render() {
        return (<Dialog header="Header" visible={true} style={{ width: '50vw' }}
            footer={this.shareLinkDialogButtons}
            onHide={() => this.hideCallback() }>
            <div>
                <h3>Share task by link</h3>
                <div className="p-fluid" key="main">
                    <div className="p-field" key="questionText">
                        <label htmlFor="taskName">Enter private title (only will see it)</label>
                        <InputText id="taskName" type="text" onChange={(e) => this.setState({ shareLinkTitle: e.target.value })} value={this.state.shareLinkTitle} />
                        <label htmlFor="taskName">Link life time</label>
                        <SelectButton optionLabel="name" value={this.state.lifeTime} options={this.lifeTimes}></SelectButton>
                        <label htmlFor="taskName">Link to task (will appeares after save)</label>
                        <InputText id="taskName" type="text"
                            value={this.state.shareLinkId != null ? window.location.origin.toString() + "/classroom/link/" + this.state.shareLinkId : ""} />
                    </div>
                </div>
            </div>
        </Dialog>);
    }
}

export default ShareLinkDialog;