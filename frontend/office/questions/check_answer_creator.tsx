declare var require: any
import * as React from "react"
import { InputText } from 'primereact/inputtext';
import { Card } from 'primereact/card';
import { Checkbox } from 'primereact/checkbox';
import { SelectButton } from 'primereact/selectbutton';
import { Message } from 'primereact/message';

var axios = require('axios');

/***
 * Json format:
 * {
 *   question: "question text",  
 *   answerType: "single", // single or multiple,
 *   variants: ["1", "2", "3", "4"],
 *   answers: ["2"], // list of right answers.
 * }
 */

export class CheckAnswerCreator extends React.Component<any, any> {

    answerType = [
        { label: 'Signle answer', value: 'single' },
        { label: 'Multiple answer', value: 'multiple' }
    ];

    state: {
        question: any,
        answers: any,
        answerType: any
        questionIndex: any
    }
    saveDataCallback = null;

    constructor(props) {
        super(props);

        this.state = {
            question: "",
            answers: [{ text: "", edited: false, isRight: false }],
            answerType: "single",
            questionIndex: this.props.questionIndex
        };

        this.saveDataCallback = props.saveDataCallback;
        if ("data" in props) {
            this.loadData(props.data);
        }
    }

    getData = () => {
        let variants = [];
        let rightAnswers = [];
        for (const answer of this.state.answers) {
            if (answer.edited) {
                if (answer.isRight) {
                    rightAnswers.push(answer.text);
                }
                variants.push(answer.text);
            }
        }

        return {
            question: this.state.question,
            answerType: this.state.answerType,
            variants: variants,
            answers: rightAnswers,
        };
    }

    loadData = (data) => {
        if (!("variants" in data)) {
            return;
        }

        let answers = [];
        for (const variant of data.variants) {
            answers.push({ text: variant, edited: true, isRight: data.answers.includes(variant) });
        }
        answers.push({ text: "", edited: false, isRight: false });

        this.state = {
            ...this.state,
            question: data.question,
            answers: answers,
            answerType: data.answerType
        };
    }

    componentDidUpdate() {
        this.saveDataCallback(this.getData(), this.hasError());
    }

    setAnswer = (index, text) => {
        let answers = this.state.answers;
        answers[index].text = text;
        if (!answers[index].edited) {
            answers.push({ text: "", edited: false, isRight: false });
            answers[index].edited = true;
        }
        this.setState({ answers: answers});
    }

    updateRightAnswer = (index, value) => {
        let answers = this.state.answers;
        answers[index].isRight = value;
        this.setState({ answers: answers});
    }

    answersHtml() {
            let index = -1;
            let self = this;
            return this.state.answers.map(function (answer) {
                index++;
                let locIndex = index;
                return (
                    <div className="p-row" key={index}>
                        <div className="p-field p-grid" key={index}>
                            <label htmlFor={"answ_" + index + "_" + self.state.questionIndex} className="p-col-fixed" style={{ width: '32px' }}>{index + 1}.</label>
                            <div className="p-col-fixed" style={{ width: '300px' }}>
                                <InputText id={"answ_" + index + "_" + self.state.questionIndex} type="text" placeholder="Add new answer"
                                    value={answer.text} onChange={(e) => self.setAnswer(locIndex, e.target.value)} />
                            </div>
                            <div className="p-field-checkbox">
                                <Checkbox inputId={"cb" + index + "_" + self.state.questionIndex} value="Right" onChange={(e) => self.updateRightAnswer(locIndex, e.target.checked)}
                                    checked={self.state.answers[locIndex].isRight} />
                                <label htmlFor={"cb1" + index + "_" + self.state.questionIndex} className="p-checkbox-label">Is right answer?</label>
                            </div>
                        </div>
                    </div>
                )
        })
    }

    hasError() {
        let rightAnswers = 0;
        for (const answer of this.state.answers) {
            if (answer.isRight) {
                rightAnswers++;
            }
        }
        return this.state.answers.length >= 3 && rightAnswers > 0 && (this.state.answerType != 'single' || rightAnswers == 1);
    }

    errorsHtml() {
        if (this.state.answers.length < 3) {
            return <Message severity="warn" text="Please add two or more answers"></Message>;
        }
        let rightAnswers = 0;
        for (const answer of this.state.answers) {
            if (answer.isRight) {
                rightAnswers++;
            }
        }

        if (rightAnswers == 0) {
            return <Message severity="warn" text="Please mark at least one answer as Right answer"></Message>;
        }

        if (this.state.answerType == 'single' && rightAnswers > 1) {
            return <Message severity="warn" text="Single answer quetsion should has one right answer"></Message>;
        }
    }

    render() {
        return (
            <div>
                <div className="p-fluid" key="main">
                    <div className="p-field" key="questionText">
                        <label htmlFor="firstname1">Enter question:</label>
                        <InputText id="firstname1" type="text" onChange={(e) => this.setState({ question: e.target.value })} value={this.state.question} />
                    </div>
                    <div className="p-field" key="answerType">
                        <SelectButton value={this.state.answerType} options={this.answerType}
                            onChange={(e) => this.setState({ answerType: e.value })} />
                    </div>
                </div>
                <div key="answers">
                    <label>Add answers:</label>
                    { this.answersHtml() }
                </div>
                <div key="errors">
                    {this.errorsHtml()}
                </div>
            </div>
        );
    }
}

export default CheckAnswerCreator;