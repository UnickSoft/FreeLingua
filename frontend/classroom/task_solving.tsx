declare var require: any
import * as React from "react"
import QuestionSolvingDecorator from './question_sloving_decorator';
import questionManager         from '../office/questionManager'
import { Panel } from 'primereact/panel';
import { Translate, translate } from 'react-i18nify';
import { Skeleton } from 'primereact/skeleton';

var ReactDOM = require('react-dom');
var axios = require('axios');

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
        scores: any;
        scoresWeight: any;
        totalScoreWeight: any;
        title: any,
        isExamMode: any
    };

    localCheck = true;
    dryRun = false;
    readonly = false;
    needSave = 0;
    scoreScale = 10;
    scorePrecision = 1;

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
                let isExamMode = false;

                if (this.state.linkId) {
                    taskData = await questionManager.getTaskByLink(this.state.linkId);
                    remainingAnswers = taskData.template_data.length;
                    templateData = taskData.template_data;
                    title = taskData.title;
                    isExamMode = taskData.isExamMode == true;
                } else if (this.state.templateId) {
                    templateData = await questionManager.getTaskTemplate(this.state.templateId, this.props.usePublic);
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
                        title: title,
                        isExamMode: isExamMode
                    });
                } else {
                    this.setState({
                        remainingAnswers: remainingAnswers,
                        mistakes: mistakes,
                        templateData: templateData,
                        title: title
                    });
                }

                if (this.props.taskCallback) {
                    this.props.taskCallback({title: title});
                }

                this.setState({
                    scores: this.initScores(),
                    scoresWeight: this.initScoresWeight()
                });                
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
            title: "",
            scores: null,
            scoresWeight: null,
            totalScoreWeight: 0,
            isExamMode: false
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

    initScores() {
        let res = [];
        for (let i = 0; i < this.state.templateData.length; i++) {
            res.push(0.0);
        }
        return res;
    }

    initScoresWeight() {
        let res = [];
        for (let i = 0; i < this.state.templateData.length; i++) {
            res.push(0.0);
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

    updateQuestionScore(index, score) {
        if (this.state.scores) {
            let scores = this.state.scores;
            scores[index] = score;
            this.setState({ scores: scores});
        }
    }

    updateScoreWeight(index, rightAnswers, wrongAnswers) {
        if (this.state.scoresWeight) {
            let scoresWeight = this.state.scoresWeight;

            let avgPosibility = rightAnswers / (rightAnswers + wrongAnswers);
            let allPosibility = avgPosibility;
            let weight = 1.0 / allPosibility * rightAnswers;
            scoresWeight[index] = weight;

            this.setState((state, props) => {
                return { scoresWeight: scoresWeight, totalScoreWeight: state.totalScoreWeight + weight };
            });

        }
    }

    displayScores = (scores) => {
        return Math.round(scores * Math.pow(this.scoreScale, (1 + this.scorePrecision))) / Math.pow(this.scoreScale, this.scorePrecision)
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
                <div className="solvingTask" key={locIndex}>
                    <QuestionSolvingDecorator
                        questionType={question.type}
                        questionIndex={locIndex}
                        data={question.data}
                        result={!self.dryRun && self.state.taskData.result ? self.state.taskData.result[locIndex] : null}
                        checkAnswerCallback={(questionIndex, answer) => self.checkAnswer(questionIndex, answer)}
                        rightAnswers={self.state.templateData[locIndex].data.answers.length}
                        questionFinishCallback={(questionIndex) => self.questionFinish(questionIndex)}
                        updateScoresCallback={(questionIndex, score) => self.updateQuestionScore(questionIndex, score)}
                        updateScoreWeight={(questionIndex, rightAnswers, wrongAnswers) => self.updateScoreWeight(questionIndex, rightAnswers, wrongAnswers)}
                        normalizedScores={(self.state.scores && self.state.totalScoreWeight > 0) ?
                            self.displayScores(self.state.scores[index] * self.state.scoresWeight[index] / self.state.totalScoreWeight) :
                            0.0}
                        isExamMode={self.state.isExamMode}
                        />
                </div>
            )
        })
    }

    render() {
        if (this.needSave > 0) {
            this.saveResults();
            this.needSave--;
        }

        // Loading skeleton
        if (this.state.templateData == null) {
            return (<div>
                <h1 className="taskHeader"><Skeleton width="64px" height="2rem" /></h1>
                <div>
                    <Skeleton width="100%" height="150px"></Skeleton>
                </div>
            </div>);
        }

        let totalScores = 0.0;
        if (this.state.scores && this.state.totalScoreWeight > 0) {
            let index = 0;
            this.state.scores.forEach((score) => {
                    totalScores += score * this.state.scoresWeight[index] / this.state.totalScoreWeight;
                    index++;
                }
            );
        }

        return (<div>
            <h1 className="taskHeader">{this.state.title ? this.state.title : null}</h1>
            <div>
                {this.addQuestionListHtml()}
            </div>
            <Panel header={translate("result.header")} className="resultPanel p-mt-4">
                <div style={{ 'fontSize': '1.25em' }}>
                    <span className="d-inline p-2"><Translate value="result.remaining_answer" />: {this.state.remainingAnswers}</span>
                    <span className="d-inline p-2"><Translate value="result.mistakes" />: {this.state.mistakes}</span>
                    <span className="d-inline p-2"><Translate value="result.scores" />: {this.displayScores(totalScores)}</span>
                </div>
            </Panel>
        </div>);
    }
}

export class TaskSolvingPublicWrapper extends React.Component<any, any> {
    state: {
        catalogInfo: any
    };

    constructor(props) {
        super(props);

        this.state = {
            catalogInfo: { title: "", desc: "", id: 0 }
        };

        if (this.props.categoryId) {
            this.updateCurrentCatalogInfo();
        }
    }

    updateCurrentCatalogInfo = () => {
        let self = this;
        axios.get("/get_public_category_info", { params: { id: this.props.categoryId } })
            .then(function (response) {
                self.setState({
                    catalogInfo: response.data.info
                });

                if (self.props.taskCallback) {
                    self.props.taskCallback({ catalogTitle: response.data.info.title });
                }
            })
            .catch(function (error) {
                // handle error
                console.log(error);
            });
    }

    render() {
        return (
            <div>
                <div className="row">
                    <div className="col">
                        <p><a href={"/catalog/" + this.state.catalogInfo.id}>{this.state.catalogInfo.title}</a></p>
                    </div>
                </div>

                <TaskSolving templateId={this.props.taskId} usePublic={true} taskCallback={this.props.taskCallback} />

                <div className="row catalogFooter">
                    <div className="col">
                        <p><a href={"/catalog/" + this.state.catalogInfo.id}>← {translate("button_common.back_to_catalog")} {this.state.catalogInfo.title}</a></p>
                    </div>
                </div>
            </div>
        );
    }
}

export default TaskSolving;