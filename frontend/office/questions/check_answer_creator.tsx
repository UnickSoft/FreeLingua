declare var require: any
import * as React from "react"
import { InputText } from 'primereact/inputtext';
import { Card } from 'primereact/card';
import { Checkbox } from 'primereact/checkbox';
import { SelectButton } from 'primereact/selectbutton';
import { Message } from 'primereact/message';
import { VariantsList } from "./variants_list"
import { BaseCreator } from "./base_creator"
import { InputTextarea } from 'primereact/inputtextarea';

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

export class CheckAnswerCreator extends BaseCreator {

    answerType = [
        { label: 'Signle answer', value: 'single' },
        { label: 'Multiple answer', value: 'multiple' }
    ];

    state: {
        question: any,
        answers: any,
        answerType: any,
        questionIndex: any
    }

    constructor(props) {
        super(props);

        this.state = {
            question: "",
            answers: [],
            answerType: "single",
            questionIndex: this.props.questionIndex
        };

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
        this.setStateAndUpdate({ answers: answers });
    }

    onSetRightAnswer = (index, value) => {
        let answers = this.state.answers;
        answers[index].isRight = value;
        this.setStateAndUpdate({ answers: answers });
    }

    onEditAnswer = (index, value) => {
        let answers = this.state.answers;
        answers[index].text = value;
        answers[index].edited = true;
        this.setStateAndUpdate({ answers: answers });
    }

    answersHtml() {
        return (<VariantsList onAddVariant={this.onAddAnswer}
            onSetRight={this.onSetRightAnswer}
            onEditVariant={this.onEditAnswer}
            globalIndex={this.state.questionIndex}
            variants={this.state.answers} />);
    }

    hasError = () => {
        let rightAnswers = 0;
        for (const answer of this.state.answers) {
            if (answer.isRight) {
                rightAnswers++;
            }
        }
        return !(this.state.answers.length >= 2 && rightAnswers > 0 && (this.state.answerType != 'single' || rightAnswers == 1)
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
                        <InputTextarea rows={2} cols={30} id="firstname1"
                            onChange={(e) => this.setStateAndUpdate({ question: e.target.value })}
                            value={this.state.question} autoResize />
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