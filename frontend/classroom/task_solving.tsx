declare var require: any
import * as React from "react"
import QuestionSolvingDecorator from './question_sloving_decorator';
import questionManager         from '../office/questionManager'
import { Panel } from 'primereact/panel';

var ReactDOM = require('react-dom');
/*
Result format is:
[
    {
        answers: [
                {answer: "variant",  result: false},
                {answer: "variant2", result: true},
            ],
        finished: true        
    }  // question    
]
*/
export class TaskSolving extends React.Component<any, any> {
    state: {
        taskData: any;
        taskId: any;
        linkId: any;
        remainingAnswers: any;
        mistakes: any;
        templateId: any;
        templateData: any;
        title: any
    };

    localCheck = true;
    dryRun = false;
    readonly = false;
    needSave = 0;

    constructor(props) {
        super(props);
        this.state = this.getFullEmptyState();
        this.dryRun = "dryRun" in this.props ? this.props.dryRun : false;
        this.readonly = "readonly" in this.props ? this.props.readonly : false;

        this.state.linkId = "linkId" in this.props ? this.props.linkId : null;
        this.state.templateId = "templateId" in this.props ? this.props.templateId : null;
        this.dryRun = this.dryRun || !!this.state.templateId;
    }

    componentDidMount() {
        if (this.state.linkId || this.state.templateId) {
            (async () => {
                let mistakes = 0;
                let remainingAnswers = 0;
                let taskData    = null;
                let templateData = null;
                let title = "";

                if (this.state.linkId) {
                    taskData = await questionManager.getTaskByLink(this.state.linkId);
                    remainingAnswers = taskData.template_data.length;
                    templateData = taskData.template_data;
                    title = taskData.title;
                } else if (this.state.templateId) {
                    templateData = await questionManager.getTaskTemplate(this.state.templateId);
                    title = templateData.title;
                    templateData = templateData.data;
                    remainingAnswers = templateData.length;
                }

                if (taskData && taskData.result && !this.dryRun) {
                    taskData.result.forEach((question) => {
                        if (question.finished) {
                            remainingAnswers--;
                        }
                        question.answers.forEach((answer) => {
                            mistakes += !answer.result ? 1 : 0;
                        });
                    });
                }
                if (taskData) {
                    this.setState({
                        taskData: taskData,
                        remainingAnswers: remainingAnswers,
                        mistakes: mistakes,
                        templateData: templateData,
                        title: title
                    });
                } else {
                    this.setState({
                        remainingAnswers: remainingAnswers,
                        mistakes: mistakes,
                        templateData: templateData,
                        title: title
                    });
                }
            })()
        }
    }

    getFullEmptyState() {
        return {
            taskData:  null,
            taskId:    null,
            linkId:    null,
            remainingAnswers: 0,
            mistakes: 0,
            templateId: null,
            templateData: null,
            title: ""
        };
    }

    initResults() {
        let res = [];
        for (let i = 0; i < this.state.templateData.length; i++) {
            res.push({
                answers: [],
                finished: false
            });
        }
        return res;
    }

    // Save on server.
    saveResults() {
        if (!this.dryRun && !this.readonly) {
            (async () => {
                await questionManager.saveTaskResultByLink(this.state.linkId, this.state.taskData.result);
            })()
        }
    }

    checkAnswer(index, answer) {
        let questionData = this.state.templateData[index];
        let isRight = !!questionData.data.answers.find(str => str == answer);

        if (!isRight) {
            this.setState({ mistakes: this.state.mistakes + 1 });
        }

        if (this.state.taskData && !this.dryRun && !this.readonly) {
            let self = this;
            this.setState((state, props) => {
                let taskData = state.taskData;
                if (!taskData.result) {
                    taskData.result = self.initResults();
                }

                taskData.result[index].answers.push({ answer: answer, result: isRight });
                this.needSave++;
                return { taskData: taskData };
            });
        }
        return isRight;
    }

    questionFinish(index) {
        this.setState({ remainingAnswers: this.state.remainingAnswers - 1 });

        if (this.state.taskData && !this.dryRun && !this.readonly) {
            this.setState((state, props) => {
                let taskData = state.taskData;
                taskData.result[index].finished = true;
                this.needSave++;
                return { taskData: taskData };
            });
        }
    }

    addQuestionListHtml() {
        let index = -1;
        let self = this;
        if (!this.state.taskData && !self.dryRun || !this.state.templateData) {
            return null;
        }
        return this.state.templateData.map(function (question) {
            index++;
            let locIndex = index;
            return (
                //<Panel header={"Question #" + (locIndex + 1)} key={locIndex}>
                <QuestionSolvingDecorator key={locIndex}
                        questionType={question.type}
                        questionIndex={locIndex}
                        data={question.data}
                        result={!self.dryRun && self.state.taskData.result ? self.state.taskData.result[locIndex] : null}
                        checkAnswerCallback={(questionIndex, answer) => self.checkAnswer(questionIndex, answer)}
                        rightAnswers={self.state.templateData[locIndex].data.answers.length}
                        questionFinishCallback={(questionIndex) => self.questionFinish(questionIndex)}                        
                    />
                //</Panel>
            )
        })
    }

    render() {
        if (this.needSave > 0) {
            this.saveResults();
            this.needSave--;
        }
        return (<div>
            <h3>{this.state.title ? this.state.title : null}</h3>
            <div>
                {this.addQuestionListHtml()}
            </div>
            <Panel header="Results">
                <div style={{ 'fontSize': '1.25em' }}>
                    <span className="d-inline p-2">Remaining questions: {this.state.remainingAnswers}</span>
                    <span className="d-inline p-2">Mistakes: {this.state.mistakes}</span>
                </div>
            </Panel>
        </div>);
    }
}

export default TaskSolving;