declare var require: any
import * as React from "react"
import { Checkbox } from 'primereact/checkbox';
import { RadioButton } from 'primereact/radiobutton';

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
export class CheckAnswerSolving extends React.Component<any, any> {

    state: {
        question: any,
        varians: any,
        answerType: any,
        questionIndex: any,
        answers: any
        rightAnswers: any
    }
    checkAnswerCallback = null;
    questionFinishCallback = null;
    rightAnswers = 0

    clone = (object) => {
        let cloning = {};
        Object.keys(object).map(prop => {
            if (Array.isArray(object[prop])) {
                cloning[prop] = [].concat(object[prop])
            } else if (typeof object[prop] === 'object') {
                cloning[prop] = this.clone(object[prop])
            } else cloning[prop] = object[prop]
        })
        return cloning
    }

    constructor(props) {
        super(props);
        let rightAnswers = 0;
        if (this.props.result) {
            rightAnswers = this.props.result.answers.filter(el => el.result).length
        }

        this.state = {
            question: this.props.data.question,
            varians: this.props.data.variants,
            answerType: this.props.data.answerType,
            questionIndex: this.props.questionIndex,
            answers: this.props.result ? this.clone(this.props.result) : {
                    answers: [],
                    finished: false
            },
            rightAnswers: rightAnswers
        };

        this.checkAnswerCallback = this.props.checkAnswerCallback;
        this.questionFinishCallback = this.props.questionFinishCallback;
        this.rightAnswers        = this.props.rightAnswers;
    }

    isDisabled(index, answer) {
        if (!this.state.answers) {
            return false;
        }

        if (this.state.answers.finished) {
            return true;
        }

        const found = this.state.answers.answers.find(res => res.answer == answer);

        return found;
    }

    isChecked(index, answer) {
        if (!this.state.answers) {
            return null;
        }

        const found = this.state.answers.answers.find(res => res.answer == answer);

        if (found) {
            return found.result;
        }

        return null;
    }

    checkAnswer = (answerIndex, checked) => {
        let answers = this.state.answers;
        let variant = this.state.varians[answerIndex];
        let isRight = this.checkAnswerCallback(this.state.questionIndex, variant);
        answers.answers.push(
            {
                answer: variant,
                result: isRight
            });

        let rightAnswers = this.state.rightAnswers;
        if (isRight) {
            rightAnswers++;
            if (rightAnswers == this.rightAnswers) {
                answers.finished = true;
                this.questionFinishCallback(this.state.questionIndex);
            }
        }

        this.setState({ answers: answers, rightAnswers: rightAnswers });
    }

    addVariants() {
        let index = -1;
        let self = this;

        return this.state.varians.map(function (answer) {
            index++;
            let locIndex = index;
            let enabled = true;
            let disabled = self.isDisabled(locIndex, answer);
            let checked_or_null = self.isChecked(locIndex, answer);
            let checked = !!checked_or_null;

            return (
                <div className="p-field-checkbox" key={locIndex}>
                    { self.state.answerType == "single" ?
                        <RadioButton inputId={"sl" + index + "_" + self.state.questionIndex} value={index}
                            onChange={(e) => self.checkAnswer(locIndex, e.target.checked)}
                            checked={checked}
                            disabled={disabled}
                        />
                     :
                        <Checkbox inputId={"sl" + index + "_" + self.state.questionIndex} value={index}
                            onChange={(e) => self.checkAnswer(locIndex, e.target.checked)}
                            checked={checked}
                            disabled={disabled}
                        />
                    }
                    <label htmlFor={"sl" + index + "_" + self.state.questionIndex}
                        className={"p-checkbox-label " + (disabled && !checked? "p-disabled" : "")}>{answer}</label>

                    {disabled && checked_or_null != null ?
                        <span className={"pi p-checkbox-icon p-ml-1 " + (checked ? "rightAnswer pi-check" : "wrongAnswer pi-ban")} />
                        : null}                    
                </div>);
        });
    }

    render() {
        return (
            <div>
                <div className="p-fluid" key="main">
                    <div className="p-field" key="questionText">
                        <h5>
                            {(this.state.questionIndex + 1) + ". "} 
                            {this.state.question}
                            {
                                this.state.answers.finished ?
                                    <span className="pi p-ml-1 rightAnswer pi-check" />
                                    : null 
                            }
                        </h5>
                    </div>
                    <div key="answers">
                        { this.addVariants() }
                    </div>
                </div>
            </div>
        );
    }
}

export default CheckAnswerSolving;