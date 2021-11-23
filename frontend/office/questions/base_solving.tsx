declare var require: any
import * as React from "react"

var axios = require('axios');

export class BaseSolving extends React.Component<any, any> {

    checkAnswerCallback = null;
    questionFinishCallback = null;

    state: {
        questionIndex: any,
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

        this.state = { questionIndex: 0 };
        this.checkAnswerCallback = this.props.checkAnswerCallback;
        this.questionFinishCallback = this.props.questionFinishCallback;
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

    render() {
        return (
            <div>
                <div className="p-fluid" key="main">
                    <h5 style={{ whiteSpace: "pre-wrap" }}>
                        {(this.state.questionIndex + 1) + ". "}
                        {this.getHeaderText()}
                        {
                            this.isFinishedQuestions() ?
                                <span className="pi p-ml-1 rightAnswer pi-check" />
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