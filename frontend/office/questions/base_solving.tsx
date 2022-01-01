declare var require: any
import * as React from "react"

var axios = require('axios');

export class BaseSolving extends React.Component<any, any> {

    checkAnswerCallback = null;
    questionFinishCallback = null;
    updateScoresCallback = null;
    updateScoreWeight = null;

    state: {
        questionIndex: any,
        scores: any,
        isExamMode: any
    }

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

        this.state = { questionIndex: 0, scores: 0.0, isExamMode: this.props.isExamMode};
        this.checkAnswerCallback = this.props.checkAnswerCallback;
        this.questionFinishCallback = this.props.questionFinishCallback;
        this.updateScoresCallback = this.props.updateScoresCallback;
        this.updateScoreWeight = this.props.updateScoreWeight;
    }

    getHeaderText = () => {
        return "";
    }

    isFinishedQuestions = () => {
        return false;
    }

    htmlCommonPart = () => {     
        return null;
    }

    calcScores = (answersList, rightVariantsNum, wrongVariantsNum) => {
        let wrongCount    = 0;
        let oneQuestionCost = 1.0 / rightVariantsNum;
        let scores = 0;
        answersList.forEach((answer) => {
            if (answer.result) {
                scores += oneQuestionCost * (wrongVariantsNum - wrongCount) / wrongVariantsNum;
            } else {
                wrongCount++;
            }
        });

        return scores;
    }

    // From 0 to 1.
    setScores = (score) => {
        this.setState({ scores: score });
        this.updateScoresCallback(this.state.questionIndex, score);
    }

    setScoreWeight = (rightAnswer, wrongAnswer) => {
        this.updateScoreWeight(this.state.questionIndex, rightAnswer, wrongAnswer);
    }

    shuffleArray = (array) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
        return array;
    }

    render() {
        return (
            <div>
                <div className="p-fluid" key="main">
                    <h5 style={{ whiteSpace: "pre-wrap" }} className="secondLineOffset">
                        {(this.state.questionIndex + 1) + ". "}
                        {this.getHeaderText()}
                        <span className="rightAnswer firstLineOffset scoresHeader"> {this.props.normalizedScores} </span>
                        {
                            this.isFinishedQuestions() ?
                                <span className="pi p-ml-1 rightAnswer pi-check firstLineOffset" />
                                : null
                        }
                    </h5>
                    <div key="answers">
                        {this.htmlCommonPart() }
                    </div>
                </div>
            </div>
        );
    }
}

export default BaseSolving;