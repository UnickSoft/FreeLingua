declare var require: any
import * as React from "react"
import { InputText } from 'primereact/inputtext';
import { Card } from 'primereact/card';
import { Checkbox } from 'primereact/checkbox';
import { Message } from 'primereact/message';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';
import { VariantsList } from "./variants_list"
import { BaseCreator } from "./base_creator"

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

export class FillGapsCreator extends BaseCreator {

    state: {
        textWithGaps: any,
        questionIndex: any
    }
    gapRegExp = /\[\[gap#\d+\]\]/;
    splitRegExp = /(?=\[\[gap\#\d+\]\])|(?<=\[\[gap\#\d+\]\])/;
    numberRegExp = /\d+/;

    constructor(props) {
        super(props);

        this.state = {
            textWithGaps: [],
            questionIndex: this.props.questionIndex
        };

        if ("data" in props) {
            this.loadData(props.data);
        }
    }

    getData = () => {
        let textWithGaps = this.state.textWithGaps;
        let answers = [];
        let textWithGapsOut = [];
        let gapIndex = 0;
        textWithGaps.forEach(function (part, index, ar) {
            if (typeof (part) !== "string") {
                let variants = [];
                part.forEach((answ) =>
                    {
                        if (answ.isRight) {
                            answers.push(gapIndex + "->" + answ.text);
                        }
                        variants.push(answ.text);
                    });

                textWithGapsOut.push({ variants: variants });
                gapIndex++;
            } else {
                textWithGapsOut.push(part);
            }
        });

        return {
            textWithGaps: textWithGapsOut,
            answers: answers
        };
    }

    loadData = (data) => {
        if (!("textWithGaps" in data)) {
            return;
        }

        let textWithGapsData = data.textWithGaps;
        let answers          = data.answers;
        let textWithGaps     = [];

        let index = 0;
        for (const gapOrText of textWithGapsData) {
            if (typeof (gapOrText) === "string") {
                textWithGaps.push(gapOrText);
            } else {
                let gap = [];
                let answerHash = {};
                const answer = answers.filter(answ => answ.startsWith(index + "->"))
                    .forEach(function (part, index, ar) {
                        answerHash[part.replace(/\d+->/g, "")] = true;
                    });

                gapOrText.variants.forEach(variant => gap.push({ text: variant, isRight: answerHash[variant] }));
                textWithGaps.push(gap);
                index++;
            }
        }

        this.state = {
            ...this.state,
            textWithGaps: textWithGaps
        };
    }

    hasError = () => {
        if (this.state.textWithGaps.length == 0) {
            return true;
        }

        let gaps = this.getGasOnly(this.state.textWithGaps);

        if (gaps.length == 0) {
            return true;
        }

        for (const gap of gaps) {
            let hasRightAnsver = false;
            gap.forEach(variant => hasRightAnsver = hasRightAnsver || variant.isRight);
            if (!hasRightAnsver) {
                return true;
            }
            if (gap.length <= 1) {
                return true;
            }
        }

        return false;
    }

    errorsHtml() {
        if (this.state.textWithGaps.length == 0) {
            return <Message severity="warn" text="Please enter Text"></Message>;
        }

        let gaps = this.getGasOnly(this.state.textWithGaps);

        if (gaps.length == 0) {
            return <Message severity="warn" text="Please select part of text and add gaps."></Message>;
        }

        for (const gap of gaps) {
            let hasRightAnsver = false;
            gap.forEach(variant => hasRightAnsver = hasRightAnsver || variant.isRight);
            if (!hasRightAnsver) {
                return <Message severity="warn" text="There is gap without right answer."></Message>;
            }
            if (gap.length <= 1) {
                return <Message severity="warn" text="There is gap with one answer variant."></Message>;
            }
        }

        return null;
    }

    getGapAsText(index) {
        return "[[gap#" + index + "]]";
    }

    getAsText = () => {
        let res = "";
        let gapIndex = 0;
        for (const element of this.state.textWithGaps) {
            if (typeof (element) === "string") {
                res += element;
            } else {
                res += this.getGapAsText(gapIndex);
                gapIndex++;
            }
        }
        return res;
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

    splitTextToArray = (text) => {
        let arrayOfStrs = text.split(this.splitRegExp);
        let index = 0;
        let gaps = this.getGasOnly(this.state.textWithGaps);
        for (const str of arrayOfStrs) {
            if (str.match(this.gapRegExp)) {
                let parsedIndex = str.match(this.numberRegExp);
                arrayOfStrs[index] = gaps[parsedIndex];
            }
            index++;
        }
        return arrayOfStrs;
    }

    loadFromText = (text) => {        
        this.setStateAndUpdate({ textWithGaps: this.splitTextToArray(text) });
    }

    addGap = () => {        
        var textArea = document.getElementById("area" + this.state.questionIndex) as HTMLTextAreaElement;

        let cursorStart = textArea.selectionStart;
        let cursorEnd = textArea.selectionEnd;
        let lengthOfSelection = cursorEnd - cursorStart;
        if (cursorStart < cursorEnd) {
            let splittedBefore = this.splitTextToArray(textArea.value.substring(0, cursorStart));
            let splittedAfter = this.splitTextToArray(textArea.value.substring(cursorEnd));
            var gapStr         = textArea.value.substring(cursorStart, cursorEnd);

            var textWithGaps = this.state.textWithGaps;
            let indexBefore = splittedBefore.length - 1;
            let indexAfter = 0;
            let newGapObject = [{ text: gapStr, isRight: true }];
            if (typeof splittedBefore[indexBefore] === 'string') {
                textWithGaps[indexBefore] = splittedBefore[indexBefore];
                indexBefore++;
                textWithGaps.splice(indexBefore, 0, newGapObject);
                indexBefore++;
            } else {
                indexBefore++;
                textWithGaps[indexBefore] = newGapObject;
                indexBefore++;
            }
            if (typeof splittedAfter[indexAfter] === 'string') {
                textWithGaps.splice(indexBefore, 0, splittedAfter[indexAfter]);
            }

            this.setState({ textWithGaps: textWithGaps });
        }
    }

    onAddAnswer = (gapIndex) => {
        let answers = this.state.textWithGaps[gapIndex];
        answers.push({ text: "", isRight: false });
        this.setStateAndUpdate({ textWithGaps: this.state.textWithGaps });        
    }

    onSetRightAnswer = (gapIndex, index, value) => {
        let answers = this.state.textWithGaps[gapIndex];
        answers[index].isRight = value;
        this.setStateAndUpdate({ textWithGaps: this.state.textWithGaps });
    }

    onEditAnswer = (gapIndex, index, value) => {
        let answers = this.state.textWithGaps[gapIndex];
        answers[index].text = value;
        answers[index].edited = true;
        this.setStateAndUpdate({ textWithGaps: this.state.textWithGaps });
    }

    answersHtml() {
        let index = -1;
        let indexGaps = -1;

        let self = this;
        return this.state.textWithGaps.map(function (gap) {
            index++;
            if (typeof gap === 'string') {
                return null;
            }
            indexGaps++;
            let localIndex = index;
            return (
                <div>
                    <label>Gap {indexGaps}</label>
                    <VariantsList onAddVariant={() => self.onAddAnswer(localIndex)}
                        onSetRight={(index, value) => self.onSetRightAnswer(localIndex, index, value)}
                        onEditVariant={(index, value) => self.onEditAnswer(localIndex, index, value)}
                        globalIndex={self.state.questionIndex}
                        variants={gap} />
                </div>);
        });
    }

    render() {
        return (
            <div>
                <div className="p-fluid" key="main">
                    <div className="p-field" key="questionText">
                        <label htmlFor={"area" + this.state.questionIndex}>Enter Text, then Select world and press add gap:</label>
                        <InputTextarea rows={5} cols={30} id={"area" + this.state.questionIndex}
                            onChange={(e) => this.loadFromText(e.target.value)}
                            value={this.getAsText()} autoResize
                        />
                    </div>
                    <Button label="Add gap" id={"add_gaps"+ this.state.questionIndex} onClick={() => this.addGap()} />
                </div>
                <div key="answers">
                    <label>Gaps:</label>
                    {this.answersHtml()}
                </div>
                <div key="errors">
                    {this.errorsHtml()}
                </div>
            </div>
        );
    }
}

export default FillGapsCreator;