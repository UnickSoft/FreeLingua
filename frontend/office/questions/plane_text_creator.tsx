declare var require: any
import * as React from "react"
import { Message } from 'primereact/message';
import { InputTextarea } from 'primereact/inputtextarea';
import { BaseCreator } from "./base_creator"
import { Translate, translate } from 'react-i18nify';

var axios = require('axios');

/***
 * Json format:
 * {
 *      text: "question text",
 *      answers: [],
 *      isInfo: true
 * }
 */

export class PlaneTextCreator extends BaseCreator {

    state: {
        questionIndex: any,
        text: any
    }

    constructor(props) {
        super(props);

        this.state = {
            questionIndex: this.props.questionIndex,
            text: ""
        };

        if ("data" in props) {
            this.loadData(props.data);
        }
    }

    getData = () => {
        return {
            text: this.state.text,
            answers: [],
            isInfo: true
        };
    }

    loadData = (data) => {
        if (!("text" in data)) {
            return;
        }

        this.state = {
            ...this.state,
            text: data.text
        };
    }

    hasError = () => {
        if (this.state.text.length == 0) {
            return true;
        }

        return false;
    }

    errorsHtml() {
        if (this.state.text.length == 0) {
            return <Message severity="warn" text={translate("questions.common.errors_enter_text")}></Message>;
        }

        return null;
    }

    isInformationBlock = () => {
        return true;
    }

    render() {
        return (
            <div>
                <div className="p-fluid" key="main">
                    <div className="p-field" key="questionText">
                        <label htmlFor={"quesionField" + this.state.questionIndex}><Translate value="questions.common.enter_question" />:</label>
                        <InputTextarea rows={2} cols={30} id={"quesionField" + this.state.questionIndex}
                            onChange={(e) => this.setStateAndUpdate({ text: e.target.value })}
                            value={this.state.text} autoResize />
                    </div>
                </div>
                <div key="errors">
                    {this.errorsHtml()}
                </div>
            </div>
        );
    }
}

export default PlaneTextCreator;