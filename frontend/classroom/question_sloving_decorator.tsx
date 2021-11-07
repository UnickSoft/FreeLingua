declare var require: any
import * as React from "react"
import { lazy, Suspense } from 'react';

var ReactDOM = require('react-dom');
var axios    = require('axios');

export class QuestionSolvingDecorator extends React.Component<any, any> {
    state: {};

    questionType = ""
    DynamicComponent = null

    constructor(props) {
        super(props);

        this.questionType = props.questionType;
        this.state = {};
        this.DynamicComponent = lazy(() => import(`../office/questions/${this.questionType}_solving`));
    }
    
    render() {
        return (
            <Suspense fallback={<div>Loading...</div>}>
                <this.DynamicComponent {...this.props} />
            </Suspense>
        );
    }
}

export default QuestionSolvingDecorator;