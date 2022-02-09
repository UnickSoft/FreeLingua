declare var require: any
import * as React from "react"
import { Checkbox } from 'primereact/checkbox';
import { RadioButton } from 'primereact/radiobutton';
import { Dropdown } from 'primereact/dropdown';
import { BaseSolving } from "./base_solving"

var axios = require('axios');

/***
 * Json format:
 * {
 *      text: "question text",
 *      answers: [],
 *      isInfo: true
 * }
 */
export class PlaneTextSolving extends BaseSolving {

    state: {
        questionIndex: any,
        text: any,
        scores: any,
        isExamMode: any
    }

    constructor(props) {
        super(props);

        this.state = {
            text: this.props.data.text,
            questionIndex: this.props.questionIndex,
            scores: 0.0,
            isExamMode: this.props.isExamMode,
        };

        this.setScoreWeight(0, 0);
    }

    isFinishedQuestions = () => {
        return true;
    }

    isInformationBlock = () => {
        return true;
    }

    htmlCommonPart = () => {
        return (<div className="firstLineOffset">
                    <span style={{ whiteSpace: "pre-wrap" }}>
                        {this.state.text}
                    </span>
                </div>);
    }
}

export default PlaneTextSolving;