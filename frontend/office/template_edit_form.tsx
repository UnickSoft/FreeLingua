declare var require: any
import * as React from "react"
import { Button } from 'primereact/button';
import { Panel } from 'primereact/panel';
import QuestionCreateDecorator from './question_create_decorator';
import questionManager         from './questionManager' 
import { Message } from 'primereact/message';
import { InputText } from 'primereact/inputtext';
import { Divider } from 'primereact/divider';

var ReactDOM = require('react-dom');

export class TemplateEditForm extends React.Component<any, any> {
    state: {
        questionTypes: any;
        questions: any;
        taskId: any;
        successMessage: any;
        errorMessage: any;
        loadedData: any;
        taskTitle: any;
    };

    constructor(props) {
        super(props);
        this.state = this.getFullEmptyState();

        this.state.questionTypes = questionManager.getQuestionTypes();
        this.state.taskId = this.props.taskId;
    }

    componentDidMount() {
        if (this.state.taskId) {
            (async () => {
                let taskData = await questionManager.getTaskTemplate(this.state.taskId);
                this.setState({ questions: taskData.data, taskTitle: taskData.title });
            })()
        }
    }

    componentDidUpdate(prevProps) {
        // Typical usage (don't forget to compare props):
        if ( ("taskId" in this.props && !("taskId" in prevProps)) ||
             (!("taskId" in this.props) && ("taskId" in prevProps)) || 
            this.props.taskId !== prevProps.taskId) {
            if ("taskId" in this.props) {
                (async () => {
                    let taskData = await questionManager.getTaskTemplate(this.state.taskId);
                    this.setState({ questions: taskData.data });
                })();
            } else {
                this.setState(this.getEmptyState());
            }
        }
    }

    getFullEmptyState = () => {
        return {
            questionTypes: [],
            ...this.getEmptyState()
        };
    }

    getEmptyState = () => {
        return {
            questions: [],
            taskId: null,
            successMessage: "",
            errorMessage: "",
            loadedData: false,
            taskTitle: ""
        };
    }

    addQuestion = (type) => {
        let questions = this.state.questions;
        questions.push({ type: type, data: {}});
        this.setState({ questions: questions});
    }

    saveQuestionData = (index, data) => {
        let questions = this.state.questions;
        let newData = {};
        newData["type"]  = questions[index].type;
        newData["index"] = index;
        newData["data"]  = data;
        questions[index] = newData;
        // Dont call setState because no need do update
    }

    removeQuestion = (index) => {
        let questions = this.state.questions;
        questions.splice(index, 1);
        this.setState({ questions: questions });
    }

    moveQuestion = (index, direction) => {
        let newIndex = index + direction;
        let questions = this.state.questions;
        if (newIndex >= 0 && newIndex < questions.length) {
            let temp = questions[index];
            questions[index] = questions[newIndex];
            questions[newIndex] = temp;
            this.setState({ questions: questions });
        }
    }

    addQuestionButtonHtml() {
        let index = -1;
        let self = this;
        return this.state.questionTypes.map(function (type) {
            index++;
            let locIndex = index;
            return (
                <Button key={type.type} onClick={(e) => self.addQuestion(type.type)}>{type.title}</Button>
            )
        })
    }
    addQuestionListHtml() {
        let index = -1;
        let self = this;
        return this.state.questions.map(function (question) {
            index++;
            let locIndex = index;
            return (
                <Panel header={"Question #" + (locIndex + 1)} toggleable key={locIndex}>
                    <QuestionCreateDecorator key={locIndex}
                        questionType={question.type}
                        saveDataCallback={(data, hasError) => self.saveQuestionData(locIndex, data)}
                        questionIndex={locIndex}
                        data={question.data} />
                    <Divider />
                    <div>
                        <label className="p-mr-2">Question control:</label>
                        <Button className="p-button-sm p-mr-2 p-mb-2" onClick={(e) => self.removeQuestion(locIndex)}>Remove</Button>
                        <Button className="p-button-sm p-mr-2 p-mb-2" onClick={(e) => self.moveQuestion(locIndex, -1)}>Move Up</Button>
                        <Button className="p-button-sm p-mr-2 p-mb-2" onClick={(e) => self.moveQuestion(locIndex, 1)}>Move Down</Button>
                    </div>
                </Panel>
            )
        })
    }

    saveTemplate = () => {
        this.setState({
            successMessage: "",
            errorMessage: ""
        });

        let self = this;
        questionManager.saveTask(this.state.taskId,
            this.state.questions,
            this.state.taskTitle,
            function (successed, templateId) {
                if (successed) {
                    self.setState({ successMessage: "Saved" });
                    if (templateId) {
                        self.state.taskId = templateId;
                        // no need to rerender.
                    }
                } else {
                    self.setState({ errorMessage: "Cannot save" });
                }
            });

        // Hide message
        setTimeout(() => {
                self.setState({
                    successMessage: "",
                    errorMessage: ""
                });
            }, 3000);
    }

    messageHtml() {
        if (this.state.errorMessage.length > 0)
            return <Message severity="error" text={this.state.errorMessage}></Message>;
        else if (this.state.successMessage.length > 0)
            return <Message severity="success" text={this.state.successMessage}></Message>;
        return "";
    }
    
    render() {
        return (<div>
            <h3>Use buttons to add new question by type</h3>
            <div className="p-fluid" key="main">
                <div className="p-field" key="questionText">
                    <label htmlFor="taskName">Enter task name</label>
                    <InputText id="taskName" type="text" onChange={(e) => this.setState({ taskTitle: e.target.value })} value={this.state.taskTitle} />
                </div>
            </div>
            <div>
                {this.addQuestionListHtml()}
            </div>
            <div>
                {this.addQuestionButtonHtml()}
            </div>
            <div>
                <Button onClick={this.saveTemplate} className="p-button-success">Save</Button>
                {this.messageHtml()}
            </div>
        </div>);
    }
}

export default TemplateEditForm;