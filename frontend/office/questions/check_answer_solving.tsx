declare var require: any
import * as React from "react"
import { Checkbox } from 'primereact/checkbox';
import { RadioButton } from 'primereact/radiobutton';
import { BaseSolving } from "./base_solving"

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
export class CheckAnswerSolving extends BaseSolving {

    state: {
        question: any,
        varians: any,
        answerType: any,
        questionIndex: any,
        answers: any
        rightAnswers: any
        scores: any
    }
    rightAnswers = 0


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
            rightAnswers: rightAnswers,
            scores: 0.0
        };

        this.rightAnswers = this.props.rightAnswers;

        this.setScoreWeight(this.props.rightAnswers, this.props.data.variants.length - this.props.rightAnswers);
    }

    componentDidMount() {
        this.updateScores();
    }

    updateScores() {
        let wrongVariants = this.state.varians.length - this.rightAnswers;
        this.setScores(this.calcScores(this.state.answers.answers, this.rightAnswers, wrongVariants));
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
        if (isRight) {
            this.updateScores();
        }
    }

    htmlCommonPart = () => {
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
                <div className="p-field-checkbox firstLineOffset" key={locIndex}>
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

    getHeaderText = () => {
        return this.state.question;
    }

    isFinishedQuestions = () => {
        return this.state.answers.finished;
    }
}

export default CheckAnswerSolving;