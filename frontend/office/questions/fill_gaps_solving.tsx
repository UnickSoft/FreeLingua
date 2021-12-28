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
 *      textWithGaps: ["Select correct world: I am a student. I go to the ",
 *      {
 *        "variants": [ "shop", "army", "University" ]
 *      }, "My favorite subject is ",
        {
          "variants": [ "shopping", "Math", "Art" ]
        }],
 *      answers: ["1->University", "2->Math", "2->Art"], // list of right answers.
 * }
 */
export class FillGapsSolving extends BaseSolving {

    state: {
        textWithGaps: any,
        questionIndex: any,
        answers: any, // {isRight: true/false, value: answer}
        gasLeft: any,
        scores: any,
        gapsNum: any
    }
    gapsOnly = null;

    constructor(props) {
        super(props);

        this.state = {
            textWithGaps: this.props.data.textWithGaps,
            questionIndex: this.props.questionIndex,
            answers: (this.props.result ? this.props.result.answers.reduce(function (map, obj) {
                let parsed = obj.answer.split("->");
                if (!(parsed[0] in map)) {
                    map[parsed[0]] = [];
                }
                map[parsed[0]].push({ answer: parsed[1], result: obj.result });
                return map;
            }, {}) : {}),
            gasLeft: this.props.data.textWithGaps.filter(x => typeof (x) !== 'string').length,
            scores: 0.0,
            gapsNum: this.props.data.textWithGaps.filter(answer => typeof (answer) !== "string").length
        };

        this.state.answers.finished = (this.props.result ? this.props.result.finished : false);

        this.gapsOnly = this.getGasOnly(this.state.textWithGaps);

        let totalVariants = 0;
        this.gapsOnly.forEach((gap) => {
                totalVariants += gap.variants.length;
            });

        this.setScoreWeight(this.props.rightAnswers, totalVariants - this.props.rightAnswers);
    }

    componentDidMount() {
        this.updateScores();
    }

    updateScores() {
        let scores = 0;

        for (const key in this.state.answers) {
            if (key != 'finished') {
                let value = this.state.answers[key];
                scores += this.calcScores(value, 1, this.gapsOnly[key].variants.length - 1) / this.state.gapsNum;
            }
        }

        this.setScores(scores);
    }

    getGasOnly = (arrayOfValues) => {
        let res = [];

        for (const element of arrayOfValues) {
            if (typeof (element) !== "string") {
                res.push(element);
            }
        }
        return res;
    }

    onSelectAnswer = (locGapIndex, answer) => {
        let answers = this.state.answers;
        let isRight = this.checkAnswerCallback(this.state.questionIndex, locGapIndex + "->" + answer);
        if (!(locGapIndex in answers)) {
            answers[locGapIndex] = [];
        }
        answers[locGapIndex].push(
            {
                answer: answer,
                result: isRight
            });

        let gasLeft = this.state.gasLeft;
        if (isRight) {
            gasLeft--;
            if (gasLeft == 0) {
                answers.finished = true;
                this.questionFinishCallback(this.state.questionIndex);
            }
        }

        this.setState({ answers: answers, gasLeft: gasLeft });
        this.updateScores();
    }

    getHeaderText = () => {
        return "Fill in the gaps";
    }

    isFinishedQuestions = () => {
        return this.state.answers.finished;
    }

    htmlCommonPart = () => {
        let index = -1;
        let gapIndex = -1;
        let self = this;

        let text = this.state.textWithGaps.map(function (answer) {
            index++;
            let locIndex = index;

            if (typeof (answer) === "string") {
                return (<span key={locIndex} style={{ whiteSpace: "pre-wrap" }}>{answer}</span>);
            } else {
                gapIndex++;

                let finished = false;
                let answered = [];
                let results = {};
                let currentValue = "";
                if (gapIndex in self.state.answers) {
                    answered = self.state.answers[gapIndex];
                }
                let lastAnswer = null;
                answered.forEach((value) => {
                    finished = value.result || finished;
                    currentValue = value.answer;
                    results[value.answer] = value.result;
                    lastAnswer = value.result;
                });

                let localGapIndex = gapIndex;
                let selectionOptions = [];
                let maxLength = "Select".length;
                for (const variant of answer.variants) {
                    maxLength = Math.max(maxLength, variant.length);
                    selectionOptions.push({ label: variant, value: variant });
                    if (variant in results || finished) {
                        selectionOptions[selectionOptions.length - 1].disabled = true;
                        if (variant in results) {
                            selectionOptions[selectionOptions.length - 1].className = results[variant] ? "rightDropDown" : "wrongDropDown";
                        }
                    }
                }
                maxLength += 4.5;
                let bkColor = lastAnswer != null && !lastAnswer ? '#fb8182' : null;
                return (<Dropdown value={currentValue} name={"gap" + localGapIndex}
                    options={selectionOptions} placeholder="Select" onChange={(e) => self.onSelectAnswer(localGapIndex, e.value)}
                    key={locIndex}
                    style={{ width: maxLength + 'ch', display: 'inline-flex', opacity: 1.0, backgroundColor: bkColor != null && '#fb8182' }}
                    dropdownIcon={lastAnswer != null ? (lastAnswer ? "pi pi-check rightAnswer" : "pi pi-chevron-down") : "pi pi-chevron-down"}
                />);
            }
        });

        return (<div className="fillGapsSolving firstLineOffset"> { text} </div >);
    }
}

export default FillGapsSolving;