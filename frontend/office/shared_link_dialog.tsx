declare var require: any
import * as React from "react"
import { Button } from 'primereact/button';
import QuestionCreateDecorator from './question_create_decorator';
import questionManager         from './questionManager' 
import { InputText } from 'primereact/inputtext';
import { Dialog } from 'primereact/dialog';
import { SelectButton } from 'primereact/selectbutton';
import { Checkbox } from 'primereact/checkbox';
import { Translate, translate } from 'react-i18nify';

var ReactDOM = require('react-dom');

export class ShareLinkDialog extends React.Component<any, any> {
    state: {
        templateId: any
        lifeTime: any
        shareLinkTitle: any
        shareLinkId: any
        isExamMode: any
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
            shareLinkTitle: props.templateTitle + " " + translate("share_by_link_dialog.for") + " ",
            shareLinkId: null,
            isExamMode: false
        };

        this.hideCallback = props.hideCallback;
    }

    saveShareLink = () => {
        let self = this;
        (async () => {
            let linkId = await questionManager.saveShareLink(this.state.templateId, this.state.shareLinkTitle, this.state.lifeTime, this.state.isExamMode);
            this.setState({ shareLinkId: linkId });
        })()
    }

    shareLinkDialogButtons = () => {
        return (
            <div>
                <Button label={translate("common_button.close")} icon="pi pi-times" onClick={() => this.hideCallback()} className="p-button-text" />
                <Button label={translate("share_by_link_dialog.save_and_get_link")} icon="pi pi-check" onClick={() => this.saveShareLink()} autoFocus />
            </div>
        );
    }

    onExamModeChanged = (e) => {
        this.setState({ isExamMode: e.checked });
    }

    render() {
        return (<Dialog header={translate("share_by_link_dialog.header")} visible={true} style={{ width: '50vw' }}
            footer={this.shareLinkDialogButtons}
            onHide={() => this.hideCallback() }>
            <div>
                <h3><Translate value="share_by_link_dialog.title" /></h3>
                <div className="p-fluid" key="main">
                    <div className="p-field" key="questionText">
                        <label htmlFor="taskName"><Translate value="share_by_link_dialog.private_title" /></label>
                        <InputText id="taskName" type="text" onChange={(e) => this.setState({ shareLinkTitle: e.target.value })} value={this.state.shareLinkTitle} />
                        <label htmlFor="taskName"><Translate value="share_by_link_dialog.link_life_time" /></label>
                        <SelectButton optionLabel="name" value={this.state.lifeTime} options={this.lifeTimes}></SelectButton>
                        <div className="p-field-checkbox p-mt-2">
                            <Checkbox inputId="examMode" value="ExamMode" onChange={this.onExamModeChanged} checked={this.state.isExamMode}></Checkbox>
                            <label htmlFor="examMode" className="p-checkbox-label"><Translate value="share_by_link_dialog.is_exam_mode" /></label>
                        </div>
                        <label htmlFor="taskName"><Translate value="share_by_link_dialog.link_to_task" /></label>
                        <InputText id="taskName" type="text"
                            value={this.state.shareLinkId != null ? window.location.origin.toString() + "/classroom/link/" + this.state.shareLinkId : ""} />
                    </div>
                </div>
            </div>
        </Dialog>);
    }
}

export default ShareLinkDialog;