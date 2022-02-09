declare var require: any
import * as React from "react"
import { Button } from 'primereact/button';
import { Panel } from 'primereact/panel';
import QuestionCreateDecorator from './question_create_decorator';
import questionManager         from './questionManager' 
import { Message } from 'primereact/message';
import { InputText } from 'primereact/inputtext';
import { Divider } from 'primereact/divider';
import { Translate, translate } from 'react-i18nify';

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

    autoIncId = 0

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
                this.setState({ questions: this.getQuestionsForLoad(taskData.data), taskTitle: taskData.title });
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
                    this.setState({ questions: this.getQuestionsForLoad(taskData.data) });
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
            taskTitle: "",
            hasError: []
        };
    }

    addQuestion = (type) => {
        let questions = this.state.questions;
        this.autoIncId++;
        questions.push({ type: type, data: {}, hasError: true, id: this.autoIncId });
        this.setState({ questions: questions});
    }

    saveQuestionData = (index, data, hasError) => {
        let questions = this.state.questions;
        let newData = {};
        newData["type"]  = questions[index].type;
        newData["index"] = index;
        newData["data"]  = data;
        newData["id"]    = questions[index].id;
        questions[index] = newData;
        questions[index].hasError = hasError;
        this.setState({ questions: questions });
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
                <Button key={type.type} onClick={(e) => self.addQuestion(type.type)}>{translate("edit_form.add_question_text") + translate("edit_form.questions." + type.title)}</Button>
            )
        })
    }
    addQuestionListHtml() {
        let index = -1;
        let questionIndex = -1;
        let self = this;
        return this.state.questions.map(function (question) {
            let isQuestion = !question.data.isInfo;

            index++;
            if (isQuestion) {
                questionIndex++;
            }
            let locIndex = index;
            let locQuetionIndex = questionIndex;

            return (
                <Panel header={isQuestion ? "Question #" + (locQuetionIndex + 1) : "Information"} toggleable key={question.id}>
                    <QuestionCreateDecorator key={locIndex}
                        questionType={question.type}
                        saveDataCallback={(data, hasError) => self.saveQuestionData(locIndex, data, hasError)}
                        questionIndex={locIndex}
                        data={question.data} />
                    <Divider />
                    <div>
                        <label className="p-mr-2"><Translate value='edit_form.question_controls' />:</label>
                        <Button className="p-button-sm p-mr-2 p-mb-2" onClick={(e) => self.removeQuestion(locIndex)}><Translate value='button_common.remove' /></Button>
                        <Button className="p-button-sm p-mr-2 p-mb-2" onClick={(e) => self.moveQuestion(locIndex, -1)}><Translate value='edit_form.move_up' /></Button>
                        <Button className="p-button-sm p-mr-2 p-mb-2" onClick={(e) => self.moveQuestion(locIndex, 1)}><Translate value='edit_form.move_down' /></Button>
                    </div>
                </Panel>
            )
        })
    }

    getQuestionsForSave = (questions) => {
        let res = [];
        questions.forEach((question => res.push({ type: question.type, data: question.data })));
        return res;
    }

    getQuestionsForLoad = (questions) => {
        let res = [];
        questions.forEach((question => res.push({ type: question.type, data: question.data, hasError: false, id: ++this.autoIncId })));
        return res;
    }

    saveTemplate = () => {
        this.setState({
            successMessage: "",
            errorMessage: ""
        });
        let self = this;

        if (this.state.taskTitle.length == 0) {
            self.setState({ errorMessage: translate("edit_form.save_errors.enter_task_title") });
        }

        let hasError = false;
        this.state.questions.forEach(value => hasError = hasError || value.hasError);

        if (hasError) {
            self.setState({ errorMessage: translate("edit_form.save_errors.there_are_errors") });
        }

        if (!hasError) {
            questionManager.saveTask(this.state.taskId,
                this.getQuestionsForSave(this.state.questions),
                this.state.taskTitle,
                function (successed, templateId, needLogin) {
                    if (successed) {
                        self.setState({ successMessage: translate("edit_form.saved") });
                        if (templateId) {
                            self.state.taskId = templateId;
                            // no need to rerender.
                        }
                    } else if (needLogin) {
                        self.setState({ errorMessage: translate("login.need_login") });
                    } else {
                        self.setState({ errorMessage: translate("edit_form.cannot_saved") });
                    }
                });
        }

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
            <h3><Translate value='edit_form.title' /></h3>
            <div className="p-fluid" key="main">
                <div className="p-field" key="questionText">
                    <label htmlFor="taskName"><Translate value='edit_form.enter_task_name' /></label>
                    <InputText id="taskName" type="text" onChange={(e) => this.setState({ taskTitle: e.target.value })}
                        value={this.state.taskTitle} />
                </div>
            </div>
            <div>
                {this.addQuestionListHtml()}
            </div>
            <div>
                {this.addQuestionButtonHtml()}
            </div>
            <div>
                <Button onClick={this.saveTemplate} className="p-button-success"><Translate value='button_common.save' /></Button>
                {this.messageHtml()}
            </div>
        </div>);
    }
}

export default TemplateEditForm;