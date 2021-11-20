declare var require: any
import * as React from "react"
import { InputText } from 'primereact/inputtext';
import { Card } from 'primereact/card';
import { Checkbox } from 'primereact/checkbox';
import { SelectButton } from 'primereact/selectbutton';
import { Message } from 'primereact/message';
import { VariantsList } from "./variants_list"

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
            answers: [],
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

        this.state = {
            ...this.state,
            question: data.question,
            answers: answers,
            answerType: data.answerType
        };
    }

    onAddAnswer = () => {
        let answers = this.state.answers;
        answers.push({ text: "", edited: false, isRight: false });
        this.setState({ answers: answers },
            () => this.saveDataCallback(this.getData(), this.hasError()));
    }

    onSetRightAnswer = (index, value) => {
        let answers = this.state.answers;
        answers[index].isRight = value;
        this.setState({ answers: answers },
            () => this.saveDataCallback(this.getData(), this.hasError()));
    }

    onEditAnswer = (index, value) => {
        let answers = this.state.answers;
        answers[index].text = value;
        answers[index].edited = true;
        this.setState({ answers: answers },
            () => this.saveDataCallback(this.getData(), this.hasError()));
    }

    answersHtml() {
        return (<VariantsList onAddVariant={this.onAddAnswer}
            onSetRight={this.onSetRightAnswer}
            onEditVariant={this.onEditAnswer}
            globalIndex={this.state.questionIndex}
            variants={this.state.answers} />);
    }

    hasError() {
        let rightAnswers = 0;
        for (const answer of this.state.answers) {
            if (answer.isRight) {
                rightAnswers++;
            }
        }
        return !(this.state.answers.length >= 3 && rightAnswers > 0 && (this.state.answerType != 'single' || rightAnswers == 1)
                && this.state.question.length > 0);
    }

    errorsHtml() {
        if (this.state.question.length == 0) {
            return <Message severity="warn" text="Please enter question"></Message>;
        }

        if (this.state.answers.length < 2) {
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
                        <InputText id="firstname1" type="text"
                            onChange={(e) => this.setState({ question: e.target.value },
                                () => this.saveDataCallback(this.getData(), this.hasError()))}
                            value={this.state.question} />
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